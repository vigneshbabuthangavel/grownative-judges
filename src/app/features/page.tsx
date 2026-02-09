"use client";

import React from "react";
import { Box, Container, Typography, Stack, Chip, Grid, Paper } from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import TranslateIcon from "@mui/icons-material/Translate";
import PsychologyIcon from "@mui/icons-material/Psychology";
import LockIcon from "@mui/icons-material/Lock";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import SchoolIcon from "@mui/icons-material/School";
import { AppFooter } from "@/components/AppFooter";
import { AutoAwesome, MenuBook, Security, Shield } from "@mui/icons-material";

export default function FeaturesPage() {
    return (
        <main className="min-h-screen font-sans">
            {/* HERO SECTION */}
            <Box
                sx={{
                    bgcolor: "transparent",
                    color: "primary.contrastText",
                    minHeight: "60vh",
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden",
                    pb: 10
                }}
            >
                <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
                    <Stack spacing={4} maxWidth="md" mx="auto" textAlign="center" alignItems="center">
                        <Chip
                            label="Hackathon 2026"
                            sx={{
                                bgcolor: "rgba(255,255,255,0.15)",
                                color: "#fff",
                                width: "fit-content",
                                fontWeight: 700,
                                backdropFilter: "blur(4px)"
                            }}
                        />
                        <Typography variant="h1" fontWeight={900} sx={{
                            fontSize: { xs: "2.5rem", md: "4.5rem" },
                            lineHeight: 1.1,
                            letterSpacing: "-0.02em",
                            color: "white"
                        }}>
                            Platform Capabilities
                        </Typography>
                        <Typography variant="h5" sx={{ color: "rgba(255,255,255,0.9)", opacity: 0.9, maxWidth: "700px", lineHeight: 1.6, fontWeight: 500 }}>
                            A deep dive into the <strong>Generative Engine</strong>, <strong>Educational Copilots</strong>, and <strong>Privacy-First Architecture</strong> that power GrowNative.
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            {/* GENERATIVE ENGINE SECTION */}
            <Box
                sx={{
                    bgcolor: "#fffbeb",
                    color: "#111",
                    py: 16,
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                {/* Decorative Background Element */}
                <AutoAwesome
                    sx={{
                        fontSize: "40rem",
                        position: "absolute",
                        left: "-10%",
                        top: "10%",
                        color: "#f59e0b",
                        opacity: 0.05,
                        transform: "rotate(-10deg)"
                    }}
                />

                <Container maxWidth="lg">
                    <Stack direction={{ xs: "column", md: "row" }} spacing={8} alignItems="center">
                        <Box flex={1} sx={{ position: "relative" }}>
                            {/* Visual Placeholder for Engine */}
                            <Box
                                sx={{
                                    width: "100%",
                                    height: "450px",
                                    borderRadius: "32px",
                                    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 20px 40px -10px rgba(99, 102, 241, 0.4)",
                                    transform: "rotate(-2deg)",
                                    transition: "transform 0.3s ease",
                                    "&:hover": { transform: "rotate(0deg)" },
                                    color: "white",
                                    p: 4,
                                    textAlign: "center"
                                }}
                            >
                                <AutoFixHighIcon sx={{ fontSize: "6rem", mb: 2, color: "white", opacity: 0.9 }} />
                                <Typography variant="h4" fontWeight={800}>The Core Engine</Typography>
                                <Chip label="Gemini Powered" size="small" sx={{ mt: 2, bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700 }} />
                            </Box>
                        </Box>

                        <Box flex={1}>
                            <Typography variant="overline" fontWeight={800} color="primary" letterSpacing={1}>GENERATIVE POWER</Typography>
                            <Typography variant="h2" fontWeight={900} mb={4} className="text-slate-900">
                                Create What They Love
                            </Typography>

                            <Stack spacing={4}>
                                {[
                                    {
                                        title: "Bonding via Co-Creation 🤝",
                                        desc: "Stop forcing boring textbooks. Pick topics your child actually loves (Dinosaurs? Space? Ninja Cats?) and watch them engage.",
                                        color: "bg-indigo-100 text-indigo-700"
                                    },
                                    {
                                        title: "Pixar-Style Locking",
                                        desc: "Strict visual consistency keeps character DNA and art style uniform across all 8 generated scenes.",
                                        color: "bg-purple-100 text-purple-700"
                                    },
                                    {
                                        title: "Beat-Sheet Zoning",
                                        desc: "Narrative logic follows a cinematic beat sheet (Establishing -> Action -> Climax) for coherent storytelling.",
                                        color: "bg-pink-100 text-pink-700"
                                    }
                                ].map((feature, idx) => (
                                    <Box key={idx} display="flex" gap={3}>
                                        <div className={`mt-1 min-w-[4px] w-[4px] rounded-full ${feature.color.split(" ")[0].replace("bg-", "bg-opacity-50 ")} bg-current`}></div>
                                        <Box>
                                            <Typography variant="h6" fontWeight={800} className="text-slate-800">
                                                {feature.title}
                                            </Typography>
                                            <Typography variant="body1" className="text-slate-600 leading-relaxed">
                                                {feature.desc}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            {/* EDUCATIONAL COPILOTS SECTION */}
            <Box sx={{ py: 16, bgcolor: "#f0fdf4", color: "#111" }}>
                <Container maxWidth="lg">
                    <Stack direction={{ xs: "column-reverse", md: "row" }} spacing={8} alignItems="center">
                        <Box flex={1}>
                            <Typography variant="overline" color="success.main" fontWeight={800} letterSpacing={1}>EDUCATIONAL TOOLS</Typography>
                            <Typography variant="h2" fontWeight={900} mb={4} className="text-slate-900">
                                Smart Learning Copilots
                            </Typography>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                {[
                                    {
                                        icon: <TranslateIcon sx={{ fontSize: 40 }} />,
                                        title: "Multilingual Studio",
                                        desc: "Instant parallel-text generation for Indian languages (Tamil, Hindi) alongside English.",
                                        color: "text-emerald-600 bg-emerald-100"
                                    },
                                    {
                                        icon: <SchoolIcon sx={{ fontSize: 40 }} />,
                                        title: "AI Sensei",
                                        desc: "Context-aware grammar chat that acts as a safe, patient tutor for children.",
                                        color: "text-teal-600 bg-teal-100"
                                    },
                                    {
                                        icon: <MenuBook sx={{ fontSize: 40 }} />,
                                        title: "Reference Portal",
                                        desc: "Interactive vocabulary tables with audio integration for mastering pronunciation.",
                                        color: "text-cyan-600 bg-cyan-100"
                                    }
                                ].map((item, i) => (
                                    <Paper key={i} elevation={0} sx={{ p: 4, borderRadius: 6, border: "1px solid #bbf7d0", bgcolor: "white", height: "100%" }}>
                                        <Stack direction="row" spacing={3} alignItems="flex-start">
                                            <Box className={`p-3 rounded-2xl ${item.color}`}>
                                                {item.icon}
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" fontWeight={800} mb={1}>{item.title}</Typography>
                                                <Typography variant="body2" className="text-slate-500 leading-relaxed text-lg">
                                                    {item.desc}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                ))}
                            </div>
                        </Box>

                        <Box flex={1} display="flex" justifyContent="center">
                            <Box sx={{
                                position: "relative",
                                width: "100%",
                                maxWidth: "500px",
                                height: "600px",
                                bgcolor: "white",
                                borderRadius: "40px",
                                boxShadow: "0 30px 60px -12px rgba(16, 185, 129, 0.2)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                p: 6,
                                border: "1px solid #d1fae5"
                            }}>
                                <PsychologyIcon sx={{ fontSize: "12rem", color: "#10b981", opacity: 0.2, mb: 4 }} />
                                <Typography variant="h4" fontWeight={900} textAlign="center" color="success.main" mb={2}>
                                    "How do I say 'Friend' in Tamil?"
                                </Typography>
                                <Typography variant="h6" textAlign="center" className="text-slate-400">
                                    The AI Sensei is always ready to help.
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            {/* PARENT & ADMIN POWER SECTION */}
            <Box sx={{ py: 16, bgcolor: "#fff", position: "relative" }}>
                <Container maxWidth="lg">
                    <Box textAlign="center" mb={10}>
                        <Typography variant="overline" color="warning.main" fontWeight={800} letterSpacing={1}>ROLES & SECURITY</Typography>
                        <Typography variant="h2" fontWeight={900} mb={2} className="text-slate-900">
                            Empowering Every Role
                        </Typography>
                        <Typography variant="h6" className="text-slate-500 max-w-2xl mx-auto">
                            AI is the tool, but <strong>Humans are in the Loop</strong>. Parents and Admins always have final control over what gets read.
                        </Typography>
                    </Box>

                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={4}
                        justifyContent="center"
                        alignItems="stretch"
                    >
                        {[
                            {
                                role: "For Students",
                                title: "Play Mode",
                                desc: "Distraction-free reading environment focused on engagement and learning.",
                                icon: <FamilyRestroomIcon sx={{ fontSize: 50 }} />,
                                color: "bg-orange-50 text-orange-600 border-orange-200"
                            },
                            {
                                role: "For Parents",
                                title: "Monitor Mode",
                                icon: <SchoolIcon sx={{ fontSize: 50 }} />,
                                color: "bg-blue-50 text-blue-600 border-blue-200"
                            },
                            {
                                role: "For Admins",
                                title: "Creator Mode",
                                desc: "Full access to the Story Factory with 'Vault' protection for credentials.",
                                icon: <AdminPanelSettingsIcon sx={{ fontSize: 50 }} />,
                                color: "bg-purple-50 text-purple-600 border-purple-200"
                            }
                        ].map((card, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    p: 5,
                                    borderRadius: 8,
                                    border: "2px solid",
                                    borderColor: "transparent",
                                    flex: 1,
                                    transition: "all 0.3s ease",
                                    "&:hover": { transform: "translateY(-10px)" }
                                }}
                                className={`${card.color.split(" ")[0]} ${card.color.split(" ")[2]}`}
                            >
                                <Box className={`w-fit p-4 rounded-2xl mb-6 bg-white shadow-sm ${card.color.split(" ")[1]}`}>
                                    {card.icon}
                                </Box>
                                <Typography variant="overline" fontWeight={700} className="opacity-70">{card.role}</Typography>
                                <Typography variant="h4" fontWeight={800} mb={2}>{card.title}</Typography>
                                <Typography variant="body1" className="opacity-80 leading-relaxed font-medium">
                                    {card.desc}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Container>
            </Box>

            {/* PRIVACY SECTION */}
            <Box sx={{ py: 12, bgcolor: "#1e293b", color: "white" }}>
                <Container maxWidth="lg">
                    <Stack direction={{ xs: "column", md: "row" }} spacing={6} alignItems="center">
                        <Box flex={1}>
                            <Typography variant="overline" color="secondary.light" fontWeight={700} letterSpacing={2}>ARCHITECTURAL PRIVACY</Typography>
                            <Typography variant="h3" fontWeight={900} mt={1} mb={3}>
                                Safety Built-In, Not Bolt-On
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.8, lineHeight: 1.8 }}>
                                GrowNative operates on a <strong>Zero-Database</strong> philosophy. We don't store your data because we don't have a database.
                            </Typography>
                        </Box>

                        <Stack spacing={3} flex={1} width="100%">
                            <Box sx={{ p: 4, bgcolor: "rgba(255,255,255,0.05)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }}>
                                <Stack direction="row" spacing={3} alignItems="center">
                                    <Shield sx={{ fontSize: 40, color: "#4ade80" }} />
                                    <Box>
                                        <Typography variant="h6" fontWeight={800}>Local-First Data</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.7 }}>Student profiles and progress live 100% in your browser's LocalStorage.</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                            <Box sx={{ p: 4, bgcolor: "rgba(255,255,255,0.05)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }}>
                                <Stack direction="row" spacing={3} alignItems="center">
                                    <Security sx={{ fontSize: 40, color: "#4ade80" }} />
                                    <Box>
                                        <Typography variant="h6" fontWeight={800}>Anonymous AI</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.7 }}>Only stateless prompts are sent to Gemini. No PII is ever transmitted.</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            <AppFooter />
        </main>
    );
}
