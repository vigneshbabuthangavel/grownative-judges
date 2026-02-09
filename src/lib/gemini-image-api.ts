import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// Model for Image Generation
const imagenModel = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

// Model for Multimodal Auditing (must support vision)
const auditorModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

/**
 * STAGE 1: Generate the image from text
 */
export async function generateIllustrationsForStory(storyPages: string[]) {
  const generatedImages: { pageIndex: number, imageData: string, prompt: string }[] = [];

  for (let i = 0; i < storyPages.length; i++) {
    const pageText = storyPages[i];

    // 1. Create an enriched prompt for a consistent style
    const enrichedPrompt = `A children's book illustration in a friendly, watercolor style: ${pageText}`;

    try {
      // 2. Call Imagen 3
      const result = await imagenModel.generateContent({
        contents: [{ role: "user", parts: [{ text: enrichedPrompt }] }],
        // Request one image
        generationConfig: { candidateCount: 1 }
      });

      const response = result.response;

      // 3. Basic Safety Check
      if (response.promptFeedback?.blockReason || response.candidates?.[0]?.finishReason === 'SAFETY') {
        console.warn(`Image generation blocked for page ${i + 1} due to safety.`);
        // In a real app, you'd handle this (e.g., regenerate or use a placeholder)
        continue;
      }

      // Assuming the API returns the image data as base64 string in the text part for now.
      // Note: Check official documentation for the exact response format of Imagen on Vertex AI/AI Studio.
      // This is a placeholder structure based on common patterns.
      const imageData = response.text();

      if (imageData) {
        generatedImages.push({ pageIndex: i, imageData, prompt: enrichedPrompt });
      }

    } catch (error) {
      console.error(`Failed to generate image for page ${i + 1}:`, error);
    }
  }

  return generatedImages;
}

/**
 * STAGE 2: Contextual Guardrail (Multimodal Audit)
 * Checks if the generated image matches the story text.
 */
export async function auditImageContext(storyText: string, imageDataBase64: string) {
  const prompt = `You are an Art Director for a children's book.
  1. Look at the provided image.
  2. Read the corresponding story text: "${storyText}"
  3. Determine if the image accurately and safely depicts the text.
  
  Return JSON: { "pass": boolean, "reason": "string" }`;

  // Create the image part for the multimodal prompt
  const imagePart: Part = {
    inlineData: {
      data: imageDataBase64,
      mimeType: "image/png" // Adjust based on actual format
    }
  };

  const result = await auditorModel.generateContent({
    contents: [
      { role: "user", parts: [imagePart, { text: prompt }] }
    ],
    generationConfig: { responseMimeType: "application/json" }
  });

  return JSON.parse(result.response.text());
}