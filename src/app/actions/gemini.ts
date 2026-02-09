'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing from server environment variables!");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function generateContentServer(modelName: string, prompt: any, options: any = {}) {
    try {
        const modelParams: any = { model: modelName };
        if (options.systemInstruction) {
            modelParams.systemInstruction = options.systemInstruction;
        }

        const model = genAI.getGenerativeModel(modelParams);

        // Handle cached content if passed in options
        if (options.cachedContent) {
            // @ts-ignore - cachedContent is strictly typed in some versions but acceptable here
            model.cachedContent = options.cachedContent;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;

        // Serialize the response text to avoid sending non-serializable objects back to client
        let text = "";
        try {
            text = response.text();
        } catch (e) {
            // If text() fails (e.g. strict safety filter), we might still have candidates
        }

        // Return a simplified serializable object
        return {
            text: text,
            candidates: response.candidates,
            promptFeedback: response.promptFeedback
        };
    } catch (error: any) {
        console.error(`Error in generateContentServer (${modelName}):`, error);
        return {
            error: error.message,
            status: 500
        };
    }
}
