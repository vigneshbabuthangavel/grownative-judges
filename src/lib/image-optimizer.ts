"use server";
import "server-only";
import sharp from "sharp";

// --- OPTIMIZATION HELPER ---
export async function optimizeBase64Image(base64: string): Promise<string> {
    try {
        const buffer = Buffer.from(base64, 'base64');

        // 1. First Pass: Resize to 1024x1024 (HD Quality)
        // 500px was too small (Fuzzy). 1024px is standard.
        let quality = 85;
        let outputBuffer = await sharp(buffer)
            .resize(1024, 1024, { fit: 'inside' })
            .jpeg({ quality, mozjpeg: true })
            .toBuffer();

        // 2. Conditional Reduction: Only compress IF > 300KB
        while (outputBuffer.length > 300 * 1024 && quality > 50) {
            quality -= 5;
            outputBuffer = await sharp(buffer)
                .resize(1024, 1024, { fit: 'inside' })
                .jpeg({ quality, mozjpeg: true })
                .toBuffer();
        }

        console.log(`[Image Optimizer] ${buffer.length} -> ${outputBuffer.length} bytes (Q:${quality}, 500px)`);
        return outputBuffer.toString('base64');
    } catch (error) {
        console.error("Image Optimization Failed:", error);
        return base64; // Fallback to original
    }
}
