
// Mocking the SAGA_ENGINE logic directly to verify fixes without build chain issues
const SAGA_ENGINE = {
    constructSagaPrompt: (pageIndex, sentence, saga, heroImage) => {
        // SAFETY: Handle loose schema from LLM
        if (!saga) return { prompt: "Error: SAGA Blueprint is missing." };

        const sequence = saga.story_sequence || saga.sequence || [];
        // Normalize page finding (handle 0-index vs 1-index vs panel_id)
        // The fix logic:
        const targetPage = pageIndex + 1;
        const pageData = sequence.find((p) => (p.page === targetPage) || (p.panel_id === targetPage));

        if (!pageData) {
            // Fallback: Try index access if page numbers are messy
            const fallback = sequence[pageIndex];
            if (fallback) {
                return SAGA_ENGINE.constructSagaPromptInternal(pageIndex, fallback, saga);
            }
            return { prompt: `Error: Page ${targetPage} not found in SAGA blueprint.` };
        }

        return SAGA_ENGINE.constructSagaPromptInternal(pageIndex, pageData, saga);
    },

    constructSagaPromptInternal: (pageIndex, pageData, saga) => {
        const actorsData = saga.actor_registry || saga.actors || {};
        const actors = Array.isArray(actorsData)
            ? actorsData.map((a) => "ACTOR [" + a.id + "]: " + JSON.stringify(a.DNA) + " " + JSON.stringify(a.wardrobe)).join("\n")
            : Object.values(actorsData).map((a) => "ACTOR [" + a.id + "]: " + a.traits + " (State: " + a.state + ")").join("\n");

        const propsData = (saga.prop_manifest && saga.prop_manifest.LOCKED_PROPS) || [];
        const props = propsData.map((p) =>
            "PROP [" + p.id + "] PARENTED TO [" + p.parent + "] via [" + p.grip + "]"
        ).join("\n");

        const globalStyle = (saga.global_locks && saga.global_locks.style_engine) || (saga.meta && saga.meta.style_lock) || "Pixar-esque 3D";
        const environment = (saga.global_locks && saga.global_locks.environmental_anchors) || (saga.environment && saga.environment.visuals) || {};

        const vectorLogic = pageData.motion_vector ? "MOTION VECTOR: " + pageData.motion_vector : "MOTION: Static/Stabilized";
        const zoning = pageData.zoning ? "ZONE: " + pageData.zoning : "COMPOSITION: " + (pageData.composition || "Balanced");

        let specificInteraction = "";
        if (pageData.lock_state && saga.interaction_rules) {
            if (pageData.lock_state === "HAND_HOLD_LOCKED") {
                specificInteraction = "PHYSICS LOCK: " + (saga.interaction_rules.hand_lock || "Hand hold active");
            }
        }

        const envDesc = typeof environment === 'string' ? environment : JSON.stringify(environment);

        return {
            prompt: `
FRAME: Page ${pageData.page || pageData.panel_id} // Beat: ${pageData.beat || pageData.narrative_beat}
ACTION: ${pageData.action}

[1. GLOBAL STYLE LOCK]
Style: ${JSON.stringify(globalStyle)}

[2. SCENE ANCHORS]
Environment: ${envDesc}

[3. ACTOR REGISTRY (IMMUTABLE)]
${actors}

[4. PROP PHYSICS]
${props}

[5. SHOT COMPOSITION]
${zoning}
${vectorLogic}
Focus: ${pageData.focus || pageData.visual_weight || "Balanced"}

[6. INTERACTION LOGIC]
${specificInteraction}

INSTRUCTION: Render this exact frame using the locked assets. Ensure strict continuity.
        `.trim()
        };
    }
};

const mockSaga = {
    "meta": {
        "title": "Arun's Crossing",
        "style_lock": "Pixar-esque",
        "cultural_context": "Tamil Nadu"
    },
    "actors": [],
    "environment": {},
    "sequence": [
        {
            "panel_id": 1,
            "narrative_beat": "Introduction",
            "action": "Arun walking."
        },
        {
            "panel_id": 2,
            "narrative_beat": "The Threat",
            "action": "Cars fast."
        }
    ]
};

console.log("--- TEST SAGA PARSING (JS STANDALONE) ---");
const p0 = SAGA_ENGINE.constructSagaPrompt(0, { english: "text" }, mockSaga);
console.log("Page 0 (Target 1):", p0.prompt.includes("Error:") ? "FAIL" : "SUCCESS");
if (p0.prompt.includes("Error:")) console.log(p0.prompt);

const p1 = SAGA_ENGINE.constructSagaPrompt(1, { english: "text" }, mockSaga);
console.log("Page 1 (Target 2):", p1.prompt.includes("Error:") ? "FAIL" : "SUCCESS");
if (p1.prompt.includes("Error:")) console.log(p1.prompt);
