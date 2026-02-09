export interface ActorDNA {
    id: string; // "PROT_01"
    name: string; // "Arun"
    role: "Protagonist" | "Support" | "Background";
    dna: {
        age: number;
        ethnicity: string;
        skin_tone: string;
        hair: string; // "Short Black Messy"
        clothing: {
            top: string;
            bottom: string;
            footwear: string;
            accessory?: string;
        };
        visual_reference?: string;
    };
}

export interface PropDef {
    id: string;
    name: string;
    parent?: string;
    description: string;
    persistence: "scene" | "story";
}

export interface EnvironmentDef {
    id: string;
    name: string;
    primary_location: string;
    time_of_day: string;
    lighting: string;
    key_elements: string[];
}

export interface VisualDefinition {
    style_engine: string;
    actors: Record<string, ActorDNA>;
    props: Record<string, PropDef>;
    environment: EnvironmentDef;
}

export interface StoryScript {
    sentences: Array<{
        id: string;
        page_index: number;
        text_native: string;
        english: string;
        grammar_focus?: string;
    }>;
    exercises?: Array<any>;
}

export interface SagaShot {
    page_index: number;
    sentence_id: string;
    action: string;
    camera: string;
    blocking: Record<string, string>;
    final_prompt?: string;
}

export interface SagaBlueprint {
    sequence: SagaShot[];
}

export interface UnifiedStory {
    id: string;
    meta: {
        title: string;
        language: string;
        level: number;
        topic: string;
        created_at: string;
    };
    script: StoryScript;
    visual_definition: VisualDefinition;
    saga_blueprint: SagaBlueprint;
    vocabulary?: Array<{
        native: string;
        meaning: string;
        type?: string;
    }>;
    assets?: {
        pages: Array<{
            page_index: number;
            image_path: string;
            audio_path?: string;
            audio?: { prosody: any }; // Added for eager pre-fetch
        }>;
    };
}
