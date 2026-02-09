"use client";

import React from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails, Paper, Chip, Grid } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PsychologyIcon from '@mui/icons-material/Psychology';

import { AppFooter } from '@/components/AppFooter';

const RUBRIC_LEVELS = [
    {
        level: 1,
        title: "Emergent",
        color: "bg-green-50",
        borderColor: "border-green-200",
        details: {
            Syntax: "Simple SV or SVO sentences. Present tense only.",
            Vocabulary: "High-frequency sight words (dolch list). Concrete nouns (family, animals).",
            Length: "3-5 words per sentence.",
            Constraint: "No compound sentences. Direct correspondence to illustration."
        }
    },
    {
        level: 2,
        title: "Beginner",
        color: "bg-blue-50",
        borderColor: "border-blue-200",
        details: {
            Syntax: "Compound sentences using 'and', 'but'. Present continuous tense.",
            Vocabulary: "Routine actions, basic emotions (happy, sad).",
            Length: "6-8 words per sentence.",
            Constraint: "Avoid passive voice. Linear time order only."
        }
    },
    {
        level: 3,
        title: "Developing",
        color: "bg-purple-50",
        borderColor: "border-purple-200",
        details: {
            Syntax: "Complex sentences with 'because', 'when', 'if'. Introduction of simple past tense.",
            Vocabulary: "Abstract concepts (courage, friendship, honesty). Descriptive adjectives.",
            Length: "8-10 words per sentence.",
            Constraint: "Dialogue tags ('he said', 'she asked') permitted."
        }
    },
    {
        level: 4,
        title: "Expanding",
        color: "bg-orange-50",
        borderColor: "border-orange-200",
        details: {
            Syntax: "Compound-complex sentences. Future tense ('will', 'going to').",
            Vocabulary: "Context-specific vocabulary (e.g., habitat, recycle). Adverbs of manner.",
            Length: "10-12 words per sentence.",
            Constraint: "Paragraphs can span 2-3 sentences. Topic sentence required."
        }
    },
    {
        level: 5,
        title: "Bridging",
        color: "bg-red-50",
        borderColor: "border-red-200",
        details: {
            Syntax: "Past continuous and perfect tenses. Relative clauses ('who', 'which').",
            Vocabulary: "Idiomatic expressions (simple). Synonyms for common words.",
            Length: "12-15 words per sentence.",
            Constraint: "Inference required. Text may carry meaning not explicitly shown in image."
        }
    },
    {
        level: 6,
        title: "Fluent",
        color: "bg-teal-50",
        borderColor: "border-teal-200",
        details: {
            Syntax: "Passive voice. Conditionals (Type 1 & 2). Varied sentence beginnings.",
            Vocabulary: "Academic vocabulary. Multiple-meaning words.",
            Length: "15-18 words per sentence.",
            Constraint: "Flashbacks or non-linear narrative elements allowed."
        }
    },
    {
        level: 7,
        title: "Proficient",
        color: "bg-indigo-50",
        borderColor: "border-indigo-200",
        details: {
            Syntax: "Complex conditionals. Subjunctive mood. Stylistic devices (alliteration).",
            Vocabulary: "Nuanced emotional vocabulary. Domain-specific terms.",
            Length: "18-20+ words per sentence.",
            Constraint: "Focus on character internal monologue and motivation."
        }
    },
    {
        level: 8,
        title: "Mastery",
        color: "bg-gray-50",
        borderColor: "border-gray-200",
        details: {
            Syntax: "Full range of tenses and structures. Rhetorical questions.",
            Vocabulary: "Literary and archaic terms if stylistically appropriate. Metaphors.",
            Length: "Varied length for pacing.",
            Constraint: "Cultural subtext and proverbs utilized heavily."
        }
    }
];

export default function RubricPage() {
    return (
        <main className="min-h-screen">
            <Container maxWidth="lg" className="py-8">


                <Box className="mt-12 mb-10 text-center max-w-2xl mx-auto">
                    <Typography variant="overline" fontWeight={800} color="primary" className="tracking-widest">
                        FOR PARENTS & EDUCATORS
                    </Typography>
                    <Typography variant="h2" fontWeight={900} className="mb-4 mt-2 leading-tight">
                        Pedagogical Framework
                    </Typography>
                    <Typography variant="h6" color="text.secondary" className="font-normal text-slate-600">
                        Understanding how GrowNative structures language acquisition from Emergent to Mastery levels.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Paper className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 sticky top-8">
                            <Typography variant="h6" fontWeight={800} className="mb-4 flex items-center gap-2">
                                <PsychologyIcon color="secondary" />
                                Why levels matter?
                            </Typography>
                            <Typography variant="body2" className="text-slate-600 mb-4 leading-relaxed">
                                Our 8-level rubric is designed to scaffold language learning. We match sentence complexity, vocabulary density, and narrative structure to your child's developmental stage.
                            </Typography>
                            <Typography variant="body2" className="text-slate-600 mb-6 leading-relaxed">
                                As children progress, they move from concrete, image-supported texts to abstract, complex narratives that require inference and critical thinking.
                            </Typography>

                            <Box className="p-4 bg-white rounded-2xl border border-slate-100">
                                <Typography variant="caption" fontWeight={700} color="text.secondary" className="uppercase tracking-wider">
                                    Key Metrics
                                </Typography>
                                <Box className="mt-2 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Syntax Complexity</span>
                                        <span className="font-bold text-slate-800">Low &rarr; High</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Vocab Range</span>
                                        <span className="font-bold text-slate-800">Sight &rarr; Academic</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Narrative Depth</span>
                                        <span className="font-bold text-slate-800">Linear &rarr; Abstract</span>
                                    </div>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Box className="space-y-4">
                            {RUBRIC_LEVELS.map((level) => (
                                <Accordion
                                    key={level.level}
                                    defaultExpanded={level.level === 1}
                                    className={`rounded-3xl border ${level.borderColor} shadow-none overflow-hidden before:hidden`}
                                    sx={{ '&:first-of-type': { borderTopLeftRadius: '24px', borderTopRightRadius: '24px' } }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} className={level.color}>
                                        <Box className="flex items-center gap-4 w-full">
                                            <Paper className="w-10 h-10 flex items-center justify-center rounded-xl bg-white font-black text-slate-800 shadow-sm border border-black/5">
                                                {level.level}
                                            </Paper>
                                            <Typography variant="h6" fontWeight={800}>
                                                {level.title}
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails className="p-6 bg-white">
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Box className="mb-4">
                                                    <Typography variant="caption" fontWeight={800} color="text.secondary" className="uppercase">
                                                        Syntax & Grammar
                                                    </Typography>
                                                    <Typography variant="body2" className="mt-1 font-medium text-slate-700">
                                                        {level.details.Syntax}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" fontWeight={800} color="text.secondary" className="uppercase">
                                                        Vocabulary
                                                    </Typography>
                                                    <Typography variant="body2" className="mt-1 font-medium text-slate-700">
                                                        {level.details.Vocabulary}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Box className="mb-4">
                                                    <Typography variant="caption" fontWeight={800} color="text.secondary" className="uppercase">
                                                        Target Length
                                                    </Typography>
                                                    <Typography variant="body2" className="mt-1 font-medium text-slate-700">
                                                        {level.details.Length}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" fontWeight={800} color="error" className="uppercase">
                                                        Constraints
                                                    </Typography>
                                                    <Typography variant="body2" className="mt-1 font-medium text-slate-700 italic border-l-2 border-red-100 pl-3">
                                                        {level.details.Constraint}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    </Grid>
                </Grid>

                <AppFooter />
            </Container>
        </main>
    );
}
