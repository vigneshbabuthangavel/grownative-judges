"use client";

import { Container, Paper, Box, Typography, Divider } from "@mui/material";

import { AppFooter } from "@/components/AppFooter";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Container maxWidth="md" className="py-10">


        <Paper className="mt-6 rounded-3xl border border-black/10 shadow-soft overflow-hidden">
          <Box className="p-6 bg-white">
            <Typography variant="h5" fontWeight={950}>
              Privacy (Demo)
            </Typography>
            <Typography className="mt-2" color="text.secondary">
              This demo is designed for children and families. It avoids collecting personal information.
            </Typography>
          </Box>
          <Divider />
          <Box className="p-6 bg-white">
            <Typography fontWeight={950}>What we store (local-only)</Typography>
            <ul className="mt-2 list-disc ml-6 text-[#111] font-semibold">
              <li>Pen name + avatar</li>
              <li>Unlocked level and completed stories</li>
              <li>Likes/Love reactions</li>
              <li>Optional parent PIN hash</li>
            </ul>

            <Typography className="mt-6" fontWeight={950}>What we do NOT store</Typography>
            <ul className="mt-2 list-disc ml-6 text-[#111] font-semibold">
              <li>Real names, email, phone, address</li>
              <li>Location or device identifiers</li>
              <li>Analytics or tracking</li>
              <li>Any server-side account data</li>
            </ul>

            <Typography className="mt-6 text-sm text-[#111] opacity-80">
              Note: This is a hackathon demo. A production version can add stronger parent controls and secure storage while keeping the same privacy-first principles.
            </Typography>
          </Box>
        </Paper>

        <AppFooter />
      </Container>
    </main>
  );
}
