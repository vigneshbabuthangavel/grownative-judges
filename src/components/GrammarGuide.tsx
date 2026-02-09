"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, CircularProgress, Chip, IconButton } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReactMarkdown from 'react-markdown';

type Message = {
    role: "user" | "assistant";
    content: string;
};

interface GrammarGuideProps {
    languageCode: string;
    languageName: string;
}

export default function GrammarGuide({ languageCode, languageName }: GrammarGuideProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const suggestions = [
        "Explain basic sentence structure",
        `How do honorifics work in ${languageName}?`,
        "Tell me a fun cultural fact",
        "Common greeting phrases"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMsg: Message = { role: "user", content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat/grammar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    language: languageName,
                    context: messages.slice(-4) // Send last few messages for context
                })
            });

            const data = await res.json();

            if (data.error) {
                setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I had trouble connecting. Please try again." }]);
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} className="p-4 rounded-xl bg-white/95 backdrop-blur-sm border border-slate-200 mt-6 overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <Box className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <AutoAwesomeIcon className="text-purple-600" />
                <Typography variant="h6" className="font-bold text-slate-800">
                    AI Language & Culture Guide
                </Typography>
            </Box>

            {/* Chat Window */}
            <Box className="flex-1 overflow-y-auto mb-4 space-y-3 px-2">
                {messages.length === 0 && (
                    <Box className="text-center mt-10 opacity-70">
                        <Typography variant="body2" className="text-slate-500 mb-4">
                            Ask me anything about {languageName} grammar, vocabulary, or culture!
                        </Typography>
                        <Box className="flex flex-wrap justify-center gap-2">
                            {suggestions.map((s, i) => (
                                <Chip
                                    key={i}
                                    label={s}
                                    onClick={() => handleSend(s)}
                                    clickable
                                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {messages.map((msg, i) => (
                    <Box key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <Box className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === "user"
                                ? "bg-purple-600 text-white rounded-tr-none"
                                : "bg-slate-100 text-slate-800 rounded-tl-none"
                            }`}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </Box>
                    </Box>
                ))}

                {loading && (
                    <Box className="flex justify-start">
                        <Box className="bg-slate-100 p-3 rounded-lg rounded-tl-none">
                            <CircularProgress size={20} className="text-slate-400" />
                        </Box>
                    </Box>
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box className="flex gap-2 pt-2 border-t border-slate-100">
                <TextField
                    fullWidth
                    size="small"
                    placeholder={`Ask about ${languageName}...`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={loading}
                    className="bg-slate-50"
                />
                <IconButton
                    color="primary"
                    onClick={() => handleSend()}
                    disabled={!input.trim() || loading}
                    className="bg-purple-600 text-white hover:bg-purple-700 disabled:bg-slate-300"
                >
                    <SendIcon fontSize="small" />
                </IconButton>
            </Box>
        </Paper>
    );
}
