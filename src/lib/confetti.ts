import confetti from 'canvas-confetti';

export function fireConfetti() {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}

export function fireAlphabetConfetti(text: string = "ABC") {
    // Cast to any because shapeFromText might not be in the basic @types/canvas-confetti
    const C = confetti as any;

    // App Colors from Tailwind Config
    // Purple: #6d28d9, Orange: #c2410c, Yellow: #a16207, Blue (Accent): #2563eb, Green (Accent): #16a34a
    const brandColors = ['#6d28d9', '#c2410c', '#a16207', '#2563eb', '#16a34a', '#e11d48'];

    // Create shapes for each character in the text, cycling through brand colors to ensure visibility
    const shapes = text.split('').map((char, i) => {
        return C.shapeFromText({
            text: char,
            scalar: 3,
            color: brandColors[i % brandColors.length], // Bake the color directly into the shape
            fontFamily: 'sans-serif',
            fontWeight: 'bold'
        });
    });

    const count = 50;
    const defaults = {
        origin: { y: 0.7 },
        shapes: shapes,
        scalar: 2, // General size of particles
        colors: brandColors
    };

    function fire(particleRatio: number, opts: any) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}

// Export a factory that creates a confetti instance on a specific canvas
export function createSubtleDropOnCanvas(canvas: HTMLCanvasElement) {
    // Cast confetti to any to access the .create method which might be missing from default types
    const C = confetti as any;

    // Create a local instance bound to this canvas
    const myConfetti = C.create(canvas, {
        resize: true,
        useWorker: true
    }) as any; // Cast to any for shapeFromText

    const driftColors = [
        'rgba(255, 255, 255, 0.15)', // White
        'rgba(226, 232, 240, 0.15)', // Slate 200
        'rgba(109, 40, 217, 0.15)',  // Brand Purple
        'rgba(37, 99, 235, 0.15)',   // Brand Blue
        'rgba(225, 29, 72, 0.15)'    // Brand Rose
    ];

    // Pre-calculate shapes using the GLOBAL confetti instance helper
    // (shapeFromText is a static helper, not on the instance)
    const shapes = ['A', 'a', 'B', 'b', 'C', 'c'].map((char, i) => {
        return C.shapeFromText({
            text: char,
            scalar: 4,
            color: driftColors[i % driftColors.length],
            fontFamily: 'sans-serif',
            fontWeight: '900'
        });
    });

    return function fire() {
        // SPATIAL DISTRIBUTION LOGIC
        const count = 5;
        const interval = 1.0 / count;

        for (let i = 0; i < count; i++) {
            const x = (i * interval) + (Math.random() * interval);

            myConfetti({
                particleCount: 1,   // Single letter per emitter
                startVelocity: 0,   // Gravity only start
                spread: 180,
                origin: { x: x, y: -0.1 },
                gravity: 0.2,       // Gentle constant pull
                decay: 0.99,        // Barely any drag (ensures they don't stop/fade before bottom)
                ticks: 1500,        // Live for ~25 seconds (guaranteed to hit bottom)
                drift: (Math.random() - 0.5) * 0.4,
                angle: 270,
                shapes: shapes,
                colors: driftColors,
                // opacity: removed, based on colors
                scalar: 4,
                disableForReducedMotion: true,
            });
        }
    };
}

export function fireSubtleAlphabetDrop(text: string = "ABC") {
    // Cast to any because shapeFromText might not be in the basic @types/canvas-confetti
    const C = confetti as any;

    // Mix of brand colors + White + Soft Grey for that "background pattern" feel
    const driftColors = [
        '#ffffff', // White
        '#e2e8f0', // Slate 200
        '#6d28d9', // Brand Purple
        '#2563eb', // Brand Blue
        '#e11d48'  // Brand Rose
    ];

    const shapes = text.split('').map((char, i) => {
        return C.shapeFromText({
            text: char,
            scalar: 4, // Large, readable scalar
            color: driftColors[i % driftColors.length],
            fontFamily: 'sans-serif',
            fontWeight: '900'
        });
    });

    // SPATIAL DISTRIBUTION LOGIC
    // Instead of one burst, we fire "emitters" across the width (0.1 to 0.9)
    // capable of creating a "curtain" of rain/letters.
    const count = 5; // How many emitters across the screen
    const interval = 1.0 / count;

    for (let i = 0; i < count; i++) {
        // Randomize x slightly within the sector to avoid grid-like patterns
        const x = (i * interval) + (Math.random() * interval);

        confetti({
            particleCount: 2,   // Very sparse per emitter for smoothness
            startVelocity: 10,  // Gentle start
            spread: 45,
            origin: { x: x, y: -0.05 }, // Start just above
            gravity: 0.25,      // Very floaty (smooth drop)
            decay: 0.92,        // Air resistance
            drift: (Math.random() - 0.5) * 0.2, // Slight wobble
            ticks: 600,         // Long life
            angle: 270,         // SHOOT DOWN ⬇️
            shapes: shapes,
            colors: driftColors,
            scalar: 4,
            zIndex: 1,          // BACKGROUND LAYER (Behind z-10 content)
            disableForReducedMotion: true
        });
    }
}
