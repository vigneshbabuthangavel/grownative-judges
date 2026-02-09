
// ==========================================
// SAGA (State-Aware Generative Architecture)
// ==========================================

export interface SagaSchema {
    project: string;
    version: string;
    meta_info: {
        story_id: string;
        culture: string;
        total_pages: number;
        framework: string;
        spatial_logic: string;
    };
    global_locks: {
        style_engine: {
            renderer: string;
            lens: string;
            lighting: string;
            forbidden: string[];
        } | string;
        environmental_anchors: {
            Anchor_A_Left: string;
            Anchor_B_Center: string;
            Anchor_C_Right: string;
            background_dynamics: {
                vehicles: string;
                density: string;
                vibe: string;
            };
        } | any;
    };
    actor_registry: Record<string, {
        id: string;
        traits: string;
        shape_language?: string;
        state?: string;
    }>;
    prop_manifest: {
        LOCKED_PROPS: Array<{
            id: string;
            parent: string;
            grip: string;
            persistence?: string;
            description?: string;
        }>;
    };
    interaction_rules: Record<string, string>;
    story_sequence: Array<{
        page: number;
        beat: string;
        zoning: string;
        action: string;
        visual_weight?: string;
        prop_focus?: string;
        motion_vector?: string;
        lock_state?: string;
        visual_hierarchy?: string;
        emotion?: string;
        visual_cue?: string;
        panel_id?: number;
        narrative_beat?: string;
        focus?: string;
        composition?: string;
    }>;
}

/**
 * Normalizes actor data to a consistent structure regardless of input schema (dna, traits, wardrobe).
 */
/**
 * Normalizes actor data to a consistent structure regardless of input schema (dna, traits, wardrobe).
 */
function normalizeActor(val: any, sagaId: string): { id: string, name: string, traits: string, age: string } {
    const name = val.name || "Character";
    const age = val.age || "Ageless";

    let dnaObj: any = {};
    if (val.dna) {
        dnaObj = val.dna;
    } else if (val.DNA && typeof val.DNA === 'object') {
        dnaObj = val.DNA;
    }

    let traitsParts: string[] = [];
    if (Object.keys(dnaObj).length > 0) {
        // UNIVERSAL DNA MAPPING: Capture all properties for both humans and creatures
        Object.entries(dnaObj).forEach(([key, value]) => {
            if (key === 'clothing' || key === 'wardrobe') return;
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                traitsParts.push(`${key}: ${value}`);
            } else if (typeof value === 'object' && value !== null) {
                const subTraits = Object.entries(value)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ");
                if (subTraits) traitsParts.push(`${key}: ${subTraits}`);
            }
        });

        const clothing = dnaObj.clothing || val.clothing || val.wardrobe || {};
        if (typeof clothing === 'object') {
            const clothes = Object.entries(clothing)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ");
            if (clothes) traitsParts.push(`wearing ${clothes}`);
        } else if (clothing) {
            traitsParts.push(`wearing ${clothing}`);
        }
    } else {
        // Fallback for technical/legacy strings (traits or visual keys)
        const fallback = val.traits || val.visual || "";
        const wardrobe = val.wardrobe || val.clothing || "";
        if (fallback) traitsParts.push(fallback);
        if (wardrobe) traitsParts.push(`wearing ${typeof wardrobe === 'string' ? wardrobe : JSON.stringify(wardrobe)}`);
    }

    const traits = traitsParts.join(", ");
    return { id: sagaId, name, traits, age };
}


export const SAGA_ENGINE = {
    /**
     * Constructs the "Technical Director" instructions for the Image Model
     * strictly adhering to the SAGA constraints.
     */
    constructSagaPrompt: (pageIndex: number, sentence: any, saga: any, heroImage?: any) => {
        // SAFETY: Handle loose schema from LLM
        if (!saga) throw new Error("SAGA Blueprint is missing.");

        const sequence = saga.story_sequence || saga.sequence || [];
        // Normalize page finding (handle 0-index vs 1-index vs panel_id)
        const targetPage = pageIndex + 1;
        const pageData = sequence.find((p: any) => (p.page === targetPage) || (p.panel_id === targetPage) || (p.page_index === pageIndex));

        if (!pageData) {
            // Fallback: Try index access if page numbers are messy
            const fallback = sequence[pageIndex];
            if (fallback) {
                return SAGA_ENGINE.constructSagaPromptInternal(pageIndex, fallback, saga, !!heroImage);
            }
            throw new Error(`Page ${targetPage} not found in SAGA blueprint (Sequence len: ${sequence.length}).`);
        }

        return SAGA_ENGINE.constructSagaPromptInternal(pageIndex, pageData, saga, !!heroImage);
    },

    constructSagaPromptInternal: (pageIndex: number, pageData: any, saga: any, hasHeroReference: boolean = false) => {
        // Robust Actor Registry Discovery (Support both legacy SAGA and UnifiedStory schemas)
        const actorsData = saga.actor_registry ||
            saga.actors ||
            saga.visual_definition?.actors ||
            {};

        // 1. Generate Actor Manifest for Registry
        const actors = Array.isArray(actorsData)
            ? actorsData.map((a: any) => {
                const norm = normalizeActor(a, a.id);
                return `* ${norm.id} (${norm.name}, ${norm.age}): ${norm.traits}`;
            }).join("\n")
            : Object.entries(actorsData).map(([key, val]: [string, any]) => {
                const norm = normalizeActor(val, key);
                return `* ${norm.id} (${norm.name}, ${norm.age}): ${norm.traits}`;
            }).join("\n");

        // DYNAMIC PROP FILTERING (Stateful + Regex Fallback)
        const hiddenProps = new Set<string>();
        const propState = pageData.prop_state || {};

        // 1. Structured State Check
        Object.entries(propState).forEach(([id, state]: [string, any]) => {
            if (state.visible === false) {
                hiddenProps.add(id);
            }
        });

        // 2. Regex Check (Backwards Compat)
        const actionText = pageData.action || "";
        const hiddenMatches = actionText.match(/\[(\w+):\s*HIDDEN\]/g);
        if (hiddenMatches) {
            hiddenMatches.forEach((tag: string) => {
                const id = tag.replace('[', '').replace(']', '').split(':')[0].trim();
                hiddenProps.add(id);
            });
        }

        const propsObject = saga.prop_manifest?.LOCKED_PROPS ||
            saga.props ||
            saga.visual_definition?.props ||
            {};

        const propsData = Array.isArray(propsObject) ? propsObject : Object.values(propsObject);

        const props = propsData
            .filter((p: any) => !hiddenProps.has(p.id || p.name)) // REMOVE HIDDEN PROPS
            .map((p: any) => {
                // INJECT STATE CONTEXT (Position/Scale)
                const state = propState[p.id || p.name];
                const context = state ? ` [STATE: ${state.position || "Default Pos"} | ${state.scale_override || "Default Scale"}]` : "";
                return `* ${p.id || p.name} (${p.description || "Prop"}${context}) parented to ${p.parent || "None"} via ${p.grip || "Surface"}`;
            }).join("\n");

        // Add Negative Prompt for Hidden Items
        const negativePrompt = hiddenProps.size > 0
            ? `Rule: DO NOT RENDER the following hidden items: ${Array.from(hiddenProps).join(", ")}.`
            : "";

        // Unwrap style if it's an object/string
        let globalStyle = saga.global_locks?.style_engine ||
            saga.visual_definition?.style_engine ||
            saga.meta?.style_lock ||
            "Pixar-esque 3D";

        if (typeof globalStyle === 'object') globalStyle = Object.values(globalStyle).join(", ");

        const environment = saga.global_locks?.environmental_anchors ||
            saga.visual_definition?.environment ||
            saga.environment?.visuals ||
            {};

        const envDesc = typeof environment === 'string' ? environment
            : `Location: ${environment.location || environment.primary_location || "Generic"}. Lighting: ${environment.lighting || "Neutral"}`;

        const vectorLogic = pageData.motion_vector ? `Camera Movement: ${pageData.motion_vector}` : "Camera: Static";

        // SAGA V2: SPATIAL TRANSLATOR (Zoning)
        let zoning = "Composition: Balanced";
        if (pageData.zoning) {
            // Check if zoning is an object (Protagonist/Support) or string
            if (typeof pageData.zoning === 'object') {
                const z = pageData.zoning;
                const pZone = z.protagonist || "Center";
                const zones: Record<string, string> = {
                    "Zone A": "LEFT THIRD OF FRAME. Camera Pans LEFT.",
                    "Zone B-1": "CENTER FRAME. Wide Road Shot.",
                    "Zone B-2": "CENTER FRAME (SYMMETRIC). Focus on Crossing details.",
                    "Zone C": "RIGHT THIRD OF FRAME. Camera Pans RIGHT."
                };

                zoning = `
[SPATIAL LOCK - ${pZone}]
CAMERA: ${zones[pZone] || "Standard Wide Shot"}
Protagonist Position: FIXED to ${pZone}.
Support Position: ${z.support === "Off-Screen" ? "NOT RENDERED (Off-Screen)" : `Relative to ${pZone}`}.
`;
            } else {
                // FALLBACK: Handle string input (e.g. from Legacy/Fallback or LLM hallucination)
                const val = (pageData.zoning || "Center").toString();
                // Map to required signature
                let mapped = "CENTER FRAME";
                if (val.toLowerCase().includes("left")) mapped = "LEFT THIRD OF FRAME";
                if (val.toLowerCase().includes("right")) mapped = "RIGHT THIRD OF FRAME";

                zoning = `
[SPATIAL LOCK - Derived]
CAMERA: ${mapped}
Composition: ${val}
`;
            }
        } else {
            // NO ZONING DATA -> DEFAULT TO CENTER
            zoning = `
[SPATIAL LOCK - Default]
CAMERA: CENTER FRAME
Composition: Balanced Center
`;
        }

        // SAGA V2: DEPTH TRANSLATOR (Z-Indexing)
        // ALWAYS GENERATE DEPTH LOCK (Use defaults if missing)
        const depth = pageData.depth || {};
        const depthDirective = `
[DEPTH PRIORITY - Z-INDEXING MASTER]
Z-Index 1 (FOREGROUND - SHARP): ${depth.focus || "Main Action / Character"}
Z-Index 2 (MIDGROUND - STANDARD): ${depth.midground || "Intermediate Context"}
Z-Index 3 (BACKGROUND - BLURRED): ${depth.background || "Environment Details"}
INSTRUCTION: Apply cinematic depth of field. Z1 is the SUBJECT. Z3 must have BOKEH effect.
`;

        // Interaction Logic
        let specificInteraction = "";
        if (pageData.lock_state && saga.interaction_rules) {
            specificInteraction = `Interaction Lock: ${pageData.lock_state}`;
        }

        // Context Injection: Reinforce Actor Traits in the Action block
        let actionWithContext = pageData.action || "";

        // SCAN BOTH ACTION AND BLOCKING (Comprehensive Reinforcement)
        const blockingText = typeof pageData.blocking === 'object' ? JSON.stringify(pageData.blocking) : (pageData.blocking || "");
        const combinedContext = `${actionWithContext} ${blockingText}`;

        if (Array.isArray(actorsData)) {
            actorsData.forEach((a: any) => {
                const norm = normalizeActor(a, a.id);
                injectTraitsIfPresent(norm, combinedContext);
            });
        } else {
            Object.entries(actorsData).forEach(([key, val]: [string, any]) => {
                const norm = normalizeActor(val, key);
                injectTraitsIfPresent(norm, combinedContext);
            });
        }

        function injectTraitsIfPresent(actor: any, context: string) {
            const isIdPresent = context.includes(actor.id);
            const isNamePresent = (actor.name && actor.name !== "Character") ? context.includes(actor.name) : false;

            if (isIdPresent || isNamePresent) {
                if (actor.traits && !actionWithContext.includes(`[VISUAL CONTEXT (${actor.id})`)) {
                    // Backwards-compatible naming: [VISUAL CONTEXT]
                    actionWithContext += ` \n[VISUAL CONTEXT (${actor.id}): ${actor.traits}]`;
                }
            }
        }

        // [RUNTIME LOCK: DYNAMIC CAMERA]
        // Allow the blueprint to define the shot type, but enforce wide shots for establishing if requested.
        const isPage1 = pageIndex === 0;
        const blueprintAction = (pageData.action || "").toLowerCase();
        let cameraLock = "";

        if (isPage1) {
            cameraLock = "[CAMERA: WIDE ANGLE ESTABLISHING SHOT. FULL BODY FRAMING.]";
        } else if (blueprintAction.includes("close up") || blueprintAction.includes("closeup")) {
            cameraLock = "[CAMERA: CLOSE-UP SHOT. FOCUS ON DETAIL/EXPRESSION.]";
        } else if (blueprintAction.includes("medium shot")) {
            cameraLock = "[CAMERA: MEDIUM SHOT. WAIST-UP FRAMING.]";
        } else {
            cameraLock = "[CAMERA: WIDE ANGLE SHOT. SHOW CHARACTER IN ENVIRONMENT.]";
        }

        const referenceHint = hasHeroReference ? `\n[STRICT CONSTRAINT: VISUAL ANCHORING] 
Treat the attached image (Hero Frame) as the ONLY source of truth for:
1. CHARACTER IDENTITY: Use the EXACT face, hair, and clothes of the actors.
2. BACKGROUND: Use the EXACT architectural style, garden features, and colors.
3. LIGHTING: Maintain the same mood and time of day.
IGNORE ANY PREVIOUS ATTEMPTS AT THIS SCENE. Start fresh based on the NEW action below, using the Hero Frame as your visual anchor.` : "";

        // TEMPLATE: SAGA V2 PROMPT
        const promptString = `
[1. GLOBAL STYLE LOCK]
STYLE: ${globalStyle}
Rule: NO photorealism. Maintain consistent animated look.
${negativePrompt}

[2. ASSET REGISTRY]
-- CHARACTERS (STRICT CONSISTENCY REQ) --
${actors}

-- ENVIRONMENT --
${envDesc}

-- PROPS (VISIBLE ONLY) --
${props}

[3. SCENE BLUEPRINT]
Page: ${pageIndex}
Narrative Beat: ${pageData.narrative_beat || "Scene Progress"}

[4. SHOT EXECUTION]
ACTION: ${actionWithContext} ${referenceHint}
${cameraLock}

${zoning}

${depthDirective}

${vectorLogic}

[5. CINEMATOGRAPHY RULES (STRICT)]
- FRAMING: MAINTAIN WIDE/MEDIUM SHOTS. Avoid Close-ups. Show full body language in environment.
- BACKGROUND: REDUCE CLUTTER. Use negative space. Do NOT cram background with vehicles.
- DEPTH: Highlight foreground vs background separation.

INSTRUCTION: Render the ACTION using the defined CHARACTERS and STYLE. Do not deviate from the asset registry.`;

        return {
            prompt: promptString.trim(),
            systemInstruction: "You are the SAGA Render Engine.\n1. Load all assets from the REGISTRY first.\n2. Apply the GLOBAL STYLE.\n3. Render the SHOT EXECUTION strictly.\n4. If an Actor ID (e.g. PROT_01) is mentioned in Action, apply their defined TRAITS exactly."
        };
    },
    verifySagaLocks: (prompt: string): boolean => {
        const requiredLocks = [
            "Z-Index 1 (FOREGROUND", // Depth Lock
            "Z3 must have BOKEH",    // Depth Bokeh Lock
            "NO photorealism"        // Style Lock
        ];

        // 1. Spatial Lock Check (Any direction is valid)
        const hasSpatialLock = prompt.includes("LEFT THIRD OF FRAME") ||
            prompt.includes("CENTER FRAME") ||
            prompt.includes("RIGHT THIRD OF FRAME") ||
            prompt.includes("[SPATIAL LOCK -");

        if (!hasSpatialLock) {
            console.error("[SAGA VERIFY FAIL] Missing Spatial Lock (CENTER/LEFT/RIGHT/ZONE).");
            return false;
        }

        // 2. Camera Lock Check (Dynamic Support)
        const hasCameraLock = prompt.includes("[CAMERA: WIDE ANGLE ESTABLISHING SHOT") ||
            prompt.includes("[CAMERA: WIDE ANGLE SHOT") ||
            prompt.includes("[CAMERA: MEDIUM SHOT") ||
            prompt.includes("[CAMERA: CLOSE-UP SHOT");

        if (!hasCameraLock) {
            console.error("[SAGA VERIFY FAIL] Missing Camera Lock (WIDE/MEDIUM/CLOSE-UP).");
            return false;
        }

        // 3. Other Required Locks
        for (const lock of requiredLocks) {
            if (!prompt.includes(lock)) {
                console.error(`[SAGA VERIFY FAIL] Missing Lock: ${lock}`);
                return false;
            }
        }

        return true;
    }
};
