import fs from 'fs';
import path from 'path';
import { Storage } from '@google-cloud/storage';

// Base directory for private assets (Server-Side Only)
const PRIVATE_ASSETS_DIR = path.join(process.cwd(), 'private_assets');

// GCS Configuration
const BUCKET_NAME = process.env.GCS_BUCKET_NAME;

// Initialize Storage with JSON credentials if provided, otherwise use default ADC
let storageOptions = {};
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
        storageOptions = { credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) };
    } catch (e) {
        console.error("[AssetManager] Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:", e);
    }
}

const storage = BUCKET_NAME ? new Storage(storageOptions) : null;

export const AssetManager = {
    /**
     * Standardize topic to filesystem-safe string
     */
    sanitizeTopic: (topic: string) => {
        return topic.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    },

    /**
     * Get path for a specific story asset bundle
     */
    getStorePath: (language: string, level: number, topic: string) => {
        const safeTopic = AssetManager.sanitizeTopic(topic);
        return path.join(PRIVATE_ASSETS_DIR, language, `level-${level}`, safeTopic, 'images');
    },

    /**
     * Get relative storage path for GCS
     */
    getRelativePath: (language: string, level: number, topic: string, type: 'images' | 'audio' | 'logs') => {
        const safeTopic = AssetManager.sanitizeTopic(topic);
        return `${language}/level-${level}/${safeTopic}/${type}`;
    },

    /**
     * Get path for AUDIO assets
     */
    getAudioPath: (language: string, level: number, topic: string) => {
        const safeTopic = AssetManager.sanitizeTopic(topic);
        return path.join(PRIVATE_ASSETS_DIR, language, `level-${level}`, safeTopic, 'audio');
    },

    /**
     * CHECK: Are assets cached for this exact story?
     * Returns array of base64 strings if found, or null if incomplete.
     */
    loadAssets: async (language: string, level: number, topic: string, expectedCount: number): Promise<string[] | null> => {
        try {
            const dir = AssetManager.getStorePath(language, level, topic);
            const gcsPath = AssetManager.getRelativePath(language, level, topic, 'images');

            // 1. Try Local First (Faster)
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg')).sort();
                if (files.length >= expectedCount) {
                    console.log(`[AssetManager] 🟢 LOCAL CACHE HIT: Found ${files.length} images for "${topic}"`);
                    return files.map(file => fs.readFileSync(path.join(dir, file)).toString('base64'));
                }
            }

            // 2. Try GCS if Local is missing/incomplete
            if (storage && BUCKET_NAME) {
                console.log(`[AssetManager] ☁️ Checking GCS for "${topic}"...`);
                const [files] = await storage.bucket(BUCKET_NAME).getFiles({ prefix: gcsPath });
                const imageFiles = files.filter(f => f.name.endsWith('.jpg')).sort();

                if (imageFiles.length >= expectedCount) {
                    console.log(`[AssetManager] 🟢 GCS CACHE HIT: Found ${imageFiles.length} images`);
                    const results = await Promise.all(imageFiles.map(async (file) => {
                        const [buffer] = await file.download();
                        // Also Save Local for next time
                        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                        fs.writeFileSync(path.join(dir, path.basename(file.name)), buffer);
                        return buffer.toString('base64');
                    }));
                    return results;
                }
            }

            return null;
        } catch (e) {
            console.error("[AssetManager] Load failed:", e);
            return null;
        }
    },

    /**
     * GET: Fetch a single asset as Buffer (Local or GCS)
     */
    getAsset: async (language: string, level: number, topic: string, pageIndex: number): Promise<Buffer | null> => {
        try {
            const dir = AssetManager.getStorePath(language, level, topic);
            const filename = `page-${String(pageIndex + 1).padStart(2, '0')}.jpg`;
            const filepath = path.join(dir, filename);

            // 1. Local
            if (fs.existsSync(filepath)) {
                return fs.readFileSync(filepath);
            }

            // 2. GCS
            if (storage && BUCKET_NAME) {
                const gcsPath = `${AssetManager.getRelativePath(language, level, topic, 'images')}/${filename}`;
                const file = storage.bucket(BUCKET_NAME).file(gcsPath);
                const [exists] = await file.exists();

                if (exists) {
                    const [buffer] = await file.download();
                    // Sync local for next time
                    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                    fs.writeFileSync(filepath, buffer);
                    return buffer;
                }
            }

            return null;
        } catch (e) {
            console.error("[AssetManager] getAsset failed:", e);
            return null;
        }
    },

    /**
     * SAVE: Write a generated image to the private store
     */
    saveAsset: async (language: string, level: number, topic: string, pageIndex: number, base64Data: string) => {
        try {
            const dir = AssetManager.getStorePath(language, level, topic);
            const filename = `page-${String(pageIndex + 1).padStart(2, '0')}.jpg`;
            const filepath = path.join(dir, filename);
            const buffer = Buffer.from(base64Data, 'base64');

            // 1. Save Local
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(filepath, buffer);
            console.log(`[AssetManager] 💾 Saved local asset: ${filepath}`);

            // 2. Upload to GCS
            if (storage && BUCKET_NAME) {
                const gcsPath = `${AssetManager.getRelativePath(language, level, topic, 'images')}/${filename}`;
                await storage.bucket(BUCKET_NAME).file(gcsPath).save(buffer, {
                    contentType: 'image/jpeg',
                    resumable: false
                });
                console.log(`[AssetManager] ☁️ Uploaded to GCS: ${gcsPath}`);
            }

            return true;
        } catch (e) {
            console.error("[AssetManager] Save failed:", e);
            return false;
        }
    },

    /**
     * CHECK: Is audio cached?
     */
    loadAudio: async (language: string, level: number, topic: string): Promise<string | null> => {
        try {
            const dir = AssetManager.getAudioPath(language, level, topic);
            const filename = 'story-read.mp3';
            const filepath = path.join(dir, filename);

            // 1. Local
            if (fs.existsSync(filepath)) {
                console.log(`[AssetManager] 🟢 AUDIO LOCAL HIT`);
                return fs.readFileSync(filepath).toString('base64');
            }

            // 2. GCS
            if (storage && BUCKET_NAME) {
                const gcsPath = `${AssetManager.getRelativePath(language, level, topic, 'audio')}/${filename}`;
                const file = storage.bucket(BUCKET_NAME).file(gcsPath);
                const [exists] = await file.exists();

                if (exists) {
                    console.log(`[AssetManager] 🟢 AUDIO GCS HIT`);
                    const [buffer] = await file.download();
                    // Sync Local
                    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                    fs.writeFileSync(filepath, buffer);
                    return buffer.toString('base64');
                }
            }

            return null;
        } catch (e) {
            return null;
        }
    },

    /**
     * SAVE: Write generated audio
     */
    saveAudio: async (language: string, level: number, topic: string, base64Data: string) => {
        try {
            const dir = AssetManager.getAudioPath(language, level, topic);
            const filename = 'story-read.mp3';
            const filepath = path.join(dir, filename);
            const buffer = Buffer.from(base64Data, 'base64');

            // 1. Local
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(filepath, buffer);

            // 2. GCS
            if (storage && BUCKET_NAME) {
                const gcsPath = `${AssetManager.getRelativePath(language, level, topic, 'audio')}/${filename}`;
                await storage.bucket(BUCKET_NAME).file(gcsPath).save(buffer, {
                    contentType: 'audio/mpeg',
                    resumable: false
                });
                console.log(`[AssetManager] ☁️ Audio uploaded to GCS`);
            }

            return true;
        } catch (e) {
            console.error("[AssetManager] Audio Save failed:", e);
            return false;
        }
    },

    /**
     * Get path for LOG assets
     */
    getLogPath: (language: string, level: number, topic: string) => {
        const safeTopic = AssetManager.sanitizeTopic(topic);
        return path.join(PRIVATE_ASSETS_DIR, language, `level-${level}`, safeTopic, 'logs');
    },

    /**
     * SAVE: Write a JSON log file
     */
    saveLog: async (language: string, level: number, topic: string, filename: string, data: any) => {
        try {
            const dir = AssetManager.getLogPath(language, level, topic);
            const filepath = path.join(dir, filename);
            const json = JSON.stringify(data, null, 2);

            // 1. Local
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(filepath, json);

            // 2. GCS
            if (storage && BUCKET_NAME) {
                const gcsPath = `${AssetManager.getRelativePath(language, level, topic, 'logs')}/${filename}`;
                await storage.bucket(BUCKET_NAME).file(gcsPath).save(json, {
                    contentType: 'application/json',
                    resumable: false
                });
            }

            return true;
        } catch (e) {
            console.error("[AssetManager] Log Save failed:", e);
            return false;
        }
    }
};
