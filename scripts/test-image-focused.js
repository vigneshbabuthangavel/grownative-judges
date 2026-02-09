
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

if (fs.existsSync(path.resolve(process.cwd(), '.env.local'))) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
} else {
    dotenv.config();
}

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    const modelNames = ["gemini-3-pro-image-preview", "gemini-2.5-flash-image"];

    for (const modelName of modelNames) {
        console.log(`\n🎨 Testing Model: ${modelName}`);

        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            // Simulating the exact complex prompt from gemini-api.ts
            const visualLock = { style: "cartoon", characters: { boy: "blue shirt" } };
            const page1Action = "Boy walking on road.";
            const complexText = `REFERENCE VISUAL LOCK: ${JSON.stringify(visualLock)}
RENDER THE EXACT SAME CHARACTERS, CLOTHES, HAIR, AND STYLE AS DESCRIBED.
ACTION: ${page1Action}`;

            const prompt = [{ text: complexText }];
            console.log(`Testing Complex Prompt: ${complexText.substring(0, 50)}...`);

            const result = await model.generateContent(prompt);
            const response = await result.response;

            console.log("--- FULL RESPONSE STRUCTURE ---");
            // Log keys to avoid massive text dump if it's text
            if (response.candidates && response.candidates.length > 0) {
                response.candidates.forEach((c, i) => {
                    console.log(`Candidate ${i}:`);
                    if (c.content && c.content.parts) {
                        c.content.parts.forEach((p, j) => {
                            if (p.inlineData) {
                                console.log(`  Part ${j}: [INLINE DATA] Mime: ${p.inlineData.mimeType}, Length: ${p.inlineData.data.length}`);
                            } else if (p.text) {
                                console.log(`  Part ${j}: [TEXT] "${p.text.substring(0, 100)}..."`);
                            }
                        });
                    }
                });
            } else {
                console.log("No candidates found.");
            }

        } catch (e) {
            console.log("❌ FAILED");
            console.log(`   Error: ${e.message}`);
        }
    } // end for loop
} // end run function

run();
