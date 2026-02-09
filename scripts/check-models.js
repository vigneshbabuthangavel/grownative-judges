
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    console.error("Error: NEXT_PUBLIC_GEMINI_API_KEY not found in environment (.env.local or .env)");
    process.exit(1);
}

console.log("Using API Key: " + apiKey.substring(0, 5) + "...");

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log(`Fetching models list from: ${url.replace(apiKey, 'HIDDEN_KEY')} ...`);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error occurred:");
            console.error(JSON.stringify(data.error, null, 2));
            return;
        }

        if (!data.models) {
            console.log("No 'models' field in response. Full response:");
            console.log(JSON.stringify(data, null, 2));
            return;
        }

        console.log("\n--- Available Models ---");
        const PRIORITIZED_MODELS = [
            "gemini-2.5-flash",    // New Workhorse
            "gemini-2.5-pro",      // High Intelligence
            "gemini-2.0-flash-exp",
            "gemini-2.0-flash",    // Fast
            "gemini-1.5-flash"     // Fallback
        ];
        const supportedModels = data.models.map(m => {
            const isSupported = m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent");
            return {
                name: m.name,
                displayName: m.displayName,
                supported: isSupported
            };
        });

        supportedModels.sort((a, b) => a.name.localeCompare(b.name));

        supportedModels.forEach(m => {
            console.log(`${m.name} [${m.supported ? 'SUPPORTED' : 'Not for confirm'}]`);
        });

        console.log("\n------------------------");

    } catch (error) {
        console.error("Network or script error:", error);
        process.exit(1);
    }
}

listModels();
