# The "Casting Call" Architecture (Visual Consistency Pivot)

> **Feature Highlight**: How "Proactive Casting" solved the "Leo/Lion" semantic bleed and visual drift in Generative Storytelling.

## The Problem: Semantic Bleed & Visual Drift
In traditional Generative AI pipelines (Text-to-Image), character consistency is a massive challenge.

1.  **Semantic Bleed**: If a character is named "Leo", image models often hallucinate a "Lion" because the token "Leo" is semantically close to "Lion".
2.  **Visual Drift**: If Page 1 generates a "Small Boy with Blue Shirt", but Page 2 generates a "Small Boy with Green Shirt", the visual narrative breaks.
3.  **Reactive Failure**: Previous methods used "Visual DNA Extraction" (Generate Image 1 -> Analyze it -> Prompt Image 2). If Image 1 was wrong (e.g., generated a Lion), the entire book became about a Lion.

## The Solution: "Proactive Casting" (The Director Mode)
We pivoted to an **Animation Studio Workflow**. Instead of letting the AI "guess and drift", we force it to follow a strict production pipeline.

### 1. The Casting Sheet (Blueprint)
Before a single word of the story is written, the **Prompt Engine** generates a strict "Casting Sheet" in the JSON Blueprint.
*   **Protagonist**: Defined purely by visual descriptors (e.g., "Small Indian boy, 6 years old, denim shorts"). **Names are stripped** to prevent semantic bleed.
*   **Support**: Defined similarly (e.g., "Elderly man, grey beard").

### 2. The Casting Call (Phase 2.5)
Before generating scenes, the pipeline runs a **"Casting Call"**.
*   We generate a specific **Reference Image** for the Protagonist and Support character in a neutral pose.
*   This image serves as the "Actor" for the movie.

### 3. Set Design (Location Locking)
The AI generates a canonical **Primary Location** (e.g., "A sunny park with an oak tree").
*   This description is injected into every prompt as the `scene_setting`.
*   We allow "Action Adaptations" (e.g., if the story moves to a street, the prompt engine appends context), but the base style of the world remains locked.

### 4. Scene Composition (Director)
For every page of the story:
*   We do not just send the text (e.g., "Leo walked to the store").
*   We **Inject the Casting Description** explicitly into the prompt context:
    > "Scene: Leo walked to the store.
    > **PROTAGONIST MANDATE**: Use character: Small Indian boy, 6 years old, denim shorts..."
*   **Negative Prompting**: We explicitly ban "Monsters, text, blurry, deformed" to keep the vector style clean.

## Result
*   **Consistency**: "Leo" looks like the same boy on Page 1 and Page 5.
*   **Safety**: "Leo" is never drawn as a Lion because the visual prompt only says "Small boy".
*   **Quality**: Context-aware prompts Ensure the background matches the action (e.g., "Crossing street" = "Render Street Scene").

---
**Technical Implementation**: See `src/lib/gemini-api.ts` (Phase 2.5 and Phase 5 Loop).
