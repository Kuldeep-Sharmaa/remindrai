import { useState, useEffect, useCallback, useMemo } from "react";

const STORAGE_KEY = "remindrai-theme";
const VALID_THEMES = ["light", "dark", "auto"];

const getSystemTheme = () => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const getStoredTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.includes(stored) ? stored : "dark";
  } catch {
    return "dark";
  }
};

// Apply dark class without removing first — no flash
const applyToDOM = (effectiveTheme) => {
  const root = document.documentElement;
  if (effectiveTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState(() => getStoredTheme());
  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme());

  const effectiveTheme = useMemo(
    () => (theme === "auto" ? systemTheme : theme),
    [theme, systemTheme],
  );

  // Apply to DOM whenever effective theme changes
  useEffect(() => {
    applyToDOM(effectiveTheme);
  }, [effectiveTheme]);

  // Watch system preference changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemTheme(e.matches ? "dark" : "light");

    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler); // Safari <14 fallback

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  const handleThemeChange = useCallback((newTheme) => {
    if (!VALID_THEMES.includes(newTheme)) return;
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {}
    setTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    handleThemeChange(effectiveTheme === "dark" ? "light" : "dark");
  }, [effectiveTheme, handleThemeChange]);

  const resetToSystem = useCallback(() => {
    handleThemeChange("auto");
  }, [handleThemeChange]);

  return {
    theme,
    systemTheme,
    effectiveTheme,
    isDarkMode: effectiveTheme === "dark",
    isAutoMode: theme === "auto",
    handleThemeChange,
    toggleTheme,
    resetToSystem,
    validThemes: VALID_THEMES,
  };
};
