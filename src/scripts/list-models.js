const fs = require('fs');
const path = require('path');

try {
    const envPath = path.resolve(__dirname, '../../.env.local');
    const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    console.warn("Could not load .env.local manually", e);
}

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) {
        console.error("No API Key found in env!");
        return;
    }
    console.log("Using Key: " + key.substring(0, 5) + "...");

    // Basic fetch to list models endpoint
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log("✅ AVAILABLE MODELS:");
            data.models.forEach(m => {
                if (m.name.includes("gemini")) console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.error("No models returned or error:", data);
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

listModels();
