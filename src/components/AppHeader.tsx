"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Box, Chip, Button } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import FaceIcon from "@mui/icons-material/Face";
import { getActiveProfile, languageLabel, GN_PROFILE_CHANGED } from "@/lib/profileStorage";

export function AppHeader() {
  const [profile, setProfile] = React.useState<ReturnType<typeof getActiveProfile>>(null);

  React.useEffect(() => {
    const refresh = () => setProfile(getActiveProfile());

    refresh();

    window.addEventListener("focus", refresh);
    window.addEventListener(GN_PROFILE_CHANGED, refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener(GN_PROFILE_CHANGED, refresh);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b-2 border-black h-20 flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* LOGO AREA */}
        <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box className="flex items-center gap-4 cursor-pointer group">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center overflow-hidden border-2 border-black group-hover:bg-kidPurple-700 transition-colors">
              <span className="font-black text-2xl tracking-tighter">GN</span>
            </div>
            <div className="font-black text-black text-2xl tracking-tight uppercase group-hover:text-kidPurple-700 transition-colors">
              GrowNative
            </div>
          </Box>
        </Link>

        {/* ACTIONS AREA */}
        <Box className="flex items-center gap-4">
          {profile ? (
            <Box className="hidden sm:flex items-center gap-2 border-r-2 border-black/10 pr-4">
              <Chip
                className="bg-black text-white font-bold border-none"
                sx={{ borderRadius: 0 }} /* FORCE SHARP */
                label={<span className="text-sm">LVL {profile.unlockedLevel}</span>}
              />
              <Chip
                className="bg-gray-100 text-black font-bold border-2 border-black"
                sx={{ borderRadius: 0 }} /* FORCE SHARP */
                label={<span className="text-sm uppercase">{languageLabel(profile.primaryLanguage)}</span>}
              />
            </Box>
          ) : null}

          <div className="flex gap-3">
            <Button
              component={Link as any}
              href="/admin"
              variant="outlined"
              className="border-2 border-black text-black font-bold hover:bg-black hover:text-white transition-colors px-6 h-12 text-sm uppercase tracking-wide"
              sx={{ borderRadius: 0, textTransform: 'none' }}
            >
              Content Factory
            </Button>

            <Button
              component={Link as any}
              href="/parent"
              variant="outlined"
              className="border-2 border-black text-black font-bold hover:bg-black hover:text-white transition-colors px-6 h-12 text-sm uppercase tracking-wide"
              sx={{ borderRadius: 0, textTransform: 'none' }}
            >
              Parents
            </Button>

            <Button
              component={Link as any}
              href="/profile"
              variant="contained"
              className="bg-kidYellow-400 border-2 border-black text-black font-black hover:bg-kidYellow-500 transition-colors px-6 h-12 text-sm uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              sx={{ borderRadius: 0, textTransform: 'none' }}
            >
              {profile ? profile.penName : "Login"}
            </Button>
          </div>
        </Box>
      </div>
    </header>
  );
}
