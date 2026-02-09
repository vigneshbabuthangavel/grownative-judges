"use client";

export function LevelPath({ currentLevel, maxLevel }: { currentLevel: number; maxLevel: number }) {
  const levels = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-2" aria-label={`Level path. Unlocked up to level ${maxLevel}. Current story level ${currentLevel}.`}>
      {levels.map((lvl) => {
        const unlocked = lvl <= maxLevel;
        const active = lvl === currentLevel;

        const base = "w-3.5 h-3.5 rounded-full border border-black/20 inline-block";
        const cls = active ? `${base} bg-[#2e1065]` : unlocked ? `${base} bg-kidYellow-200` : `${base} bg-white`;

        return <span key={lvl} className={cls} title={unlocked ? `Level ${lvl} (unlocked)` : `Level ${lvl} (locked)`} />;
      })}
    </div>
  );
}
