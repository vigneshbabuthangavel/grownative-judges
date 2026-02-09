
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Box,
    Typography,
    IconButton,
    Button,
    LinearProgress,
    Tooltip,
    Paper,
    Slide,
    Fade,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HomeIcon from "@mui/icons-material/Home";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import { type StoryPack } from "@/lib/types";
import { canSpeak, speak, stopSpeaking } from "@/lib/tts";
import { AppHeader } from "@/components/AppHeader"; // Assuming these exist, fitting with the theme
import { markStoryCompleted } from "@/lib/profileStorage"; // Sharing logic

export function FlipStoryReader({ story }: { story: StoryPack }) {
    const [pageIndex, setPageIndex] = React.useState(0);
    const [direction, setDirection] = React.useState<"left" | "right">("right");
    const totalPages = story.pages.length;
    const currentPage = story.pages[pageIndex];

    const ttsLang = React.useMemo(() => {
        switch (story.language) {
            case "ta": return "ta-IN";
            case "hi": return "hi-IN";
            case "te": return "te-IN";
            case "kn": return "kn-IN";
            case "ml": return "ml-IN";
            case "bn": return "bn-IN";
            case "gu": return "gu-IN";
            case "ja": return "ja-JP";
            case "zh": return "zh-CN";
            case "es": return "es-ES";
            case "fr": return "fr-FR";
            case "de": return "de-DE";
            case "ru": return "ru-RU";
            case "pt": return "pt-BR";
            default: return "en-US";
        }
    }, [story.language]);

    const handleNext = () => {
        if (pageIndex < totalPages - 1) {
            setDirection("right");
            setPageIndex((prev) => prev + 1);
            stopSpeaking();
        } else {
            // Mark complete on last page interaction? Or via button?
            markStoryCompleted(story.storyId);
        }
    };

    const handlePrev = () => {
        if (pageIndex > 0) {
            setDirection("left");
            setPageIndex((prev) => prev - 1);
            stopSpeaking();
        }
    };

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [pageIndex]);

    const progress = ((pageIndex + 1) / totalPages) * 100;

    return (
        <main className="min-h-screen bg-[#111] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Top Bar */}
            <Box className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
                <Button component={Link as any} href="/" startIcon={<HomeIcon />} sx={{ color: 'white' }}>
                    Home
                </Button>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ opacity: 0.8 }}>
                    {story.title_native}
                </Typography>
                <Button component={Link as any} href={`/story/${story.storyId}`} sx={{ color: 'white', opacity: 0.7 }}>
                    Exit Flip Mode
                </Button>
            </Box>

            {/* Main Content Area - Fixed Aspect Ratio or Max Width */}
            <Box className="relative w-full max-w-5xl aspect-video md:aspect-[2/1] bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10">

                {/* Left: Text Area (Desktop) / Bottom (Mobile) */}
                <Box className="flex-1 p-8 md:p-12 flex flex-col justify-center items-start relative z-10 bg-[#1a1a1a]">
                    {/* Page Indicator */}
                    <Typography variant="caption" className="absolute top-6 left-8 md:left-12 text-white/40 font-mono">
                        PAGE {pageIndex + 1} / {totalPages}
                    </Typography>

                    <Slide direction={direction === "right" ? "left" : "right"} in={true} key={`text-${pageIndex}`} mountOnEnter unmountOnExit>
                        <Box>
                            <Typography variant="h4" fontWeight={900} className="leading-tight mb-4 md:text-5xl">
                                {currentPage.text_native}
                            </Typography>
                            {currentPage.text_transliteration && (
                                <Typography variant="h6" className="text-white/60 mb-6 font-serif italic">
                                    {currentPage.text_transliteration}
                                </Typography>
                            )}

                            {/* Audio Controls */}
                            <Box className="flex gap-2 mt-4">
                                <IconButton
                                    onClick={() => speak(currentPage.text_native, ttsLang)}
                                    sx={{ bgcolor: 'white', color: 'black', '&:hover': { bgcolor: '#e0e0e0' } }}
                                >
                                    <VolumeUpIcon />
                                </IconButton>
                                <IconButton
                                    onClick={stopSpeaking}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                                >
                                    <StopCircleIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Slide>
                </Box>

                {/* Right: Image Area */}
                <Box className="flex-1 relative bg-black h-full min-h-[300px] md:min-h-auto border-l border-white/5">
                    <Fade in={true} key={`img-${pageIndex}`} timeout={500}>
                        <div className="absolute inset-0">
                            {/* COMPOSITE RENDERING LOGIC */}
                            {(currentPage as any).puppet ? (
                                <>
                                    {/* STAGE */}
                                    <div className="absolute inset-0 w-full h-full">
                                        {(currentPage as any).puppet.stagePath?.startsWith('text:') ? (
                                            <div className="w-full h-full bg-amber-50 flex items-center justify-center text-amber-900/20 font-serif text-4xl select-none">
                                                {(currentPage as any).puppet.stagePath.replace('text:', '')}
                                            </div>
                                        ) : (
                                            <Image
                                                src={(currentPage as any).puppet.stagePath}
                                                alt="Stage"
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    {/* ACTOR */}
                                    <div
                                        className="absolute transition-all duration-500 ease-in-out"
                                        style={{
                                            left: `${(currentPage as any).puppet.layout.x}%`,
                                            top: `${(currentPage as any).puppet.layout.y}%`,
                                            width: '45%',
                                            transform: `translate(-50%, -90%) scale(${(currentPage as any).puppet.layout.size || 1}) scaleX(${(currentPage as any).puppet.layout.isFlipped ? -1 : 1})`,
                                            mixBlendMode: (currentPage as any).puppet.stagePath?.startsWith('text:') ? 'normal' : 'multiply',
                                            filter: (currentPage as any).puppet.stagePath?.startsWith('text:') ? 'none' : 'contrast(1.1) brightness(0.95)'
                                        }}
                                    >
                                        {(currentPage as any).puppet.actorPath?.startsWith('text:') ? (
                                            <div className="bg-white/80 backdrop-blur-sm border-2 border-black/10 rounded-full px-4 py-2 text-center shadow-sm">
                                                <span className="text-lg font-bold text-gray-700">{(currentPage as any).puppet.actorPath.replace('text:', '')}</span>
                                            </div>
                                        ) : (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={(currentPage as any).puppet.actorPath}
                                                alt="Character"
                                                className="w-full h-auto drop-shadow-sm"
                                            />
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* LEGACY IMAGE FALLBACK */
                                <Image
                                    src={currentPage.imagePath || ((currentPage as any).image?.data ? `data:image/png;base64,${(currentPage as any).image.data}` : (currentPage.imageSvgPath || ""))}
                                    alt={currentPage.imageAlt_descriptive || ""}
                                    fill
                                    className="object-cover"
                                    priority
                                    unoptimized
                                />
                            )}
                            {/* Caption Overlay */}
                            {currentPage.imageCaption && (
                                <Box className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                                    <Typography variant="caption" className="text-white/70 italic text-center block">
                                        {currentPage.imageCaption}
                                    </Typography>
                                </Box>
                            )}
                        </div>
                    </Fade>
                </Box>

                {/* Navigation Layers (Click Zones) */}
                <div className="absolute inset-y-0 left-0 w-[15%] cursor-pointer hover:bg-white/5 z-20 flex items-center justify-start pl-4 transition-colors group" onClick={handlePrev}>
                    {pageIndex > 0 && <ArrowBackIcon className="text-white/30 group-hover:text-white transition-colors" fontSize="large" />}
                </div>
                <div className="absolute inset-y-0 right-0 w-[15%] cursor-pointer hover:bg-white/5 z-20 flex items-center justify-end pr-4 transition-colors group" onClick={handleNext}>
                    {pageIndex < totalPages - 1 ? (
                        <ArrowForwardIcon className="text-white/30 group-hover:text-white transition-colors" fontSize="large" />
                    ) : (
                        // End of Book UI
                        <Box className="bg-white text-black px-4 py-2 rounded-full font-bold shadow-lg transform group-hover:scale-105 transition-transform">
                            Finish
                        </Box>
                    )}
                </div>

            </Box>

            {/* Bottom Progress */}
            <Box className="absolute bottom-0 left-0 right-0 p-6 z-10 flex justify-center w-full">
                <Box className="w-full max-w-lg">
                    <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }} />
                </Box>
            </Box>

        </main>
    );
}
