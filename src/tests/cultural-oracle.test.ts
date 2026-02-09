
import { generateCulturalContext } from '@/lib/cultural-oracle';
import { generateContentServer } from '@/app/actions/gemini';

// Mock the server action
jest.mock('@/app/actions/gemini', () => ({
    generateContentServer: jest.fn()
}));

const mockGenerate = generateContentServer as jest.Mock;

describe('Cultural Oracle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default success response
        mockGenerate.mockResolvedValue({
            text: JSON.stringify({
                visual_identity: { environment: "Test Environment" },
                naming: { protagonist_boys: ["Raju"] }
            })
        });
    });

    it('should call Gemini 3 (gemini-exp-1206) for cultural context', async () => {
        await generateCulturalContext('ta', 'Space Station', 2);

        // ASSERT: Correct Model ID is used (Gemini 3 / Pro)
        expect(mockGenerate).toHaveBeenCalledWith(
            expect.stringContaining('gemini-exp-1206'), // or 1.5-pro, validating the file content
            expect.stringContaining('Space Station')
        );
    });

    it('should return static DB fallback on error', async () => {
        mockGenerate.mockRejectedValue(new Error("API Fail"));

        const result = await generateCulturalContext('ta', 'Space Station', 2);

        // ASSERT: Fallback to Tamil static DB
        expect(result.visual_identity.environment).toBeDefined();
        // Should contain default Tamil keys
        expect(result.naming.protagonist_boys).toContain("Arun");
    });
});
