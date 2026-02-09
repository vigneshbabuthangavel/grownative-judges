"use client";

import * as React from "react";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Card,
    CardActionArea,
    Chip,
    Fade,
    Zoom
} from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BackspaceIcon from "@mui/icons-material/Backspace";
import Confetti from "canvas-confetti";
import { speak } from "@/lib/tts";
import { markWordLearned, getActiveProfile } from "@/lib/profileStorage";
import type { TargetWord, LanguageCode } from "@/lib/types";

interface InteractiveWordBuilderProps {
    words: TargetWord[];
    language: LanguageCode;
    theme: any; // Using the parent theme object
    onSentenceComplete?: () => void;
}

function getTTSLang(l: LanguageCode) {
    // Map internal codes to TTS codes (simplified)
    const map: Record<string, string> = {
        'ta': 'ta-IN', 'hi': 'hi-IN', 'es': 'es-ES', 'fr': 'fr-FR',
        'ja': 'ja-JP', 'zh': 'zh-CN', 'en': 'en-US'
    };
    return map[l] || 'en-US';
}

function splitGraphemes(str: string, locale: string): string[] {
    // Use Intl.Segmenter if available for correct grapheme splitting (fixing Tamil/Indic issues)
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
        const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });
        return Array.from(segmenter.segment(str)).map(s => s.segment);
    }
    return Array.from(str);
}

function generateDistractors(currentWord: string, allWords: TargetWord[], count: number, locale: string): string[] {
    // Collect a pool of characters from ALL words in the list to ensure script consistency
    const pool = new Set<string>();

    allWords.forEach(w => {
        if (w.native === currentWord) return; // Skip current word to avoid duplicates if possible
        const chars = splitGraphemes(w.native, locale);
        chars.forEach(c => pool.add(c));
    });

    // If pool is empty (e.g. only 1 word), fallback to shuffling the current word multiple times? 
    // Or just no distractors.
    if (pool.size === 0) return [];

    const poolArray = Array.from(pool);
    const distractors: string[] = [];

    for (let i = 0; i < count; i++) {
        const randomChar = poolArray[Math.floor(Math.random() * poolArray.length)];
        distractors.push(randomChar);
    }
    return distractors;
}

export function InteractiveWordBuilder({ words, language, theme, onSentenceComplete }: InteractiveWordBuilderProps) {
    // Game Modes: 'browse' | 'spell' | 'sentence'
    const [mode, setMode] = React.useState<'browse' | 'spell' | 'sentence'>('browse');
    const [activeWord, setActiveWord] = React.useState<TargetWord | null>(null);

    // Spell Guide State
    const [scrambledLetters, setScrambledLetters] = React.useState<{ char: string, id: number, isDistractor: boolean }[]>([]);
    const [constructedWord, setConstructedWord] = React.useState<string>("");
    const [usedLetters, setUsedLetters] = React.useState<{ char: string, id: number, isDistractor: boolean }[]>([]);
    const [isCorrect, setIsCorrect] = React.useState(false);

    // Profile State to show checkmarks
    const [learnedIds, setLearnedIds] = React.useState<string[]>([]);

    // Carousel Scroll Logic
    const scrollRef = React.useRef<HTMLDivElement>(null);

    function scroll(direction: 'left' | 'right') {
        if (scrollRef.current) {
            const amount = 300;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
        }
    }

    React.useEffect(() => {
        const p = getActiveProfile();
        if (p) setLearnedIds(p.learnedWordIds || []);
    }, [mode]); // Refresh when coming back to browse

    // --- Handlers ---

    function startSpelling(word: TargetWord) {
        setActiveWord(word);
        setMode('spell');
        setConstructedWord("");
        setIsCorrect(false);

        // Scramble logic
        const locale = getTTSLang(language);
        const correctChars = splitGraphemes(word.native, locale);

        // Generate distractors from other words
        const distractors = generateDistractors(word.native, words, 3, locale);

        const allChars = [
            ...correctChars.map((c, i) => ({ char: c, id: i, isDistractor: false })),
            ...distractors.map((c, i) => ({ char: c, id: 1000 + i, isDistractor: true })) // ID offset to avoid collision
        ].sort(() => Math.random() - 0.5);

        setScrambledLetters(allChars);

        speak(word.native, getTTSLang(language));
        setUsedLetters([]);
    }

    function handleLetterClick(charObj: { char: string, id: number, isDistractor: boolean }) {
        if (!activeWord || isCorrect) return;

        const next = constructedWord + charObj.char;
        setConstructedWord(next);

        // Remove used letter from pool
        setScrambledLetters(prev => prev.filter(x => x.id !== charObj.id));
        setUsedLetters(prev => [...prev, charObj]);

        // Check progress
        if (next === activeWord.native) {
            handleSuccess(activeWord);
        } else if (!activeWord.native.startsWith(next)) {
            // Wrong letter - shake effect or just reset? 
            // For simplicity, let's just allow building. The user can hit reset.
            // Or we can auto-reset if they deviate. Let's provide a clear visual reset button.
        }
    }

    function handleSuccess(word: TargetWord) {
        setIsCorrect(true);
        markWordLearned(word.id);
        speak("Correct!", "en-US");

        // Confetti
        Confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Speak the word again clearly
        setTimeout(() => {
            speak(word.native, getTTSLang(language));
        }, 500);
    }

    function resetSpelling() {
        if (!activeWord) return;
        startSpelling(activeWord);
    }

    function handleUndo() {
        if (usedLetters.length === 0 || !activeWord || isCorrect) return;

        const last = usedLetters[usedLetters.length - 1];
        const newUsed = usedLetters.slice(0, -1);

        setUsedLetters(newUsed);
        setConstructedWord(prev => prev.slice(0, -1));
        setScrambledLetters(prev => [...prev, last]);
    }

    // --- Renderers ---

    if (mode === 'spell' && activeWord) {
        return (
            <Box className={`rounded-3xl border-2 ${theme.cardBorder} p-6 ${theme.cardBg} relative overflow-hidden transition-all text-center`}>
                <IconButton onClick={() => setMode('browse')} className="absolute left-2 top-2">
                    <RefreshIcon style={{ transform: 'rotate(90deg)' }} />
                </IconButton>

                <Typography variant="overline" className="opacity-60 font-bold tracking-widest uppercase">Spelling Challenge</Typography>

                <div className="mt-4 mb-2">
                    <Typography variant="h3" className={`font-black ${theme.text} min-h-[60px]`}>
                        {constructedWord}
                        <span className="animate-pulse opacity-50">_</span>
                    </Typography>
                    <Typography variant="body1" className="opacity-60">{activeWord.meaning_en}</Typography>
                </div>

                {/* Answer Feedback */}
                {isCorrect && (
                    <Zoom in>
                        <div className="my-4 flex items-center justify-center gap-2 text-green-600 bg-green-50 p-2 rounded-full mx-auto w-fit px-6">
                            <CheckCircleIcon /> <span className="font-bold">Correct!</span>
                        </div>
                    </Zoom>
                )}

                {/* Letter Pool */}
                <div className="flex flex-wrap gap-3 justify-center mt-6 min-h-[80px]">
                    {!isCorrect && (scrambledLetters.length > 0 ? scrambledLetters.map((obj) => (
                        <CardActionArea
                            key={obj.id}
                            onClick={() => handleLetterClick(obj)}
                            sx={{
                                width: 48, height: 48, borderRadius: 3,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                bgcolor: 'rgba(0,0,0,0.05)', fontWeight: 800, fontSize: 20
                            }}
                        >
                            {obj.char}
                        </CardActionArea>
                    )) : (
                        <Button onClick={resetSpelling} variant="outlined" color="error">
                            Incorrect - Try Again
                        </Button>
                    ))}
                </div>

                {/* Controls */}
                <Box className="mt-6 flex justify-center gap-4">
                    <Button
                        variant="text"
                        onClick={() => setMode('browse')}
                        className={`font-bold rounded-full ${theme.text} opacity-60 hover:opacity-100 transition-opacity`}
                    >
                        Back
                    </Button>

                    <IconButton
                        onClick={handleUndo}
                        disabled={usedLetters.length === 0 || isCorrect}
                        className={usedLetters.length === 0 || isCorrect ? 'opacity-30' : ''}
                    >
                        <BackspaceIcon />
                    </IconButton>
                    <IconButton onClick={() => speak(activeWord.native, getTTSLang(language))}>
                        <VolumeUpIcon />
                    </IconButton>
                    <IconButton onClick={resetSpelling}>
                        <RefreshIcon />
                    </IconButton>
                    {isCorrect && (
                        <Button variant="contained" onClick={() => setMode('browse')} className="font-bold rounded-full">
                            Next
                        </Button>
                    )}
                </Box>
            </Box>
        );
    }

    // Browse Mode
    return (
        <Box>
            <Typography className="mb-3" sx={{ color: theme.text, opacity: 0.7 }}>
                Tap a word to practice spelling it!
            </Typography>

            {/* Carousel Container */}
            <div className="relative group/carousel">
                {/* Left Arrow */}
                <div className="absolute top-[40%] -left-4 z-20">
                    <IconButton
                        onClick={() => scroll('left')}
                        className={`shadow-md border hover:opacity-90 ${theme.buttonPrimary}`}
                        size="small"
                        sx={{ visibility: words.length > 2 ? 'visible' : 'hidden' }}
                    >
                        <span className="font-bold text-lg">&lt;</span>
                    </IconButton>
                </div>

                {/* Right Arrow */}
                <div className="absolute top-[40%] -right-4 z-20">
                    <IconButton
                        onClick={() => scroll('right')}
                        className={`shadow-md border hover:opacity-90 ${theme.buttonPrimary}`}
                        size="small"
                        sx={{ visibility: words.length > 2 ? 'visible' : 'hidden' }}
                    >
                        <span className="font-bold text-lg">&gt;</span>
                    </IconButton>
                </div>

                {/* Scrollable Area */}
                <div
                    ref={scrollRef}
                    className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-2 px-1 scrollbar-hide snap-x"
                    style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}
                >
                    {words.map((w, idx) => {
                        const isLearned = learnedIds.includes(w.id);
                        return (
                            <Card
                                key={`${w.id}-${idx}`}
                                elevation={0}
                                className={`snap-start shrink-0 w-[140px] rounded-2xl border ${theme.cardBorder} relative overflow-hidden group transition-transform active:scale-95`}
                                sx={{ bgcolor: isLearned ? 'rgba(34, 197, 94, 0.1)' : (theme.cardBg === 'bg-white' ? '#f8fafc' : 'rgba(255,255,255,0.05)') }}
                            >
                                {isLearned && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5 shadow-sm z-10">
                                        <CheckCircleIcon style={{ fontSize: 14 }} />
                                    </div>
                                )}
                                <CardActionArea onClick={() => startSpelling(w)} sx={{ p: 2, height: '100%', minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className={`text-xl font-black ${theme.text} mb-1`}>{w.native}</div>
                                    <div className={`text-xs font-bold ${theme.text} opacity-60 uppercase`}>{w.meaning_en}</div>
                                </CardActionArea>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </Box>
    );
}
