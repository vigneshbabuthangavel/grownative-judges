import { SAGA_ENGINE } from "../lib/saga-schema";

describe("SAGA Engine (Strict Mode)", () => {
    const mockSaga = {
        global_locks: { style_engine: "Pixar-esque 3D" },
        actor_registry: {
            PROT_01: { id: "PROT_01", name: "Sofia", dna: { hair: "brown" }, clothing: { top: "yellow" } }
        },
        sequence: [
            { page_index: 0, action: "Establishing shot", zoning: "Center", depth: { focus: "Sofia" } },
            { page_index: 1, action: "Action shot", zoning: "Center", depth: { focus: "Sofia" } }
        ]
    };

    it("should generate a Wide Establishing Shot for Page 1 and Wide Shot for Page 2", () => {
        const prompt1 = SAGA_ENGINE.constructSagaPrompt(0, {}, mockSaga);
        expect(prompt1.prompt).toContain("WIDE ANGLE ESTABLISHING SHOT");

        const prompt2 = SAGA_ENGINE.constructSagaPrompt(1, {}, mockSaga);
        expect(prompt2.prompt).toContain("WIDE ANGLE SHOT");
        expect(prompt2.prompt).not.toContain("ESTABLISHING");
    });

    it("should generate a Close-Up shot when specified in the action", () => {
        const closeUpSaga = {
            ...mockSaga,
            sequence: [
                { page_index: 0, action: "Wide shot", zoning: "Center" },
                { page_index: 1, action: "Close up of Sofia's face", zoning: "Center" }
            ]
        };
        const prompt = SAGA_ENGINE.constructSagaPrompt(1, {}, closeUpSaga);
        expect(prompt.prompt).toContain("CLOSE-UP SHOT");
    });

    it("should pass SAGA verification for correctly formatted prompts with Spatial Locks", () => {
        const prompt = SAGA_ENGINE.constructSagaPrompt(0, {}, mockSaga);
        const isValid = SAGA_ENGINE.verifySagaLocks(prompt.prompt);
        expect(isValid).toBe(true);
    });

    it("should support page_index in SCENE BLUEPRINT template", () => {
        const prompt = SAGA_ENGINE.constructSagaPrompt(1, {}, mockSaga);
        expect(prompt.prompt).toContain("Page: 1");
    });

    it("should reinforce traits when using character NAME instead of ID", () => {
        const sagaWithName = {
            ...mockSaga,
            sequence: [
                { page_index: 0, action: "Sofia walks in the garden", zoning: "Center" }
            ]
        };
        const prompt = SAGA_ENGINE.constructSagaPrompt(0, {}, sagaWithName);
        expect(prompt.prompt).toContain("[VISUAL CONTEXT (PROT_01): hair: brown, wearing top: yellow]");
    });

    it("should support universal DNA mapping for creatures", () => {
        const creatureSaga = {
            ...mockSaga,
            actor_registry: {
                CREATURE_01: { id: "CREATURE_01", name: "Glowbird", dna: { color: "blue", glowing: true } }
            },
            sequence: [
                { page_index: 0, action: "The Glowbird flies", zoning: "Center" }
            ]
        };
        const prompt = SAGA_ENGINE.constructSagaPrompt(0, {}, creatureSaga);
        expect(prompt.prompt).toContain("color: blue, glowing: true");
    });
});
