
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

async function testModel(modelName) {
    console.log(`\n🎨 Testing Image Gen with: ${modelName}`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = "Draw a cute red backpack.";
        const result = await model.generateContent(prompt);
        const response = await result.response;

        if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
            const part = response.candidates[0].content.parts.find(p => p.inlineData);
            if (part && part.inlineData) {
                console.log(`✅ SUCCESS! Received Image Data (${part.inlineData.mimeType})`);
                return true;
            } else {
                console.log("⚠️  Response received but NO image inlineData found.");
                if (response.candidates[0].content.parts[0].text) {
                    console.log("   TEXT RESPONSE:", response.candidates[0].content.parts[0].text);
                }
                // console.log("Part:", JSON.stringify(response.candidates[0].content.parts, null, 2));
            }
        } else {
            console.log("⚠️  Empty Candidates/Content");
        }
    } catch (e) {
        console.log("❌ FAILED");
        console.log(`   Error: ${e.message}`);
    }
    return false;
}

async function run() {
    // 1. Try the one currently in code
    await testModel("gemini-2.0-flash-exp");

    // 2. Try the one listed in supported models list (Step 225)
    await testModel("gemini-2.0-flash-exp-image-generation");

    // 3. Try standard Imagen 3
    await testModel("imagen-3.0-generate-001");
}

run();
