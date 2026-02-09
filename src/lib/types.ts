export type LanguageCode = "ta" | "hi" | "en" | "ja" | "zh" | "es" | "te" | "kn" | "ml" | "bn" | "gu" | "fr" | "de" | "ru" | "pt";

export type TargetWord = {
  id: string;
  native: string;
  transliteration?: string;
  meaning_en: string;
};

export type StoryPage = {
  pageNumber: number;
  text_native: string;
  text_transliteration?: string;
  text_english?: string; // Phase 6: Multilingual
  imageAlt: string;
  imageAlt_descriptive?: string;
  imageCaption?: string;
  imageSvgPath?: string; // High-res SVG path (if generated)
  imagePath?: string;    // Local path to saved image file
  targetWordIds: string[];
  audio?: {
    prosody?: any; // Gemini acting directions
    file?: string; // Path to generated audio file (if any)
  };
  saga_audit?: { score: number; reason: string };
};

export type MicroExercise =
  | {
    type: "choose_word_for_picture";
    prompt_native: string;
    options_native: string[];
    answer_native: string;
  }
  | {
    type: "fill_blank";
    sentence_native: string;
    options_native: string[];
    answer_native: string;
  }
  | {
    type: "ordering";
    prompt_native: string;
    items_native: string[]; // Correct order
    jumbled_native: string[]; // Display order
  }
  | {
    type: "comprehension";
    question_native: string;
    options_native: string[];
    answer_native: string;
  }
  | {
    type: "vocabulary_match";
    word_native: string;
    meaning_native: string; // Or definition
    options_native: string[]; // Distractors
  }
  | {
    type: "critical_thinking";
    prompt_native: string;
    talking_points_native: string[]; // No "correct" answer, but discussion points
  };

export type StoryPack = {
  storyId: string;
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  language: LanguageCode;
  theme: string;
  title_native: string;
  title_transliteration?: string;
  title_english?: string; // Phase 6: Multilingual
  title?: string; // Legacy / Fallback
  thumbnailSvgPath: string;

  targetWords: TargetWord[];
  pages: StoryPage[];
  exercises: MicroExercise[];

  review: {
    kidSafeApproved: boolean;
    checks: Array<{ name: string; passed: boolean }>;
  };
  community?: {
    rating: number;
    votes: number;
    isRevisionRequired: boolean;
    revisionNotes: string[];
  };

  // Hoisted for efficiency
  globalMeta?: {
    visualDNA: string;
    blueprint: any;
    casting: any;
  };

  // New Multilingual Meta
  translationRef?: string; // ID of the source story if this is a translation
};

export type WritingChallenge = {
  challengeId: string;
  language: LanguageCode;
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  prompt_native: string;
  mustUseWords: Array<{ native: string; meaning_en: string }>;
  rubric: Array<{ id: string; description_native: string; maxScore: number }>;
  expectedSentences: { min: number; max: number };
};
