
import { processFullStoryPipeline } from "../src/lib/gemini-api";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function run() {
    console.log("🚀 Starting Regeneration for 'The Boy Who Helped' (Level 3)...");

    const topic = "The Boy Who Helped";
    const premise = "A kind boy helps an elderly man cross a busy street.";
    const level = 3;
    const language = "Tamil";
    const gender = "boy";

    try {
        const result = await processFullStoryPipeline(
            topic,
            premise,
            level,
            language,
            gender,
            (phase) => {
                console.log(`[${phase.status.toUpperCase()}] ${phase.name}`);
                if (phase.status === 'error') console.error(phase.output);
            },
            { enableImages: false } // Only want beats/script
        );

        console.log("✅ Pipeline Complete!");
        // define the path where it ostensibly saves based on cache logic
        // But simpler, let's just inspect the result object's beats if possible or check file system.
        // processFullStoryPipeline returns the final story object, but beats are cached internally.
        // We will manually check the file system after this runs.

    } catch (e) {
        console.error("❌ Pipeline Failed:", e);
    }
}

run();
