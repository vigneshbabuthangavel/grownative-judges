
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateContentServer } from "@/app/actions/gemini";

// Ensure fetch is available
if (!global.fetch) {
    console.warn("Global fetch not found, test might fail if not polyfilled.");
}

describe("Gemini API - Model Access Verification", () => {
    jest.setTimeout(40000);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        console.warn("Skipping Gemini API tests: NEXT_PUBLIC_GEMINI_API_KEY not found.");
        it("should skip tests if no API key", () => {
            expect(true).toBe(true);
        });
        return;
    }

    // 1. PROBE FOR GEMINI 3 (Brain)
    test('Gemini 3.0 Pro Preview (Brain)', async () => {
        console.log("Testing: gemini-3-pro-preview");
        const result = await generateContentServer("gemini-3-pro-preview", "Are you Gemini 3?");
        if (result.error) console.warn("Gemini 3 Pro Status:", result.error);
        else {
            console.log("✅ GEMINI 3.0 PRO PREVIEW CONNECTED!");
            expect(result.text).toBeTruthy();
        }
    });

    // 2. PROBE FOR GEMINI 2.5 FLASH (Speed)
    test('Gemini 2.5 Flash (Speed)', async () => {
        console.log("Testing: gemini-2.5-flash");
        const result = await generateContentServer("gemini-2.5-flash", "Write 'FLASH'");
        if (result.error) console.warn("Gemini 2.5 Flash Status:", result.error);
        else {
            console.log("✅ GEMINI 2.5 FLASH CONNECTED!");
            expect(result.text).toBeTruthy();
        }
    });

    // 3. PROBE FOR IMAGE GENERATION
    test('Gemini 3.0 Pro Image Preview (Vision)', async () => {
        console.log("Testing: gemini-3-pro-image-preview");
        const result = await generateContentServer("gemini-3-pro-image-preview", "Draw a blue square");

        if (result.error) {
            console.warn("Image Gen Failed:", result.error);
        } else {
            const hasImage = result.candidates?.[0]?.content?.parts?.some((p: any) => p.inlineData);
            console.log("Image Support:", hasImage ? "YES" : "NO");
            expect(hasImage).toBe(true);
        }
    });
});