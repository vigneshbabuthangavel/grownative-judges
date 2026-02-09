
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API key found. Please set GEMINI_API_KEY in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });

const STORY_ID = "story_1770505956121_q306rczmh";
const STORIES_PATH = path.join(process.cwd(), 'src/data/published-stories.json');

async function generateVocabularyForText(text: string, language: string, level: number) {
    const prompt = `
        Analyze this story text (Language: ${language}, Level: ${level}) and extract a vocabulary glossary.
        
        STORY TEXT:
        "${text}"

        GOAL: Identify 2-3 key words per page that are valuable for a learner. 
        - Include challenging nouns, verbs, and adjectives.
        - Exclude very basic words (the, is, and, etc.) unless Level 1.
        
        OUTPUT JSON ARRAY:
        [
            { 
                "native": "Word in ${language}", 
                "transliteration": "Latin script (if non-latin, optional)", 
                "meaning_en": "English definition",
                "type": "noun" | "verb" | "adjective" 
            }
        ]
    `;

    try {
        const result = await model.generateContent(prompt);
        const jsonText = result.response.text();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Error generating vocab:", e);
        return [];
    }
}

async function fixStory() {
    console.log(`Reading stories from ${STORIES_PATH}...`);
    const rawData = fs.readFileSync(STORIES_PATH, 'utf-8');
    const stories = JSON.parse(rawData);

    const storyIndex = stories.findIndex((s: any) => s.storyId === STORY_ID);
    if (storyIndex === -1) {
        console.error(`Story ${STORY_ID} not found.`);
        process.exit(1);
    }

    const story = stories[storyIndex];
    console.log(`Found story: ${story.title_native || story.title}`);

    // Check if targetWords already exists
    if (!story.targetWords) {
        story.targetWords = [];
    }

    let wordIdCounter = story.targetWords.length + 1;
    let globalWordsMap = new Map(); // native -> wordObj

    // Populate existing words map
    for (const w of story.targetWords) {
        globalWordsMap.set(w.native, w);
    }

    console.log("Processing pages...");
    for (const page of story.pages) {
        const text = page.text_native || page.native; // Handle different schemas
        if (!text) continue;

        console.log(` Generating vocab for page ${page.pageNumber || page.page_index}...`);
        const newWords = await generateVocabularyForText(text, story.language, story.level);

        const pageWordIds: string[] = [];

        for (const w of newWords) {
            let existing = globalWordsMap.get(w.native);
            if (!existing) {
                const newId = `w${wordIdCounter++}`;
                const newWordObj = {
                    id: newId,
                    native: w.native,
                    meaning_en: w.meaning_en,
                    type: w.type,
                    transliteration: w.transliteration || ""
                };
                story.targetWords.push(newWordObj);
                globalWordsMap.set(w.native, newWordObj);
                existing = newWordObj;
                console.log(`  Added new word: ${w.native} (${w.meaning_en})`);
            }
            if (!pageWordIds.includes(existing.id)) {
                pageWordIds.push(existing.id);
            }
        }

        page.targetWordIds = pageWordIds;
    }

    console.log("Saving updated stories...");
    fs.writeFileSync(STORIES_PATH, JSON.stringify(stories, null, 2));
    console.log("Done!");
}

fixStory();
