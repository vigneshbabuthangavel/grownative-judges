
// Mock SAGA Engine Logic (Mirrored from saga-schema.ts)
const SAGA_ENGINE = {
    constructSagaPrompt: (pageIndex, sentence, saga) => {
        const sequence = saga.story_sequence || saga.sequence || [];
        const pageData = sequence[0]; // Simplified for test
        return SAGA_ENGINE.constructSagaPromptInternal(pageIndex, pageData, saga);
    },

    constructSagaPromptInternal: (pageIndex, pageData, saga) => {
        const actorsData = saga.actor_registry || saga.actors || {};

        // --- LOGIC TO TEST START ---

        let actionWithContext = pageData.action;
        const actorKeys = Object.keys(actorsData);

        console.log("DEBUG: Actor Keys ->", actorKeys);
        console.log("DEBUG: Action String ->", actionWithContext);

        actorKeys.forEach(key => {
            if (actionWithContext.includes(key)) {
                console.log(`DEBUG: HIT! Found ${key} in Action.`);

                let traits = "";
                if (Array.isArray(actorsData)) {
                    const match = actorsData.find((a) => a.id === key);
                    traits = match ? JSON.stringify(match.wardrobe) : "";
                } else {
                    traits = actorsData[key].traits;
                }

                if (traits) {
                    const traitStr = typeof traits === 'string' ? traits : JSON.stringify(traits);
                    const shortTraits = traitStr.length > 200 ? traitStr.substring(0, 200) + "..." : traitStr;
                    actionWithContext += ` \n[VISUAL CONTEXT (${key}): ${shortTraits}]`;
                }
            } else {
                console.log(`DEBUG: MISS! Did not find ${key} in Action.`);
            }
        });

        // --- LOGIC TO TEST END ---

        return { prompt: "ACTION: " + actionWithContext };
    }
};

const mockBlueprint = {
    "actor_registry": {
        "PROT_ARUN": {
            "id": "PROT_ARUN",
            "traits": "8yo Tamil boy"
        }
    },
    "story_sequence": [
        {
            "action": "PROT_ARUN walks down the street."
        }
    ]
};

console.log("--- SIMULATION START ---");
const result = SAGA_ENGINE.constructSagaPrompt(0, {}, mockBlueprint);
console.log(result.prompt);
console.log("--- SIMULATION END ---");

if (result.prompt.includes("[VISUAL CONTEXT (PROT_ARUN)")) {
    console.log("SUCCESS: Context Injected");
} else {
    console.log("FAILURE: Context MISSING");
}
