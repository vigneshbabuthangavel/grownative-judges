'use server';

import { AssetManager } from "@/lib/asset-manager";

export async function loadAssetsAction(language: string, level: number, topic: string, expectedCount: number) {
    try {
        const assets = await AssetManager.loadAssets(language, level, topic, expectedCount);
        return assets;
    } catch (e) {
        console.error("Asset Load Action Failed", e);
        return null;
    }
}

export async function saveAssetAction(language: string, level: number, topic: string, pageIndex: number, base64Data: string) {
    try {
        await AssetManager.saveAsset(language, level, topic, pageIndex, base64Data);
        return true;
    } catch (e) {
        console.error("Asset Save Action Failed", e);
        return false;
    }
}

export async function saveLogAction(language: string, level: number, topic: string, filename: string, data: any) {
    try {
        await AssetManager.saveLog(language, level, topic, filename, data);
        return true;
    } catch (e) {
        console.error("Log Save Action Failed", e);
        return false;
    }
}
