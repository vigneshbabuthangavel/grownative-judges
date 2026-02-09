"use client";

import * as React from "react";
import { Container, Typography, Paper, Box, Grid, Card, CardContent } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import SchoolIcon from "@mui/icons-material/School";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { AppFooter } from "@/components/AppFooter";
import { getActiveProfile } from "@/lib/profileStorage";

const levelInfo = [
    { level: 1, title: "Foundation", focus: "Basic Nouns & Emojis", desc: "Introduction to single words and matching them with imagery." },
    { level: 2, title: "Beginner", focus: "Simple Sentences", desc: "Understanding short SVO patterns and basic greetings." },
    { level: 3, title: "Elementary", focus: "Daily Activities", desc: "Verbs and common objects used in home environments." },
    { level: 4, title: "Intermediate-Low", focus: "Descriptive Language", desc: "Adjectives, colors, and sizes to describe the world." },
    { level: 5, title: "Intermediate", focus: "Emotions & Shared Story", desc: "Expressing feelings and collaborative storytelling elements." },
    { level: 6, title: "Advanced-Low", focus: "Narrative Flow", desc: "Connecting sentences with 'and', 'but', and temporal adverbs." },
    { level: 7, title: "Advanced", focus: "Complex Values", desc: "Themes like kindness, bravery, and community responsibility." },
    { level: 8, title: "Mastery", focus: "Cultural Nuances", desc: "Idioms, proverbs, and complex grammatical structures." },
];

export default function LevelsPage() {
    // HACK: Force refresh or use state for profile to make it reactive
    const [unlockedLevel, setUnlockedLevel] = React.useState(2);

    React.useEffect(() => {
        // Hydrate from storage
        const p = getActiveProfile();
        if (p) {
            // Ensure we respect the "Demo Win" default if it's higher
            setUnlockedLevel(Math.max(2, p.unlockedLevel || 1));
        }
    }, []);

    return (
        <main className="min-h-screen flex flex-col">
            <Container maxWidth="lg" className="py-8 flex-grow">

                <Box className="mt-8 mb-6">
                    <Typography variant="h3" fontWeight={950} className="text-white mb-2">
                        Growth Path
                    </Typography>
                    <Typography variant="h6" className="text-white/80">
                        How children progress through GrowNative levels.
                    </Typography>
                </Box>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {levelInfo.map((l) => {
                        const isLocked = l.level > unlockedLevel;
                        return (
                            <div key={l.level}>
                                <Card className={`rounded-3xl border shadow-soft h-full transition-all ${isLocked ? 'bg-slate-100 border-black/5 opacity-80' : 'bg-white border-black/10 hover:scale-105 hover:shadow-lg'}`}>
                                    <CardContent className="p-6 relative">
                                        {isLocked && (
                                            <Box className="absolute top-4 right-4 text-slate-400">
                                                <LockOutlinedIcon />
                                            </Box>
                                        )}

                                        <Box className={`${isLocked ? 'bg-slate-200' : 'bg-kidYellow-100'} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-black/5`}>
                                            <StarIcon sx={{ color: isLocked ? '#94a3b8' : '#111' }} />
                                        </Box>

                                        <Typography variant="overline" fontWeight={900} color={isLocked ? 'text.disabled' : 'primary'} sx={{ letterSpacing: 1 }}>
                                            Level {l.level} {isLocked ? '(Locked)' : ''}
                                        </Typography>

                                        <Typography variant="h5" fontWeight={950} className={`mb-2 ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                                            {l.title}
                                        </Typography>

                                        <Box className="flex items-center gap-1 mb-3">
                                            <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary', opacity: isLocked ? 0.5 : 1 }} />
                                            <Typography variant="caption" fontWeight={700} color="text.secondary">
                                                {l.focus}
                                            </Typography>
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" className="leading-relaxed">
                                            {l.desc}
                                        </Typography>

                                        {!isLocked && l.level === unlockedLevel && (
                                            <Box className="mt-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold inline-block border border-green-200">
                                                Current Level
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>

                <Box className="mt-8 mb-8 p-6 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm">
                    <Typography variant="h6" fontWeight={800} className="text-white mb-2">
                        How to Unlock Levels?
                    </Typography>
                    <Typography variant="body2" className="text-white/80">
                        Complete Writing Challenges to unlock new levels. For the demo, Level 2 is unlocked by default!
                    </Typography>
                </Box>

            </Container>
            <AppFooter />
        </main>
    );
}
