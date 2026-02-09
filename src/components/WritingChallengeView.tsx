"use client";

import * as React from "react";
import Link from "next/link";
import { Container, Paper, Box, Typography, Button, Chip, TextField, Divider } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RuleIcon from "@mui/icons-material/Rule";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import FlagIcon from "@mui/icons-material/Flag";
import { writingChallengeStub } from "@/lib/stubData";
import { getActiveProfile, completeWritingChallenge } from "@/lib/profileStorage";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";

export function WritingChallengeView() {
  const [text, setText] = React.useState("");
  const [completedCount, setCompletedCount] = React.useState(0);
  const [unlockedLevel, setUnlockedLevel] = React.useState(1);
  const [challengeDone, setChallengeDone] = React.useState(false);

  React.useEffect(() => {
    const p = getActiveProfile();
    if (!p) return;
    setCompletedCount(p.completedStoryIds.length);
    setUnlockedLevel(p.unlockedLevel ?? 1);
    setChallengeDone(p.completedWritingChallengeIds.includes(writingChallengeStub.challengeId));
  }, []);

  const unlocked = completedCount >= 3;

  function finishChallenge() {
    completeWritingChallenge(writingChallengeStub.challengeId);
    const p = getActiveProfile();
    setUnlockedLevel(p?.unlockedLevel ?? unlockedLevel);
    setChallengeDone(true);
    alert("Nice! Challenge saved locally and next level unlocked (demo).");
  }

  return (
    <main className="min-h-screen">
      <Container maxWidth="md" className="py-8">
        <AppHeader />

        <Box className="mt-6 flex items-center justify-between">
          <Button component={Link as any} href="/" startIcon={<ArrowBackIcon />} variant="outlined" className="border-black/30 text-black">
            Back
          </Button>
          <Box className="flex gap-2 flex-wrap justify-end">
            <Chip label={`Stories completed: ${completedCount}/3`} className="bg-white text-black border border-black/10 font-bold" />
            <Chip label={`Unlocked up to Level ${unlockedLevel}`} className="bg-white text-black border border-black/10 font-bold" />
          </Box>
        </Box>

        <Paper className="mt-6 rounded-3xl border border-black/10 shadow-soft overflow-hidden">
          <Box className="p-6 bg-white">
            <Typography variant="h5" fontWeight={950}>Writing Challenge</Typography>
            <Typography className="mt-2" color="text.secondary">
              After 3 stories, practice writing. Saved locally to this pen-name profile.
            </Typography>
          </Box>
          <Divider />

          <Box className="p-6 bg-white">
            {!unlocked ? (
              <Box className="rounded-2xl bg-kidYellow-50 border border-black/10 p-4">
                <Typography fontWeight={900}>Locked</Typography>
                <Typography className="mt-1" color="text.secondary">Read and mark 3 stories as completed to unlock writing.</Typography>
              </Box>
            ) : (
              <>
                <Typography fontWeight={950}>{writingChallengeStub.prompt_native}</Typography>

                <Box className="mt-4 flex flex-wrap gap-2">
                  {writingChallengeStub.mustUseWords.map((w) => (
                    <Chip key={w.native} label={`${w.native} (${w.meaning_en})`} className="bg-kidOrange-100 text-black border border-black/10 font-bold" />
                  ))}
                </Box>

                <TextField className="mt-4" label="Write here" fullWidth multiline minRows={4} value={text} onChange={(e) => setText(e.target.value)} />

                <Box className="mt-5 rounded-2xl border border-black/10 p-4 bg-kidPurple-50">
                  <Box className="flex items-center gap-2 mb-2">
                    <RuleIcon sx={{ color: '#111' }} />
                    <Typography fontWeight={950}>Rubric (stub)</Typography>
                  </Box>
                  <ul className="list-disc ml-6 text-[#111] font-semibold">
                    {writingChallengeStub.rubric.map((r) => (
                      <li key={r.id}>{r.description_native} (max {r.maxScore})</li>
                    ))}
                  </ul>
                  <Typography className="mt-2 text-sm text-[#111] opacity-80">
                    Expected sentences: {writingChallengeStub.expectedSentences.min}–{writingChallengeStub.expectedSentences.max}
                  </Typography>
                </Box>

                <Box className="mt-3 rounded-2xl border border-black/10 p-3 bg-kidYellow-50">
                  <Typography className="text-sm font-bold text-[#111]">
                    {challengeDone ? "✅ Challenge completed for this profile" : "Complete to unlock next level (demo)."}
                  </Typography>
                </Box>
              </>
            )}

            <Box className="mt-6 flex flex-wrap gap-3">
              <Button variant="contained" color="primary" onClick={() => alert("Demo: scoring not implemented in stub")} disabled={!unlocked} startIcon={<AutoFixHighIcon />}>
                Check my writing (demo)
              </Button>
              <Button variant="contained" color="secondary" disabled={!unlocked || challengeDone} onClick={finishChallenge} startIcon={<FlagIcon />}>
                Finish challenge → unlock next level
              </Button>
            </Box>

            <Box className="mt-6 text-center opacity-60">
              <Typography variant="caption" display="block" color="text.secondary">
                GrowNative generates content using AI. Important: Parents should not enter any personally identifiable information (PII) of children. Always review generated stories for safety and accuracy.
              </Typography>
              <Typography variant="caption" display="block" color="error.main" fontWeight="bold" sx={{ mt: 0.5 }}>
                Kids need to be monitored while using AI.
              </Typography>
            </Box>
          </Box>
        </Paper>

        <AppFooter />
      </Container>
    </main>
  );
}
