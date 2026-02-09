export type LikeValue = "like" | "love";
export type LanguageCode = "ta" | "hi" | "en" | "ja" | "zh" | "es" | "te" | "kn" | "ml" | "bn" | "gu" | "fr" | "de" | "ru" | "pt";

export type WritingSample = {
  id: string;
  storyId: string;
  language: LanguageCode;
  level: number;
  text: string;
  createdAt: string; // ISO
};

export type LocalProfile = {
  id: string;
  penName: string;
  avatarId: string;

  unlockedLevel: number;

  primaryLanguage: LanguageCode;
  preferredTopics: string[];

  completedStoryIds: string[];
  completedWritingChallengeIds: string[];
  learnedWordIds: string[];

  writingSamples: WritingSample[];

  likes: Record<string, LikeValue>;

  createdAt: number;
  parentPinHash?: string;
  immersiveBackground?: boolean;

  // Adaptive Learning
  struggleDictionary: Record<string, WordHealth>;
};

export type WordHealth = {
  id: string;      // "w_rain"
  word: string;    // "mazhai"
  meaning: string; // "rain"
  attempts: number;
  mistakes: number;
  lastMistakeAt: number;
  health: number;  // 0-100 (0=New, 100=Mastered)
};

export type ProfileState = {
  activeProfileId?: string;
  profiles: LocalProfile[];
};

const KEY = "mts_profiles_v2";
export const GN_PROFILE_CHANGED = "gn_profile_changed";

function safeParse(raw: string | null): ProfileState | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<ProfileState>;
    return {
      activeProfileId: typeof p.activeProfileId === "string" ? p.activeProfileId : undefined,
      profiles: Array.isArray(p.profiles) ? (p.profiles as any) : [],
    };
  } catch {
    return null;
  }
}

function normalizeLang(x: any): LanguageCode {
  const v = String(x || "").toLowerCase();
  const allowed: LanguageCode[] = ["ta", "hi", "en", "ja", "zh", "es", "te", "kn", "ml", "bn", "gu", "fr", "de", "ru", "pt"];
  if (allowed.includes(v as LanguageCode)) return v as LanguageCode;
  return "ta";
}

export function loadState(): ProfileState {
  if (typeof window === "undefined") return { profiles: [] };
  const parsed = safeParse(window.localStorage.getItem(KEY));

  if (!parsed) {
    const old = safeParse(window.localStorage.getItem("mts_profiles_v1"));
    if (!old) return { profiles: [] };

    const migrated: ProfileState = {
      activeProfileId: old.activeProfileId,
      profiles: (old.profiles || [])
        .map((x: any) => ({
          id: String(x.id || ""),
          penName: String(x.penName || "Guest"),
          avatarId: String(x.avatarId || "koala"),
          unlockedLevel: typeof x.unlockedLevel === "number" ? x.unlockedLevel : 1,
          primaryLanguage: "ta" as LanguageCode,
          preferredTopics: [],
          completedStoryIds: Array.isArray(x.completedStoryIds) ? x.completedStoryIds : [],
          completedWritingChallengeIds: Array.isArray(x.completedWritingChallengeIds) ? x.completedWritingChallengeIds : [],
          writingSamples: Array.isArray(x.writingSamples) ? (x.writingSamples.filter(Boolean) as any) : [],
          likes: x.likes && typeof x.likes === "object" ? x.likes : {},
          learnedWordIds: [],
          createdAt: typeof x.createdAt === "number" ? x.createdAt : Date.now(),
          parentPinHash: typeof x.parentPinHash === "string" ? x.parentPinHash : undefined,
          struggleDictionary: {},
        }))
        .filter((p) => !!p.id),
    };
    saveState(migrated);
    return migrated;
  }

  return {
    activeProfileId: parsed.activeProfileId,
    profiles: (parsed.profiles || [])
      .map((x: any) => ({
        id: String(x.id || ""),
        penName: String(x.penName || "Guest"),
        avatarId: String(x.avatarId || "koala"),
        unlockedLevel: typeof x.unlockedLevel === "number" ? x.unlockedLevel : 2, // HACKATHON DEMO: Default to Level 2 unlocked
        primaryLanguage: normalizeLang(x.primaryLanguage),
        preferredTopics: Array.isArray(x.preferredTopics) ? x.preferredTopics.map(String) : [],
        completedStoryIds: Array.isArray(x.completedStoryIds) ? x.completedStoryIds : [],
        completedWritingChallengeIds: Array.isArray(x.completedWritingChallengeIds) ? x.completedWritingChallengeIds : [],
        writingSamples: Array.isArray(x.writingSamples) ? x.writingSamples.filter(Boolean) as any : [],
        learnedWordIds: Array.isArray(x.learnedWordIds) ? x.learnedWordIds.map(String) : [],
        likes: x.likes && typeof x.likes === "object" ? x.likes : {},
        createdAt: typeof x.createdAt === "number" ? x.createdAt : Date.now(),
        parentPinHash: typeof x.parentPinHash === "string" ? x.parentPinHash : undefined,
        immersiveBackground: typeof x.immersiveBackground === "boolean" ? x.immersiveBackground : false,
        struggleDictionary: x.struggleDictionary || {}, // Default to empty
      }))
      .filter((p: LocalProfile) => !!p.id),
  };
}

export function saveState(s: ProfileState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  // Notify other components (like Header) to refresh
  window.dispatchEvent(new CustomEvent(GN_PROFILE_CHANGED));
}

export function getActiveProfile(): LocalProfile | null {
  const s = loadState();
  if (!s.activeProfileId) return null;
  return s.profiles.find((p) => p.id === s.activeProfileId) || null;
}

export function setActiveProfile(id: string) {
  const s = loadState();
  if (!s.profiles.some((p) => p.id === id)) return;
  s.activeProfileId = id;
  saveState(s);
}

export function upsertProfile(p: LocalProfile) {
  const s = loadState();
  const idx = s.profiles.findIndex((x) => x.id === p.id);
  if (idx >= 0) s.profiles[idx] = p;
  else s.profiles.push(p);
  if (!s.activeProfileId) s.activeProfileId = p.id;
  saveState(s);
}

export function deleteProfile(id: string) {
  const s = loadState();
  s.profiles = s.profiles.filter((p) => p.id !== id);
  if (s.activeProfileId === id) s.activeProfileId = s.profiles[0]?.id;
  saveState(s);
}

export function resetAllProfiles() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.localStorage.removeItem("mts_profiles_v1");
}

export function markStoryCompleted(storyId: string) {
  const p = getActiveProfile();
  if (!p) return;
  if (!p.completedStoryIds.includes(storyId)) p.completedStoryIds = [...p.completedStoryIds, storyId];
  upsertProfile(p);
}


export function addWritingSample(sample: Omit<WritingSample, "id" | "createdAt"> & { id?: string; createdAt?: string }) {
  const p = getActiveProfile();
  if (!p) return;
  const id =
    sample.id ||
    (typeof crypto !== "undefined" && "randomUUID" in crypto ? (crypto as any).randomUUID() : `ws_${Math.random().toString(16).slice(2)}${Date.now()}`);
  const createdAt = sample.createdAt || new Date().toISOString();
  const next: WritingSample = {
    id,
    storyId: sample.storyId,
    language: sample.language,
    level: sample.level,
    text: sample.text,
    createdAt,
  };
  p.writingSamples = [...(p.writingSamples || []), next];
  upsertProfile(p);
}

export function deleteWritingSample(id: string) {
  const p = getActiveProfile();
  if (!p) return;
  p.writingSamples = (p.writingSamples || []).filter((x) => x.id !== id);
  upsertProfile(p);
}

export function setLike(storyId: string, v: LikeValue) {
  const p = getActiveProfile();
  if (!p) return;
  p.likes = { ...(p.likes || {}), [storyId]: v };
  upsertProfile(p);
}

export function completeWritingChallenge(challengeId: string) {
  const p = getActiveProfile();
  if (!p) return;
  if (!p.completedWritingChallengeIds.includes(challengeId)) {
    p.completedWritingChallengeIds = [...p.completedWritingChallengeIds, challengeId];
  }
  p.unlockedLevel = Math.min(8, (p.unlockedLevel || 1) + 1);
  upsertProfile(p);
}

export function setProfilePreferences(opts: { primaryLanguage?: LanguageCode; preferredTopics?: string[]; immersiveBackground?: boolean }) {
  const p = getActiveProfile();
  if (!p) return;
  if (opts.primaryLanguage) p.primaryLanguage = opts.primaryLanguage;
  if (opts.preferredTopics) p.preferredTopics = opts.preferredTopics;
  if (typeof opts.immersiveBackground === "boolean") p.immersiveBackground = opts.immersiveBackground;
  upsertProfile(p);
}

export function markWordLearned(wordId: string) {
  const p = getActiveProfile();
  if (!p) return;
  if (!p.learnedWordIds) p.learnedWordIds = [];
  if (!p.learnedWordIds.includes(wordId)) {
    p.learnedWordIds = [...p.learnedWordIds, wordId];
    upsertProfile(p);
  }
}

export function trackWordResult(wordId: string, word: string, meaning: string, success: boolean) {
  const p = getActiveProfile();
  if (!p) return;

  if (!p.struggleDictionary) p.struggleDictionary = {};

  const entry = p.struggleDictionary[wordId] || {
    id: wordId,
    word,
    meaning,
    attempts: 0,
    mistakes: 0,
    lastMistakeAt: 0,
    health: 0
  };

  entry.attempts += 1;
  if (!success) {
    entry.mistakes += 1;
    entry.lastMistakeAt = Date.now();
    // Drop health drastically on mistake
    entry.health = Math.max(0, entry.health - 30);
  } else {
    // Increment health on success
    entry.health = Math.min(100, entry.health + 10);
  }

  p.struggleDictionary[wordId] = entry;
  upsertProfile(p);
}

export function getCriticalWords(limit = 3): WordHealth[] {
  const p = getActiveProfile();
  if (!p || !p.struggleDictionary) return [];

  return Object.values(p.struggleDictionary)
    .filter(w => w.health < 50 && w.mistakes > 0)
    .sort((a, b) => b.lastMistakeAt - a.lastMistakeAt) // Most recent struggles first
    .slice(0, limit);
}

export function generateSuggestedPenNames(count = 8): string[] {
  const animals = ["Koala", "Panda", "Dolphin", "Tiger", "Parrot", "Kangaroo", "Fox", "Otter", "Turtle", "Lion"];
  const colors = ["Purple", "Sunny", "Orange", "Golden", "Blue", "Green", "Rainbow", "Pink", "Silver"];
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = animals[Math.floor(Math.random() * animals.length)];
    const c = colors[Math.floor(Math.random() * colors.length)];
    let n;
    do {
      n = Math.floor(10 + Math.random() * 90);
    } while (n === 69);
    out.push(`${c} ${a} ${n}`);
  }
  return out;
}

export function languageLabel(l: LanguageCode) {
  switch (l) {
    case "ta": return "Tamil";
    case "hi": return "Hindi";
    case "en": return "English";
    case "ja": return "Japanese";
    case "zh": return "Chinese";
    case "es": return "Spanish";
    case "te": return "Telugu";
    case "kn": return "Kannada";
    case "ml": return "Malayalam";
    case "bn": return "Bengali";
    case "gu": return "Gujarati";
    case "fr": return "French";
    case "de": return "German";
    case "ru": return "Russian";
    case "pt": return "Portuguese";
    default: return "Unknown";
  }
}
