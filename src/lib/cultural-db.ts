/**
 * CULTURAL DATABASE
 * Stores high-density context for the 'System Persona' of the AI Agent.
 * This ensures the Context Cache is filled with >2048 tokens of VALUE, not padding.
 */

import { CULTURAL_DB } from "./cultural/data";
import { PEDAGOGICAL_RUBRICS } from "./cultural/rubrics";

export { CULTURAL_DB, PEDAGOGICAL_RUBRICS };

export function getCulturalContext(langCode: string): string {
    const culture = CULTURAL_DB[langCode] || CULTURAL_DB['ta']; // Default to Tamil for demo
    return JSON.stringify(culture, null, 2);
}
