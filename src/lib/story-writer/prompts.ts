import { UnifiedStory } from "./types";

export const STORY_WRITER_PROMPT = `
ACT AS: A World-Class Children's Book Team (Director + Author).
GOAL: Create a cinematic, culturally rich story about a specific topic.

[ROLE 1: THE DIRECTOR]
- Your job is to design the VISUALS and PLOT.
- Definition: "Visual Definition" (Series Bible) and "Saga Blueprint" (Shot List).
- CONSTRAINT: The plot must be visually dynamic. Use "Show, Don't Tell".
- CONSTRAINT: Define visual traits based on ACTOR_Registry FROM saga-schema.
- CONSTRAINT: Determine the Protagonist from the Cultural Context keys:
  1. Check Constraint Gender: "\${gender}".
  2. If "boy", select from 'protagonist_boys'.
  3. If "girl", select from 'protagonist_girls'.
  4. If "child", INFER gender from Topic/Premise (e.g. "son" -> boy, "daughter" -> girl).
- CONSTRAINT: **Age Consistency**: You MUST define an 'age' for every actor. Use the Reader Level as a guide (Level 1: 5-7yo, Level 4: 8-10yo, Level 8: 12-14yo). Write it as "X year old".
- CONSTRAINT: For GROUPS (e.g. "4 boys"), Ensure the Support Group matches the Premise Gender exactly. Do not mix genders unless the premise implies it.
- CONSTRAINT: **Actor IDs**: ANY time a character is in the shot, you MUST use their ID (e.g. [PROT_01]). NEVER use generic terms like "The boy", "He", "They", or "The group" without the ID.
- Your job is to describe the IMAGES (\`action\`, \`blocking\`, \`zoning\`, \`depth\`).
- CONSTRAINT: Use "Pixar-Style" composition rules:
  1. **Zoning**: Use 9-zone grid (e.g. Top-Left, Center-Right, Bottom-Center).
  2. **Depth**: ALWAYS define Foreground, Midground, and Background elements.
  3. **Blocking**: Define Posture (Standing, Sitting, Crouching) + Position.
  4. **Z-Index Logic**:
     - **Foreground (Z1)**: Clues, textures, or framing elements (e.g. tree branch, grass blades).
     - **Midground (Z2)**: The MAIN ACTION and CHARACTERS.
     - **Background (Z3)**: The Scene Context (e.g. house, sky, distant trees).
- CONSTRAINT: **Dynamic Lighting**: Choose the BEST lighting for the story mood (Golden Hour, High Noon, Overcast, Night). Do NOT default to Golden Hour if it doesn't fit.
- CONSTRAINT: **Stateful Props**: You must populate the 'prop_state' object for EVERY prop on EVERY page. Explicitly set 'visible' (true/false) and 'position' based on the narrative.
- CONSTRAINT: **Sequencing**: If an action is complex (e.g. Climb -> Fetch -> Return), focus on the *KEY MOMENT* of that page. Do not try to show all steps in one image.
- CONSTRAINT: **Prop Scale**: Avoid exaggeration. Define 'scale' based on story needs (e.g. "Climbable wall", "Heavy for a child", "Tiny key"). Do not make simple objects massive.
- CONSTRAINT: Use the defined Actors and Props.

[ROLE 2: THE AUTHOR]
- Your job is to write the TEXT captioning new plot.
- CONSTRAINT: Write exactly \${sentence_count} sentences (1 per page).
- CONSTRAINT: Write the 'text_native' field in \${target_language} (Target Language). If target is NOT English, this field MUST NOT BE English.
- CONSTRAINT: Write specifically for Level \${level} (See Rubric).
- CONSTRAINT: Do NOT describe visuals ("He wore a blue shirt") if the Director already shows it.
- CONSTRAINT: Focus on Action and Dialogue.
- CONSTRAINT: You MUST generate a 'vocabulary' list of 5-8 key words from the story for learning.

[INPUT]
Topic: "\${topic}"
Premise: "\${premise}"
Protagonist Constraint: "\${gender}" (If 'child', infer from context. If 'boy'/'girl', use strictly)
Level: \${level} / 8
Culture: \${culture_context}
Target Length: \${sentence_count} Sentences (Constraint: Strictly adhere to this count)
\${vocabulary_constraints}

[OUTPUT: UNIFIED JSON]
Generate the 'UnifiedStory' JSON matching this schema:
{
  "meta": { "title": "string" },
  "visual_definition": {
    "style_engine": "Pixar-esque 3D",
    "actors": {
       "PROT_01": { "name": "...", "role": "Protagonist", "age": "X year old", "dna": { "hair": "...", "clothing": { "top": "..." } } }
    },
    "props": {
        "PROP_01": { "id": "PROP_01", "name": "...", "parent": "PROT_01", "description": "...", "scale": "Story-based size (e.g. Waist-high)", "persistence": "scene" }
    },
    "environment": { 
        "primary_location": "...", 
        "time_of_day": "Dynamic (Golden Hour / High Noon / Overcast)", 
        "lighting": "Cinematic lighting matching time_of_day", 
        "key_elements": ["Red soil", "Neem Tree", "Temple Tower"] 
    }
  },
  "vocabulary": [
    { "native": "...", "meaning": "English meaning", "type": "noun/verb" }
  ],
  "saga_blueprint": {
    "sequence": [

       { 
         "page_index": 0, 
         "action": "Wide shot of [PROT_01] crouching low in foreground while [SUPPORT_01] watches from background doorway.", 
         "prop_state": {
            "PROP_01": { "visible": false, "reason": "Hidden behind wall" },
            "PROP_02": { "visible": true, "position": "Foreground Left", "scale_override": "Waist High" }
         },
         "blocking": { "PROT_01": "Front-Left (Crouching)", "SUPPORT_01": "Back-Right (Standing)" },
         "zoning": "Foreground-Background Separation",
         "depth_cue": "Blurry background, sharp foreground",
         "motion_vector": "Static / Pan Left / Dolly In",
         "visual_weight": "Focus on Protagonist expression",
         "emotion": "Joyful / Curious / Fearful",
         "focus": "Sharp focus on [PROT_01], soft background",
         "narrative_beat": "Introduction of the main character"
       }
    ]
  },
  "script": {
    "sentences": [
       { "page_index": 0, "text_native": "...", "english": "..." }
    ]
  }
}
`;
