"use server";

import { generateContentServer } from "@/app/actions/gemini";
import { CULTURAL_DB } from "./cultural-db";
import fs from 'fs';
import path from 'path';

// Slugify helper for cache keys
function slugify(text: string): string {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

/**
 * CULTURAL ORACLE (Gemini 3 Powered + Cached)
 * Acts as an expert Anthropologist to generate deep, bespoke cultural context.
 * Uses filesystem cache to save costs on repeated queries.
 */
export async function generateCulturalContext(language: string, topic: string, level: number): Promise<any> {
  const slug = slugify(`${language}_${topic}_level${level}`);
  const cacheDir = path.join(process.cwd(), 'public', 'content', 'cache', 'culture');
  const cacheFile = path.join(cacheDir, `${slug}.json`);

  // 1. CHECK CACHE (Write Once, Read Many)
  try {
    if (fs.existsSync(cacheFile)) {
      console.log(`🏺 [Cultural Oracle] Cache HIT for: ${slug}`);
      const cachedData = fs.readFileSync(cacheFile, 'utf-8');
      return JSON.parse(cachedData);
    }
  } catch (e) {
    console.warn("Cultural Cache Read Failed:", e);
  }

  // 2. GENERATE (Cache Miss)
  console.log(`🏺 [Cultural Oracle] Cache MISS. Consulting Gemini 3 for: ${topic} (${language})`);

  // fallback to static DB for safety/speed if needed
  const staticBase = CULTURAL_DB[language] || CULTURAL_DB['ta'];

  const prompt = `
    You are an Expert Cultural Anthropologist and Visual Director.
    
    TASK: Create a deep, specific cultural context for a children's story (Level ${level}) about: "${topic}".
    LANGUAGE/REGION: ${language} (Specific regional nuance preferred).
    
    We need a JSON object that strictly matches our schema to guide the Writer and Artist.
    
    OUTPUT SCHEMA (JSON Only):
    {
      "naming": {
        "protagonist_boys": ["name1", "name2"],
        "protagonist_girls": ["name1", "name2"],
        "elders_male": ["title/name"],
        "elders_female": ["title/name"]
      },
      "values": ["core value 1", "core value 2"],
      "sensory_elements": { 
         "sounds": ["string"], 
         "smells": ["string"] 
      },
      "negatives": { "avoid": ["string"], "emotion_guideline": "string" }
    }
    
    GUIDELINES:
    - Focus strictly on CULTURAL AUTHENTICITY (Values, Names, Sensory details).
    - Do NOT define visuals (Clothing, Architecture) - The Director will handle that.
    - Be HYPER-SPECIFIC to the topic (e.g. if topic is Pongal, mention specific sounds/smells).
    - Maintain the "Safety" required for Level ${level} kids.
    `;

  try {
    // Use the smart model (Gemini 3 / Pro)
    const result = await generateContentServer("gemini-exp-1206", prompt); // Or gemini-1.5-pro

    let json = null;
    try {
      const clean = result.text?.replace(/```json/g, "").replace(/```/g, "").trim() || "{}";
      json = JSON.parse(clean);
    } catch (e) {
      console.warn("Oracle JSON parse failed, falling back to static", e);
      return staticBase;
    }

    // Merge with static base to ensure missing fields (like structure/family) are present
    const finalContext = {
      ...staticBase,
      ...json,
      visual_identity: { ...staticBase.visual_identity, ...(json.visual_identity || {}) },
      naming: { ...staticBase.naming, ...(json.naming || {}) },
      // Keep critical language definitions from static
      language: staticBase.language
    };

    // 3. SAVE TO CACHE
    try {
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      fs.writeFileSync(cacheFile, JSON.stringify(finalContext, null, 2));
      console.log(`🏺 [Cultural Oracle] Cache SAVED to: ${cacheFile}`);
    } catch (writeErr) {
      console.warn("Cultural Cache Write Failed:", writeErr);
    }

    return finalContext;

  } catch (e) {
    console.error("Oracle Consultation Failed:", e);
    return staticBase;
  }
}
