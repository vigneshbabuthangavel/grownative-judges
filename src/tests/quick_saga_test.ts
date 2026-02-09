
import { SAGA_ENGINE } from '../lib/saga-schema';

const mockSaga = {
    "meta": {
        "title": "Arun's Crossing",
        "style_lock": "Pixar-esque",
        "cultural_context": "Tamil Nadu"
    },
    "actors": [],
    "environment": {},
    "sequence": [
        {
            "panel_id": 1,
            "narrative_beat": "Introduction",
            "action": "Arun walking."
        },
        {
            "panel_id": 2,
            "narrative_beat": "The Threat",
            "action": "Cars fast."
        }
    ]
};

console.log("--- TEST SAGA PARSING ---");
const p0 = SAGA_ENGINE.constructSagaPrompt(0, { english: "text" }, mockSaga);
console.log("Page 0 (Target 1):", p0.prompt.includes("Error:") ? "FAIL" : "SUCCESS");
if (p0.prompt.includes("Error:")) console.log(p0.prompt);

const p1 = SAGA_ENGINE.constructSagaPrompt(1, { english: "text" }, mockSaga);
console.log("Page 1 (Target 2):", p1.prompt.includes("Error:") ? "FAIL" : "SUCCESS");
if (p1.prompt.includes("Error:")) console.log(p1.prompt);
