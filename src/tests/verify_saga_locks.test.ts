
import { SAGA_ENGINE, SagaSchema } from '../lib/saga-schema';

describe('SAGA V2 Lock Consolidation', () => {

    const mockSaga: SagaSchema = {
        project: "Test",
        version: "2.0",
        meta_info: { story_id: "test", culture: "en", total_pages: 1, framework: "v2", spatial_logic: "strict" },
        global_locks: { style_engine: "Pixar", environmental_anchors: "City" },
        actor_registry: { "PROT_01": { id: "PROT_01", traits: "Boy" } },
        prop_manifest: { LOCKED_PROPS: [] },
        interaction_rules: {},
        story_sequence: []
    };

    const mockPageData = {
        page: 1,
        action: "Boy walks.",
        zoning: {
            protagonist: "Zone A", // Should become "LEFT THIRD OF FRAME"
            support: "Zone C"      // Should become "Relative to Zone A"
        },
        depth: {
            focus: "Boy - Z1",
            midground: "Car - Z2",
            background: "Building - Z3"
        }
    };

    test('should generate prompt with consolidated SAGA v2 locks', () => {
        const result = SAGA_ENGINE.constructSagaPromptInternal(0, mockPageData, mockSaga);
        const promptText = result.prompt;

        // Spatial Locks
        expect(promptText).toContain("LEFT THIRD OF FRAME");
        expect(promptText).toContain("Protagonist Position: FIXED to Zone A");

        // Depth Locks
        expect(promptText).toContain("[DEPTH PRIORITY - Z-INDEXING MASTER]");
        expect(promptText).toContain("Z-Index 1 (FOREGROUND - SHARP)");
        expect(promptText).toContain("Z3 must have BOKEH effect");
    });

    test('verifySagaLocks should validate prompt correctly', () => {
        const result = SAGA_ENGINE.constructSagaPromptInternal(0, mockPageData, mockSaga);
        const isValid = SAGA_ENGINE.verifySagaLocks(result.prompt);
        expect(isValid).toBe(true);
    });

    test('verifySagaLocks should reject prompts missing required locks', () => {
        const badPrompt = "Just a simple prompt without locks.";
        const isValid = SAGA_ENGINE.verifySagaLocks(badPrompt);
        expect(isValid).toBe(false);
    });
});
