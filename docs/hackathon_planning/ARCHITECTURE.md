# 🏗️ System Architecture

This document outlines the **Multi-Modal Agentic Workflow** powering MotherTongue Stories.

## The "Visual DNA" Pipeline

Our core innovation is the sequential generation loop that "locks" character consistency.

```mermaid
graph TD
    User[User Input: Topic & Language] --> Planner
    
    subgraph "Phase 0: Context Cache"
        Rules[Linguistic Rules] --> Cache[(Gemini Context Cache)]
        Anchor[Cultural Anchors] --> Cache
    end

    subgraph "Phase 1: Logic (Gemini 1.5 Flash)"
        Cache --> Planner[Planning Agent]
        Planner --> Blueprint{Story Blueprint}
    end

    subgraph "Phase 2: Authoring (Gemini 1.5 Pro)"
        Blueprint --> Author[Author Agent]
        Author --> StoryJSON[Story Content (JSON)]
    end

    subgraph "Phase 3: Visual Chain (Imagen + Vision)"
        StoryJSON --> Page1[Gen Image 1]
        Page1 --> Vision[Gemini Vision Analysis]
        Vision --> DNA[("Visual DNA" Prompts)]
        
        DNA --> Page2[Gen Image 2]
        DNA --> Page3[Gen Image 3]
        DNA --> Page4[Gen Image 4]
    end

    Page4 --> Client[React Client]
```

## Key Components

### 1. Context Cache Manager (`src/lib/context-cache-api.ts`)
*   **Function**: Pre-loads extensive linguistic guidelines (grammar rules per level, cultural "do's and don'ts").
*   **Benefit**: drastically reduces input token costs and improves strict adherence to language rules.

### 2. Prompt Engine (`src/lib/prompt-engine.ts`)
*   **Function**: Constructs the "Blueprint" prompt. Ensures that the story has a logical arc before any text is written.

### 3. Visual DNA Extractor (`src/lib/gemini-image-api.ts`)
*   **Function**: Takes the first generated image, feeds it back into Gemini Pro Vision to extract a 25-word physical description. This description is used as a `character_reference` for all subsequent images.
