"use client";

import React, { useEffect, useState } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import { AppFooter } from "@/components/AppFooter";
import AdminPortal from "@/components/AdminPortal";

export default function AdminPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Box className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Main Content Area */}
            <Box className="flex-grow pt-24 pb-16 px-4">
                <Container maxWidth="xl">
                    <AdminPortal />
                </Container>
            </Box>

            <AppFooter />
        </Box>
    );
}