# GrowNative - Cultural Adventure Stories for Kids

**Production Deployment (Vercel):** [https://grownative-judges.vercel.app/](https://grownative-judges.vercel.app/)

## Overview
GrowNative is an AI-powered storytelling platform that generates cultural adventure stories for kids in multiple languages. It uses Google's Gemini Models and Imagen 3 to create immersive, culturally accurate experiences.

## Tech Stack
- **Framework:** Next.js 15
- **AI Models:** Gemini 1.5 Pro, Gemini 2.0 Flash, Imagen 3
- **Deployment:** Vercel (Production), Google Cloud Storage (Asset Persistence)
- **Architecture:** Server Actions for secure AI orchestration

## 🧠 How We Use Gemini 3
We built this application specifically to leverage the multimodal and reasoning capabilities of the **Gemini 3.0** family.

### 1. Cultural Reasoning (`gemini-3-pro-preview`)
We use Gemini 3 Pro's advanced reasoning to solve "Cultural Hallucination". Instead of translating generic stories, we use it as a **Cultural Oracle**.
- **Input**: "Write a story about breakfast in Tamil."
- **Gemini 3 Logic**: Detects "Tamil" -> Contextualizes "Breakfast" to "Idli/Dosa" instead of "Pancakes" -> Generates a culturally accurate narrative.

### 2. Zero-Shot Visual Consistency (`gemini-3-pro-image-preview`)
We use Gemini 3's **multimodal (Image-to-Image)** capabilities to solve "Character Drift".
- **Step A**: Generate a "Hero Image" for Page 1.
- **Step B**: For Pages 2-10, we feed the **Page 1 raw image buffer** back into the context window of Gemini 3.
- **Result**: The model "sees" the character and renders them in new poses with near-perfect consistency (same shirt, same hair), removing the need for complex LoRA training.

## Security Note 🔐
This project uses **Server Actions** to protect your API Key.
1. Rename `NEXT_PUBLIC_GEMINI_API_KEY` to `GEMINI_API_KEY` in your `.env.local`.
   - *Legacy support for `NEXT_PUBLIC_` key is present but discouraged.*

## Run
```bash
npm install
npm run dev
```

Open http://localhost:3000

## Key Innovation: Visual Anchor Locking ⚓️
This project implements a novel **Visual Anchor Locking** algorithm to solve "Generative Drift" in storybooks.
1. **Phase 1 (Blueprint)**: Generates a "DNA" text description of the character (e.g., "Visual Lock: [Boy, 6yo, unkempt hair, blue shirt]").
2. **Phase 5.1 (Hero Production)**: Generates the FIRST image (Page 1). This becomes the **Anchor Image**.
3. **Phase 5.x (Propagation)**: For Page 2-6, the specific **Page 1 Image Buffer** is fed back into **Gemini 3 Pro Image** as a multimodal reference with the prompt: *"RENDER THE SAME CHARACTERS AS SHOWN IN THE REFERENCE IMAGE."*
4. **Self-Correction Audit**: A vision agent actively compares each new page against the Anchor Image. If the clothing or hair doesn't match, it **rejects the generation** and retries automatically.

## Stub data
Edit `src/lib/stubData.ts` to add more stories, levels, and languages.
