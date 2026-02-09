
import { beatToDirective, Beat } from "../lib/beat-generator";

describe("Beat Reconciliation Logic", () => {
    it("should format granular interaction fields correctly", () => {
        const beat: Beat = {
            page: 1,
            action: "Test Action",
            environment: { notes: "Env" },
            camera: { shotType: "Medium", angle: "Eye-Level", focus: "Test" },
            blocking: { protagonist: "Left", support: "Right" },
            interaction: {
                contact_point: "Wrist",
                tension: "Tight"
            },
            micro_expression: {
                protagonist: "Determined",
                support: "Relieved"
            }
        };

        const directive = beatToDirective(beat);
        expect(directive).toContain("Physics: [Contact: Wrist] [Tension: Tight]");
        expect(directive).toContain("Micro-Expressions: [Protagonist: Determined] [Support: Relieved]");
    });

    it("should format strict zoning correctly", () => {
        const beat: Beat = {
            page: 1,
            action: "Cross",
            environment: { notes: "Env" },
            camera: { shotType: "Medium", angle: "Eye-Level", focus: "Test" },
            blocking: {
                protagonist: "Left",
                support: "Right",
                zone_lock: "Zebra Crossing"
            }
        };

        const directive = beatToDirective(beat);
        expect(directive).toContain("ZONE LOCK: Zebra Crossing");
    });
});
