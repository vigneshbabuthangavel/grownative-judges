"use client";

import * as React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

/**
 * AAA intent:
 * - light tint backgrounds + very dark text (#111)
 * - deep purple primary buttons with white text
 * - strong focus ring (globals.css)
 */
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2e1065", contrastText: "#ffffff" }, // deep purple
    secondary: { main: "#a16207", contrastText: "#111111" }, // warm amber
    success: { main: "#065f46", contrastText: "#ffffff" }, // deep green
    background: { default: "#ffffff", paper: "#ffffff" },
    text: { primary: "#111111", secondary: "#1f2937" },
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 900 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 800 } },
    },
  },
});

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

// ... theme declaration ...

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
