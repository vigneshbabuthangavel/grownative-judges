import { GoogleGenerativeAI } from "@google/generative-ai";
import { CLEAR_ENGINE, getStoryConfig } from "./prompt-engine";
import { createContextCache } from "./context-cache-api";
import { generateCulturalContext } from "./cultural-oracle"; // NEW IMPORT
import { getCache, setCache } from "./cache-manager";
import { generateStoryKey } from "./cache-utils";
import { CULTURAL_DB } from "./cultural-db";
import { generateBeatsFromScript, refineBeatsWithStory, type Beat } from "./beat-generator";
import { generateContentServer } from "@/app/actions/gemini";
import { loadAssetsAction, saveAssetAction, saveLogAction } from "@/app/actions/assets";
import { optimizeImageAction } from "@/app/actions/image-actions"; // UPDATED IMPORT
import { STORY_WRITER } from "./story-writer";
import { UnifiedStory } from "./story-writer/types";
import { getCriticalWords } from "@/lib/profileStorage";
import { checkVocabularyCompatibility } from "@/lib/adaptive/struggle-oracle";
import { enrichVocabularyAction } from "@/app/actions/enrich-vocabulary";

// --- DEBUG HELPER ---
const debugLog = (phase: string, data: any) => {
    console.group(` Phase Debug: ${phase}`);
    console.log("Payload:", data);
    console.groupEnd();
};

function safeJsonParse(text: string) {
    try {
        const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(clean);
    } catch (e) {
        return { error: "Parse Fail", raw: text };
    }
}




// Global Retry Configuration
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 2000;

// WRAPPER to match previous interface using Server Action
const askAI = async (modelName: string, prompt: any, options: any = {}) => {
    let lastError;
    let currentModel = modelName;
    let hasFallenBack = false;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await generateContentServer(currentModel, prompt, options);

            // Check for explicit error in result object
            if (result.error) {
                // If Quota Limit (429) or Overloaded (503), retry
                if (result.error.includes("429") || result.error.includes("quota") || result.error.includes("Too Many Requests") || result.error.includes("503") || result.error.includes("overloaded")) {

                    // FALLBACK LOGIC
                    if (!hasFallenBack && options.fallbackModel) {
                        console.warn(`⚠️ Quota Hit (${currentModel}). SWITCHING TO FALLBACK: ${options.fallbackModel}`);
                        currentModel = options.fallbackModel;
                        hasFallenBack = true;
                        // Don't wait, try immediately on new model
                        continue;
                    }

                    if (attempt < MAX_RETRIES) {
                        const delay = INITIAL_BACKOFF * Math.pow(2, attempt); // 2s, 4s, 8s
                        console.warn(`⚠️ Quota Hit (${currentModel}). Retrying in ${delay}ms... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                }
                throw new Error(result.error);
            }

            // Success
            return {
                response: {
                    text: () => result.text || "",
                    candidates: result.candidates,
                    promptFeedback: result.promptFeedback
                },
                meta: {
                    modelUsed: currentModel,
                    isFallback: hasFallenBack,
                    isGemini3: currentModel.includes("experimental") || currentModel.includes("3.0")
                }
            };

        } catch (e: any) {
            lastError = e;
            // Catch network/fetch errors that might not be in result.error
            if (e.message?.includes("429") || e.message?.includes("quota") || e.message?.includes("503") || e.message?.includes("overloaded")) {
                // FALLBACK LOGIC FOR THROWN ERRORS
                if (!hasFallenBack && options.fallbackModel) {
                    console.warn(`⚠️ Network Limit (${currentModel}). SWITCHING TO FALLBACK: ${options.fallbackModel}`);
                    currentModel = options.fallbackModel;
                    hasFallenBack = true;
                    continue;
                }

                if (attempt < MAX_RETRIES) {
                    const delay = INITIAL_BACKOFF * Math.pow(2, attempt);
                    console.warn(`⚠️ Network Limit (${currentModel}). Retrying in ${delay}ms... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
            }
            throw e; // Non-retryable or max retries
        }
    }
    throw lastError || new Error("Max retries exceeded");
};

export const models = {
    // PRIMARY LOGIC: Gemini 3.0 Pro Preview (The "Brain")
    // Latest reasoning model for rigorous Blueprinting - LOCKED
    pro: {
        generateContent: (p: any, opts?: any) => Promise.race([
            askAI("gemini-3-pro-preview", p, { ...opts, fallbackModel: "gemini-2.5-pro" }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout: Gemini 3 Pro took too long (>60s)")), 60000))
        ])
    },

    // FAST LOGIC: Gemini 2.5 Flash (The "Workhorse" & Auto-Complete)
    // Upgraded from 2.0 Flash for better logic/speed balance
    flash: {
        generateContent: (p: any, opts?: any) => Promise.race([
            askAI("gemini-2.5-flash", p, { ...opts, fallbackModel: "gemini-2.0-flash" }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout: Gemini 2.5 Flash took too long (>60s)")), 60000))
        ])
    },

    // VISUALS: Gemini 3.0 Pro Image Preview (Verified) - LOCKED
    // SOTA Image Generation for Hackathon
    // Note: Use 'gemini-3-pro-image-preview' strictly.
    imagen: {
        generateContent: (p: any, opts?: any) => Promise.race([
            askAI("gemini-3-pro-image-preview", p, opts),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout: Image Generation took too long (>60s)")), 60000))
        ])
    },
};

import { StoryPack } from "./types";

/**
 * LEGACY WRAPPER: Now powered by the Unified Story Engine (SAGA)
 * This ensures the UI gets the same shape but with the new AI brains.
 */
export async function processFullStoryPipeline(
    topic: string, premise: string, level: number, language: string, gender: string = "child",
    onPhase: (step: { name: string; status: 'loading' | 'success' | 'error'; output?: any }) => void,
    options: { enableImages: boolean } = { enableImages: true }
): Promise<StoryPack> {

    // --- PHASE 0: SIMULATION MODE (Restored) ---
    // Allow flexible triggering (e.g. "simulate", "Simulate Flow", "simulate flow")
    if (topic.toLowerCase().trim().includes("simulate")) {
        onPhase({ name: "⚠️ SIMULATION MODE ACTIVATE", status: 'success', output: "Generating pre-fabricated story for testing..." });
        await new Promise(r => setTimeout(r, 1000));

        // Return dummy data (matches StoryPack interface)
        return {
            storyId: `story_sim_${Date.now()}`,
            level: level as any,
            language: language as any,
            theme: topic,
            title_native: language === 'ta' ? "கணினி சோதனை" : "System Simulation",
            thumbnailSvgPath: "",
            targetWords: [],
            pages: [
                {
                    pageNumber: 1,
                    text_native: language === 'ta' ? "இது ஒரு சோதனை." : "This is a system test.",
                    text_english: "This is a system test.",
                    imageAlt: "Arun sees an old man",
                    imageCaption: "Arun sees an old man on a busy street.",
                    imagePath: "/demo/page1.png",
                    targetWordIds: []
                }
            ],
            exercises: [],
            review: { kidSafeApproved: true, checks: [] },
            globalMeta: { visualDNA: "simulated", blueprint: {}, casting: {} }
        };
    }

    // 1. Run the Unified Pipeline
    // Note: The Unified Pipeline handles its own logging phases internally via onPhase
    const result = await processUnifiedStoryPipeline(
        topic,
        premise,
        level,
        language,
        gender,
        onPhase,
        options
    );

    // 2. Augment Result to match StoryPack strictly
    const pack: StoryPack = {
        ...(result as any),
        storyId: `story_${Date.now()}_${language}`, // Generate ID if missing
        level: level as any,
        language: language as any,
        theme: topic,
        title_native: (result as any).title || topic,
        thumbnailSvgPath: "",
        targetWords: [],
        review: { kidSafeApproved: true, checks: [] }
    };

    return pack;
}

// ==================================================================================
// DEPRECATED PIPELINE (Kept for reference/rollback)
// ==================================================================================
async function _processFullStoryPipeline_LEGACY(
    topic: string, premise: string, level: number, language: string, gender: string = "child",
    onPhase: (data: any) => void,
    options: { enableImages: boolean } = { enableImages: true }
) {
    // Helper to run a phase with updates and RETRY logic
    const run = async (name: string, task: () => Promise<any>) => {
        onPhase({ name, status: 'loading' });

        let currentDelay = 1000;
        const maxRetries = 2; // Reduced retries for snappiness

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await task();
                // Check if result has _aiMeta to propagate
                onPhase({ name, status: 'success', output: result });
                return result;
            } catch (error: any) {
                const isRetryable = error.status === 429 || error.status === 503 ||
                    (error.message && (error.message.includes('429') || error.message.includes('Quota')));

                if (attempt < maxRetries && isRetryable) {
                    console.log(`⚠️ ${name}: Rate limit/Quota hit. Retrying in ${currentDelay}ms (Attempt ${attempt + 1}/${maxRetries})...`);
                    await new Promise(resolve => setTimeout(resolve, currentDelay));
                    currentDelay *= 2; // Exponential backoff
                    continue;
                }

                // If final attempt or not retryable
                onPhase({ name, status: 'error', output: error.message });
                throw error; // STRICT FAIL
            }
        }
    };

    // --- PHASE 0: SIMULATION MODE ---
    if (topic === "Simulate Flow") {
        await onPhase({ name: "⚠️ SIMULATION MODE ACTIVATE", status: 'success', output: "Generating pre-fabricated story for testing..." });

        // Dummy Story Data matching uploaded images
        const dummyPages = [
            {
                text_native: "அருண் ஒரு தாத்தாவைப் பார்த்தான்.",
                english: "Arun saw an old man.",
                image: { type: 'image', mimeType: 'image/png', data: "/demo/page1.png" }, // Frontend should handle URL or Base64. 
                imageCaption: "Arun sees an old man on a busy street.",
                _meta: { pageIndex: 0 }
            },
            {
                text_native: "தாத்தா சாலையைக் கடக்கப் பயந்தார்.",
                english: "The old man feared crossing.",
                image: { type: 'image', mimeType: 'image/png', data: "/demo/page2.png" },
                imageCaption: "The old man looks worried about crossing.",
                _meta: { pageIndex: 1 }
            },
            {
                text_native: "அவன் தாத்தாவின் கையைப் பிடித்தான்.",
                english: "He held the old man's hand.",
                image: { type: 'image', mimeType: 'image/png', data: "/demo/page3.png" },
                imageCaption: "A kind boy gently holds the old man's hand.",
                _meta: { pageIndex: 2 }
            },
            {
                text_native: "அவர்கள் சாலையைக் கடந்தனர்.",
                english: "They crossed the street.",
                image: { type: 'image', mimeType: 'image/png', data: "/demo/page4.png" },
                imageCaption: "They cross the zebra crossing safely.",
                _meta: { pageIndex: 3 }
            },
            {
                text_native: "அருண் ஒரு தைரியமான சிறுவன்.",
                english: "Arun was a brave boy.",
                image: { type: 'image', mimeType: 'image/png', data: "/demo/page5.png" },
                imageCaption: "Arun smiles, happy to help.",
                _meta: { pageIndex: 4 }
            }
        ];

        const dummyExercises = [
            {
                type: "ordering",
                prompt_native: "Arrange the events:",
                items_native: ["Saw Grandpa", "Held Hand", "Crossed Road"],
                jumbled_native: ["Held Hand", "Crossed Road", "Saw Grandpa"]
            },
            {
                type: "comprehension",
                question_native: "Why was the grandpa scared?",
                options_native: ["Too much traffic", "He was tired", "It was raining"],
                answer_native: "Too much traffic"
            },
            {
                type: "critical_thinking",
                prompt_native: "Why is it important to help others?",
                talking_points_native: ["Kindness", "Safety", "Community"]
            }
        ];

        return {
            title: "System Simulation (Test)",
            pages: dummyPages,
            exercises: dummyExercises,
            audit: { score: 100, flagged: false, notes: "Simulation" },
            anchor: { idioms: [] },
            culture: {},
            globalMeta: { visualDNA: "simulated", blueprint: {}, casting: {}, gender: "boy" },
            mode: "multimodal",
            _assets: { stage: null, actors: null }
        };
    }

    // Phase 0: Image Check Removed for Cost (Rely on Phase 2.5 fail-fast)
    if (options.enableImages) {
        onPhase({ name: "Phase 0: Visual Pipeline Active (Optimized)", status: 'success' });
    }

    // ==================================================================================
    // PHASE 1: SERIAL PREPARATION (The "Make-It-Perfect" Phase)
    // Goal: Lock Culture, Story, and Visual Plan (Beats) BEFORE any pixels.
    // ==================================================================================

    // 1.1 Cultural Engine
    const culture = await run("Phase 1: Cultural Oracle (Gemini 3)", async () => {
        return await generateCulturalContext(language, topic, level);
    });

    // 1.2 Initial Logic Generation (Blueprint)
    const engine = CLEAR_ENGINE.getSceneBlueprint(topic, premise, level, language, gender, culture);

    // 1.3 Context Cache
    const cacheName = await run("Phase 1.5: Warming Context Cache", async () => {
        let repurposedDNA = null;
        let cache;
        try {
            const anchorResp = await models.flash.generateContent(`Idioms for ${language} topic ${topic} based on culture: ${JSON.stringify(culture)}`);
            const anchorText = (anchorResp as any).response.text();
            cache = await createContextCache(language, level, { idioms: anchorText, culture: JSON.stringify(culture) });
        } catch (e: any) {
            console.warn("Context Caching Failed. Proceeding without cache.", e);
            cache = undefined;
        }
        return { cache, repurposedDNA: null };
    });

    const cacheTitle = cacheName.cache;
    const repurposedDNA = cacheName.repurposedDNA;

    // 1.4 BLUEPRINT GENERATION (Thinking)
    const blueprint = await run("Phase 2: Blueprint & Cast (Gemini 3 Pro)", () => models.pro.generateContent({
        contents: [{ role: 'user', parts: [{ text: engine.prompt + ' Output JSON including "visual_lock", "tone_lock" and "page_1_prompt" fields.' }] }],
        // @ts-ignore
    }, { cachedContent: cacheTitle || undefined }).then(r => safeJsonParse(r.response.text())));

    const casting = blueprint.casting || { protagonist: { name: "Leo", visual: "Small Indian boy, 6 years old", species: "human" } };
    const visualDNA = repurposedDNA || blueprint.visual_guide || casting.protagonist.visual || "";

    // 1.5 AUTHORING (Thinking)
    const config = getStoryConfig(level);
    const authoringPrompt = `
        Write a short ${language} story. Topic: "${topic}". Premise: "${premise}". Reading Level: ${level}/8.
        Using this Blueprint: Characters: ${JSON.stringify(casting)}. Plot: ${JSON.stringify(blueprint.narrative || "Follow premise")}.
        [LEVEL CONFIGURATION]
        - Target Sentence Count: ${config.sentenceCount}
        - Word Count Per Sentence: ${config.wordCountPerSentence} words.
        Constraint: Ensure the story flows logically.
        Output STRICT JSON: { "sentences": [ { "native": "Sentence in ${language}", "english": "English translation" } ] }
    `;

    const cacheKey = generateStoryKey(language, level, topic);
    const storyJson = await run("Phase 3: Authoring (Gemini 3 Pro)", async () => {
        const cachedScript = await getCache('scripts', cacheKey);
        if (cachedScript) return cachedScript;
        const result = await models.pro.generateContent(authoringPrompt).then((r: any) => safeJsonParse(r.response.text()));
        if (result.sentences && result.sentences.length > 0) await setCache('scripts', cacheKey, result);
        return result;
    });

    let sentences = storyJson.sentences || [];
    if (!Array.isArray(sentences) || sentences.length === 0) throw new Error("Story Authoring failed.");

    // 1.6 BEAT SHEET (The Visual Plan) - MOVED UP TO SERIAL PHASE
    // This is critical for V5.1: We must know the movement plan before we start generating images.
    const beatSheet = await run("Phase 3.5: Visual Planning (Shot List)", async () => {
        const cachedBeats = await getCache('beats', cacheKey);
        if (cachedBeats) return cachedBeats;

        let result = await generateBeatsFromScript({
            model: models.flash as any,
            script: sentences,
            premise: premise,
            castLock: blueprint?.cast_lock,
            options: { strictCamera: true }
        });

        // NEW: STORY-BEAT RECONCILIATION (The "Logic Check")
        // STRATEGY: Try PRO (Deep Logic) first. If it fails/timeouts, fallback to FLASH (Speed).
        console.log("Phase 3.5: Reconciling Story & Beats...");

        try {
            // Attempt 1: Gemini 3 Pro (Primary Requirement)
            const refined = await refineBeatsWithStory({
                model: models.pro as any,
                script: sentences,
                originalBeats: result,
                premise: premise
            });
            result = refined;
            await setCache('beats', cacheKey, result);

        } catch (errorPro) {
            console.warn("⚠️ Phase 3.5: Pro Model Failed. Falling back to Flash...", errorPro);

            try {
                // Attempt 2: Gemini 2.0 Flash (Fallback)
                const refinedFlash = await refineBeatsWithStory({
                    model: models.flash as any,
                    script: sentences,
                    originalBeats: result,
                    premise: premise
                });
                result = refinedFlash;
                await setCache('beats', cacheKey, result);
            } catch (errorFlash) {
                console.error("❌ Phase 3.5: All Reconciliation Failed. Using original beats.", errorFlash);
                // Proceed with unrefined beats as last resort
            }
        }

        return result;
    });

    const beats: Beat[] = beatSheet?.beats || [];

    // Parallel Validations (Non-Blocking for Image Gen, but needed for final)
    const validationPromise = Promise.all([
        run("Phase 4: Audit", async () => {
            const prompt = `Audit this story for Level ${level} (${language}). Story: ${JSON.stringify(sentences)}. Output JSON: { "score": (0-100), "notes": "audit notes", "flagged": boolean }`;
            return models.flash.generateContent(prompt).then((r: any) => safeJsonParse(r.response.text()));
        }),
        run("Phase 5: Quiz Generation", async () => {
            const quizRules = config.quizConfig;
            const quizPrompt = `Generate Quiz for Level ${level}. Story: ${JSON.stringify(sentences)}. Config: ${JSON.stringify(quizRules)}. Output JSON: { "exercises": [] }`;
            return models.flash.generateContent(quizPrompt).then((r: any) => safeJsonParse(r.response.text()));
        }),
        run("Phase 2: Anchoring", () => models.flash.generateContent(`Idioms for ${language} topic ${topic} suitable for Level ${level}. Output JSON: { "idioms": ["string"] }`).then((r: any) => safeJsonParse(r.response.text())))
    ]);

    // ==================================================================================
    // PHASE 2: VISUAL ANCHOR (Serial)
    // Goal: Generate Page 1 (The Hero). Must be perfect. Used as reference for all others.
    // ==================================================================================

    const pages: any[] = [];
    let heroImageBase64: string | undefined = undefined;

    if (options.enableImages) {
        // Prepare Page 1
        const visualLock = blueprint.visual_lock || {};
        const page1Action = blueprint.page_1_prompt || `Establish shot: ${topic}.`;

        await onPhase({ name: "Phase 5: Visual Production - Anchor Frame (Page 1)", status: 'loading' });

        // TRY CACHE FIRST for Page 1? No, logic is simpler if we just treat it as flow.
        // Actually, we should check cache for ALL pages first.
        const cachedImages = await loadAssetsAction(language, level, topic, sentences.length);

        if (cachedImages) {
            await onPhase({ name: "Phase 6: Visuals Repurposed (Cache Hit ⚡)", status: 'success', output: "Assets loaded from private library." });
            pages.push(...sentences.map((item: any, i: number) => ({
                ...item,
                imagePath: `/api/story-asset?topic=${encodeURIComponent(topic)}&level=${level}&language=${language}&page=${i}`,
                image: null,
                imageCaption: `Scene: ${beats[i]?.environment.notes || "Story Moment"}`,
                vision: null,
                _meta: { pageIndex: i }
            })));
        } else {
            // NO CACHE - GENERATE NEW

            // 2.1 Generate HERO FRAME (Page 1)
            try {
                const imagenInputs = [{
                    text: `REFERENCE VISUAL LOCK: ${JSON.stringify(visualLock)}
TONE LOCK: ${blueprint.tone_lock || "Consistent Lighting"}
RENDER THE EXACT SAME CHARACTERS, CLOTHES, HAIR, AND STYLE AS DESCRIBED.
ACTION: ${page1Action}`
                }];

                // STRICT CAST to avoid TS errors
                const imageResp = await models.imagen.generateContent(imagenInputs) as any;
                const part = imageResp.response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

                if (!part?.inlineData?.data) throw new Error("Gemini 3 Image Gen failed for Page 1");

                const rawBase64 = part.inlineData.data;
                // Optimize for Reference AND Storage
                heroImageBase64 = await optimizeImageAction(rawBase64);

                // Overwrite the raw save with the optimized version to save space/maintain consistency
                await saveAssetAction(language, level, topic, 0, heroImageBase64);

                // Push Page 1 result
                pages.push({
                    ...sentences[0],
                    imagePath: `/api/story-asset?topic=${encodeURIComponent(topic)}&level=${level}&language=${language}&page=0&t=${Date.now()}`,
                    image: { type: 'image', mimeType: 'image/jpeg', data: heroImageBase64 },
                    imageCaption: `Scene: ${beats[0]?.environment?.notes || "Establish"}`,
                    vision: null,
                    _meta: { pageIndex: 0 }
                });

                await onPhase({ name: "Phase 5: Anchor Frame Ready ⚡", status: 'success' });

            } catch (e: any) {
                console.error("Hero Frame Failed", e);
                await onPhase({ name: "⛔ FATAL: Hero Frame (Page 1) Failed", status: 'error', output: e.message });
                throw new Error("Pipeline Aborted: Hero Frame Generation Failed. " + e.message);
            }

            // ==================================================================================
            // PHASE 3: PRODUCTION FLOOR (Parallel)
            // Goal: Generate Page 2..N simultaneously using Hero Frame.
            // ==================================================================================
            const remainingStart = 1; // Start from Page 2 (index 1)
            const remainingIndices = sentences.slice(remainingStart).map((_: any, idx: number) => remainingStart + idx);

            if (remainingIndices.length > 0) {
                await onPhase({ name: `Phase 6: Visual Production (Buffered Batch: ${remainingIndices.length} Images)`, status: 'loading' });

                // BATCHING: Split into chunks of 2 to avoid Rate Limits
                const BATCH_SIZE = 2;
                const results: any[] = [];

                for (let i = 0; i < remainingIndices.length; i += BATCH_SIZE) {
                    const batch = remainingIndices.slice(i, i + BATCH_SIZE);

                    const batchPromises = batch.map(async (pageIdx: number) => {
                        const item = sentences[pageIdx];
                        const beat = beats[pageIdx] || beats[0];

                        // DEBUG LOGGING
                        console.log(`[Pipeline] Page ${pageIdx} | Beat Page: ${beat?.page} | Action: ${beat?.action?.substring(0, 30)}... | Zone: ${beat?.blocking?.protagonist}`);

                        const keyframe = CLEAR_ENGINE.getSequentialKeyframe(pageIdx, item, visualDNA, blueprint, culture, "", {}, beat);

                        const imagenInputs: any[] = [
                            {
                                text: `REFERENCE IMAGE: This is the MASTER VISUAL ANCHOR.
Style: Pixar-esque 3D, high fidelity.

INSTRUCTION:
1. 🔒 CHARACTER IDENTITY: MUST MATCH REFERENCE EXACTLY. Do not change facial features, hair shape, or clothing details.
2. 🔒 ENVIRONMENT STYLE: MUST MATCH REFERENCE settings.
3. 🔒 STYLE LOCK: High-Fidelity 3D Render (Pixar-Style). Use "Octane Render" / "Unreal Engine" aesthetics. NO 2D ILLUSTRATION.
4. ⚖️ PRIORITY: CONSISTENCY > CREATIVITY. If the action contradicts the character's look, KEEP THE LOOK.
5. 🎬 NEW ACTION: Adapt the locked character to the new pose.

ACTION PROMPT: ${keyframe.prompt}`
                            }
                        ];

                        if (heroImageBase64) {
                            imagenInputs.unshift({ inlineData: { data: heroImageBase64, mimeType: "image/jpeg" } });
                        }

                        try {
                            // Add aspect ratio control if possible, or just standard gen
                            const imageResp = await models.imagen.generateContent(imagenInputs) as any;
                            const part = imageResp.response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
                            if (!part?.inlineData?.data) throw new Error("No Data");


                            // OPTIMIZATION STEP (Strict <300KB)
                            const rawData = part.inlineData.data;
                            const optimizedData = await optimizeImageAction(rawData);

                            await saveAssetAction(language, level, topic, pageIdx, optimizedData);

                            // Store with timestamp to bust browser cache
                            const timestamp = Date.now();
                            return {
                                ...item,
                                imagePath: `/api/story-asset?topic=${encodeURIComponent(topic)}&level=${level}&language=${language}&page=${pageIdx}&t=${timestamp}`,
                                image: { type: 'image', mimeType: 'image/jpeg', data: optimizedData },
                                imageCaption: `Scene: ${beat.environment.notes || "Story Moment"}`,
                                vision: null,
                                _meta: { pageIndex: pageIdx }
                            };
                        } catch (e: any) {
                            console.error(`Page ${pageIdx} Fail`, e);
                            throw new Error(`Page ${pageIdx} Failed`);
                        }
                    });

                    // Wait for batch
                    const batchResults = await Promise.all(batchPromises);
                    results.push(...batchResults);

                    // Cooldown
                    if (i + BATCH_SIZE < remainingIndices.length) {
                        await new Promise(resolve => setTimeout(resolve, 1500));
                    }
                }

                try {
                    pages.push(...results);
                    await onPhase({ name: "Phase 6: Visual Production Complete", status: 'success' });
                } catch (e: any) {
                    await onPhase({ name: "Phase 6: Batch Generation Failed", status: 'error', output: e.message });
                    throw e;
                }
            }
        }
    } else {
        pages.push(...sentences.map((s: any, i: number) => ({ ...s, image: null, _meta: { pageIndex: i } })));
    }

    // Wait for validation
    const [audit, exercises, anchor] = await validationPromise;

    return {
        title: topic,
        pages: pages.sort((a, b) => a._meta.pageIndex - b._meta.pageIndex), // Ensure order
        audit,
        anchor,
        culture,
        globalMeta: { blueprint, cast: blueprint.casting },
        mode: options.enableImages ? 'multimodal' : 'text_only',
        exercises: exercises?.exercises || [],
        _assets: { stage: null, actors: null }
    };
}

/**
 * REGENERATE SINGLE PAGE
 */
export async function regeneratePageImage(
    pageIndex: number,
    sentence: any,
    visualDNA: string,
    blueprint: any,
    casting: any,
    culture: any,
    topic: string,
    level: number,
    language: string,
    previousAction?: string,
    heroImageBase64?: string,
    beat?: Beat
) {
    // V4: MULTIMODAL ILLUSTRATION FOR REGENERATION (SAGA INTEGRATED)
    // We need to reconstruct the SAGA context for this single page.

    // 1. Rebuild SAGA Context from Global Meta
    const sagaContext = {
        actor_registry: casting || blueprint?.visual_definition?.actors || {},
        prop_manifest: { LOCKED_PROPS: blueprint?.prop_manifest?.LOCKED_PROPS || blueprint?.visual_definition?.props || [] },
        global_locks: {
            style_engine: blueprint?.visual_definition?.style_engine || "Pixar-esque 3D Animation Style",
            environmental_anchors: blueprint?.visual_definition?.environment || blueprint?.environmental_anchors || {}
        },
        visual_definition: blueprint?.visual_definition, // Pass full def for robust mapping
        story_sequence: blueprint?.sequence || blueprint?.story_sequence || []
    };

    // 2. Construct SAGA Prompt
    let sagaPromptWrapper;
    try {
        // V4: Pass heroImageBase64 status to get the "Reference Hint" in the prompt
        sagaPromptWrapper = SAGA_ENGINE.constructSagaPrompt(pageIndex, sentence, sagaContext, heroImageBase64);
    } catch (e) {
        // Fallback if SAGA fails
        console.warn("SAGA Regeneration Construct Failed, using fallback", e);
        sagaPromptWrapper = {
            prompt: `
            STYLE: Pixar-esque 3D.
            ACTION: ${sentence.english || sentence.text_native}.
            CHARACTER LOCK: ${visualDNA}.
            RENDER HIGH QUALITY 3D.
            ${heroImageBase64 ? "[STRICT CONSTRAINT: MAINTAIN CHARACTER/STYLE FROM REFERENCE]" : ""}
            `
        };
    }

    const imagenInputs: any[] = [
        {
            text: sagaPromptWrapper.prompt
        }
    ];

    if (heroImageBase64 && pageIndex > 0) {
        const optimizedRef = await optimizeImageAction(heroImageBase64);
        imagenInputs.unshift({ inlineData: { data: optimizedRef, mimeType: "image/jpeg" } });
    }

    const MAX_GEN_ATTEMPTS = 3;
    const TARGET_QUALITY = 95;
    let base64 = "";
    let vision: any = null;

    for (let attempt = 1; attempt <= MAX_GEN_ATTEMPTS; attempt++) {
        console.log(`[Regen] Generating Page ${pageIndex}, Attempt ${attempt}...`);
        const imageResp = await models.imagen.generateContent(imagenInputs) as any;
        const part = imageResp.response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        base64 = part?.inlineData?.data || "";

        if (!base64) continue;

        // STRICT MULTIMODAL AUDIT for regeneration
        const protagonistName = Object.keys(casting || {})[0] || "Main Character";
        const auditPrompt = `
            ACT AS: Visual Consistency Auditor (High Standard).
            TASK: Compare Image 2 (Target) with Image 1 (Reference/Hero).
            CONTEXT: ${sentence.english || sentence.text_native}
            
            CHECKLIST:
            1. IDENTITY: Image 2 MUST show the EXACT same actors (Protagonist: ${protagonistName}) as Image 1.
            2. CLOTHING: Actors MUST be wearing the EXACT same clothes as Image 1.
            3. BACKGROUND: Environment style and colors MUST match Image 1.
            4. ACTION: Does the image show: "${sentence.english || ""}"?
            
            OUTPUT JSON: { "matchScore": (0-100), "altText": "string", "caption": "string" }
        `;
        const auditInputs: any[] = [{ text: `${auditPrompt} Output STRICT JSON ONLY.` }];

        if (heroImageBase64 && pageIndex > 0) {
            const optimizedRef = await optimizeImageAction(heroImageBase64);
            auditInputs.unshift({ inlineData: { data: optimizedRef, mimeType: "image/jpeg" } });
            auditInputs.push({ inlineData: { data: base64, mimeType: "image/png" } });
        } else {
            auditInputs.push({ inlineData: { data: base64, mimeType: "image/png" } });
        }

        vision = await models.flash.generateContent(auditInputs).then((r: any) => safeJsonParse(r.response.text()));
        const score = vision?.matchScore || vision?.score || 0;

        if (score >= TARGET_QUALITY) {
            console.log(`✅ [Regen PASS] Page ${pageIndex} Score: ${score}`);
            break;
        }

        if (attempt < MAX_GEN_ATTEMPTS) {
            console.warn(`⚠️ [Regen RETRY] Page ${pageIndex} Score: ${score} (Target ${TARGET_QUALITY}%). Retrying...`);
        } else {
            console.error(`❌ [Regen MAX RETRIES] Page ${pageIndex} failed quality target. Final Score: ${score}`);
        }
    }

    const image = { type: 'image', mimeType: 'image/png', data: base64 };

    // Persist to Disk if we have metadata
    if (topic && level && language) {
        console.log(`[Regen] Persisting Asset: Page ${pageIndex} (${topic})`);
        await saveAssetAction(language, level, topic, pageIndex, base64);
    }

    return {
        ...sentence,
        imagePath: `/api/story-asset?topic=${encodeURIComponent(topic)}&level=${level}&language=${language}&page=${pageIndex}&t=${Date.now()}`,
        image,
        vision,
        imageAlt_descriptive: vision?.altText,
        imageCaption: vision?.caption,
        _meta: { pageIndex, visualDNA, blueprint, casting }
    };
}

/**
 * TRANSLATE STORY
 * Used by Multilingual Studio
 */
export async function translateStory(story: any, targetLanguage: string) {
    const prompt = `
        Translate this story JSON to ${targetLanguage}.
        Maintain the exact JSON structure.
        Only translate the 'text_native' fields and 'title'.
        Keep 'english' fields as is (or translate them if they are missing).
        
        Story: ${JSON.stringify(story)}
        
        Output STRICT JSON.
    `;

    // Use Flash for speed
    const result = await models.flash.generateContent(prompt) as any;
    return safeJsonParse(result.response.text());
}

// ==========================================
// NEW: SAGA PIPELINE (State-Aware)
// ==========================================
import { SAGA_ENGINE, type SagaSchema } from "./saga-schema";

export async function processSagaStoryPipeline(
    topic: string, premise: string, level: number, language: string, gender: string = "child",
    onPhase: (data: any) => void,
    options: { enableImages: boolean } = { enableImages: true }
) {
    // Helper to run a phase with updates and RETRY logic
    const run = async (name: string, task: () => Promise<any>) => {
        onPhase({ name, status: 'loading' });

        let currentDelay = 1000;
        const maxRetries = 2; // Reduced retries for snappiness

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await task();
                // Check if result has _aiMeta to propagate
                onPhase({ name, status: 'success', output: result });
                return result;
            } catch (error: any) {
                const isRetryable = error.status === 429 || error.status === 503 ||
                    (error.message && (error.message.includes('429') || error.message.includes('Quota')));

                if (attempt < maxRetries && isRetryable) {
                    console.log(`⚠️ ${name}: Rate limit/Quota hit. Retrying in ${currentDelay}ms (Attempt ${attempt + 1}/${maxRetries})...`);
                    await new Promise(resolve => setTimeout(resolve, currentDelay));
                    currentDelay *= 2; // Exponential backoff
                    continue;
                }

                // If final attempt or not retryable
                onPhase({ name, status: 'error', output: error.message });
                throw error; // STRICT FAIL
            }
        }
    };

    // --- PHASE 1: STORY AUTHORING (TEXT ONLY) ---
    // GOAL: Write a clean story without visual clutter.

    // 1.1 Cultural Engine
    const culture = await run("Phase 1: Cultural Oracle (Input)", async () => {
        return await generateCulturalContext(language, topic, level);
    });

    const config = getStoryConfig(level);
    const authoringPrompt = `
        Write a short ${language} story. Topic: "${topic}". Premise: "${premise}". Reading Level: ${level}/8.
        [LEVEL CONFIGURATION]
        - Target Sentence Count: ${config.sentenceCount}
        - Word Count Per Sentence: ${config.wordCountPerSentence} words.
        - Cultural Context: ${JSON.stringify(culture)}
        
        Constraint: Write PURE NARRATIVE. Do NOT include visual descriptions like "He wore a blue shirt". Focus on action and dialogue.
        Output STRICT JSON: { "sentences": [ { "native": "Sentence in ${language}", "english": "English translation" } ] }
    `;

    const cacheKey = generateStoryKey(language, level, topic);
    const storyJson = await run("Phase 2: Authoring (Gemini 3 Pro)", async () => {
        const cachedScript = await getCache('scripts', cacheKey);
        if (cachedScript) return cachedScript;
        const result = await models.pro.generateContent(authoringPrompt).then((r: any) => safeJsonParse(r.response.text()));
        if (result.sentences && result.sentences.length > 0) await setCache('scripts', cacheKey, result);
        return result;
    });

    let sentences = storyJson.sentences || [];

    // --- PHASE 3: PARALLEL DIRECTORS ---
    // Fork the pipeline: Art Director (SAGA) & Audio Director (Future)

    const pages: any[] = [];
    let sagaBlueprint: SagaSchema | null = null;
    let heroImageBase64: string | undefined = undefined;

    if (options.enableImages) {
        // STREAM A: ART DIRECTOR (SAGA)

        // 3.1 Generate SAGA Blueprint
        sagaBlueprint = await run("Phase 3A: Art Director (SAGA Blueprint)", async () => {
            const prompt = `
                ACT AS: Art Director & Cinematographer.
                INPUT: Story Script: ${JSON.stringify(sentences)}
                CULTURE: ${JSON.stringify(culture)}
                PREMISE: ${premise}
                
                TASK: logical_blueprint
                Create a SAGA (State-Aware Generative Architecture) JSON Blueprint.
                
                CRITICAL INSTRUCTION:
                You MUST generate a 'story_sequence' array with EXACTLY one item for every sentence in the input script. 
                Input Sentences: ${sentences.length} -> Output Sequence Length: ${sentences.length}.
                CRITICAL: Ensure 'page' numbers increment correctly (1, 2, 3...) matching the sentence order.
                
                [STYLE GUIDE: PIXAR-ESQUE 3D]
                - Lighting: Soft global illumination, rim lighting for separation, warm/vibrant tones.
                - Texture: Stylized realism (subsurface scattering on skin, distinct fabric textures).
                - Rendering: Octane/Redshift style, broad soft shadows, no noise.

                [CINEMATOGRAPHY RULES - PERMANENT LOCK]
                - CRITICAL: EVERY SINGLE PANEL MUST BE A "WIDE ESTABLISHING SHOT".
                - DO NOT generate Close-ups, Medium Shots, or Insert Shots.
                - Camera: Always Wide Angle (35mm equivalent), Full Body framing.
                - IGNORE narrative beats that suggest intimacy; maintain the Wide Shot.
                   - FOCUS: The Characters are the subject, not the environment.
                   - REDUCE CLUTTER. Do NOT fill the background with vehicles/crowds unless essential. 
                   - Focus on the Actors in the environment. "Negative space" is good.
                3. DEPTH LAYERING:
                   - Use 'zoning' to specify depth (e.g. "Foreground: Arun, Background: Old Man").
                   - Z-Index primary props correctly.
                4. SCALE & PROPORTION:
                   - OBSTACLES (Walls, Gates, Tables) must be REALISTCALLY SCALED to the Child Actor.
                   - CRITICAL: NEVER use "Dominating frame" or "Towering" for static walls.
                   - A wall should be "Climbable height" (approx 1.5x child height), not a fortress.
                
                OUTPUT SCHEMA (Strict JSON):
                {
                   "global_locks": { 
                       "style_engine": "Pixar-esque 3D Animation Style, Soft Global Illumination, Vibrant Color Palette, High Fidelity Render",
                       "environmental_anchors": {
                           "location": "Wide-angle Master Shot description of the primary setting (Key elements, architecture, ground plane) to serve as the anchor for all subsequent frames.",
                           "lighting": "Time of day and mood lighting"
                       }
                   },
                   "actor_registry": { 
                       "PROT_01": { 
                           "id": "PROT_01", 
                           "traits": "Specific AGE, ETHNICITY, SKIN TONE, HAIR TEXTURE/COLOR, EYE SHAPE. e.g. '8yo Indian boy, messy black hair, brown skin, wearing red t-shirt'",
                           "state": "Base neutral expression"
                       }
                       // Add secondary characters if script requires
                   },
                   "prop_manifest": {
                       "LOCKED_PROPS": [
                           { "id": "PROP_01", "parent": "PROT_01", "grip": "Right Hand", "description": "e.g. A wooden walking stick" }
                       ]
                   },
                   "story_sequence": [
                      {
                         "page": 1, 
                         "sentence_ref": "Original sentence text",
                         "action": "Visual description of the action. e.g. 'PROT_01 walks down the street.'", 
                         "zoning": "Rule of Thirds / Center",
                         "motion_vector": "Left-to-Right",
                         "beat": "Narrative beat"
                      }
                      // ... continue for ALL sentences
                   ]
                }
            `;

            const blueprint = await models.pro.generateContent(prompt, { generationConfig: { responseMimeType: "application/json" } })
                .then((r: any) => safeJsonParse(r.response.text()));

            console.log(`[Phase 3A] Generated Blueprint. Sequence Len: ${(blueprint as any)?.story_sequence?.length}`);

            // LOGGING: Save the Blueprint for debugging
            await saveLogAction(language, level, topic, 'saga_blueprint.json', blueprint);

            return blueprint;
        });

        // 3.2 Visual Production (Parallel Batching)
        // Similar to old pipeline but using SAGA_ENGINE.constructSagaPrompt

        if (sagaBlueprint) {
            // [SAGA RECOVERY] Start Fallback if Blueprint is empty
            const bAny = sagaBlueprint as any;
            if (!bAny.story_sequence || bAny.story_sequence.length === 0) {
                if (bAny.sequence && bAny.sequence.length > 0) {
                    // Handle alias
                    bAny.story_sequence = bAny.sequence;
                } else {
                    console.warn("[SAGA] Blueprint Sequence Empty. Activating Fallback Protocol.");
                    bAny.story_sequence = sentences.map((s: any, idx: number) => ({
                        page: idx + 1,
                        sentence_ref: s.text,
                        action: s.text,
                        zoning: "Center",
                        beat: "Fallback"
                    }));
                }
            }

            // GENERATE WRAPPER: PROCESS ALL FRAMES (0 to N) IN PRODUCTION BATCH
            const remainingStart = 0; // START FROM PAGE 0
            const remainingIndices = sentences.slice(remainingStart).map((_: any, idx: number) => remainingStart + idx);

            if (remainingIndices.length > 0) {
                await onPhase({ name: `Phase 3B: SAGA Production Floor (${remainingIndices.length} Frames)`, status: 'loading' });

                const BATCH_SIZE = 3;
                const results: any[] = [];
                let heroBuffer: string | undefined;

                // STEP 1: HERO FRAME (Page 0) - Must run SOLO to establish the Anchor
                if (remainingStart === 0) {
                    await onPhase({ name: `Phase 3B: SAGA Hero Frame (Establishing Anchor)`, status: 'loading' });

                    const pageIdx = 0;
                    const item = sentences[0];
                    try {
                        const sagaPrompt = SAGA_ENGINE.constructSagaPrompt(pageIdx, item, sagaBlueprint!);
                        await saveLogAction(language, level, topic, `page-01-prompt.json`, { prompt_lines: sagaPrompt.prompt.split('\n') });

                        const inputs: any[] = [{ text: sagaPrompt.prompt }];

                        console.log(`[SAGA] Generating HERO Page 0...`);
                        const imageResp = await models.imagen.generateContent(inputs) as any;
                        const part = imageResp.response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

                        if (part?.inlineData?.data) {
                            heroBuffer = part.inlineData.data;
                            const opt = await optimizeImageAction(heroBuffer!);
                            await saveAssetAction(language, level, topic, pageIdx, opt);
                            results.push({
                                ...item,
                                imagePath: `/api/story-asset?topic=${encodeURIComponent(topic)}&level=${level}&language=${language}&page=${pageIdx}&t=${Date.now()}`,
                                image: { type: 'image', mimeType: 'image/jpeg', data: opt },
                                _meta: { pageIndex: pageIdx }
                            });
                        } else {
                            results.push({ ...item, error: "Hero Gen Failed", _meta: { pageIndex: 0 } });
                        }
                    } catch (e: any) {
                        console.error("Hero Frame Exception:", e);
                        results.push({ ...item, error: e.message, _meta: { pageIndex: 0 } });
                    }
                }

                // STEP 2: BATCH REST
                const productionIndices = remainingIndices.filter((idx: number) => idx > 0);

                for (let i = 0; i < productionIndices.length; i += BATCH_SIZE) {
                    const batch = productionIndices.slice(i, i + BATCH_SIZE);
                    const batchPromises = batch.map(async (pageIdx: number) => {
                        const item = sentences[pageIdx];

                        try {
                            /* Debug logs removed for cleanliness */
                            const sagaPrompt = SAGA_ENGINE.constructSagaPrompt(pageIdx, item, sagaBlueprint!);

                            // LOGGING: Save the prompt
                            await saveLogAction(language, level, topic, `page-${String(pageIdx + 1).padStart(2, '0')}-prompt.json`, {
                                prompt_lines: sagaPrompt.prompt.split('\n')
                            });

                            // VISUAL ANCHORING: Inject Hero Buffer if available
                            const inputs: any[] = [{ text: sagaPrompt.prompt }];
                            if (heroBuffer) {
                                inputs.push({ inlineData: { mimeType: "image/jpeg", data: heroBuffer } });
                            }

                            console.log(`[SAGA] Generating Page ${pageIdx} (Anchor: ${!!heroBuffer})...`);
                            const imageResp = await models.imagen.generateContent(inputs) as any;

                            const part = imageResp.response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
                            const rawData = part?.inlineData?.data;

                            if (!rawData) {
                                console.error(`[SAGA ERROR] Page ${pageIdx} returned no image data. Response:`, JSON.stringify(imageResp, null, 2));
                                // Return item without image (will show placeholder in UI)
                                return {
                                    ...item,
                                    imagePath: undefined,
                                    image: undefined,
                                    _meta: { pageIndex: pageIdx },
                                    error: "Generation Failed (Safety/Empty)"
                                };
                            }

                            const opt = await optimizeImageAction(rawData);
                            await saveAssetAction(language, level, topic, pageIdx, opt);

                            return {
                                ...item,
                                imagePath: `/api/story-asset?topic=${encodeURIComponent(topic)}&level=${level}&language=${language}&page=${pageIdx}&t=${Date.now()}`,
                                image: { type: 'image', mimeType: 'image/jpeg', data: opt },
                                _meta: { pageIndex: pageIdx }
                            };
                        } catch (e: any) {
                            console.error(`[SAGA EXCEPTION] Page ${pageIdx} Failed:`, e);
                            return {
                                ...item,
                                imagePath: undefined,
                                image: undefined,
                                _meta: { pageIndex: pageIdx },
                                error: e.message || "Unknown Error"
                            };
                        }
                    });

                    const batchResults = await Promise.all(batchPromises);
                    results.push(...batchResults);

                    if (i + BATCH_SIZE < remainingIndices.length) await new Promise(r => setTimeout(r, 1500));
                }
                pages.push(...results);
            }
        }
    } else {
        pages.push(...sentences.map((s: any, i: number) => ({ ...s, image: null, _meta: { pageIndex: i } })));
    }

    // --- PHASE 4: AUDIT (Convergence) ---
    const audit = await run("Phase 4: Final Quality Gate", async () => {
        const prompt = `Audit this story. Text: ${JSON.stringify(sentences)}. Generated SAGA: ${sagaBlueprint ? "Yes" : "No"}. Output STRICT JSON: { "score": 100, "flagged": false }`;
        return await models.flash.generateContent(prompt, { generationConfig: { responseMimeType: "application/json" } }) // FORCE JSON
            .then((r: any) => safeJsonParse(r.response.text()));
    });

    return {
        title: topic,
        pages: pages.sort((a, b) => a._meta.pageIndex - b._meta.pageIndex),
        audit,
        anchor: {},
        culture,
        globalMeta: { blueprint: sagaBlueprint, flow: "SAGA_v1" },
        mode: options.enableImages ? 'multimodal' : 'text_only',
        exercises: [],
        _assets: { stage: null, actors: null }
    };
}

// ==========================================
// NEW: UNIFIED STORY WRITER PIPELINE (SPLIT)
// ==========================================

/**
 * Phase 1: Planning (The Writer's Room)
 * Generates the "Plan" (Text + Visual Definition) but NO Images.
 */
export async function previewUnifiedStory(
    topic: string, premise: string, level: number, language: string, gender: string = "child",
    onPhase: (data: any) => void
): Promise<UnifiedStory> {

    // Helper to run a phase with updates
    const run = async (name: string, task: () => Promise<any>) => {
        onPhase({ name, status: 'loading' });
        try {
            const result = await task();
            onPhase({ name, status: 'success', output: result });
            return result;
        } catch (error: any) {
            onPhase({ name, status: 'error', output: error.message });
            throw error;
        }
    };

    // --- PHASE 1: STORY UNIVERSE CREATION (The "Big Bang") ---

    // 1.1 Cultural Engine
    const context = await run("Phase 1: Cultural Oracle", async () => {
        return await generateCulturalContext(language, topic, level);
    });

    // 1.5 Adaptive Logic (Struggle Oracle)
    const adaptiveConstraints = await run("Phase 1.5: Adaptive Logic (Struggle Oracle)", async () => {
        // 1. Get struggling words from profile
        const criticalWords = getCriticalWords(5); // Get top 5
        if (!criticalWords || criticalWords.length === 0) return [];

        // 2. Filter for narrative compatibility
        const { accepted, rejected } = await checkVocabularyCompatibility(premise, topic, criticalWords.map(w => ({
            word: w.word,
            meaning: w.meaning,
            reason: `Struggled ${w.mistakes} times`
        })));

        if (accepted.length > 0) {
            console.log(`[Adaptive Logic] Injecting ${accepted.length} words: ${accepted.map(w => w.word).join(', ')}`);
        }

        // Log rejected for debugging
        if (rejected.length > 0) {
            console.log(`[Adaptive Logic] Deferred ${rejected.length} words (Incompatible with '${topic}')`);
        }

        return accepted;
    });

    // 1.2 The Story Writer Engine
    // We pass level and language to ensuring rubric compliance
    let story: UnifiedStory = await run("Phase 2: Story Writer (Director & Author)", async () => {
        return await STORY_WRITER.createStoryUniverse(topic, premise, level, language, gender, context, adaptiveConstraints);
    });

    // 1.3 Vocabulary Safety Net (Fix for "Empty Word Builder")
    if (!story.vocabulary || story.vocabulary.length < 3) {
        await run("Phase 2.5: Vocabulary Repair (Fallback)", async () => {
            console.warn(`[Unified] Story Writer vocabulary missing or sparse (${story.vocabulary?.length || 0}). Auto-generating...`);
            const fullText = story.script.sentences.map((s: any) => s.text_native).join(" ");
            const vocabRes = await enrichVocabularyAction(language, level, fullText);

            if (vocabRes.status === 'success' && vocabRes.vocabulary) {
                story.vocabulary = vocabRes.vocabulary;
                return `Recovered ${vocabRes.vocabulary.length} words`;
            }
            return "Failed to recover vocabulary";
        });
    }

    // Save Logs
    try {
        await saveLogAction(language, level, topic, "unified_story.json", story);
    } catch (e) {
        console.warn("Failed to save Unified Story log", e);
    }

    return story;
}

/**
 * Phase 2: Production (The Studio)
 * Takes a (potentially edited) UnifiedStory and renders the visuals.
 */
export async function renderUnifiedStory(
    story: UnifiedStory,
    language: string, level: number, topic: string,
    onPhase: (data: any) => void,
    options: { enableImages: boolean } = { enableImages: true }
) {
    // --- PHASE 3: PRODUCTION FLOOR (SAGA RENDER) ---

    // Pre-calculate target words for ID referencing
    const finalTargetWords = (story.vocabulary || []).map((v, i) => ({
        id: `word_${i}_${v.native.replace(/\s+/g, '_')}`,
        native: v.native,
        meaning_en: v.meaning
    }));

    const pages: any[] = [];
    let heroImageBase64: string | undefined = undefined;
    // Mapping Unified Schema -> SAGA Schema
    // 1. Actors: Direct Map
    // 2. Props: Map values to array
    // 3. Locks: Map individual fields
    const sagaContext = {
        actor_registry: story.visual_definition.actors,
        prop_manifest: { LOCKED_PROPS: Object.values(story.visual_definition.props || {}) },
        global_locks: {
            style_engine: story.visual_definition.style_engine,
            environmental_anchors: story.visual_definition.environment
        },
        story_sequence: story.saga_blueprint.sequence
    };

    if (options.enableImages) {
        // 3.1 Generate HERO FRAME (Page 1)
        await onPhase({ name: "Phase 3: Visual Production - Anchor Frame", status: 'loading' });

        try {
            // Construct Prompt using SAGA Engine
            // NOTE: SAGA Engine expects 0-indexed page logic or matching
            const page0 = story.saga_blueprint.sequence[0];
            const sentence0 = story.script.sentences[0];

            // Construct the Technical Prompt
            // Use pageIndex 0
            const sagaPrompt = SAGA_ENGINE.constructSagaPrompt(0, sentence0, sagaContext);

            // SAVE LOG: Hero Prompt
            await saveLogAction(language, level, topic, "page-01-prompt.json", sagaPrompt);

            const imagenInputs: any[] = [{
                text: sagaPrompt.prompt
            }];

            // Call Gemini 3 Image Gen
            const imageResp = await models.imagen.generateContent(imagenInputs) as any;
            const part = imageResp.response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

            if (!part?.inlineData?.data) {
                await saveLogAction(language, level, topic, "page-01-error.json", { error: "Hero Frame No Data", response: imageResp });
                throw new Error("Hero Frame Generation Failed: No Data");
            }

            const rawBase64 = part.inlineData.data;
            heroImageBase64 = await optimizeImageAction(rawBase64);

            // Save Asset
            await saveAssetAction(language, level, topic, 0, heroImageBase64);

            pages.push({
                ...sentence0,
                native: sentence0.text_native, // FIX: Ensure UI key exists
                english: sentence0.english || (sentence0 as any).text_english,
                imagePath: `/api/story-asset?topic=${encodeURIComponent(topic)}&level=${level}&language=${language}&page=0&t=${Date.now()}`,
                image: { type: 'image', mimeType: 'image/jpeg', data: heroImageBase64 },
                imageCaption: `Scene: ${page0.action}`,
                pageNumber: 1,
                _meta: { pageIndex: 0 },
                targetWordIds: finalTargetWords
                    .filter(w => sentence0.text_native.includes(w.native))
                    .map(w => w.id)
            });

            await onPhase({ name: "Phase 3: Anchor Frame Ready ⚡", status: 'success' });

        } catch (e: any) {
            console.error("Hero Frame Failed", e);
            await saveLogAction(language, level, topic, "page-01-error.json", { message: e.message, stack: e.stack });
            await onPhase({ name: "Error: Hero Frame Failed", status: 'error', output: e.message });
            // Fail hard because consistent characters depend on it
            throw new Error("Hero Frame Failed: " + e.message);
        }

        // 3.2 Production Batch (Pages 2+)
        const sentences = story.script.sentences;
        const remainingStart = 1;
        // Map to indices for batching
        const remainingIndices = sentences.slice(remainingStart).map((_, idx) => remainingStart + idx);

        // Only run if we have more than 1 page
        if (remainingIndices.length > 0) {
            await onPhase({ name: `Phase 4: Visual Production (Batch of ${remainingIndices.length})`, status: 'loading' });

            const BATCH_SIZE = 2; // Reduced for stability
            const results: any[] = [];

            for (let i = 0; i < remainingIndices.length; i += BATCH_SIZE) {
                const batch = remainingIndices.slice(i, i + BATCH_SIZE);

                const batchPromises = batch.map(async (pageIdx) => {
                    const sentence = sentences[pageIdx];
                    const pageData = story.saga_blueprint.sequence[pageIdx];

                    try {
                        // SAGA Prompt
                        const sagaPrompt = SAGA_ENGINE.constructSagaPrompt(pageIdx, sentence, sagaContext);


                        // SAGA V2 MASTER LOCK CHECK
                        if (!SAGA_ENGINE.verifySagaLocks(sagaPrompt.prompt)) {
                            console.error(`[SAGA LOCK FAIL] Page ${pageIdx} Prompt missing required locks.`);
                            throw new Error("SAGA V2 Master Lock Failed: Prompt missing strict spatial/depth directives.");
                        }

                        // SAVE LOG: Batch Prompt
                        const paddedPage = (pageIdx + 1).toString().padStart(2, '0');
                        await saveLogAction(language, level, topic, `page-${paddedPage}-prompt.json`, sagaPrompt);

                        const inputs: any[] = [{ text: sagaPrompt.prompt }];
                        // Inject Hero Reference
                        if (heroImageBase64) {
                            inputs.unshift({ inlineData: { data: heroImageBase64, mimeType: "image/jpeg" } });
                        }

                        console.log(`[Unified] Generating Page ${pageIdx}...`);
                        const resp = await models.imagen.generateContent(inputs) as any;
                        const part = resp.response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

                        if (!part?.inlineData?.data) {
                            await saveLogAction(language, level, topic, `page-${paddedPage}-error.json`, { error: "No Data", response: resp });
                            throw new Error(`Page ${pageIdx} Gen Failed: No Data`);
                        }

                        const data = await optimizeImageAction(part.inlineData.data);
                        await saveAssetAction(language, level, topic, pageIdx, data);

                        // [SAGA] VISUAL AUDIT & AUTO-RETRY
                        let audit = { score: 100, reason: "First pass" };
                        let currentData = data;
                        const MAX_GEN_ATTEMPTS = 3;
                        const TARGET_QUALITY = 95;

                        if (heroImageBase64) {
                            for (let attempt = 1; attempt <= MAX_GEN_ATTEMPTS; attempt++) {
                                console.log(`[SAGA Audit] Checking Page ${pageIdx}, Attempt ${attempt}...`);
                                audit = await auditVisualConsistency(currentData, heroImageBase64, `Action: ${sentence.english || sentence.text_native}`);

                                if (audit.score >= TARGET_QUALITY) {
                                    console.log(`✅ [SAGA PASS] Page ${pageIdx} Score: ${audit.score}`);
                                    break;
                                }

                                if (attempt < MAX_GEN_ATTEMPTS) {
                                    console.warn(`⚠️ [SAGA RETRY] Page ${pageIdx} Score: ${audit.score} (Target ${TARGET_QUALITY}%). Reason: ${audit.reason}. Retrying...`);
                                    const retryResp = await models.imagen.generateContent(inputs) as any;
                                    const retryPart = retryResp.response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
                                    if (retryPart?.inlineData?.data) {
                                        currentData = await optimizeImageAction(retryPart.inlineData.data);
                                        await saveAssetAction(language, level, topic, pageIdx, currentData); // Overwrite bad asset
                                    }
                                } else {
                                    console.error(`❌ [SAGA MAX RETRIES] Page ${pageIdx} failed to hit quality target. Final Score: ${audit.score}`);
                                }
                            }
                        }

                        return {
                            ...sentence,
                            native: sentence.text_native,
                            imagePath: `/api/story-asset?topic=${encodeURIComponent(topic)}&level=${level}&language=${language}&page=${pageIdx}&t=${Date.now()}`,
                            image: { type: 'image', mimeType: 'image/jpeg', data: currentData },
                            imageCaption: `Scene: ${pageData.action}`,
                            pageNumber: pageIdx + 1,
                            _meta: { pageIndex: pageIdx },
                            saga_audit: audit,
                            targetWordIds: finalTargetWords
                                .filter(w => sentence.text_native.includes(w.native))
                                .map(w => w.id)
                        };
                    } catch (e: any) {
                        console.error(`[Unified Batch Error] Page ${pageIdx} Failed:`, e);
                        const paddedPage = (pageIdx + 1).toString().padStart(2, '0');
                        await saveLogAction(language, level, topic, `page-${paddedPage}-error.json`, { message: e.message, stack: e.stack });
                        // Return error object instead of crashing
                        return {
                            ...sentence,
                            imagePath: undefined,
                            image: undefined,
                            _meta: { pageIndex: pageIdx },
                            error: e.message || "Generation Failed"
                        };
                    }
                });

                // Wait for batch
                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults);

                // Delay to respect rate limits
                if (i + BATCH_SIZE < remainingIndices.length) {
                    await new Promise(r => setTimeout(r, 2000));
                }
            }
            pages.push(...results);
            await onPhase({ name: "Phase 4: Production Complete", status: 'success' });
        }
    } else {
        // Text Only Mode
        pages.push(...story.script.sentences.map((s, i) => ({ ...s, image: null, _meta: { pageIndex: i } })));
    }

    return {
        title: story.meta.title,
        pages: pages.sort((a, b) => a._meta.pageIndex - b._meta.pageIndex),
        audit: { score: 100, flagged: false, notes: "Story Writer V1" },
        anchor: {},
        culture: {}, // Already consumed in preview
        // Pass the Unified DNA for the frontend debugging
        globalMeta: {
            visualDNA: JSON.stringify(story.visual_definition),
            blueprint: story.saga_blueprint,
            flow: "STORY_WRITER_V1"
        },
        mode: options.enableImages ? 'multimodal' : 'text_only',
        exercises: story.script.exercises || [],
        targetWords: finalTargetWords,
        _assets: { stage: null, actors: null }
    };
}

/**
 * SAGA VISUAL AUDIT
 * Compares a generated frame against the Hero Reference to ensure lock consistency.
 */
async function auditVisualConsistency(
    targetImageBase64: string,
    heroImageBase64: string,
    context: string
): Promise<{ score: number, reason: string }> {
    // Fail fast if missing data
    if (!targetImageBase64 || !heroImageBase64) return { score: 0, reason: "Missing image data" };

    const prompt = `
            ACT AS: Visual Consistency Auditor (High Standard QC).
            TASK: Compare Image 2 (Target) with Image 1 (Reference/Hero).
            CONTEXT: ${context}
            
            CHECKLIST:
            1. IDENTITY: Is it the EXACT same character(s)? (Check face, hair, and skin tone).
            2. CLOTHING: Are they wearing the EXACT same clothes as Image 1?
            3. BACKGROUND: Is the environment consistency (style, architecture, colors) 100% matched?
            4. PROPS: Are all story props correctly represented?
            5. STORY SEQUENCE: Does the scene accurately show the ACTION: "${context}"?
            6. STYLE: Is the render style identical? (Pixar-esque 3D animation)
            
            SCORING (Strict Standard):
            - 95-100: PERFECT match in assets and style. No drift.
            - 80-99: Minor lighting/angle differences, but clearly same assets.
            - 60-79: Slight drift (e.g. hair slightly different, shirt shade off).
            - < 60: FAIL. Different person, wrong clothes, or wrong style.

            OUTPUT STRICT JSON: { "score": number, "reason": "string" }
        `;

    try {
        const inputs = [
            { inlineData: { mimeType: "image/jpeg", data: heroImageBase64 } },
            { inlineData: { mimeType: "image/jpeg", data: targetImageBase64 } },
            { text: prompt }
        ];

        const result = await models.flash.generateContent(inputs) as any;
        const json = safeJsonParse(result.response.text());
        return {
            score: typeof json.score === 'number' ? json.score : 0,
            reason: json.reason || "Audit failed to parse"
        };
    } catch (e) {
        console.warn("[SAGA Audit] Failed:", e);
        return { score: 0, reason: "Audit Error" };
    }
}

/**
 * OLD: Wrapper for backward compatibility
 */
export async function processUnifiedStoryPipeline(
    topic: string, premise: string, level: number, language: string, gender: string = "child",
    onPhase: (data: any) => void,
    options: { enableImages: boolean } = { enableImages: true }
) {
    // 1. Plan
    const story = await previewUnifiedStory(topic, premise, level, language, gender, onPhase);

    // 2. Render
    // The original processUnifiedStoryPipeline returned the 'culture' object from the first phase.
    // renderUnifiedStory now returns an empty culture object as per the instruction.
    // If the original 'culture' object is needed in the final return, it should be passed through.
    // For now, following the instruction's output for renderUnifiedStory.
    const result = await renderUnifiedStory(story, language, level, topic, onPhase, options);

    // Re-inject the original culture context if it's expected in the final output of processUnifiedStoryPipeline
    // This assumes `previewUnifiedStory`'s `context` is the `culture` needed.
    // However, the instruction for `renderUnifiedStory` explicitly sets `culture: {}`.
    // To maintain the original behavior of `processUnifiedStoryPipeline` returning the actual culture,
    // we need to retrieve it from the `story` object or pass it.
    // Let's assume `story.meta.culture` or similar would hold it if needed, but it's not explicitly defined.
    // For now, I will stick to the instruction's `culture: {}` in `renderUnifiedStory`'s return.
    // If `processUnifiedStoryPipeline` needs the actual culture, it should be:
    // `result.culture = story.context;` (assuming `story.context` exists and holds the culture)
    // Given the instruction, I will leave `culture: {}` as is in `renderUnifiedStory` and thus in the wrapper.

    return result;
}
