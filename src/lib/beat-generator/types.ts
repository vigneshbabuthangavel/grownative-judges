/**
 * Allowed shot types for stable continuity
 */
export type ShotType = "WIDE_ESTABLISH" | "MEDIUM_TWO_SHOT" | "WIDE_ACTION"; // Legacy shot types for fallback

export type PuppetLayout = {
    poseId: string; // e.g. "idle", "walk_right", "surprised"
    x: number; // 0-100% from left
    y: number; // 0-100% from top (anchor bottom usually)
    size: number; // Scale factor (default 1.0)
    isFlipped: boolean; // Mirror horizontal
};

/** 
 * Core beat schema (keep it compact & deterministic) 
 */
export type Beat = {
    page: number; // 1..6

    // Legacy support (optional now if layout is present)
    shot?: ShotType;
    protagonist: {
        position: string; // e.g., "left sidewalk"
        action: string; // e.g., "steps toward zebra crossing"
        emotion: "low" | "medium";
    };
    support: {
        position: string; // e.g., "right curb"
        action: string; // e.g., "waits, leaning on cane"
        emotion: "low" | "medium";
    };

    // New "Digital Puppet" Layout
    layout?: PuppetLayout;

    environment: {
        signal_state?: "red" | "green" | "none";
        traffic_state?: "moving" | "slowing" | "stopped" | "none";
        notes?: string;
    };

    constraints: string[];
};

export type CastLock = {
    max_humans: number;
    allowed_humans: string[];
    no_duplicates: boolean;
    no_extra_children: boolean;
    no_crowds: boolean;
    background_people: "silhouettes only, no faces" | "none";
    animal_policy: "no animals unless explicitly listed" | "allowed background animals";
};

export type BeatSheet = {
    version: "v2_puppet"; // Bump version
    premise: string;

    // Visual Stage Description (for generating the Background)
    visual_stage?: {
        setting_description: string; // "A sunny park with lush green trees..."
        style_notes: string; // "Watercolor on textured paper"
    };

    cast_lock: CastLock;
    beats: Beat[];
};

export type BeatGenOptions = {
    pages?: number;
    strictCamera?: boolean;
    allowAnimals?: boolean;
    maxRetries?: number;
    blueprintHints?: {
        theme_rules?: any;
        camera_rules?: any;
        shot_plan?: any;
    };
};
