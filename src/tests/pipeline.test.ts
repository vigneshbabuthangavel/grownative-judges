import { processFullStoryPipeline } from '@/lib/gemini-api';
import { loadAssetsAction, saveAssetAction } from '@/app/actions/assets';
import { generateContentServer } from '@/app/actions/gemini';

// Mocks
jest.mock('@/app/actions/assets'); // MOCK ACTIONS
jest.mock('@/app/actions/gemini');

// Helper to mock Gemini responses
const mockGeminiResponse = (text: string, meta: any = {}) => ({
    text,
    candidates: [{ content: { parts: [{ text }] } }],
    promptFeedback: {},
    meta
});

describe('Story Pipeline Logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mocks
        (generateContentServer as jest.Mock).mockResolvedValue(mockGeminiResponse("Mock Text"));
        (loadAssetsAction as jest.Mock).mockResolvedValue(null);
        (saveAssetAction as jest.Mock).mockResolvedValue(true);
    });

    it('should use CACHED assets if available (Repurposing)', async () => {
        // Setup Cache Hit
        (loadAssetsAction as jest.Mock).mockResolvedValue(['base64_img_1', 'base64_img_2']);

        // Mock sub-phases to return simple data
        (generateContentServer as jest.Mock).mockImplementation((model, prompt) => {
            const p = JSON.stringify(prompt);
            // Match "Write a short" or "sentences" which are in the actual prompt
            if (p.includes("Write a short") || p.includes("sentences")) {
                return Promise.resolve(mockGeminiResponse(JSON.stringify({ sentences: [{ english: "A" }, { english: "B" }] })));
            }
            return Promise.resolve(mockGeminiResponse("{}"));
        });

        const onPhase = jest.fn();

        await processFullStoryPipeline("Topic", "Premise", 1, "en", "boy", onPhase, { enableImages: true });

        // VERIFY: Asset Action loaded
        expect(loadAssetsAction).toHaveBeenCalled();

        // VERIFY: Generation NOT called for images (only text phases ran)
        expect(onPhase).toHaveBeenCalledWith(expect.objectContaining({
            name: "Phase 6: Visuals Repurposed (Cache Hit ⚡)",
            status: 'success'
        }));
    });

    it('should GENERATE and SAVE assets if cache missing', async () => {
        // Setup Cache Miss
        (loadAssetsAction as jest.Mock).mockResolvedValue(null);

        // Mock Image Generation Return
        (generateContentServer as jest.Mock).mockImplementation((model, prompt: any) => {
            if (model.includes("gemini-2.0-flash-exp")) {
                // Return Image Structure
                return Promise.resolve({
                    candidates: [{ content: { parts: [{ inlineData: { data: "new_image_base64" } }] } }]
                });
            }
            // Text Fallbacks
            const p = JSON.stringify(prompt);
            if (p.includes("Write a short") || p.includes("sentences")) {
                return Promise.resolve(mockGeminiResponse(JSON.stringify({ sentences: [{ english: "A" }] })));
            }
            return Promise.resolve(mockGeminiResponse("{}"));
        });

        const onPhase = jest.fn();
        await processFullStoryPipeline("Topic", "Premise", 1, "en", "boy", onPhase, { enableImages: true });

        // VERIFY: Save called
        expect(saveAssetAction).toHaveBeenCalledWith("en", 1, "Topic", 0, "new_image_base64");
    });
});
