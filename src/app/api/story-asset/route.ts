import { NextRequest, NextResponse } from "next/server";
import { AssetManager } from "@/lib/asset-manager";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const topic = searchParams.get("topic");
    const level = parseInt(searchParams.get("level") || "1");
    const language = searchParams.get("language");
    const page = parseInt(searchParams.get("page") || "0");

    if (!topic || !language) {
        return new NextResponse("Missing params", { status: 400 });
    }

    try {
        // Use AssetManager to resolve the asset (Local or GCS)
        const fileBuffer = await AssetManager.getAsset(language, level, topic, page);

        if (!fileBuffer) {
            return new NextResponse("Image not found", { status: 404 });
        }

        return new NextResponse(fileBuffer as any, {
            headers: {
                "Content-Type": "image/jpeg",
                "Cache-Control": "public, max-age=31536000, immutable"
            }
        });
    } catch (e: any) {
        console.error("Asset Serve Error", e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
