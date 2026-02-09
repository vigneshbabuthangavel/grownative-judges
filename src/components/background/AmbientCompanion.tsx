
"use client";

import Lottie from "lottie-react";
import { useMemo } from "react";

type Props = {
    enabled: boolean;
    reducedMotion: boolean;
    // Put your Lottie JSON in /public and import it, or pass it from parent.
    animationData: object;
};

export function AmbientCompanion({ enabled, reducedMotion, animationData }: Props) {
    const shouldPlay = enabled && !reducedMotion;

    // Slow down by limiting FPS-ish feel: simplest is to reduce loop speed.
    const style = useMemo(
        () => ({
            width: 140,
            height: 140,
            opacity: 0.9,
            pointerEvents: "none" as const, // companion is visual only
        }),
        []
    );

    if (!enabled) return null;

    return (
        <div className="absolute bottom-4 left-4 z-[1] select-none" aria-hidden="true">
            <Lottie
                animationData={animationData}
                loop
                autoplay={shouldPlay}
                style={style}
            />
            {/* If reduced motion, show a static frame by just rendering without autoplay */}
            {reducedMotion && (
                <div className="sr-only">Companion animation disabled due to reduced motion preference.</div>
            )}
        </div>
    );
}
