"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};

const DEFAULT_VALUE: ThemeContextValue = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => undefined,
};

const ThemeContext = createContext<ThemeContextValue>(DEFAULT_VALUE);

const THEME_STORAGE_KEY = "puppy-theme-preference";

function getStoredPreference(): ThemePreference | null {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return null;
}

function applyHtmlTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const stored = getStoredPreference();
    if (stored) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const getFinalTheme = (preference: ThemePreference, mediaMatches: boolean): ResolvedTheme =>
      preference === "system" ? (mediaMatches ? "dark" : "light") : preference;

    const sync = (preference: ThemePreference) => {
      const finalTheme = getFinalTheme(preference, media.matches);
      setResolvedTheme(finalTheme);
      applyHtmlTheme(finalTheme);
    };

    sync(theme);

    if (theme !== "system") {
      return;
    }

    const listener = (event: MediaQueryListEvent) => {
      const finalTheme = getFinalTheme("system", event.matches);
      setResolvedTheme(finalTheme);
      applyHtmlTheme(finalTheme);
    };

    media.addEventListener("change", listener);
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [theme]);

  const setTheme = useCallback((preference: ThemePreference) => {
    setThemeState(preference);
    if (typeof window !== "undefined") {
      if (preference === "system") {
        window.localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        window.localStorage.setItem(THEME_STORAGE_KEY, preference);
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
