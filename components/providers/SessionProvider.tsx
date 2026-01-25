"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";

export default function SessionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Suppress NextAuth CLIENT_FETCH_ERROR - it's harmless and occurs on public pages
    // when NextAuth tries to fetch session but the page doesn't require auth
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      const errorMessage = args[0]?.toString() || "";
      if (
        errorMessage.includes("[next-auth][error][CLIENT_FETCH_ERROR]") ||
        errorMessage.includes("CLIENT_FETCH_ERROR")
      ) {
        // Suppress this specific harmless error
        return;
      }
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const warnMessage = args[0]?.toString() || "";
      if (warnMessage.includes("next-auth") && warnMessage.includes("CLIENT_FETCH_ERROR")) {
        // Suppress this specific warning
        return;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return (
    <NextAuthSessionProvider
      basePath="/api/auth"
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
