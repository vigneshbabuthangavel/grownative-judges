"use client";

import * as React from "react";
import { Box } from "@mui/material";
import { BugReport, AcUnit } from "@mui/icons-material";
import { keyframes } from "@mui/system";

// Animations
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.1); opacity: 0.15; }
  100% { transform: scale(1); opacity: 0.1; }
`;

export function GlobalBackground() {
    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
                bgcolor: "#2e1065", // Deep purple from theme primary
                overflow: "hidden",
                pointerEvents: "none", // Allow clicks to pass through
            }}
        >
            {/* Background Decorative SVGs */}
            <BugReport
                sx={{
                    fontSize: "40rem",
                    position: "absolute",
                    right: "-10%",
                    top: "10%",
                    color: "white",
                    opacity: 0.05,
                    transform: "rotate(15deg)",
                    animation: `${pulse} 8s infinite ease-in-out`,
                }}
            />
            <AcUnit
                sx={{
                    fontSize: "20rem",
                    position: "absolute",
                    left: "-5%",
                    bottom: "10%",
                    color: "white",
                    opacity: 0.03,
                    transform: "rotate(-15deg)",
                    animation: `${float} 6s infinite ease-in-out`,
                }}
            />
        </Box>
    );
}
