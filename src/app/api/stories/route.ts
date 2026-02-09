import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'published-stories.json');

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const language = searchParams.get('language');
        const isSummary = searchParams.get('summary') === 'true';

        const data = await fs.readFile(DATA_FILE, 'utf-8');
        let stories = JSON.parse(data);

        // Server-side filtering
        if (language && language !== 'all') {
            stories = stories.filter((s: any) => s.language === language);
        }

        if (isSummary) {
            // Efficiency: Remove full pages and heavy base64 for library browsing
            stories = stories.map((s: any) => ({
                storyId: s.storyId,
                title_native: s.title_native,
                language: s.language,
                theme: s.theme,
                level: s.level,
                community: s.community,
                thumbnailPath: s.pages?.[0]?.imagePath || "",
                // Include pages for Editor, but strip heavy base64 data if present
                pages: s.pages?.map((p: any) => ({
                    ...p,
                    image: p.image?.data ? undefined : p.image // Remove base64, keep structure
                }))
            }));
        }

        return NextResponse.json(stories);
    } catch (e) {
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const storyPack = await request.json();
        const storyId = storyPack.storyId;
        const storyDir = path.join(process.cwd(), 'public', 'content', 'stories', storyId);

        // Ensure directory exists
        await fs.mkdir(storyDir, { recursive: true });

        // Efficient Asset Saving (Digital Puppet Mode)
        const assetsSaved = new Set<string>();

        if (storyPack.pages) {
            for (let i = 0; i < storyPack.pages.length; i++) {
                const page = storyPack.pages[i];

                // Mode A: Digital Puppet (Components)
                if (page.components) {
                    const comp = page.components;

                    // 1. Save Stage (Background)
                    let stagePath = "";
                    if (comp.bg) {
                        if (comp.bg.type === 'text_placeholder') {
                            stagePath = `text:${comp.bg.data}`; // Marker for Frontend
                        } else if (comp.bg.data && !assetsSaved.has('stage')) {
                            stagePath = `/content/stories/${storyId}/stage.png`;
                            await fs.writeFile(path.join(storyDir, 'stage.png'), Buffer.from(comp.bg.data, 'base64'));
                            assetsSaved.add('stage');
                        } else {
                            // Re-use path
                            stagePath = `/content/stories/${storyId}/stage.png`;
                        }
                    }

                    // 2. Save Actor Sprite
                    let actorPath = "";
                    if (comp.actor) {
                        if (comp.actor.type === 'text_avatar') {
                            actorPath = `text:${comp.actor.data}`;
                        } else if (comp.actor.data) {
                            // Use poseId from layout as filename if available, else generic
                            const poseId = comp.layout?.poseId || `pose_${i}`;
                            const fileName = `actor_${poseId}.png`;
                            actorPath = `/content/stories/${storyId}/${fileName}`;

                            if (!assetsSaved.has(fileName)) {
                                await fs.writeFile(path.join(storyDir, fileName), Buffer.from(comp.actor.data, 'base64'));
                                assetsSaved.add(fileName);
                            }
                        }
                    }

                    // 3. Update JSON structure for Frontend
                    page.puppet = {
                        stagePath: stagePath,
                        actorPath: actorPath,
                        layout: comp.layout
                    };

                    // Clear heavy binary data
                    delete page.components;
                    delete page.image;
                }
                // Mode B: Legacy Flat Image
                else if (page.image && page.image.data) {
                    const fileName = `page_${i + 1}.png`;
                    const filePath = path.join(storyDir, fileName);
                    await fs.writeFile(filePath, Buffer.from(page.image.data, 'base64'));
                    page.imagePath = `/content/stories/${storyId}/${fileName}`;
                    delete page.image;
                }


                // Clean metadata
                if (page._meta) delete page._meta;
            }

            // Hoist global meta if needed (legacy check)
            if (storyPack.globalMeta && !storyPack.pages[0]?._meta) {
                // Already hoisted
            }
        }

        // Read existing
        let current: any[] = [];
        try {
            const fileData = await fs.readFile(DATA_FILE, 'utf-8');
            current = JSON.parse(fileData);
        } catch (e) { }

        // Logic: Check if story already exists (Overwrite) or is New (Append)
        const existingIdx = current.findIndex((s: any) => s.storyId === storyId);
        let updated;
        if (existingIdx !== -1) {
            console.log(`[POST] Updating existing story: ${storyId}`);
            updated = [...current];
            updated[existingIdx] = storyPack;
        } else {
            console.log(`[POST] Appending new story: ${storyId}`);
            updated = [...current, storyPack];
        }

        // Update DNA Registry for future repurposing
        const DNA_REGISTRY = path.join(process.cwd(), 'src', 'data', 'dna-registry.json');
        try {
            let registry = [];
            try {
                const registryData = await fs.readFile(DNA_REGISTRY, 'utf-8');
                registry = JSON.parse(registryData);
            } catch (e) { }

            // Logic: Avoid duplicates in registry too
            const regIdx = registry.findIndex((r: any) => r.storyId === storyId);
            const regEntry = {
                storyId,
                topic: storyPack.theme,
                language: storyPack.language,
                visualDNA: storyPack.globalMeta?.visualDNA,
                casting: storyPack.globalMeta?.casting,
                rating: storyPack.community?.rating || 5
            };

            if (regIdx !== -1) {
                registry[regIdx] = regEntry;
            } else {
                registry.push(regEntry);
            }
            await fs.writeFile(DNA_REGISTRY, JSON.stringify(registry, null, 2));
        } catch (e) {
            console.error("Failed to update DNA registry", e);
        }

        // Write back
        await fs.writeFile(DATA_FILE, JSON.stringify(updated, null, 2));

        return NextResponse.json({ success: true, storyId });
    } catch (e) {
        return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
    }
}
export async function PATCH(request: Request) {
    console.log("PATCH /api/stories called");
    try {
        const body = await request.json();
        console.log("PATCH Body:", JSON.stringify(body));
        const { storyId, rating, isRevisionRequired, revisionNote } = body;

        // Read existing
        let current = [];
        try {
            const fileData = await fs.readFile(DATA_FILE, 'utf-8');
            current = JSON.parse(fileData);
            console.log(`Loaded ${current.length} stories from file`);
        } catch (e) {
            console.error("Error reading file:", e);
        }

        const idx = current.findIndex((s: any) => s.storyId === storyId);
        console.log(`Searching for ID: ${storyId}, Found Index: ${idx}`);

        if (idx === -1) {
            console.error("Story not found for ID:", storyId);
            return NextResponse.json({ success: false, error: "Story not found" }, { status: 404 });
        }

        const story = current[idx];
        if (!story.community) {
            console.log("Initializing missing community object");
            story.community = { rating: 5, votes: 1, isRevisionRequired: false, revisionNotes: [] };
        }

        if (rating !== undefined) {
            const totalRating = (story.community.rating * story.community.votes) + rating;
            story.community.votes += 1;
            story.community.rating = Number((totalRating / story.community.votes).toFixed(1));
        }

        if (isRevisionRequired !== undefined) {
            story.community.isRevisionRequired = isRevisionRequired;
            if (revisionNote) {
                if (!story.community.revisionNotes) story.community.revisionNotes = [];
                story.community.revisionNotes.push(revisionNote);
            }
        }

        // Feature: Update Content (Pages)
        const { pages } = body;
        if (pages) {
            story.pages = pages;
        }


        // Write back
        await fs.writeFile(DATA_FILE, JSON.stringify(current, null, 2));

        return NextResponse.json({ success: true, story });
    } catch (e) {
        return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const storyId = searchParams.get('storyId');

        if (!storyId) {
            return NextResponse.json({ success: false, error: "Missing storyId" }, { status: 400 });
        }

        // 1. Remove from JSON DB
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        let stories = JSON.parse(data);
        const initialLength = stories.length;
        stories = stories.filter((s: any) => s.storyId !== storyId);

        if (stories.length === initialLength) {
            return NextResponse.json({ success: false, error: "Story not found" }, { status: 404 });
        }

        await fs.writeFile(DATA_FILE, JSON.stringify(stories, null, 2));

        // 2. Cleanup Assets Directory
        const storyDir = path.join(process.cwd(), 'public', 'content', 'stories', storyId);
        try {
            await fs.rm(storyDir, { recursive: true, force: true });
        } catch (e) {
            console.error(`Failed to delete directory for ${storyId}`, e);
            // Non-fatal, continue
        }

        return NextResponse.json({ success: true });

    } catch (e) {
        console.error("DELETE Error", e);
        return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
    }
}
