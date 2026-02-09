import { UnifiedStory } from "./types";
import { STORY_WRITER_PROMPT } from "./prompts";
import { generateContentServer } from "@/app/actions/gemini";
import { getStoryConfig } from "../prompt-engine";
import { CULTURAL_DB } from "../cultural-db";

export class StoryWriterEngine {

    /**
     * Main Entry Point: Creates the entire "Story Universe"
     * (Narrative + Visuals + Metadata) in one shot.
     */
    /**
     * Main Entry Point: Creates the entire "Story Universe"
     * (Narrative + Visuals + Metadata) in one shot.
     */
    async createStoryUniverse(
        topic: string,
        premise: string,
        level: number,
        language: string,
        gender: string = "child", // 'boy' or 'girl' or 'child'
        context: any, // Cultural Context Object
        vocabularyConstraints?: any[] // New Adaptive Logic
    ): Promise<UnifiedStory> {

        // 1. Get Configs
        const config = getStoryConfig(level);
        const targetLangName = CULTURAL_DB[language]?.language?.name || language;

        // 1.5 Format Vocabulary Constraints
        let vocabPrompt = "";
        if (vocabularyConstraints && vocabularyConstraints.length > 0) {
            vocabPrompt = `
            [ADAPTIVE LEARNING OVERRIDE]
            The child is struggling with the following words. You MUST incorporate them NATURALLY into the story context:
            ${vocabularyConstraints.map((v: any) => `- "${v.word}" (Meaning: ${v.meaning}). Reason: ${v.reason}`).join('\n')}
            
            Constraint: If the word does not fit the flow, skip it. Do not force it awkwardly.
            `;
        } else {
            vocabPrompt = "No specific vocabulary constraints.";
        }

        // 2. Construct Prompt (Split-Brain)
        const prompt = STORY_WRITER_PROMPT
            .replace('${topic}', topic)
            .replace('${premise}', premise)
            .replace('${level}', level.toString())
            .replace('${level}', level.toString()) // Replace twice because it appears in Role and Input
            .replace('${gender}', gender)
            .replace('${gender}', gender) // Replace twice (Role Constraint + Input)
            .replace('${culture_context}', JSON.stringify(context))
            .replace('${target_language}', targetLangName)
            .replace(/\${sentence_count}/g, config.sentenceCount.toString()) // Replace all occurrences
            .replace('${vocabulary_constraints}', vocabPrompt);

        console.log(`[StoryWriter] creating universe for: ${topic} (Level ${level}, Gender: ${gender}, Lang: ${targetLangName})`);

        // 2. Call Gemini 3 Pro (The Brain)
        // We use the advanced reasoning model because this single call designs the whole world.
        const response = await generateContentServer("gemini-3-pro-preview", prompt, {
            systemInstruction: `You are a strict bilingual story generator. 
            You MUST output 'text_native' in ${targetLangName}. 
            If ${targetLangName} is different from English, 'text_native' MUST NOT BE IN ENGLISH.
            'text_english' MUST ALWAYS BE IN ENGLISH.`
        });

        // 3. Parse & Validate
        const json = this.safeJsonParse(response.text || "{}");
        if (!json.script || !json.visual_definition) {
            console.error("Story Writer failed to generate valid universe:", json);
            throw new Error("Story Writer Engine failed: Invalid JSON structure.");
        }

        // 4. Hydrate Defaults (Safety)
        const story: UnifiedStory = {
            id: crypto.randomUUID(),
            meta: {
                title: json.meta?.title || topic,
                language,
                level,
                topic,
                created_at: new Date().toISOString()
            },
            script: json.script,
            visual_definition: json.visual_definition,
            saga_blueprint: json.saga_blueprint || { sequence: [] },
            vocabulary: json.vocabulary || []
        };

        return story;
    }

    private safeJsonParse(text: string): any {
        try {
            const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(clean);
        } catch (e) {
            console.error("JSON Parse Error in StoryWriter:", text);
            return {};
        }
    }
}

export const STORY_WRITER = new StoryWriterEngine();
