
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
    console.error("NO API KEY FOUND");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const MODEL_MAP = {
    "Architect (Pro/Thinking)": "gemini-2.0-flash-thinking-exp",
    "Workhorse (Flash)": "gemini-2.0-flash-exp",
    "Fallback (Exp 1206)": "gemini-exp-1206"
};

async function checkModels() {
    console.log("🔍 Verifying Project-Specific Models...\n");

    for (const [role, modelName] of Object.entries(MODEL_MAP)) {
        process.stdout.write(`Testing ${role} [${modelName}]... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you online?");
            const response = await result.response;
            const text = response.text();
            if (text) {
                console.log("✅ ONLINE");
            } else {
                console.log("⚠️  Empty Response");
            }
        } catch (e) {
            console.log("❌ FAILED");
            console.log(`   Error: ${e.message.split(']')[1] || e.message}`);
        }
    }
    console.log("\nDone.");
}

checkModels();
