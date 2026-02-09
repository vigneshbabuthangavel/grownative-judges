"use client";

import * as React from "react";
import { Box, Container, Typography, Button, Stack, Chip } from "@mui/material";
import { BugReport, Nature, AcUnit, Celebration, SportsScore, ArrowForward, Shield, Security } from "@mui/icons-material";

import { AppFooter } from "@/components/AppFooter";
import { StoryCard } from "@/components/StoryCard";
import CreateIcon from "@mui/icons-material/Create";
import { keyframes } from "@mui/system";

// Animations
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.1); opacity: 0.15; }
  100% { transform: scale(1); opacity: 0.1; }
`;

import { getActiveProfile } from "@/lib/profileStorage";

export default function NewHomePage() {
    const [stories, setStories] = React.useState<any[]>([]);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    React.useEffect(() => {
        const profile = getActiveProfile();
        setIsLoggedIn(!!profile);
        const isSuper = window.sessionStorage.getItem("gn_super_admin_ok") === "1";

        let query = "/api/stories";
        if (!isSuper && profile) {
            query += `?language=${profile.primaryLanguage}`;
        }

        fetch(query)
            .then(r => r.json())
            .then(data => setStories(data.slice(0, 3)))
            .catch(console.error);
    }, []);

    return (
        <main className="min-h-screen">
            {/* HERO / VISION SECTION */}
            <Box
                sx={{
                    bgcolor: "transparent",
                    color: "primary.contrastText",
                    minHeight: "80vh",
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden",
                    pb: 10
                }}
            >
                <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
                    <Stack spacing={4} maxWidth="md">
                        <Chip
                            label="For Little Learners"
                            sx={{
                                bgcolor: "rgba(255,255,255,0.15)",
                                color: "#fff",
                                width: "fit-content",
                                fontWeight: 700,
                                backdropFilter: "blur(4px)"
                            }}
                        />
                        <Typography variant="h1" fontWeight={900} sx={{
                            fontSize: { xs: "3rem", md: "5rem" },
                            lineHeight: 1.1,
                            letterSpacing: "-0.02em"
                        }}>
                            Stories That Grow With Your Child
                        </Typography>
                        <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: "600px", lineHeight: 1.6, fontWeight: 500 }}>
                            Experience the magic of <strong>parent-guided</strong> storytelling to create culturally authentic, personalized adventures designed to nurture native language fluency from the very first word.
                        </Typography>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} pt={2}>
                            <Button
                                variant="contained"
                                color="secondary"
                                href="/"
                                size="large"
                                endIcon={<ArrowForward />}
                                sx={{
                                    py: 1.5,
                                    px: 4,
                                    fontSize: "1.2rem",
                                    borderRadius: 0,
                                    border: "2px solid black",
                                    boxShadow: "4px 4px 0px black"
                                }}
                            >
                                Start Reading
                            </Button>
                            <Button
                                variant="outlined"
                                href="/implementation"
                                sx={{
                                    py: 1.5,
                                    px: 4,
                                    fontSize: "1.2rem",
                                    borderRadius: 0,
                                    color: "white",
                                    borderColor: "white",
                                    borderWidth: "2px",
                                    "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" }
                                }}
                            >
                                How It Works & Implementation
                            </Button>
                        </Stack>
                    </Stack>

                    {/* TOP RIGHT LOGIN */}
                    {!isLoggedIn && (
                        <Box sx={{ position: "absolute", top: 0, right: 0, zIndex: 10, display: { xs: "none", md: "block" } }}>
                            <Button
                                href="/"
                                variant="outlined"
                                sx={{
                                    color: "white",
                                    borderColor: "rgba(255,255,255,0.5)",
                                    borderRadius: 99,
                                    px: 3,
                                    py: 1,
                                    fontWeight: "bold",
                                    "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" }
                                }}
                            >
                                Log In
                            </Button>
                        </Box>
                    )}

                </Container>
            </Box>

            {/* FEATURED ADVENTURES - Dynamic Content */}
            <Box sx={{ py: 10, bgcolor: "#fafafa" }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" fontWeight={900} mb={6} textAlign="center">
                        Featured Adventures
                    </Typography>

                    {stories.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stories.map((s) => (
                                <StoryCard key={s.storyId} story={s} />
                            ))}
                        </div>
                    ) : (
                        <Box textAlign="center" py={4} color="text.secondary">
                            <Typography>Loading amazing stories...</Typography>
                        </Box>
                    )}

                    <Box textAlign="center" mt={6}>
                        <Button variant="outlined" size="large" endIcon={<ArrowForward />} sx={{ borderRadius: 0, px: 4, border: '2px solid black', color: 'black' }}>
                            View Library
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* MISSION SECTION - "Eye Candy" */}
            <Box
                sx={{
                    bgcolor: "#fffbeb",
                    color: "#111",
                    py: 16,
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                <Nature
                    sx={{
                        fontSize: "50rem",
                        position: "absolute",
                        left: "-10%",
                        top: "20%",
                        color: "#f59e0b",
                        opacity: 0.05,
                        transform: "rotate(-10deg)"
                    }}
                />

                <Container maxWidth="lg">
                    <Stack direction={{ xs: "column", md: "row" }} spacing={8} alignItems="center">
                        <Box flex={1} sx={{ position: "relative" }}>
                            {/* Visual Placeholder for Mission */}
                            <Box
                                sx={{
                                    width: "100%",
                                    height: "400px",
                                    borderRadius: "32px",
                                    background: "linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 20px 40px -10px rgba(245, 158, 11, 0.3)",
                                    transform: "rotate(-2deg)",
                                    transition: "transform 0.3s ease",
                                    "&:hover": { transform: "rotate(0deg)" }
                                }}
                            >
                                <Nature sx={{ fontSize: "8rem", color: "white", opacity: 0.8 }} />
                            </Box>
                        </Box>

                        <Box flex={1}>
                            <Typography variant="overline" fontWeight={800} color="secondary" letterSpacing={1}>OUR MISSION</Typography>
                            <Typography variant="h2" fontWeight={900} mb={3}>
                                Planting Roots in Native Soil
                            </Typography>
                            <Typography variant="h6" color="text.secondary" mb={4} lineHeight={1.8}>
                                We believe every child deserves to connect with their heritage. Powered by our <strong>Cultural Oracle</strong>, every story is deeply rooted in the traditions of your language.
                            </Typography>

                            <Stack direction="row" spacing={2}>
                                {["Culturally Relevant", "Safe Content", "Level-Based"].map((tag) => (
                                    <Chip key={tag} label={tag} sx={{ bgcolor: "white", fontWeight: 700 }} />
                                ))}
                            </Stack>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            {/* GOAL SECTION - Checkered Flag & Levels */}
            <Box
                sx={{
                    bgcolor: "#fff",
                    py: 16,
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                <Celebration
                    sx={{
                        fontSize: "30rem",
                        position: "absolute",
                        right: "5%",
                        top: "-5%",
                        color: "#ec4899",
                        opacity: 0.05,
                    }}
                />

                <Container maxWidth="lg">
                    <Box textAlign="center" mb={10}>
                        <Typography variant="h2" fontWeight={900} mb={2}>
                            Your Journey of Discovery
                        </Typography>
                        <Typography variant="h6" color="text.secondary" maxWidth="md" mx="auto">
                            Master new words, complete stories, and unlock new levels. Explore and learn at your own pace.
                        </Typography>
                    </Box>

                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={4}
                        justifyContent="center"
                        alignItems="center"
                    >
                        {/* Step 1 */}
                        <Box
                            sx={{
                                p: 4,
                                borderRadius: 8,
                                bgcolor: "#fafafa",
                                border: "2px dashed #e5e7eb",
                                textAlign: "center",
                                width: "100%",
                                maxWidth: "300px"
                            }}
                        >
                            <Typography variant="h1" fontWeight={900} color="grey.300">1</Typography>
                            <Typography variant="h6" fontWeight={800} mt={1}>Read Stories</Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}>Dive into magical worlds generated just for you.</Typography>
                        </Box>

                        <ArrowForward sx={{ color: "grey.300", display: { xs: "none", md: "block" } }} />

                        {/* Step 2 */}
                        <Box
                            sx={{
                                p: 4,
                                borderRadius: 8,
                                bgcolor: "#fff1f2",
                                border: "2px solid #ec4899",
                                textAlign: "center",
                                width: "100%",
                                maxWidth: "300px",
                                transform: "scale(1.1)",
                                boxShadow: "0 20px 40px -10px rgba(236, 72, 153, 0.2)"
                            }}
                        >
                            <Typography variant="h1" fontWeight={900} color="secondary.main">2</Typography>
                            <Typography variant="h6" fontWeight={800} mt={1} color="secondary.main">Gain Knowledge</Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}>Learn new vocabulary and sentence structures.</Typography>
                        </Box>

                        <ArrowForward sx={{ color: "grey.300", display: { xs: "none", md: "block" } }} />

                        {/* Step 3 */}
                        <Box
                            sx={{
                                p: 4,
                                borderRadius: 8,
                                bgcolor: "#111",
                                color: "#fff",
                                textAlign: "center",
                                width: "100%",
                                maxWidth: "300px",
                                position: "relative",
                                overflow: "hidden"
                            }}
                        >
                            <SportsScore sx={{ fontSize: "6rem", mb: 2, color: "#fff" }} />
                            <Typography variant="h6" fontWeight={800} mt={1}>Level Up!</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.7 }} mt={1}>Unlock harder challenges as your potential grows.</Typography>

                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: "10px",
                                    backgroundImage: "linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)",
                                    backgroundSize: "20px 20px",
                                    backgroundPosition: "0 0, 10px 10px",
                                    opacity: 0.2
                                }}
                            />
                        </Box>
                    </Stack>
                </Container>
            </Box>

            {/* UNLOCK CREATIVITY - Writing Section */}
            <Box sx={{ py: 12, bgcolor: "#f3e8ff", color: "#111", position: "relative", overflow: "hidden" }}>
                <Container maxWidth="lg">
                    <Stack direction={{ xs: "column", md: "row" }} spacing={8} alignItems="center">
                        <Box flex={1}>
                            <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={1}>NEXT STEPS</Typography>
                            <Typography variant="h2" fontWeight={900} mb={3}>
                                Unlock Your Creativity
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.8, lineHeight: 1.8 }} mb={4}>
                                Ready to create? Visit the <strong>Content Factory</strong> to generate unique, personalized adventures for your child with help from our <strong>AI Sensei</strong>.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={<CreateIcon />}
                                sx={{ borderRadius: 99, px: 4, py: 1.5, fontSize: "1.1rem" }}
                            >
                                Open Content Factory
                            </Button>
                        </Box>

                        <Box flex={1} display="flex" justifyContent="center">
                            <Box sx={{
                                position: "relative",
                                width: "300px",
                                height: "200px",
                                bgcolor: "white",
                                borderRadius: 8,
                                boxShadow: "0 20px 40px rgba(147, 51, 234, 0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transform: "rotate(3deg)"
                            }}>
                                <Stack alignItems="center" spacing={1}>
                                    <CreateIcon sx={{ fontSize: 60, color: "#9333ea" }} />
                                    <Typography fontWeight={800} color="primary">Content Factory</Typography>
                                    <Chip label="For Parents" size="small" sx={{ bgcolor: "#f3e8ff", color: "#9333ea", fontWeight: 700 }} />
                                </Stack>
                            </Box>
                        </Box>
                    </Stack>
                </Container>
            </Box >

            {/* PRIVACY SECTION - For Parents */}
            <Box sx={{ py: 10, bgcolor: "#1e293b", color: "white" }}>
                <Container maxWidth="lg">
                    <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="center">
                        <Box flex={1}>
                            <Typography variant="overline" color="secondary.light" fontWeight={700} letterSpacing={2}>FOR PARENTS</Typography>
                            <Typography variant="h3" fontWeight={900} mt={1} mb={3}>
                                Privacy & Ownership First
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.8, lineHeight: 1.8 }}>
                                We designed GrowNative with your family's privacy as the core foundation.
                                <strong>Built on a Local-First Architecture</strong>, we do not track your child. All data belongs to you.
                            </Typography>
                        </Box>
                        <Box sx={{ p: 4, bgcolor: "rgba(255,255,255,0.05)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Shield sx={{ fontSize: 40, color: "#4ade80" }} />
                                <Box>
                                    <Typography fontWeight={800}>Data Ownership</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>You control your data. Export or delete anytime.</Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={2} alignItems="center" mt={3}>
                                <Security sx={{ fontSize: 40, color: "#4ade80" }} />
                                <Box>
                                    <Typography fontWeight={800}>No Tracking</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>We never sell or monetise your child's attention.</Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Stack>
                </Container>
            </Box >

            <AppFooter />
        </main >
    );
}
