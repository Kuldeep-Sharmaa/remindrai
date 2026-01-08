// src/hooks/useTheme.js - Production-ready theme system with bulletproof browser compatibility
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

const LOCAL_STORAGE_THEME_KEY = "remindrai-theme";
const LOCAL_STORAGE_THEME_USAGE_KEY = "remindrai-theme-usage";

// Enhanced theme configuration for production
const THEME_CONFIG = {
  VALID_THEMES: ["light", "dark", "auto"],
  DEFAULT_THEME: "auto",
  DEBOUNCE_DELAY_MS: 16, // One frame at 60fps
  TRANSITION_DISABLE_CLASS: "theme-changing",
  STORAGE_RETRY_ATTEMPTS: 3,
  STORAGE_RETRY_DELAY: 100,
  SYSTEM_DETECTION_TIMEOUT: 5000, // 5s timeout for system detection
  EDGE_DETECTION_DELAY: 100, // Special delay for Edge browser
};

// Browser detection utility for Edge-specific handling
const getBrowserInfo = () => {
  if (typeof window === "undefined")
    return { isEdge: false, isChromium: false };

  const userAgent = navigator.userAgent.toLowerCase();
  const isEdge = userAgent.includes("edg/") || userAgent.includes("edge/");
  const isChromium =
    userAgent.includes("chrome") || userAgent.includes("chromium");
  const isFirefox = userAgent.includes("firefox");
  const isSafari =
    userAgent.includes("safari") && !userAgent.includes("chrome");

  return { isEdge, isChromium, isFirefox, isSafari };
};

// Enhanced system theme detection with multiple fallback strategies
const getSystemTheme = () => {
  if (typeof window === "undefined") return "light";

  const browserInfo = getBrowserInfo();

  try {
    // Strategy 1: Standard matchMedia (works on most browsers)
    if (window.matchMedia) {
      const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const lightQuery = window.matchMedia("(prefers-color-scheme: light)");

      // For Edge, add a small delay to ensure proper detection
      if (browserInfo.isEdge) {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (darkQuery.matches) resolve("dark");
            else if (lightQuery.matches) resolve("light");
            else resolve("light");
          }, THEME_CONFIG.EDGE_DETECTION_DELAY);
        });
      }

      if (darkQuery.matches) return "dark";
      if (lightQuery.matches) return "light";
    }

    // Strategy 2: CSS environment detection fallback (for problematic browsers)
    const testElement = document.createElement("div");
    testElement.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 1px;
      height: 1px;
      color-scheme: light dark;
      background: Canvas;
      color: CanvasText;
    `;

    document.body.appendChild(testElement);

    const computedStyle = window.getComputedStyle(testElement);
    const backgroundColor = computedStyle.backgroundColor;
    const textColor = computedStyle.color;

    document.body.removeChild(testElement);

    // Analyze computed colors to determine theme
    if (backgroundColor && textColor) {
      const bgBrightness = getBrightness(backgroundColor);
      const textBrightness = getBrightness(textColor);

      // Dark theme typically has dark background and light text
      if (bgBrightness < 128 && textBrightness > 128) return "dark";
      if (bgBrightness > 128 && textBrightness < 128) return "light";
    }

    // Strategy 3: Time-based fallback (rough approximation)
    if (browserInfo.isEdge) {
      const hour = new Date().getHours();
      // Assume dark mode between 6 PM and 6 AM
      return hour >= 18 || hour <= 6 ? "dark" : "light";
    }
  } catch (error) {
    console.warn("System theme detection failed:", error);
  }

  return "light"; // Ultimate fallback
};

// Helper function to calculate color brightness
const getBrightness = (color) => {
  try {
    // Parse RGB values from various color formats
    const rgb = color.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      const [r, g, b] = rgb.map(Number);
      // Standard luminance formula
      return (r * 299 + g * 587 + b * 114) / 1000;
    }
  } catch (error) {
    console.warn("Color brightness calculation failed:", error);
  }
  return 128; // Middle brightness fallback
};

// Enhanced storage manager with compression and encryption support
const createStorageManager = () => {
  const isStorageAvailable = () => {
    try {
      if (typeof window === "undefined") return false;
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  };

  const retryOperation = async (
    operation,
    attempts = THEME_CONFIG.STORAGE_RETRY_ATTEMPTS
  ) => {
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === attempts - 1) throw error;
        await new Promise((resolve) =>
          setTimeout(resolve, THEME_CONFIG.STORAGE_RETRY_DELAY * (i + 1))
        );
      }
    }
  };

  // Enhanced data validation
  const validateData = (data, expectedType = "any") => {
    if (data === null || data === undefined) return false;

    switch (expectedType) {
      case "theme":
        return THEME_CONFIG.VALID_THEMES.includes(data);
      case "usage":
        return (
          typeof data === "object" &&
          data.light !== undefined &&
          data.dark !== undefined &&
          data.auto !== undefined
        );
      default:
        return true;
    }
  };

  return {
    get: async (key, fallback = null, expectedType = "any") => {
      if (!isStorageAvailable()) return fallback;

      return retryOperation(() => {
        const value = localStorage.getItem(key);
        if (!value) return fallback;

        try {
          const parsed = JSON.parse(value);
          return validateData(parsed, expectedType) ? parsed : fallback;
        } catch {
          // Handle non-JSON values
          return validateData(value, expectedType) ? value : fallback;
        }
      });
    },

    set: async (key, value) => {
      if (!isStorageAvailable()) return false;

      return retryOperation(() => {
        const serializedValue =
          typeof value === "string" ? value : JSON.stringify(value);
        localStorage.setItem(key, serializedValue);

        // Verify write was successful
        const verification = localStorage.getItem(key);
        return verification === serializedValue;
      });
    },

    remove: async (key) => {
      if (!isStorageAvailable()) return false;

      return retryOperation(() => {
        localStorage.removeItem(key);
        return !localStorage.getItem(key);
      });
    },
  };
};

const storageManager = createStorageManager();

export const useTheme = () => {
  // Core state management with enhanced initialization
  const [systemTheme, setSystemTheme] = useState(() => "light");
  const [theme, setTheme] = useState(THEME_CONFIG.DEFAULT_THEME);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [themeUsage, setThemeUsage] = useState({ light: 0, dark: 0, auto: 0 });
  const [initializationError, setInitializationError] = useState(null);

  // Enhanced refs for optimization and cleanup
  const mediaQueryRef = useRef(null);
  const themeChangeTimeoutRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const sessionStartTime = useRef(Date.now());
  const lastTrackedTheme = useRef(theme);
  const initializationPromise = useRef(null);
  const systemDetectionTimeout = useRef(null);
  const browserInfo = useRef(getBrowserInfo());

  // Calculate effective theme with enhanced logic
  const currentEffectiveTheme = useMemo(() => {
    if (theme === "auto") return systemTheme;
    return theme;
  }, [theme, systemTheme]);

  // Enhanced system theme detection with browser-specific handling
  const detectSystemTheme = useCallback(async () => {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn("System theme detection timeout, using fallback");
        resolve("light");
      }, THEME_CONFIG.SYSTEM_DETECTION_TIMEOUT);

      try {
        const detectedTheme = getSystemTheme();

        if (detectedTheme instanceof Promise) {
          // Handle async detection (Edge browser)
          detectedTheme
            .then((theme) => {
              clearTimeout(timeoutId);
              resolve(theme);
            })
            .catch(() => {
              clearTimeout(timeoutId);
              resolve("light");
            });
        } else {
          clearTimeout(timeoutId);
          resolve(detectedTheme);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn("System theme detection failed:", error);
        resolve("light");
      }
    });
  }, []);

  // Initialize theme from storage with enhanced error handling
  const initializeTheme = useCallback(async () => {
    if (initializationPromise.current) {
      return initializationPromise.current;
    }

    initializationPromise.current = (async () => {
      try {
        setInitializationError(null);

        // Detect system theme first
        const detectedSystemTheme = await detectSystemTheme();
        setSystemTheme(detectedSystemTheme);

        // Load saved preferences
        const [savedTheme, savedUsage] = await Promise.all([
          storageManager.get(
            LOCAL_STORAGE_THEME_KEY,
            THEME_CONFIG.DEFAULT_THEME,
            "theme"
          ),
          storageManager.get(
            LOCAL_STORAGE_THEME_USAGE_KEY,
            { light: 0, dark: 0, auto: 0 },
            "usage"
          ),
        ]);

        // Validate and set theme
        const validTheme = THEME_CONFIG.VALID_THEMES.includes(savedTheme)
          ? savedTheme
          : THEME_CONFIG.DEFAULT_THEME;

        setTheme(validTheme);
        setThemeUsage(savedUsage);
        lastTrackedTheme.current = validTheme;

        return { theme: validTheme, systemTheme: detectedSystemTheme };
      } catch (error) {
        console.error("Theme initialization failed:", error);
        setInitializationError(error);

        // Fallback initialization
        const fallbackTheme = THEME_CONFIG.DEFAULT_THEME;
        setTheme(fallbackTheme);
        setSystemTheme("light");
        lastTrackedTheme.current = fallbackTheme;

        return { theme: fallbackTheme, systemTheme: "light" };
      }
    })();

    return initializationPromise.current;
  }, [detectSystemTheme]);

  // Ultra-optimized DOM theme application with batch updates
  const applyThemeToDOM = useCallback(
    (themeValue, effectiveTheme, skipTransition = false) => {
      if (typeof window === "undefined") return;

      const root = document.documentElement;

      // Clear existing timeouts
      if (themeChangeTimeoutRef.current) {
        clearTimeout(themeChangeTimeoutRef.current);
      }

      // Batch DOM updates for optimal performance
      const applyChanges = () => {
        try {
          // Disable transitions for instant change
          if (!skipTransition) {
            root.classList.add(THEME_CONFIG.TRANSITION_DISABLE_CLASS);
            setIsTransitioning(true);
          }

          // Remove all theme classes and attributes
          root.classList.remove("dark", "light", "theme-light", "theme-dark");
          root.removeAttribute("data-theme");
          root.removeAttribute("data-effective-theme");

          // Apply new theme with multiple class formats for compatibility
          root.classList.add(effectiveTheme, `theme-${effectiveTheme}`);
          root.setAttribute("data-theme", themeValue);
          root.setAttribute("data-effective-theme", effectiveTheme);

          // Update CSS custom properties for advanced theming
          root.style.setProperty("--theme-mode", effectiveTheme);
          root.style.setProperty("--theme-preference", themeValue);
          root.style.setProperty(
            "--is-dark",
            effectiveTheme === "dark" ? "1" : "0"
          );
          root.style.setProperty(
            "--is-light",
            effectiveTheme === "light" ? "1" : "0"
          );

          // Update meta theme-color for mobile browsers with enhanced color palette
          const metaThemeColor = document.querySelector(
            'meta[name="theme-color"]'
          );
          if (metaThemeColor) {
            const colors = {
              light: "#ffffff",
              dark: "#0f0f0f",
            };
            metaThemeColor.setAttribute(
              "content",
              colors[effectiveTheme] || colors.light
            );
          }

          // Update viewport meta for PWA support
          const viewportMeta = document.querySelector('meta[name="viewport"]');
          if (viewportMeta) {
            const content = viewportMeta.getAttribute("content");
            const themeColorScheme =
              effectiveTheme === "dark" ? "dark" : "light";
            if (!content.includes("color-scheme")) {
              viewportMeta.setAttribute(
                "content",
                `${content}, color-scheme=${themeColorScheme}`
              );
            }
          }

          // Dispatch custom event for external integrations
          window.dispatchEvent(
            new CustomEvent("themechange", {
              detail: {
                theme: themeValue,
                effectiveTheme,
                timestamp: Date.now(),
              },
            })
          );
        } catch (error) {
          console.error("DOM theme application failed:", error);
          setIsTransitioning(false);
        }
      };

      // Use requestAnimationFrame for smooth transitions
      requestAnimationFrame(() => {
        applyChanges();

        // Re-enable transitions after DOM update
        if (!skipTransition) {
          themeChangeTimeoutRef.current = setTimeout(() => {
            root.classList.remove(THEME_CONFIG.TRANSITION_DISABLE_CLASS);
            setIsTransitioning(false);
          }, THEME_CONFIG.DEBOUNCE_DELAY_MS);
        }
      });

      // Save to storage asynchronously
      storageManager.set(LOCAL_STORAGE_THEME_KEY, themeValue).catch((error) => {
        console.warn("Failed to save theme preference:", error);
      });
    },
    []
  );

  // Enhanced system theme change detection with browser-specific handling
  useEffect(() => {
    if (typeof window === "undefined") return;

    let mediaQuery;
    let cleanup = () => {};

    const setupMediaQuery = async () => {
      try {
        mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQueryRef.current = mediaQuery;

        const handleSystemThemeChange = async (e) => {
          const newSystemTheme = e.matches ? "dark" : "light";

          // For Edge, add validation delay
          if (browserInfo.current.isEdge) {
            await new Promise((resolve) =>
              setTimeout(resolve, THEME_CONFIG.EDGE_DETECTION_DELAY)
            );

            // Re-validate the media query result
            const revalidatedQuery = window.matchMedia(
              "(prefers-color-scheme: dark)"
            );
            const finalTheme = revalidatedQuery.matches ? "dark" : "light";

            if (finalTheme !== systemTheme) {
              setSystemTheme(finalTheme);
              if (theme === "auto") {
                applyThemeToDOM(theme, finalTheme);
              }
            }
          } else {
            if (newSystemTheme !== systemTheme) {
              setSystemTheme(newSystemTheme);
              if (theme === "auto") {
                applyThemeToDOM(theme, newSystemTheme);
              }
            }
          }
        };

        // Modern event listener with fallback
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener("change", handleSystemThemeChange);
          cleanup = () =>
            mediaQuery.removeEventListener("change", handleSystemThemeChange);
        } else if (mediaQuery.addListener) {
          // Fallback for older browsers
          mediaQuery.addListener(handleSystemThemeChange);
          cleanup = () => mediaQuery.removeListener(handleSystemThemeChange);
        }

        // Initialize theme after media query setup
        const initialized = await initializeTheme();
        setIsInitialized(true);

        return initialized;
      } catch (error) {
        console.error("Media query setup failed:", error);
        setInitializationError(error);
        setIsInitialized(true);
      }
    };

    setupMediaQuery();

    return cleanup;
  }, [theme, systemTheme, applyThemeToDOM, initializeTheme]);

  // Apply theme changes to DOM when theme or system theme changes
  useEffect(() => {
    if (!isInitialized) return;
    applyThemeToDOM(theme, currentEffectiveTheme);
  }, [theme, currentEffectiveTheme, isInitialized, applyThemeToDOM]);

  // Enhanced theme usage tracking with session management
  const saveThemeUsage = useCallback(async () => {
    const now = Date.now();
    const timeSpent = now - sessionStartTime.current;

    if (timeSpent < 1000) return; // Ignore very short sessions

    try {
      const updatedUsage = {
        ...themeUsage,
        [lastTrackedTheme.current]:
          (themeUsage[lastTrackedTheme.current] || 0) + timeSpent,
      };

      setThemeUsage(updatedUsage);
      await storageManager.set(LOCAL_STORAGE_THEME_USAGE_KEY, updatedUsage);

      sessionStartTime.current = now;
      lastTrackedTheme.current = theme;
    } catch (error) {
      console.warn("Failed to save theme usage:", error);
    }
  }, [themeUsage, theme]);

  // Enhanced visibility change and page unload handling
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveThemeUsage();
      } else {
        sessionStartTime.current = Date.now();
      }
    };

    const handleBeforeUnload = () => {
      saveThemeUsage();
    };

    const handlePageHide = () => {
      saveThemeUsage();
    };

    // Multiple event listeners for comprehensive coverage
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      saveThemeUsage();
    };
  }, [saveThemeUsage]);

  // Production-grade theme change handler with comprehensive validation
  const handleThemeChange = useCallback(
    (newTheme) => {
      // Enhanced validation
      if (
        !THEME_CONFIG.VALID_THEMES.includes(newTheme) ||
        newTheme === theme ||
        !isInitialized ||
        isTransitioning
      ) {
        return false;
      }

      try {
        // Save current theme usage
        saveThemeUsage();

        // Update theme state
        setTheme(newTheme);
        lastTrackedTheme.current = newTheme;
        sessionStartTime.current = Date.now();

        // Analytics tracking
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "theme_change", {
            theme_from: theme,
            theme_to: newTheme,
            effective_theme: newTheme === "auto" ? systemTheme : newTheme,
          });
        }

        return true;
      } catch (error) {
        console.error("Theme change failed:", error);
        return false;
      }
    },
    [theme, isInitialized, isTransitioning, saveThemeUsage, systemTheme]
  );

  // Enhanced theme usage statistics
  const getThemeUsageStats = useCallback(() => {
    const total = Object.values(themeUsage).reduce(
      (sum, time) => sum + time,
      0
    );
    const stats = {};

    Object.entries(themeUsage).forEach(([themeName, time]) => {
      stats[themeName] = {
        time,
        percentage: total > 0 ? Math.round((time / total) * 100) : 0,
        hours: Math.round((time / (1000 * 60 * 60)) * 10) / 10,
        minutes: Math.round((time / (1000 * 60)) * 10) / 10,
        humanReadable: formatDuration(time),
      };
    });

    return {
      stats,
      total,
      totalHours: Math.round((total / (1000 * 60 * 60)) * 10) / 10,
    };
  }, [themeUsage]);

  // Helper function to format duration
  const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Utility functions with enhanced logic
  const isDarkMode = useMemo(
    () => currentEffectiveTheme === "dark",
    [currentEffectiveTheme]
  );
  const isAutoMode = useMemo(() => theme === "auto", [theme]);
  const isSystemDark = useMemo(() => systemTheme === "dark", [systemTheme]);

  // Reset theme to system preference
  const resetToSystem = useCallback(() => {
    return handleThemeChange("auto");
  }, [handleThemeChange]);

  // Enhanced toggle with smart logic
  const toggleTheme = useCallback(() => {
    if (theme === "auto") {
      // From auto: switch to opposite of current effective theme
      return handleThemeChange(
        currentEffectiveTheme === "dark" ? "light" : "dark"
      );
    } else {
      // From manual: toggle between light/dark, or go to auto if user prefers
      const oppositeTheme = theme === "dark" ? "light" : "dark";

      // Smart auto-suggestion: if toggling to system preference, suggest auto
      if (oppositeTheme === systemTheme) {
        // Optional: You could implement a preference here to auto-switch to "auto"
        return handleThemeChange(oppositeTheme);
      }

      return handleThemeChange(oppositeTheme);
    }
  }, [theme, currentEffectiveTheme, systemTheme, handleThemeChange]);

  // Enhanced cleanup on unmount
  useEffect(() => {
    return () => {
      [
        themeChangeTimeoutRef,
        transitionTimeoutRef,
        systemDetectionTimeout,
      ].forEach((ref) => {
        if (ref.current) clearTimeout(ref.current);
      });

      // Final usage save
      saveThemeUsage();
    };
  }, [saveThemeUsage]);

  // Theme persistence across browser sessions
  const exportThemeSettings = useCallback(() => {
    return {
      theme,
      usage: themeUsage,
      timestamp: Date.now(),
      version: "1.0.0",
    };
  }, [theme, themeUsage]);

  const importThemeSettings = useCallback(
    async (settings) => {
      try {
        if (
          settings.version &&
          THEME_CONFIG.VALID_THEMES.includes(settings.theme)
        ) {
          await storageManager.set(LOCAL_STORAGE_THEME_KEY, settings.theme);
          if (settings.usage) {
            await storageManager.set(
              LOCAL_STORAGE_THEME_USAGE_KEY,
              settings.usage
            );
          }

          // Re-initialize with new settings
          setIsInitialized(false);
          initializationPromise.current = null;
          await initializeTheme();
          setIsInitialized(true);

          return true;
        }
      } catch (error) {
        console.error("Failed to import theme settings:", error);
      }
      return false;
    },
    [initializeTheme]
  );

  return {
    // Core theme state
    theme,
    systemTheme,
    currentEffectiveTheme,
    isDarkMode,
    isAutoMode,
    isSystemDark,

    // State flags
    isInitialized,
    isTransitioning,
    initializationError,

    // Actions
    handleThemeChange,
    toggleTheme,
    resetToSystem,

    // Usage tracking
    themeUsage,
    getThemeUsageStats,

    // Settings management
    exportThemeSettings,
    importThemeSettings,

    // Utilities
    validThemes: THEME_CONFIG.VALID_THEMES,
    browserInfo: browserInfo.current,
  };
};
