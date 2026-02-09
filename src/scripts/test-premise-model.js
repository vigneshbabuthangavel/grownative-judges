const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load Env
try {
    const envPath = path.resolve(__dirname, '../../.env.local');
    const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    console.warn("Could not load .env.local manually", e);
}

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) { console.error("No API Key"); process.exit(1); }

const MODEL_NAME = "gemini-2.5-flash-lite";

async function testModel() {
    console.log(`Testing Model: ${MODEL_NAME}...`);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    try {
        const result = await model.generateContent("Say 'Hello World' if you are working.");
        const text = result.response.text();
        console.log("✅ SUCCESS. Response:", text);
    } catch (e) {
        console.error("❌ FAILED. Error:", e.message);
    }
}

testModel();
