// Event-driven timezone detection WITH stability validation
import { useEffect, useState, useCallback, useRef } from "react";

const TZ_ALIAS_MAP = {
  "Asia/Calcutta": "Asia/Kolkata",
  Calcutta: "Asia/Kolkata",
  IST: "Asia/Kolkata",
};

function normalizeTimezone(zone) {
  if (!zone || typeof zone !== "string") return null;
  const candidate = TZ_ALIAS_MAP[zone.trim()] || zone.trim();
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: candidate });
    return candidate;
  } catch {
    return null;
  }
}

function detectTimezone() {
  try {
    const tz =
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : null;
    return normalizeTimezone(tz) || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Detects user timezone with stability validation.
 *
 * Event-driven (no polling), but validates timezone is consistent
 * before confirming a change. Prevents false positives from browser API glitches.
 *
 * @param {Object} config
 * @param {number} config.stabilityDelayMs - How long to wait before confirming change (default: 3000ms)
 * @returns {Object} { detectedTimezone, previousDetectedTimezone, isStable, refresh }
 */
export function useTimezoneDetection({ stabilityDelayMs = 3000 } = {}) {
  // Immediate detection (for UI display)
  const [candidateTimezone, setCandidateTimezone] = useState(() =>
    detectTimezone(),
  );

  // Confirmed stable timezone (for modal trigger)
  const [detectedTimezone, setDetectedTimezone] = useState(() =>
    detectTimezone(),
  );
  const [previousDetectedTimezone, setPreviousDetectedTimezone] =
    useState(null);
  const [isStable, setIsStable] = useState(true);

  const mounted = useRef(true);
  const lastConfirmedRef = useRef(null);
  const stabilityTimerRef = useRef(null);

  const checkTimezone = useCallback(() => {
    if (!mounted.current) return;

    const zone = detectTimezone();

    // Update candidate immediately (for display)
    setCandidateTimezone(zone);

    // Clear any pending stability timer
    if (stabilityTimerRef.current) {
      clearTimeout(stabilityTimerRef.current);
      stabilityTimerRef.current = null;
    }

    // If zone matches already-confirmed timezone, mark as stable
    if (zone === lastConfirmedRef.current) {
      setIsStable(true);
      return;
    }

    // New timezone detected - mark as unstable and start validation timer
    setIsStable(false);

    // Wait for stability period, then confirm if still the same
    stabilityTimerRef.current = setTimeout(() => {
      if (!mounted.current) return;

      // Re-check timezone after delay
      const recheck = detectTimezone();

      // Only confirm if it's still the same zone after delay
      if (recheck === zone) {
        setPreviousDetectedTimezone(lastConfirmedRef.current);
        setDetectedTimezone(zone);
        lastConfirmedRef.current = zone;
        setIsStable(true);
      } else {
        // Timezone changed during stability window - restart validation
        checkTimezone();
      }
    }, stabilityDelayMs);
  }, [stabilityDelayMs]);

  useEffect(() => {
    mounted.current = true;
    lastConfirmedRef.current = detectTimezone();

    // Initial detection on mount
    checkTimezone();

    // SSR guard
    if (typeof document === "undefined" || typeof window === "undefined") {
      return () => {
        mounted.current = false;
        if (stabilityTimerRef.current) {
          clearTimeout(stabilityTimerRef.current);
        }
      };
    }

    // Re-check when tab becomes visible
    const handleVisibility = () => {
      if (!document.hidden) {
        checkTimezone();
      }
    };

    // Re-check when window regains focus
    const handleFocus = () => {
      checkTimezone();
    };

    document.addEventListener("visibilitychange", handleVisibility, {
      passive: true,
    });
    window.addEventListener("focus", handleFocus, { passive: true });

    return () => {
      mounted.current = false;
      if (stabilityTimerRef.current) {
        clearTimeout(stabilityTimerRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibility, {
        passive: true,
      });
      window.removeEventListener("focus", handleFocus, { passive: true });
    };
  }, [checkTimezone]);

  const refresh = useCallback(() => {
    checkTimezone();
  }, [checkTimezone]);

  return {
    detectedTimezone, // Confirmed stable timezone (use this for modal trigger)
    candidateTimezone, // Immediate detection (use for display/debugging)
    previousDetectedTimezone,
    isStable, // True when timezone has been stable for delay period
    refresh,
  };
}

export default useTimezoneDetection;
