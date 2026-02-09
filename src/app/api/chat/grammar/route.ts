import { NextResponse } from 'next/server';
import { models } from '@/lib/gemini-api';

declare global {
    var rateLimitMap: Map<string, number[]> | undefined;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, language, context } = body;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const targetLanguage = language || "the target language";

        // Simple Rate Limiting (In-Memory)
        // Note: For production, use Redis/Upstash. This resets on server restart.
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const now = Date.now();
        const windowMs = 60 * 1000; // 1 minute
        const limit = 5; // 5 requests per minute

        if (!globalThis.rateLimitMap) {
            globalThis.rateLimitMap = new Map();
        }

        const requestLog = globalThis.rateLimitMap.get(ip) || [];
        const recentRequests = requestLog.filter((time: number) => now - time < windowMs);

        if (recentRequests.length >= limit) {
            return NextResponse.json(
                { reply: "You're chatting a bit too fast! Please wait a moment while I catch up." },
                { status: 429 }
            );
        }

        globalThis.rateLimitMap.set(ip, [...recentRequests, now]);


        // System Prompt for Strict Scoping
        const systemPrompt = `
        You are a friendly, encouraging language tutor helper for a parent teaching their child ${targetLanguage}.
        Your goal is to explain grammar rules, vocabulary nuances, and cultural context simply.
        
        CRITICAL RULES:
        1. SCOPE: ONLY answer questions related to ${targetLanguage}, grammar, linguistics, learning strategies, and culture.
        2. REFUSAL: If asked about anything else (math, coding, politics, general knowledge), politely say: "I am here to help with ${targetLanguage} and culture only."
        3. TONE: Be encouraging, concise, and use examples relevant to children's stories if possible.
        4. FORMAT: Use Markdown for bolding key terms. Keep answers under 3-4 sentences unless asked for details.
        
        User Context: The parent is viewing the Reference Page.
        Earlier topics: ${context ? JSON.stringify(context) : "None"}
        `;

        const finalPrompt = `${systemPrompt}\n\nParent asks: "${message}"`;

        const result = await models.flash.generateContent(finalPrompt) as any;
        const responseText = result.response.text();

        return NextResponse.json({ reply: responseText });

    } catch (error: any) {
        console.error("Grammar Chat Error:", error);
        return NextResponse.json({ error: "Failed to generate response." }, { status: 500 });
    }
}
