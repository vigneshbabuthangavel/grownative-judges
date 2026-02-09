
import { refineBeatsWithStory, BeatSheetResult } from "../lib/beat-generator";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
if (!apiKey) console.warn("⚠️ API Key missing in test environment!");
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// REAL BEATS (From File)
const REAL_BEATS: BeatSheetResult = {
    "project_settings": {
        "shot_type_lock": "Wide Shot Only",
        "resolution_limit": "500px",
        "spatial_logic": "Sidewalk A -> Crossing -> Sidewalk B"
    },
    "beats": [
        {
            "page": 1,
            "action": "Wide shot. ZONE: Sidewalk A. Shows Arun, wearing a blue shirt and red backpack, on Sidewalk A, preparing to cross. Heavy traffic is visible. Elderly man is visible further down Sidewalk A.",
            "environment": { "notes": "Busy city street", "timeOfDay": "Morning" },
            "camera": { "shotType": "Wide", "angle": "Eye-Level", "focus": "Scene" },
            "blocking": { "protagonist": "Sidewalk A", "support": "Sidewalk A" }
        },
        // ... skipping similar pages ...
        {
            "page": 6,
            "action": "Wide shot. ZONE: Sidewalk A. Arun reaches the old man and gently takes his hand.",
            "environment": { "notes": "Traffic noise", "timeOfDay": "Morning" },
            "camera": { "shotType": "Wide", "angle": "Eye-Level", "focus": "Arun and elderly man." },
            "blocking": { "protagonist": "Sidewalk A", "support": "Sidewalk A" }
        },
        {
            "page": 7,
            "action": "Wide shot. ZONE: Sidewalk A. Arun helps the old man cross the street. They are in the middle of the road.",
            // THIS IS THE CRITICAL FAIL POINT: Text says "Cross", Beat says "Sidewalk A" (implied/legacy).
            // We expect Refinement to change Zone to "Zebra Crossing"
            "environment": { "notes": "Crossing", "timeOfDay": "Morning" },
            "camera": { "shotType": "Wide", "angle": "Eye-Level", "focus": "Crossing" },
            "blocking": { "protagonist": "Middle of road", "support": "Middle of road" }
        }
    ]
};

const STORY_SCRIPT = [
    { english: "Arun walks down the street." },
    { english: "..." },
    { english: "..." },
    { english: "..." },
    { english: "..." },
    { english: "Arun reaches him and takes his hand." }, // P6
    { english: "They cross the road carefully." } // P7
];

describe("Real Data Stress Test", () => {
    jest.setTimeout(60000);

    it("should refine the real V1 beats", async () => {
        console.log("Running Refinement on Real Beats...");

        const refined = await refineBeatsWithStory({
            model: model as any,
            script: STORY_SCRIPT,
            originalBeats: REAL_BEATS,
            premise: "Boy helps old man cross street"
        });

        const p7 = refined.beats.find(b => b.page === 7);
        console.log("Refined P7 Blocking:", p7?.blocking);

        // Expectation: Zone Lock should be added/updated
        expect(p7?.blocking?.zone_lock).toMatch(/Crossing|Zebra|Road/i);
    });
});
