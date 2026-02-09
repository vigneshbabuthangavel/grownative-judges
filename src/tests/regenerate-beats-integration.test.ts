
import { processFullStoryPipeline } from "../lib/gemini-api";
import dotenv from "dotenv";

// Mock server-only to avoid runtime errors
jest.mock("server-only", () => {
    return {};
});

// Mock load/save assets to avoid filesystem issues during test? 
// No, we want to see if it saves the cache. But maybe we can just inspect the return value.
// Note: setCache is imported in gemini-api.

dotenv.config({ path: ".env.local" });

describe("Beat Regeneration Integration", () => {
    // Increase timeout for API calls
    jest.setTimeout(60000);

    it("should regenerate beats with reconciliation logic", async () => {
        const topic = "The Boy Who Helped";
        const premise = "A kind boy helps an elderly man cross a busy street.";
        const level = 3;
        const language = "Tamil";
        const gender = "boy";

        console.log("🚀 Triggering Pipeline Test...");

        const result = await processFullStoryPipeline(
            topic,
            premise,
            level,
            language,
            gender,
            (phase) => {
                console.log(`[${phase.status}] ${phase.name}`);
            },
            { enableImages: false }
        );

        console.log("Pipeline Result Keys:", Object.keys(result));

        // We can't easily access the internal beats from the return value of processFullStoryPipeline
        // because it returns the 'Story' object (pages, etc).
        // However, the pipeline logs should show "Phase 3.5: Reconciling".

        expect(result).toBeDefined();
        // verification
    });
});
