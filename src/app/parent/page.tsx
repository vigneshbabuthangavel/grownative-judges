"use client";

import { Container, Typography } from "@mui/material";
import { AppFooter } from "@/components/AppFooter";
import { ParentGate } from "@/components/ParentGate";
import { ParentDashboard } from "@/components/ParentDashboard";

export default function ParentPage() {
  return (
    <div className="min-h-screen flex flex-col">

      <Container maxWidth="lg" className="py-8 md:py-12 flex-1">
        <Typography variant="h4" fontWeight={950} className="mt-6 text-[#fff]">Parent View</Typography>
        <Typography className="mt-1" color="text.secondary">
          Vocabulary and writing samples (local-only).
        </Typography>

        <div className="mt-6">
          <ParentGate>
            <ParentDashboard />
          </ParentGate>
        </div>
      </Container>
      <AppFooter />
    </div>
  );
}
