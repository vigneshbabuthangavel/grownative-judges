/**
 * PROMPT ENGINE (UPDATED): Keyframe Pattern + Strict Physical Anchoring + Shot Plan
 * - Adds: VISUAL_LOCK (Visual Anchor Locking) for absolute character/scene consistency.
 * - Adds: continuity tokens, style lock, camera/shot lock, nervousness restraint, no-readable-text guardrails.
 */

import { beatToDirective, type Beat } from "./beat-generator";
export * from "./saga-schema";

export interface LevelConfig {
  sentenceCount: number;
  wordCountPerSentence: string; // Range string "4-6"
  grammarFocus: string;
  vocabularyTier: string;
  knowledgeDepth: string;
  quizConfig: {
    typeCounts: Record<string, number>; // e.g. { "choose_word_for_picture": 3 }
    focus: string; // "Visual Recognition", "Inference", etc.
  }
}

export const getStoryConfig = (level: number): LevelConfig => {
  // Clamp level 1-8 logic
  const safeLevel = Math.max(1, Math.min(8, level || 1));

  switch (safeLevel) {
    case 1: // Emergent
      return {
        sentenceCount: 6,
        wordCountPerSentence: "3-5",
        grammarFocus: "Simple SV or SVO sentences. Present tense only.",
        vocabularyTier: "High-frequency sight words (dolch list). Concrete nouns.",
        knowledgeDepth: "Surface: Direct correspondence to illustration.",
        quizConfig: {
          typeCounts: { "choose_word_for_picture": 3 },
          focus: "Visual Recognition: Match word to image."
        }
      };
    case 2: // Beginner
      return {
        sentenceCount: 8,
        wordCountPerSentence: "6-8",
        grammarFocus: "Compound sentences using 'and', 'but'. Present continuous tense. Avoid passive voice.",
        vocabularyTier: "Routine actions, basic emotions.",
        knowledgeDepth: "Linear time order only.",
        quizConfig: {
          typeCounts: { "choose_word_for_picture": 2, "fill_blank": 1 },
          focus: "Basic Vocabulary: Action verbs."
        }
      };
    case 3: // Developing
      return {
        sentenceCount: 10,
        wordCountPerSentence: "8-10",
        grammarFocus: "Complex sentences with 'because', 'when', 'if'. Simple past tense.",
        vocabularyTier: "Abstract concepts (courage, friendship). Descriptive adjectives.",
        knowledgeDepth: "Dialogue tags permitted. Cause and effect.",
        quizConfig: {
          typeCounts: { "fill_blank": 2, "vocabulary_match": 1 },
          focus: "Adjectives and Emotions."
        }
      };
    case 4: // Expanding
      return {
        sentenceCount: 12,
        wordCountPerSentence: "10-12",
        grammarFocus: "Compound-complex sentences. Future tense ('will', 'going to').",
        vocabularyTier: "Context-specific vocabulary (e.g., habitat). Adverbs of manner.",
        knowledgeDepth: "Paragraph structure: Topic sentence required.",
        quizConfig: {
          typeCounts: { "ordering": 2, "comprehension": 1 },
          focus: "Sequencing: Order of events."
        }
      };
    case 5: // Bridging
      return {
        sentenceCount: 14,
        wordCountPerSentence: "12-15",
        grammarFocus: "Past continuous and perfect tenses. Relative clauses ('who', 'which').",
        vocabularyTier: "Idiomatic expressions (simple). Synonyms.",
        knowledgeDepth: "Inference required. Text may carry meaning not explicitly shown.",
        quizConfig: {
          typeCounts: { "comprehension": 2, "vocabulary_match": 1 },
          focus: "Inference: Reading between the lines."
        }
      };
    case 6: // Fluent
      return {
        sentenceCount: 16,
        wordCountPerSentence: "15-18",
        grammarFocus: "Passive voice. Conditionals (Type 1 & 2). Varied sentence beginnings.",
        vocabularyTier: "Academic vocabulary. Multiple-meaning words.",
        knowledgeDepth: "Flashbacks or non-linear narrative elements allowed.",
        quizConfig: {
          typeCounts: { "comprehension": 2, "critical_thinking": 1 },
          focus: "Analysis: Why did X happen?"
        }
      };
    case 7: // Proficient
      return {
        sentenceCount: 18,
        wordCountPerSentence: "18-20+",
        grammarFocus: "Complex conditionals. Subjunctive mood. Stylistic devices (alliteration).",
        vocabularyTier: "Nuanced emotional vocabulary. Domain-specific terms.",
        knowledgeDepth: "Focus on character internal monologue and motivation.",
        quizConfig: {
          typeCounts: { "critical_thinking": 2, "comprehension": 1 },
          focus: "Character Motivation."
        }
      };
    case 8: // Mastery
    default:
      return {
        sentenceCount: 20,
        wordCountPerSentence: "Varied (Long/Short)",
        grammarFocus: "Full range of tenses/structures. Rhetorical questions.",
        vocabularyTier: "Literary and archaic terms. Metaphors.",
        knowledgeDepth: "Cultural subtext and proverbs utilized heavily.",
        quizConfig: {
          typeCounts: { "critical_thinking": 3 },
          focus: "Deep Analysis: Cultural subtext and themes."
        }
      };
  }
};

export const VISUAL_LOCK_TEMPLATE = {
  theme: {
    language: "STRICT_LANGUAGE_NAME",
  },
  scene: {
    location: {
      city: "STRICT_CITY_DESCRIPTION",
      road: "STRICT_ROAD_DESCRIPTION",
      crossing: "STRICT_CROSSING_DESCRIPTION",
      landmark: "STRICT_LANDMARK_DESCRIPTION",
    },
    camera: {
      angle: "Eye-level",
      lens: "35mm",
      framing: "Wide shot, characters full-body",
      position: "Static, no pan, no zoom",
    },
    lighting: {
      time: "STRICT_TIME_OF_DAY",
      sun: "STRICT_SUN_STAGING",
      shadows: "STRICT_SHADOW_STYLE",
    },
  },

  characters: {
    protagonist: {
      id: "PROTAGONIST_ID",
      age: "STRICT_AGE",
      height: "STRICT_HEIGHT",
      hair: "STRICT_HAIR_DESCRIPTION",
      clothes: "STRICT_CLOTHES_DESCRIPTION",
      shoes: "STRICT_SHOES_DESCRIPTION",
      skinTone: "STRICT_SKIN_TONE",
      role: "STRICT_ROLE",
    },
    support: {
      id: "SUPPORT_ID",
      age: "STRICT_AGE",
      hair: "STRICT_HAIR_DESCRIPTION",
      glasses: "STRICT_GLASSES_IF_ANY",
      clothes: "STRICT_CLOTHES_DESCRIPTION",
      footwear: "STRICT_FOOTWEAR_DESCRIPTION",
      accessory: "STRICT_ACCESSORY_DESCRIPTION",
      role: "STRICT_ROLE",
    },
  },

  blockingRules: [
    "Protagonist stays LEFT of frame",
    "Support stays RIGHT of frame",
    "Handhold mapping is locked: protagonist LEFT hand to support RIGHT hand",
    "Cane stays in support RIGHT hand",
  ],

  negativeRules: [
    "No character redesign",
    "No clothing changes",
    "No camera movement",
    "No background changes",
    "No time-of-day changes",
  ],
};

export const CLEAR_ENGINE = {
  /**
   * PHASE 1: THE MASTER BLUEPRINT
   * Establishes the "Source of Truth" for every visual asset + adds shot plan/camera rules.
   * Now integrates a CULTURAL ENGINE context to ground everything in specific reality.
   */
  getSceneBlueprint: (topic: string, premise: string, level: number, language: string, gender: string, culturalContext: any) => {
    const culture = culturalContext || {};

    const protagonistAnchors = culture.character_anchors?.protagonist || {};
    const genderDNA = typeof protagonistAnchors === 'string' ? protagonistAnchors : (protagonistAnchors[gender] || protagonistAnchors['boy'] || "");
    const baseDNA = protagonistAnchors.base || "";
    const combinedDNA = `${baseDNA} ${genderDNA}`.trim();

    return {
      systemInstruction: `You are a Lead Animator + Continuity Supervisor. You must establish FIXED VISUAL ASSETS.
- CULTURAL LOCK: You must follow the provided ${language} cultural context for every detail.
 - VISUAL ANCHOR LOCK: You must generate a 'visual_lock' object following the template provided below.
- CHARACTER ANCHORING: Use the 'character_anchors' provided in the context to lock physical traits. 
- PLOT ANCHORING: Use the 'plot_anchors' to compose key scenes.
- NAME LOCK: Assign culturally appropriate names.
- CAMERA LOCK: Define a static camera position for absolute continuity.
- NO TEXT: Do NOT render any readable letters/words/signs/speech bubbles/watermarks.
- ETHNIC AUTHENTICITY: Characters and assets must naturally reflect the provided ${language} identity.`,

      prompt: `
CULTURAL CONTEXT PACK:
${JSON.stringify(culture, null, 2)}

VISUAL_LOCK TEMPLATE (YOU MUST POPULATE THIS):
${JSON.stringify(VISUAL_LOCK_TEMPLATE, null, 2)}

Topic: "${topic}", Premise: "${premise}"

Generate a SINGLE JSON blueprint to LOCK visual traits, names, and camera rules.
Output STRICT JSON ONLY with this exact shape:

{
  "visual_lock": "OBJECT (Populate the VISUAL_LOCK_TEMPLATE with specific details. Use these DNA rules: ${combinedDNA})",
  "visual_guide": "string (Summary of protagonist DNA: ${combinedDNA})",
  "tone_lock": "string (STRICT generic lighting/mood, e.g., 'Golden Hour', 'Overcast', 'Bright Noon' - derived from story mood)",
  "environment_lock": "string (STRICT environment description including architecture, road types, and vehicle variety from context)",
  "continuity_tokens": ["TOKEN_1", "TOKEN_2", "TOKEN_3"],
  "naming_locks": {
    "protagonist": "Choose a name from cultural context",
    "support": "Choose a name or title from cultural context"
  },
  "theme_rules": {
    "traffic_density": "high/medium/low",
    "vehicle_mix": ["bus", "car", "bike", "bicycle"],
    "environmental_cues": ["sidewalks", "shop signs", "street lamps"]
  },
  "style_bible": {
    "style": "High-quality digital illustration, vibrant clean cartoon style, professional cel-shading, clean line art",
    "palette": "consistent palette: Cobalt Blue (Boy), Cream #FFFDD0 (Grandfather), Golden Hour warm tones",
    "lighting": "Golden Hour lighting at 5:00 PM (Warm, side-lit, long shadows)",
    "constraints": [
      "NO readable text/letters/words anywhere",
      "NO new props unless included in locked lists",
      "${culture.negatives?.avoid?.join(', ') || ''}"
    ]
  },
  "casting": {
    "protagonist": { "name": "string", "visual": "STRICT HEAD-TO-TOE description: Indian boy, Cobalt Blue school shirt, Navy Blue shorts, White socks, Black formal shoes, specific Red Backpack, short neat black hair.", "locked_props": ["Red Backpack"] },
    "support": { "name": "string", "visual": "STRICT HEAD-TO-TOE description: Elderly South Indian man, white dhoti (veshti), cream shirt with rolled sleeves, thick-rimmed circular glasses, bare feet or sandals, wooden cane.", "locked_props": ["Wooden Cane", "Circular Glasses"] }
  },
  "locations": {
    "primary": { 
      "name": "string", 
      "visual": "STRICT environment description using architecture/props from cultural context", 
      "locked_objects": ["string from cultural props"] 
    }
  },
  "camera_rules": {
    "allowed_shots": ["WIDE_ESTABLISH", "MEDIUM_TWO_SHOT", "WIDE_ACTION"],
    "horizon_perspective": "consistent horizon",
    "left_right_blocking": "protagonist position"
  },
  "shot_plan": [
    { "page": 1, "shot": "WIDE_ESTABLISH", "blocking": "desc", "emotion": "low", "note": "desc" },
    { "page": 2, "shot": "WIDE_ESTABLISH", "blocking": "desc", "emotion": "low", "note": "desc" },
    { "page": 3, "shot": "MEDIUM_TWO_SHOT", "blocking": "desc", "emotion": "low", "note": "desc" },
    { "page": 4, "shot": "MEDIUM_TWO_SHOT", "blocking": "desc", "emotion": "medium", "note": "desc" },
    { "page": 5, "shot": "WIDE_ACTION", "blocking": "desc", "emotion": "medium", "note": "desc" },
    { "page": 6, "shot": "MEDIUM_TWO_SHOT", "blocking": "desc", "emotion": "low", "note": "desc" }
  ],
  "narrative": { "text": "Story arc summary", "grammarTarget": "Level ${level} pattern" }
}
      `.trim(),
    };
  },

  /**
   * KEYFRAME LOGIC: THE STATEFUL GENERATOR
   * Forces the model to use the "Locked DNA" for every page.
   * (Signature unchanged)
   */
  getSequentialKeyframe: (
    pageIndex: number,
    sentence: any,
    visualDNA: string,
    blueprint: any,
    culture: any,
    previousAction?: string,
    options: { simpler?: boolean } = {},
    beat?: Beat
  ) => {
    const isFirstPage = pageIndex === 0;
    const english = (sentence?.english || "").toLowerCase();

    // SAGA V2: SPATIAL TRANSLATOR
    // Convert abstract Zones (A/B1/B2/C) into Concrete Camera Directives
    let zoningDirective = "";
    if (beat?.zoning) {
      const pZone = beat.zoning.protagonist;
      const zones: Record<string, string> = {
        "Zone A": "LEFT THIRD OF FRAME. Camera Pans LEFT.",
        "Zone B-1": "CENTER FRAME. Wide Shot of Road.",
        "Zone B-2": "CENTER FRAME (SYMMETRIC). Focus on Zebra Crossing.",
        "Zone C": "RIGHT THIRD OF FRAME. Camera Pans RIGHT."
      };

      zoningDirective = `
[SPATIAL LOCK - ${pZone}]
CAMERA: ${zones[pZone] || "Standard Composition"}
Protagonist Position: FIXED to ${pZone}.
Support Position: ${beat.zoning.support === "Off-Screen" ? "NOT RENDERED (Off-Screen)" : `Relative to ${pZone}`}.
`;
    }

    // SAGA V2: DEPTH TRANSLATOR (Z-INDEXING)
    // Enforce Depth of Field based on Z-Index
    let depthDirective = "";
    if (beat?.depth) {
      depthDirective = `
[DEPTH PRIORITY - Z-INDEXING MASTER]
Z-Index 1 (FOREGROUND - SHARP): ${beat.depth.focus}
Z-Index 2 (MIDGROUND - STANDARD): ${beat.depth.midground}
Z-Index 3 (BACKGROUND - BLURRED): ${beat.depth.background}
INSTRUCTION: Apply cinematic depth of field. Z1 is the SUBJECT. Z3 must have BOKEH effect.
`;
    }

    // SAGA V2: SPOTLIGHT RULE (Multiple Actor Handling)
    // If we have > 2 actors, we force the 3rd to backdrop
    const actorCount = (blueprint?.casting?.support ? 2 : 1);
    const isCrowded = actorCount > 2; // Logic placeholder if we scale casting later

    // ... (Keep existing logic for locks/blueprints) ...
    const protagonistLock = visualDNA || blueprint?.visual_guide || blueprint?.casting?.protagonist?.visual;
    const supportLock = blueprint?.casting?.support?.visual;
    const locationLock = blueprint?.environment_lock || blueprint?.locations?.primary?.visual;

    // Fallbacks
    const blocking = beat?.blocking || {};
    const beatDirective = beat ? beatToDirective(beat) : "";

    return {
      systemInstruction: `You are an Animation Director enforcing SAGA V2 SPATIAL LOGIC.

NON-NEGOTIABLE RULES:
- VISUAL LOCK: Strictly adhere to 'VISUAL_LOCK'. 
- ZONE ADHERENCE: If subject is in 'Zone A', they MUST be on the LEFT. 'Zone C' MUST be on the RIGHT.
- DEPTH HIERARCHY: Respect Z-Index. Z1 is Sharp. Z3 is Blurred.
- CONSISTENCY: Same characters, same clothes, same style as Reference Image.
- NO TEXT: No letters, words, or signs.

OUTPUT: Provide only the image prompt.`,

      prompt: `
STYLE: Pixar-esque 3D, Cinematic Lighting, Volumetric Atmosphere.
ACTION SHOT: "${sentence?.english}"

[VISUAL LOCK - MASTER ANCHOR]
${blueprint?.visual_lock ? JSON.stringify(blueprint.visual_lock, null, 2) : "Use DNA."}

[IMMUTABLE ASSETS]
PROTAGONIST (Z1): ${protagonistLock}
SUPPORT (Z2): ${supportLock || "None"}
ENVIRONMENT (Z3): ${locationLock}

${zoningDirective}

${depthDirective}

${beatDirective}

[RENDERING RULES]
- NO Text, NO photorealism.
- Lighting: Matches "Tone Lock".
[RENDERING RULES]
- NO Text, NO photorealism.
- Lighting: Matches "Tone Lock".
- Camera: ${beat?.camera || "Wide Shot"} (Prioritize Action Visibility).
`.trim(),
    };
  },
};
