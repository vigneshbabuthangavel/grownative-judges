import { LanguageCode } from "./types";

export type LanguageReference = {
    name: string;
    nativeName: string;
    alphabets: {
        title: string;
        description: string;
        items: string[];
    };
    grammar: {
        title: string;
        description: string;
        rules: { title: string; example: string }[];
    };
    referralLink: {
        title: string;
        url: string;
    };
};

export const languageReferences: Record<LanguageCode, LanguageReference> = {
    ta: {
        name: "Tamil",
        nativeName: "தமிழ்",
        alphabets: {
            title: "Tamil Alphabets (Uyir & Mei)",
            description: "Tamil script consists of 12 Vowels (Uyir) and 18 Consonants (Mei).",
            // Uyir (12) + Mei (18)
            items: [
                "அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ",
                "க்", "ங்", "ச்", "ஞ்", "ட்", "ண்", "த்", "ந்", "ப்", "ம்", "ய்", "ர்", "ல்", "வ்", "ழ்", "ள்", "ற்", "ன்"
            ],
        },
        grammar: {
            title: "Grammar Basics",
            description: "Tamil is an agglutinative language with Verb-SVO flexibility but typically SOV.",
            rules: [
                { title: "Honorifics", example: "Use '-nga' for respect (e.g., Vaanga instead of Vaa)." },
                { title: "Sentence Structure", example: "Subject + Object + Verb (e.g., Naan pazham saapten)." },
            ],
        },
        referralLink: {
            title: "Learn more at Tamil Virtual Academy",
            url: "https://www.tamilvu.org/",
        },
    },
    hi: {
        name: "Hindi",
        nativeName: "हिन्दी",
        alphabets: {
            title: "Devanagari Script",
            description: "Hindi is written in Devanagari, consisting of 11 vowels and 33 consonants.",
            items: ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "क", "ख", "ग", "घ", "ङ", "च", "छ"],
        },
        grammar: {
            title: "Grammar Basics",
            description: "Hindi uses postpositions and has grammatical gender for nouns.",
            rules: [
                { title: "Gendered Nouns", example: "Larka (boy) vs Larki (girl) affects verbs." },
                { title: "SOV Structure", example: "Main phal khaata hoon (I fruit eat)." },
            ],
        },
        referralLink: {
            title: "Learn more at Central Hindi Directorate",
            url: "http://chd.nic.in/",
        },
    },
    en: {
        name: "English",
        nativeName: "English",
        alphabets: {
            title: "Latin Alphabet",
            description: "English uses 26 letters of the Latin script.",
            items: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R"],
        },
        grammar: {
            title: "Grammar Basics",
            description: "English is an analytic language with fixed SVO word order.",
            rules: [
                { title: "Articles", example: "Use 'a', 'an', or 'the' before nouns." },
                { title: "SVO Structure", example: "I eat fruit (Subject + Verb + Object)." },
            ],
        },
        referralLink: {
            title: "Learn more at Cambridge English",
            url: "https://www.cambridgeenglish.org/",
        },
    },
    ja: {
        name: "Japanese",
        nativeName: "日本語",
        alphabets: {
            title: "Scripts (Hiragana, Katakana, Kanji)",
            description: "Japanese uses three writing systems: Hiragana, Katakana, and Kanji characters.",
            items: ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "ア", "イ", "ウ", "エ", "オ"],
        },
        grammar: {
            title: "Grammar Basics",
            description: "Japanese is an SOV language with a rich system of particles and honorifics.",
            rules: [
                { title: "Particles", example: "Use 'wa' for topic, 'ga' for subject, 'o' for object." },
                { title: "SOV Structure", example: "Watashi wa ringo o tabemasu (I apple eat)." },
            ],
        },
        referralLink: {
            title: "Learn more at NHK World-Japan",
            url: "https://www.nhk.or.jp/lesson/english/",
        },
    },
    zh: {
        name: "Chinese",
        nativeName: "中文",
        alphabets: {
            title: "Hanzi (Characters)",
            description: "Chinese is written with logographic characters called Hanzi.",
            items: ["一", "二", "三", "人", "口", "日", "月", "山", "水", "火", "木", "金", "土", "天", "地"],
        },
        grammar: {
            title: "Grammar Basics",
            description: "Chinese is an SVO language where meaning is often derived from word order and tones.",
            rules: [
                { title: "Tones", example: "Mandarin has four main tones that change word meanings." },
                { title: "Measure Words", example: "Use specific classifiers when counting objects (e.g., 'yī gè')." },
            ],
        },
        referralLink: {
            title: "Learn more at HSK Standard Course",
            url: "https://www.chinesetest.cn/",
        },
    },
    es: {
        name: "Spanish",
        nativeName: "Español",
        alphabets: {
            title: "Spanish Alphabet",
            description: "Spanish uses the Latin alphabet with the addition of the letter 'ñ'.",
            items: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Ñ", "O", "P", "Q"],
        },
        grammar: {
            title: "Grammar Basics",
            description: "Spanish is an SVO language with gendered nouns and extensive verb conjugations.",
            rules: [
                { title: "Gendered Nouns", example: "Nouns are either masculine (el) or feminine (la)." },
                { title: "Verb Conjugation", example: "Verbs change endings based on the subject (e.g., yo como, tú comes)." },
            ],
        },
        referralLink: {
            title: "Learn more at Instituto Cervantes",
            url: "https://www.cervantes.es/",
        },
    },
    te: {
        name: "Telugu",
        nativeName: "తెలుగు",
        alphabets: { title: "Telugu Script", description: "Syllabic alphabet", items: ["అ", "ఆ", "క", "ఖ"] },
        grammar: { title: "Grammar", description: "Dravidian agglutinative language", rules: [{ title: "SOV", example: "Subject Object Verb" }] },
        referralLink: { title: "Telugu Academy", url: "https://www.teluguacademy.net/" }
    },
    kn: {
        name: "Kannada",
        nativeName: "ಕನ್ನಡ",
        alphabets: { title: "Kannada Script", description: "Syllabic alphabet", items: ["ಅ", "ಆ", "ಕ", "ಖ"] },
        grammar: { title: "Grammar", description: "Dravidian agglutinative language", rules: [{ title: "SOV", example: "Subject Object Verb" }] },
        referralLink: { title: "Kannada Sahitya Parishat", url: "http://kannadasahithya.com/" }
    },
    ml: {
        name: "Malayalam",
        nativeName: "മലയാളം",
        alphabets: { title: "Malayalam Script", description: "Brahmic script", items: ["അ", "ആ", "ക", "ഖ"] },
        grammar: { title: "Grammar", description: "Dravidian language", rules: [{ title: "SOV", example: "Subject Object Verb" }] },
        referralLink: { title: "Malayalam Mission", url: "https://malayalammission.kerala.gov.in/" }
    },
    bn: {
        name: "Bengali",
        nativeName: "বাংলা",
        alphabets: { title: "Bengali Script", description: "Abugida script", items: ["অ", "আ", "ক", "খ"] },
        grammar: { title: "Grammar", description: "Indo-Aryan language", rules: [{ title: "SOV", example: "Subject Object Verb" }] },
        referralLink: { title: "Bangla Academy", url: "https://banglaacademy.org.bd/" }
    },
    gu: {
        name: "Gujarati",
        nativeName: "ગુજરાતી",
        alphabets: { title: "Gujarati Script", description: "Abugida script", items: ["અ", "આ", "ક", "ખ"] },
        grammar: { title: "Grammar", description: "Indo-Aryan language", rules: [{ title: "SOV", example: "Subject Object Verb" }] },
        referralLink: { title: "Gujarat Sahitya Academy", url: "https://gujaratsahityaacademy.com/" }
    },
    fr: {
        name: "French",
        nativeName: "Français",
        alphabets: { title: "French Alphabet", description: "Latin alphabet", items: ["A", "B", "C"] },
        grammar: { title: "Grammar", description: "Romance language", rules: [{ title: "SVO", example: "Subject Verb Object" }] },
        referralLink: { title: "Alliance Française", url: "https://www.alliancefr.org/" }
    },
    de: {
        name: "German",
        nativeName: "Deutsch",
        alphabets: { title: "German Alphabet", description: "Latin alphabet", items: ["A", "B", "C"] },
        grammar: { title: "Grammar", description: "Germanic language", rules: [{ title: "V2 Word Order", example: "Verb is always second" }] },
        referralLink: { title: "Goethe-Institut", url: "https://www.goethe.de/" }
    },
    ru: {
        name: "Russian",
        nativeName: "Русский",
        alphabets: { title: "Cyrillic Script", description: "Cyrillic alphabet", items: ["А", "Б", "В"] },
        grammar: { title: "Grammar", description: "Slavic language", rules: [{ title: "Cases", example: "6 grammatical cases" }] },
        referralLink: { title: "Pushkin Institute", url: "https://www.pushkin.institute/" }
    },
    pt: {
        name: "Portuguese",
        nativeName: "Português",
        alphabets: { title: "Portuguese Alphabet", description: "Latin alphabet", items: ["A", "B", "C"] },
        grammar: { title: "Grammar", description: "Romance language", rules: [{ title: "SVO", example: "Subject Verb Object" }] },
        referralLink: { title: "Instituto Camões", url: "https://www.instituto-camoes.pt/" }
    },
};
