
import { getStoryConfig } from "../lib/prompt-engine";

describe("Level Config Logic (Unit)", () => {
    test("Level 1 returns simple constraints", () => {
        const config = getStoryConfig(1);
        expect(config.sentenceCount).toBe(6);
        expect(config.grammarFocus).toContain("Simple SV or SVO");
        expect(config.quizConfig.typeCounts["choose_word_for_picture"]).toBe(3);
        expect(config.quizConfig.focus).toContain("Visual Recognition");
    });

    test("Level 4 returns intermediate constraints", () => {
        const config = getStoryConfig(4);
        expect(config.sentenceCount).toBe(12);
        expect(config.wordCountPerSentence).toBe("10-12");
        expect(config.quizConfig.typeCounts["ordering"]).toBe(2);
        expect(config.quizConfig.focus).toContain("Sequencing");
    });

    test("Level 8 returns mastery constraints", () => {
        const config = getStoryConfig(8);
        expect(config.sentenceCount).toBe(20);
        expect(config.quizConfig.typeCounts["critical_thinking"]).toBe(3);
        expect(config.quizConfig.focus).toContain("Deep Analysis");
    });

    test("Levels clamp correctly (Level 0 -> Level 1)", () => {
        const config = getStoryConfig(0);
        expect(config.sentenceCount).toBe(6); // Should now be Level 1
        expect(config.grammarFocus).toContain("Simple SV or SVO");
    });

    test("Levels clamp correctly (Level 99 -> Level 8)", () => {
        const config = getStoryConfig(99);
        expect(config.sentenceCount).toBe(20); // Should be Level 8
    });
});
