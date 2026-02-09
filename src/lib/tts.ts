// tts.ts - Advanced Text-to-Speech with Sentence Pacing
let _currentUtterance: SpeechSynthesisUtterance | null = null;
let _stopFlag = false;

export function canSpeak(): boolean {
  if (typeof window === "undefined") return false;
  return typeof window.speechSynthesis !== "undefined";
}

// Enhanced speak options
export interface TTSOptions {
  pitch?: number;
  rate?: number;
  volume?: number;
}

// Helper to find best voice
function getVoiceForLang(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  // 1. Exact Match
  let voice = voices.find(v => v.lang === lang);
  // 2. Loose Match (e.g. 'zh' matches 'zh-CN')
  if (!voice) voice = voices.find(v => v.lang.startsWith(lang));
  // 3. Default (first)
  return voice || null;
}

// Recursive helper to speak sentences with natural pauses
function speakSentences(sentences: string[], index: number, lang: string, options: TTSOptions, onEnd?: () => void) {
  if (_stopFlag || index >= sentences.length) {
    if (onEnd) onEnd();
    return;
  }

  const chunk = sentences[index].trim();
  if (!chunk) {
    speakSentences(sentences, index + 1, lang, options, onEnd);
    return;
  }

  const u = new SpeechSynthesisUtterance(chunk);
  if (lang) {
    u.lang = lang;
    const explicitVoice = getVoiceForLang(lang);
    if (explicitVoice) {
      u.voice = explicitVoice;
      console.log(`[TTS] Selected Voice: ${explicitVoice.name} (${explicitVoice.lang})`);
    } else {
      console.warn(`[TTS] No voice found for ${lang}. Using default.`);
    }
  }

  // Apply Prosody
  u.rate = options.rate ?? 0.9;
  u.pitch = options.pitch ?? 1.0;
  u.volume = options.volume ?? 1.0;

  _currentUtterance = u;

  u.onend = () => {
    // 400ms natural pause (reduced from 600ms for flow)
    setTimeout(() => {
      if (!_stopFlag) {
        speakSentences(sentences, index + 1, lang, options, onEnd);
      }
    }, 400);
  };

  u.onerror = (e) => {
    // Avoid spamming checks if it's just a cancel/interruption
    if (e.error === 'interrupted' || e.error === 'canceled') return;
    console.warn("TTS Warning:", e.error);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(u);
}

export function speak(text: string, lang?: string, options: TTSOptions | number = {}) {
  if (typeof window === "undefined") return;
  if (!text) return;
  if (!("speechSynthesis" in window)) return;

  // Backwards compatibility for old signature: speak(text, lang, rate)
  const finalOptions: TTSOptions = typeof options === 'number' ? { rate: options } : options;

  // Cancel any current speech
  stopSpeaking();
  _stopFlag = false;

  // Split logic: . ? ! and Hindi/Tamil Danda (pipe |)
  // Keeps the delimiter attached to the sentence
  // Enhanced Regex: Supports Western (. ! ?) and CJK/Hindi (。 ？ ！ ।)
  const regex = /[^.!?।。？！]+[.!?।。？！]+/g;
  const match = text.match(regex);
  const sentences = match || [text];

  console.log(`[TTS] Speaking (${lang}): "${text.substring(0, 20)}..."`, { options, chunks: sentences.length });

  speakSentences(sentences, 0, lang || 'en-US', finalOptions);
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  _stopFlag = true;
  window.speechSynthesis.cancel();
}
