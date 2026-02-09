"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { getActiveProfile } from "@/lib/profileStorage";

export function ProfileGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    // Exclude Admin Routes and Profile Creation page from blocking
    if (pathname.startsWith("/admin") || pathname === "/profile") {
      return;
    }

    const p = getActiveProfile();
    if (!p) router.replace("/profile");
  }, [pathname, router]);

  return <>{children}</>;
}
