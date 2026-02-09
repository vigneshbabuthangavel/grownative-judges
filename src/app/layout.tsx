import "./globals.css";
import { AppThemeProvider } from "@/components/theme/AppThemeProvider";
import { ProfileGate } from "@/components/ProfileGate";
import { AppHeader } from "@/components/AppHeader";
import { GlobalBackground } from "@/components/GlobalBackground";

import { BrowserCheck } from "@/components/BrowserCheck";

// ... (keep font imports commented out for now)

export const metadata = {
  title: "GrowNative (Demo)",
  description: "Privacy-first native-language literacy demo (Levels 1–8)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`min-h-screen text-slate-900 font-sans`}>
        <AppThemeProvider>
          <BrowserCheck />
          <AppHeader /> {/* GLOBAL HEADER */}
          <GlobalBackground />
          <ProfileGate>{children}</ProfileGate>
        </AppThemeProvider>
      </body>
    </html>
  );
}
