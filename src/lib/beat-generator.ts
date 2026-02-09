
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Beat {
    page: number;
    action: string;
    environment: {
        notes: string;
        timeOfDay?: string;
        weather?: string;
    };
    camera: {
        shotType: "Wide" | "Medium" | "Close-Up" | "Extreme Close-Up";
        angle: "Eye-Level" | "Low Angle" | "High Angle" | "Over-the-Shoulder";
        focus: string;
    };
    blocking: {
        protagonist: string;
        support: string;
        props?: string; // e.g. "Red backpack, Wooden cane"
    };
    // SAGA V2: SPATIAL & DEPTH ENGINE
    zoning?: {
        protagonist: "Zone A" | "Zone B-1" | "Zone B-2" | "Zone C";
        support: "Zone A" | "Zone B-1" | "Zone B-2" | "Zone C" | "Off-Screen";
        // Zone A = Left (Start), Zone B-1 = Road (Danger), Zone B-2 = Crossing (Safe), Zone C = Right (Goal)
    };
    depth?: {
        focus: string; // The primary subject (Sharp) - Z1
        midground: string; // Secondary elements (Standard) - Z2
        background: string; // Background/Atmosphere (Bokeh/Clutter) - Z3
    };
    // NEW GRANULAR CONTEXT FIELDS
    interaction?: {
        contact_point?: string; // e.g. "Palm-to-Palm", "Hand-on-Wrist"
        tension?: string; // e.g. "Tight Grip", "Gentle Support"
    };
    micro_expression?: {
        protagonist?: string; // e.g. "Brows knitted, eyes wide"
        support?: string; // e.g. "Soft smile, relieving tension"
    };
    dynamics?: {
        movement_vector?: string; // e.g. "Walking Left-to-Right", "Static Standing"
    };
}

export interface BeatSheetResult {
    project_settings?: {
        shot_type_lock?: string;
        resolution_limit?: string;
        target_file_size?: string;
        spatial_logic?: string;
    };
    beats: Beat[];
}

// ... existing generateBeatsFromScript ... 
// I will keep the original function but I need to REWRITE the file to export both or just update it.
// Ideally I append the new function.

export async function generateBeatsFromScript(params: {
    model: { generateContent: (prompt: string) => Promise<any> },
    script: any[],
    premise: string,
    castLock?: any,
    options?: { strictCamera?: boolean }
}): Promise<BeatSheetResult> {
    const { model, script, premise, castLock } = params;

    const prompt = `
        ACT AS A CINEMATOGRAPHER (SAGA V2 ENGINE).
        
        Input: Story Script (${script.length} pages).
        Premise: ${premise}
        Cast: ${JSON.stringify(castLock || "Standard Cast")}
        
        TASK: Create a VISUAL BEAT SHEET with STRICT SPATIAL LOGIC.
        
        [1. SPATIAL ZONES (X-AXIS)]
        - Zone A (LEFT): Start Point / Pavement / Home Side.
        - Zone B-1 (CENTER-A): The Road / Danger Zone. (Action: Waiting to cross, Looking, Traffic).
        - Zone B-2 (CENTER-B): The Zebra Crossing / Safety Zone. (Action: Walking on stripes).
        - Zone C (RIGHT): Destination / School Side / Opposite Pavement.
        
        [2. DEPTH PRIORITY (Z-AXIS)]
        - Z-Index 1 (FOCUS): Hero & Key Action. MUST be sharp.
        - Z-Index 2 (CONTEXT): Supports, Traffic, Signals. Standard focus.
        - Z-Index 3 (ATMOSPHERE): Shops, Temple, Trees. MUST BE 'Bokeh' / 'Soft Focus' to reduce clutter.
        
        [3. SPOTLIGHT RULE]
        - MAX 2 ACTORS in Z-Index 1/2.
        - If 3rd character exists, push to Z-Index 3 or Off-Screen.
        
        Output JSON STRICTLY:
        {
          "project_settings": {
            "shot_type_lock": "Wide Shot Only",
            "resolution_limit": "500px",
            "spatial_logic": "Sidewalk A -> Crossing -> Sidewalk B"
          },
          "beats": [
            {
              "page": 1,
              "action": "Wide shot. Arun waiting at Zone A. Traffic in Zone B-1.",
              "zoning": { "protagonist": "Zone A", "support": "Zone A" },
              "depth": { 
                "focus": "Arun (Protagonist) - Z1", 
                "midground": "Grandfather, Waiting Traffic - Z2", 
                "background": "Temple Gopuram (Blurred) - Z3" 
              },
              "environment": { "notes": "Busy morning", "timeOfDay": "Morning" },
              "camera": { "shotType": "Wide", "angle": "Eye-Level", "focus": "Protagonist" },
              "blocking": { 
                "protagonist": "Left Pavement", 
                "support": "Next to him",
                "props": "Red backpack"
              }
            }
          ]
        }
        
        Script: ${JSON.stringify(script)}
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(clean);
    } catch (e) {
        console.error("Beat Generation Failed", e);
        // Fallback
        return {
            beats: script.map((_, i) => ({
                page: i + 1,
                action: "Story action",
                environment: { notes: "Story setting" },
                camera: { shotType: i === 0 ? "Wide" : "Medium", angle: "Eye-Level", focus: "Action" },
                blocking: { protagonist: "Center", support: "Nearby" },
                zoning: { protagonist: "Zone A", support: "Zone A" },
                depth: { focus: "Hero", midground: "Context", background: "Background" }
            }))
        };
    }
}

/**
 * PHASE 3.5: STORY-BEAT RECONCILIATION
 * STRICTLY audits the visual beat against the narrative text.
 */
export async function refineBeatsWithStory(params: {
    model: { generateContent: (prompt: string) => Promise<any> },
    script: any[],
    originalBeats: BeatSheetResult,
    premise: string
}): Promise<BeatSheetResult> {
    const { model, script, originalBeats, premise } = params;

    const prompt = `
        ACT AS A CONTINUITY SUPERVISOR AND LOGIC ENGINE.
        
        TASK: RECONCILE the Visual Beats with the Story Narrative.
        The Visual Beats often drift and miss specific physical actions described in the text.
        
        INPUT:
        1. Story Script (The Source of Truth): ${JSON.stringify(script)}
        2. Draft Visual Beats: ${JSON.stringify(originalBeats.beats)}
        
        MANDATE:
        For EACH page, compare the Story Sentence verbs against the Visual Beat.
        IF the Story says "He crosses", but Beat says "Sidewalk", YOU MUST FIX THE BEAT.
        
        ADD GRANULAR CONTEXT (REQUIRED):
        1. INTERACTION PHYSICS: If handling/touching, specify contact_point (e.g. "Wrist", "Palm") and tension.
        2. MICRO-EXPRESSIONS: Specific face cues (e.g. "Lips tight", "Eyes wide"). NO generic emojis.
        3. DYNAMICS: Movement vector (e.g. "Forward strut", "Static lean").
        
        STRICT RULES:
        - "Crossing the road" = Zone MUST be "Zebra Crossing".
        - "Holding hands" = Interaction MUST be "Palm-to-Palm" or "Grip".
        - "Looking at" = Micro-expression must match the gaze.
        
        Output:
        Return the COMPLETELY REVISED BeatSheetResult JSON.
        
        STRUCTURE (STRICTLY FOLLOW THIS):
        {
          "beats": [
             {
               "page": 1,
               ... (all original fields),
               "blocking": { ... "zone_lock": "Sidewalk A" }, // Example: Use actual calculated zone
               "interaction": { "contact_point": "Wrist", "tension": "Gentle" }, // Example values
               "dynamics": { "movement_vector": "Forward" }
             }
          ]
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(clean);

        if (!parsed.beats) {
            console.error("Refinement Loop: Model returned JSON without 'beats' array.", clean.substring(0, 100));
            return originalBeats;
        }

        return parsed;
    } catch (e) {
        console.error("Beat Refinement Failed", e);
        return originalBeats; // Fail safe
    }
}

export function beatToDirective(beat: Beat): string {
    if (!beat) return "";

    // Construct the directive with the new granular fields
    const interaction = beat.interaction ? `\nPhysics: [Contact: ${beat.interaction.contact_point || "None"}] [Tension: ${beat.interaction.tension || "N/A"}]` : "";
    const expressions = beat.micro_expression ? `\nMicro-Expressions: [Protagonist: ${beat.micro_expression.protagonist || "Neutral"}] [Support: ${beat.micro_expression.support || "Neutral"}]` : "";
    const dynamics = beat.dynamics ? `\nDynamics: ${beat.dynamics.movement_vector || "Static"}` : "";

    // SAGA V2 ZONING
    const zoneProtagonist = beat.zoning?.protagonist ? `[Zone: ${beat.zoning.protagonist}]` : "";
    const zoneSupport = beat.zoning?.support ? `[Zone: ${beat.zoning.support}]` : "";

    // SAGA V2 DEPTH
    const depthInfo = beat.depth ? `\nDepth: [Z1 Focus: ${beat.depth.focus}] [Z3 BG: ${beat.depth.background} (Blurred)]` : "";

    return `
[SHOT PLAN DIRECTIVE]
Visual Action: ${beat.action}
Shot Type: ${beat.camera?.shotType || "Medium"}
Camera Angle: ${beat.camera?.angle || "Eye-Level"}
Focus: ${beat.camera?.focus || "Action"}
Blocking: ${beat.blocking?.protagonist || "Left"} ${zoneProtagonist} / ${beat.blocking?.support || "Right"} ${zoneSupport}
Locked Props: ${beat.blocking?.props || "None"}
Continuity Note: ${beat.environment?.notes || ""}
${interaction}
${expressions}
${dynamics}
${depthInfo}
`.trim();
}
