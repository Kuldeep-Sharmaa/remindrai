// src/features/remindersystem/hooks/useNextRun.js
// ----------------------------------------------------------------------------
// Purpose: Given `{ frequency, schedule }`, compute canonical next-run UTC ISO
// and a human-friendly display string. Accepts either legacy schedule keys
// (timeOfDay/date/weekDays) or normalized keys (localTime/localDate/daysOfWeek).
// ----------------------------------------------------------------------------

import { useMemo } from "react";
import {
  computeNextRunFromSchedule,
  formatNextRunForDisplay,
} from "../utils/scheduleUtils";

// Toggle debug output while troubleshooting (false in prod)
const DEBUG = false;

/**
 * to24HourHHmm(raw)
 * Robustly parse a variety of time inputs into canonical "HH:mm".
 * Accepts: "12:04 PM", "12:04 pm", "9:05 am", "09:05", "9", "09.05", "09:05:00"
 * Returns "HH:mm" (24-hour) or null when it can't parse.
 */
function to24HourHHmm(raw) {
  if (!raw || typeof raw !== "string") return null;
  let s = raw.trim();

  // Detect AM/PM token
  const ampmMatch = s.match(/\b(am|pm|AM|PM|a\.m\.|p\.m\.)\b/);
  let isPm = false;
  let isAm = false;
  if (ampmMatch) {
    const token = ampmMatch[0].toLowerCase();
    if (token.startsWith("p")) isPm = true;
    if (token.startsWith("a")) isAm = true;
    s = s.replace(/\b(am|pm|AM|PM|a\.m\.|p\.m\.)\b/gi, "").trim();
  }

  // Remove leftover seconds or extra tokens, keep only first two numeric parts
  // Accept separators ":" or "." or space
  const cleaned = s
    .replace(/[^\d:.\s]/g, "")
    .split(/[:.\s]+/)
    .filter(Boolean)
    .slice(0, 2);

  if (cleaned.length === 0) return null;

  const hStr = cleaned[0];
  const mStr = cleaned[1] || "0";

  let h = Number(hStr);
  let m = Number(mStr);

  if (Number.isNaN(h) || Number.isNaN(m)) return null;

  // Apply AM/PM adjustments
  if (isPm && h < 12) h += 12;
  if (isAm && h === 12) h = 0;

  // clamp
  h = Math.max(0, Math.min(23, h));
  m = Math.max(0, Math.min(59, m));

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * normalizeScheduleForUtils(schedule)
 * Accepts either:
 *  - { timezone, timeOfDay, date, weekDays }  (legacy)
 *  - { timezone, localTime, localDate, daysOfWeek } (new)
 * Returns the canonical shape expected by computeNextRunFromSchedule:
 *  { timezone, timeOfDay, date, weekDays }
 */
function normalizeScheduleForUtils(schedule = {}) {
  if (!schedule || typeof schedule !== "object") return null;

  const timezone = schedule.timezone || schedule.tz || null;

  // time: prefer localTime, fallback to timeOfDay/time/timeLocal
  let rawTime =
    schedule.localTime ||
    schedule.timeOfDay ||
    schedule.time ||
    schedule.timeLocal ||
    null;

  // Use robust parser to convert to "HH:mm" (24-hour), or null if parsing fails
  let timeOfDay = to24HourHHmm(rawTime);

  // date: prefer localDate, fallback to date
  let date = schedule.localDate || schedule.date || null;
  if (typeof date === "string" && date.length > 0) {
    date = date;
  } else {
    date = null;
  }

  // weekdays: prefer daysOfWeek (numbers) fallback to weekDays / weekdays
  const rawWd =
    schedule.daysOfWeek ||
    schedule.weekDays ||
    schedule.weekdays ||
    schedule.weekDaysList ||
    null;

  // normalize rawWd to an array of numbers 1..7 if possible
  let weekDays = null;
  if (Array.isArray(rawWd)) {
    weekDays = rawWd.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
  } else if (typeof rawWd === "string" && rawWd.length > 0) {
    // CSV like "1,2,3" or "1, 2, 3"
    weekDays = rawWd
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((v) => Number(v))
      .filter((n) => !Number.isNaN(n));
  }

  // final defensive trimming: ensure weekdays are in 1..7 and unique
  if (Array.isArray(weekDays)) {
    weekDays = Array.from(new Set(weekDays))
      .map((n) => (n >= 1 && n <= 7 ? n : null))
      .filter((n) => n !== null);
    // keep natural ascending order
    weekDays.sort((a, b) => a - b);
  }

  const canonical = {
    timezone,
    timeOfDay, // "HH:mm" or null
    date, // "YYYY-MM-DD" or null
    weekDays, // [1..7] or null
  };

  if (DEBUG) {
    console.groupCollapsed("[DEBUG] normalizeScheduleForUtils");
    console.log("input schedule:", schedule);
    console.log("canonical:", canonical);
    console.groupEnd();
  }

  return canonical;
}

/**
 * useNextRun
 * @param {Object} params
 * @param {'one_time'|'daily'|'weekly'} params.frequency
 * @param {Object} params.schedule - flexible schedule shape (see above)
 * @param {boolean} params.enabled - if false, computation is short-circuited
 * @returns {Object} { nextRunIso, nextRunHuman, isValid }
 */
export default function useNextRun({ frequency, schedule, enabled = true }) {
  const normalized = useMemo(() => {
    if (!enabled) return null;
    return normalizeScheduleForUtils(schedule);
  }, [
    enabled,
    schedule?.timezone,
    schedule?.tz,
    schedule?.localTime,
    schedule?.timeOfDay,
    schedule?.time,
    schedule?.timeLocal,
    schedule?.localDate,
    schedule?.date,
    (Array.isArray(schedule?.daysOfWeek)
      ? schedule.daysOfWeek.join(",")
      : schedule?.daysOfWeek) ||
      (Array.isArray(schedule?.weekDays)
        ? schedule.weekDays.join(",")
        : schedule?.weekDays) ||
      "",
  ]);

  if (DEBUG) {
    console.groupCollapsed("[DEBUG] useNextRun computeNextRun input");
    console.log("frequency:", frequency);
    console.log("original schedule (hook received):", schedule);
    console.log("normalized schedule (passed to util):", normalized);
    console.groupEnd();
  }

  const nextRunIso = useMemo(() => {
    try {
      if (!enabled || !normalized) return null;
      // computeNextRunFromSchedule MUST accept { frequency, schedule: { timezone, timeOfDay, date, weekDays } }
      const iso = computeNextRunFromSchedule({
        frequency,
        schedule: {
          // computeNextRunFromSchedule is defensive but pass canonical fields explicitly
          timezone: normalized.timezone,
          timeOfDay: normalized.timeOfDay,
          date: normalized.date,
          weekDays: normalized.weekDays,
        },
      });
      return iso || null;
    } catch (err) {
      if (DEBUG) {
        console.error("[DEBUG] useNextRun computeNextRun error", err);
      }
      // swallow; calling code handles lack of validity
      return null;
    }
  }, [enabled, frequency, normalized]);

  const nextRunHuman = useMemo(() => {
    if (!nextRunIso) return null;
    try {
      return formatNextRunForDisplay(nextRunIso);
    } catch {
      return nextRunIso;
    }
  }, [nextRunIso]);

  return {
    nextRunIso,
    nextRunHuman,
    isValid: !!nextRunIso,
  };
}
