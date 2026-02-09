'use server';

import { generateContentServer } from "@/app/actions/gemini";

function safeJsonParse(text: string) {
    try {
        const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(clean);
    } catch (e) {
        return null;
    }
}


const MODELS_TO_TRY = ["gemini-2.0-flash", "gemini-3-flash-preview"];


const RUBRIC_DEFINITIONS: Record<number, string> = {
    1: "Syntax: Simple SV or SVO sentences. Present tense only. Vocabulary: High-frequency sight words (dolch list). Concrete nouns. Length: 3-5 words per sentence. Constraint: No compound sentences. Direct correspondence to illustration.",
    2: "Syntax: Compound sentences using 'and', 'but'. Present continuous tense. Vocabulary: Routine actions, basic emotions (happy, sad). Length: 6-8 words per sentence. Constraint: Avoid passive voice. Linear time order only.",
    3: "Syntax: Complex sentences with 'because', 'when', 'if'. Introduction of simple past tense. Vocabulary: Abstract concepts (courage, friendship, honesty). Descriptive adjectives. Length: 8-10 words per sentence. Constraint: Dialogue tags allowed.",
    4: "Syntax: Compound-complex sentences. Future tense. Vocabulary: Context-specific vocabulary. Adverbs of manner. Length: 10-12 words per sentence. Constraint: Paragraphs can span 2-3 sentences.",
    5: "Syntax: Past continuous and perfect tenses. Relative clauses. Vocabulary: Idiomatic expressions (simple). Synonyms. Length: 12-15 words per sentence. Constraint: Inference required.",
    6: "Syntax: Passive voice. Conditionals (Type 1 & 2). Vocabulary: Academic vocabulary. Multiple-meaning words. Length: 15-18 words per sentence. Constraint: Flashbacks allowed.",
    7: "Syntax: Complex conditionals. Subjunctive mood. Stylistic devices. Vocabulary: Nuanced emotional vocabulary. Domain-specific terms. Length: 18-20+ words. Constraint: Focus on character internal monologue.",
    8: "Syntax: Full range of tenses. Rhetorical questions. Vocabulary: Literary and archaic terms. Metaphors. Length: Varied length for pacing. Constraint: Cultural subtext and proverbs utilized heavily."
};

export async function evaluatePremiseAction(topic: string, premise: string, level: number = 3, language: string = "en") {
    // Determine level-specific constraints using the Official Educational Rubric
    const levelConstraint = RUBRIC_DEFINITIONS[level] || RUBRIC_DEFINITIONS[3];


    const prompt = `
        You are a Pulitzer-winning Story Editor specializing in children's literature.
        Your goal is to turn good ideas into MASTERPIECES.
        
        Analyze this Story Premise for a Level ${level} reader.
        Target Language: ${language} (Ensure cultural nuances and names match this language).
        Topic: "${topic}"
        Input: "${premise}"
        Target Level: ${level}
        Level Constraints: ${levelConstraint}
        
        [FEW-SHOT EXAMPLES - STUDY THESE CAREFULLY]
        
        Example 1 (Level 3):
        Input: "The cat sat on the mat."
        Rewritten (100/100 MASTERPIECE): "Beneath the golden afternoon sun, a fluffy ginger cat curled comfortably onto the velvet mat, purring a soft melody of contentment as dust motes danced around him."
        
        Example 2 (Level ${level}):
        Input: "A boy found a star."
        Rewritten (100/100 MASTERPIECE): "Young Arun was diggging in the cool earth when he unearthed a shimmering, fallen star. It pulsed with a gentle, warm light, whispering secrets of the galaxy that only a brave heart could hear."
        
        CRITICAL INSTRUCTION:
        1. Analyze the Input strictly against 4 lenses: Clarity, Engagement, Safety, Detail.
        2. SAFETY CHECK (ZERO TOLERANCE):
           - If the premise contains: Hate Speech, Explicit Violence, Sexual Themes, Self-Harm, or Bullying (without resolution).
           - FAIL IMMEDIATELY. Set Score = 0.
           - Set Quality = "Needs Polish".
           - In "feedback", explicitly flag the Safety violation.

        3. Assign a "score" (0-100). Be a FAIR editor (if Safe):
           - IMPORTANT: For Level 1-4, familiar themes (lost animals, storms, friendship) are GENRE CONVENTIONS, NOT CLICHÉS. Score them highly if they are clear.
           - < 70: "Needs Polish" (or Unsafe)
           - 70-94: "Good Start"
           - 95-100: "Excellent" (Reserve this for clear, emotive storytelling)
        
        3. GENERATE THE "rewritten_premise" (THE MASTERPIECE):
           - IGNORE the original quality. Rewrite it to score a PERFECT 100/100 like the Examples above.
           - IT MUST BE CINEMATIC, EMOTIONALLY RESONANT, and NUANCED.
           - It must STRICTLY OBEY: "${levelConstraint}"
           - The "rewritten_premise" should represent the Gold Standard for this Grade Level.

        Output STRICT VALID JSON only:
        {
            "score": number,
            "quality": "Needs Polish" | "Good Start" | "Excellent",
            "rewritten_premise": "The 100/100 optimized version...",
            "feedback": [
                { 
                    "category": "Clarity", 
                    "rating": "Positive"|"Neutral"|"Negative", 
                    "text": "Specific critique...", 
                    "suggested_fix": "Specific fix..." 
                },
                { "category": "Engagement", "rating": "...", "text": "...", "suggested_fix": "..." },
                { "category": "Safety", "rating": "...", "text": "...", "suggested_fix": "..." },
                { "category": "Detail", "rating": "...", "text": "...", "suggested_fix": "..." }
            ],
            "suggestions": ["Actionable Tip 1", "Actionable Tip 2"]
        }
    `;

    let lastError = null;

    for (const modelName of MODELS_TO_TRY) {
        try {
            console.log(`Trying model: ${modelName} for premise evaluation (Level ${level})...`);
            const result = await generateContentServer(modelName, prompt);


            if (result.error) {
                console.warn(`Model ${modelName} failed:`, result.error);
                lastError = result.error;
                continue; // Try next model
            }

            const json = safeJsonParse(result.text || "{}");
            if (!json || !json.feedback) {
                console.warn(`Model ${modelName} returned invalid JSON:`, result.text);
                lastError = "Invalid JSON response";
                continue; // Try next model
            }

            // If we got here, we have a valid result from a model
            return json;

        } catch (e: any) {
            console.error(`Unexpected error with ${modelName}:`, e);
            lastError = e.message;
        }
    }

    // If all models failed
    return {
        score: 0,
        quality: "Error",
        feedback: [`All models failed. Last error: ${lastError}`],
        suggestions: ["Please try again in a moment."]
    };
}
