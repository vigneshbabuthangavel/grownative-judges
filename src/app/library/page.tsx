"use client";

import { Container, Typography, Box, Grid, CircularProgress, Chip, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import * as React from "react";
import { AppFooter } from "@/components/AppFooter";
import { StoryCard } from "@/components/StoryCard";
import { topicsFromStories } from "@/lib/stubData";
import { getActiveProfile } from "@/lib/profileStorage";

// Must match SuperAdminGate
const SUPER_SESSION_KEY = "gn_super_admin_ok";

export default function LibraryPage() {
    const [stories, setStories] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [language, setLanguage] = React.useState("all");
    const [topic, setTopic] = React.useState("all");

    // Auth State
    const [isSuperAdmin, setIsSuperAdmin] = React.useState(false);
    const [userLang, setUserLang] = React.useState<string | null>(null);

    React.useEffect(() => {
        // 1. Check Auth & Profile
        const superOk = window.sessionStorage.getItem(SUPER_SESSION_KEY) === "1";
        setIsSuperAdmin(superOk);

        const profile = getActiveProfile();
        let targetLang = "all";

        if (!superOk && profile) {
            // Enforce Profile Language
            targetLang = profile.primaryLanguage;
            setUserLang(targetLang);
            setLanguage(targetLang);
        } else {
            // Super Admin or Guest -> Allow All
            setUserLang(null);
        }

        // 2. Fetch with Filter
        const query = targetLang !== "all" ? `?summary=true&language=${targetLang}` : `?summary=true`;

        fetch('/api/stories' + query)
            .then(r => r.json())
            .then(data => {
                setStories(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filtered = stories
        .filter(s => !s.community?.isRevisionRequired) // Hide flagged stories by default
        .filter(s => (language === "all" ? true : s.language === language))
        .filter(s => (topic === "all" ? true : s.theme === topic));

    return (
        <main className="min-h-screen">
            <Container maxWidth="lg" className="py-10">

                <Box className="mt-6 rounded-3xl bg-white shadow-soft p-8 border border-black/10">
                    <Typography variant="h3" fontWeight={950}>Community Library</Typography>
                    <Typography className="mt-2" color="text.secondary">
                        The heartbeat of our storytelling community.
                        {userLang ? ` Showing stories in your language (${userLang}).` : " Explore stories created by students like you."}
                    </Typography>

                    <Grid container spacing={2} className="mt-4">
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Language</InputLabel>
                                <Select
                                    value={language}
                                    label="Language"
                                    onChange={(e) => setLanguage(e.target.value)}
                                    // Disable selection if enforced by profile (and not super admin)
                                    disabled={!!userLang}
                                >
                                    <MenuItem value="all">All Languages</MenuItem>
                                    <MenuItem value="ta">Tamil</MenuItem>
                                    <MenuItem value="hi">Hindi</MenuItem>
                                    <MenuItem value="en">English</MenuItem>
                                    <MenuItem value="ja">Japanese</MenuItem>
                                    <MenuItem value="zh">Chinese</MenuItem>
                                    <MenuItem value="es">Spanish</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Topic</InputLabel>
                                <Select
                                    value={topic}
                                    label="Topic"
                                    onChange={(e) => setTopic(e.target.value)}
                                >
                                    <MenuItem value="all">All Topics</MenuItem>
                                    {topicsFromStories.map(t => (
                                        <MenuItem key={t} value={t}>{t}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box className="mt-8">
                        {filtered.length === 0 ? (
                            <Typography textAlign="center" color="text.secondary" className="py-10">
                                No stories found for these filters. Be the first to publish one!
                            </Typography>
                        ) : (
                            <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filtered.map((s) => (
                                    <StoryCard key={s.storyId} story={s} />
                                ))}
                            </Box>
                        )}
                    </Box>
                )}

                <AppFooter />
            </Container>
        </main>
    );
}
