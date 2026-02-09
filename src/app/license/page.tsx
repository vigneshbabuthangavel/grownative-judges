"use client";

import { Container, Paper, Box, Typography, Divider } from "@mui/material";

import { AppFooter } from "@/components/AppFooter";

export default function LicensePage() {
    return (
        <main className="min-h-screen">
            <Container maxWidth="md" className="py-10">


                <Paper className="mt-6 rounded-3xl border border-black/10 shadow-soft overflow-hidden">
                    <Box className="p-6 bg-white">
                        <Typography variant="h5" fontWeight={950}>
                            MIT License
                        </Typography>
                        <Typography className="mt-2" color="text.secondary">
                            Copyright (c) 2024 GrowNative
                        </Typography>
                    </Box>
                    <Divider />
                    <Box className="p-6 bg-slate-50 font-mono text-sm leading-relaxed overflow-x-auto">
                        <pre className="whitespace-pre-wrap text-slate-700">
                            {`Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
                        </pre>
                    </Box>
                </Paper>

                <AppFooter />
            </Container>
        </main>
    );
}
