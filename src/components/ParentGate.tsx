"use client";

import * as React from "react";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { getActiveProfile } from "@/lib/profileStorage";
import { setParentSession, logoutParent } from "@/actions/auth";

// Helper to hash locally (we keep this for consistency with how profile stores the hash string)
async function sha256(input: string) {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Session key still used for local optimistic UI updates
function sessionKey(profileId: string) {
  return `gn_parent_ok_${profileId}`;
}

export function ParentGate({ children, hideLock = false }: { children: React.ReactNode; hideLock?: boolean }) {
  const [pin, setPin] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [hasPin, setHasPin] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const p = getActiveProfile();
    if (!p) return;

    // Check if pin is set in profile
    setHasPin(!!p.parentPinHash);

    // Initial check: trust session storage for speed, but real security is cookie (if implemented for parent routes)
    // For ParentGate (which is sectional), the cookie acts as the "remember me" signal.
    const remembered = window.sessionStorage.getItem(sessionKey(p.id));
    if (remembered === "1") {
      setOk(true);
    }
  }, []);

  async function verify() {
    const p = getActiveProfile();
    if (!p) return;
    if (!p.parentPinHash) {
      setError("No Parent PIN set. Go to Profile and set one (optional).");
      return;
    }

    // 1. Verify Hash Locally (matching Profile Storage)
    const hashed = await sha256(pin.trim());

    if (hashed === p.parentPinHash) {
      // 2. Set Server Cookie for Persistence (HTTP Only)
      await setParentSession(p.id);

      // 3. Update Local State
      window.sessionStorage.setItem(sessionKey(p.id), "1");
      setOk(true);
      setError(null);
      setPin("");
    } else {
      setError("Incorrect PIN. Try again.");
    }
  }

  async function lock() {
    const p = getActiveProfile();
    if (!p) return;

    // Server Logout
    await logoutParent(p.id);

    // Client Clear
    window.sessionStorage.removeItem(sessionKey(p.id));
    setOk(false);
    setPin("");
    setError(null);
  }

  // Prevent hydration mismatch
  if (!mounted) return null;

  if (ok) {
    return (
      <Box>
        {!hideLock && (
          <Box className="flex items-center justify-end mb-3">
            <Button
              onClick={lock}
              variant="outlined"
              className="rounded-none border-black/30 text-black"
              startIcon={<LockOpenIcon />}
            >
              Lock Parent View
            </Button>
          </Box>
        )}
        {children}
      </Box>
    );
  }

  return (
    <Paper className="rounded-none p-6 border border-black/10 shadow-soft bg-white max-w-lg mx-auto">
      <Box className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-none bg-kidYellow-50 border border-black/10 flex items-center justify-center">
          <LockIcon sx={{ color: "#111" }} />
        </div>
        <Box>
          <Typography variant="h6" fontWeight={950}>Parent View</Typography>
          <Typography color="text.secondary" className="text-sm">
            Enter your PIN to view vocabulary and writing samples (stored locally on this device).
          </Typography>
        </Box>
      </Box>

      <Box className="mt-5 flex flex-col gap-3">
        {!hasPin ? (
          <Box className="p-4 bg-orange-50 rounded-none border border-orange-100 text-center">
            <Typography color="error" fontWeight="bold" gutterBottom>
              Password Required
            </Typography>
            <Typography variant="body2" className="mb-3">
              You must set a Parent PIN to access this dashboard.
            </Typography>
            <Button
              variant="outlined"
              color="warning"
              href="/profile"
              component="a"
              className="rounded-none"
            >
              Go to Profile & Set PIN
            </Button>
          </Box>
        ) : (
          <>
            <TextField
              label="Parent PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  verify();
                }
              }}
              inputMode="numeric"
              size="small"
              autoFocus
            />
            {error ? <Typography color="error" className="text-sm font-bold">{error}</Typography> : null}
            <Button onClick={verify} variant="contained" className="rounded-none bg-kidPurple-700 text-white font-extrabold" startIcon={<LockIcon />}>
              Unlock
            </Button>
            <Typography className="text-xs" color="text.secondary">
              Tip: You can change your PIN in Profile at any time.
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  );
}
