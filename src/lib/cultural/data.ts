/**
 * CULTURAL DATABASE (V3: Dynamic Record)
 * Stores high-density context for the 'System Persona' of the AI Agent.
 * Uses Composition over Repetition for efficiency.
 */

// ==========================================
// 1. SHARED VISUAL BASES (The "Dynamic" Layer)
// ==========================================

const SharedVisuals = {
    SouthAsia: {
        architecture: {
            style: "Tropical architecture. Houses with vibrant ochre or pink compound walls.",
            threshold: "Front entrance must feature a 'Kolam' (geometric rice flour pattern) or 'Rangoli'.",
            horizon: "Distant temple tower or palm trees."
        },
        environment: "Golden Hour lighting (5:00 PM), lush trees (Neem/Mango/Coconut), red soil paths.",
        clothing: {
            basics_men: "Cotton shirts, Lycra pants or traditional Dhotis.",
            basics_women: "Sarees or Salwar Kameez.",
            basics_kids: "Brightly colored cotton outfits."
        },
        urban_base: {
            busy_road: "Multi-lane asphalt mixed with dirt shoulders, auto-rickshaws, motorcycles.",
            neighborhood: "Overhead power lines, colorful shop signs, mix of concrete houses."
        }
    },
    EastAsia: {
        architecture: {
            style: "Modern urban or traditional timber framing.",
            threshold: "Clean step for shoe removal.",
            horizon: "High-rise skyline or distant mountains."
        },
        environment: "Soft diffuse light, manicured greenery, clean paved surfaces.",
        clothing: {
            basics_men: "Smart casual or business attire.",
            basics_women: "Modest, stylish modern wear.",
            basics_kids: "School uniforms or neat casuals."
        },
        urban_base: {
            busy_road: "Clean paved streets, clear lane markings, orderly traffic.",
            neighborhood: "Vending machines, convenience stores, compact housing."
        }
    },
    SouthernEurope: {
        architecture: {
            style: "Mediterranean stucco walls, terracotta tiles.",
            threshold: "Heavy wood doors, tiled steps.",
            horizon: "Rolling hills or church towers."
        },
        environment: "Bright high-contrast sunlight, olive/orange trees, cobblestones.",
        clothing: {
            basics_men: "Linen shirts, loafers.",
            basics_women: "Summer dresses, chic blouses.",
            basics_kids: "Stylish cotton wear."
        },
        urban_base: {
            busy_road: "Narrow streets, scooters, compact cars.",
            neighborhood: "Plazas with fountains, open-air cafes."
        }
    },
    GlobalWest: {
        architecture: {
            style: "Suburban brick/siding houses, picket fences.",
            threshold: "Front porch or simple doorstep.",
            horizon: "Tree-lined streets or city skyline."
        },
        environment: "Soft sunlight, lawns, deciduous trees.",
        clothing: {
            basics_men: "T-shirts, jeans, polos.",
            basics_women: "Jeans, blouses, athletic wear.",
            basics_kids: "T-shirts, hoodies, sneakers."
        },
        urban_base: {
            busy_road: "Wide paved roads, SUVs, traffic lights.",
            neighborhood: "Sidewalks, parks, driveways."
        }
    }
};

// ==========================================
// 2. CULTURAL REGISTRY (The Composition)
// ==========================================

export const CULTURAL_DB: Record<string, any> = {

    // --- TAMIL (South Asia) ---
    "ta": {
        language: { name: "Tamil", native: "தமிழ்", family: "Dravidian", structure: "Agglutinative (SOV)" },
        cultural_logic: {
            locale: "ta-IN",
            language: "Tamil",
            structural_constraints: {
                sentence_order: "SOV",
                particle_dependency: "Medium",
                honorific_strategy: "Age-Based",
                script: { base: "Tamil", learning_curve: "Agglutinative" }
            },
            storytelling_templates: {
                formal_opening: "ஒரே ஒரு ஊர்ல... (In a certain town...)",
                informal_opening: "முன்னொரு காலத்துல... (Long, long ago...)",
                character_speech_patterns: {
                    elder: "uses respectful suffixes (-nga)",
                    child: "uses simple verb endings"
                }
            }
        },
        naming: {
            protagonist_boys: ["Arun", "Kavin", "Thamarai", "Madhavan"],
            protagonist_girls: ["Ananya", "Kayal", "Oviya", "Meenakshi"],
            elders_male: ["Thatha", "Periyappa"],
            elders_female: ["Paati", "Chithamma"],
            locked_behavior: "Greeting with 'Vanakkam' (palms together). Removal of shoes before entering homes."
        },
        visual_identity: {
            characters: {
                protagonist: {
                    base: "Constant: medium-warm Tamil skin tone, large brown eyes, same face shape",
                    boy: "Physical: medium-warm Tamil skin tone, short side-parted buzz cut, large brown eyes.",
                    girl: "Physical: medium-warm Tamil skin tone, long braid with jasmine (optional), large brown eyes."
                },
                support: "Support Character (Dynamic). If Elder: Crisp white Veshti, Cream shirt, silver hair. If Child: Similar school uniform or casual play clothes. If Animal: Native species (e.g. Deer, Monkey)."
            },
            architecture: {
                ...SharedVisuals.SouthAsia.architecture,
                style: "Tropical Dravidian architecture. Houses with vibrant ochre or pink compound walls."
            },
            environment: SharedVisuals.SouthAsia.environment,
            clothing: {
                men: "Formal white Veshti (Dhoti) with Zari border; cream cotton shirts.",
                women: "Kanchipuram Silk Saree with jasmine flowers (Malli-poo) in braided hair.",
                children: "Options: Cobalt Blue school uniforms OR Casual bright cotton clothes."
            },
            props: {
                locked: ["Yellow auto-rickshaw with black top", "Three-tier steel tiffin carrier", "Tender coconut stall with green coconuts"],
                textures: ["Brass lamps (Nilavilakku)", "Woven palm leaf mats"]
            }
        },
        urban_settings: {
            busy_road: SharedVisuals.SouthAsia.urban_base.busy_road,
            neighborhood: "Overhead power lines, colorful hand-painted Tamil shop signs, traditional tiled houses mixed with modern apartments."
        },
        negatives: {
            avoid: ["Aggressive facial expressions", "Walking with shoes inside", "Overusing rickshaws for urban scenes", "Western-style picket fences or lawns"],
            emotion_guideline: "Respectful, subtle reverence for elders; collective neighborhood joy."
        },
        // Legacy anchors kept for compatibility (can be refactored later)
        // Legacy anchors removed to prevent prompt drift
        plot_anchors: {
            crossing_in_progress: "Blocking: Wide Tracking Shot. Action: Boy and Grandfather walking R->L on white zebra crossing. Vehicles (blue bus, yellow auto) stopped respectfully behind line. Atmosphere: Safe, Golden Hour.",
            crossing_completed: "Composition: Boy and old man have SAFELY REACHED the pavement. The busy road is now in the background.",
            greeting: "Composition: Boy standing respectfully, palms together in Wanakkam. Old man smiling, leaning slightly on cane."
        }
    },

    // --- HINDI (South Asia) ---
    "hi": {
        language: { name: "Hindi", native: "हिन्दी", family: "Indo-Aryan", structure: "SOV with postpositions" },
        cultural_logic: {
            locale: "hi-IN",
            language: "Hindi",
            structural_constraints: {
                sentence_order: "SOV",
                particle_dependency: "Medium",
                honorific_strategy: "Age-Based",
                script: { base: "Devanagari", learning_curve: "Phonetic" }
            },
            storytelling_templates: {
                formal_opening: "Bahut samay pehle... (Long ago...)",
                informal_opening: "Ek din... (One day...)",
                character_speech_patterns: { elder: "Formal 'Aap'", child: "Respectful 'Ji'" }
            }
        },
        naming: {
            protagonist_boys: ["Aarav", "Ishaan", "Vihaan", "Aditya"],
            protagonist_girls: ["Anjali", "Diya", "Saanvi", "Isha"],
            elders_male: ["Nana", "Dada", "Chacha"],
            elders_female: ["Nani", "Dadi", "Mausi"],
            locked_behavior: "Greeting with 'Namaste'. Touching elders' feet for blessings (Pernam)."
        },
        visual_identity: {
            architecture: "North Indian urban/semi-urban mix. Brick houses with arched windows. Busy bazaars with hanging wires. Balconies with iron grills.",
            environment: "Golden hour warmth or dusty afternoon haze. Pigeons on roof edges.",
            clothing: {
                men: "Kurta-Pyjama or formal shirts.",
                women: "Saree with bindi or Kurti-Leggings.",
                children: "Simple frocks or pavadai for girls; soft cotton Kurta or T-shirts for boys."
            },
            props: ["Cycle-rickshaws", "Street tea stalls (Chai Tapri)", "Marigold garlands", "Blue water tanks on roofs"]
        },
        urban_settings: {
            busy_road: "Wide boulevards, public buses (green/red), silver SUVs, standard delivery bikes.",
            neighborhood: "Crowded markets with diverse stalls, colonial-era architecture mixed with modern glass buildings"
        },
        negatives: {
            avoid: ["Loud/Aggressive shouting", "Generic high-rise backgrounds", "Ambiguous ethnicity", "Stereotypical 'poverty' tropes unless requested"],
            emotion_guideline: "Warmth, neighborhood familiarity, playful respect."
        },
        character_anchors: {
            protagonist: {
                base: "Constant: large dark eyes, warm skin tone, thick dark hair, same face shape.",
                boy: "Outfit: Simple cotton T-shirt or Kurta, dark shorts or pyjamas.",
                girl: "Outfit: Simple floral frock or kurti-leggings. Hair: tidy braids with small clips."
            },
            support: "Constant: Kurta-Pyjama or formal shirt, silver hair, kind eyes, perhaps wearing a traditional cap."
        },
        plot_anchors: {
            crossing_in_progress: "Composition: Boy and elderly man WALKING ACROSS a busy boulevard. Cycle-rickshaws and buses behind them.",
            crossing_completed: "Composition: Boy and elderly man REACHED the pavement. The busy road is now in the background.",
            greeting: "Composition: Boy touching the elder's feet (Pernam) or greeting with Namaste. Elder smiling and placing a hand on boy's head."
        }
    },

    // --- JAPANESE (East Asia) ---
    "ja": {
        language: { name: "Japanese", native: "日本語", family: "Japonic", structure: "Agglutinative (SOV with particles)" },
        cultural_logic: {
            locale: "ja-JP",
            language: "Japanese",
            structural_constraints: {
                sentence_order: "SOV",
                particle_dependency: "High",
                honorific_strategy: "Relationship-Based",
                script: { base: "Kana/Kanji", learning_curve: "Complex" }
            },
            storytelling_templates: {
                formal_opening: "昔々あるところに (Once upon a time...)",
                informal_opening: "ある日のこと (One day...)",
                character_speech_patterns: {
                    elder: "uses '-masu' / '-desu' forms, sophisticated vocabulary",
                    child: "uses dictionary forms / playful particles like 'yo' or 'ne'"
                }
            }
        },
        naming: {
            protagonist_boys: ["Hiro", "Ren", "Yuki", "Kaito"],
            protagonist_girls: ["Hana", "Aoi", "Sakura", "Mei"],
            elders_male: ["Ojiisan", "Otoosan"],
            elders_female: ["Obaasan", "Okaasan"],
            locked_behavior: "Bowing as a greeting; removal of outdoor shoes (replaced by indoor slippers/uwabaki)."
        },
        visual_identity: {
            characters: {
                protagonist: {
                    base: "Constant: Japanese features, large expressive eyes, same face shape.",
                    boy: "Outfit: Navy blue Randoseru, yellow safety school hat, crisp white polo, dark shorts. Hair: straight jet black with a sharp fringe.",
                    girl: "Outfit: Navy blue school skirt, yellow safety school hat, crisp white polo. Hair: straight jet black with fringe and yellow hairbands."
                },
                support: "Elderly Japanese person. HAIR: Minimalist receding silver hair. OUTFIT: Grey linen cardigan, pressed trousers, clean white socks (tabi-style), simple wire-rimmed glasses."
            },
            architecture: {
                ...SharedVisuals.EastAsia.architecture,
                style: "Modern Japanese urban or Machiya style. Clean wooden lines, sliding Shoji screens."
            },
            environment: "Soft morning light, manicured pine trees, cherry blossoms (Sakura), or perfectly clean grey asphalt with bright white painted lines.",
            clothing: {
                men: "Business-casual linen shirts or traditional dark Yukata.",
                women: "Simple modest dresses or colorful Kimono with Obi sash.",
                children: "School uniforms (Randoseru) or simple, high-quality basics."
            },
            props: {
                locked: ["Brightly lit vending machine", "Bento box with partitioned food", "Ceramic tea set", "Blue Shinkansen train in far background"],
                textures: ["Tatami straw mats", "Polished dark wood", "Washi paper textures"]
            }
        },
        urban_settings: {
            busy_road: "Narrow paved streets, high-speed trains, cyclists with baskets, neat yellow tactile paving at crossings.",
            neighborhood: "Vending machines on every corner, small community shrines, overhead wires in neat bundles."
        },
        negatives: {
            avoid: ["Outdoor shoes on tatami", "Loud public shouting", "Messy street layouts", "Aggressive facial expressions"],
            emotion_guideline: "Stoic warmth, quiet discipline, deep respect for elders."
        },
        character_anchors: {
            protagonist: {
                base: "Constant: Japanese features, large expressive eyes, same face shape.",
                boy: "Outfit: Navy blue Randoseru (backpack), yellow safety school hat, white polo, dark shorts. Hair: straight jet black with fringe.",
                girl: "Outfit: Navy blue school skirt, yellow safety school hat, white polo. Hair: straight jet black with fringe and yellow hairbands."
            },
            support: "Constant: Grey linen cardigan, wire-rimmed glasses, silver receding hair, calm expression."
        },
        plot_anchors: {
            crossing_in_progress: "Composition: Boy and elderly man WALKING TOGETHER at a neat paved crossing. Cars stopped in background.",
            crossing_completed: "Composition: Boy and elderly man have ARRIVED on the opposite sidewalk. The crossing is behind them.",
            greeting: "Composition: Boy performing a slight bow (ojigi). Elderly man nodding warmly. Clean residential background."
        }
    },

    // --- CHINESE (East Asia) ---
    "zh": {
        language: { name: "Chinese", native: "中文", family: "Sino-Tibetan", structure: "SVO (Analytic)" },
        cultural_logic: {
            locale: "zh-CN",
            language: "Chinese",
            structural_constraints: {
                sentence_order: "SVO",
                particle_dependency: "Low",
                honorific_strategy: "Title-Based"
            },
            storytelling_templates: {
                formal_opening: "很久很久以前 (Long long ago...)",
                character_speech_patterns: { elder: "Wise/Proverb-heavy", child: "Brief/Direct" }
            }
        },
        naming: {
            protagonist_boys: ["Wei", "Bo", "Jun", "Zhan"],
            protagonist_girls: ["Mei", "Ling", "Jia", "Xue"],
            elders_male: ["Yeye", "Waigong"],
            elders_female: ["Nainai", "Waipo"],
            locked_behavior: "Offering tea with two hands; physical respect shown by a slight head tilt."
        },
        visual_identity: {
            characters: {
                protagonist: {
                    base: "Constant: Chinese features, large expressive eyes, same face shape.",
                    boy: "Outfit: Bright red track-style school jacket with white stripes, denim trousers, yellow sneakers. Hair: thick black hair with a neat bowl-cut.",
                    girl: "Outfit: Bright red track-style school skirt unit with white stripes, yellow sneakers. Hair: black hair with two small buns."
                },
                support: "Elderly Chinese man. HAIR: Thinning grey hair. OUTFIT: Grey Mao-style jacket or simple collared cotton shirt. PROP: A small birdcage or a thermos of hot tea."
            },
            architecture: {
                ...SharedVisuals.EastAsia.architecture,
                style: "Mix of modern high-rises and traditional gray-tiled Siheyuan courtyards."
            },
            environment: "Golden afternoon sun, weeping willow trees, stone bridges, terracotta planters with lotuses.",
            clothing: {
                men: "Simple button-up shirts or Tang-style jackets.",
                women: "Modern floral dresses or Qipao-inspired tops.",
                children: "Colorful primary-colored tracksuits or puffer vests."
            },
            props: {
                locked: ["Red paper lanterns", "Electric scooters", "Steaming bamboo dim sum baskets", "Chinese calligraphy brush set"],
                textures: ["Red silk embroidery", "Polished bamboo", "Gray stone masonry"]
            }
        },
        urban_settings: {
            busy_road: "Wide boulevards, electric bike lanes, green public buses, modern traffic signals with timers.",
            neighborhood: "Busy fruit stalls, elders playing Mahjong on folding tables, laundry hanging on bamboo poles."
        },
        negatives: {
            avoid: ["Ambiguous ethnicity", "Stereotypical 'Old World' tropes unless requested", "Lack of modern technology in urban scenes"],
            emotion_guideline: "Family-centric warmth, studious focus, respectful observation."
        },
        character_anchors: {
            protagonist: {
                base: "Constant: Chinese features, large expressive eyes, same face shape.",
                boy: "Outfit: Bright red school jacket with white stripes, denim trousers, yellow sneakers. Hair: neat bowl-cut black hair.",
                girl: "Outfit: Bright red school skirt unit with white stripes, yellow sneakers. Hair: black hair with two small buns."
            },
            support: "Constant: Grey Mao-style jacket, thinning grey hair, simple collared shirt, carrying a thermos."
        },
        plot_anchors: {
            crossing_in_progress: "Composition: Boy and elder man WALKING ACROSS a wide boulevard. Electric scooters waiting in background.",
            crossing_completed: "Composition: Boy and elder man are SAFE on the sidewalk. Traffic is visible in the distance behind them.",
            greeting: "Composition: Boy tilting head slightly in respect, offering a thermos or tea cup with both hands to the elder man."
        }
    },

    // --- SPANISH (Southern Europe) ---
    "es": {
        language: { name: "Spanish", native: "Español", family: "Romance", structure: "SVO" },
        cultural_logic: {
            locale: "es-ES",
            language: "Spanish",
            structural_constraints: {
                sentence_order: "SVO",
                particle_dependency: "Low",
                honorific_strategy: "Formal-Tu/Usted"
            },
            storytelling_templates: {
                formal_opening: "Érase una vez... (Once upon a time...)",
                character_speech_patterns: { elder: "Affectionate", child: "Rapid/Energetic" }
            }
        },
        naming: {
            protagonist_boys: ["Mateo", "Leo", "Hugo", "Diego"],
            protagonist_girls: ["Sofia", "Lucia", "Martina", "Elena"],
            elders_male: ["Abuelo", "Tío"],
            elders_female: ["Abuela", "Tía"],
            locked_behavior: "Physical affection (hugs, kisses on cheeks); animated hand gestures during speech."
        },
        visual_identity: {
            characters: {
                protagonist: {
                    base: "Constant: Olive skin tone, wavy dark brown hair, same face shape.",
                    boy: "Outfit: Bright ochre linen t-shirt, blue denim shorts, white canvas sneakers.",
                    girl: "Outfit: Bright ochre linen dress, white canvas sneakers. Hair: wavy dark brown hair with a small flower."
                },
                support: "Elderly Spanish man with silver hair and warm tanned skin. OUTFIT: Sharp cream-colored linen shirt, dark trousers, brown leather loafers, gold wedding band."
            },
            architecture: {
                ...SharedVisuals.SouthernEurope.architecture,
                style: "Mediterranean stucco walls in white or terracotta. Wrought iron balconies with flower pots."
            },
            environment: SharedVisuals.SouthernEurope.environment,
            clothing: {
                ...SharedVisuals.SouthernEurope.clothing,
                men: "Tailored linen shirts, espadrilles."
            },
            props: {
                locked: ["Small ceramic espresso cup", "Wicker market basket with a baguette", "Wrought iron plaza bench", "Old-fashioned street lamp"],
                textures: ["Painted ceramic tiles (azulejos)", "Rough stucco", "Woven esparto grass"]
            }
        },
        urban_settings: {
            busy_road: "Narrow paved streets, small European hatchbacks (SEAT style), delivery scooters, narrow sidewalks.",
            neighborhood: "Central plazas with fountains, children playing soccer against stone walls, open-air cafes."
        },
        negatives: {
            avoid: ["Generic US suburban lawns", "Drab/grey color palettes", "Passive/quiet character framing"],
            emotion_guideline: "Vibrant social joy, expressive affection, family-first mentality."
        },
        character_anchors: {
            protagonist: {
                base: "Constant: Olive skin tone, wavy dark brown hair, same face shape.",
                boy: "Outfit: Ochre linen t-shirt, blue denim shorts, white canvas sneakers.",
                girl: "Outfit: Ochre linen dress, white canvas sneakers."
            },
            support: "Constant: Cream linen shirt, dark trousers, brown leather loafers, silver hair, warm tanned skin."
        },
        plot_anchors: {
            crossing_in_progress: "Composition: Boy and elderly man WALKING through the center of a narrow cobblestone street.",
            crossing_completed: "Composition: Boy and elderly man REACHED the plaza on the other side. Narrow street behind them.",
            greeting: "Composition: Boy greeting the elder with an animated gesture or a hug (physical affection). Warm sunlit plaza setting."
        }
    },

    // --- ENGLISH (Global West) ---
    "en": {
        language: { name: "English", family: "West Germanic" },
        cultural_logic: {
            locale: "en-US",
            language: "English",
            structural_constraints: {
                sentence_order: "SVO",
                particle_dependency: "None",
                honorific_strategy: "Casual"
            },
            storytelling_templates: {
                formal_opening: "Once upon a time...",
                character_speech_patterns: { elder: "Friendly", child: "Inquisitive" }
            }
        },
        naming: {
            protagonist_boys: ["Leo", "Jack", "Sam"],
            protagonist_girls: ["Mia", "Lily", "Sarah"],
            elders_male: ["Grandpa", "Mr. Smith"],
            elders_female: ["Grandma", "Mrs. Jones"],
            locked_behavior: "Handshakes or friendly waves."
        },
        visual_identity: {
            architecture: SharedVisuals.GlobalWest.architecture,
            environment: SharedVisuals.GlobalWest.environment,
            clothing: SharedVisuals.GlobalWest.clothing,
            props: ["Yellow school bus", "Backpacks", "Park benches", "Mailboxes"]
        },
        urban_settings: SharedVisuals.GlobalWest.urban_base,
        negatives: {
            avoid: ["Chaotic backgrounds", "Unsafe street play"],
            emotion_guideline: "Politeness, independence, curious engagement."
        }
    }
};
