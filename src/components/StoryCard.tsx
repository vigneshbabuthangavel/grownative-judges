"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardActions, Button, Chip, Typography, Box } from "@mui/material";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import type { StoryPack } from "@/lib/types";
import { getActiveProfile } from "@/lib/profileStorage";
import * as React from "react";

export function StoryCard({ story }: { story: StoryPack }) {
  const [unlockedLevel, setUnlockedLevel] = React.useState(1);

  React.useEffect(() => {
    setUnlockedLevel(getActiveProfile()?.unlockedLevel ?? 1);
  }, []);

  const levelLabel = `Level ${story.level}`;
  // Identify language code for display
  const langCode = (story.language || "EN").toUpperCase();

  const bg =
    story.language === "ta"
      ? "bg-kidPurple-100"
      : story.language === "hi"
        ? "bg-kidYellow-100"
        : "bg-kidOrange-100";

  // Logic: Prefer Native Title. If missing, fall back to title.
  // User requested suppressing English titles, so we focus on native.
  const displayTitle = story.title_native || story.title;

  // Resolved Thumbnail Path
  let thumbnailPath = (story as any).thumbnailPath || story.thumbnailSvgPath || story.pages?.[0]?.imagePath;
  if (thumbnailPath) {
    if (thumbnailPath.startsWith("/9j/") || thumbnailPath.startsWith("iVBOR")) {
      thumbnailPath = thumbnailPath.startsWith("/9j/") ? `data:image/jpeg;base64,${thumbnailPath}` : `data:image/png;base64,${thumbnailPath}`;
    }
  }

  // FIX: Force unoptimized for local content to prevent caching issues with dynamically created files
  const isLocalContent = typeof thumbnailPath === 'string' && thumbnailPath.startsWith('/content');
  const isDataUri = typeof thumbnailPath === 'string' && thumbnailPath.startsWith('data:');

  // Link wrapper to make the card interactive? Or just title/image. 
  // User asked for Title link specifically, but usually the whole card or top section is better.
  const storyLink = `/story/${encodeURIComponent(story.storyId)}`;

  return (
    <Card className="rounded-none border-2 border-black/10 shadow-soft overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
      {/* Header: Title on Top, Meta on Right */}
      <Box className={`${bg} p-3 flex flex-col gap-2`}>
        <Box className="flex items-start justify-between gap-2">
          {/* USER REQUEST: Title as Link */}
          <Link href={storyLink} className="hover:underline decoration-2">
            <Typography variant="h6" fontWeight={900} className="leading-tight text-slate-900">
              {displayTitle}
            </Typography>
          </Link>

          <Box className="flex items-center gap-1 shrink-0">
            <Chip
              label={levelLabel}
              icon={<LeaderboardIcon fontSize="small" />}
              size="small"
              className="bg-white text-black border border-black/10 font-bold rounded-md"
            />
            <Chip
              label={langCode}
              icon={<PublicIcon fontSize="small" />}
              size="small"
              className="bg-white text-black border border-black/10 font-bold rounded-md"
            />
          </Box>
        </Box>
      </Box>

      <div className="bg-white flex-grow flex flex-col">
        <div className="p-4 flex-grow">
          {/* Thumbnail - Clickable */}
          <Link href={storyLink} className="block group">
            <div className="relative w-full aspect-video rounded-none overflow-hidden border border-black/10 bg-slate-50 flex items-center justify-center mb-3 group-hover:opacity-90 transition-opacity">
              {thumbnailPath ? (
                <Image
                  src={thumbnailPath}
                  alt={displayTitle || "Story thumbnail"}
                  fill
                  className="object-cover"
                  unoptimized={isDataUri || isLocalContent}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <AutoStoriesIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
              )}
            </div>
          </Link>

          {/* Transliteration (if exists) */}
          {story.title_transliteration && (
            <Typography variant="body2" color="text.secondary" className="mb-2 italic">
              {story.title_transliteration}
            </Typography>
          )}

          {/* Topic */}
          <Typography variant="body2" color="text.secondary">
            Topic: {story.theme} · {story.pages?.length || 0} pages
          </Typography>
        </div>

        {/* Removed "Open Story" Button as per request (Title/Image are now links) */}
        {/* <CardActions className="px-4 pb-4 mt-auto"> ... </CardActions> */}
      </div>
    </Card>
  );
}
