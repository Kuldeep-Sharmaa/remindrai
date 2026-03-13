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

// English locale ensures consistent date/time formatting regardless of browser language.
Settings.defaultLocale = "en";

const TimezoneContext = createContext({
  timezone: undefined,
  source: undefined, // profile | device | override
  ready: false,
  setTimezoneOverride: () => false,
});

// Tries Intl API first, falls back to Luxon, then UTC as last resort.
function detectDeviceTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && IANAZone.isValidZone(tz)) return tz;
  } catch (e) {
    console.warn("[TimezoneProvider] Intl API failed:", e);
  }

  try {
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

  console.warn("[TimezoneProvider] All detection methods failed, using UTC");
  return "UTC";
}

function isValidTimezone(tz) {
  if (!tz || typeof tz !== "string") return false;

  try {
    if (IANAZone.isValidZone(tz)) return true;
    // DateTime validation as fallback for edge cases IANAZone misses
    return DateTime.now().setZone(tz).isValid;
  } catch (e) {
    return false;
  }
}

export function TimezoneProvider({ children, saveProfileTz = false }) {
  const { currentUser, authLoading, hasLoadedProfile } = useAuthContext();

  const [timezone, setTimezone] = useState(undefined);
  const [source, setSource] = useState(undefined);
  const [ready, setReady] = useState(false);

  // Tracks the previous user so we can detect sign-out and user switches.
  const prevUserIdRef = useRef(null);

  useEffect(() => {
    // Wait until auth and profile are fully loaded before resolving timezone.
    if (authLoading || !hasLoadedProfile) return;

    const currentUserId = currentUser?.uid || null;
    const prevUserId = prevUserIdRef.current;
    const deviceTz = detectDeviceTimezone();

    // On sign-out or user switch, reset to device timezone so the previous
    // user's settings don't leak into the next session.
    if (!currentUserId || (prevUserId && currentUserId !== prevUserId)) {
      console.log(
        "[TimezoneProvider] User signed out or changed, resetting to device timezone",
      );

      if (Settings.defaultZoneName !== deviceTz)
        Settings.defaultZoneName = deviceTz;

      setTimezone(deviceTz);
      setSource("device");
      setReady(true);
      prevUserIdRef.current = currentUserId;
      return;
    }

    // Profile timezone can live in multiple locations depending on when/how it was set.
    const profileTz =
      currentUser?.timezone ||
      currentUser?.preferences?.timezone ||
      currentUser?.profile?.timezone ||
      null;

    if (profileTz && isValidTimezone(profileTz)) {
      // Only update the Luxon global when the value actually changes to reduce churn.
      if (Settings.defaultZoneName !== profileTz) {
        console.log(
          `[TimezoneProvider] Setting profile timezone: ${profileTz}`,
        );
        Settings.defaultZoneName = profileTz;
      }

      setTimezone(profileTz);
      setSource("profile");
      setReady(true);
      prevUserIdRef.current = currentUserId;
      return;
    }

    if (profileTz && !isValidTimezone(profileTz)) {
      console.warn(
        `[TimezoneProvider] Invalid profile timezone: "${profileTz}", falling back to device`,
      );
    } else {
      console.log(
        "[TimezoneProvider] No profile timezone found, using device timezone",
      );
    }

    if (Settings.defaultZoneName !== deviceTz)
      Settings.defaultZoneName = deviceTz;

    setTimezone(deviceTz);
    setSource("device");
    setReady(true);
    prevUserIdRef.current = currentUserId;

    // Intentionally not writing to Firestore here — this provider only manages
    // state. If saveProfileTz is enabled, the actual write is the caller's responsibility.
    if (saveProfileTz && currentUserId && !profileTz) {
      console.log(
        `[TimezoneProvider] saveProfileTz enabled, device TZ (${deviceTz}) should be saved by parent logic`,
      );
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

  /**
   * Allows runtime timezone override, e.g. from a settings UI.
   * Returns false if the timezone string is invalid.
   */
  const setTimezoneOverride = (tz) => {
    if (!tz || typeof tz !== "string") {
      console.warn(
        "[TimezoneProvider] setTimezoneOverride called with invalid input",
      );
      return false;
    }

    if (!isValidTimezone(tz)) {
      console.warn(`[TimezoneProvider] Invalid timezone for override: "${tz}"`);
      return false;
    }

    console.log(`[TimezoneProvider] Override timezone set: ${tz}`);

    if (Settings.defaultZoneName !== tz) Settings.defaultZoneName = tz;

    setTimezone(tz);
    setSource("override");
    return true;
  };

  const contextValue = useMemo(
    () => ({ timezone, source, ready, setTimezoneOverride }),
    [timezone, source, ready],
  );

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

export function useAppTimezone() {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error("useAppTimezone must be used within a TimezoneProvider");
  }
  return context;
}

export default TimezoneProvider;
