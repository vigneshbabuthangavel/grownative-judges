"use client";

import * as React from "react";
import { Container, Box, Typography, Paper, Grid, Chip, Divider, List, ListItem, ListItemIcon, ListItemText, Button, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import SecurityIcon from "@mui/icons-material/Security";
import PsychologyIcon from "@mui/icons-material/Psychology";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import PaletteIcon from "@mui/icons-material/Palette";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import LockIcon from "@mui/icons-material/Lock";
import FlagIcon from "@mui/icons-material/Flag";

export default function ImplementationSpecPage() {
    const [activeCaseStudy, setActiveCaseStudy] = React.useState('football');

    return (
        <Container maxWidth="xl" sx={{ py: 8 }}> {/* Changed to XL for widescreen flow */}
            <Button component={Link as any} href="/" startIcon={<ArrowBackIcon />} sx={{ mb: 4, fontWeight: 'bold' }}>
                Back to Home
            </Button>

            <Box sx={{ mb: 12, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={950} gutterBottom sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2
                }}>
                    AI Implementation & Guardrails
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', lineHeight: 1.6 }}>
                    A transparent overview of the Generative AI models, workflows, and safety protocols powering the GrowNative platform.
                </Typography>
            </Box>

            <Box sx={{ position: 'relative', maxWidth: '1400px', mx: 'auto', pb: 8 }}>
                {/* Vertical Pipeline Line - Gradient for flow */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    bottom: 100, // Stop before the footer
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    background: 'linear-gradient(to bottom, #6d28d9 0%, #c2410c 40%, #10b981 100%)',
                    zIndex: 0,
                    borderRadius: '4px',
                    opacity: 0.3
                }} />

                <Stack spacing={12} sx={{ position: 'relative', zIndex: 1 }}>

                    {/* SECTION 1: NARRATIVE ENGINE */}
                    <Box sx={{ position: 'relative' }}>
                        {/* Timeline Marker */}
                        <Box sx={{
                            position: 'absolute',
                            top: -28,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            bgcolor: '#6d28d9',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 900,
                            border: '4px solid white',
                            boxShadow: '0 4px 12px rgba(109, 40, 217, 0.4)',
                            zIndex: 2
                        }}>1</Box>

                        <Paper elevation={0} sx={{
                            p: 6,
                            borderRadius: '40px',
                            border: '1px solid rgba(109, 40, 217, 0.1)',
                            background: 'linear-gradient(135deg, #ffffff 0%, #fbf7ff 100%)',
                            boxShadow: '0 8px 32px rgba(109, 40, 217, 0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, #6d28d9, #9333ea)' }} />

                            {/* CENTERED HEADER */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 6, mt: 2 }}>
                                <Box sx={{
                                    p: 2,
                                    bgcolor: 'rgba(109, 40, 217, 0.1)',
                                    borderRadius: '50%',
                                    mb: 2,
                                }}>
                                    <PsychologyIcon sx={{ fontSize: 40, color: '#6d28d9' }} />
                                </Box>
                                <Typography variant="h4" fontWeight={900} gutterBottom sx={{ color: '#111' }}>Narrative Engine</Typography>
                                <Chip
                                    icon={<AutoAwesomeIcon sx={{ color: 'white !important' }} />}
                                    label="Gemini 2.0 Flash (Orchestrator) • Gemini 3.0 Pro (The Brain)"
                                    sx={{
                                        fontWeight: 'bold',
                                        background: 'linear-gradient(45deg, #6d28d9 30%, #a855f7 90%)',
                                        color: 'white',
                                        px: 1,
                                        boxShadow: '0 4px 12px rgba(109, 40, 217, 0.3)'
                                    }}
                                />
                            </Box>

                            <Grid container spacing={6}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: '24px', height: '100%', border: '1px solid #f3e8ff' }}>
                                        <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#4c1d95' }}>
                                            <AutoFixHighIcon fontSize="medium" /> HLM Methodology
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" paragraph>
                                            **High-Density Linguistic & Multimodal Logic (HLM)** ensures every token is packed with specific cultural, pedagogical, and visual data for 100% integrity.
                                        </Typography>
                                        <Stack spacing={3}>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={800}>1. High-Density Cultural Anchoring</Typography>
                                                <Typography variant="body2" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                                                    Injects "Technical Anchors" (e.g., exact weave of a Kasavu Mundu) to prevent fallback to Western tropes.
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={800}>2. Linguistic Scaffolding</Typography>
                                                <Typography variant="body2" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                                                    Enforces literacy standards (e.g., Level 1 SVO syntax) and extracts key vocabulary for "Pedagogical Audit".
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={800}>3. Multimodal Stability</Typography>
                                                <Typography variant="body2" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                                                    Treats image and text as a unified "State", cross-checking visual output against the Linguistic Anchor.
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box sx={{ p: 4, bgcolor: '#ffffff', border: '1px solid #eee', borderRadius: '24px', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                        <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#15803d' }}>
                                            <SecurityIcon fontSize="medium" /> Safety Guardrails
                                        </Typography>
                                        <Stack spacing={3} sx={{ mt: 2 }}>
                                            {[
                                                { title: "Strict JSON Schema", desc: "Prevents hallucinations and ensures structural integrity.", ex: `Ex: Returns pure JSON, no "Here is your story" chat filler.` },
                                                { title: "Phase 4: Auto-Audit", desc: "A dedicated LLM pass validates 'Kid-Safety' before showing output.", ex: `Ex: Flagged "scary clown" &rarr; regenerated as "silly juggler".` },
                                                { title: "Topic Filtering", desc: "Pre-validation rejects harmful topics immediately.", ex: `Ex: Rejects "horror" or "violence" prompts instantly.` }
                                            ].map((item, i) => (
                                                <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                                                    <CheckCircleIcon fontSize="small" color="success" sx={{ mt: 0.5 }} />
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={800}>{item.title}</Typography>
                                                        <Typography variant="body2" display="block" color="text.secondary" sx={{ mb: 0.5 }}>{item.desc}</Typography>
                                                        <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: 'italic', bgcolor: '#f0fdf4', p: 0.5, px: 1, borderRadius: '4px', display: 'inline-block', color: '#166534' }}>{item.ex}</Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Grid>

                                {/* CULTURAL COMPARISON SECTION */}
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ p: 4, bgcolor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '24px' }}>
                                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                                            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ color: '#6b21a8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                The "Cultural Oracle" in Action <Chip label="Powered by Gemini 3.0" size="small" sx={{ bgcolor: '#6b21a8', color: 'white', fontWeight: 'bold', border: '1px solid #fff', boxShadow: '0 2px 8px rgba(107, 33, 168, 0.4)' }} />
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto', mb: 3 }}>
                                                <b>Same Prompt, Different Worlds.</b><br />Our HLM Logic adapts Visual DNA (clothing, environment, lighting) to match the cultural context without changing the core narrative.
                                            </Typography>

                                            {/* CASE STUDY TABS */}
                                            <Stack direction="row" spacing={2} justifyContent="center">
                                                {[
                                                    { id: 'football', label: 'Case Study A: Football' },
                                                    { id: 'sisters', label: 'Case Study B: Sisters' }
                                                ].map((tab) => (
                                                    <Box
                                                        key={tab.id}
                                                        onClick={() => setActiveCaseStudy(tab.id)}
                                                        sx={{
                                                            px: 3, py: 1, borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s',
                                                            bgcolor: activeCaseStudy === tab.id ? '#6b21a8' : 'white',
                                                            color: activeCaseStudy === tab.id ? 'white' : '#6b21a8',
                                                            border: '1px solid', borderColor: activeCaseStudy === tab.id ? '#6b21a8' : '#e9d5ff',
                                                            fontWeight: 800, fontSize: '0.9rem',
                                                            boxShadow: activeCaseStudy === tab.id ? '0 4px 12px rgba(107, 33, 168, 0.2)' : 'none',
                                                            '&:hover': { bgcolor: activeCaseStudy === tab.id ? '#6b21a8' : '#f3e8ff' }
                                                        }}
                                                    >
                                                        {tab.label}
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Box>

                                        {/* DYNAMIC CONTENT AREA */}
                                        <Box sx={{ overflow: 'hidden', border: '1px solid #e9d5ff', borderRadius: '16px', bgcolor: 'white', minHeight: '400px', transition: 'all 0.3s ease' }}>
                                            <Box sx={{ p: 2, bgcolor: '#f3e8ff', borderBottom: '1px solid #e9d5ff' }}>
                                                <Typography variant="subtitle2" fontWeight={800} color="#6b21a8" textAlign="center">
                                                    Prompt: "{activeCaseStudy === 'football' ? "Four boys playing football" : "Two little sisters playing with blocks"}"
                                                </Typography>
                                            </Box>

                                            {activeCaseStudy === 'football' ? (
                                                <Grid container>
                                                    <Grid size={{ xs: 12, md: 6 }} sx={{ borderRight: { md: '1px solid #e9d5ff' }, borderBottom: { xs: '1px solid #e9d5ff', md: 'none' } }}>
                                                        <Box sx={{ position: 'relative', aspectRatio: '16/9' }}>
                                                            <img src="/img/implementation/ta-football.jpg" alt="Tamil Cultural Context" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <Chip label="Context: Tamil (South India)" size="small" sx={{ position: 'absolute', bottom: 12, left: 12, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', fontWeight: 'bold' }} />
                                                        </Box>
                                                        <Box sx={{ p: 2 }}>
                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                <b>Key Details:</b> Dusty red earth, simple cotton attire, warm "golden hour" lighting.
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Box sx={{ position: 'relative', aspectRatio: '16/9' }}>
                                                            <img src="/img/implementation/zh-football.jpg" alt="Chinese Cultural Context" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <Chip label="Context: Chinese (Urban Park)" size="small" sx={{ position: 'absolute', bottom: 12, left: 12, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', fontWeight: 'bold' }} />
                                                        </Box>
                                                        <Box sx={{ p: 2 }}>
                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                <b>Key Details:</b> Lush green park, layered modern casuals, cooler urban lighting.
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            ) : (
                                                <Grid container>
                                                    <Grid size={{ xs: 12, md: 6 }} sx={{ borderRight: { md: '1px solid #e9d5ff' }, borderBottom: { xs: '1px solid #e9d5ff', md: 'none' } }}>
                                                        <Box sx={{ position: 'relative', aspectRatio: '16/9' }}>
                                                            <img src="/img/implementation/ta-sisters.jpg" alt="Tamil Cultural Context" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <Chip label="Context: Tamil (Traditional Home)" size="small" sx={{ position: 'absolute', bottom: 12, left: 12, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', fontWeight: 'bold' }} />
                                                        </Box>
                                                        <Box sx={{ p: 2 }}>
                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                <b>Key Details:</b> Tiled floor, wooden shutter windows, traditional 'Pattu Pavadai' dress, jasmine in hair.
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Box sx={{ position: 'relative', aspectRatio: '16/9' }}>
                                                            <img src="/img/implementation/ja-sisters.jpg" alt="Japanese Cultural Context" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <Chip label="Context: Japanese (Tatami Room)" size="small" sx={{ position: 'absolute', bottom: 12, left: 12, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', fontWeight: 'bold' }} />
                                                        </Box>
                                                        <Box sx={{ p: 2 }}>
                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                <b>Key Details:</b> Tatami mats, Shoji screen doors, school aesthetic clothing, soft diffused light.
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* HLM COMPARISON TABLE (FULL WIDTH) */}
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ p: 4, bgcolor: '#fcfaff', border: '1px dashed #d8b4fe', borderRadius: '24px' }}>
                                        <Typography variant="h6" fontWeight={800} gutterBottom sx={{ color: '#6d28d9', textAlign: 'center', mb: 3 }}>
                                            HLM Logic vs. Standard "One-Shot" Prompting
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 4 }}><Typography variant="subtitle2" fontWeight={900} color="text.secondary">Feature</Typography></Grid>
                                            <Grid size={{ xs: 4 }}><Typography variant="subtitle2" fontWeight={900} color="text.secondary">Standard Prompting</Typography></Grid>
                                            <Grid size={{ xs: 4 }}><Typography variant="subtitle2" fontWeight={900} color="primary">HLM Logic (GrowNative)</Typography></Grid>

                                            <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>

                                            <Grid size={{ xs: 4 }}><Typography variant="body2" fontWeight={700}>Identity</Typography></Grid>
                                            <Grid size={{ xs: 4 }}><Typography variant="body2" color="text.secondary">High risk of character & cultural drift.</Typography></Grid>
                                            <Grid size={{ xs: 4 }}><Typography variant="body2" fontWeight={700} color="primary.dark">Visual DNA Lock: High-contrast technical anchors ensure 100% continuity.</Typography></Grid>

                                            <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>

                                            <Grid size={{ xs: 4 }}><Typography variant="body2" fontWeight={700}>Context</Typography></Grid>
                                            <Grid size={{ xs: 4 }}><Typography variant="body2" color="text.secondary">Single-turn, forgets previous pages.</Typography></Grid>
                                            <Grid size={{ xs: 4 }}><Typography variant="body2" fontWeight={700} color="primary.dark">Sequential Memory: Maintains state through the SAGA framework.</Typography></Grid>

                                            <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>

                                            <Grid size={{ xs: 4 }}><Typography variant="body2" fontWeight={700}>Pedagogy</Typography></Grid>
                                            <Grid size={{ xs: 4 }}><Typography variant="body2" color="text.secondary">"Write a kids' story" (Unpredictable).</Typography></Grid>
                                            <Grid size={{ xs: 4 }}><Typography variant="body2" fontWeight={700} color="primary.dark">Standardized Rubrics: Strictly follows Reading Level 1-8 constraints.</Typography></Grid>

                                            <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>

                                            <Grid size={{ xs: 4 }}><Typography variant="body2" fontWeight={700}>Speed</Typography></Grid>
                                            <Grid size={{ xs: 4 }}><Typography variant="body2" color="text.secondary">Slow per-frame generation.</Typography></Grid>
                                            <Grid size={{ xs: 4 }}><Typography variant="body2" fontWeight={700} color="primary.dark">Context Caching: Reduces latency by 30-50% via cached cultural data.</Typography></Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>

                    {/* SECTION 2: VISUAL ENGINE */}
                    <Box sx={{ position: 'relative' }}>
                        {/* Timeline Marker */}
                        <Box sx={{
                            position: 'absolute',
                            top: -28,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            bgcolor: '#c2410c',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 900,
                            border: '4px solid white',
                            boxShadow: '0 4px 12px rgba(194, 65, 12, 0.4)',
                            zIndex: 2
                        }}>2</Box>
                        <Paper elevation={0} sx={{
                            p: 6,
                            borderRadius: '40px',
                            border: '1px solid rgba(194, 65, 12, 0.1)',
                            background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
                            boxShadow: '0 8px 32px rgba(194, 65, 12, 0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, #c2410c, #f97316)' }} />

                            {/* CENTERED HEADER */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 6, mt: 2 }}>
                                <Box sx={{
                                    p: 2,
                                    bgcolor: 'rgba(194, 65, 12, 0.1)',
                                    borderRadius: '50%',
                                    mb: 2,
                                }}>
                                    <PaletteIcon sx={{ fontSize: 40, color: '#c2410c' }} />
                                </Box>
                                <Typography variant="h4" fontWeight={900} gutterBottom sx={{ color: '#111' }}>Gemini 3.0 Multimodal SAGA</Typography>
                                <Chip label="Gemini 3.0 (Director) • Imagen 3 (High-Fidelity Renderer)" sx={{ fontWeight: 'bold', bgcolor: '#ffedd5', color: '#c2410c', px: 1 }} />
                            </Box>

                            <Grid container spacing={6}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: '24px', height: '100%', border: '1px solid #ffedd5' }}>
                                        <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#9a3412' }}>
                                            <AutoFixHighIcon fontSize="medium" /> SAGA & Visual DNA
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" paragraph>
                                            **S**tate-**A**ware **G**eneration of **A**ssets ensures that characters remain consistent across the entire story.
                                        </Typography>
                                        <Stack spacing={3}>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={800}>Visual DNA Locking</Typography>
                                                <Typography variant="body2" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                                                    We extract a "Genetic Code" for characters (hair, clothes, size) and inject it into every prompt.
                                                </Typography>
                                                <Typography variant="body2" display="block" color="warning.main" sx={{ fontStyle: 'italic', bgcolor: '#fff7ed', p: 1, borderRadius: '8px', display: 'inline-block', color: '#c2410c' }}>
                                                    Ex: "Ananya [DNA: Blue Silk Top] is always recognized by Imagen 3."
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={800}>Seed Control</Typography>
                                                <Typography variant="body2" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                                                    Locks random seeds to maintain stylistic consistency (Pixar-esque 3D).
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box sx={{ p: 4, bgcolor: '#ffffff', border: '1px solid #eee', borderRadius: '24px', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                        <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#ea580c' }}>
                                            <SecurityIcon fontSize="medium" /> Visual Guardrails
                                        </Typography>
                                        <Stack spacing={3} sx={{ mt: 2 }}>
                                            {[
                                                { title: "Prompt Rewriting Layer", desc: "Sanitizes constraints to ensure age-appropriate imagery.", ex: `Ex: "Scary woods" &rarr; rewritten to "Mysterious, foggy forest".` },
                                                { title: "Vision Audit", desc: "A post-generation check uses Gemini Vision to verify 'Kid-Safety' before display.", ex: `Ex: Rejects images with scary faces or unsafe objects.` },
                                                { title: "Dynamic Crop Control", desc: "Ensures no inappropriate framing or focus.", ex: `Ex: Centers the character's face/action, avoiding awkward crops.` }
                                            ].map((item, i) => (
                                                <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                                                    <CheckCircleIcon fontSize="small" color="success" sx={{ mt: 0.5 }} />
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={800}>{item.title}</Typography>
                                                        <Typography variant="body2" display="block" color="text.secondary" sx={{ mb: 0.5 }}>{item.desc}</Typography>
                                                        <Typography variant="caption" display="block" color="warning.main" sx={{ fontStyle: 'italic', bgcolor: '#fff7ed', p: 0.5, px: 1, borderRadius: '4px', display: 'inline-block', color: '#c2410c' }}>{item.ex}</Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Grid>

                                {/* SAGA VS RAG COMPARISON (FULL WIDTH) */}
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ p: 4, bgcolor: '#fff7ed', border: '1px dashed #fdba74', borderRadius: '24px', mt: 2 }}>
                                        <Typography variant="h6" fontWeight={800} gutterBottom sx={{ color: '#c2410c', textAlign: 'center', mb: 3 }}>
                                            SAGA (Stateful) vs. RAG (Retrieval)
                                        </Typography>

                                        {/* Comparison Table */}
                                        <Grid container spacing={2} sx={{ mb: 4 }}>
                                            <Grid size={{ xs: 3 }}><Typography variant="subtitle2" fontWeight={900} color="text.secondary">Feature</Typography></Grid>
                                            <Grid size={{ xs: 4 }}><Typography variant="subtitle2" fontWeight={900} color="text.secondary">RAG (Retrieval-Augmented)</Typography></Grid>
                                            <Grid size={{ xs: 5 }}><Typography variant="subtitle2" fontWeight={900} color="warning.main">SAGA (Sequential Agentic)</Typography></Grid>

                                            <Grid size={{ xs: 12 }}><Divider sx={{ my: 1, borderColor: 'rgba(194, 65, 12, 0.2)' }} /></Grid>

                                            <Grid size={{ xs: 3 }}><Typography variant="body2" fontWeight={700}>Goal</Typography></Grid>
                                            <Grid size={{ xs: 4 }}><Typography variant="body2" color="text.secondary">Grounding a single response in external facts.</Typography></Grid>
                                            <Grid size={{ xs: 5 }}><Typography variant="body2" fontWeight={700} color="warning.dark">Maintaining Stateful Continuity across a sequence.</Typography></Grid>

                                            <Grid size={{ xs: 12 }}><Divider sx={{ my: 1, borderColor: 'rgba(194, 65, 12, 0.2)' }} /></Grid>

                                            <Grid size={{ xs: 3 }}><Typography variant="body2" fontWeight={700}>Data Handling</Typography></Grid>
                                            <Grid size={{ xs: 4 }}><Typography variant="body2" color="text.secondary">Retrieves static documents from Vector DB.</Typography></Grid>
                                            <Grid size={{ xs: 5 }}><Typography variant="body2" fontWeight={700} color="warning.dark">Extracts & passes Visual DNA + Narrative State.</Typography></Grid>

                                            <Grid size={{ xs: 12 }}><Divider sx={{ my: 1, borderColor: 'rgba(194, 65, 12, 0.2)' }} /></Grid>

                                            <Grid size={{ xs: 3 }}><Typography variant="body2" fontWeight={700}>Context</Typography></Grid>
                                            <Grid size={{ xs: 4 }}><Typography variant="body2" color="text.secondary">"Look up this fact to answer."</Typography></Grid>
                                            <Grid size={{ xs: 5 }}><Typography variant="body2" fontWeight={700} color="warning.dark">"Remember how the character looked in the last frame."</Typography></Grid>
                                        </Grid>

                                        {/* Advantages List */}
                                        <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ color: '#c2410c' }}>
                                            Why SAGA for GrowNative?
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {[
                                                { title: "Elimination of 'Visual Drift'", desc: "Unlike RAG, SAGA extracts a specific Physical ID (Visual DNA) from the first frame and locks it as an immutable constraint." },
                                                { title: "Narrative Staging", desc: "SAGA uses a Shot Plan. If Kayal is on the left in Page 1, the 'Director Agent' knows where she should be in Page 2." },
                                                { title: "Multimodal QA", desc: "Integrates a Vision Audit loop. It doesn't just generate; it 'sees' the output and compares it to the Visual DNA." },
                                                { title: "Lower Latency via Caching", desc: "Combines SAGA with Context Caching to store 'Rules of the World', making sequential generation 30-50% faster." }
                                            ].map((item, i) => (
                                                <Grid size={{ xs: 12, md: 6 }} key={i}>
                                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                        <CheckCircleIcon fontSize="small" color="warning" sx={{ mt: 0.5 }} />
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight={800} color="#9a3412">{item.title}</Typography>
                                                            <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>

                    {/* SECTION 3: AUDIO & INTERACTION */}
                    <Box sx={{ position: 'relative' }}>
                        {/* Timeline Marker */}
                        <Box sx={{
                            position: 'absolute',
                            top: -28,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            bgcolor: '#a16207',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 900,
                            border: '4px solid white',
                            boxShadow: '0 4px 12px rgba(161, 98, 7, 0.4)',
                            zIndex: 2
                        }}>3</Box>
                        <Paper elevation={0} sx={{
                            p: 6,
                            borderRadius: '40px',
                            border: '1px solid rgba(161, 98, 7, 0.1)',
                            background: 'linear-gradient(135deg, #ffffff 0%, #fefce8 100%)',
                            boxShadow: '0 8px 32px rgba(161, 98, 7, 0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, #a16207, #ca8a04)' }} />
                            <Grid container spacing={6} alignItems="center">
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mt: 2 }}>
                                        <Box sx={{
                                            p: 2,
                                            bgcolor: 'rgba(161, 98, 7, 0.1)',
                                            borderRadius: '50%',
                                            mb: 2,
                                        }}>
                                            <RecordVoiceOverIcon sx={{ fontSize: 40, color: '#a16207' }} />
                                        </Box>
                                        <Typography variant="h4" fontWeight={900} gutterBottom sx={{ color: '#111' }}>Gemini 3.0 Audio Orchestration</Typography>
                                        <Chip label="Gemini 3.0 (Scripting) • Gemini 2.0 Flash (Speech)" sx={{ fontWeight: 'bold', bgcolor: '#fef3c7', color: '#854d0e', px: 1 }} />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '24px', border: '1px solid #fef3c7' }}>
                                        <Typography variant="subtitle1" fontWeight={800} color="text.secondary" gutterBottom>RESPONSIBILITY</Typography>
                                        <Typography variant="body1" paragraph>
                                            Hybrid Audio Engine uses **Gemini 2.0 Flash** for lifelike sequencing or falls back to Browser TTS with AI-directed prosody.
                                        </Typography>

                                        <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 3, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, color: '#854d0e' }}>
                                            <SecurityIcon fontSize="medium" /> UX GUARDRAILS
                                        </Typography>
                                        <Stack spacing={3}>
                                            {[
                                                { title: "Sentence Pacing Engine", desc: "Custom regex logic splits text and inserts 600ms pauses for comprehension.", ex: `Ex: "The cat sat... [pause] ...she looked up."` },
                                                { title: "Rate/Pitch Modulation", desc: "Adjusts browser TTS to sound friendly and less robotic.", ex: `Ex: Pitch lowered 10% to sound warmer.` },
                                                { title: "Accessibility Coloring", desc: "Confetti and text use strictly enforced 'Brand Colors'.", ex: `Ex: Yellow text gets a black shadow for white backgrounds.` }
                                            ].map((item, i) => (
                                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <CheckCircleIcon fontSize="small" color="success" />
                                                    <Box>
                                                        <Typography variant="body1" fontWeight={800}>{item.title}</Typography>
                                                        <Typography variant="body2" display="block" color="text.secondary">{item.desc}</Typography>
                                                        <Typography variant="caption" display="block" color="secondary.main" sx={{ fontStyle: 'italic', bgcolor: '#fefce8', p: 0.5, px: 1, borderRadius: '4px', display: 'inline-block', mt: 0.5 }}>{item.ex}</Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>

                    {/* SECTION 4: HUMAN LOOP */}
                    <Box sx={{ position: 'relative' }}>
                        {/* Timeline Marker */}
                        <Box sx={{
                            position: 'absolute',
                            top: -28,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            bgcolor: '#212121',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 900,
                            border: '4px solid white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            zIndex: 2
                        }}>4</Box>
                        <Paper elevation={0} sx={{
                            p: 6,
                            borderRadius: '40px',
                            border: '1px solid #eee',
                            background: '#fafafa', // Clean grey
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Grid container spacing={6} alignItems="center">
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mt: 2 }}>
                                        <Box sx={{ p: 2, bgcolor: '#e0e0e0', borderRadius: '50%', mb: 2 }}>
                                            <WarningIcon sx={{ fontSize: 40, color: '#111' }} />
                                        </Box>
                                        <Typography variant="h4" fontWeight={900} gutterBottom sx={{ color: '#111' }}>Human-in-the-Loop (HITL)</Typography>
                                        <Chip label="Human Logic Model (HLM) • Gemini 3.0 Safety Auditor" sx={{ fontWeight: 'bold', bgcolor: '#eee', color: '#111', px: 1 }} />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Typography variant="h6" fontWeight={700} paragraph color="text.primary">
                                        AI is powerful, but not perfect. We implement strict human oversight layers:
                                    </Typography>
                                    <Stack spacing={2}>
                                        {[
                                            { title: "Revision Queue & HLM", desc: "Stories flagged by automated audits are quarantined for Human Review.", ex: `Ex: "High Uncertainty" stories wait for admin approval.` },
                                            { title: "Satisfaction Checklist", desc: "Admins must explicitly verify safety before publishing.", ex: `Ex: "Publish" button disabled until "Kid Safety" checked.` },
                                            { title: "Parent Controls", desc: "Parents can lock views or reset profiles manually.", ex: `Ex: Parent can wipe a specific category instantly.` }
                                        ].map((item, i) => (
                                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                                <CheckCircleIcon fontSize="small" sx={{ color: '#757575', mt: 0.5 }} />
                                                <Box>
                                                    <Typography variant="body1" fontWeight={800}>{item.title}</Typography>
                                                    <Typography variant="body2" display="block" color="text.secondary">{item.desc}</Typography>
                                                    <Typography variant="caption" display="block" color="text.primary" sx={{ fontStyle: 'italic', bgcolor: '#eee', p: 0.5, px: 1, borderRadius: '4px', display: 'inline-block', mt: 0.5 }}>{item.ex}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>

                    {/* SECTION 5: PRIVACY */}
                    <Box sx={{ position: 'relative' }}>
                        {/* Timeline Marker */}
                        <Box sx={{
                            position: 'absolute',
                            top: -28,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            bgcolor: '#1565c0',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 900,
                            border: '4px solid white',
                            boxShadow: '0 4px 12px rgba(21, 101, 192, 0.4)',
                            zIndex: 2
                        }}>
                            <LockIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Paper elevation={0} sx={{
                            p: 6,
                            borderRadius: '40px',
                            border: '2px dashed #90caf9',
                            background: '#f0f9ff', // Very light blue
                            textAlign: 'center'
                        }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4, mt: 2 }}>
                                <Typography variant="h3" fontWeight={900} sx={{ color: '#0d47a1' }}>Privacy & Data Protection</Typography>
                                <Typography variant="h6" color="text.secondary">Local-First Architecture for Zero-PII</Typography>
                            </Box>

                            <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: '1200px', mx: 'auto' }}>
                                {[
                                    { title: "Zero Cloud PII", desc: "User profiles & data live 100% in your browser's LocalStorage.", ex: `Ex: We have no user database. Data stays on your device.` },
                                    { title: "Ephemeral AI (Gemini 3.0)", desc: "Conversational states are processed and forgotten instantly.", ex: `Ex: Google forgets the story context immediately after generation.` },
                                    { title: "Parent Sovereignty", desc: "One-click 'Reset Local Data' wipes all traces instantly.", ex: `Ex: 'Reset' button permanently deletes the browser key.` }
                                ].map((item, i) => (
                                    <Grid size={{ xs: 12, md: 4 }} key={i}>
                                        <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '24px', height: '100%', boxShadow: '0 4px 12px rgba(33, 150, 243, 0.1)' }}>
                                            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ color: '#1565c0' }}>{item.title}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block', mb: 2 }}>
                                                {item.desc}
                                            </Typography>
                                            <Typography variant="caption" color="text.primary" sx={{ lineHeight: 1.4, display: 'block', fontStyle: 'italic', fontWeight: 600, bgcolor: '#e3f2fd', p: 1, borderRadius: '8px' }}>
                                                {item.ex}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    </Box>

                    {/* SECTION 6: FAMILY ENGAGEMENT */}
                    <Box sx={{ position: 'relative' }}>
                        {/* Timeline Marker (Checkered Flag) */}
                        <Box sx={{
                            position: 'absolute',
                            top: -28,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            bgcolor: '#10b981', // Emerald/Green for Growth
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 900,
                            border: '4px solid white',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                            zIndex: 2
                        }}>
                            <FlagIcon sx={{ fontSize: 28 }} />
                        </Box>
                        <Paper elevation={0} sx={{
                            p: 6,
                            borderRadius: '40px',
                            border: '1px solid #a7f3d0',
                            background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, #10b981, #34d399)' }} />

                            <Grid container spacing={6} alignItems="center">
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" fontWeight={900} gutterBottom sx={{ color: '#065f46' }}>
                                            The "Family" Win
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary" paragraph>
                                            More than just an app. A bridge for connection.
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic', mb: 3 }}>
                                            "We don't just generate content; we generate conversations."
                                        </Typography>
                                        <Chip label="Engagement • Learning • Bonding" sx={{ fontWeight: 'bold', bgcolor: '#d1fae5', color: '#065f46' }} />
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12, md: 7 }}>
                                    <Stack spacing={3}>
                                        <Box sx={{ p: 3, bgcolor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <Typography variant="subtitle1" fontWeight={800} color="#047857" gutterBottom>
                                                👨‍👩‍👧 Quality Family Time
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Turns passive screen time into active co-reading. Parents and kids explore <b>Cultural Nuances</b> together, sparking questions like <i>"Is that how grandma's house looks?"</i>
                                            </Typography>
                                        </Box>

                                        <Box sx={{ p: 3, bgcolor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <Typography variant="subtitle1" fontWeight={800} color="#047857" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                🧠 "Smart" Parenting Tools <Chip label="Gemini 3.0 Linguistics" size="small" sx={{ bgcolor: '#d1fae5', color: '#047857', fontWeight: 'bold', fontSize: '0.7rem' }} />
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                <b>Word Builder</b> & <b>Grammar References</b> give parents the "Teacher's Key". You don't need to be a linguist to help your child learn native vocabulary.
                                            </Typography>
                                        </Box>

                                        <Box sx={{ p: 3, bgcolor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <Typography variant="subtitle1" fontWeight={800} color="#047857" gutterBottom>
                                                ✨ Emotional Engagement
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                When kids see characters that look like them in environments they recognize, engagement skyrockets. <b>Identity = Retention.</b>
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>




                </Stack >
            </Box >
        </Container >
    );
}

