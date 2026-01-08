// src/features/remindersystem/utils/scheduleUtils.js
// Improved, pragmatic scheduling utilities (Luxon). Minimal, robust, deterministic.

import { DateTime, Settings, IANAZone } from "luxon";

// Consistent English formatting
Settings.defaultLocale = "en";

/**
 * toUtcIso(dt: DateTime) => string|null
 * Returns stable UTC ISO without milliseconds (easier comparisons).
 */
function toUtcIso(dt) {
  if (!dt || !dt.isValid) return null;
  // suppress milliseconds for stable stored values
  return dt.toUTC().toISO({ suppressMilliseconds: true });
}

/**
 * parseNow(now, tz) -> DateTime
 * Accepts:
 *  - Luxon DateTime => returned as-is (but forced to tz)
 *  - JS Date => DateTime.fromJSDate
 *  - number => epoch seconds or ms heuristic
 *  - string => ISO parse
 *  - undefined => DateTime.now()
 *
 * Always returns a DateTime set to the provided tz.
 */
function parseNowToZone(now, tz) {
  let dt;
  if (!now) {
    dt = DateTime.now();
  } else if (now instanceof DateTime) {
    dt = now;
  } else if (now instanceof Date) {
    dt = DateTime.fromJSDate(now);
  } else if (typeof now === "number") {
    // heuristic: >1e12 assume ms, >1e9 assume seconds
    if (now > 1e12) dt = DateTime.fromMillis(now);
    else if (now > 1e9) dt = DateTime.fromSeconds(now);
    else dt = DateTime.fromMillis(now); // fallback
  } else if (typeof now === "string") {
    // try ISO first
    const asIso = DateTime.fromISO(now);
    if (asIso.isValid) dt = asIso;
    else {
      // try JS Date parsing as fallback
      const parsed = Date.parse(now);
      dt = Number.isFinite(parsed)
        ? DateTime.fromMillis(parsed)
        : DateTime.now();
    }
  } else {
    // unknown -> now
    dt = DateTime.now();
  }

  // force zone (preserve absolute time)
  try {
    return dt.setZone(tz, { keepLocalTime: false });
  } catch {
    return dt.setZone(tz);
  }
}

/**
 * Safely set local time on a given DateTime date (preserves date components).
 * If the requested local time is invalid (e.g., DST skip), attempts to advance up to
 * `maxShiftMinutes` to find the nearest valid local time. Returns null if none found.
 */
function buildCandidateForDate(dateDt, hour, minute, tz, maxShiftMinutes = 60) {
  if (!dateDt || !dateDt.isValid) return null;
  // create candidate set in target zone (dateDt already has zone)
  let candidate = dateDt.set({
    hour: Number(hour),
    minute: Number(minute),
    second: 0,
    millisecond: 0,
  });

  if (candidate.isValid) return candidate.setZone(tz, { keepLocalTime: true });

  // If invalid (common on DST forward gaps), try small forward shifts up to maxShiftMinutes
  let shifted = candidate;
  const maxAttempts = Math.ceil(maxShiftMinutes); // minute-step attempts
  for (let i = 1; i <= maxAttempts; i++) {
    shifted = candidate.plus({ minutes: i });
    if (shifted.isValid) {
      // Found nearest valid local time — warn in dev
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          `buildCandidateForDate: requested local time invalid (DST gap). shifted forward ${i} minute(s).`
        );
      }
      return shifted.setZone(tz, { keepLocalTime: true });
    }
  }

  // give up
  return null;
}

/* ---------------------------
   Validate schedule shape
   --------------------------- */
export function isValidSchedule(frequency, schedule = {}) {
  if (!schedule || typeof schedule !== "object") {
    return { ok: false, error: "Missing schedule" };
  }

  const tz =
    typeof schedule.timezone === "string" && schedule.timezone.length
      ? schedule.timezone
      : "UTC";

  if (!IANAZone.isValidZone(tz))
    return { ok: false, error: "Invalid timezone" };

  if (!schedule.timeOfDay || !/^\d{1,2}:\d{2}$/.test(schedule.timeOfDay)) {
    return {
      ok: false,
      error: "Invalid or missing timeOfDay (expected HH:mm)",
    };
  }
  const [hStr, mStr] = schedule.timeOfDay.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    return { ok: false, error: "Invalid timeOfDay values" };
  }

  if (frequency === "one_time") {
    if (!schedule.date)
      return { ok: false, error: "Missing date for one_time schedule" };
    const d = DateTime.fromISO(schedule.date, { zone: tz });
    if (!d.isValid)
      return { ok: false, error: "Invalid date for one_time schedule" };
  }

  if (frequency === "weekly") {
    if (!Array.isArray(schedule.weekDays) || schedule.weekDays.length === 0) {
      return {
        ok: false,
        error: "weekDays must be a non-empty array for weekly schedule",
      };
    }
    for (const v of schedule.weekDays) {
      if (![1, 2, 3, 4, 5, 6, 7].includes(v))
        return { ok: false, error: "weekDays values must be 1..7" };
    }
    // keep your existing business rule: max 4 weekdays
    if (schedule.weekDays.length > 4) {
      return {
        ok: false,
        error: "Maximum of 4 weekdays allowed for weekly schedule.",
      };
    }
  }

  return { ok: true };
}

/* ---------------------------
   Core: computeNextRunFromSchedule
   --------------------------- */
/**
 * Compute the next run as UTC ISO string (suppress ms) or null.
 * Accepts `now` as DateTime|Date|number|string|undefined.
 */
export function computeNextRunFromSchedule(
  { frequency, schedule },
  now = undefined
) {
  if (!schedule || typeof schedule !== "object") return null;
  const tz =
    typeof schedule.timezone === "string" && schedule.timezone.length
      ? schedule.timezone
      : "UTC";
  if (!IANAZone.isValidZone(tz)) return null;

  // parse now into zone-aware DateTime
  const nowDt = parseNowToZone(now, tz);

  // parse timeOfDay into hour/min
  const tod =
    typeof schedule.timeOfDay === "string" && schedule.timeOfDay.length
      ? schedule.timeOfDay
      : "09:00";
  const [hourStr = "9", minuteStr = "0"] = tod.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

  try {
    if (frequency === "one_time") {
      if (!schedule.date) return null;
      const dateDt = DateTime.fromISO(schedule.date, { zone: tz });
      if (!dateDt.isValid) return null;

      const candidate = buildCandidateForDate(dateDt, hour, minute, tz);
      if (!candidate) return null;
      // must be strictly in the future relative to nowDt
      if (candidate <= nowDt) return null;
      return toUtcIso(candidate);
    }

    if (frequency === "daily") {
      // today's date at timeOfDay in tz
      const today = nowDt.startOf("day");
      let candidate = buildCandidateForDate(today, hour, minute, tz);
      if (!candidate) return null;
      if (candidate <= nowDt) {
        // next day
        const tomorrow = today.plus({ days: 1 });
        candidate = buildCandidateForDate(tomorrow, hour, minute, tz);
      }
      return candidate ? toUtcIso(candidate) : null;
    }

    if (frequency === "weekly") {
      const days =
        Array.isArray(schedule.weekDays) && schedule.weekDays.length
          ? schedule.weekDays.slice().sort((a, b) => a - b)
          : [nowDt.weekday];
      let best = null;
      const today = nowDt.weekday;
      for (const target of days) {
        if (typeof target !== "number") continue;
        let delta = target - today;
        if (delta < 0) delta += 7;
        // compute candidate date by adding delta days to current date (preserve local day)
        const targetDate = nowDt.plus({ days: delta }).startOf("day");
        let candidate = buildCandidateForDate(targetDate, hour, minute, tz);
        // if delta === 0 and candidate <= now, roll to next week for this day
        if (delta === 0 && candidate && candidate <= nowDt) {
          const nextWeekDate = targetDate.plus({ days: 7 });
          candidate = buildCandidateForDate(nextWeekDate, hour, minute, tz);
        }
        if (!candidate || !candidate.isValid) continue;
        if (!best || candidate < best) best = candidate;
      }
      return best ? toUtcIso(best) : null;
    }

    return null;
  } catch (err) {
    // dev-time debug output
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("computeNextRunFromSchedule error:", err);
    }
    return null;
  }
}

/* ---------------------------
   New: computeNextRunAfterTimezoneChange
   --------------------------- */
/**
 * computeNextRunAfterTimezoneChange
 *
 * Purpose:
 *  - When a user's profile timezone changes from `originalTz` -> `targetTz`,
 *    compute a new nextRunAtUTC so the reminder keeps the same *local wall-clock*
 *    time the user expects.
 *
 * Inputs:
 *  - reminder: { frequency, schedule } (schedule.timezone is expected to equal originalTz OR may be absent)
 *  - nextRunIsoUtc: existing nextRunAtUTC stored in DB (ISO string). If present and valid,
 *      we will map its local wall-clock components from originalTz -> targetTz.
 *  - originalTz: original IANA timezone string (if omitted we'll try to read from schedule.timezone)
 *  - targetTz: target IANA timezone string (required)
 *
 * Behavior summary:
 *  1. If nextRunIsoUtc is valid:
 *     - Parse it as UTC → convert to originalTz local → extract local time/date/weekday.
 *     - Build a new schedule preserving frequency and schedule semantics but with:
 *         - timeOfDay = same local hh:mm as derived
 *         - timezone = targetTz
 *         - for one_time: date = the local date (YYYY-MM-DD) from original (preserves intended day)
 *         - for weekly: preserve schedule.weekDays if present; otherwise use the weekday of the original next run.
 *     - Call computeNextRunFromSchedule on that new schedule (now = undefined; compute from now in target tz).
 *  2. If nextRunIsoUtc is missing/invalid:
 *     - Fallback: create scheduleCopy with timezone=targetTz and timeOfDay from schedule (no mapping),
 *       then call computeNextRunFromSchedule — this tries its best.
 *
 * Returns: ISO UTC string (suppress ms) or null.
 */
export function computeNextRunAfterTimezoneChange(
  { frequency, schedule },
  nextRunIsoUtc,
  originalTz,
  targetTz
) {
  try {
    if (!targetTz || !IANAZone.isValidZone(targetTz)) return null;

    // Determine original tz (prefer argument, fallback to schedule.timezone)
    let origTz = null;
    if (originalTz && IANAZone.isValidZone(originalTz)) {
      origTz = originalTz;
    } else if (
      schedule &&
      schedule.timezone &&
      IANAZone.isValidZone(schedule.timezone)
    ) {
      origTz = schedule.timezone;
    }

    // Defensive: if no original tz provided, fallback to computing next run directly in target
    if (!origTz) {
      // Build a schedule copy on target tz and compute
      const sCopy = {
        ...((schedule && typeof schedule === "object" && schedule) || {}),
        timezone: targetTz,
      };
      return computeNextRunFromSchedule(
        { frequency, schedule: sCopy },
        undefined
      );
    }

    // If nextRunIsoUtc exists and parses, use it to derive local components
    let mappedHour = null;
    let mappedMinute = null;
    let mappedDate = null; // 'YYYY-MM-DD' used for one_time
    let mappedWeekday = null; // number 1..7 used as fallback for weekly

    if (nextRunIsoUtc) {
      const parsed = DateTime.fromISO(nextRunIsoUtc, { zone: "utc" });
      if (parsed && parsed.isValid) {
        const localInOrig = parsed.setZone(origTz);
        mappedHour = localInOrig.hour;
        mappedMinute = localInOrig.minute;
        mappedDate = localInOrig.toISODate(); // YYYY-MM-DD
        mappedWeekday = localInOrig.weekday; // 1..7
      } else {
        // invalid nextRunIsoUtc -> treat as missing
        nextRunIsoUtc = null;
      }
    }

    // If we have mapping components, build a new schedule for target tz
    const newSchedule = {
      ...(schedule && typeof schedule === "object" ? { ...schedule } : {}),
      timezone: targetTz,
    };

    // if mapping available, override timeOfDay and one_time date as explained
    if (mappedHour !== null && mappedMinute !== null) {
      const hh = String(mappedHour).padStart(2, "0");
      const mm = String(mappedMinute).padStart(2, "0");
      newSchedule.timeOfDay = `${hh}:${mm}`;

      if (frequency === "one_time") {
        // Preserve the user's intended local date (as seen in original timezone)
        newSchedule.date = mappedDate; // ISO date string
      }

      if (frequency === "weekly") {
        // Preserve original schedule.weekDays if present. If absent, use mappedWeekday.
        if (
          !Array.isArray(newSchedule.weekDays) ||
          newSchedule.weekDays.length === 0
        ) {
          newSchedule.weekDays = [mappedWeekday];
        }
      }
    } else {
      // mapping not available — fallback: keep existing timeOfDay (if any)
      // and rely on computeNextRunFromSchedule with the target timezone.
      newSchedule.timeOfDay =
        (schedule && schedule.timeOfDay) || newSchedule.timeOfDay || "09:00";
    }

    // Final compute using computeNextRunFromSchedule, now that schedule is in target tz
    const newNext = computeNextRunFromSchedule({
      frequency,
      schedule: newSchedule,
    });

    // Defensive: if computeNextRunFromSchedule returned null and we had mapping,
    // attempt a direct candidate for the mapped date/time (good for one_time corner-cases)
    if (
      !newNext &&
      mappedHour !== null &&
      mappedMinute !== null &&
      frequency === "one_time" &&
      mappedDate
    ) {
      const candidateDate = DateTime.fromISO(mappedDate, { zone: targetTz });
      const candidate = buildCandidateForDate(
        candidateDate,
        mappedHour,
        mappedMinute,
        targetTz,
        90
      );
      if (candidate && candidate.isValid) {
        return toUtcIso(candidate);
      }
    }

    return newNext || null;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("computeNextRunAfterTimezoneChange error:", err);
    }
    return null;
  }
}

/* ---------------------------
   Convenience wrapper
   --------------------------- */
export function computeNextRun(reminderOrOpts) {
  if (!reminderOrOpts) return null;
  const frequency =
    reminderOrOpts.frequency ||
    (reminderOrOpts?.schedule && reminderOrOpts?.schedule.frequency);
  const schedule = reminderOrOpts.schedule || null;
  return computeNextRunFromSchedule({ frequency, schedule });
}

/* ---------------------------
   computeNextRuns (N upcoming)
   --------------------------- */
export function computeNextRuns(
  { frequency, schedule },
  count = 3,
  maxAttempts = 50
) {
  if (!schedule || typeof schedule !== "object") return [];
  const results = [];
  let attempts = 0;

  // start from now in schedule timezone
  let currentNow = DateTime.now().setZone(
    (schedule && schedule.timezone) || "UTC"
  );

  while (results.length < count && attempts < maxAttempts) {
    const nextIso = computeNextRunFromSchedule(
      { frequency, schedule },
      currentNow
    );
    if (!nextIso) break;
    results.push(nextIso);
    // advance currentNow slightly past this next run (1 second past)
    currentNow = DateTime.fromISO(nextIso, {
      zone: schedule && schedule.timezone ? schedule.timezone : "UTC",
    }).plus({ seconds: 1 });
    attempts++;
  }

  return results;
}

/* ---------------------------
   formatIsoForDisplay (local friendly, returns '-' if invalid)
   --------------------------- */
export function formatIsoForDisplay(isoUtc, localeZone = undefined) {
  if (!isoUtc) return "-";
  try {
    const dt = DateTime.fromISO(isoUtc, { zone: "utc" });
    if (!dt.isValid) return "-";
    const zone = localeZone || DateTime.local().zoneName;
    return dt
      .setZone(zone)
      .setLocale("en")
      .toLocaleString(DateTime.DATETIME_MED);
  } catch (e) {
    return "-";
  }
}

/* ---------------------------
   formatNextRunForDisplay
   Returns: "Monday, Oct 27, 9:00 PM"
   --------------------------- */
export function formatNextRunForDisplay(isoUtc) {
  if (!isoUtc) return "Waiting for a valid schedule...";
  try {
    const dtUtc = DateTime.fromISO(isoUtc, { zone: "utc" });
    if (!dtUtc.isValid) return "Invalid Time Format";
    const dtLocal = dtUtc.toLocal().setLocale("en");
    const formatted = dtLocal.toFormat("cccc, LLL dd, h:mm a");
    return formatted;
  } catch (e) {
    if (process.env.NODE_ENV !== "production")
      console.error("formatNextRunForDisplay error", e);
    return "Error formatting time.";
  }
}

export default {
  isValidSchedule,
  computeNextRunFromSchedule,
  computeNextRunAfterTimezoneChange,
  computeNextRun,
  computeNextRuns,
  formatIsoForDisplay,
  formatNextRunForDisplay,
};
