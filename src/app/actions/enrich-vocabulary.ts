'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function enrichVocabularyAction(language: string, level: number, fullText: string) {
    if (!fullText) return { status: 'error', message: "No text provided" };

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });

        const prompt = `
            Analyze this story text (Language: ${language}, Level: ${level}) and extract a COMPREHENSIVE vocabulary glossary.
            
            STORY TEXT:
            "${fullText}"

            GOAL: Identify all "Tier 2" and "Tier 3" words that are valuable for a learner. 
            - Include challenging nouns, verbs, and adjectives.
            - Exclude very basic words (the, is, and, etc.) unless Level 1.
            - Extract at least 15-20 words if possible.

            OUTPUT JSON:
            [
                { 
                    "native": "Word in ${language}", 
                    "transliteration": "Latin script (if non-latin)", 
                    "meaning_en": "English definition",
                    "type": "noun" | "verb" | "adjective" 
                }
            ]
        `;

        const result = await model.generateContent(prompt);
        const jsonText = result.response.text();
        const vocabulary = JSON.parse(jsonText);

        return {
            status: 'success',
            vocabulary: vocabulary
        };

    } catch (e: any) {
        console.error("Vocabulary Enrichment Failed", e);
        return { status: 'error', message: e.message };
    }
}
