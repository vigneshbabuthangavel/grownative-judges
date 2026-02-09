
import { models } from "../lib/gemini-api";

async function run() {
    console.log("Testing Imagen Timeout (expecting 60s failure)...");
    const start = Date.now();
    try {
        await models.imagen.generateContent([{ text: "Test prompt for timeout verification" }]);
        console.log("Success (Unexpected if mocking slow network)");
    } catch (e: any) {
        const duration = (Date.now() - start) / 1000;
        console.log(`Caught Error after ${duration}s:`, e.message);
    }
}

run();
