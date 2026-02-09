"use client";

import * as React from 'react';
import {
    Box, Typography, Paper, TextField, Button, Stack, Grid, Accordion,
    AccordionSummary, AccordionDetails, Checkbox, FormControlLabel, Container, Chip, CircularProgress,
    Select, MenuItem, FormControl, InputLabel, Snackbar, Alert, Divider, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PublishIcon from '@mui/icons-material/Publish';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import ReplayIcon from '@mui/icons-material/Replay';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import { canSpeak, speak, stopSpeaking } from "@/lib/tts";
import { getOrGenerateAudioAction } from "@/app/actions/audio";
import {
    processFullStoryPipeline, regeneratePageImage,
    previewUnifiedStory, renderUnifiedStory
} from '@/lib/gemini-api';
import { evaluatePremiseAction } from '@/app/actions/analyze-premise';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { CostTracker } from "./CostTracker";
import EditIcon from '@mui/icons-material/Edit';
import { useStopwatch, TimerDisplay } from './GenerationTimer';
import LibraryManager from './LibraryManager';
import AudioStoryLab from './audio-lab/AudioStoryLab';
import { VisualDefinitionEditor } from './story-writer/VisualDefinitionEditor';
import { UnifiedStory } from '@/lib/story-writer/types';
import { enrichVocabularyAction } from '@/app/actions/enrich-vocabulary';

const renderOutput = (output: any) => {
    if (!output) return <Typography variant="caption" color="text.secondary">No output</Typography>;

    const textToCopy = typeof output === 'string' ? output : JSON.stringify(output, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        // Could trigger a small toast here if easy, but icon feedback is okay for now
    };

    return (
        <Box sx={{ position: 'relative', marginTop: 1 }}>
            <IconButton
                onClick={handleCopy}
                size="small"
                sx={{ position: 'absolute', right: 8, top: 8, bgcolor: 'rgba(255,255,255,0.8)' }}
                title="Copy JSON"
            >
                <ContentCopyIcon fontSize="small" />
            </IconButton>
            <Box sx={{ bgcolor: '#eee', p: 1, borderRadius: 0, overflowX: 'auto', maxHeight: '300px' }}>
                <pre style={{ margin: 0, fontSize: '0.7em' }}>{textToCopy}</pre>
            </Box>
        </Box>
    );
};

export default function AdminPortal() {
    // 1. STATE MANAGEMENT
    const [topic, setTopic] = React.useState("The boy who helped");
    const [premise, setPremise] = React.useState("A kind young boy helps an elderly man cross a busy street with heavy traffic.");
    const [level, setLevel] = React.useState(3);
    const [language, setLanguage] = React.useState("ta");
    // Gender removed as per request (defaults to 'child' in API)

    // NEW CONTROLS
    const [enableImages, setEnableImages] = React.useState(true);
    const [useSaga, setUseSaga] = React.useState(true); // Default to SAGA v2
    const [reviewVisuals, setReviewVisuals] = React.useState(false); // Default: Auto-Run (No stop)
    const [premiseAnalysis, setPremiseAnalysis] = React.useState<any>(null);
    const [checkingPremise, setCheckingPremise] = React.useState(false);

    const [loading, setLoading] = React.useState(false);
    const [logs, setLogs] = React.useState<any[]>([]);
    const [result, setResult] = React.useState<any>(null);
    const [previewStory, setPreviewStory] = React.useState<UnifiedStory | null>(null); // NEW: Holds the split state
    const [expandAll, setExpandAll] = React.useState(true);
    const [snack, setSnack] = React.useState({ open: false, message: "", severity: "success" as any });

    // Checklist State
    const [checklist, setChecklist] = React.useState({
        storyFlows: false,
        scriptCorrect: false,
        imagesRelevant: false,
        kidSafe: false
    });

    const [regeneratingIndex, setRegeneratingIndex] = React.useState<number | null>(null);

    // Sections
    const [section, setSection] = React.useState<'factory' | 'audio' | 'library'>('factory');
    const [showRevisionQueue, setShowRevisionQueue] = React.useState(false);

    // Revision Queue State (Mock/Local)
    const [flaggedStories, setFlaggedStories] = React.useState<any[]>([]);
    const [editingStory, setEditingStory] = React.useState<any>(null);

    const { time, start, stop, isRunning } = useStopwatch();

    // Helper to determine accurate image source
    const getSmartSrc = (path?: string, data?: string) => {
        // Case 1: Path exists and looks like a URL (short)
        if (path && path.length < 500) {
            const separator = path.includes('?') ? '&' : '?';
            return `${path}${separator}cb=${Date.now()}`;
        }
        // Case 2: Path exists but looks like base64 (long)
        if (path && path.length >= 500) {
            // Check if it already has the prefix
            if (path.startsWith('data:')) return path;
            return `data:image/jpeg;base64,${path}`;
        }
        // Case 3: No path, look at data
        if (data) {
            // If data is short and starts with / or http, it's a URL
            if (data.length < 500 && (data.startsWith('/') || data.startsWith('http'))) {
                return data;
            }
            // Otherwise treat as base64
            if (data.startsWith('data:')) return data;
            return `data:image/jpeg;base64,${data}`;
        }
        return "";
    };

    React.useEffect(() => {
        fetchRevisionQueue();
    }, []);

    const fetchRevisionQueue = async () => {
        try {
            const list = await fetch('/api/stories?summary=true').then(r => r.json());
            setFlaggedStories(list.filter((s: any) => s.community?.isRevisionRequired));
        } catch (e) {
            console.error("Failed to fetch queue", e);
        }
    };

    const handleResolveRevision = async (storyId: string, action: 'approve' | 'delete') => {
        if (!confirm(`Are you sure you want to ${action} this story?`)) return;

        try {
            if (action === 'delete') {
                const resp = await fetch(`/api/stories?storyId=${storyId}`, {
                    method: 'DELETE',
                });

                if (resp.ok) {
                    fetchRevisionQueue();
                    setSnack({ open: true, message: "Story Deleted", severity: "success" });
                } else {
                    alert("Failed to delete story");
                }
                return;
            }

            const resp = await fetch('/api/stories', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storyId: storyId,
                    isRevisionRequired: false
                })
            });

            if (resp.ok) {
                fetchRevisionQueue();
                setSnack({ open: true, message: "Story Approved!", severity: "success" });
            } else {
                alert("Failed to update story");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingStory) return;
        try {
            const resp = await fetch('/api/stories', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storyId: editingStory.storyId,
                    isRevisionRequired: false, // Auto-approve on save
                    pages: editingStory.pages // Send updated content
                })
            });

            if (resp.ok) {
                setEditingStory(null);
                // Refresh queue
                const list = await fetch('/api/stories?summary=true').then(r => r.json());
                setFlaggedStories(list.filter((s: any) => s.community?.isRevisionRequired));
                setSnack({ open: true, message: "Edits Saved & Approved!", severity: "success" });
            } else {
                alert("Failed to save edits");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving edits");
        }
    };

    const handleUpdatePageText = (index: number, field: 'text_native' | 'text_english', value: string) => {
        const updatedPages = [...editingStory.pages];
        updatedPages[index] = { ...updatedPages[index], [field]: value };
        setEditingStory({ ...editingStory, pages: updatedPages });
    };

    const handleLoadForFix = (story: any) => {
        // Prepare state for Content Factory
        setTopic(story.theme || "");
        setLevel(story.level || 3);
        setLanguage(story.language || "ta");

        // Reconstruct "result" object expected by the factory preview
        const reconstructed = {
            storyId: story.storyId,
            title: story.title_native,
            pages: story.pages.map((p: any, idx: number) => ({
                ...p,
                native: p.text_native,
                english: p.text_english,
                _meta: { pageIndex: idx }
            })),
            globalMeta: story.globalMeta,
            vocabulary: story.targetWords || [],
            culture: story.culture
        };

        setResult(reconstructed);
        setSection('factory');
        setShowRevisionQueue(false);
        setSnack({ open: true, message: "Story loaded for fixing.", severity: "info" });
    };

    // 2. LOGIC HANDLERS
    const handlePhase = (phase: any) => {
        setLogs(prev => {
            const existing = prev.find(p => p.name === phase.name);
            if (existing) {
                return prev.map(p => p.name === phase.name ? { ...p, ...phase } : p);
            }
            return [...prev, phase];
        });
    };

    const handleRun = async () => {
        setLoading(true);
        setLogs([]);
        setResult(null);
        setChecklist({ storyFlows: false, scriptCorrect: false, imagesRelevant: false, kidSafe: false });
        start();

        try {
            let res;
            if (useSaga) {
                // SPLIT PIPELINE
                const story = await previewUnifiedStory(
                    topic, premise, level, language, "child",
                    handlePhase
                );

                if (reviewVisuals) {
                    // STOP FOR USER REVIEW
                    setPreviewStory(story);
                    setLoading(false);
                    return;
                } else {
                    // AUTO-PROCEED TO PRODUCTION
                    res = await renderUnifiedStory(
                        story, language, level, topic,
                        handlePhase, { enableImages }
                    );
                }
            } else {
                res = await processFullStoryPipeline(
                    topic, premise, level, language, "child",
                    handlePhase,
                    { enableImages }
                );
            }
            setResult(res);
        } catch (error) {
            console.error(error);
            alert("Generation Failed. See logs.");
        } finally {
            setLoading(false);
            stop();
        }
    };

    const handleRegeneratePage = async (pageIndex: number) => {
        if (!result) return;
        setRegeneratingIndex(pageIndex);
        try {
            const page = result.pages[pageIndex];
            // Call API
            const updatedPage = await regeneratePageImage(
                pageIndex,
                page,
                result.globalMeta?.visualDNA,
                result.globalMeta?.blueprint,
                result.globalMeta?.casting,
                result.culture,
                topic,
                level,
                language,
                "",
                (pageIndex > 0 && result.pages[0]?.image?.data) ? result.pages[0].image.data : undefined
            );

            // Update Result State
            const newPages = [...result.pages];
            newPages[pageIndex] = updatedPage;
            setResult({ ...result, pages: newPages });

            // Show result
            const score = updatedPage.vision?.matchScore || 0;
            const isGood = score > 70; // Threshold
            setSnack({
                open: true,
                message: `Regenerated: Match Score ${score}% (${isGood ? 'Good' : 'Review'})`,
                severity: isGood ? 'success' : 'warning'
            });
        } catch (e) {
            console.error(e);
            alert("Regeneration failed");
        } finally {
            setRegeneratingIndex(null);
        }
    };

    const handleCheckPremise = async () => {
        if (!topic || !premise) return;
        setCheckingPremise(true);
        const report = await evaluatePremiseAction(topic, premise, level, language);
        setPremiseAnalysis(report);
        setCheckingPremise(false);
    };

    // Auto-Analyze Debounce
    React.useEffect(() => {
        // Don't analyze excessively short premises or if already analyzing
        if (premise.length < 10 || checkingPremise) return;

        const timer = setTimeout(() => {
            handleCheckPremise();
        }, 1500); // 1.5s debounce

        return () => clearTimeout(timer);
    }, [premise, topic, level, language]); // Re-run if premise, topic, level OR language changes

    const handleLoadSimulation = () => {
        const dummyPages = [
            {
                native: "அருண் ஒரு தாத்தாவைப் பார்த்தான்.",
                english: "Arun saw an old man.",
                image: { data: "/demo/page1.png" }, // Path based
                imageCaption: "Arun sees an old man on a busy street.",
                _meta: { pageIndex: 0 },
                vision: { caption: "Arun sees an old man.", altText: "Boy looking at old man.", matchScore: 90 }
            },
            {
                native: "தாத்தா சாலையைக் கடக்கப் பயந்தார்.",
                english: "The old man feared crossing.",
                image: { data: "/demo/page2.png" },
                imageCaption: "The old man looks worried about crossing.",
                _meta: { pageIndex: 1 },
                vision: { caption: "The old man looks worried.", altText: "Old man looking at traffic.", matchScore: 95 }
            },
            {
                native: "அவன் தாத்தாவின் கையைப் பிடித்தான்.",
                english: "He held the old man's hand.",
                image: { data: "/demo/page3.png" },
                imageCaption: "A kind boy gently holds the old man's hand.",
                _meta: { pageIndex: 2 },
                vision: { caption: "Boy holding bad.", altText: "Holding hands.", matchScore: 85 }
            },
            {
                native: "அவர்கள் சாலையைக் கடந்தனர்.",
                english: "They crossed the street.",
                image: { data: "/demo/page4.png" },
                imageCaption: "They cross the zebra crossing safely.",
                _meta: { pageIndex: 3 },
                vision: { caption: "Crossing the road.", altText: "Zebra crossing.", matchScore: 98 }
            },
            {
                native: "அருண் ஒரு தைரியமான சிறுவன்.",
                english: "Arun was a brave boy.",
                image: { data: "/demo/page5.png" },
                imageCaption: "Arun smiles, happy to help.",
                _meta: { pageIndex: 4 },
                vision: { caption: "Arun smiling.", altText: "Happy boy.", matchScore: 92 }
            }
        ];

        const dummyExercises = [
            {
                type: "ordering",
                prompt_native: "Arrange the events:",
                items_native: ["Saw Grandpa", "Held Hand", "Crossed Road"],
                jumbled_native: ["Held Hand", "Crossed Road", "Saw Grandpa"]
            },
            {
                type: "comprehension",
                question_native: "Why was the grandpa scared?",
                options_native: ["Too much traffic", "He was tired", "It was raining"],
                answer_native: "Too much traffic"
            },
            {
                type: "critical_thinking",
                prompt_native: "Why is it important to help others?",
                talking_points_native: ["Kindness", "Safety", "Community"]
            }
        ];

        setResult({
            title: "System Simulation (Test)",
            pages: dummyPages,
            exercises: dummyExercises,
            audit: { score: 100, flagged: false, notes: "Offline Simulation" },
            globalMeta: { visualDNA: "simulated" },
            mode: "multimodal"
        });
        setSnack({ open: true, message: "Offline Simulation Loaded!", severity: "success" }); // Feedback
    };

    // NEW: Vocabulary Enrichment

    const handleEnrichVocabulary = async () => {
        if (!result) return;
        setLoading(true);
        try {
            // content for analysis
            const fullText = result.pages.map((p: any) => p.native).join(" ");
            const res = await enrichVocabularyAction(language, level, fullText);

            if (res.status === 'success' && res.vocabulary) {
                // Update Result with new vocabulary
                setResult((prev: any) => ({
                    ...prev,
                    vocabulary: res.vocabulary, // Store in result
                    // Also update audit log
                    audit: { ...prev.audit, notes: prev.audit.notes + " | Vocabulary Enriched" }
                }));
                setSnack({ open: true, message: "Vocabulary Expanded!", severity: "success" }); // "Vocabulary Expanded!"
            } else {
                alert("Enrichment failed: " + res.message);
            }
        } catch (e) {
            console.error(e);
            alert("Enrichment Error");
        } finally {
            setLoading(false);
        }
    };

    // NEW: Audio Pre-fetch
    const handleAutoAudio = async () => {
        if (!result) return;
        // Don't set global loading, just do it in background or show a toast?
        // Let's show a small indicator or just do it.
        // User said "initiate... ready when we view".

        const newPages = [...result.pages];
        let changed = false;

        // Iterate pages
        for (let i = 0; i < newPages.length; i++) {
            const page = newPages[i];
            if (!page.native) continue;

            // If already has audio, skip
            if (page.audio?.prosody) continue;

            try {
                // Call existing action
                const audioRes = await getOrGenerateAudioAction(language, level, page.native);
                if (audioRes.status === 'success' && audioRes.prosody) {
                    newPages[i] = {
                        ...page,
                        audio: { prosody: audioRes.prosody }
                    };
                    changed = true;
                }
            } catch (e) {
                console.warn("Audio pre-fetch failed for page " + i, e);
            }
        }

        if (changed) {
            setResult((prev: any) => ({ ...prev, pages: newPages }));
            // Could show a "Audio Ready" toast
        }
    };

    // Auto-Effect: When Result is Ready, Start Audio
    React.useEffect(() => {
        if (result && !result.audioReady) {
            // Mark as attempted so we don't loop
            // We use a local Ref or just check if pages have audio.
            // Simplified: Just call it. It checks if audio exists.
            handleAutoAudio();
        }
    }, [result]);

    const handlePublish = async () => {
        if (!result) return;
        try {
            // Map Vocabulary to TargetWords
            // Result.vocabulary comes from (A) Prompt or (B) Enrichment
            const finalVocab = result.vocabulary || [];
            const targetWords = finalVocab.map((v: any) => ({
                native: v.native,
                meaning_en: v.meaning_en || v.meaning, // Handle both keys
                transliteration: v.transliteration,
                id: "word_" + Math.random().toString(36).substr(2, 9) // Generate IDs
            }));

            // Map Pages to include AUDIO (new) and link words
            const finalPages = result.pages.map((p: any) => {
                const isLocalPath = p.image?.data?.startsWith('/');

                // Link Target Words found in this page
                const pageWordIds = targetWords
                    .filter((tw: any) => p.native.includes(tw.native))
                    .map((tw: any) => tw.id);

                return {
                    pageNumber: p._meta.pageIndex + 1,
                    text_native: p.native,
                    text_english: p.english,
                    image: isLocalPath ? undefined : (p.image || undefined),
                    imagePath: isLocalPath ? p.image.data : undefined,
                    imageCaption: p.imageCaption,
                    components: p.components,
                    // NEW: Persist Audio Prosody
                    audio: p.audio,
                    // NEW: Link Vocabulary
                    targetWordIds: pageWordIds
                };
            });

            const payload = {
                title_native: result.title,
                title_english: result.title,
                language: language,
                level: level,
                theme: topic,
                pages: finalPages,
                targetWords: targetWords, // <--- NOW POPULATED
                exercises: result.exercises || [],
                globalMeta: result.globalMeta,
                community: { rating: 5, views: 0 },
                storyId: result.storyId || `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };

            const resp = await fetch('/api/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                setSnack({ open: true, message: "Story Published!", severity: "success" });
                // Reset factory
                setResult(null);
                setLogs([]);
                setChecklist({ storyFlows: false, scriptCorrect: false, imagesRelevant: false, kidSafe: false });
                // Auto-switch to library to show flow
                setSection('library');
            } else {
                alert("Failed to save story");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving story");
        }
    };

    // ... existing helpers ...

    const handleRenderScenes = async (updatedVisualDef: any) => {
        if (!previewStory) return;

        setLoading(true);
        // Don't clear logs, append to them
        try {
            // Merge the edited visuals back into the full story
            const fullEditedStory: UnifiedStory = {
                ...previewStory,
                visual_definition: updatedVisualDef
            };

            // Pass the edited story to Phase 2
            const res = await renderUnifiedStory(
                fullEditedStory, language, level, topic,
                handlePhase, { enableImages }
            );
            setResult(res);
            setPreviewStory(null); // Hide editor
        } catch (e) {
            console.error(e);
            alert("Render Failed");
        } finally {
            setLoading(false);
            stop();
        }
    };

    // 3. RENDER
    return (
        // [User Request: +128px wider column = ~1330px total container]
        <Container maxWidth={false} sx={{ maxWidth: '1330px', py: 6 }}>
            {section === 'audio' ? (
                <AudioStoryLab onBack={() => setSection('factory')} />
            ) : section === 'library' ? (
                <LibraryManager
                    onBack={() => setSection('factory')}
                    onStoryRetracted={() => {
                        fetchRevisionQueue();
                        setShowRevisionQueue(true); // Jump to queue
                    }}
                />
            ) : (
                <Paper elevation={0} sx={{ p: 5, borderRadius: 0, border: '1px solid #111', minHeight: '940px' /* +264px */ }}>
                    <Grid container spacing={4}>
                        {/* INPUT CONTROLS */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Stack spacing={3}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="h5" fontWeight={950}>Content Factory</Typography>
                                        {logs.length > 0 && (() => {
                                            const authorLog = logs.find(l => l.name.includes("Authoring"));
                                            const meta = authorLog?.output?._aiMeta;
                                            if (!meta) return null;
                                            const isGemini3 = meta.isGemini3 || meta.modelUsed.includes("experimental") || meta.modelUsed.includes("3.0");
                                            return (
                                                <Chip
                                                    label={isGemini3 ? `⚡ Logic: ${meta.modelUsed}` : `⚠️ Logic: ${meta.modelUsed}`}
                                                    color={isGemini3 ? "secondary" : "warning"}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', borderRadius: 0 }}
                                                />
                                            );
                                        })()}
                                    </Box>
                                </Box>

                                <Stack direction="row" spacing={1} justifyContent="flex-start">
                                    <Button size="small" color="inherit" onClick={() => setSection('library')} startIcon={<LocalLibraryIcon />} sx={{ fontWeight: 'bold' }}>Library</Button>
                                    <Button size="small" color="inherit" onClick={() => setSection('audio')} startIcon={<GraphicEqIcon />} sx={{ fontWeight: 'bold' }}>Audio Lab</Button>
                                    <Button size="small" color={showRevisionQueue ? "primary" : "inherit"} onClick={() => setShowRevisionQueue(!showRevisionQueue)} sx={{ fontWeight: 'bold' }}>{showRevisionQueue ? "Factory" : "Queue 🛡️"}</Button>
                                </Stack>

                                {/* GROUP 1: STORY CORE */}
                                <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 0, display: 'flex', flexDirection: 'column', gap: 2, border: '1px solid #111' }}>
                                    <Typography variant="caption" fontWeight={900} color="text.secondary">STORY CORE</Typography>
                                    <TextField fullWidth label="Story Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
                                    <TextField fullWidth multiline rows={12} label="Story Premise" value={premise} onChange={(e) => setPremise(e.target.value)} />

                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Button size="small" variant="outlined" onClick={handleCheckPremise} disabled={checkingPremise}>
                                            {checkingPremise ? "Analyzing..." : "🩺 Analyze Premise"}
                                        </Button>
                                    </Box>



                                    {premiseAnalysis && (
                                        <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #111', borderRadius: 0 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={800} color={premiseAnalysis.score > 70 ? 'success.main' : 'warning.main'}>
                                                        {premiseAnalysis.quality} ({premiseAnalysis.score}/100)
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">Evaluated by Gemini 2.0 Flash</Typography>
                                                </Box>
                                                <Chip size="small" label={premiseAnalysis.score > 90 ? "Excellent" : "Needs Polish"} color={premiseAnalysis.score > 90 ? "success" : "warning"} sx={{ borderRadius: 0 }} />
                                            </Box>

                                            {/* METRICS GRID */}
                                            <Grid container spacing={1} sx={{ mb: 2 }}>
                                                {premiseAnalysis.feedback && Array.isArray(premiseAnalysis.feedback) ? (
                                                    premiseAnalysis.feedback.map((item: any, i: number) => (
                                                        <Grid size={{ xs: 6 }} key={i}>
                                                            <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 0, border: '1px solid #111' }}>
                                                                <Typography variant="caption" fontWeight={800} display="block" color="text.secondary">{item.category}</Typography>
                                                                <Typography variant="body2" fontWeight={700} color={item.rating === 'Positive' ? 'success.main' : 'warning.main'}>{item.rating}</Typography>
                                                                <Typography variant="caption" sx={{ lineHeight: 1.1, display: 'block', mt: 0.5, color: '#555' }}>
                                                                    {item.text}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    ))
                                                ) : null}
                                            </Grid>

                                            {/* ACTION: APPLY REWRITE */}
                                            {premiseAnalysis.rewritten_premise && premiseAnalysis.score < 95 && (
                                                <Box sx={{ mt: 2, p: 2, bgcolor: '#eff6ff', borderRadius: 0, border: '1px dashed #111' }}>
                                                    <Typography variant="caption" fontWeight={900} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <AutoFixHighIcon fontSize="inherit" /> GEMINI 2.0 FLASH OPTIMIZATION
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mt: 1, mb: 1.5, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                        "{premiseAnalysis.rewritten_premise}"
                                                    </Typography>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        fullWidth
                                                        onClick={() => setPremise(premiseAnalysis.rewritten_premise)}
                                                        sx={{ bgcolor: '#2563eb', fontWeight: 'bold' }}
                                                    >
                                                        Apply Improved Premise
                                                    </Button>
                                                </Box>
                                            )}
                                        </Paper>
                                    )}
                                </Paper>

                                {/* GROUP 2: TARGET AUDIENCE */}
                                <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 0, border: '1px solid #111', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Typography variant="caption" fontWeight={900} color="text.secondary">TARGET AUDIENCE</Typography>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Language</InputLabel>
                                                <Select value={language} label="Language" onChange={(e) => setLanguage(e.target.value)}>
                                                    <MenuItem value="ta">Tamil</MenuItem>
                                                    <MenuItem value="en">English</MenuItem>
                                                    <MenuItem value="hi">Hindi</MenuItem>
                                                    <MenuItem value="ja">Japanese</MenuItem>
                                                    <MenuItem value="zh">Chinese</MenuItem>
                                                    <MenuItem value="es">Spanish</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Level</InputLabel>
                                                <Select value={level} label="Level" onChange={(e) => setLevel(Number(e.target.value))}>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(l => <MenuItem key={l} value={l}>Level {l}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                    {/* Gender Input Removed */}
                                </Paper>

                                {/* Content Operations */}
                                <Accordion sx={{ mt: 2, mb: 2, border: '1px solid #ccc', borderRadius: 2, '&:before': { display: 'none' } }} elevation={0}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6">🛠️ Content Operations</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ bgcolor: '#f9f9f9', p: 3 }}>
                                        <Alert severity="info" sx={{ mb: 2 }}>
                                            Utilities for content management.
                                        </Alert>
                                        <Stack direction="row" spacing={2}>
                                            <Button
                                                variant="outlined"
                                                color="warning"
                                                onClick={async () => {
                                                    const confirm = window.confirm("This will scan all stories and generate missing vocabulary using AI. It may take some time. Continue?");
                                                    if (!confirm) return;

                                                    try {
                                                        // Dynamic import to avoid server-action build issues in client
                                                        const { backfillVocabularyAction } = await import('@/app/actions/backfill-vocabulary');
                                                        setSnack({ open: true, message: "Starting backfill... check console for progress.", severity: 'info' });

                                                        const res = await backfillVocabularyAction();
                                                        if (res.success) {
                                                            setSnack({ open: true, message: `Backfill Complete! Updated ${res.updatedCount} stories.`, severity: 'success' });
                                                        } else {
                                                            setSnack({ open: true, message: `Backfill Failed: ${res.message}`, severity: 'error' });
                                                        }
                                                    } catch (e: any) {
                                                        setSnack({ open: true, message: `Error: ${e.message}`, severity: 'error' });
                                                    }
                                                }}
                                            >
                                                Backfill Missing Vocabulary
                                            </Button>
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>

                                {/* GROUP 3: PRODUCTION SETTINGS */}
                                <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 0, border: '1px solid #111' }}>
                                    <Typography variant="caption" fontWeight={900} color="text.secondary" gutterBottom>PRODUCTION SETTINGS</Typography>
                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                        <FormControlLabel control={<Checkbox checked={enableImages} onChange={(e) => setEnableImages(e.target.checked)} />} label={<Typography variant="body2">Generate Images</Typography>} />
                                        <FormControlLabel control={<Checkbox checked={useSaga} onChange={(e) => setUseSaga(e.target.checked)} />} label={<Typography variant="body2" fontWeight="bold" color="primary">Enable SAGA v2 (Pixar Mode)</Typography>} />
                                        {useSaga && (
                                            <FormControlLabel control={<Checkbox checked={reviewVisuals} onChange={(e) => setReviewVisuals(e.target.checked)} />} label={<Typography variant="body2" fontWeight="bold" color="secondary">Director Mode (Interactive Review)</Typography>} />
                                        )}
                                        <FormControlLabel control={<Checkbox checked={expandAll} onChange={(e) => setExpandAll(e.target.checked)} />} label={<Typography variant="body2">Debug Mode</Typography>} />
                                    </Stack>
                                </Paper>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                                    {/* SAFETY CHECK: Block if Score < 70 */}
                                    {premiseAnalysis && premiseAnalysis.score < 70 && (
                                        <Alert severity="error" variant="filled" sx={{ borderRadius: 0, fontWeight: 'bold' }}>
                                            SAFETY BLOCK: Premise Score {premiseAnalysis.score}/100 is too low. Please improve or use the "Apply Improved Premise" button above.
                                        </Alert>
                                    )}

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        disabled={loading || (premiseAnalysis && premiseAnalysis.score < 70)}
                                        onClick={handleRun}
                                        sx={{ py: 2, bgcolor: '#111', fontWeight: 900, '&.Mui-disabled': { bgcolor: '#555', color: '#aaa' } }}
                                    >
                                        {loading ? "Agents Working..." : (premiseAnalysis && premiseAnalysis.score < 70) ? "LOCKED (Low Score)" : "Generate Story"}
                                    </Button>

                                    <Button fullWidth variant="outlined" disabled={loading} onClick={handleLoadSimulation} sx={{ py: 1, fontWeight: 700, borderStyle: 'dashed' }}>
                                        🛠️ Load Simulation (Offline)
                                    </Button>

                                    {(loading || result) && <TimerDisplay timeMs={time} />}

                                    <Box sx={{ mt: 2, textAlign: 'center', opacity: 0.7 }}>
                                        <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                                            GrowNative generates content using AI. Important: Parents should not enter any personally identifiable information (PII) of children. Always review generated stories for safety and accuracy.
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Grid>

                        {/* OUTPUT / QUEUE */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            {showRevisionQueue ? (
                                <Box>
                                    <Typography variant="h5" fontWeight={950} sx={{ mb: 3 }}>🛡️ Revision Queue</Typography>
                                    {
                                        flaggedStories.length === 0 ? (
                                            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 0, border: '1px solid #111' }}>
                                                <Typography color="text.secondary">All quiet! No stories flagged for revision.</Typography>
                                            </Paper>
                                        ) : (
                                            <Stack spacing={2}>
                                                {flaggedStories.map(s => (
                                                    <Paper key={s.storyId} sx={{ p: 3, borderRadius: 0, border: '1px solid #fee2e2' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                            <Box>
                                                                <Typography variant="h6" fontWeight={950}>{s.title_native}</Typography>
                                                                <Typography variant="caption" display="block">Language: {s.language?.toUpperCase() || '??'} • Level: {s.level}</Typography>
                                                            </Box>
                                                            <Stack direction="row" spacing={1}>
                                                                <Button size="small" variant="contained" color="secondary" startIcon={<AutoFixHighIcon />} onClick={() => handleLoadForFix(s)}>
                                                                    Fix in Factory
                                                                </Button>
                                                                <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => setEditingStory(s)}>
                                                                    Quick Edit
                                                                </Button>
                                                                <Button size="small" variant="contained" color="success" onClick={() => handleResolveRevision(s.storyId, 'approve')}>Approve</Button>
                                                                <Button size="small" variant="outlined" color="error" onClick={() => handleResolveRevision(s.storyId, 'delete')}>Remove</Button>
                                                            </Stack>
                                                        </Box>
                                                        <Divider sx={{ my: 1.5 }} />
                                                        <Typography variant="subtitle2" fontWeight={800} color="error">Revision Notes:</Typography>
                                                        <Box sx={{ mt: 1 }}>
                                                            {s.community?.revisionNotes?.map((note: string, i: number) => (
                                                                <Typography key={i} variant="body2" sx={{ p: 1, bgcolor: '#fff5f5', borderRadius: '8px', mb: 0.5 }}>• {note}</Typography>
                                                            ))}
                                                        </Box>
                                                    </Paper>
                                                ))}
                                            </Stack>
                                        )
                                    }
                                </Box >
                            ) : (
                                // ... (Story Preview Section) ...
                                <>
                                    {/* VISUAL CONCEPT TOOL (COLOR AREA) */}
                                    {previewStory && !result && (
                                        <VisualDefinitionEditor
                                            story={previewStory}
                                            onSave={handleRenderScenes}
                                            onCancel={() => { setPreviewStory(null); setLogs([]); }}
                                        />
                                    )}

                                    {/* STORY PREVIEW */}
                                    {result && result.pages && (
                                        <Box sx={{ mb: 4, bgcolor: '#f5f5f5', borderRadius: 0, overflow: 'hidden', border: '2px solid #111' }}>
                                            <Box sx={{ p: 3, borderBottom: '1px solid #ddd', bgcolor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={950}>📖 Story Preview</Typography>
                                                    <Typography variant="caption" color="text.secondary">Level {level} • {result.visual_guide ? "Locked Context ✅" : "Standard"}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        variant="outlined"
                                                        color="secondary"
                                                        onClick={handleEnrichVocabulary}
                                                        disabled={loading}
                                                        sx={{ borderRadius: 0, fontWeight: 'bold', border: '2px solid', boxShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}
                                                    >
                                                        ✨ Enrich Vocabulary
                                                    </Button>
                                                    <Button variant="contained" color="success" startIcon={<PublishIcon />} onClick={handlePublish} disabled={!Object.values(checklist).every(v => v)} sx={{ borderRadius: 0, fontWeight: 'bold', border: '2px solid #111', boxShadow: '4px 4px 0px #111' }}>Publish</Button>
                                                </Box>
                                            </Box>

                                            <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
                                                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Satisfaction Checklist</Typography>
                                                <Grid container spacing={1}>
                                                    <Grid size={{ xs: 6 }}><FormControlLabel control={<Checkbox size="small" checked={checklist.storyFlows} onChange={(e) => setChecklist({ ...checklist, storyFlows: e.target.checked })} />} label={<Typography variant="caption">Story flows well</Typography>} /></Grid>
                                                    <Grid size={{ xs: 6 }}><FormControlLabel control={<Checkbox size="small" checked={checklist.scriptCorrect} onChange={(e) => setChecklist({ ...checklist, scriptCorrect: e.target.checked })} />} label={<Typography variant="caption">Script is correct</Typography>} /></Grid>
                                                    <Grid size={{ xs: 6 }}><FormControlLabel control={<Checkbox size="small" checked={checklist.imagesRelevant} onChange={(e) => setChecklist({ ...checklist, imagesRelevant: e.target.checked })} />} label={<Typography variant="caption">Images are relevant</Typography>} /></Grid>
                                                    <Grid size={{ xs: 6 }}><FormControlLabel control={<Checkbox size="small" checked={checklist.kidSafe} onChange={(e) => setChecklist({ ...checklist, kidSafe: e.target.checked })} />} label={<Typography variant="caption">Kid-safe verified</Typography>} /></Grid>
                                                </Grid>
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', scrollSnapType: 'x mandatory', p: 4, '&::-webkit-scrollbar': { height: 8 }, '&::-webkit-scrollbar-thumb': { borderRadius: 4, bgcolor: '#ccc' } }}>
                                                {result.pages.map((page: any, idx: number) => (
                                                    <Box key={idx} sx={{ scrollSnapAlign: 'center', flexShrink: 0, width: '400px', bgcolor: '#fff', borderRadius: 0, border: '2px solid #111', overflow: 'hidden', boxShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}>
                                                        <Box sx={{ position: 'relative', width: '100%', height: '300px', bgcolor: '#f9f9f9' }}>
                                                            {regeneratingIndex === idx ? (
                                                                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                                                    <CircularProgress size={32} />
                                                                    <Typography variant="caption" fontWeight={700}>Regenerating Illustration...</Typography>
                                                                </Box>
                                                            ) : (
                                                                <>
                                                                    {page.imagePath || (page.image && page.image.data) ? (
                                                                        <img
                                                                            src={getSmartSrc(page.imagePath, page.image?.data)}
                                                                            alt={page.vision?.altText || "Scene illustration"}
                                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                        />
                                                                    ) : (
                                                                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f0f0', p: 3, textAlign: 'center' }}>
                                                                            {result.mode === 'text_only' ? (
                                                                                <>
                                                                                    <Typography variant="h4">📝</Typography>
                                                                                    <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mt: 1 }}>Visuals Disabled</Typography>
                                                                                    <Typography variant="caption" color="text.secondary">Quota Limit Reached</Typography>
                                                                                </>
                                                                            ) : (
                                                                                <Typography variant="caption" color="text.secondary">Ready for Generation</Typography>
                                                                            )}
                                                                        </Box>
                                                                    )}
                                                                    <Button size="small" variant="contained" color="primary" onClick={() => handleRegeneratePage(idx)} sx={{ position: 'absolute', top: 12, right: 12, minWidth: 0, p: 1.5, borderRadius: 0, boxShadow: 4, zIndex: 10, border: '2px solid #111' }} title="Regenerate this scene"><ReplayIcon fontSize="small" /></Button>
                                                                </>
                                                            )}
                                                        </Box>
                                                        <Box sx={{ p: 3 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                                <Typography variant="h6" fontWeight={950} sx={{ lineHeight: 1.3, color: '#111', flex: 1 }}>{page.native}</Typography>
                                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                    <IconButton size="small" onClick={async () => {
                                                                        const audioRes = await getOrGenerateAudioAction(language, level, page.native);
                                                                        const options = audioRes.status === 'success' && audioRes.prosody ? {
                                                                            rate: audioRes.prosody.rate,
                                                                            pitch: audioRes.prosody.pitch,
                                                                            volume: audioRes.prosody.volume
                                                                        } : undefined;
                                                                        speak(page.native, language === 'ta' ? 'ta-IN' : 'en-US', options);
                                                                    }} title="Read Aloud"> {/* Simple lang mapping for now */}
                                                                        <VolumeUpIcon fontSize="small" />
                                                                    </IconButton>
                                                                    <IconButton size="small" onClick={() => stopSpeaking()} title="Stop Audio">
                                                                        <StopCircleIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Box>
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{page.english}</Typography>
                                                            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 0, border: '1px dashed rgba(0,0,0,0.1)' }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                                    <AccessibilityNewIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                                                    <Typography variant="caption" fontWeight={900} color="primary">ACCESSIBILITY</Typography>
                                                                </Box>
                                                                <Typography variant="body2" fontWeight={700} sx={{ mb: 1, fontSize: '0.8rem' }}>Caption: "{page.vision?.caption || 'Generating...'}"</Typography>
                                                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.4 }}>Alt Text: {page.vision?.altText || 'Pending...'}</Typography>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ px: 3, pb: 2, display: 'flex', gap: 1 }}>
                                                            <Chip size="small" label={`Pg ${idx + 1}`} sx={{ fontWeight: 'bold', borderRadius: 0 }} />
                                                            <Chip size="small" label={page.vision?.matchScore > 0 ? `${Math.round(page.vision.matchScore)}%` : "Auditing..."} color={page.vision?.matchScore > 80 ? "success" : "default"} variant="outlined" sx={{ borderRadius: 0 }} />
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    <Typography variant="button" sx={{ fontWeight: 900, color: 'text.secondary' }}>Agentic Timeline</Typography>
                                    <Box sx={{ my: 1 }}>
                                        <CostTracker logs={logs} />
                                    </Box>
                                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                                        {logs.map((log, i) => (
                                            <Accordion key={i} expanded={expandAll} sx={{ borderRadius: '0 !important', boxShadow: 'none', border: '1px solid #111' }}>
                                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                                                        {log.status === 'loading' ? <CircularProgress size={16} /> : null}
                                                        <Typography fontWeight={800}>{log.name}</Typography>
                                                        <Chip label={log.status.toUpperCase()} size="small" color={log.status === 'success' ? 'success' : 'default'} />
                                                    </Stack>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ bgcolor: '#fafafa', p: 3 }}>
                                                    <Typography variant="caption" fontWeight={900}>CONNECTED RESPONSE:</Typography>
                                                    {renderOutput(log.output)}
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                    </Stack>
                                </>
                            )}
                        </Grid >
                    </Grid >
                </Paper >
            )
            }
            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
                <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity as any} sx={{ width: '100%' }}>
                    {snack.message}
                </Alert>
            </Snackbar>

            {/* EDIT DIALOG */}
            <Dialog open={!!editingStory} onClose={() => setEditingStory(null)} maxWidth="md" fullWidth>
                <DialogTitle fontWeight={900}>Edit Story Content</DialogTitle>
                <DialogContent>
                    {editingStory && (
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            {editingStory.pages?.map((page: any, idx: number) => (
                                <Box key={idx} sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                                    <Typography variant="caption" fontWeight={800} color="text.secondary">Page {idx + 1}</Typography>
                                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                        <Grid size={{ xs: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Native Text"
                                                multiline
                                                rows={2}
                                                value={page.text_native || page.native || ""}
                                                onChange={(e) => handleUpdatePageText(idx, 'text_native', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="English Text"
                                                multiline
                                                rows={2}
                                                value={page.text_english || page.english || ""}
                                                onChange={(e) => handleUpdatePageText(idx, 'text_english', e.target.value)}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setEditingStory(null)} color="inherit">Cancel</Button>
                    <Button onClick={handleSaveEdit} variant="contained" color="primary" sx={{ fontWeight: 'bold' }}>
                        Save & Approve
                    </Button>
                </DialogActions>
            </Dialog>
        </Container >
    );
}