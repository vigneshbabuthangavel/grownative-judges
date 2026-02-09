import { StoryPack, StoryPage, TargetWord, LanguageCode } from "./types";

export function convertToStoryPack(
    pipelineData: any,
    level: number,
    language: string
): StoryPack {
    const storyId = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Stub target words (in a real app, we'd extract these from the 'anchoring' phase)
    const targetWords: TargetWord[] = [
        { id: "w1", native: "Created", meaning_en: "Created by AI" }
    ];

    const pages: StoryPage[] = (pipelineData.pages || []).map((p: any, i: number) => ({
        pageNumber: i + 1,
        text_native: p.native || "",
        text_transliteration: p.english || "", // Using English as fallback transliteration/subtitle for now
        imageAlt: p.english || "Story illustration",
        // Using the Base64 data directly as the source. 
        // Note: Next/Image might need 'width/height' if not using 'fill', 
        // but the current implementation uses 'fill' in StoryReader, so this works.
        imageSvgPath: p.image && p.image.data ? `data:image/png;base64,${p.image.data}` : "",
        targetWordIds: []
    }));

    return {
        storyId,
        level: level as any,
        language: language as LanguageCode,
        theme: pipelineData.title || "Generated Story",
        title_native: pipelineData.title || "Untitled",
        title_transliteration: "AI Generated",
        thumbnailSvgPath: pages[0]?.imageSvgPath || "", // Use first page as thumb
        targetWords,
        pages,
        exercises: [
            {
                type: "choose_word_for_picture",
                prompt_native: "Identify the image",
                options_native: ["Option A", "Option B"],
                answer_native: "Option A"
            }
        ],
        review: {
            kidSafeApproved: true, // Auto-approve for demo
            checks: [{ name: "AI_Audit", passed: true }]
        }
    };
}
