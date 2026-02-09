'use server';

import fs from 'fs';
import path from 'path';
import { enrichVocabularyAction } from './enrich-vocabulary';

const STORIES_PATH = path.join(process.cwd(), 'src/data/published-stories.json');

export async function clearStoryVocabulary(storyId: string) {
    try {
        const raw = fs.readFileSync(STORIES_PATH, 'utf-8');
        let stories = JSON.parse(raw);

        const storyIndex = stories.findIndex((s: any) => s.storyId === storyId);
        if (storyIndex === -1) return { success: false, message: "Story not found" };

        stories[storyIndex].targetWords = [];

        fs.writeFileSync(STORIES_PATH, JSON.stringify(stories, null, 2));
        return { success: true, message: "Vocabulary cleared" };
    } catch (e: any) {
        console.error("Clear Vocabulary Failed:", e);
        return { success: false, message: e.message };
    }
}

export async function generateStoryVocabulary(storyId: string) {
    try {
        const raw = fs.readFileSync(STORIES_PATH, 'utf-8');
        let stories = JSON.parse(raw);

        const storyIndex = stories.findIndex((s: any) => s.storyId === storyId);
        if (storyIndex === -1) return { success: false, message: "Story not found" };

        const story = stories[storyIndex];

        // Construct full text
        const fullText = story.pages.map((p: any) => p.native || p.text_native).join(" ");
        const lang = story.language || 'en';
        const level = story.level || 1;

        const result = await enrichVocabularyAction(lang, level, fullText);

        if (result.status === 'success' && result.vocabulary) {
            // Map to targetWords structure
            // Note: published-stories.json formats vary, we align with the "native, meaning_en, type" structure
            // and add IDs. We also map 'meaning_en' from the enrich action which might return it directly.

            const newWords = result.vocabulary.map((w: any, idx: number) => ({
                id: `w_${Date.now()}_${idx}`, // Simple unique ID
                native: w.native,
                meaning_en: w.meaning_en,
                type: w.type,
                transliteration: w.transliteration
            }));

            stories[storyIndex].targetWords = newWords;

            fs.writeFileSync(STORIES_PATH, JSON.stringify(stories, null, 2));
            return { success: true, count: newWords.length, message: "Vocabulary generated" };
        } else {
            return { success: false, message: result.message || "Generation failed" };
        }

    } catch (e: any) {
        console.error("Generate Vocabulary Failed:", e);
        return { success: false, message: e.message };
    }
}

export async function updateStoryPageText(storyId: string, pageIndex: number, newText: string) {
    try {
        const raw = fs.readFileSync(STORIES_PATH, 'utf-8');
        const stories = JSON.parse(raw);

        const storyIndex = stories.findIndex((s: any) => s.storyId === storyId);
        if (storyIndex === -1) return { success: false, message: "Story not found" };

        if (!stories[storyIndex].pages || !stories[storyIndex].pages[pageIndex]) {
            return { success: false, message: "Page not found" };
        }

        stories[storyIndex].pages[pageIndex].text_native = newText;
        // Also update legacy 'native' field if present for compatibility
        if (stories[storyIndex].pages[pageIndex].native) {
            stories[storyIndex].pages[pageIndex].native = newText;
        }

        fs.writeFileSync(STORIES_PATH, JSON.stringify(stories, null, 2));
        return { success: true };
    } catch (e: any) {
        console.error("Update Page Text Failed:", e);
        return { success: false, message: e.message };
    }
}
