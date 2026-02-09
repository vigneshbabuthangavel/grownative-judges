import { STORY_WRITER } from "../lib/story-writer";

// Mock Culture Context
const mockCulture = {
    values: ["Respect", "Kindness"],
    visual_markers: ["Busy Street", "Auto Rickshaws"],
    naming_conventions: ["Tamil Names"]
};

async function test() {
    console.log("🚀 Testing Story Writer Engine...");

    try {
        const universe = await STORY_WRITER.createStoryUniverse(
            "Buying Dumplings",
            "A boy buys dumplings for his family.",
            2,
            "zh",
            "boy",
            mockCulture
        );

        console.log("✅ Universe Created!");
        console.log("Title:", universe.meta.title);
        console.log("Visual Def (Actor):", universe.visual_definition.actors["PROT_01"].dna.clothing.top);
        console.log("Script Length:", universe.script.sentences.length);
        console.log("Saga Length:", universe.saga_blueprint.sequence.length);

        console.log("Preview English:", universe.script.sentences[0].english);
        console.log("Preview Native:", universe.script.sentences[0].text_native);

    } catch (e) {
        console.error("❌ Test Failed:", e);
    }
}

test();
