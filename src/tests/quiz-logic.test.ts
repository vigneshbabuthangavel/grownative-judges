
import { processFullStoryPipeline } from "../lib/gemini-api";

// Mock callback
const onPhase = (data: any) => {
    // console.log(`[PHASE]: ${data.name}`); 
};

describe("Quiz Generation Logic (Live Integration)", () => {
    jest.setTimeout(60000); // Allow time for API calls

    test("Level 1 should generate visual matching questions", async () => {
        console.log("Testing Level 1 Quiz...");
        const result = await processFullStoryPipeline(
            "Zoo Animals", "A girl sees a lion",
            1, "en", "girl", onPhase, { enableImages: false }
        );

        const exercises = result.exercises;
        console.log("Level 1 Exercises:", JSON.stringify(exercises, null, 2));

        expect(exercises.length).toBeGreaterThan(0);
        // Expect at least one visual question
        const hasVisual = exercises.some((e: any) => e.type === "choose_word_for_picture");
        expect(hasVisual).toBe(true);
    });

    test("Level 4 should generate ordering questions", async () => {
        console.log("Testing Level 4 Quiz...");
        const result = await processFullStoryPipeline(
            "Making Tea", "First boil water, then add tea leaves",
            4, "en", "boy", onPhase, { enableImages: false }
        );

        const exercises = result.exercises;
        console.log("Level 4 Exercises:", JSON.stringify(exercises, null, 2));

        expect(exercises.length).toBeGreaterThan(0);
        const hasOrdering = exercises.some((e: any) => e.type === "ordering");
        expect(hasOrdering).toBe(true);
    });
});
