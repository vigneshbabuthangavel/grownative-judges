
"use client";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
    // trigger changes when page turns / paragraph completes / etc.
    pulseKey: string | number;
    reducedMotion: boolean;
};

export function BackgroundFeedback({ pulseKey, reducedMotion }: Props) {
    // A gentle “glow pulse” that runs on events only (not constantly)
    return (
        <AnimatePresence>
            <motion.div
                key={pulseKey}
                className="absolute inset-0 z-[2] pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: reducedMotion ? 0.06 : 0.12 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0.15 : 0.4 }}
                style={{
                    // subtle vignette glow
                    background:
                        "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0) 55%)",
                }}
                aria-hidden="true"
            />
        </AnimatePresence>
    );
}
