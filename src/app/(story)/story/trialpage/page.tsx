
"use client";

import { EngagingBackground } from "@/components/background/EngagingBackground";
import { useState } from "react";
// import companionJson from "@/public/lottie/companion.json"; // if you have it

export default function StoryPage() {
    // Change this when page turns / child completes paragraph to trigger glow
    const [pulse, setPulse] = useState(0);

    const handlePageTurn = () => {
        setPulse((p) => p + 1);
    };

    return (
        <div className="relative min-h-screen">
            <EngagingBackground
                mode="calm"
                mood="day"
                companionEnabled={false}          // flip on when you add Lottie JSON
                interactionsEnabled={true}        // parent toggle
                // companionAnimationData={companionJson}
                pulseKey={pulse}
            />

            <main className="relative z-[10] p-6 flex flex-col items-center justify-center min-h-screen">
                <div className="mx-auto max-w-2xl rounded-2xl bg-white/80 p-12 shadow-xl backdrop-blur-sm">
                    <h1 className="text-3xl font-bold text-gray-800">The Boy Who Helped</h1>
                    <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                        Arun walked down the bustling street. He saw an old man standing nervously by the curb.
                        Cars were zooming past. (Click below to simulate page turn)
                    </p>

                    <button
                        onClick={handlePageTurn}
                        className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
                    >
                        Turn Page (Trigger Pulse)
                    </button>
                </div>
            </main>
        </div>
    );
}
