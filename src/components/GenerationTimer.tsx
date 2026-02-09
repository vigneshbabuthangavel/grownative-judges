"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Chip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export function useStopwatch() {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTime(prev => prev + 100); // Update every 100ms
            }, 100);
        } else if (!isRunning && timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning]);

    const start = () => {
        setTime(0);
        setIsRunning(true);
    };

    const stop = () => setIsRunning(false);

    return { time, start, stop, isRunning };
}

export function TimerDisplay({ timeMs }: { timeMs: number }) {
    const seconds = (timeMs / 1000).toFixed(1);
    return (
        <Chip
            icon={<AccessTimeIcon />}
            label={`${seconds}s`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
        />
    );
}
