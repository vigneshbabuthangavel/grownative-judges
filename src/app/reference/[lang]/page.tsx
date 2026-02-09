"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Container, Typography, Paper, Box, Grid, Chip, Button, Divider } from "@mui/material";
import TranslateIcon from "@mui/icons-material/Translate";
import AbcIcon from "@mui/icons-material/Abc";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LaunchIcon from "@mui/icons-material/Launch";

import { AppFooter } from "@/components/AppFooter";
import GrammarGuide from "@/components/GrammarGuide";
import { languageReferences } from "@/lib/referenceData";
import { LanguageCode } from "@/lib/types";

export default function ReferencePage() {
    const params = useParams();
    const lang = params.lang as LanguageCode;
    const data = languageReferences[lang];

    if (!data) {
        return (
            <main className="min-h-screen">
                <Container maxWidth="lg" className="py-8">

                    <Box className="mt-20 text-center">
                        <Typography variant="h5" fontWeight={900}>Language reference not found.</Typography>
                    </Box>
                    <AppFooter />
                </Container>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col">
            <Container maxWidth="xl" className="flex-grow py-12">

                {/* Header Section */}
                <Box className="mb-12 border-b border-black/10 pb-8">
                    <Box className="flex items-center gap-6">
                        <Box className="bg-black text-white p-6 shadow-md">
                            <TranslateIcon sx={{ fontSize: 48 }} />
                        </Box>
                        <Box>
                            <Typography variant="h2" fontWeight={900} className="text-white">{data.name}</Typography>
                            <Typography variant="h5" className="text-slate-200 font-medium">{data.nativeName}</Typography>
                        </Box>
                    </Box>
                </Box>

                <Grid container spacing={8}>
                    {/* Main Content Column: Alphabets & Grammar */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        {/* Unified Section for Language Basics */}
                        <Box className="bg-white border border-black/10 p-12 shadow-sm">

                            {/* Alphabets Subsection */}
                            <Box className="mb-12">
                                <Box className="flex items-center gap-3 mb-6">
                                    <AbcIcon fontSize="large" className="text-black" />
                                    <Typography variant="h4" fontWeight={900}>Alphabets & Script</Typography>
                                </Box>
                                <Typography className="mb-8 text-lg text-slate-700 leading-relaxed max-w-2xl">{data.alphabets.description}</Typography>

                                <Box className="flex flex-wrap gap-3">
                                    {data.alphabets.items.map((char, i) => (
                                        <Box key={i} className="w-16 h-16 flex items-center justify-center border border-black/10 bg-slate-50 hover:bg-black hover:text-white transition-colors cursor-default">
                                            <Typography variant="h5" fontWeight={900}>{char}</Typography>
                                        </Box>
                                    ))}
                                    <Box className="w-16 h-16 flex items-center justify-center border border-black/10 bg-slate-100">
                                        <Typography variant="body1" fontWeight={700} className="text-slate-400">...</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Divider className="my-12" />

                            {/* AI Grammar Guide */}
                            <GrammarGuide languageCode={lang} languageName={data.name} />
                        </Box>
                    </Grid>

                    {/* Sidebar Column: Resources */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box className="bg-black text-white p-10 shadow-lg sticky top-24">
                            <Typography variant="h5" fontWeight={900} className="mb-4">Language Deep Dive</Typography>
                            <Typography className="mb-8 text-slate-300 leading-relaxed">
                                Want to master {data.name}? Explore these authority resources for comprehensive learning.
                            </Typography>

                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                href={data.referralLink.url}
                                target="_blank"
                                className="bg-white text-black py-4 font-black shadow-none hover:bg-slate-200 border-none rounded-none text-lg"
                                endIcon={<LaunchIcon />}
                            >
                                Learn More
                            </Button>

                            <Divider className="my-8" sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

                            <Typography variant="subtitle2" fontWeight={800} className="mb-3 text-slate-400 uppercase tracking-widest">Referral Code</Typography>
                            <Box className="p-6 border border-dashed border-white/30 text-center hover:bg-white/5 transition-colors cursor-copy">
                                <Typography variant="h5" fontWeight={900} className="tracking-widest font-mono">
                                    GN-{data.name.toUpperCase().slice(0, 3)}-2026
                                </Typography>
                                <Typography variant="caption" className="text-slate-400 mt-2 block">Share to unlock exclusive themes</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            <AppFooter />
        </main>
    );
}
