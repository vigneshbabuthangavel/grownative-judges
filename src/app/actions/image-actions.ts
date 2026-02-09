"use server";

import { optimizeBase64Image } from "@/lib/image-optimizer";

export async function optimizeImageAction(base64: string): Promise<string> {
    return await optimizeBase64Image(base64);
}
