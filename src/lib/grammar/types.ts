
export interface GrammarChallenge {
    id: string; // Unique ID (e.g., 'gc_12345')
    language: string; // 'ta', 'zh', 'en', etc.
    level: number; // 4-8
    type: 'reorder' | 'fill_gap' | 'conjugation' | 'error_correction' | 'tone_match';

    // The content to be tested
    stimulus: {
        text: string;           // "The cat [sat] on the mat."
        context?: string;       // "Passive voice test"
        audio_path?: string;    // Optional pronunciation
    };

    // For interactive UI
    options?: string[];       // ["sat", "sit", "sitting"]
    answer_key: string | string[]; // Correct answer(s)

    // Feedback
    explanation: {
        correct: string;        // "Correct! 'Sat' is past tense..."
        incorrect: string;      // "Not quite. check the tense..."
    };

    // Metadata for AI Oracle
    tags: string[];           // ["past-tense", "verbs", "pixar-style"]
}
