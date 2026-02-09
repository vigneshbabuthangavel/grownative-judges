# Cultural & Linguistic Context Framework (Proposed)

> **Objective**: Replace "Cache Filler" with a high-value "Pedagogical & Cultural Anchor" (~2500 tokens). ensure strict adherence to Level constraints and Cultural Authenticity.

## The Logic
Instead of "Lorem Ipsum" padding, we inject a sophisticated **System Persona** into the cache. This forces the model to "roleplay" as a Native Cultural Expert for the entire session.

## The Data Structure (JSON)

We will construct a dynamic `CULTURAL_CONTEXT` object based on the user's selected language (e.g., Tamil).

### 1. Linguistic Foundation (The "Code")
```json
{
  "language": {
    "name": "Tamil",
    "family": "Dravidian",
    "structure": "Agglutinative (SOV order)",
    "script_rules": {
      "level_2_constraints": [
        "Avoid complex Sandhi rules (Punarcci)",
        "Use simple colloquial verbs (Pechu Vazhakku) for dialogue",
        "Max word length: 4-6 letters (where possible)"
      ]
    }
  }
}
```

### 2. Cultural Atmosphere (The "Vibe")
This fixes the "Generic American Park" background issue.
```json
{
  "visual_identity": {
    "architecture": "Tropical, concrete flat-roof homes, colorful compounds, temple gopurams in distance",
    "environment": "Busy streets, vibrant markets, bright sunlight, lush greenery (banana/coconut trees)",
    "clothing": {
      "men": "Shirts with dhoti/veshti or trousers",
      "women": "Saree or Salwar Kameez",
      "boys": "Shorts and t-shirts (modern but modest)",
      "girls": "Pavadai sattai or frock"
    }
  },
  "social_interplay": {
    "elders": "Highly respected. Addressed as 'Thatha' (Grandpa) / 'Paati' (Grandma) even if unrelated.",
    "interactions": "Communal. Helping strangers is normal behavior (e.g., crossing the road)."
  }
}
```

### 3. Pedagogical Rubric (The "Rules")
We pad the cache with the *entire* Level 1-8 definition rubric. This adds ~1000 tokens of pure value.

> **Level 2 Definition**:
> *   **Syntax**: Simple sentences (Subject-Object-Verb). No passive voice.
> *   **Vocabulary**: Daily life, family, animals, school. High frequency ratings.
> *   **Cognitive Load**: One idea per sentence. Linear narrative. No flashbacks.

## Implementation Strategy
1.  **Create `lib/cultural-db.ts`**: Store these presets for supported languages (Tamil, Hindi, Spanish, English).
2.  **Update `context-cache-api.ts`**:
    *   Import the specific cultural object.
    *   Serialize it into the `systemInstruction` text.
    *   Append the full "Level 1-8 Rubric".
    *   This naturally exceeds 2048 tokens without "dummy text".

## Why this improves the "Cat" vs "Premise" bug
By priming the model with "Social Interplay: Helping strangers is normal", the model is primed to accept the "Helping Old Man" premise as a *culturally valid* story, rather than hallucinating a generic "Pet Cat" story which is a common default in Western-training data for children.
