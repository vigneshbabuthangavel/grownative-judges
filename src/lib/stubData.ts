import type { StoryPack, WritingChallenge } from "./types";

export const stories: StoryPack[] = [
  {
    storyId: "en-l1-nature-1",
    level: 1,
    language: "en",
    theme: "Nature",
    title_native: "Sunny Day",
    thumbnailSvgPath: "/images/thumb-sunny.svg",
    targetWords: [
      { id: "s1", native: "sun", meaning_en: "sun" },
      { id: "s2", native: "tree", meaning_en: "tree" },
      { id: "s3", native: "bird", meaning_en: "bird" },
    ],
    pages: [
      {
        pageNumber: 1,
        text_native: "The sun is up.",
        imageAlt: "A bright sun in the sky",
        imageSvgPath: "/images/page-sunny-1.svg",
        targetWordIds: ["s1"],
      },
      {
        pageNumber: 2,
        text_native: "A bird is here.",
        imageAlt: "A bird near a tree",
        imageSvgPath: "/images/page-sunny-2.svg",
        targetWordIds: ["s3", "s2"],
      },
      {
        pageNumber: 3,
        text_native: "I see a tree.",
        imageAlt: "A green tree",
        imageSvgPath: "/images/page-sunny-3.svg",
        targetWordIds: ["s2"],
      },
    ],
    exercises: [
      {
        type: "choose_word_for_picture",
        prompt_native: "Which word matches the picture?",
        options_native: ["sun", "shoe", "book"],
        answer_native: "sun",
      },
    ],
    review: {
      kidSafeApproved: true,
      checks: [
        { name: "topic_safety", passed: true },
        { name: "level_constraints", passed: true },
        { name: "image_alignment", passed: true },
      ],
    },
  },
  {
    storyId: "ta-l2-kindness-1",
    level: 2,
    language: "ta",
    theme: "Kindness",
    title_native: "நண்பன் யானை",
    title_transliteration: "Nanban Yaanai",
    thumbnailSvgPath: "/images/thumb-elephant.svg",
    targetWords: [
      { id: "w1", native: "யானை", transliteration: "Yaanai", meaning_en: "Elephant" },
      { id: "w2", native: "நண்பன்", transliteration: "Nanban", meaning_en: "Friend" },
      { id: "w3", native: "உதவி", transliteration: "Udhavi", meaning_en: "Help" },
    ],
    pages: [
      {
        pageNumber: 1,
        text_native: "யானை நல்ல நண்பன்.",
        text_transliteration: "Yaanai nalla nanban.",
        imageAlt: "A friendly elephant smiling",
        imageSvgPath: "/images/page-elephant-1.svg",
        targetWordIds: ["w1", "w2"],
      },
      {
        pageNumber: 2,
        text_native: "யானை முயலுக்கு உதவி செய்தது.",
        text_transliteration: "Yaanai muyalukku udhavi seithathu.",
        imageAlt: "Elephant helping a rabbit",
        imageSvgPath: "/images/page-elephant-2.svg",
        targetWordIds: ["w1", "w3"],
      },
      {
        pageNumber: 3,
        text_native: "முயல் மகிழ்ந்தது. நண்பன் நன்றி சொன்னது.",
        text_transliteration: "Muyal magizhndhathu. Nanban nandri sonnathu.",
        imageAlt: "Rabbit happy and thankful",
        imageSvgPath: "/images/page-elephant-3.svg",
        targetWordIds: ["w2"],
      },
    ],
    exercises: [
      {
        type: "choose_word_for_picture",
        prompt_native: "படத்தில் எது உள்ளது?",
        options_native: ["யானை", "பந்து", "மரம்"],
        answer_native: "யானை",
      },
      {
        type: "fill_blank",
        sentence_native: "யானை ___ செய்தது.",
        options_native: ["உதவி", "ஓட்டம்", "கோபம்"],
        answer_native: "உதவி",
      },
    ],
    review: {
      kidSafeApproved: true,
      checks: [
        { name: "topic_safety", passed: true },
        { name: "script_correctness", passed: true },
        { name: "level_constraints", passed: true },
        { name: "image_alignment", passed: true },
      ],
    },
  },
  {
    storyId: "en-l7-kindness-1",
    level: 7,
    language: "en",
    theme: "Kindness",
    title_native: "The Bridge of Kindness",
    thumbnailSvgPath: "/images/thumb-bridge.svg",
    targetWords: [
      { id: "e1", native: "generous", meaning_en: "willing to give" },
      { id: "e2", native: "hesitate", meaning_en: "pause before acting" },
      { id: "e3", native: "responsibility", meaning_en: "duty to do the right thing" },
    ],
    pages: [
      {
        pageNumber: 1,
        text_native:
          "Mira hesitated at the old wooden bridge. The river below was calm, but the planks looked tired.",
        imageAlt: "A child standing near a wooden bridge",
        imageSvgPath: "/images/page-bridge-1.svg",
        targetWordIds: ["e2"],
      },
      {
        pageNumber: 2,
        text_native:
          "She noticed a younger child struggling with a heavy school bag. Mira chose responsibility over comfort.",
        imageAlt: "Mira helping a younger child",
        imageSvgPath: "/images/page-bridge-2.svg",
        targetWordIds: ["e3"],
      },
      {
        pageNumber: 3,
        text_native:
          "A generous act doesn’t always feel big in the moment, but it can change someone’s whole day.",
        imageAlt: "A warm scene of two kids smiling",
        imageSvgPath: "/images/page-bridge-3.svg",
        targetWordIds: ["e1"],
      },
    ],
    exercises: [
      {
        type: "choose_word_for_picture",
        prompt_native: "Which word matches a helpful action?",
        options_native: ["generous", "hesitate", "responsibility"],
        answer_native: "generous",
      },
    ],
    review: {
      kidSafeApproved: true,
      checks: [
        { name: "topic_safety", passed: true },
        { name: "level_constraints", passed: true },
        { name: "image_alignment", passed: true },
      ],
    },
  },
  // HINDI
  {
    storyId: "hi-l1-cow-1",
    level: 1,
    language: "hi",
    theme: "Animals",
    title_native: "मेरी गाय",
    title_transliteration: "Meri Gaay",
    thumbnailSvgPath: "/images/thumb-cow.svg",
    targetWords: [
      { id: "h1", native: "गाय", meaning_en: "cow" },
      { id: "h2", native: "दूध", meaning_en: "milk" },
    ],
    pages: [
      {
        pageNumber: 1,
        text_native: "यह मेरी गाय है।",
        text_transliteration: "Yeh meri gaay hai.",
        imageAlt: "A gentle cow",
        imageSvgPath: "/images/page-cow-1.svg",
        targetWordIds: ["h1"],
      },
      {
        pageNumber: 2,
        text_native: "गाय दूध देती है।",
        text_transliteration: "Gaay doodh deti hai.",
        imageAlt: "Cow giving milk",
        imageSvgPath: "/images/page-cow-2.svg",
        targetWordIds: ["h2"],
      },
    ],
    exercises: [],
    review: { kidSafeApproved: true, checks: [] },
  },
  // TELUGU
  {
    storyId: "te-l1-village-1",
    level: 1,
    language: "te",
    theme: "Nature",
    title_native: "నా ఊరు",
    title_transliteration: "Naa Ooru",
    thumbnailSvgPath: "/images/thumb-village-te.svg",
    targetWords: [{ id: "t1", native: "ఊరు", meaning_en: "village" }],
    pages: [
      {
        pageNumber: 1,
        text_native: "ఇది నా ఊరు.",
        text_transliteration: "Idhi naa ooru.",
        imageAlt: "A beautiful village",
        imageSvgPath: "/images/page-village-1.svg",
        targetWordIds: ["t1"],
      }
    ],
    exercises: [],
    review: { kidSafeApproved: true, checks: [] },
  },
  // KANNADA
  {
    storyId: "kn-l1-star-1",
    level: 1,
    language: "kn",
    theme: "Nature",
    title_native: "ನಕ್ಷತ್ರ",
    title_transliteration: "Nakshatra",
    thumbnailSvgPath: "/images/thumb-star-kn.svg",
    targetWords: [{ id: "k1", native: "ನಕ್ಷತ್ರ", meaning_en: "star" }],
    pages: [
      {
        pageNumber: 1,
        text_native: "ಆಕಾಶದಲ್ಲಿ ನಕ್ಷತ್ರ ಇದೆ.",
        text_transliteration: "Aakashadalli nakshatra ide.",
        imageAlt: "Star in sky",
        imageSvgPath: "/images/page-star-1.svg",
        targetWordIds: ["k1"],
      }
    ],
    exercises: [],
    review: { kidSafeApproved: true, checks: [] },
  },
  // MALAYALAM
  {
    storyId: "ml-l1-boat-1",
    level: 1,
    language: "ml",
    theme: "Travel",
    title_native: "വള്ളം",
    title_transliteration: "Vallam",
    thumbnailSvgPath: "/images/thumb-boat-ml.svg",
    targetWords: [{ id: "m1", native: "വള്ളം", meaning_en: "boat" }],
    pages: [
      {
        pageNumber: 1,
        text_native: "ഇതൊരു വലിയ വള്ളം.",
        text_transliteration: "Ithoru valiya vallam.",
        imageAlt: "A kerala boat",
        imageSvgPath: "/images/page-boat-1.svg",
        targetWordIds: ["m1"],
      }
    ],
    exercises: [],
    review: { kidSafeApproved: true, checks: [] },
  },
  // BENGALI
  {
    storyId: "bn-l1-flower-1",
    level: 1,
    language: "bn",
    theme: "Nature",
    title_native: "লাল ফুল",
    title_transliteration: "Lal Phul",
    thumbnailSvgPath: "/images/thumb-flower-bn.svg",
    targetWords: [{ id: "b1", native: "ফুল", meaning_en: "flower" }],
    pages: [
      {
        pageNumber: 1,
        text_native: "আমি একটি লাল ফুল দেখি।",
        text_transliteration: "Ami ekti lal phul dekhi.",
        imageAlt: "Red flower",
        imageSvgPath: "/images/page-flower-1.svg",
        targetWordIds: ["b1"],
      }
    ],
    exercises: [],
    review: { kidSafeApproved: true, checks: [] },
  },
  // JAPANESE
  {
    storyId: "ja-l1-cherry-1",
    level: 1,
    language: "ja",
    theme: "Nature",
    title_native: "さくら",
    title_transliteration: "Sakura",
    thumbnailSvgPath: "/images/thumb-sakura.svg",
    targetWords: [{ id: "j1", native: "さくら", meaning_en: "cherry blossom" }],
    pages: [
      {
        pageNumber: 1,
        text_native: "さくらが さいています。",
        text_transliteration: "Sakura ga saiteimasu.",
        imageAlt: "Cherry blossoms blooming",
        imageSvgPath: "/images/page-sakura-1.svg",
        targetWordIds: ["j1"],
      }
    ],
    exercises: [],
    review: { kidSafeApproved: true, checks: [] },
  },
  // CHINESE
  {
    storyId: "zh-l1-dragon-1",
    level: 1,
    language: "zh",
    theme: "Fantasy",
    title_native: " маленьким драконом",
    title_transliteration: "Xiǎo Lóng",
    thumbnailSvgPath: "/images/thumb-dragon.svg",
    targetWords: [{ id: "ch1", native: "龙", meaning_en: "dragon" }],
    pages: [
      {
        pageNumber: 1,
        text_native: "这是 一条 小龙。",
        text_transliteration: "Zhè shì yītiáo xiǎolóng.",
        imageAlt: "A small dragon",
        imageSvgPath: "/images/page-dragon-1.svg",
        targetWordIds: ["ch1"],
      }
    ],
    exercises: [],
    review: { kidSafeApproved: true, checks: [] },
  },
  // FRENCH
  {
    storyId: "fr-l1-cat-1",
    level: 1,
    language: "fr",
    theme: "Animals",
    title_native: "Le Chat",
    title_transliteration: "",
    thumbnailSvgPath: "/images/thumb-cat-fr.svg",
    targetWords: [{ id: "f1", native: "chat", meaning_en: "cat" }],
    pages: [
      {
        pageNumber: 1,
        text_native: "Voici mon chat.",
        imageAlt: "A cute cat",
        imageSvgPath: "/images/page-cat-1.svg",
        targetWordIds: ["f1"],
      }
    ],
    exercises: [],
    review: { kidSafeApproved: true, checks: [] },
  },
  // SPANISH
  {
    storyId: "es-l1-dog-1",
    level: 1,
    language: "es",
    theme: "Animals",
    title_native: "El Perro",
    title_transliteration: "",
    thumbnailSvgPath: "/images/thumb-dog-es.svg",
    targetWords: [{ id: "s1", native: "perro", meaning_en: "dog" }],
    pages: [
      {
        pageNumber: 1,
        text_native: "El perro corre rápido.",
        imageAlt: "A running dog",
        imageSvgPath: "/images/page-dog-1.svg",
        targetWordIds: ["s1"],
      }
    ],
    exercises: [],
    review: { kidSafeApproved: true, checks: [] },
  },
];

export const writingChallengeStub: WritingChallenge = {
  challengeId: "wc-ta-l2-kindness",
  language: "ta",
  level: 2,
  prompt_native: "‘நண்பன்’ மற்றும் ‘உதவி’ என்ற சொற்களை பயன்படுத்தி 1 எளிய வாக்கியம் எழுதுங்கள்.",
  mustUseWords: [
    { native: "நண்பன்", meaning_en: "Friend" },
    { native: "உதவி", meaning_en: "Help" },
  ],
  rubric: [
    { id: "used_words", description_native: "இரண்டு சொற்களையும் பயன்படுத்தினீர்களா?", maxScore: 2 },
    { id: "sentence_count", description_native: "குறைந்தது 1 வாக்கியம் உள்ளதா?", maxScore: 2 },
    { id: "clarity", description_native: "வாக்கியம் தெளிவாக உள்ளதா?", maxScore: 1 },
  ],
  expectedSentences: { min: 1, max: 2 },
};



export const topicCategories: Record<string, string[]> = {
  "World Around Us": ["Nature", "Animals", "Travel"],
  "Values & Feelings": ["Kindness", "Family", "Friendship"],
  "Imagination": ["Fantasy", "Space", "Superheroes"],
};

export const topicsFromStories = Array.from(new Set(Object.values(topicCategories).flat())).sort();



export function storyById(id: string) {
  return stories.find((s) => s.storyId === id);
}
