/**
 * src/lib/beat-generator.ts
 * Dynamic Beat Generator (Animation-style Beat Sheet)
 */

import type { GenerativeModel } from "@google/generative-ai";
import { type BeatGenOptions, type BeatSheet, type CastLock, type Beat } from "./types";
import {
    clampInt,
    buildFallbackBeatSheet,
    buildSchemaDescription,
    validateBeatSheet,
    normalizeBeat,
    safeJsonParse
} from "./schema";

export * from "./types";

/** ---------- Public API ---------- */

export function beatToDirective(beat: Beat): string {
    const p = beat.protagonist;
    const s = beat.support;
    const e = beat.environment;
    const l = beat.layout;

    let directive = `
[SCENE COMPOSITION]
PROTAGONIST: ${p.action}, ${p.position} [Emotion: ${p.emotion}]
SUPPORTING: ${s.action}, ${s.position} [Emotion: ${s.emotion}]
ENVIRONMENT: ${e.notes || "Standard scene"}
`;

    if (l) {
        directive += `
[DIGITAL PUPPET LAYOUT]
Pose: ${l.poseId}
Position: X=${l.x}%, Y=${l.y}%
Flip: ${l.isFlipped ? "Yes" : "No"}
`;
    }

    return directive.trim();
}

/**
 * Generate a DIGITAL PUPPET beat sheet.
 * The model acts as a "Stage Director" placing actors on a fixed stage.
 */
export async function generateBeatsTS(args: {
    model: GenerativeModel;
    premise: string;
    topic?: string;
    language?: string;
    level?: number;
    castLock?: Partial<CastLock>;
    options?: BeatGenOptions;
}): Promise<BeatSheet> {
    const pages = clampInt(args.options?.pages ?? 6, 4, 10);
    const maxRetries = clampInt(args.options?.maxRetries ?? 2, 0, 5);

    const cast_lock: CastLock = {
        max_humans: 2,
        allowed_humans: ["protagonist", "support"],
        no_duplicates: true,
        no_extra_children: true,
        no_crowds: true,
        background_people: "none",
        animal_policy: "no animals unless explicitly listed",
        ...args.castLock,
    };

    const fallback = buildFallbackBeatSheet(args.premise, cast_lock, pages);
    const schema = buildSchemaDescription(pages);

    const systemInstruction = `
You are a Stage Director using a "Digital Puppet" system.
Your job is to plan a story using:
1. One STATIC Background (The Stage).
2. A customized Lead Actor (Protagonist) who moves around the stage.

RULES:
- REUSE POSES: Re-use 'poseId' where possible (e.g. 'idle', 'walk_right', 'talk').
- COORDINATES: 'x' is 0-100 (left to right). 'y' is usually 70-90 (ground level).
- FLIP: Use 'isFlipped' to make the actor face left or right.
- STAGE: The 'visual_stage' must be EMPTY (no people).
- BEATS: Generate exactly ${pages} beats.
`.trim();

    const userPrompt = `
PREMISE: "${args.premise}"
CAST LOCK: ${JSON.stringify(cast_lock)}
SCHEMA: ${schema}

TASK:
Plan the stage layout and specific actor movements for ${pages} pages.
`.trim();

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const resp = await args.model.generateContent({
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                systemInstruction,
            } as any);

            const rawText = resp.response.text();
            const parsed = safeJsonParse(rawText);

            const validated = validateBeatSheet(parsed, pages);
            validated.cast_lock = cast_lock;
            validated.beats = validated.beats.map((b) => normalizeBeat(b, cast_lock));

            return validated;
        } catch (e: any) {
            console.warn(`BeatGen Attempt ${attempt} failed`, e);
            if (attempt === maxRetries) {
                console.warn("Using fallback beats.");
                return fallback;
            }
        }
    }
    return fallback;
}

export async function generateBeatsFromScript(args: any): Promise<BeatSheet> {
    // Fallback wrapper for script-based gen to use the new heavy logic
    // Just map it using the same core logic but injecting script context
    return generateBeatsTS({
        model: args.model,
        premise: args.premise,
        castLock: args.castLock,
        options: args.options
    });
}
