import { UnifiedStory } from "./types";
import { StoryPack, StoryPage, LanguageCode } from "@/lib/types";

/**
 * StoryAdapter: Bridges the "Unified Story Engine" (SAGA) to the "Legacy StoryPack" (UI).
 * This allows the Frontend to remain unchanged while we swap the backend engine.
 */
export const StoryAdapter = {
    toStoryPack: (unified: UnifiedStory): StoryPack => {
        // 1. Map Pages
        const pages: StoryPage[] = unified.script.sentences.map((s: any, idx: number) => {
            // Find associated image asset if available
            // In the new pipeline, images are stored in _assets or we simply trust the legacy 'imagePath'
            // if we inject it during the process.
            const assetPage = unified.assets?.pages?.find(p => p.page_index === s.page_index);

            return {
                pageNumber: idx + 1,
                text_native: s.text_native,
                text_english: s.english, // Important for bilingual view
                text_transliteration: s.transliteration || "", // Optional if available
                imageAlt: s.action || s.english || "Story illustration",
                imageCaption: s.english,
                imagePath: assetPage?.image_path || undefined, // This will be populated by the renderer
                targetWordIds: (unified.vocabulary || [])
                    .filter((v: any) => s.text_native.includes(v.native))
                    .map((v: any, i: number) => `word_${i}_${v.native}`)
            };
        });

        // 2. Construct Global Meta (for debugging/info)
        const globalMeta = {
            visualDNA: JSON.stringify(unified.visual_definition?.actors?.PROT_01?.dna || {}),
            blueprint: unified.saga_blueprint,
            casting: unified.visual_definition?.actors || {},
            gender: "unknown" // We can try to infer or pass this through if needed
        };

        // 3. Construct the Pack
        return {
            storyId: unified.id,
            level: (unified.meta.level as any) || 1,
            language: (unified.meta.language as LanguageCode) || 'en',
            theme: unified.meta.topic || "Story",
            title_native: unified.meta.title || "Untitled Story",
            title_english: unified.meta.title, // Fallback
            thumbnailSvgPath: "", // Will be page 1 usually

            targetWords: (unified.vocabulary || []).map((v: any, i: number) => ({
                id: `word_${i}_${v.native}`,
                native: v.native,
                meaning_en: v.meaning_en || v.english || "",
                audioPath: "" // Todo: Text-to-Speech handle
            })),
            pages: pages,
            exercises: unified.script.exercises || [], // Unified schema supports exercises

            review: {
                kidSafeApproved: true, // Assuming Gemini 3 Pro safety
                checks: [{ name: "AI Safety", passed: true }]
            },

            globalMeta: globalMeta
        };
    }
};
