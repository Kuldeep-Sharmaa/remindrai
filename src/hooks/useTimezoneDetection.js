// ============================================================================
// 📁 src/hooks/useTimezoneDetection.js
// ----------------------------------------------------------------------------
// 🔹 Purpose: Stable, low-noise timezone detection hook with minimal CPU usage
// 🔹 Production-grade: SSR-safe, no interval restarts, proper cleanup
// 🔹 Last Updated: 2025-11-13
// ============================================================================

import { useEffect, useState, useCallback, useRef } from "react";
import { DateTime } from "luxon";

/**
 * useTimezoneDetection
 *
 * Detects user's timezone with stability validation to prevent flapping.
 * - SSR-safe with defensive environment checks
 * - Respects tab visibility to reduce CPU usage when hidden
 * - No effect re-runs from internal state changes
 * - Minimal CPU usage with configurable polling intervals
 * - Only updates state when values actually change
 * - Provides previous timezone for before/after comparison
 * - Bounded memory usage with history cap
 * - Manual refresh capability for reconnect scenarios
 * - Interval-driven stability (no redundant setTimeout checks)
 * - Can be stopped manually to save CPU when not needed
 *
 * @param {Object} config - Configuration options
 * @param {number} config.stabilityWindowMs - Time window to validate stability (default: 15000ms)
 * @param {number} config.tickIntervalMs - Polling interval for timezone checks (default: 5000ms)
 * @param {boolean} config.startImmediately - Start detection on mount (default: true). If false, call refresh() to begin.
 * @param {number} config.minStabilitySamples - Minimum samples needed for stability (default: 2)
 * @param {number} config.maxHistoryLength - Maximum history entries to prevent memory growth (default: 100)
 * @returns {Object} Timezone detection state and utilities
 */
export function useTimezoneDetection({
  stabilityWindowMs = 15000,
  tickIntervalMs = 5000,
  startImmediately = true,
  minStabilitySamples = 2,
  maxHistoryLength = 100,
} = {}) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [detectedTimezone, setDetectedTimezone] = useState(null);
  const [previousDetectedTimezone, setPreviousDetectedTimezone] =
    useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [isStable, setIsStable] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);

  // ============================================================================
  // REFS - Prevent unnecessary re-renders and maintain stable references
  // ============================================================================

  const mounted = useRef(true);
  const lastZoneRef = useRef(null);
  const currentTimeRef = useRef("");
  const detectionHistoryRef = useRef([]);
  const hasStartedRef = useRef(false);
  const intervalIdRef = useRef(null);

  // ============================================================================
  // TIMEZONE DETECTION LOGIC
  // ============================================================================

  /**
   * detectZone
   * Robust timezone detection with multiple fallback strategies
   * Memoized to prevent function recreation on every render
   */
  const detectZone = useCallback(() => {
    try {
      // Primary: Use Intl.DateTimeFormat for reliable detection
      // Defensive check for environments without Intl support
      const tz =
        typeof Intl !== "undefined" && Intl.DateTimeFormat
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : undefined;

      if (tz) return tz;
    } catch (e) {
      console.warn("[useTimezoneDetection] Intl API failed:", e);
    }

    try {
      // Secondary: Luxon's guess
      const luxonGuess = DateTime.local().zoneName;
      if (luxonGuess && luxonGuess !== "local") return luxonGuess;
    } catch (e) {
      console.warn("[useTimezoneDetection] Luxon guess failed:", e);
    }

    // Final fallback
    return "UTC";
  }, []);

  // ============================================================================
  // STABILITY VALIDATION
  // ============================================================================

  /**
   * checkStability
   * Validates that timezone has remained consistent over the stability window
   * Called on every interval tick to accumulate samples
   */
  const checkStability = useCallback(
    (zone) => {
      const now = Date.now();

      // Add current detection to history
      detectionHistoryRef.current.push({ zone, timestamp: now });

      // Enforce maximum history length BEFORE filtering to prevent unbounded memory growth
      if (detectionHistoryRef.current.length > maxHistoryLength) {
        detectionHistoryRef.current.shift();
      }

      // Remove old entries outside stability window
      detectionHistoryRef.current = detectionHistoryRef.current.filter(
        (entry) => now - entry.timestamp < stabilityWindowMs
      );

      // Check if all entries in window match current zone
      const allMatch = detectionHistoryRef.current.every(
        (entry) => entry.zone === zone
      );

      const hasEnoughSamples =
        detectionHistoryRef.current.length >= minStabilitySamples;

      return allMatch && hasEnoughSamples;
    },
    [stabilityWindowMs, minStabilitySamples, maxHistoryLength]
  );

  // ============================================================================
  // MANUAL REFRESH
  // ============================================================================

  /**
   * refresh
   * Triggers immediate timezone detection
   * Useful after network reconnect or manual user action
   * Safe to call even when unmounted
   */
  const refresh = useCallback(() => {
    if (!mounted.current) return;

    const zone = detectZone();
    const now = Date.now();

    // Guard all setState calls to prevent React warnings on unmount
    if (!mounted.current) return;
    setLastCheckedAt(now);

    // Update timezone if changed
    if (zone !== lastZoneRef.current) {
      if (!mounted.current) return;
      setPreviousDetectedTimezone(lastZoneRef.current);

      if (!mounted.current) return;
      setDetectedTimezone(zone);
      lastZoneRef.current = zone;

      // Reset stability when zone changes
      detectionHistoryRef.current = [];

      if (!mounted.current) return;
      setIsStable(false);
    } else {
      // Same zone - check if we've reached stability
      const stable = checkStability(zone);
      const currentStable = isStable;

      if (stable !== currentStable && mounted.current) {
        setIsStable(stable);
      }
    }

    // Update current time
    try {
      const dateTime = DateTime.now().setZone(zone);
      const formatted = dateTime.toFormat("hh:mm:ss a");
      currentTimeRef.current = formatted;

      if (!mounted.current) return;
      setCurrentTime(formatted);
    } catch (e) {
      console.warn("[useTimezoneDetection] Time format failed in refresh:", e);
      currentTimeRef.current = "00:00:00 AM";

      if (!mounted.current) return;
      setCurrentTime("00:00:00 AM");
    }
  }, [detectZone, checkStability, isStable]);

  // ============================================================================
  // MANUAL STOP
  // ============================================================================

  /**
   * stop
   * Stops the polling interval to save CPU
   * Useful for screens where timezone detection is not needed
   */
  const stop = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  // ============================================================================
  // MAIN DETECTION EFFECT
  // ============================================================================

  /**
   * Core detection loop
   * CRITICAL: Dependencies do NOT include isStable - prevents interval restart on stability changes
   * Stability is checked on every interval tick (interval-driven)
   */
  useEffect(() => {
    mounted.current = true;

    // Handle startImmediately === false with proper cleanup
    if (!startImmediately) {
      hasStartedRef.current = false;
      // CRITICAL: Always return cleanup to set mounted.current = false
      return () => {
        mounted.current = false;
      };
    }

    hasStartedRef.current = true;

    // Initial detection
    const initialZone = detectZone();
    lastZoneRef.current = initialZone;
    setDetectedTimezone(initialZone);
    setLastCheckedAt(Date.now());

    try {
      const initialTime = DateTime.now().setZone(initialZone);
      const formatted = initialTime.toFormat("hh:mm:ss a");
      currentTimeRef.current = formatted;
      setCurrentTime(formatted);
    } catch (e) {
      console.warn("[useTimezoneDetection] Initial time format failed:", e);
      currentTimeRef.current = "00:00:00 AM";
      setCurrentTime("00:00:00 AM");
    }

    // Start stability check
    const stable = checkStability(initialZone);
    setIsStable(stable);

    // ============================================================================
    // POLLING INTERVAL
    // ============================================================================

    const intervalId = setInterval(() => {
      if (!mounted.current) return;

      // Guard document.hidden for SSR/test environments
      // Respect tab visibility to reduce CPU usage when tab is hidden
      if (typeof document !== "undefined" && document.hidden) return;

      // Guard setState call
      if (!mounted.current) return;
      setLastCheckedAt(Date.now());

      // Detect current timezone
      const zone = detectZone();

      // Create DateTime instance once and reuse
      let now;
      try {
        now = DateTime.now().setZone(zone);
      } catch (e) {
        console.warn("[useTimezoneDetection] DateTime creation failed:", e);
        // Fallback to UTC on error
        try {
          now = DateTime.now().setZone("UTC");
        } catch (fallbackError) {
          console.error(
            "[useTimezoneDetection] UTC fallback failed:",
            fallbackError
          );
          return;
        }
      }

      // ============================================================================
      // CONDITIONAL STATE UPDATES - Only update when values change
      // ============================================================================

      // Update timezone only if changed
      if (zone !== lastZoneRef.current) {
        if (!mounted.current) return;
        setPreviousDetectedTimezone(lastZoneRef.current);

        if (!mounted.current) return;
        setDetectedTimezone(zone);
        lastZoneRef.current = zone;

        // Reset stability when zone changes
        detectionHistoryRef.current = [];

        if (!mounted.current) return;
        setIsStable(false);
      } else {
        // Same zone - check stability on every tick (interval-driven)
        const stable = checkStability(zone);

        if (!mounted.current) return;
        // Only update if stability state changed
        if (stable !== isStable) {
          setIsStable(stable);
        }
      }

      // Update current time only if formatted string changed
      try {
        const formatted = now.toFormat("hh:mm:ss a");
        if (formatted !== currentTimeRef.current) {
          currentTimeRef.current = formatted;

          if (!mounted.current) return;
          setCurrentTime(formatted);
        }
      } catch (e) {
        console.warn("[useTimezoneDetection] Time format failed:", e);
        // Use consistent fallback with detected zone
        const fallbackTime = "00:00:00 AM";
        if (fallbackTime !== currentTimeRef.current) {
          currentTimeRef.current = fallbackTime;

          if (!mounted.current) return;
          setCurrentTime(fallbackTime);
        }
      }
    }, tickIntervalMs);

    // Store interval ID for manual stop capability
    intervalIdRef.current = intervalId;

    // ============================================================================
    // CLEANUP
    // ============================================================================

    return () => {
      mounted.current = false;
      clearInterval(intervalId);
      intervalIdRef.current = null;
    };
  }, [
    detectZone,
    stabilityWindowMs,
    tickIntervalMs,
    checkStability,
    startImmediately,
  ]);
  // CRITICAL: isStable is NOT in dependencies - prevents interval restart on stability toggles

  // ============================================================================
  // RETURN API
  // ============================================================================

  return {
    detectedTimezone,
    previousDetectedTimezone,
    currentTime,
    isStable,
    lastCheckedAt,
    refresh,
    stop,
  };
}

export default useTimezoneDetection;
