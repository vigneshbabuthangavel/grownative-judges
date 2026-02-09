# 🏆 DevPost Submission Tips

Use these sections to fill out your Hackathon submission description.

## 💡 Inspiration
We wanted to solve the "Resource Desert" problem for heritage languages. Apps like Duolingo are great for learners, but native speakers (children of immigrants) often lose their mother tongue because they lack *engaging, culturally relevant* reading material. We built MotherTongue to generate infinite, level-appropriate books that feel "real."

## ⚙️ What it does
MotherTongue Stories is an AI-powered literacy portal. Parents select a language (e.g., Tamil, Spanish), a reading level (1-8), and a topic (e.g., "Space Station"). The system:
1.  **Designs** a pedagogical blueprint using **Gemini 1.5 Flash**.
2.  **Writes** the story using **Gemini 1.5 Pro**, strictly adhering to grammar rules loaded via **Context Caching**.
3.  **Illustrates** the book using **Imagen 3**, ensuring the main character looks exactly the same on every page using our proprietary **"Visual DNA" technique**.

## 🔧 How we built it
*   **Gemini Context Caching**: We utilized the new Caching API to store complex linguistic schemas, making the agent "fluent" in specific dialects without massive repetitive prompts.
*   **Visual Consistency Loop**: We daisy-chained Gemini Pro Vision with Imagen. By "seeing" the first image and extracting the character's features into text, we effectively created a "seed" for consistency.
*   **Stack**: Next.js 14, TypeScript, Vercel AI SDK patterns.

## 🧠 Challenges we ran into
*   **Character Consistency**: AI generative art often changes the character's face every page. We solved this by implementing an internal "Vision Audit" step where Gemini checks its own work against the character description.
*   **API Limits**: We hit quota limits quickly, so we implemented exponential backoff and optimized our prompts using Flash for the logic-heavy steps.

## 🏅 Accomplishments that we're proud of
*   Successfully implementing **Context Caching** in a production-like Next.js environment.
*   Achieving consistent character generation in a web-based storybook format.
