"use client";

import React, { useState } from "react";
import { Container, Paper, Box, Typography, TextField, Button, MenuItem, LinearProgress, Divider, Grid, CircularProgress, ToggleButton, ToggleButtonGroup, FormControlLabel, Checkbox } from "@mui/material";

import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import TranslateIcon from "@mui/icons-material/Translate";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";

import { AppFooter } from "@/components/AppFooter";
import { processFullStoryPipeline, translateStory } from "@/lib/gemini-api";
import { StoryReader } from "@/components/StoryReader";
import VerifiedIcon from "@mui/icons-material/Verified";

const LANGUAGES = [
    { code: "ta", label: "Tamil" },
    { code: "hi", label: "Hindi" },
    { code: "te", label: "Telugu" },
    { code: "kn", label: "Kannada" },
    { code: "ml", label: "Malayalam" },
    { code: "bn", label: "Bengali" },
    { code: "zh", label: "Chinese (Mandarin)" },
    { code: "ja", label: "Japanese" },
    { code: "fr", label: "French" },
    { code: "es", label: "Spanish" },
    { code: "en", label: "English" },
];

export default function MultilingualPage() {
    const [topic, setTopic] = useState("Friendship");
    const [premise, setPremise] = useState("Two friends help each other solve a mystery.");
    const [level, setLevel] = useState(1);
    const [primaryLang, setPrimaryLang] = useState("en");
    const [secondaryLang, setSecondaryLang] = useState("ta");
    const [gender, setGender] = useState("boy");
    const [enableImages, setEnableImages] = useState(true);

    // NEW STATES for Robust Logging & UX
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [generatedStories, setGeneratedStories] = useState<{ primary: any, secondary: any } | null>(null);
    const [viewMode, setViewMode] = useState<"primary" | "secondary">("primary");

    // Helper to add logs sequentially
    const updateLog = (entry: { name: string, status: 'loading' | 'success' | 'error', output?: any }) => {
        setLogs(prev => {
            // If the last log is "loading" and this new one is "success/error" for the SAME name, replace it.
            // Otherwise append.
            const newLogs = [...prev];
            const lastIndex = newLogs.findIndex(l => l.name === entry.name && l.status === 'loading');

            if (lastIndex !== -1 && (entry.status === 'success' || entry.status === 'error')) {
                newLogs[lastIndex] = entry;
            } else {
                // If it's a completely new loading step, just add it
                if (entry.status === 'loading') {
                    // Check if we already have this loading step to prevent duplicates? 
                    // Actually, generic append is safer for "Phase 1... Phase 2..." flows
                    newLogs.push(entry);
                } else {
                    newLogs.push(entry);
                }
            }
            return newLogs;
        });
    };

    async function handleGenerate() {
        if (!topic || !premise) {
            alert("Please enter both a Topic and a Premise to generate a story.");
            return;
        }

        setGeneratedStories(null);
        setLogs([]); // Clear logs
        setIsLoading(true);
        updateLog({ name: "Starting Multilingual Pipeline...", status: "loading" });

        try {
            // 1. Generate Primary Story (Full Pipeline: Beat -> Image -> Text)
            // 1. Generate Primary Story (Full Pipeline: Beat -> Image -> Text)
            const primaryResult = await processFullStoryPipeline(
                topic,
                premise,
                level,
                primaryLang,
                gender,
                (s) => updateLog(s),
                { enableImages }
            );

            // 2. Translate to Secondary
            // We reuse the visual assets from Primary for consistency if images are enabled!
            // But currently translateStory just does text. 
            // We need to construct the Secondary Story Object manually or via pipeline.
            // For now, let's just do text translation as before, but mapped to the same images if available.

            updateLog({ name: "Phase 6: Translating to " + secondaryLang, status: "loading" });
            const translatedSentences = await translateStory(
                primaryResult.pages, secondaryLang
            );

            // Construct Secondary Result sharing assets
            const secondaryResult = {
                ...primaryResult,
                title: (primaryResult as any).title_native + " (" + secondaryLang + ")",
                pages: primaryResult.pages.map((p: any, idx: number) => ({
                    ...p,
                    text_native: translatedSentences[idx]?.native || p.text_native, // Replace text
                    text_english: translatedSentences[idx]?.english || p.text_english,
                    // Keep images/components from primary
                })),
                globalMeta: { ...primaryResult.globalMeta, language: secondaryLang }
            };
            updateLog({ name: "Phase 6: Translating to " + secondaryLang, status: "success" });

            // 3. Save Both
            const saveToApi = async (story: any) => {
                const payload = {
                    ...story,
                    language: story === primaryResult ? primaryLang : secondaryLang,
                    theme: topic,
                    community: { rating: 5, votes: 1, isRevisionRequired: false }
                };
                const res = await fetch('/api/stories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to save story");
                return payload;
            };

            // Generate IDs
            const timestamp = Date.now();
            // @ts-ignore
            primaryResult.storyId = `story_${timestamp}_${primaryLang}`;
            // @ts-ignore
            secondaryResult.storyId = `story_${timestamp}_${secondaryLang}`;

            updateLog({ name: "Phase 7: Saving Stories to Disk...", status: "loading" });
            await saveToApi(primaryResult);
            await saveToApi(secondaryResult);
            updateLog({ name: "Phase 7: All Stories Saved Successfully!", status: "success" });

            setGeneratedStories({ primary: primaryResult, secondary: secondaryResult });

        } catch (e: any) {
            console.error(e);
            updateLog({ name: "Error: " + e.message, status: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <Container maxWidth="lg" className="py-8">

                <Box className="mt-6 mb-6">
                    <Button component={Link as any} href="/admin" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                        Back to Standard Admin
                    </Button>
                    <Typography variant="h4" fontWeight={900} className="text-slate-800">
                        Multilingual Studio 🌍
                    </Typography>
                    <Typography color="text.secondary">
                        Generate one story, output two identical versions in different languages.
                    </Typography>
                </Box>

                {/* CONTROL PANEL */}
                <Paper className="p-6 rounded-3xl border border-slate-200 mb-8">
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField label="Topic" fullWidth value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. The Lost Puppy" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField label="Premise" fullWidth value={premise} onChange={(e) => setPremise(e.target.value)} placeholder="A boy finds a puppy and..." />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <TextField select label="Primary Language" fullWidth value={primaryLang} onChange={(e) => setPrimaryLang(e.target.value)}>
                                {LANGUAGES.map((l) => <MenuItem key={l.code} value={l.code}>{l.label}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <TextField select label="Secondary Language" fullWidth value={secondaryLang} onChange={(e) => setSecondaryLang(e.target.value)}>
                                {LANGUAGES.map((l) => <MenuItem key={l.code} value={l.code}>{l.label}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <TextField select label="Level" fullWidth value={level} onChange={(e) => setLevel(Number(e.target.value))}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(l => <MenuItem key={l} value={l}>Level {l}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <TextField select label="Protagonist" fullWidth value={gender} onChange={(e) => setGender(e.target.value)}>
                                <MenuItem value="boy">Boy</MenuItem>
                                <MenuItem value="girl">Girl</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ mt: 3 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={enableImages}
                                            onChange={(e) => setEnableImages(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Generate AI Illustrations (Digital Puppet Stage)"
                                />
                            </Box>

                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
                                onClick={handleGenerate}
                                disabled={isLoading}
                                sx={{
                                    mt: 2, // Reduced margin since box above has margin
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    background: 'linear-gradient(45deg, #2563eb 30%, #4f46e5 90%)',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #1d4ed8 30%, #4338ca 90%)',
                                        boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)',
                                    }
                                }}
                            >
                                {isLoading ? "Crafting Story..." : "Generate Multilingual Story"}
                            </Button>
                        </Grid>
                    </Grid>

                    {/* LIVE PIPELINE LOGS */}
                    {logs.length > 0 && (
                        <Box className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 max-h-[200px] overflow-y-auto">
                            <Typography variant="subtitle2" className="text-slate-500 mb-2 uppercase tracking-wide font-bold">
                                Pipeline Status
                            </Typography>
                            <div className="space-y-2">
                                {logs.map((log, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        {log.status === 'loading' && <CircularProgress size={16} />}
                                        {log.status === 'success' && <VerifiedIcon fontSize="small" color="success" />}
                                        {log.status === 'error' && <span className="text-red-500">⚠</span>}
                                        <span className={`font-mono ${log.status === 'error' ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                                            {log.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Box>
                    )}
                </Paper>

                {/* RESULTS DISPLAY - USING STANDARD STORY READER */}
                {generatedStories && (
                    <Box>
                        <Box className="flex justify-center mb-6">
                            <ToggleButtonGroup
                                value={viewMode}
                                exclusive
                                onChange={(e, val) => val && setViewMode(val)}
                                aria-label="text alignment"
                                className="bg-white shadow-sm rounded-xl"
                            >
                                <ToggleButton value="primary" className="px-6 font-bold">
                                    Primary ({primaryLang.toUpperCase()})
                                </ToggleButton>
                                <ToggleButton value="secondary" className="px-6 font-bold">
                                    Secondary ({secondaryLang.toUpperCase()})
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        <Paper className="p-1 rounded-3xl overflow-hidden shadow-lg border border-slate-200">
                            <Box className={`p-4 ${viewMode === 'primary' ? 'bg-green-50' : 'bg-blue-50'} border-b flex justify-between items-center`}>
                                <Typography variant="h6" fontWeight={800} className="flex items-center gap-2">
                                    {viewMode === 'primary' ? <VerifiedIcon color="success" /> : <TranslateIcon color="primary" />}
                                    {viewMode === 'primary' ? "Primary Version" : "Translated Version"}
                                </Typography>
                                <Button
                                    component={Link as any}
                                    href={`/story/${generatedStories[viewMode].storyId}`}
                                    variant="outlined"
                                    size="small"
                                >
                                    Full Screen Mode
                                </Button>
                            </Box>

                            {/* THE STANDARD READER COMPONENT */}
                            <div className="p-4 bg-white min-h-[400px]">
                                <StoryReader story={generatedStories[viewMode]} />
                            </div>
                        </Paper>
                    </Box>
                )}
                <AppFooter />
            </Container>
        </main >
    );
}
