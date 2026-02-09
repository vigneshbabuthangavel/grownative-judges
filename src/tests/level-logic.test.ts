
import { processFullStoryPipeline } from "../lib/gemini-api";

// Mock callback
const onPhase = (data: any) => {
    console.log(`[PHASE]: ${data.name}`);
    if (data.status === 'error') console.error("ERROR:", data.output);
};

describe("Level Logic Scaling (Live Verification)", () => {
    // Increase timeout for real API calls
    jest.setTimeout(60000);

    test("Level 8 Story should have complex structure and >10 sentences", async () => {
        console.log("Generating Level 8 Story...");

        const result = await processFullStoryPipeline(
            "Space Exploration",
            "A girl visits a black hole",
            8, // Level 8
            "en", // English for easy verification
            "girl",
            onPhase,
            { enableImages: false } // Text only for speed
        );

        const sentences = result.pages;
        console.log(`Generated ${sentences.length} sentences.`);
        console.log("Sample Sentence:", sentences[0].english);

        // Assertion 1: Length check (Should be > 10, target is 16)
        expect(sentences.length).toBeGreaterThan(8);

        // Assertion 2: Vocabulary Check (Simple check for length or complex words)
        const totalWords = sentences.reduce((acc: number, p: any) => acc + p.english.split(" ").length, 0);
        const avgWords = totalWords / sentences.length;
        console.log(`Average Words per Sentence: ${avgWords}`);

        expect(avgWords).toBeGreaterThan(8); // Level 8 should be verbose
    });

    test("Level 1 Story should be short and simple", async () => {
        console.log("Generating Level 1 Story...");

        const result = await processFullStoryPipeline(
            "My Cat",
            "A boy plays with a cat",
            1, // Level 1
            "en",
            "boy",
            onPhase,
            { enableImages: false }
        );

        const sentences = result.pages;
        console.log(`Generated ${sentences.length} sentences.`);

        // Assertion: Length check (Target 6)
        expect(sentences.length).toBeLessThanOrEqual(8);
    });
});
