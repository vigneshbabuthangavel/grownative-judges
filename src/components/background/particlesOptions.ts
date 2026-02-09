
import type { ISourceOptions } from "@tsparticles/engine";

export type BackgroundMode = "calm" | "playful";

type Params = {
    mode: BackgroundMode;
    reducedMotion: boolean;
    mood?: "day" | "sunset" | "night";
};

/**
 * Keep it subtle: low count, low opacity, slow speed.
 * No reward-like explosions (you already have level-complete popper).
 */
export function makeParticlesOptions({ mode, reducedMotion, mood = "day" }: Params): ISourceOptions {
    const intensity = reducedMotion ? "calm" : mode;

    // EXTREME EFFICIENCY: Very low particle counts
    // Reduced further for mobile optimization (Pessimistic Score improvement)
    const numberValue = intensity === "playful" ? 8 : 4;
    const speedValue = intensity === "playful" ? 0.35 : 0.18;
    const opacityValue = intensity === "playful" ? 0.25 : 0.18;

    // Mood gradient is handled by CSS layer, but you can align particles brightness here.
    const particleColor = mood === "night" ? "#ffffff" : "#ffffff";

    return {
        fullScreen: { enable: false }, // we will size it via container
        detectRetina: false, // disable for performance/memory on high-res screens
        fpsLimit: 30, // Capping at 30FPS for maximum battery/memory saving logic as requested
        pauseOnBlur: true,

        particles: {
            number: { value: numberValue, density: { enable: false } }, // scaling disabled, fixed count
            color: { value: particleColor },
            opacity: { value: opacityValue },
            size: { value: { min: 2, max: 4 } }, // smaller particles

            move: {
                enable: !reducedMotion,
                speed: speedValue,
                direction: "none",
                outModes: { default: "out" },
            },

            // “Living world drift” shapes (keep generic; you can swap to images later)
            shape: { type: ["circle"] },
        },

        interactivity: {
            events: {
                onClick: { enable: !reducedMotion, mode: "bubble" }, // micro-interaction, not a reward
                onHover: { enable: false, mode: [] },
                resize: { enable: true },
            },
            modes: {
                bubble: {
                    duration: 0.4,
                    distance: 60, // reduced distance
                    size: 6,      // reduced max size
                    opacity: 0.35,
                },
            },
        },

        // Quiet background: no continuous flashy effects
        background: { color: { value: "transparent" } },
    };
}
