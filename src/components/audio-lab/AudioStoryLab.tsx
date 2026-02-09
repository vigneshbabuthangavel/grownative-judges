"use client";

import * as React from 'react';
import { Box } from '@mui/material';
import { StoryDummyPage } from './StoryDummyPage';

export default function AudioStoryLab({ onBack }: { onBack: () => void }) {
    return (
        <Box>
            <StoryDummyPage onBack={onBack} />
        </Box>
    );
}
