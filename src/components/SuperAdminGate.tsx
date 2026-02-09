"use client";

import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginSuperAdmin, checkIsSetup, registerAdmin } from "@/actions/auth";

const SESSION_KEY = "gn_super_admin_ok";

export function SuperAdminGate({ children }: { children: React.ReactNode }) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState(false);
    const [mounted, setMounted] = useState(false);

    // New States
    const [isSetup, setIsSetup] = useState<boolean | null>(null); // Null = loading
    const [mode, setMode] = useState<"login" | "register">("login");

    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        // Check Setup Status
        checkIsSetup().then((configured) => {
            setIsSetup(configured);
            if (!configured) setMode("register");
        });

        // Optimistic Session Check
        const remembered = window.sessionStorage.getItem(SESSION_KEY);
        if (remembered === "1") {
            setOk(true);
        }
    }, []);

    // Effect: If "ok" (logged in) and we are on the login page, redirect to dashboard
    useEffect(() => {
        if (ok && window.location.pathname === "/admin/login") {
            router.push("/admin");
        }
    }, [ok, router]);

    async function handleAuth() {
        if (mode === "login") {
            const result = await loginSuperAdmin(pin.trim());
            if (result.success) {
                onSuccess();
            } else {
                setError(result.error || "Incorrect Password");
            }
        } else {
            const result = await registerAdmin(pin.trim());
            if (result.success) {
                onSuccess();
            } else {
                setError(result.error || "Failed to create admin");
            }
        }
    }

    function onSuccess() {
        window.sessionStorage.setItem(SESSION_KEY, "1");
        setOk(true);
        setError(null);
        setPin("");
        router.refresh();
        if (window.location.pathname === "/admin/login") {
            router.push("/admin");
        }
    }

    // Prevent hydration mismatch
    if (!mounted) return null;

    if (ok) {
        return <Box>{children}</Box>;
    }

    if (isSetup === null) return null; // Loading state

    return (
        <Paper className="rounded-3xl p-8 border border-black/10 shadow-soft bg-slate-900 text-white max-w-lg mx-auto py-16">
            <Box className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-2">
                    <AdminPanelSettingsIcon sx={{ fontSize: 32, color: mode === 'register' ? '#4ade80' : "#cbd5e1" }} />
                </div>

                <Box>
                    <Typography variant="h5" fontWeight={900}>
                        {mode === "register" ? "Create Admin Credentials" : "Super Admin Access"}
                    </Typography>
                    <Typography className="text-slate-400 mt-2 text-sm">
                        {mode === "register"
                            ? "This system has no admin configured. Set a secure password to claim ownership."
                            : "Restricted area for content management and system configuration."}
                    </Typography>
                </Box>

                <Box className="w-full max-w-xs mt-6 flex flex-col gap-3">
                    <TextField
                        placeholder={mode === "register" ? "Set New Password" : "Enter Admin Password"}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)} // Allow text now, not just numbers
                        type="password"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleAuth();
                        }}
                        size="small"
                        autoFocus
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 1,
                            input: { textAlign: 'center', letterSpacing: '0.1em', fontWeight: 'bold' }
                        }}
                    />
                    {error ? <Typography color="error" className="text-sm font-bold bg-red-900/20 p-2 rounded">{error}</Typography> : null}

                    <Button
                        onClick={handleAuth}
                        variant="contained"
                        size="large"
                        className={`font-bold ${mode === 'register' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-500 hover:bg-indigo-600'}`}
                        fullWidth
                    >
                        {mode === "register" ? "Create Account" : "Authenticate"}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}
