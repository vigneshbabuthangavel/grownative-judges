'use server';

import fs from 'fs';
import path from 'path';
import { enrichVocabularyAction } from './enrich-vocabulary';

const STORIES_PATH = path.join(process.cwd(), 'src/data/published-stories.json');

export async function backfillVocabularyAction() {
    try {
        const raw = fs.readFileSync(STORIES_PATH, 'utf-8');
        let stories = JSON.parse(raw);
        let updatedCount = 0;
        let errors = [];

        console.log("Starting Vocabulary Backfill...");

        for (let i = 0; i < stories.length; i++) {
            const story = stories[i];

            // Check if vocabulary is missing or empty
            if (!story.targetWords || story.targetWords.length === 0) {
                console.log(`Backfilling for: ${story.title} (${story.storyId})`);

                // Construct full text
                const fullText = story.pages.map((p: any) => p.native || p.text_native).join(" ");

                // Call existing enrichment action
                // Use level 1 if undefined, language 'en' if undefined (fallback)
                const lang = story.language || 'en';
                const level = story.level || 1;

                const result = await enrichVocabularyAction(lang, level, fullText);

                if (result.status === 'success' && result.vocabulary) {
                    // Map the simple vocabulary result to the targetWords structure if needed,
                    // OR if targetWords structure matches, just assign.
                    // enrichVocabularyAction returns [ { native, transliteration, meaning_en, type } ]
                    // published-stories.json targetWords expects: { id, word, translation, type, ...? }
                    // Let's check the schema compatibility.

                    // The vocab action returns simple objects. We need to assign IDs.
                    const enhancedVocab = result.vocabulary.map((w: any, idx: number) => ({
                        id: `word_${Date.now()}_${idx}`,
                        word: w.native,
                        translation: w.meaning_en,
                        type: w.type,
                        transliteration: w.transliteration // Optional, some stories have it
                    }));

                    stories[i].targetWords = enhancedVocab;
                    updatedCount++;

                    // Respect rate limits - wait a bit between calls
                    await new Promise(r => setTimeout(r, 2000));
                } else {
                    console.error(`Failed to enrich ${story.storyId}: ${result.message}`);
                    errors.push(`${story.storyId}: ${result.message}`);
                }
            }
        }

        if (updatedCount > 0) {
            fs.writeFileSync(STORIES_PATH, JSON.stringify(stories, null, 2));
            console.log(`Backfill Complete. Updated ${updatedCount} stories.`);
        } else {
            console.log("No stories needed backfilling.");
        }

        return {
            success: true,
            updatedCount,
            message: `Updated ${updatedCount} stories.`,
            errors: errors.length > 0 ? errors : undefined
        };

    } catch (e: any) {
        console.error("Backfill Script Failed:", e);
        return { success: false, message: e.message };
    }
}
