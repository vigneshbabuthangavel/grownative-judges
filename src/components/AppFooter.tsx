"use client";

import Link from "next/link";
import * as React from "react";
import { Box, Button } from "@mui/material";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import DescriptionIcon from "@mui/icons-material/Description";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import TranslateIcon from "@mui/icons-material/Translate";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SecurityIcon from "@mui/icons-material/Security";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { resetAllProfiles, getActiveProfile } from "@/lib/profileStorage";

export function AppFooter() {
  const [profile, setProfile] = React.useState<ReturnType<typeof getActiveProfile>>(null);

  React.useEffect(() => {
    setProfile(getActiveProfile());
    // Listen for storage changes if needed, but for now simple mount check is ok. 
    // Ideally we subscribe to an event or use context.
  }, []);

  return (
    <footer className="mt-auto py-12 bg-slate-50 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Box className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">

          {/* LEFT: Navigation Links */}
          <Box className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
            <Link href="/profile" className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2">
              <GroupIcon fontSize="small" className="text-slate-400" /> Profiles
            </Link>
            <Link href="/levels" className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2">
              <SchoolIcon fontSize="small" className="text-slate-400" /> Levels
            </Link>
            {profile?.primaryLanguage && (
              <Link href={`/reference/${profile.primaryLanguage}`} className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2">
                <TranslateIcon fontSize="small" className="text-slate-400" /> Grammar
              </Link>
            )}
            <Link href="/parent/rubric" className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2">
              <DescriptionIcon fontSize="small" className="text-slate-400" /> Rubric
            </Link>
            <Link href="/implementation" className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2">
              <SecurityIcon fontSize="small" className="text-slate-400" /> AI & Safety
            </Link>
            <Link href="/features" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
              <AutoFixHighIcon fontSize="small" className="text-indigo-400" /> Features
            </Link>
          </Box>

          {/* RIGHT: Admin & Actions */}
          <Box className="flex flex-col items-center md:items-end gap-3">
            <Link href="/admin" className="text-sm font-bold text-kidPurple-600 hover:text-kidPurple-800 flex items-center gap-2 bg-kidPurple-50 px-3 py-1.5 rounded-xl border border-kidPurple-100 transition-colors">
              <AdminPanelSettingsIcon fontSize="small" /> Content Factory
            </Link>

            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
              <Link href="/privacy" className="hover:text-slate-600">Privacy</Link>
              <span>•</span>
              <Link href="/license" className="hover:text-slate-600">License</Link>
              <span>•</span>
              <button
                onClick={() => {
                  if (confirm("Reset ALL local profiles and progress on this device?")) resetAllProfiles();
                  window.location.href = "/profile";
                }}
                className="hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <DeleteForeverIcon sx={{ fontSize: 14 }} /> Reset Data
              </button>
            </div>
          </Box>
        </Box>

        <Box className="mt-8 pt-8 border-t border-black/5 text-center text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} GrowNative Demo. Built for safety & privacy.
        </Box>
      </div>
    </footer>
  );
}
