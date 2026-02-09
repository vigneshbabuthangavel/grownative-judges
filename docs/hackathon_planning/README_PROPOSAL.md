# 📚 MotherTongue Stories

> **AI-First Native Literacy Engine** powered by Google Gemini 1.5 Pro & Imagen 3.

MotherTongue Stories is a privacy-first, multilingual storytelling platform that dynamically generates culturally authentic reading materials for children. It bridges the gap between home languages and formal education using advanced pedagogical prompting.

## 🚀 The "Secret Sauce"

This isn't just a text generator. We built a **Multi-Modal Generative Pipeline** that ensures:

1.  **Visual DNA Consistency**: We solved the "inconsistent character" problem in AI stories.
    *   *Step 1*: Generate Page 1 illustration.
    *   *Step 2*: Use Gemini Pro Vision to extract a "Visual DNA" text descriptor of the character (e.g., "girl, 8yo, red braid, blue tunic").
    *   *Step 3*: Inject this DNA into the prompt for Page 2, 3, 4... ensuring the character looks the same throughout the book.

2.  **Context Caching (Gemini 1.5)**:
    *   We use **Context Caching** to load heavy linguistic rules (grammar tiers, cultural axioms) once.
    *   This reduces latency and ensures every story adheres to strict pedagogical standards (ACTFL/CEFR levels) without re-sending massive prompts.

## 🛠️ Tech Stack

*   **Core**: Next.js 14, TypeScript, Tailwind CSS
*   **AI Orchestration**: Google Generative AI SDK (Node.js)
*   **Models used**:
    *   `gemini-1.5-pro`: Story Logic & Visual DNA Extraction
    *   `gemini-1.5-flash`: Fast Planning & Audits
    *   `imagen-3`: High-fidelity Children's Book Illustrations
*   **Infrastructure**: Server-Side Context Caching (`GoogleAICacheManager`)

## 📦 Installation

```bash
npm install
npm run dev
```

## 🌟 Key Features

*   **Pedagogical Engine**: Generates content based on Level 1-8 difficulty scales.
*   **Safety Audit**: Every story is auto-audited by a separate "Teacher AI" agent before display.
*   **Local-First**: No data tracking, designed for privacy.
