"use client";

import { SuperAdminGate } from "@/components/SuperAdminGate";
import { Box } from "@mui/material";

export default function AdminLoginPage() {
    return (
        <Box className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Repurposed Gate as Login Form */}
            {/* We pass a dummy child because the old component expects it, 
               but we'll refactor the component next to be smarter. */}
            <SuperAdminGate>
                {/* This content only shows if logged in. 
                   If logged in, we should redirect to /admin. 
                   We will handle this logic inside SuperAdminGate. */}
                <div className="text-white text-center">Redirecting...</div>
            </SuperAdminGate>
        </Box>
    );
}
