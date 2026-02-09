"use client";

import * as React from "react";
import { Box, Chip, Divider, Paper, Typography, Button } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import TranslateIcon from "@mui/icons-material/Translate";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getActiveProfile, deleteWritingSample } from "@/lib/profileStorage";
import { stories, storyById } from "@/lib/stubData";

type WordStat = {
  id: string;
  native: string;
  meaning_en: string;
  transliteration?: string;
  seen: number;
  usedInWriting: number;
};

function computeWordStats(profileId: string | undefined, storyList: any[]) {
  const p = getActiveProfile();
  if (!p) return [];
  const completed = new Set(p.completedStoryIds || []);
  const wordMap = new Map<string, WordStat>();

  for (const s of storyList) {
    if (!completed.has(s.storyId)) continue;
    // Count target word occurrences by page associations
    // Check if pages exist (dynamic stories might be strict summaries)
    if (!s.pages) continue;

    for (const pg of s.pages) {
      if (!pg.targetWordIds) continue;
      for (const wid of pg.targetWordIds) {
        const tw = s.targetWords?.find((w: any) => w.id === wid);
        if (!tw) continue;
        const cur = wordMap.get(wid) || {
          id: wid,
          native: tw.native,
          meaning_en: tw.meaning_en,
          transliteration: tw.transliteration,
          seen: 0,
          usedInWriting: 0,
        };
        cur.seen += 1;
        wordMap.set(wid, cur);
      }
    }
  }

  const samples = p.writingSamples || [];
  for (const ws of samples) {
    const text = (ws.text || "").toLowerCase();
    for (const [wid, stat] of wordMap.entries()) {
      // naive usage: if native word appears in writing sample
      if (stat.native && ws.text.includes(stat.native)) stat.usedInWriting += 1;
      // also transliteration (optional)
      if (stat.transliteration && text.includes(stat.transliteration.toLowerCase())) stat.usedInWriting += 1;
    }
  }

  return Array.from(wordMap.values()).sort((a, b) => b.seen - a.seen);
}

export function ParentDashboard() {
  const [profile, setProfile] = React.useState(() => getActiveProfile());
  const [dynamicStories, setDynamicStories] = React.useState<any[]>([]);

  // Combine static and dynamic
  const allStories = React.useMemo(() => [...stories, ...dynamicStories], [dynamicStories]);

  const [wordStats, setWordStats] = React.useState<WordStat[]>(() => computeWordStats(profile?.id, stories));
  const [samples, setSamples] = React.useState(() => profile?.writingSamples || []);

  React.useEffect(() => {
    // 1. Fetch Dynamic Stories
    fetch('/api/stories?summary=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDynamicStories(data);
      })
      .catch(err => console.error("Failed to load stories", err));

    // 2. Focus Handler
    const onFocus = () => {
      const p = getActiveProfile();
      setProfile(p);
      setSamples(p?.writingSamples || []);
      // We need to re-compute logic inside the effect or rely on dependency changes.
      // Ideally we trigger a re-calc. 
      // For now, let's just re-set local state.
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Update stats when stories or profile change
  React.useEffect(() => {
    setWordStats(computeWordStats(profile?.id, allStories));
  }, [profile, allStories]);

  function removeSample(id: string) {
    deleteWritingSample(id);
    const p = getActiveProfile();
    setSamples(p?.writingSamples || []);
    // Ensure we use the latest allStories from closure or ref. 
    // Since removeSample is inside component, it captures render scope.
    // However, for safety in this specific architecture, we might be better off relying on the effect dependency.
    // But to keep UI snappy:
    setWordStats(computeWordStats(p?.id, allStories));
  }

  if (!profile) return null;

  return (
    <Box className="grid gap-4">
      <Paper className="rounded-none p-6 border-2 border-black/10 shadow-soft bg-white">
        <Box className="flex items-center gap-2 mb-3">
          <TrendingUpIcon sx={{ color: '#111' }} />
          <Typography variant="h6" fontWeight={950}>Progress</Typography>
        </Box>
        <Box className="flex flex-wrap gap-2">
          <Chip className="bg-kidYellow-50 border border-black/10 font-extrabold" icon={<StarIcon fontSize="small" />} label={<>Level <b>{profile.unlockedLevel}</b></>} />
          <Chip className="bg-white border border-black/10 font-extrabold" icon={<AutoStoriesIcon fontSize="small" />} label={<>Stories read <b>{profile.completedStoryIds.length}</b></>} />
          <Chip className="bg-white border border-black/10 font-extrabold" icon={<BookmarkIcon fontSize="small" />} label={<>Saved sentences <b>{samples.length}</b></>} />
        </Box>
        <Typography className="mt-3 text-sm" color="text.secondary">
          Everything here is stored locally on this device.
        </Typography>
      </Paper>

      <Paper className="rounded-none p-6 border-2 border-black/10 shadow-soft bg-white">
        <Box className="flex items-center gap-2 mb-1">
          <TranslateIcon sx={{ color: '#111' }} />
          <Typography variant="h6" fontWeight={950}>Words your child has learned</Typography>
        </Box>
        <Typography className="mt-1 text-sm" color="text.secondary">
          Counts are based on completed stories (how often each word appeared in pages).
        </Typography>

        <div className="mt-4 grid gap-3">
          {wordStats.length === 0 ? (
            <Typography className="text-sm" color="text.secondary">
              No completed stories yet. Finish a story to start building vocabulary stats.
            </Typography>
          ) : (
            wordStats.slice(0, 40).map((w) => (
              <div key={w.id} className="rounded-none border border-black/10 p-4 bg-kidPurple-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-black text-[#111]">{w.native}</div>
                    <div className="text-sm text-black/70">{w.meaning_en}{w.transliteration ? ` • ${w.transliteration}` : ""}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <Chip className="bg-white border border-black/10 font-extrabold" icon={<VisibilityIcon fontSize="small" />} label={<>Seen <b>{w.seen}</b></>} />
                    <Chip className="bg-white border border-black/10 font-extrabold" icon={<EditIcon fontSize="small" />} label={<>Used <b>{w.usedInWriting}</b></>} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Paper>

      <Paper className="rounded-none p-6 border-2 border-black/10 shadow-soft bg-white">
        <Typography variant="h6" fontWeight={950}>Saved sentences</Typography>
        <Typography className="mt-1 text-sm" color="text.secondary">
          These are sentences saved from the “Try writing one sentence” box while reading.
        </Typography>

        <div className="mt-4 grid gap-3">
          {samples.length === 0 ? (
            <Typography className="text-sm" color="text.secondary">
              No sentences saved yet. Open a story and click “Save to Parent View”.
            </Typography>
          ) : (
            samples.slice().reverse().map((s) => {
              const st = allStories.find(as => as.storyId === s.storyId);
              return (
                <div key={s.id} className="rounded-none border border-black/10 p-4 bg-kidYellow-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold text-[#111]">
                        {st ? st.title_native : "Story"} • Level {s.level}
                      </div>
                      <div className="text-xs text-black/70">{new Date(s.createdAt).toLocaleString()}</div>
                      <Divider className="my-2" />
                      <div className="text-base font-semibold text-[#111]">{s.text}</div>
                    </div>
                    <Button onClick={() => removeSample(s.id)} variant="outlined" className="rounded-none border-black/20 text-black" startIcon={<DeleteIcon />}>
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Paper>
    </Box>
  );
}
