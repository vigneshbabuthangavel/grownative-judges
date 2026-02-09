
import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface CostTrackerProps {
    logs: { name: string; status: string }[];
}

export function CostTracker({ logs }: CostTrackerProps) {
    // ESTIMATED COSTS (Standard Public Pricing)
    const COSTS = {
        IMAGE: 0.04, // Unmatched Imagen 3 cost (approx)
        PRO_CALL: 0.002, // Gemini 1.5/3 Pro Input+Output
        FLASH_CALL: 0.0002 // Flash is cheap
    };

    const totalCost = React.useMemo(() => {
        let sum = 0;
        logs.forEach(log => {
            if (log.status !== 'success' && log.status !== 'loading') return;

            const lower = log.name.toLowerCase();

            // Image Generation
            if (lower.includes('visual production') || lower.includes('page 1 ready')) {
                // Determine if it was a batch or single
                if (lower.includes('generating rest')) {
                    sum += COSTS.IMAGE * 5; // Approx 5 pages
                } else {
                    sum += COSTS.IMAGE; // 1 page
                }
            }
            // Scene Generation Loop
            else if (lower.includes('scene') && lower.includes('generated')) {
                // If detailed logs are enabled, this catches individual pages.
                // Avoid double counting if "Visual Production" batch log is present.
                // For safety, we only count specifically distinct actions.
                // Let's rely on high-level phases usually.
            }

            // Text Models
            else if (lower.includes('gemini 3 pro') || lower.includes('blueprint') || lower.includes('authoring')) {
                sum += COSTS.PRO_CALL;
            }
            else if (lower.includes('flash') || lower.includes('audit') || lower.includes('anchoring')) {
                sum += COSTS.FLASH_CALL;
            }
        });
        return sum;
    }, [logs]);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                mb: 3,
                bgcolor: 'rgba(0,0,0,0.8)',
                color: 'white',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoneyIcon color="success" />
                <Typography variant="subtitle2" fontWeight="bold">
                    Session Cost
                </Typography>
            </Box>

            <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: '#4ade80', fontFamily: 'monospace' }}>
                    ${totalCost.toFixed(4)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    (Est. ~{(totalCost * 1.58).toFixed(2)} AUD)
                </Typography>
            </Box>
        </Paper>
    );
}
