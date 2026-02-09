"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { AmbientCompanion } from "./AmbientCompanion";
import { createSubtleDropOnCanvas } from "@/lib/confetti";
import { getActiveProfile } from "@/lib/profileStorage";

export type BackgroundMode = "calm" | "playful";

type Props = {
    mode?: BackgroundMode;                 // "calm" | "playful"
    mood?: "day" | "sunset" | "night";     // theme tint
    companionEnabled?: boolean;            // parent toggle
    interactionsEnabled?: boolean;         // parent toggle
    companionAnimationData?: object;       // Lottie JSON
    pulseKey?: string | number;            // change this to trigger a glow (page turn, etc.)
};

export function EngagingBackground({
    mode = "calm",
    mood = "day",
    companionEnabled = false,
    interactionsEnabled = true,
    companionAnimationData,
    pulseKey = 0,
}: Props) {
    const reducedMotion = usePrefersReducedMotion();
    // specific ref to track previous pulse key to avoid firing on initial mount
    const prevPulseKey = useRef(pulseKey);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mount, setMount] = useState(false);

    // Store the trigger function in a ref so we don't recreate intervals constantly
    const triggerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        setMount(true);
    }, []);

    // Initialize Canvas-bound Confetti
    useEffect(() => {
        if (!mount || !canvasRef.current) return;

        // CHECK PARENT PREFERENCE
        const profile = getActiveProfile();
        if (profile?.immersiveBackground === false) {
            return;
        }

        // Create the instance bound to our canvas (which is behind content)
        triggerRef.current = createSubtleDropOnCanvas(canvasRef.current);
    }, [mount]);

    // Constant Ambient Rain Loop
    useEffect(() => {
        if (!mount || !interactionsEnabled || reducedMotion) return;

        // Fire immediately to start
        if (triggerRef.current) triggerRef.current();

        const interval = setInterval(() => {
            if (triggerRef.current) triggerRef.current();
        }, 2500);

        return () => clearInterval(interval);
    }, [mount, interactionsEnabled, reducedMotion]);

    // Interaction Pulse
    useEffect(() => {
        if (reducedMotion || !interactionsEnabled) return;

        if (pulseKey !== prevPulseKey.current) {
            console.log("Firing interactions for pulse:", pulseKey);
            if (triggerRef.current) triggerRef.current();
        }
        prevPulseKey.current = pulseKey;
    }, [pulseKey, reducedMotion, interactionsEnabled]);

    const gradientClass =
        mood === "night"
            ? "from-indigo-950 via-slate-950 to-black"
            : mood === "sunset"
                ? "from-indigo-500 via-purple-500 to-amber-300"
                : "from-sky-200 via-indigo-200 to-indigo-50";

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Mood gradient - Static, efficient CSS */}
            <div
                className={`absolute inset-0 bg-gradient-to-b ${gradientClass}`}
                aria-hidden="true"
            />

            {/* Canvas Layer - Explicitly placed here to be BEHIND content but visible on background */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 1 }}
            />

            {/* Optional companion (Lottie is generally safe, but can be disabled via props) */}
            {mount && companionEnabled && companionAnimationData ? (
                <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-auto" style={{ zIndex: 5 }}>
                    <AmbientCompanion
                        enabled={companionEnabled}
                        reducedMotion={reducedMotion}
                        animationData={companionAnimationData}
                    />
                </div>
            ) : null}
        </div>
    );
}
