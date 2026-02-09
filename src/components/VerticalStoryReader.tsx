import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Container,
    Box,
    Typography,
    IconButton,
    Button,
    Chip,
    Paper,
    Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import VerifiedIcon from "@mui/icons-material/Verified";
import WarningIcon from "@mui/icons-material/Warning";
import { type StoryPack } from "@/lib/types";
import { canSpeak, speak, stopSpeaking } from "@/lib/tts";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";

function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, words: string[]) {
    let out = text;
    for (const w of words) {
        if (!w.trim()) continue;
        const r = new RegExp(escapeRegExp(w), "u");
        out = out.replace(r, `<mark class="bg-kidYellow-100 px-1 rounded">${w}</mark>`);
    }
    return out;
}

export function VerticalStoryReader({ story }: { story: StoryPack }) {
    const ttsLang = story.language === "ta" ? "ta-IN" : story.language === "hi" ? "hi-IN" : "en-US";

    // Helper to determine accurate image source
    const getSmartImageSrc = (path?: string, data?: string) => {
        if (path && path.length < 500) return `${path}?cb=${Date.now()}`;
        if (path && path.length >= 500) {
            if (path.startsWith('data:')) return path;
            return `data:image/jpeg;base64,${path}`;
        }
        if (data) {
            if (data.length < 500 && (data.startsWith('/') || data.startsWith('http'))) return data;
            if (data.startsWith('data:')) return data;
            return `data:image/jpeg;base64,${data}`;
        }
        return "";
    };

    return (
        <main className="min-h-screen bg-neutral-100">
            <Container maxWidth="sm" className="py-4 px-0 md:px-4">
                {/* Sticky Header for Mobile Feel */}
                <Box className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5 p-3 flex items-center justify-between rounded-b-2xl shadow-sm">
                    <Button component={Link as any} href="/" startIcon={<ArrowBackIcon />} size="small" className="text-black font-bold">
                        Library
                    </Button>
                    <Chip label={`Level ${story.level}`} size="small" className="bg-kidPurple-50 font-bold" />
                    <Box>
                        <IconButton onClick={() => stopSpeaking()} size="small" title="Stop Audio">
                            <StopCircleIcon />
                        </IconButton>
                    </Box>
                </Box>

                <Box className="mt-4 px-4 text-center">
                    <Typography variant="h4" fontWeight={900} className="mb-2">{story.title_native}</Typography>
                    <Typography variant="subtitle1" className="text-neutral-500 mb-6">{story.title_transliteration || story.title_english}</Typography>
                </Box>

                <div className="space-y-6 pb-20">
                    {story.pages.map((p, idx) => {
                        const pageWords = p.targetWordIds.map((id) => story.targetWords.find((x) => x.id === id)?.native || "").filter(Boolean);
                        const highlighted = highlightText(p.text_native, pageWords);

                        return (
                            <Paper key={p.pageNumber} elevation={0} className="overflow-hidden bg-white shadow-sm border border-neutral-200 mx-2 rounded-2xl">
                                {/* Full Width Image */}
                                <div className="relative w-full aspect-[4/3] bg-neutral-100">
                                    <Image
                                        src={getSmartImageSrc(p.imagePath, (p as any).image?.data) || (p.imageSvgPath || "")}
                                        alt={p.imageAlt_descriptive || p.imageAlt || ""}
                                        fill
                                        sizes="(max-width: 600px) 100vw, 600px"
                                        className="object-cover"
                                        priority={idx < 2}
                                    />
                                </div>

                                {/* Text Below */}
                                <div className="p-6">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <Typography variant="h6" fontWeight={800} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: highlighted }} />
                                            {p.text_transliteration && <Typography variant="body2" className="text-neutral-500 mt-1">{p.text_transliteration}</Typography>}
                                            <Typography variant="body2" className="text-neutral-400 mt-1 italic">{p.text_english}</Typography>
                                        </div>
                                        <IconButton
                                            onClick={() => speak(p.text_native, ttsLang)}
                                            className="bg-kidYellow-50 shrink-0"
                                        >
                                            <VolumeUpIcon fontSize="small" />
                                        </IconButton>
                                    </div>
                                </div>
                            </Paper>
                        )
                    })}
                </div>

                {/* Footer actions */}
                <Box className="px-4 pb-10 text-center">
                    <Typography variant="h5" fontWeight={900}>The End</Typography>
                    <Button variant="contained" size="large" className="mt-4 rounded-full bg-black text-white px-8" component={Link as any} href="/">
                        Finish Story
                    </Button>
                </Box>

            </Container>
        </main>
    );
}
