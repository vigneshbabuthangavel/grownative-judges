"use client";

import * as React from "react";
import { Box, FormControl, InputLabel, Select, MenuItem, Chip } from "@mui/material";

export type ShelfMode = "myLevel" | "practice" | "all";

export function StoryShelfFilter({
  availableTopics,
  availableLanguages,
  language,
  setLanguage,
  topic,
  setTopic,
  shelf,
  setShelf,
  maxLevel,
  languageDisabled,
}: {
  availableTopics: string[];
  availableLanguages: { code: string; label: string }[];
  language: string;
  setLanguage: (v: string) => void;
  topic: string;
  setTopic: (v: string) => void;
  shelf: ShelfMode;
  setShelf: (v: ShelfMode) => void;
  maxLevel: number;
  languageDisabled?: boolean;
}) {
  return (
    <Box className="mt-5 rounded-3xl border border-black/10 bg-white p-4 shadow-soft">
      <Box className="flex flex-wrap items-center gap-2">
        <Chip
          label="My Level"
          onClick={() => setShelf("myLevel")}
          className={shelf === "myLevel" ? "bg-kidPurple-100 text-black border border-black/10 font-extrabold" : "bg-white text-black border border-black/20 font-extrabold"}
        />
        <Chip
          label="Practice Easier"
          onClick={() => setShelf("practice")}
          className={shelf === "practice" ? "bg-kidYellow-100 text-black border border-black/10 font-extrabold" : "bg-white text-black border border-black/20 font-extrabold"}
        />
        <Chip
          label="All Unlocked"
          onClick={() => setShelf("all")}
          className={shelf === "all" ? "bg-kidOrange-100 text-black border border-black/10 font-extrabold" : "bg-white text-black border border-black/20 font-extrabold"}
        />

        <Box className="flex-1" />

        <FormControl size="small" className="min-w-[160px]">
          <InputLabel id="langFilter">Language</InputLabel>
          <Select labelId="langFilter" label="Language" value={language} onChange={(e) => setLanguage(e.target.value)} disabled={languageDisabled}>
            <MenuItem value="all">All</MenuItem>
            {availableLanguages.map((l) => (
              <MenuItem key={l.code} value={l.code}>
                {l.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" className="min-w-[180px]">
          <InputLabel id="topicFilter">Topic</InputLabel>
          <Select labelId="topicFilter" label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {availableTopics.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* <Chip className="bg-white text-black border border-black/20 font-extrabold" label={<span><b>Unlocked</b> ≤ {maxLevel}</span>} /> */}
      </Box>
    </Box>
  );
}
