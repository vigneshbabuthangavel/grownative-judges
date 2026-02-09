
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// Mock the imports if necessary, but we want real execution.
// We use relative paths to avoid alias issues if tsconfig-paths isn't loaded.
import { processSagaStoryPipeline } from '../lib/gemini-api';

const run = async () => {
    console.log("🚀 Starting SAGA Live Debug...");
    console.log("🔑 API Key Present:", !!(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY));

    try {
        console.log("--- TEST 1: TEXT ONLY (Logic Check) ---");
        await processSagaStoryPipeline(
            "The Lost Puppy",
            "A boy finds a lost puppy and helps it find its home.",
            3,
            "en",
            "boy",
            (phase: any) => {
                const out = phase.output ? (typeof phase.output === 'string' ? phase.output : "JSON") : "";
                console.log(`[${phase.status}] ${phase.name} ${out ? `-> ${out.substring(0, 50)}...` : ""}`);
                if (phase.status === 'error') console.error("PHASE ERROR:", phase.output);
            },
            { enableImages: false }
        );
        console.log("✅ Text Pipeline Verification Passed");

    } catch (e: any) {
        console.error("❌ CRITICAL FAILURE:", e);
        console.error(e.stack);
    }
};

run();
