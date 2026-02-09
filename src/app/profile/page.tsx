"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AppFooter } from "@/components/AppFooter";
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FaceIcon from "@mui/icons-material/Face";
import SchoolIcon from "@mui/icons-material/School";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GroupIcon from "@mui/icons-material/Group";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  loadState,
  setActiveProfile,
  upsertProfile,
  deleteProfile,
  resetAllProfiles,
  generateSuggestedPenNames,
  type LocalProfile,
  type ProfileState,
  type LanguageCode,
  languageLabel,
  setProfilePreferences,
} from "@/lib/profileStorage";
import { topicCategories, topicsFromStories } from "@/lib/stubData";

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `p_${Math.random().toString(16).slice(2)}${Date.now()}`;
}

async function sha256(input: string) {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const avatarOptions = [
  { id: "koala", emoji: "🐨", label: "Koala" },
  { id: "panda", emoji: "🐼", label: "Panda" },
  { id: "tiger", emoji: "🐯", label: "Tiger" },
  { id: "fox", emoji: "🦊", label: "Fox" },
  { id: "dolphin", emoji: "🐬", label: "Dolphin" },
  { id: "parrot", emoji: "🦜", label: "Parrot" },
];

export default function ProfilePage() {
  const router = useRouter();
  // Hydration-safe state initialization
  const [state, setState] = React.useState<ProfileState>({ profiles: [] });
  const [suggested, setSuggested] = React.useState<string[]>([]);
  const [penName, setPenName] = React.useState("");
  const [avatarId, setAvatarId] = React.useState("koala");
  const [pin, setPin] = React.useState("");
  const [primaryLanguage, setPrimaryLanguage] = React.useState<LanguageCode>("ta");
  const [preferredTopics, setPreferredTopics] = React.useState<string[]>([]);
  const [immersiveBackground, setImmersiveBackground] = React.useState(false);
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);

  React.useEffect(() => {
    // Client-side only initialization
    setState(loadState());
    setSuggested(generateSuggestedPenNames(10));
  }, []);

  function refresh() {
    setState(loadState());
  }

  async function createProfile(name: string) {
    const clean = name.trim();
    if (!clean) return;

    const p: LocalProfile = {
      id: uid(),
      penName: clean,
      avatarId,
      unlockedLevel: 2,
      primaryLanguage,
      preferredTopics,
      immersiveBackground,
      completedStoryIds: [],
      completedWritingChallengeIds: [],
      writingSamples: [],
      likes: {},
      learnedWordIds: [],
      struggleDictionary: {},
      createdAt: Date.now(),
      parentPinHash: pin.trim() ? await sha256(pin.trim()) : undefined,
    };

    upsertProfile(p);
    setActiveProfile(p.id);
    refresh();
    router.push("/");
  }

  function pickExisting(id: string) {
    setActiveProfile(id);
    refresh();
    router.push("/");
  }

  function remove(id: string) {
    deleteProfile(id);
    refresh();
  }

  function resetAll() {
    resetAllProfiles();
    refresh();
    setSuggested(generateSuggestedPenNames(10));
  }

  return (
    <main className="min-h-screen flex flex-col">

      <Container maxWidth="md" className="py-10 grid gap-6 flex-grow">

        {/* HEADER */}
        <Box className="text-center mb-4">
          <Typography variant="h4" fontWeight={950} className="text-[#fff]">
            Create a Profile
          </Typography>
          <Typography color="text.secondary" className="text-lg">
            Private, local-only, and safe for kids.
          </Typography>
        </Box>

        {/* 1. IDENTITY CARD */}
        <Paper className="rounded-3xl border border-black/10 shadow-soft overflow-hidden bg-white">
          <Box className="p-4 bg-kidYellow-50 border-b border-black/5 flex items-center gap-3">
            <FaceIcon sx={{ fontSize: 32, color: "#111", opacity: 0.8 }} />
            <Typography variant="h6" fontWeight={950} className="text-[#111]">
              Who is this for?
            </Typography>
          </Box>
          <Box className="p-6">
            <Box className="mb-6">
              <Typography className="text-xl font-black text-[#111]">Choose an avatar</Typography>
            </Box>
            <Box className="flex flex-wrap gap-3 mb-10">
              {avatarOptions.map((a) => (
                <Button
                  key={a.id}
                  onClick={() => setAvatarId(a.id)}
                  variant={avatarId === a.id ? "contained" : "outlined"}
                  color={avatarId === a.id ? "primary" : "inherit"}
                  className={avatarId === a.id ? "rounded-2xl shadow-md transform scale-105 transition-all" : "rounded-2xl border-black/20 text-black opacity-70 hover:opacity-100 bg-white"}
                  sx={{ minWidth: 60, minHeight: 60, fontSize: '1.5rem' }}
                >
                  {a.emoji}
                </Button>
              ))}
            </Box>

            <Box className="mb-2">
              <Typography className="text-xl font-black text-[#111]">Pick a pen name</Typography>
            </Box>
            <Typography variant="body1" className="text-gray-500 mb-6 block">
              Tap a suggestion or type your own.
            </Typography>

            <Box className="flex flex-wrap gap-2 mb-4">
              {suggested.map((n) => (
                <Button
                  key={n}
                  variant="outlined"
                  className="border-black/20 text-black rounded-2xl bg-white/50 hover:bg-white px-4 py-2"
                  onClick={() => createProfile(n)}
                >
                  {n}
                </Button>
              ))}
            </Box>
            <Box className="flex justify-end mb-8">
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSuggested(generateSuggestedPenNames(10))}
                startIcon={<RefreshIcon />}
                className="rounded-xl border-black/20 text-black/70 hover:border-black/40 hover:text-black"
              >
                Refresh suggestions
              </Button>
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mt-6">
              <TextField
                size="medium"
                label="Type a custom name"
                value={penName}
                onChange={(e) => setPenName(e.target.value)}
                fullWidth
                InputProps={{ className: "rounded-xl" }}
              />
              <TextField
                size="medium"
                label="Set a 6-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                helperText="Required to access Parent Dashboard."
                fullWidth
                InputProps={{ className: "rounded-xl" }}
              />
            </Box>
            <Box className="flex justify-end mt-4">
              <Button
                variant="contained"
                color="primary"
                className="rounded-xl h-14 px-8 font-bold shadow-md text-lg"
                startIcon={<CheckCircleIcon />}
                onClick={() => createProfile(penName)}
                disabled={!penName.trim()}
              >
                Create
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* 2. LEARNING PREFERENCES CARD */}
        <Paper className="rounded-3xl border border-black/10 shadow-soft overflow-hidden bg-white">
          <Box className="p-4 bg-kidBlue-50 border-b border-black/5 flex items-center gap-3">
            <SchoolIcon sx={{ fontSize: 32, color: "#111", opacity: 0.8 }} />
            <Typography variant="h6" fontWeight={950} className="text-[#111]">
              Learning Preferences
            </Typography>
          </Box>
          <Box className="p-8">
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Box>
                <Box className="mb-6">
                  <Typography className="text-xl font-black text-[#111]">Primary Language</Typography>
                </Box>
                <FormControl size="medium" fullWidth>
                  <Select
                    value={primaryLanguage}
                    onChange={(e) => setPrimaryLanguage(e.target.value as LanguageCode)}
                    className="rounded-xl"
                  >
                    <MenuItem value="ta">Tamil</MenuItem>
                    <MenuItem value="hi">Hindi</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="ja">Japanese</MenuItem>
                    <MenuItem value="zh">Chinese</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <Box className="mb-6">
                  <Typography className="text-xl font-black text-[#111]">Favorite Topics</Typography>
                </Box>
                <Box className="flex flex-col gap-4">
                  {Object.entries(topicCategories).map(([category, topics]) => (
                    <Box key={category}>
                      <Typography variant="caption" className="font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                        {category}
                      </Typography>
                      <Box className="flex flex-wrap gap-2">
                        {topics.map((t) => {
                          const active = preferredTopics.includes(t);
                          return (
                            <Chip
                              key={t}
                              label={t}
                              onClick={() => setPreferredTopics((prev) => (active ? prev.filter((x) => x !== t) : [...prev, t]))}
                              className={active ? "bg-kidYellow-100 text-black border border-black/10 font-bold px-2 py-1" : "bg-white text-black border border-black/20 px-2 py-1"}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* 3. SETTINGS & SECURITY CARD */}
        <Paper className="rounded-3xl border border-black/10 shadow-soft overflow-hidden bg-white">
          <Box className="p-4 bg-gray-50 border-b border-black/5 flex items-center gap-3">
            <AdminPanelSettingsIcon sx={{ fontSize: 32, color: "#111", opacity: 0.8 }} />
            <Typography variant="h6" fontWeight={950} className="text-[#111]">
              Parent Settings
            </Typography>
          </Box>
          <Box className="p-8">
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Box>
                <Box className="flex items-center gap-3 mb-6">
                  <VisibilityIcon className="text-gray-400" />
                  <Typography className="text-xl font-black text-[#111]">Visual Effects</Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={immersiveBackground}
                      onChange={(e) => {
                        setImmersiveBackground(e.target.checked);
                        setProfilePreferences({ immersiveBackground: e.target.checked });
                      }}
                      color="primary"
                    />
                  }
                  label={<span className="text-lg font-bold text-[#111]">Enable Immersive Backgrounds</span>}
                />
                <Typography variant="body2" display="block" className="text-gray-500 ml-3 mt-2">
                  Show animated rain/effects while reading. Turn off for fewer distractions.
                </Typography>
              </Box>
            </Box>

            <Box className="mt-8 pt-4 border-t border-dashed border-gray-200">
              <Button
                size="small"
                color="error"
                onClick={() => setResetDialogOpen(true)}
                startIcon={<DeleteIcon />}
                className="opacity-70 hover:opacity-100"
              >
                Reset all local data
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* 4. EXISTING PROFILES CARD */}
        {state.profiles.length > 0 && (
          <Paper className="rounded-3xl border border-black/10 shadow-soft overflow-hidden bg-white">
            <Box className="p-4 bg-white border-b border-black/5 flex items-center gap-3">
              <GroupIcon sx={{ fontSize: 32, color: "#111", opacity: 0.8 }} />
              <Typography variant="h6" fontWeight={950} className="text-[#111]">
                Existing Profiles
              </Typography>
            </Box>
            <Box className="p-6 flex flex-col gap-3">
              {state.profiles.map((p) => (
                <Box key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 p-3 bg-white hover:bg-gray-50 transition-colors">
                  <Box className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl border border-black/5">
                      {avatarOptions.find((a) => a.id === p.avatarId)?.emoji ?? "🧒"}
                    </div>
                    <Box>
                      <div className="font-extrabold text-[#111] text-lg leading-tight">{p.penName}</div>
                      <div className="text-xs text-gray-500 font-medium mt-0.5">
                        Level {p.unlockedLevel} · {languageLabel(p.primaryLanguage)}
                      </div>
                    </Box>
                  </Box>

                  <Box className="flex gap-2 items-center">
                    <Button variant="contained" color="primary" className="rounded-xl font-bold shadow-none" onClick={() => pickExisting(p.id)}>
                      Select
                    </Button>
                    <IconButton size="small" aria-label="Delete profile" onClick={() => remove(p.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {/* DIALOGS */}
        <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
          <DialogTitle className="font-extrabold text-[#111]">Reset Local Data?</DialogTitle>
          <DialogContent>
            <DialogContentText className="text-black">
              If you click proceed, <b>all progress made on levels will be lost</b>. This action cannot be undone.
              <br /><br />
              Do you want to proceed?
            </DialogContentText>
          </DialogContent>
          <DialogActions className="p-4">
            <Button onClick={() => setResetDialogOpen(false)} className="text-black font-bold">
              Cancel
            </Button>
            <Button
              onClick={() => { resetAll(); setResetDialogOpen(false); }}
              color="error"
              variant="contained"
              className="rounded-xl font-bold"
              autoFocus
            >
              Proceed
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
      <AppFooter />
    </main>
  );
}
