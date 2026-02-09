"use server";

import fs from 'fs';
import path from 'path';

/**
 * CACHE MANAGER
 * Unified handler for "Write Once, Read Many" (WORM) file-system caching.
 * Designed to reduce latency and costs for repetitive calls (Scripts, Beats).
 */

const CACHE_ROOT = path.join(process.cwd(), 'public', 'content', 'cache');

// Ensure root exists
if (!fs.existsSync(CACHE_ROOT)) {
    try {
        fs.mkdirSync(CACHE_ROOT, { recursive: true });
    } catch (e) {
        console.warn("Failed to create cache root:", e);
    }
}

// Slugify helper
function slugify(text: string): string {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

/**
 * Retrieve an item from the cache.
 * @param namespace - Subdirectory for the cache type (e.g., 'scripts', 'beats')
 * @param key - Unique identifier (will be slugified)
 * @returns Parsed JSON object or null if miss/error
 */
export async function getCache(namespace: string, key: string): Promise<any | null> {
    const dir = path.join(CACHE_ROOT, namespace);
    const file = path.join(dir, `${slugify(key)}.json`);

    try {
        if (fs.existsSync(file)) {
            const data = fs.readFileSync(file, 'utf-8');
            console.log(`⚡ [Cache HIT] ${namespace}/${slugify(key)}`);
            return JSON.parse(data);
        }
    } catch (e) {
        console.warn(`[Cache Read Error] ${namespace}/${key}:`, e);
    }
    console.log(`💨 [Cache MISS] ${namespace}/${slugify(key)}`);
    return null;
}

/**
 * Save an item to the cache.
 * @param namespace - Subdirectory for the cache type
 * @param key - Unique identifier
 * @param data - JSON serializable data
 */
export async function setCache(namespace: string, key: string, data: any): Promise<void> {
    const dir = path.join(CACHE_ROOT, namespace);
    const file = path.join(dir, `${slugify(key)}.json`);

    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // Write nicely formatted JSON for debugging ease
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        console.log(`💾 [Cache SAVED] ${namespace}/${slugify(key)}`);
    } catch (e: any) {
        if (e.code === 'EROFS' || e.code === 'EACCES') {
            console.warn(`[Cache Write Skipped] Read-only filesystem detected (Vercel/Lambda).`);
        } else {
            console.warn(`[Cache Write Error] ${namespace}/${key}:`, e);
        }
    }
}

// generateStoryKey moved to ./cache-utils.ts to allow client-side usage
