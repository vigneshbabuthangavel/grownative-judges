
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY found in .env.local");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("🔄 Fetching available models...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init to access client if needed, or usually listModels isn't on the instance directly in some SDK versions, but let's try the standard verify.

        // Note: The Node SDK might not expose listModels easily on the client instance in all versions.
        // Instead, we'll try to probe specific known bleeding-edge models to see which ones don't throw 404.

        const candidates = [
            "gemini-2.0-flash-exp", // The known 'next gen' flash
            "gemini-exp-1206",     // Experimental model
            "gemini-1.5-flash",    // Workhorse
            "gemini-1.5-flash-8b", // Faster variant
            "gemini-1.5-pro",
            // Speculative Gemini 3 names based on user input
            "gemini-3.0-flash-exp",
            "gemini-3.0-flash-preview",
            "gemini-3.0-flash"
        ];

        console.log("\n🧪 Probing Model Availability for Hackathon config:\n");

        for (const modelName of candidates) {
            try {
                const m = genAI.getGenerativeModel({ model: modelName });
                // Try a minimal content generation to prove access
                const result = await m.generateContent("Test");
                console.log(`✅ ${modelName}: AVAILABLE (Response: ${result.response.text().substring(0, 10)}...)`);
            } catch (e) {
                let msg = e.message;
                if (e.message.includes("404")) msg = "NOT FOUND (404)";
                if (e.message.includes("400")) msg = "BAD REQUEST (Possibly Not Supported)";
                if (e.message.includes("API key")) msg = "AUTH ERROR";
                console.log(`❌ ${modelName}: ${msg}`);
            }
        }

    } catch (e) {
        console.error("Fatal Error:", e);
    }
}

checkModels();
