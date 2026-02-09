
import { models } from "../gemini-api";

export interface VocabularyConstraint {
    word: string;
    meaning: string;
    reason: string;
}

/**
 * The Struggle Oracle
 * Determines if a set of "struggling words" can naturally fit into a proposed story premise.
 * This implements the "Queue & Defer" logic.
 */
export async function checkVocabularyCompatibility(
    premise: string,
    topic: string,
    candidates: VocabularyConstraint[]
): Promise<{ accepted: VocabularyConstraint[], rejected: VocabularyConstraint[] }> {

    if (!candidates || candidates.length === 0) return { accepted: [], rejected: [] };

    // We use Gemini Flash for a quick semantic check
    const prompt = `
    You are a strict Narrative Editor.
    
    CONTEXT:
    Topic: "${topic}"
    Premise: "${premise}"
    
    CANDIDATE WORDS (to be injected):
    ${candidates.map(c => `- ${c.word} (${c.meaning})`).join('\n')}
    
    TASK:
    Analyze which of these words can be NATURALLY included in this specific story without forcing it or breaking immersion.
    
    CRITERIA:
    - If the word is "Snow" and the story is "Desert", REJECT it.
    - If the word is "Rain" and the story is "Forest", ACCEPT it.
    - Be strict. Quality > Quantity.
    
    OUTPUT SCHEMA (JSON Only):
    {
      "accepted_words": ["word"],
      "rejected_words": ["word"]
    }
    `;

    try {
        const result = await models.flash.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const raw = (result as any).response.text();
        const json = JSON.parse(raw.replace(/```json/g, "").replace(/```/g, "").trim());

        const accepted = candidates.filter(c => json.accepted_words.includes(c.word));
        const rejected = candidates.filter(c => !json.accepted_words.includes(c.word));

        return { accepted, rejected };

    } catch (e) {
        console.error("Struggle Oracle Check Failed", e);
        // Fail safe: Reject all to preserve story quality if AI fails
        return { accepted: [], rejected: candidates };
    }
}
