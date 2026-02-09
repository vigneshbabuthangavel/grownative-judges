/** * src/lib/context-cache-api.ts 
 * Explicit Caching for Literacy Contexts
 */
"use server";

import { GoogleAICacheManager } from "@google/generative-ai/server";
import { getCulturalContext, PEDAGOGICAL_RUBRICS } from "./cultural-db";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) console.warn("Missing GEMINI_API_KEY for CacheManager");
const cacheManager = new GoogleAICacheManager(apiKey || "");

/**
 * CONTEXT CACHING: Improves latency by storing repeated tokens
 */
export async function createContextCache(language: string, level: number, anchorData: any) {
    // Note: Explicit caching requires a minimum of 32k tokens to be effective usually but we use it for structure here.
    const modelName = "models/gemini-2.0-flash-exp";

    // High-Density Cultural Payload
    const culturalContext = getCulturalContext(language);

    const systemInstruction = `
        You are an expert native ${language} linguistic architect and Cultural Anthropologist.
        
        CRITICAL INSTRUCTIONS:
        1.  **Linguistic Anchor**: Follow ${JSON.stringify(anchorData)}.
        2.  **Cultural Anchor**: You must STRICTLY adhere to the following cultural reality:
            ${culturalContext}
        3.  **Pedagogical Anchor**: Strictly follow the Reading Level ${level} rubrics below.
            ${PEDAGOGICAL_RUBRICS}
            
        OPERATIONAL RULES:
        -   **Visual Anchor Lock**: If a 'visual_lock' object is provided in the prompt, you MUST enforce its constraints (scene details, character DNA, blocking, and camera rules) for all subsequent generation steps.
        -   If the premise is "Helping an elder", enforce the 'Social Values' defined in the Cultural Anchor.
        -   Use the 'Visual Identity' to describe backgrounds when asked.
        -   Reject any generation that contradicts the 'Structure' defined in the Language Anchor.
        -   Reject any generation that contradicts the 'Structure' defined in the Language Anchor.
    ` + " ".repeat(8000); // 8000 spaces to ensure >2000 tokens for minimum cache size (1 token ~ 4 chars)

    try {
        const cache = await cacheManager.create({
            model: modelName,
            displayName: `${language}_L${level}_StoryCache`,
            systemInstruction: systemInstruction,
            contents: [], // Required by type, even if empty when using systemInstruction predominantly
            ttlSeconds: 3600, // 1 hour cache lifetime
        });

        console.log(`🚀 Cache Created: ${cache.name}`);
        return cache.name;
    } catch (e) {
        console.warn("Caching failed or not supported in this region/key type. Falling back to standard calls.", e);
        return null;
    }
}