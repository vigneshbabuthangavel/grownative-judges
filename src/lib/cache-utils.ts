
/**
 * Shared Utils for Cache Logic (Safe for Client & Server)
 * Do not import 'fs' or 'path' here.
 */

/**
 * Generate a composite key for story-related items
 */
export function generateStoryKey(language: string, level: number, topic: string, version: string = "v1"): string {
    return `${language}_L${level}_${topic}_${version}`;
}
