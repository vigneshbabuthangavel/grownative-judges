
import { SAGA_ENGINE } from './src/lib/saga-schema';

const mockBlueprint = {
    "global_locks": {
        "style_engine": "Pixar Style",
        "environmental_anchors": { "location": "Street" }
    },
    "actor_registry": {
        "PROT_ARUN": {
            "id": "PROT_ARUN",
            "traits": "8yo Tamil boy, blue shirt",
            "wardrobe": { "top": "Blue Shirt" }
        },
        "SUPP_THATHA": {
            "id": "SUPP_THATHA",
            "traits": "70yo man, white dhoti",
            "wardrobe": { "top": "White Shirt" }
        }
    },
    "prop_manifest": { "LOCKED_PROPS": [] },
    "story_sequence": [
        {
            "page": 1,
            "page_number": 1,
            "narrative_beat": "Intro",
            "action": "PROT_ARUN walks down the street. He sees SUPP_THATHA.",
            "zoning": "Center",
            "motion_vector": "Static"
        }
    ]
};

console.log("--- SIMULATION START ---");
const result = SAGA_ENGINE.constructSagaPrompt(0, {}, mockBlueprint);
console.log(result.prompt);
console.log("--- SIMULATION END ---");

// Check for Context Injection
if (result.prompt.includes("[VISUAL CONTEXT (PROT_ARUN)")) {
    console.log("SUCCESS: PROT_ARUN Context Injected");
} else {
    console.log("FAILURE: PROT_ARUN Context MISSING");
}
