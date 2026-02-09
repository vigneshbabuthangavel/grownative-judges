"use client";

import * as React from "react";
import Image from "next/image";
import {
    Container, Box, Typography, IconButton, Button, Paper,
    LinearProgress, Divider, TextField, FormControl, InputLabel,
    Select, MenuItem, Stack, Alert, CircularProgress, Tooltip
} from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import SchoolIcon from "@mui/icons-material/School";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fireConfetti, fireAlphabetConfetti } from "@/lib/confetti";
import CelebrationIcon from '@mui/icons-material/Celebration';
import AbcIcon from '@mui/icons-material/Abc';
import Chip from "@mui/material/Chip";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { LEVEL_STUBS, LANGUAGE_OPTIONS } from "./stubs";


import { getOrGenerateAudioAction } from "@/app/actions/audio";

export function StoryDummyPage({ onBack }: { onBack: () => void }) {
    const [activeLevel, setActiveLevel] = React.useState(1);
    const [language, setLanguage] = React.useState("ta");
    const [audioModel, setAudioModel] = React.useState("gemini-3-mock"); // Default to the requested model
    const [voiceGender, setVoiceGender] = React.useState("female"); // New Gender State
    const [loading, setLoading] = React.useState(false);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
    const [logs, setLogs] = React.useState<string[]>([]);
    const [speed, setSpeed] = React.useState(1.0);
    const [editableText, setEditableText] = React.useState("");

    // Fallback if stub data is missing
    const langStubs = LEVEL_STUBS[language] || LEVEL_STUBS['ta'];
    const activeStub = langStubs[activeLevel - 1] || langStubs[0];

    // Sync state when level/language changes
    React.useEffect(() => {
        setEditableText(activeStub.text_native);
        setAudioUrl(null); // Reset audio state
        // Auto-fetch/generate audio (Simulating "Always Ready")
        if (audioModel === 'gemini-3-mock') {
            autoFetchAudio();
        }
    }, [activeStub, language, audioModel]);

    const autoFetchAudio = async () => {
        setLoading(true);
        try {
            // "Directed TTS" strategy: Get instructions from Gemini, then Speak locally
            const res = await getOrGenerateAudioAction(language, activeLevel, activeStub.text_native);

            if (res.status === 'success') {
                if (res.prosody) {
                    addLog(`[Gemini Director] Mood: ${res.prosody.emotion.toUpperCase()} | Speed: ${res.prosody.rate}x`);
                    // Apply Prosody to Local State
                    setSpeed(res.prosody.rate || 1.0);
                    // Map Emotion/Pitch if possible
                    // Note: Browser TTS pitch is limited, but we try.

                    // Auto-Play with new settings?
                    // Maybe just notify user "Audio Director Ready"
                }

                if (res.audioData) {
                    setAudioUrl(`data:audio/mp3;base64,${res.audioData}`);
                }
            }
        } catch (e) {
            console.error(e);
            addLog("Error fetching audio direction.");
        } finally {
            setLoading(false);
        }
    }

    const getLocale = (lang: string) => {
        const found = LANGUAGE_OPTIONS.find(l => l.code === lang);
        return found?.locale || 'en-US';
    };

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    // Enhanced TTS with Punctuation Logic
    const speakSentences = (chunks: { text: string, pause: number }[], index: number) => {
        if (index >= chunks.length) {
            setIsPlaying(false);
            addLog("Playback finished.");
            return;
        }

        const { text, pause } = chunks[index];
        if (!text.trim()) {
            speakSentences(chunks, index + 1);
            return;
        }

        const u = new SpeechSynthesisUtterance(text);
        u.lang = getLocale(language);
        u.rate = speed;

        // Voice Gender Simulation (Pitch Modulation)
        // Standard Web Speech API doesn't guarantee specific gender voices across all browsers/OS
        // So we use pitch to simulate: High (1.0-1.2) = Female/Child, Low (0.7-0.9) = Male
        if (voiceGender === 'male') {
            u.pitch = 0.8;
        } else {
            u.pitch = 1.1;
        }

        u.onstart = () => {
            if (index === 0) setIsPlaying(true);
        };

        u.onend = () => {
            // Apply Correct Pause based on punctuation type
            setTimeout(() => {
                if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
                    // no-op
                }
                speakSentences(chunks, index + 1);
            }, pause);
        };

        u.onerror = (e) => {
            console.error(e);
            setIsPlaying(false);
        };

        window.speechSynthesis.speak(u);
    };

    const handleSpeakText = (text: string) => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();

            // Intelligent Segmentation for Pauses
            // We want to split by comma (short pause) and sentence enders (long pause)
            // But keep the punctuation attached to the word for intonation.

            // 1. Split by punctuation, capturing the punctuation
            // Regex: ([^,;.?!।]+[,;.?!।]+) matches "Word," or "Sentence."
            const regex = /([^,;.?!।]+[,;.?!।]+)|([^,;.?!।]+$)/g;
            const matches = text.match(regex) || [text];

            const chunks = matches.map(chunk => {
                const trimmed = chunk.trim();
                let pause = 0;
                if (/[.?!।]$/.test(trimmed)) pause = 1000; // Full stop = 1s pause
                else if (/[,;]$/.test(trimmed)) pause = 400; // Comma = 400ms pause
                else pause = 200; // Default small gap

                return { text: trimmed, pause };
            });

            addLog(`Talking (${voiceGender}): ${chunks.length} segments detected.`);
            speakSentences(chunks, 0);
        } else {
            addLog("Browser TTS not supported.");
        }
    };

    const handleGenerateAudio = async () => {
        // ... (Logic handled by autoFetchAudio mostly, but kept for manual overrides)
        autoFetchAudio();
    };

    const handlePlay = () => {
        if (!audioUrl && audioModel === 'browser-tts') {
            handleSpeakText(editableText);
            return;
        }

        if (audioUrl && audioUrl.startsWith('data:audio')) {
            addLog(`Playing Real Server Audio...`);
            const audio = new Audio(audioUrl);
            audio.playbackRate = speed;

            setIsPlaying(true);
            audio.play().catch(e => {
                console.error("Audio Playback Error", e);
                addLog("Playback failed: " + e.message);
                setIsPlaying(false);
            });

            audio.onended = () => {
                setIsPlaying(false);
                addLog("Playback finished.");
            };

            audio.onerror = (e) => {
                console.error("Audio Load Error", e);
                setIsPlaying(false);
                addLog("Error loading audio file.");
            };
            return;
        }

        handleSpeakText(editableText); // Fallback
    };

    const handleStop = () => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
        addLog("Playback stopped.");
    };

    const handleTestConfetti = () => {
        addLog("Firing classic confetti celebration! 🎉");
        fireConfetti();
    };

    const handleTestAlphabetConfetti = () => {
        let chars = "ABC";
        if (language === 'ta') chars = "அஆஇ";
        if (language === 'hi') chars = "अआइ";
        if (language === 'ja') chars = "あいう";
        if (language === 'zh') chars = "你好吗";
        addLog(`Firing alphabet confetti (${chars})! 🔤`);
        fireAlphabetConfetti(chars);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 6 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
                Back to Admin
            </Button>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                {/* LEFT: STORY PREVIEW AND UI LAB */}
                <Box flex={1}>
                    <Paper elevation={0} sx={{ borderRadius: 0, overflow: 'hidden', border: '1px solid #ddd' }}>
                        {/* Header: Level & Language Selector */}
                        <Box sx={{ p: 2, borderBottom: '1px solid #eee', bgcolor: '#fff' }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <SchoolIcon fontSize="small" color="action" />
                                    <Typography variant="subtitle2" fontWeight={900}>LEVEL {activeLevel} • PREVIEW</Typography>
                                </Box>

                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <Select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        displayEmpty
                                        sx={{ fontWeight: 'bold' }}
                                    >
                                        {LANGUAGE_OPTIONS.map((opt) => (
                                            <MenuItem key={opt.code} value={opt.code} sx={{ fontWeight: 'medium' }}>
                                                {opt.label} ({opt.code.toUpperCase()})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>

                            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(lvl => (
                                    <Chip
                                        key={lvl}
                                        label={`L${lvl}`}
                                        clickable
                                        color={activeLevel === lvl ? "primary" : "default"}
                                        onClick={() => setActiveLevel(lvl)}
                                        size="small"
                                    />
                                ))}
                            </Stack>
                        </Box>


                        {/* Text Content */}
                        <Box sx={{ p: 4, position: 'relative' }}>
                            <Tooltip title={`Speak in ${LANGUAGE_OPTIONS.find(l => l.code === language)?.label}`}>
                                <IconButton
                                    onClick={() => handleSpeakText(editableText)}
                                    sx={{ position: 'absolute', top: 16, right: 16, bgcolor: '#f0f0f0', zIndex: 10 }}
                                >
                                    <VolumeUpIcon color="primary" />
                                </IconButton>
                            </Tooltip>

                            <TextField
                                fullWidth
                                multiline
                                variant="standard"
                                value={editableText}
                                onChange={(e) => setEditableText(e.target.value)}
                                InputProps={{
                                    disableUnderline: true,
                                    sx: { fontSize: '1.5rem', fontWeight: 950, color: '#111', lineHeight: 1.4 }
                                }}
                                sx={{ mb: 2, pr: 6 }}
                            />

                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                {activeStub.text_transliteration}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                                {activeStub.text_english}
                            </Typography>
                        </Box>
                    </Paper>

                    {/* NEW: Confetti Test Area under Story Preview */}
                    <Paper sx={{ mt: 3, p: 3, borderRadius: 0, border: '1px solid #e0e0e0', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={900}>UI/UX Laboratory</Typography>
                            <Typography variant="caption" color="text.secondary">Test visual effects and rewards</Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                            <Tooltip title="Standard Confetti">
                                <IconButton
                                    color="secondary"
                                    onClick={handleTestConfetti}
                                    sx={{ bgcolor: '#fce4ec' }}
                                >
                                    <CelebrationIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Alphabet Confetti (Language Aware)">
                                <IconButton
                                    color="primary"
                                    onClick={handleTestAlphabetConfetti}
                                    sx={{ bgcolor: '#e3f2fd' }}
                                >
                                    <AbcIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Paper>
                </Box>

                {/* RIGHT: AUDIO LAB CONTROLS */}
                <Box width={{ xs: '100%', md: 400 }}>
                    <Paper sx={{ p: 3, borderRadius: 0, border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <GraphicEqIcon color="primary" />
                            <Typography variant="h6" fontWeight={900}>Audio Lab 🧪</Typography>
                        </Box>

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Audio Model</InputLabel>
                            <Select
                                value={audioModel}
                                label="Audio Model"
                                onChange={(e) => setAudioModel(e.target.value)}
                            >
                                <MenuItem value="browser-tts">Browser Native (SpeechSynthesis)</MenuItem>
                                <MenuItem value="gemini-3-mock">Gemini 3.0 Experimental (Mock)</MenuItem>
                                <MenuItem value="eleven-labs">ElevenLabs Multi (Mock)</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" mb={1}>
                                VOICE GENDER
                            </Typography>
                            <ToggleButtonGroup
                                value={voiceGender}
                                exclusive
                                onChange={(e, n) => n && setVoiceGender(n)}
                                fullWidth
                                size="small"
                                color="primary"
                            >
                                <ToggleButton value="male">Male (Deep)</ToggleButton>
                                <ToggleButton value="female">Female (Soft)</ToggleButton>
                            </ToggleButtonGroup>
                        </FormControl>

                        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 0, mb: 3, border: '1px solid #ddd' }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                                PARAMS
                            </Typography>
                            <Stack spacing={2}>
                                {/* Speed Control */}
                                <TextField
                                    size="small"
                                    label="Speed"
                                    type="number"
                                    inputProps={{ step: 0.1, min: 0.5, max: 2.0 }}
                                    value={speed}
                                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                />
                            </Stack>
                        </Box>

                        {/* Status Indicator */}
                        {audioModel === 'gemini-3-mock' && (
                            <Alert severity={audioUrl ? "success" : "info"} sx={{ mb: 2, borderRadius: 0 }}>
                                {loading ? "Generating Audio..." : audioUrl ? "Audio Ready (Persisted)" : "Waiting for auto-gen..."}
                            </Alert>
                        )}


                        <Stack direction="row" spacing={2} mt={4}>
                            <Button
                                fullWidth
                                variant="contained"
                                color={isPlaying ? "error" : "primary"}
                                startIcon={isPlaying ? <StopCircleIcon /> : <PlayArrowIcon />}
                                onClick={isPlaying ? handleStop : handlePlay}
                                disabled={loading}
                                sx={{
                                    py: 2, fontWeight: 'black', borderRadius: 0, border: '2px solid #111', boxShadow: '4px 4px 0px #111',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.02)' }
                                }}
                            >
                                {isPlaying ? "Stop Playback" : "Play Audio"}
                            </Button>
                        </Stack>

                        <Box sx={{ mt: 3, p: 2, bgcolor: '#111', color: '#0f0', borderRadius: 0, fontFamily: 'monospace', fontSize: '0.75rem', height: 150, overflowY: 'auto' }}>
                            {logs.length === 0 ? <span style={{ opacity: 0.5 }}>Waiting for actions...</span> : logs.map((l, i) => (
                                <div key={i}>{l}</div>
                            ))}
                        </Box>

                    </Paper>
                </Box>
            </Stack>
        </Container>
    );
}
