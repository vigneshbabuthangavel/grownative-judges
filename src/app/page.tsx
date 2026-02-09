"use client";

import { Container, Typography, Box, Chip } from "@mui/material";
import * as React from "react";
import { AppFooter } from "@/components/AppFooter";
import { StoryShelfFilter, type ShelfMode } from "@/components/StoryShelfFilter";
import { StoryCard } from "@/components/StoryCard";
// import { stories, topicsFromStories } from "@/lib/stubData";
import { getActiveProfile } from "@/lib/profileStorage";

function applyShelfMode(level: number, maxLevel: number, shelf: ShelfMode) {
  if (shelf === "myLevel") return level === maxLevel;
  if (shelf === "practice") return level < maxLevel;
  return level <= maxLevel;
}

const LANGUAGE_LABELS: Record<string, string> = {
  ta: "Tamil",
  hi: "Hindi",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  bn: "Bengali",
  zh: "Chinese",
  ja: "Japanese",
  fr: "French",
  es: "Spanish",
  en: "English",
};

export default function HomePage() {
  const [profile, setProfile] = React.useState<any>(null); // Use 'any' or import LocalProfile if strict
  const [language, setLanguage] = React.useState<string>("all");
  const [topic, setTopic] = React.useState<string>("all");
  const [shelf, setShelf] = React.useState<ShelfMode>("myLevel");
  const [publishedStories, setPublishedStories] = React.useState<any[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = React.useState(false);
  const [languageLocked, setLanguageLocked] = React.useState(false);

  React.useEffect(() => {
    // Check Auth & Profile
    const superOk = window.sessionStorage.getItem("gn_super_admin_ok") === "1";
    setIsSuperAdmin(superOk);

    // Hydrate profile on mount
    const updateProfile = () => {
      const current = getActiveProfile();
      if (current) {
        setProfile(current);
        if (!superOk) {
          setLanguage(current.primaryLanguage);
          setLanguageLocked(true);
        } else {
          setLanguageLocked(false);
        }
      } else {
        // Guest or no profile
        setLanguageLocked(false);
      }
    };

    updateProfile();

    const onFocus = () => updateProfile();
    window.addEventListener("focus", onFocus);
    // Fetch published stories
    fetch('/api/stories').then(r => r.json()).then(data => setPublishedStories(data)).catch(console.error);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Removed redundant useEffect that was overriding language without checks

  const maxLevel = profile?.unlockedLevel ?? 1;

  // Merge Stub Data + Published Data
  // const allStories = React.useMemo(() => [...stories, ...publishedStories], [publishedStories]);

  // USER REQUEST: Remove dummy stories (stubs) and invalid levels.
  const allStories = React.useMemo(() => [...publishedStories], [publishedStories]);

  const uniqueTopics = React.useMemo(() => {
    const t = new Set(allStories.map(s => s.theme).filter(Boolean));
    return Array.from(t).sort();
  }, [allStories]);

  const uniqueLanguages = React.useMemo(() => {
    const codes = new Set(allStories.map(s => s.language).filter(Boolean));
    // Ensure current language is in the list to avoid MUI warning
    // This happens if the user has a preferred language but no stories are loaded yet (or filtered out).
    if (language !== "all" && !codes.has(language)) {
      codes.add(language);
    }

    // Hide other languages if locked
    if (languageLocked) {
      return [{
        code: language,
        label: LANGUAGE_LABELS[language] || language.toUpperCase()
      }];
    }

    return Array.from(codes).map(code => ({
      code,
      label: LANGUAGE_LABELS[code] || code.toUpperCase()
    })).sort((a, b) => (a.label < b.label ? -1 : 1));
  }, [allStories, language, languageLocked]);

  const filteredStories = allStories
    // .filter((s) => s.level <= maxLevel) // ALLOW ALL LEVELS FOR PARENTS
    // .filter((s) => applyShelfMode(s.level, maxLevel, shelf)) // BYPASS SHELF MODE
    .filter((s) => s.level !== undefined && s.level > 0) // Filter invalid levels
    .filter((s) => (language === "all" ? true : s.language === language))
    .filter((s) => (topic === "all" ? true : s.theme === topic));

  return (
    <main className="min-h-screen flex flex-col">

      <Container maxWidth="xl" className="py-8 md:py-12 flex-grow">

        <Box className="mt-6 rounded-3xl bg-white shadow-soft p-8 border border-black/10">
          <Typography variant="h4" component="h1" fontWeight={900}>
            Stories
          </Typography>
          <Typography className="mt-2" color="text.secondary">
            Pick a story, flick through like a book, and learn words you can use for writing.
            {languageLocked && ` Showing stories for: ${LANGUAGE_LABELS[language] || language}`}
          </Typography>

          <Box className="mt-4 flex flex-wrap gap-2 items-center">
            <Chip label="Local-only profiles" className="bg-white text-black border border-black/20" />
            <Chip label="AAA intent" className="bg-kidYellow-100 text-black border border-black/10" />
            <Chip label="Topics + levels" className="bg-kidPurple-100 text-black border border-black/10" />
          </Box>

          <StoryShelfFilter
            availableTopics={uniqueTopics}
            availableLanguages={uniqueLanguages}
            language={language}
            setLanguage={setLanguage}
            topic={topic}
            setTopic={setTopic}
            shelf={shelf}
            setShelf={setShelf}
            maxLevel={maxLevel}
            languageDisabled={languageLocked}
          />

          <Typography className="mt-3 text-sm" color="text.secondary">
            Showing {filteredStories.length} stories.
          </Typography>
        </Box>

        <section className="mt-6">
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStories.map((s) => (
              <StoryCard key={s.storyId} story={s} />
            ))}
            {filteredStories.length === 0 && (
              <div className="col-span-full py-10 text-center text-slate-400">
                No stories found matching filters.
              </div>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-black text-white">Writing Challenges</h2>
          <p className="mt-2 text-white opacity-80">
            Unlock writing after completing 3 stories. Completing a challenge unlocks the next level (demo).
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="rounded-3xl border border-black/10 shadow-soft overflow-hidden bg-white p-5">
              <div className="font-black text-[#111] text-lg">Writing Challenge</div>
              <div className="mt-1 text-sm text-[#111] opacity-80">Practice a sentence using learned words.</div>
              <a
                href="/writing"
                className="mt-4 inline-flex w-full justify-center rounded-2xl bg-[#2e1065] px-4 py-2 text-white font-extrabold focus-visible:outline focus-visible:outline-4 focus-visible:outline-black"
              >
                Open
              </a>
            </div>
          </div>
        </section>

      </Container>
      <AppFooter />
    </main>
  );
}
