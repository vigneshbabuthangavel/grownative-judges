
const fs = require('fs');
const path = require('path');

const storiesPath = path.join(process.cwd(), 'src/data/published-stories.json');

try {
    const raw = fs.readFileSync(storiesPath, 'utf-8');
    let stories = JSON.parse(raw);

    const missingVocab = stories.filter(s => !s.targetWords || s.targetWords.length === 0);

    console.log(`Found ${missingVocab.length} stories with missing vocabulary:`);
    missingVocab.forEach(s => {
        console.log(`- [${s.language}] ${s.storyId}: ${s.title}`);
    });

} catch (e) {
    console.error("Error checking vocab:", e);
}
