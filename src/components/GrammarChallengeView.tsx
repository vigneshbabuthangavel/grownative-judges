"use client";

import * as React from "react";
import {
    Box,
    Typography,
    Button,
    Card,
    CardActionArea,
    Chip,
    Fade,
    Zoom,
    IconButton
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { speak } from "@/lib/tts";
import type { GrammarChallenge } from "@/lib/grammar/types";

interface GrammarChallengeViewProps {
    challenge: GrammarChallenge;
    onComplete?: (success: boolean) => void;
    theme?: any; // Pass parent theme or use default
}

export function GrammarChallengeView({ challenge, onComplete, theme }: GrammarChallengeViewProps) {
    const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [isCorrect, setIsCorrect] = React.useState(false);

    // For reorder type
    const [order, setOrder] = React.useState<string[]>([]);

    React.useEffect(() => {
        // Reset state when challenge changes
        setSelectedOption(null);
        setIsSubmitted(false);
        setIsCorrect(false);
        if (challenge.type === 'reorder' && challenge.options) {
            // Shuffle for reorder
            setOrder([...challenge.options].sort(() => Math.random() - 0.5));
        }
    }, [challenge]);

    // --- Handlers ---

    function handleOptionSelect(opt: string) {
        if (isSubmitted) return;
        setSelectedOption(opt);

        // Auto-submit for multiple choice? Maybe wait for button?
        // Let's check immediately for snapiness if it's not a multi-step thing
        // But for "quiz" feel, usually confirm is better.
    }

    function checkAnswer() {
        if (!selectedOption && challenge.type !== 'reorder') return;

        let correct = false;

        if (challenge.type === 'reorder') {
            const answer = Array.isArray(challenge.answer_key) ? challenge.answer_key.join(" ") : challenge.answer_key;
            const userAns = order.join(" ");
            correct = userAns === answer;
        } else {
            // Fill gap / multiple choice
            correct = selectedOption === challenge.answer_key;
        }

        setIsCorrect(correct);
        setIsSubmitted(true);
        if (onComplete) onComplete(correct);

        if (correct) {
            speak("Correct!", "en-US");
        } else {
            speak("Try again", "en-US");
        }
    }

    // --- Renders ---

    const renderFillGap = () => (
        <div className="flex flex-col gap-6">
            <Typography variant="h4" className="font-bold text-center mb-4 leading-relaxed">
                {challenge.stimulus.text.split("[").map((part, i) => {
                    if (part.includes("]")) {
                        const [gap, rest] = part.split("]");
                        return (
                            <span key={i}>
                                <span className={`inline-block min-w-[80px] border-b-4 ${isSubmitted ? (isCorrect ? 'border-green-500 text-green-600' : 'border-red-400 text-red-500') : 'border-gray-300 text-primary-600'} text-center px-2 mx-1 transition-colors`}>
                                    {isSubmitted ? (selectedOption || gap) : "____"}
                                </span>
                                {rest}
                            </span>
                        );
                    }
                    return <span key={i}>{part}</span>;
                })}
            </Typography>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {challenge.options?.map((opt) => (
                    <Card
                        key={opt}
                        elevation={0}
                        className={`rounded-xl border-2 transition-all ${selectedOption === opt
                                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                                : 'border-gray-200 hover:border-gray-300'
                            } ${isSubmitted && opt === challenge.answer_key ? 'bg-green-100 border-green-500' : ''}`}
                    >
                        <CardActionArea
                            onClick={() => handleOptionSelect(opt)}
                            className="p-4 flex items-center justify-center min-h-[60px]"
                            disabled={isSubmitted}
                        >
                            <Typography variant="h6" className="font-bold">{opt}</Typography>
                        </CardActionArea>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderReorder = () => (
        <div className="flex flex-col gap-6">
            <Typography variant="body1" className="text-center opacity-60">
                Tap the words in the correct order
            </Typography>

            {/* Target Area */}
            <div className="min-h-[80px] p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-wrap gap-2 justify-center items-center">
                {order.map((word, idx) => (
                    <Chip
                        key={`${word}-${idx}`}
                        label={word}
                        onClick={() => {
                            // Move to bottom? Or logic to swap?
                            // For simplicity: Simple reorder list logic might be complex for this snippet.
                            // Let's just do a "Check Order" of the current list.
                            // The user probably wants drag/drop or click-to-bank. 
                            // Let's implement simplified "Swap with adjacent" or just "Current State Is Validated" for now.
                        }}
                        className="font-bold text-lg py-6 px-2 bg-white border border-gray-200 shadow-sm"
                    />
                ))}
            </div>
            <Typography variant="caption" className="text-center text-red-400">
                (Note: Drag & Drop logic placeholder)
            </Typography>
        </div>
    );

    return (
        <Box className="max-w-2xl mx-auto p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <Chip
                    label={`Level ${challenge.level} • ${challenge.type.replace("_", " ").toUpperCase()}`}
                    size="small"
                    className="font-bold opacity-70"
                />
                {isSubmitted && (
                    <Chip
                        icon={isCorrect ? <CheckCircleIcon /> : <ErrorOutlineIcon />}
                        label={isCorrect ? "Great Job!" : "Keep Trying"}
                        color={isCorrect ? "success" : "error"}
                        variant="filled"
                    />
                )}
            </div>

            {/* Stimulus Context */}
            {challenge.stimulus.context && (
                <Typography variant="subtitle2" className="text-center mb-4 text-primary-600 font-bold uppercase tracking-widest">
                    {challenge.stimulus.context}
                </Typography>
            )}

            {/* Main Interactive Area */}
            <div className="mb-8">
                {challenge.type === 'fill_gap' && renderFillGap()}
                {challenge.type === 'reorder' && renderReorder()}
                {/* Add other types as needed */}
            </div>

            {/* Explanation / Footer */}
            {isSubmitted && (
                <Fade in>
                    <Box className={`p-4 rounded-xl ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-800'} mb-6`}>
                        <Typography variant="body1" className="font-medium">
                            {isCorrect ? challenge.explanation.correct : challenge.explanation.incorrect}
                        </Typography>
                    </Box>
                </Fade>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-4">
                <IconButton onClick={() => speak(challenge.stimulus.text.replace(/\[|\]/g, ""), "en-US")}>
                    <VolumeUpIcon />
                </IconButton>

                {!isSubmitted ? (
                    <Button
                        variant="contained"
                        size="large"
                        onClick={checkAnswer}
                        disabled={!selectedOption && challenge.type !== 'reorder'}
                        className="rounded-full px-8 font-bold"
                    >
                        Check Answer
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        onClick={() => {
                            if (onComplete) onComplete(true);
                        }}
                        className="rounded-full font-bold"
                    >
                        Next Challenge
                    </Button>
                )}
            </div>
        </Box>
    );
}
