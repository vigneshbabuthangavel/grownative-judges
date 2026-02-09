import type { Beat, BeatSheet, CastLock, ShotType, PuppetLayout } from "./types";

/** ---------- Validation + Utilities ---------- */

export function validateBeatSheet(input: any, pages: number): BeatSheet {
    if (!input || typeof input !== "object") throw new Error("BeatSheet: not an object");

    // Auto-migrate v1 to v2 if needed (optional, or just enforce v2)
    // if (input.version === "v1") ...

    if (typeof input.premise !== "string" || !input.premise.trim()) throw new Error("BeatSheet.premise missing");
    if (!input.cast_lock || typeof input.cast_lock !== "object") throw new Error("BeatSheet.cast_lock missing");
    if (!Array.isArray(input.beats)) throw new Error("BeatSheet.beats must be array");
    if (input.beats.length !== pages) throw new Error(`BeatSheet.beats must have exactly ${pages} beats`);

    const beats: Beat[] = input.beats.map((b: any, idx: number) => validateBeat(b, idx, pages));

    // Basic sequential check
    for (let i = 0; i < beats.length; i++) {
        if (beats[i].page !== i + 1) throw new Error(`Beat.page must be sequential starting at 1.`);
    }

    const sheet: BeatSheet = {
        version: "v2_puppet",
        premise: input.premise,
        visual_stage: input.visual_stage, // Optional but recommended
        cast_lock: input.cast_lock as CastLock,
        beats,
    };
    return sheet;
}

function validateBeat(b: any, idx: number, pages: number): Beat {
    if (!b || typeof b !== "object") throw new Error(`Beat[${idx}]: not an object`);
    const page = Number(b.page);

    // Validate Puppet Layout if present
    let layout: PuppetLayout | undefined = undefined;
    if (b.layout) {
        layout = {
            poseId: mustString(b.layout.poseId, `Beat[${idx}].layout.poseId`),
            x: Number(b.layout.x) || 50,
            y: Number(b.layout.y) || 80,
            size: Number(b.layout.size) || 1.0,
            isFlipped: !!b.layout.isFlipped
        };
    }

    // Legacy fields (still required for prompt text generation)
    const protagonist = {
        position: mustString(b.protagonist?.position || "center", `Beat[${idx}].protagonist`),
        action: mustString(b.protagonist?.action || "standing", `Beat[${idx}].protagonist`),
        emotion: (b.protagonist?.emotion === "medium" ? "medium" : "low") as "low" | "medium"
    };

    const support = {
        position: mustString(b.support?.position || "side", `Beat[${idx}].support`),
        action: mustString(b.support?.action || "watching", `Beat[${idx}].support`),
        emotion: (b.support?.emotion === "medium" ? "medium" : "low") as "low" | "medium"
    };

    const environment = {
        notes: typeof b.environment?.notes === "string" ? b.environment.notes : undefined,
    };

    const constraints = Array.isArray(b.constraints) ? b.constraints.filter((x: any) => typeof x === "string" && x.trim()) : [];

    return { page, shot: "WIDE_Action" as any, protagonist, support, environment, constraints, layout };
}

export function normalizeBeat(beat: Beat, cast_lock: CastLock): Beat {
    const required = [
        `exactly ${cast_lock.max_humans} humans only`,
        "no duplicate protagonist",
    ];
    const existing = new Set(beat.constraints.map((c) => c.toLowerCase()));
    const merged = [...beat.constraints];
    for (const r of required) {
        if (!existing.has(r.toLowerCase())) merged.push(r);
    }
    beat.constraints = merged.slice(0, 5);
    return beat;
}

export function buildFallbackBeatSheet(premise: string, cast_lock: CastLock, pages: number): BeatSheet {
    // Stage fallback
    const beats: Beat[] = [];
    const poses = ["idle", "walk_right", "talk", "walk_right", "idle", "talk"];

    for (let i = 0; i < pages; i++) {
        beats.push({
            page: i + 1,
            layout: {
                poseId: poses[i % poses.length],
                x: 20 + (i * 10), // Move slightly right each page
                y: 80,
                size: 1.0,
                isFlipped: false
            },
            protagonist: { position: "stage", action: "acting", emotion: "low" },
            support: { position: "stage", action: "watching", emotion: "low" },
            environment: { notes: "A simple clear stage" },
            constraints: []
        });
    }

    return {
        version: "v2_puppet",
        premise,
        cast_lock,
        beats,
        visual_stage: {
            setting_description: "A simple, clean background setting relevant to the story.",
            style_notes: "Watercolor illustration on white paper texture"
        }
    };
}

export function buildSchemaDescription(pages: number): string {
    return `
{
  "version": "v2_puppet",
  "premise": "string",
  "visual_stage": {
      "setting_description": "Detailed description of the EMPTY background scene (no people). e.g. 'A cozy living room with a red sofa and window'.",
      "style_notes": "e.g. 'Watercolor style on textured paper'"
  },
  "cast_lock": { ... },
  "beats": [
    {
      "page": 1,
      "layout": {
          "poseId": "string (one of: idle, walk, run, talk, happy, sad, surprise)",
          "x": number (0-100, where 0=left edge, 50=center, 100=right edge),
          "y": number (0-100, where 100=bottom edge of paper),
          "size": number (0.5 to 1.5, default 1.0),
          "isFlipped": boolean (false=face right, true=face left)
      },
      "protagonist": { "position": "string", "action": "string", "emotion": "low" | "medium" },
      "support": { "position": "string", "action": "string", "emotion": "low" | "medium" },
      "environment": { "notes": "string" },
      "constraints": ["string"]
    }
  ]
}
  `.trim();
}

export function safeJsonParse(text: string) {
    const clean = String(text || "")
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
    return JSON.parse(clean);
}

function mustString(v: any, label: string): string {
    if (typeof v !== "string" || !v.trim()) return "default";
    return v.trim().slice(0, 160);
}

export function clampInt(n: number, min: number, max: number): number {
    const x = Math.floor(Number(n));
    if (!Number.isFinite(x)) return min;
    return Math.max(min, Math.min(max, x));
}
