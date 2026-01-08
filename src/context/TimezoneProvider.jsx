// ============================================================================
// 📁 src/context/TimezoneProvider.jsx
// ----------------------------------------------------------------------------
// 🔹 Purpose: Provides global timezone context with Luxon integration
// 🔹 Production-grade implementation with proper validation and state management
// ============================================================================

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { Settings, DateTime, IANAZone } from "luxon";
import PropTypes from "prop-types";
import { useAuthContext } from "./AuthContext";

// ============================================================================
// GLOBAL LUXON CONFIGURATION
// ============================================================================
// Set English as default locale to ensure consistent date/time formatting
// across all users regardless of browser language settings
Settings.defaultLocale = "en";

// ============================================================================
// CONTEXT DEFINITION
// ============================================================================
const TimezoneContext = createContext({
  timezone: undefined,
  source: undefined, // 'profile' | 'device' | 'override'
  ready: false,
  setTimezoneOverride: () => false,
});

// ============================================================================
// UTILITY: DEVICE TIMEZONE DETECTION
// ============================================================================
/**
 * Detects the device timezone using multiple fallback strategies
 * @returns {string} Valid IANA timezone string or 'UTC' as last resort
 */
function detectDeviceTimezone() {
  try {
    // Primary: Intl API
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && IANAZone.isValidZone(tz)) {
      return tz;
    }
  } catch (e) {
    console.warn("[TimezoneProvider] Intl API failed:", e);
  }

  try {
    // Secondary: Luxon detection
    const local = DateTime.local();
    if (
      local.isValid &&
      local.zoneName &&
      IANAZone.isValidZone(local.zoneName)
    ) {
      return local.zoneName;
    }
  } catch (e) {
    console.warn("[TimezoneProvider] Luxon detection failed:", e);
  }

  // Final fallback
  console.warn("[TimezoneProvider] All detection methods failed, using UTC");
  return "UTC";
}

// ============================================================================
// UTILITY: TIMEZONE VALIDATION
// ============================================================================
/**
 * Validates an IANA timezone string
 * @param {string} tz - Timezone to validate
 * @returns {boolean} True if valid IANA zone
 */
function isValidTimezone(tz) {
  if (!tz || typeof tz !== "string") return false;

  try {
    // Method 1: IANAZone validation (most reliable)
    if (IANAZone.isValidZone(tz)) return true;

    // Method 2: DateTime validation as fallback
    const dt = DateTime.now().setZone(tz);
    return dt.isValid;
  } catch (e) {
    return false;
  }
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================
export function TimezoneProvider({ children, saveProfileTz = false }) {
  // ---------------------------------------------------------------------------
  // HOOKS & STATE
  // ---------------------------------------------------------------------------
  const { currentUser, authLoading, hasLoadedProfile } = useAuthContext();

  const [timezone, setTimezone] = useState(undefined);
  const [source, setSource] = useState(undefined);
  const [ready, setReady] = useState(false);

  // Track previous user to detect sign-out / user changes
  const prevUserIdRef = useRef(null);

  // ---------------------------------------------------------------------------
  // CORE EFFECT: TIMEZONE RESOLUTION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Wait for auth initialization and profile load
    if (authLoading || !hasLoadedProfile) {
      return;
    }

    const currentUserId = currentUser?.uid || null;
    const prevUserId = prevUserIdRef.current;

    // Detect device timezone once
    const deviceTz = detectDeviceTimezone();

    // -------------------------------------------------------------------------
    // CASE 1: USER SIGNED OUT OR USER CHANGED
    // -------------------------------------------------------------------------
    if (!currentUserId || (prevUserId && currentUserId !== prevUserId)) {
      console.log(
        "[TimezoneProvider] User signed out or changed, resetting to device timezone"
      );

      // Reset to device timezone to prevent previous user's settings from leaking
      if (Settings.defaultZoneName !== deviceTz) {
        Settings.defaultZoneName = deviceTz;
      }

      setTimezone(deviceTz);
      setSource("device");
      setReady(true);
      prevUserIdRef.current = currentUserId;
      return;
    }

    // -------------------------------------------------------------------------
    // CASE 2: USER SIGNED IN - RESOLVE TIMEZONE
    // -------------------------------------------------------------------------

    // Extract profile timezone from multiple possible locations
    const profileTz =
      currentUser?.timezone ||
      currentUser?.preferences?.timezone ||
      currentUser?.profile?.timezone ||
      null;

    // -------------------------------------------------------------------------
    // SUB-CASE 2A: VALID PROFILE TIMEZONE EXISTS
    // -------------------------------------------------------------------------
    if (profileTz && isValidTimezone(profileTz)) {
      // Only update Luxon global if value actually changed (reduce churn)
      if (Settings.defaultZoneName !== profileTz) {
        console.log(
          `[TimezoneProvider] Setting profile timezone: ${profileTz}`
        );
        Settings.defaultZoneName = profileTz;
      }

      setTimezone(profileTz);
      setSource("profile");
      setReady(true);
      prevUserIdRef.current = currentUserId;
      return;
    }

    // -------------------------------------------------------------------------
    // SUB-CASE 2B: INVALID PROFILE TIMEZONE
    // -------------------------------------------------------------------------
    if (profileTz && !isValidTimezone(profileTz)) {
      console.warn(
        `[TimezoneProvider] Invalid profile timezone detected: "${profileTz}", falling back to device`
      );
      // Fall through to device timezone
    }

    // -------------------------------------------------------------------------
    // SUB-CASE 2C: NO PROFILE TIMEZONE (NEW USER OR NOT SET)
    // -------------------------------------------------------------------------
    console.log(
      "[TimezoneProvider] No profile timezone found, using device timezone"
    );

    if (Settings.defaultZoneName !== deviceTz) {
      Settings.defaultZoneName = deviceTz;
    }

    setTimezone(deviceTz);
    setSource("device");
    setReady(true);
    prevUserIdRef.current = currentUserId;

    // -------------------------------------------------------------------------
    // OPTIONAL: SAVE DEVICE TZ TO PROFILE (NON-BLOCKING)
    // -------------------------------------------------------------------------
    // Only save if explicitly enabled AND user has no timezone set
    // This prevents unexpected writes on every app load
    if (saveProfileTz && currentUserId && !profileTz) {
      console.log(
        `[TimezoneProvider] saveProfileTz enabled, device TZ (${deviceTz}) should be saved to profile by parent logic`
      );
      // NOTE: Actual save should be handled by AuthContext or a dedicated service
      // Do NOT perform Firestore writes directly from this provider
      // This keeps the provider focused on state management only
    }
  }, [
    authLoading,
    hasLoadedProfile,
    currentUser?.uid,
    currentUser?.timezone,
    currentUser?.preferences?.timezone,
    currentUser?.profile?.timezone,
    saveProfileTz,
  ]);

  // ---------------------------------------------------------------------------
  // RUNTIME OVERRIDE FUNCTION
  // ---------------------------------------------------------------------------
  /**
   * Allows runtime timezone override (e.g., from settings UI)
   * @param {string} tz - IANA timezone string
   * @returns {boolean} True if override was successful
   */
  const setTimezoneOverride = (tz) => {
    if (!tz || typeof tz !== "string") {
      console.warn(
        "[TimezoneProvider] setTimezoneOverride called with invalid input"
      );
      return false;
    }

    // Validate timezone
    if (!isValidTimezone(tz)) {
      console.warn(`[TimezoneProvider] Invalid timezone for override: "${tz}"`);
      return false;
    }

    // Apply override
    console.log(`[TimezoneProvider] Override timezone set: ${tz}`);

    if (Settings.defaultZoneName !== tz) {
      Settings.defaultZoneName = tz;
    }

    setTimezone(tz);
    setSource("override");

    // Note: ready state remains true since we already validated

    return true;
  };

  // ---------------------------------------------------------------------------
  // CONTEXT VALUE MEMOIZATION
  // ---------------------------------------------------------------------------
  const contextValue = useMemo(
    () => ({
      timezone,
      source,
      ready,
      setTimezoneOverride,
    }),
    [timezone, source, ready]
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <TimezoneContext.Provider value={contextValue}>
      {children}
    </TimezoneContext.Provider>
  );
}

TimezoneProvider.propTypes = {
  children: PropTypes.node.isRequired,
  saveProfileTz: PropTypes.bool,
};

// ============================================================================
// HOOK: useAppTimezone
// ============================================================================
/**
 * Hook to access timezone context from TimezoneProvider
 * @returns {{timezone: string|undefined, source: string|undefined, ready: boolean, setTimezoneOverride: (tz: string) => boolean}}
 * @throws {Error} If used outside TimezoneProvider
 */
export function useAppTimezone() {
  const context = useContext(TimezoneContext);

  if (!context) {
    throw new Error("useAppTimezone must be used within a TimezoneProvider");
  }

  return context;
}

// ============================================================================
// EXPORTS
// ============================================================================
export default TimezoneProvider;
