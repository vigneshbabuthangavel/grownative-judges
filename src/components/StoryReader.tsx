"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Divider,
  Paper,
  LinearProgress,
  TextField,
  Snackbar,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import SchoolIcon from "@mui/icons-material/School";
import TranslateIcon from "@mui/icons-material/Translate";
import VerifiedIcon from "@mui/icons-material/Verified";
import WarningIcon from "@mui/icons-material/Warning";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExtensionIcon from "@mui/icons-material/Extension";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PaletteIcon from "@mui/icons-material/Palette";
import EditIcon from "@mui/icons-material/Edit";
import { Menu, MenuItem, ListItemIcon } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import type { StoryPack } from "@/lib/types";
import { canSpeak, speak, stopSpeaking } from "@/lib/tts";
import { LevelPath } from "@/components/LevelPath";
import { AppFooter } from "@/components/AppFooter";
import { getOrGenerateAudioAction } from "@/app/actions/audio";
import { clearStoryVocabulary, generateStoryVocabulary, updateStoryPageText } from "@/app/actions/story-actions";
import { getActiveProfile, markStoryCompleted, setLike, addWritingSample } from "@/lib/profileStorage";
import { VerticalStoryReader } from "@/components/VerticalStoryReader";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";

import { fireConfetti, fireAlphabetConfetti } from "@/lib/confetti";
import { InteractiveWordBuilder } from "@/components/InteractiveWordBuilder";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, words: string[]) {
  let out = text;
  for (const w of words) {
    if (!w.trim()) continue;
    const r = new RegExp(escapeRegExp(w), "u");
    out = out.replace(r, `<mark class="bg-kidYellow-100 text-black px-1 rounded">${w}</mark>`);
  }
  return out;
}

const THEMES = {
  default: {
    label: "Clean White",
    bg: "", // Transparent to show Global SVG Background
    text: "text-slate-900", // Dark text for readability
    cardBg: "bg-white", // White card
    cardBorder: "border-slate-200", // Subtle border
    buttonPrimary: "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm", // Light buttons
    iconColor: "#475569" // Slate-600 icons
  },
  // Legacy themes preserved but hidden
  indigo: {
    label: "Midnight Indigo",
    bg: "bg-[#1e1b4b]",
    text: "text-white",
    cardBg: "bg-[#312e81]",
    cardBorder: "border-white/10",
    buttonPrimary: "bg-[#4338ca] text-white border-white/20 hover:bg-[#3730a3] shadow-md",
    iconColor: "white"
  },
  dark: {
    label: "Night Mode",
    bg: "bg-[#0f172a]",
    text: "text-slate-200",
    cardBg: "bg-[#1e293b]",
    cardBorder: "border-white/10",
    buttonPrimary: "bg-[#334155] text-white border-white/10 hover:bg-[#475569]",
    iconColor: "white"
  }
};

export function StoryReader({ story }: { story: StoryPack }) {
  const router = useRouter();
  const [isUpdatingVocab, setIsUpdatingVocab] = React.useState(false);

  async function handleClearVocabulary(e: React.MouseEvent) {
    e.stopPropagation(); // prevent accordion toggle
    if (!confirm("Are you sure you want to delete the vocabulary for this story? This cannot be undone.")) return;

    setIsUpdatingVocab(true);
    const res = await clearStoryVocabulary(story.storyId);
    if (res.success) {
      router.refresh();
    } else {
      alert("Failed to clear: " + res.message);
    }
    setIsUpdatingVocab(false);
  }

  async function handleGenerateVocabulary(e: React.MouseEvent) {
    e.stopPropagation();
    setIsUpdatingVocab(true);
    const res = await generateStoryVocabulary(story.storyId);
    if (res.success) {
      router.refresh();
    } else {
      alert("Failed to generate: " + res.message);
    }
    setIsUpdatingVocab(false);
  }

  async function handleEditPageText(pageIndex: number, currentText: string) {
    const newText = prompt("Edit the text for this page:", currentText);
    if (newText === null || newText === currentText) return;

    if (!newText.trim()) {
      alert("Text cannot be empty.");
      return;
    }

    setIsUpdatingVocab(true);
    const res = await updateStoryPageText(story.storyId, pageIndex, newText);
    if (res.success) {
      router.refresh();
      setSavedSnack("Page text updated! ✅");
    } else {
      alert("Failed to update text: " + res.message);
    }
    setIsUpdatingVocab(false);
  }
  const [themeMode, setThemeMode] = React.useState<keyof typeof THEMES>("default");
  const theme = THEMES[themeMode];

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openThemeMenu = Boolean(anchorEl);
  const handleThemeClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleThemeClose = (mode?: keyof typeof THEMES) => {
    if (mode) setThemeMode(mode);
    setAnchorEl(null);
  };
  const [likeState, setLikeState] = React.useState<null | "like" | "love">(null);
  const [completed, setCompleted] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [trySentence, setTrySentence] = React.useState("");
  const [savedSnack, setSavedSnack] = React.useState<string | null>(null);
  const [maxLevel, setMaxLevel] = React.useState(1);
  const [isVertical, setIsVertical] = React.useState(false);



  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const p = getActiveProfile();
    if (!p) return;
    setLikeState(p.likes?.[story.storyId] ?? null);
    setCompleted(p.completedStoryIds.includes(story.storyId));
    setMaxLevel(p.unlockedLevel ?? 1);
  }, [story.storyId]);

  // Fix Hydration Mismatch: Check TTS support only on client
  const [hasTTS, setHasTTS] = React.useState(false);
  React.useEffect(() => {
    setHasTTS(canSpeak());
  }, []);


  // Helper to get letters for current language
  function getLangChars() {
    // Default to ABC
    let chars = "ABC";
    const l = story.language;
    if (l === 'ta') chars = "அஆஇ";
    if (l === 'hi') chars = "अआइ";
    if (l === 'ja') chars = "あいう";
    if (l === 'zh') chars = "你好吗";
    if (l === 'ru') chars = "АБВ";
    return chars;
  }

  function saveSentence() {
    const raw = (trySentence || "").trim();
    if (!raw) {
      setSavedSnack("Type a sentence first 🙂");
      return;
    }
    // Keep it short for kids and to avoid storing lots of data.
    const text = raw.slice(0, 240);
    addWritingSample({
      storyId: story.storyId,
      language: story.language,
      level: story.level,
      text,
    });
    setSavedSnack("Saved to Parent View ✅");

    // Reward with language alphabets
    fireAlphabetConfetti(getLangChars());
  }

  const [communityRating, setCommunityRating] = React.useState(story.community?.rating ?? 5);
  const [hasRated, setHasRated] = React.useState(false);
  const [flagged, setFlagged] = React.useState(story.community?.isRevisionRequired ?? false);

  async function submitRating(val: number) {
    if (hasRated) return;
    try {
      const resp = await fetch('/api/stories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: story.storyId, rating: val })
      });
      if (resp.ok) {
        const data = await resp.json();
        setCommunityRating(data.story.community.rating);
        setHasRated(true);
        setSavedSnack("Thanks for rating! ⭐");
      }
    } catch (e) { console.error(e); }
  }

  async function submitRevisionFlag() {
    const note = prompt("Why is this story inappropriate or needs revision?");
    if (!note) return;
    try {
      const resp = await fetch('/api/stories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: story.storyId, isRevisionRequired: true, revisionNote: note })
      });
      if (resp.ok) {
        setFlagged(true);
        setSavedSnack("Flagged for revision. Admins will review. 🛡️");
      }
    } catch (e) { console.error(e); }
  }

  function handleLike(next: "like" | "love") {
    setLike(story.storyId, next);
    setLikeState(next);
  }

  function markCompletedNow() {
    markStoryCompleted(story.storyId);
    setCompleted(true);
    fireAlphabetConfetti(getLangChars());
  }

  function downloadAllImages() {
    story.pages.forEach((p, i) => {
      const src = p.imagePath || ((p as any).image?.data ? `data:image/png;base64,${(p as any).image.data}` : (p.imageSvgPath || ""));
      if (!src) return;

      const link = document.createElement("a");
      link.href = src;
      link.download = `story-${story.storyId}-page-${i + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    setSavedSnack("Downloading images... check your downloads!");
  }

  function handleScroll() {
    if (!scrollerRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = scrollerRef.current!;
      const max = el.scrollWidth - el.clientWidth;
      const pct = max <= 0 ? 100 : Math.round(Math.max(0, Math.min(100, (el.scrollLeft / max) * 100)));
      setProgress(pct);
    });
  }

  const ttsLang = React.useMemo(() => {
    switch (story.language) {
      case "ta": return "ta-IN";
      case "hi": return "hi-IN";
      case "te": return "te-IN";
      case "kn": return "kn-IN";
      case "ml": return "ml-IN";
      case "bn": return "bn-IN";
      case "gu": return "gu-IN";
      case "ja": return "ja-JP";
      case "zh": return "zh-CN";
      case "es": return "es-ES";
      case "fr": return "fr-FR";
      case "de": return "de-DE";
      case "ru": return "ru-RU";
      case "pt": return "pt-BR";
      default: return "en-US";
    }
  }, [story.language]);

  // Helper to determine accurate image source
  const getSmartImageSrc = (path?: string, data?: string) => {
    // Case 1: Path exists and looks like a URL (short)
    if (path && path.length < 500) {
      const sep = path.includes('?') ? '&' : '?';
      return `${path}`;
    }
    // Case 2: Path exists but looks like base64 (long)
    if (path && path.length >= 500) {
      // Check if it already has the prefix
      if (path.startsWith('data:')) return path;
      return `data:image/jpeg;base64,${path}`;
    }
    // Case 3: No path, look at data
    if (data) {
      // If data is short and starts with / or http, it's a URL
      if (data.length < 500 && (data.startsWith('/') || data.startsWith('http'))) {
        const sep = data.includes('?') ? '&' : '?';
        return `${data}`;
      }
      // Otherwise treat as base64
      if (data.startsWith('data:')) return data;
      return `data:image/jpeg;base64,${data}`;
    }
    return "";
  };


  // --- AUDIO SYNC & AUTO-PLAY ---
  React.useEffect(() => {
    // Only auto-play if supported and NOT already speaking
    if (!hasTTS || !scrollerRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Identify which page is visible
          const pageIndex = Number(entry.target.getAttribute('data-page-index'));
          if (!isNaN(pageIndex) && story.pages[pageIndex]) {
            const textToRead = story.pages[pageIndex].text_native;

            // SMALL DEBOUNCE to avoid chaotic reading while scrolling fast
            stopSpeaking();
            setTimeout(() => {
              if (entry.isIntersecting) { // Double check still looking
                speak(textToRead, ttsLang);
              }
            }, 800);
          }
        }
      });
    }, { threshold: 0.6 }); // Trigger when 60% visible

    // Attach observer to page elements
    const pages = scrollerRef.current.querySelectorAll('.story-page-slide');
    pages.forEach(p => observer.observe(p));

    return () => observer.disconnect();
  }, [hasTTS, story.pages, ttsLang]);

  // If vertical mode is active, render that component instead
  if (isVertical) {
    return (
      <>
        <VerticalStoryReader story={story} />
        {/* Floating Toggle to switch back */}
        <Box className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsVertical(false)}
            variant="contained"
            sx={{ borderRadius: 99, px: 3, fontWeight: 'bold' }}
            className="shadow-xl bg-black text-white"
            startIcon={<ViewAgendaIcon />}
          >
            Switch to Book View
          </Button>
        </Box>
      </>
    );
  }

  return (
    <main className={`min-h-screen transition-colors duration-500 ${theme.bg}`}>
      <Container maxWidth="lg" className="py-8 relative">
        <Box className="flex items-start justify-between mb-4 relative z-10">
          {/* AppHeader takes full width flex, so we need to position the theme icon absolutely or flex it better. 
              The user wants it "top right". Let's use absolute positioning relative to the Container. */}

          {/* THEME TOGGLE HIDDEN AS PER REQUEST - LOCKED TO INDIGO GLASS DEFAULT */}
          {/* 
          <Tooltip title="Change Theme">
            <IconButton
              onClick={handleThemeClick}
              className={`absolute right-0 top-2 shadow-md ${theme.buttonPrimary}`}
              aria-label="Change Theme"
              sx={{ zIndex: 50 }}
            >
              <LightModeIcon fontSize="medium" sx={{ color: themeMode === 'default' ? 'inherit' : theme.iconColor }} />
            </IconButton>
          </Tooltip> 
          */}
        </Box>

        {/* 
        <Menu
          anchorEl={anchorEl}
          open={openThemeMenu}
          onClose={() => handleThemeClose()}
          PaperProps={{ sx: { borderRadius: 4, minWidth: 200 } }}
        >
          <MenuItem onClick={() => handleThemeClose('default')} selected={themeMode === 'default'}>
            <ListItemIcon><LightModeIcon fontSize="small" /></ListItemIcon> Default
          </MenuItem>
          <MenuItem onClick={() => handleThemeClose('indigo')} selected={themeMode === 'indigo'}>
            <ListItemIcon><ColorLensIcon fontSize="small" sx={{ color: '#4338ca' }} /></ListItemIcon> Midnight Indigo
          </MenuItem>
          <MenuItem onClick={() => handleThemeClose('dark')} selected={themeMode === 'dark'}>
            <ListItemIcon><DarkModeIcon fontSize="small" /></ListItemIcon> Night Read
          </MenuItem>
        </Menu> 
        */}

        <Box className={`mt-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} px-4 py-3 shadow-soft transition-colors duration-300`}>
          <Box className="flex items-center justify-between gap-3">
            <Box className={`flex items-center gap-1 text-sm font-extrabold ${theme.text}`}>
              <SchoolIcon fontSize="small" />
              <span><b>LEVEL</b> {story.level}</span>
            </Box>

            <Box className="flex items-center gap-3">
              <LevelPath currentLevel={story.level} maxLevel={maxLevel} />
              <Typography className={`text-sm font-extrabold ${theme.text}`}>{progress}%</Typography>
            </Box>
          </Box>

          <LinearProgress variant="determinate" value={progress} aria-label="Story progress" sx={{ height: 8, borderRadius: 999, mt: 1, backgroundColor: "#f3f4f6", "& .MuiLinearProgress-bar": { borderRadius: 999 } }} />
        </Box>

        <Paper
          elevation={2}
          className="mt-4 mb-6 p-3 rounded-2xl flex items-center justify-between gap-4 flex-wrap bg-white border border-slate-200 sticky top-4 z-40"
        >
          {/* Left: Navigation Actions */}
          <Box className="flex items-center gap-3">
            <Button
              component={Link as any}
              href="/"
              startIcon={<ArrowBackIcon />}
              variant="contained"
              sx={{
                bgcolor: '#f1f5f9', // Slate-100
                color: '#0f172a',   // Slate-900
                fontWeight: 'bold',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#e2e8f0' }
              }}
            >
              Back
            </Button>

            {/* FLIPBOOK MODE HIDDEN AS PER REQUEST
            <Button
              component={Link as any}
              href={`/story/${story.storyId}/flip`}
              variant="contained"
              className="hidden md:flex"
              startIcon={<ViewAgendaIcon />}
              sx={{
                bgcolor: '#4338ca', // Indigo-700
                color: 'white',
                fontWeight: 'bold',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#3730a3' }
              }}
            >
              FlipBook Mode
            </Button>
            */}

            {/* SCROLL VIEW HIDDEN AS PER REQUEST 
            <Button
              onClick={() => setIsVertical(true)}
              variant="contained"
              className="hidden md:flex" 
              startIcon={<ViewAgendaIcon />}
              sx={{
                bgcolor: '#f1f5f9', // Slate-100
                color: '#0f172a',
                fontWeight: 'bold',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#e2e8f0' }
              }}
            >
              Switch to Scroll View
            </Button>
            */}
          </Box>

          {/* Right: Meta & Interactions */}
          <Box className="flex items-center gap-2 flex-wrap justify-center">
            {/* Language Chip */}
            <Chip
              icon={<TranslateIcon fontSize="small" style={{ color: '#475569' }} />}
              label={(story.language || 'en').toUpperCase()}
              component={Link}
              href={`/reference/${story.language}`}
              clickable
              className="font-bold"
              sx={{
                bgcolor: '#f1f5f9',
                color: '#334155',
                '& .MuiChip-label': { fontWeight: 800 }
              }}
              title="View Grammar & Reference"
            />

            {/* Safety Chip */}
            <Chip
              icon={story.review?.kidSafeApproved ? <VerifiedIcon fontSize="small" style={{ color: '#16a34a' }} /> : <WarningIcon fontSize="small" style={{ color: '#ea580c' }} />}
              label={story.review?.kidSafeApproved ? "Kid-safe verified" : "Needs review"}
              sx={{
                bgcolor: story.review?.kidSafeApproved ? '#dcfce7' : '#ffedd5', // Green-100 or Orange-100
                color: story.review?.kidSafeApproved ? '#166534' : '#9a3412',
                fontWeight: 'bold'
              }}
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: '#cbd5e1' }} />

            {/* Rating */}
            {story.community && (
              <Chip
                label={`⭐ ${communityRating}`}
                onClick={() => submitRating(5)}
                sx={{
                  bgcolor: '#fff7ed', // Orange-50
                  color: '#9a3412',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  border: '1px solid #ffedd5'
                }}
              />
            )}

            {/* Flag Revision */}
            <Tooltip title="Flag for revision">
              <IconButton
                size="small"
                onClick={submitRevisionFlag}
                sx={{
                  bgcolor: flagged ? '#fee2e2' : '#f8fafc',
                  color: flagged ? '#dc2626' : '#94a3b8',
                  border: '1px solid',
                  borderColor: flagged ? '#fecaca' : '#e2e8f0'
                }}
              >
                <WarningIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Likes */}
            <Box className="flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-100">
              <IconButton
                size="small"
                aria-label="Like"
                onClick={() => handleLike("like")}
                sx={{ color: likeState === "like" ? "#ca8a04" : "#cbd5e1" }}
              >
                <ThumbUpIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Love"
                onClick={() => handleLike("love")}
                sx={{ color: likeState === "love" ? "#db2777" : "#cbd5e1" }}
              >
                <FavoriteIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Download */}
            <Tooltip title="Download all images for debugging">
              <IconButton onClick={downloadAllImages} sx={{ color: '#94a3b8', '&:hover': { color: '#475569' } }}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        <Paper className={`mt-6 rounded-3xl border ${theme.cardBorder} ${theme.cardBg} shadow-soft overflow-hidden transition-colors duration-300`}>
          <Box className={`p-6 ${theme.cardBg}`}>
            <Typography variant="h5" fontWeight={950} className={theme.text}>{story.title_native}</Typography>
            {story.title_transliteration ? <Typography className={`${theme.text} opacity-70`}>{story.title_transliteration}</Typography> : null}
            <Typography className={`mt-2 ${theme.text} opacity-60`}>Flick horizontally like a book. Use 🔊 to listen.</Typography>
          </Box>

          <Divider sx={{ borderColor: themeMode === 'default' ? undefined : 'rgba(255,255,255,0.1)' }} />

          <div className={`${theme.cardBg} p-6`}>
            <div ref={scrollerRef} className="flex items-start gap-6 overflow-x-auto snap-x snap-mandatory pb-6" onScroll={handleScroll}>
              {(story.pages || []).map((p, i) => {
                const pageWords = (p.targetWordIds || []).map((id) => story.targetWords?.find((x) => x.id === id)?.native || "").filter(Boolean);
                const highlighted = highlightText(p.text_native, pageWords);

                return (
                  <div key={p.pageNumber || i} data-page-index={i} className="story-page-slide snap-center shrink-0 w-[820px] max-w-[88vw]" aria-label={`Page ${p.pageNumber}`}>
                    <div className="rounded-3xl border border-black/10 overflow-hidden">
                      <div className="relative w-full h-[420px] bg-slate-50 flex items-center justify-center overflow-hidden">
                        {/* VARIANT A: DIGITAL PUPPET (Composited) */}
                        {(p as any).puppet ? (
                          <>
                            {/* Stage Background */}
                            <div className="absolute inset-0 w-full h-full">
                              {(p as any).puppet.stagePath?.startsWith('text:') ? (
                                <div className="w-full h-full bg-amber-50 flex items-center justify-center text-amber-900/20 font-serif text-4xl select-none">
                                  {(p as any).puppet.stagePath.replace('text:', '')}
                                </div>
                              ) : (
                                <Image
                                  src={(p as any).puppet.stagePath}
                                  alt="Background"
                                  fill
                                  sizes="(max-width: 768px) 100vw, 820px"
                                  className="object-cover"
                                  priority={p.pageNumber === 1}
                                  unoptimized
                                />
                              )}
                            </div>

                            {/* Actor Sprite */}
                            <div
                              className="absolute transition-all duration-500 ease-in-out"
                              style={{
                                left: `${(p as any).puppet.layout.x}%`,
                                top: `${(p as any).puppet.layout.y}%`,
                                width: '45%',
                                transform: `translate(-50%, -90%) scale(${(p as any).puppet.layout.size || 1}) scaleX(${(p as any).puppet.layout.isFlipped ? -1 : 1})`,
                                mixBlendMode: (p as any).puppet.stagePath?.startsWith('text:') ? 'normal' : 'multiply',
                                filter: (p as any).puppet.stagePath?.startsWith('text:') ? 'none' : 'contrast(1.1) brightness(0.95)'
                              }}
                            >
                              {(p as any).puppet.actorPath?.startsWith('text:') ? (
                                <div className="bg-white/80 backdrop-blur-sm border-2 border-black/10 rounded-full px-4 py-2 text-center shadow-sm">
                                  <span className="text-lg font-bold text-gray-700">{(p as any).puppet.actorPath.replace('text:', '')}</span>
                                </div>
                              ) : (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={(p as any).puppet.actorPath}
                                  alt="Character"
                                  className="w-full h-auto drop-shadow-sm"
                                />
                              )}
                            </div>
                          </>
                        ) :
                          /* VARIANT B: STANDARD IMAGE */
                          (p.imagePath || (p as any).image?.data || p.imageSvgPath) ? (
                            <Image
                              src={getSmartImageSrc(p.imagePath, (p as any).image?.data) || (p.imageSvgPath || "")}
                              alt={p.imageAlt_descriptive || p.imageAlt || ""}
                              fill
                              sizes="(max-width: 768px) 100vw, 820px"
                              className="object-cover"
                              priority={p.pageNumber === 1}
                              unoptimized
                            />
                          ) : (
                            <div className="text-center p-8 opacity-40">
                              <SchoolIcon style={{ fontSize: 64, color: '#ccc' }} />
                              <Typography fontWeight={700} className="mt-2 text-slate-400">
                                Image coming soon
                              </Typography>
                              <Typography variant="caption" className="text-slate-400">
                                {p.imageCaption || "Illustration pending generation"}
                              </Typography>
                            </div>
                          )}
                      </div>



                      <div className={`p-5 ${theme.cardBg}`}>
                        <Box className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            {/* Note: highlighted html might have bg-kidYellow-100 which is light. In dark mode, text-black on yellow still works. */}
                            <Typography variant="h4" fontWeight={950} className={`leading-snug ${theme.text}`} component="div" dangerouslySetInnerHTML={{ __html: highlighted }} />
                            {p.text_transliteration ? <Typography className={`mt-2 text-xl ${theme.text} opacity-70`}>{p.text_transliteration}</Typography> : null}
                          </div>

                          <Box className="flex items-center gap-1">
                            <Tooltip title="Edit page text">
                              <IconButton
                                aria-label="Edit text"
                                onClick={() => handleEditPageText(i, p.text_native)}
                                className={`${theme.buttonPrimary}`}
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <EditIcon fontSize="small" htmlColor={themeMode === 'default' ? "#111" : "white"} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={hasTTS ? "Read aloud (device voice)" : "Read aloud (not supported)"}>
                              <span>
                                <IconButton aria-label="Read aloud" disabled={!hasTTS} onClick={async () => {
                                  // 1. Check for Pre-fetched Prosody (Eager Audio)
                                  let options;
                                  if (p.audio?.prosody) {
                                    options = p.audio.prosody;
                                  } else {
                                    // 1b. Lazy Fetch (Fallback for old stories or missing pre-fetch)
                                    const audioRes = await getOrGenerateAudioAction(story.language, story.level, p.text_native);

                                    // A. REAL AUDIO (Gemini)
                                    if (audioRes.status === 'success' && audioRes.audioData) {
                                      const audio = new Audio(`data:audio/mp3;base64,${audioRes.audioData}`);
                                      audio.play();
                                      return;
                                    }

                                    // B. PROSODY FALLBACK
                                    if (audioRes.status === 'success' && audioRes.prosody) {
                                      options = audioRes.prosody;
                                    }
                                  }

                                  // 2. Speak with Direction (Browser TTS)
                                  speak(p.text_native, ttsLang, options ? {
                                    rate: options.rate,
                                    pitch: options.pitch,
                                    volume: options.volume
                                  } : undefined);
                                }} className={`${theme.buttonPrimary}`}>
                                  <VolumeUpIcon htmlColor={themeMode === 'default' ? "#111" : "white"} />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Stop audio">
                              <IconButton aria-label="Stop reading" onClick={() => stopSpeaking()} className={`${theme.buttonPrimary}`}>
                                <StopCircleIcon htmlColor={themeMode === 'default' ? "#111" : "white"} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {(p.targetWordIds || []).map((id, uniqueIdx) => {
                            const w = story.targetWords?.find((x) => x.id === id);
                            if (!w) return null;
                            return (
                              <span key={`${id}-${uniqueIdx}`} className="inline-flex items-center rounded-full bg-kidOrange-100 px-2 py-0.5 text-[12px] font-extrabold text-[#111] border border-black/10">
                                {w.native}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Box className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Box className={`flex items-center gap-1 text-sm ${theme.text} opacity-60`}>
                <LightbulbIcon fontSize="small" />
                <span>Tip: use trackpad/shift+scroll to flick pages, or use arrow keys after hovering on the story card.</span>
              </Box>
              <Button variant="contained" color="primary" onClick={markCompletedNow} startIcon={<CheckCircleIcon />}>
                {completed ? "Completed (local)" : "Mark completed (local)"}
              </Button>
            </Box>
          </div>

          <Divider sx={{ borderColor: themeMode === 'default' ? undefined : 'rgba(255,255,255,0.1)' }} />

          <div className={`${theme.cardBg} p-6`}>
            <Accordion
              defaultExpanded={false}
              className={`rounded-2xl border ${theme.cardBorder} shadow-none`}
              sx={{ bgcolor: themeMode === 'default' ? 'white' : '#1e1b4b' }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: theme.iconColor }} />} aria-controls="word-builder" id="word-builder-header">
                <Box className="flex items-center gap-2">
                  <ExtensionIcon sx={{ color: theme.iconColor }} />
                  <Typography fontWeight={950} className={`${theme.text}`}>Word Builder ({story.targetWords?.length || 0})</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {isUpdatingVocab && <LinearProgress className="mb-4" />}

                {story.targetWords && story.targetWords.length > 0 ? (
                  <>
                    <Box className="flex items-center justify-between mb-3">
                      <Typography sx={{ color: themeMode === 'default' ? 'text.secondary' : 'rgba(255,255,255,0.7)' }}>
                        Word meanings:
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={handleClearVocabulary}
                        disabled={isUpdatingVocab}
                        startIcon={<DeleteIcon />}
                        className="opacity-60 hover:opacity-100"
                      >
                        Reset Vocabulary
                      </Button>
                    </Box>

                    <InteractiveWordBuilder
                      words={story.targetWords || []}
                      language={story.language}
                      theme={theme}
                    />
                  </>
                ) : (
                  <Box className="flex flex-col items-center justify-center p-8 gap-4 text-center">
                    <Typography className={`${theme.text} opacity-70`}>
                      No vocabulary words found for this story.
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleGenerateVocabulary}
                      disabled={isUpdatingVocab}
                      startIcon={<AutoAwesomeIcon />}
                      className="rounded-full font-bold px-6"
                    >
                      {isUpdatingVocab ? "Generating..." : "Generate Vocabulary"}
                    </Button>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>

            {story.exercises && story.exercises.length > 0 && (
              <>
                <Typography className={`mt-6 ${theme.text}`} variant="h6" fontWeight={950}>Quick Check</Typography>
                <div className={`mt-3 rounded-2xl border ${theme.cardBorder} p-4 ${themeMode === 'default' ? 'bg-kidPurple-50' : 'bg-white/5'}`}>
                  <Typography fontWeight={900} className={`${theme.text}`}>{(story.exercises?.[0] as any)?.prompt_native ?? "Exercise"}</Typography>
                  <Typography className="mt-1" sx={{ color: themeMode === 'default' ? 'text.secondary' : 'rgba(255,255,255,0.6)' }}>(Stub exercise — wired from local JSON)</Typography>
                </div>
              </>
            )}
          </div>
        </Paper>

      </Container>
      <AppFooter />
    </main >
  );
}
