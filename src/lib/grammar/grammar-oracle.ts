
import { models } from "../gemini-api";
import { GrammarChallenge } from "./types";

/**
 * The Grammar Oracle
 * Uses Gemini 2.0 Flash to generate portable grammar challenges from story content.
 */
export async function generateGrammarChallenge(
  storyContext: string,
  targetSentence: string,
  language: string,
  level: number,
  type: GrammarChallenge['type']
): Promise<GrammarChallenge> {

  const prompt = `
    You are an expert ${language} language teacher for Level ${level} students.
    
    CONTEXT:
    Story Theme: "${storyContext}"
    Target Sentence: "${targetSentence}"
    
    TASK:
    Create a single "${type}" grammar challenge based on the Target Sentence.
    
    REQUIREMENTS:
    - ID: Generate a unique ID starting with 'gc_'.
    - Level: ${level}
    - Type: ${type}
    - Options: Provide 3-4 plausible options if applicable (distractors must be common mistakes).
    - Explanation: Provide clear, encouraging feedback for both correct and incorrect answers.
    - Tags: Add relevant grammatical tags (e.g., "past-tense", "subject-verb-agreement").
    
    OUTPUT SCHEMA (JSON Only):
    {
      "id": "string",
      "language": "${language}",
      "level": number,
      "type": "${type}",
      "stimulus": {
        "text": "string (sentence with [gap] or mixed order)",
        "context": "string (optional hint)"
      },
      "options": ["string"],
      "answer_key": "string (or array for reorder)",
      "explanation": {
        "correct": "string",
        "incorrect": "string"
      },
      "tags": ["string"]
    }
    `;

  try {
    const result = await models.flash.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const rawText = (result as any).response.text();
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);

  } catch (e) {
    console.error("Grammar Oracle Failed", e);
    throw new Error("Failed to generate grammar challenge");
  }
}
