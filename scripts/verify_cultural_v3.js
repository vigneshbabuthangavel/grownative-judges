
const { CULTURAL_DB } = require('../src/lib/cultural/data.ts');

const languages = ['ta', 'hi', 'ja', 'zh', 'es', 'en'];
let errors = [];

languages.forEach(lang => {
    const entry = CULTURAL_DB[lang];
    if (!entry) {
        errors.push(`Missing language: ${lang}`);
        return;
    }

    // Check existing keys (Compatibility)
    const requiredKeys = ['naming', 'visual_identity', 'urban_settings', 'negatives'];
    requiredKeys.forEach(key => {
        if (!entry[key]) errors.push(`${lang} is missing key: ${key}`);
    });

    // Check new keys (V3)
    if (!entry.cultural_logic) errors.push(`${lang} is missing cultural_logic`);
    if (!entry.cultural_logic.structural_constraints) errors.push(`${lang} is missing structural_constraints`);

    // Check composition (Dynamic Record)
    if (lang === 'ta' && !entry.visual_identity.environment.includes("Golden Hour")) {
        errors.push("Tamil composition failed (missing SharedVisuals)");
    }
});

if (errors.length > 0) {
    console.error("❌ Verification FAILED:\n" + errors.join('\n'));
    process.exit(1);
} else {
    console.log("✅ Verification SUCCESS: CULTURAL_DB V3 is compatible and structure-rich.");
    process.exit(0);
}
