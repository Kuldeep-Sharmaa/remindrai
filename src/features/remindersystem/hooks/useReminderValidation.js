import { useCallback } from "react";
import { DateTime } from "luxon";

const DEFAULT_MIN_PROMPT_LENGTH = 1;
const DEFAULT_MIN_PROMPT_LENGTH_AI = 8;
const DEFAULT_MAX_WEEKDAYS = 4;
const VALID_FREQUENCIES = ["one_time", "daily", "weekly"];

// catches keyboard mash and garbage input before it wastes a draft slot
function isWeakInput(text) {
  if (!text) return true;

  const clean = text.trim();

  if (clean.length < 5) return true;

  // single long word with no spaces = keyboard mash e.g. "kjojogioiepefsdfsdfd"
  if (!clean.includes(" ") && clean.length > 12) return true;

  // needs at least 2 words — "asdasd bug" still passes otherwise
  const words = clean.split(/\s+/);
  if (words.length < 2) return true;

  // repeated single character e.g. "aaaaaaaaaaaaaaa"
  if (/^(.)\1+$/.test(clean)) return true;

  // mostly non-letter characters = noise
  const alphaRatio = clean.replace(/[^a-zA-Z]/g, "").length / clean.length;
  if (alphaRatio < 0.5) return true;

  // at least 1 word must look real (3+ chars with a vowel)
  // catches "kdvkd d d d d" and "idvisdjifoifa kdvkd" style garbage
  const hasVowel = /[aeiouAEIOU]/;
  const realWordCount = words.filter(
    (w) => w.length >= 3 && hasVowel.test(w),
  ).length;
  if (realWordCount === 0) return true;

  // real English has ~35%+ vowels — keyboard mash has almost none
  // threshold at 0.12 to catch obvious garbage without blocking real short inputs
  const vowelCount = clean.replace(/[^aeiouAEIOU]/g, "").length;
  const vowelRatio = vowelCount / clean.replace(/\s/g, "").length;
  if (vowelRatio < 0.12) return true;

  return false;
}

function normalizeWeekdays(input) {
  if (!Array.isArray(input)) return null;
  const map = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7 };
  const out = [];
  for (const v of input) {
    if (typeof v === "number" && v >= 1 && v <= 7) {
      out.push(v);
      continue;
    }
    if (typeof v === "string") {
      const s = v.trim();
      if (/^[1-7]$/.test(s)) {
        out.push(Number(s));
        continue;
      }
      const key = s.slice(0, 3).toLowerCase();
      if (map[key]) {
        out.push(map[key]);
        continue;
      }
    }
    return null;
  }
  return Array.from(new Set(out)).sort((a, b) => a - b);
}

function computeNextRunIso(schedule) {
  const { kind, timezone, localTime, localDate, daysOfWeek } = schedule;
  if (!timezone || !localTime) return null;

  const tmMatch = /^(\d{1,2}):(\d{2})$/.exec(localTime.trim());
  if (!tmMatch) return null;
  const hh = Number(tmMatch[1]);
  const mm = Number(tmMatch[2]);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;

  try {
    const now = DateTime.now().setZone(timezone);
    if (kind === "one_time") {
      if (!localDate) return null;
      const candidate = DateTime.fromISO(
        `${localDate}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`,
        { zone: timezone },
      );
      if (!candidate.isValid) return null;
      if (candidate <= now) return null;
      return candidate.toUTC().toISO();
    }

    if (kind === "daily") {
      let candidate = now.set({
        hour: hh,
        minute: mm,
        second: 0,
        millisecond: 0,
      });
      if (candidate <= now) candidate = candidate.plus({ days: 1 });
      return candidate.toUTC().toISO();
    }

    if (kind === "weekly") {
      if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) return null;
      const todayWeekday = now.weekday;
      let smallestCandidate = null;
      for (const d of daysOfWeek) {
        let daysToAdd = d - todayWeekday;
        if (daysToAdd < 0) daysToAdd += 7;
        let candidate = now.plus({ days: daysToAdd }).set({
          hour: hh,
          minute: mm,
          second: 0,
          millisecond: 0,
        });
        if (candidate <= now && daysToAdd === 0)
          candidate = candidate.plus({ days: 7 });
        if (!smallestCandidate || candidate < smallestCandidate)
          smallestCandidate = candidate;
      }
      if (!smallestCandidate) return null;
      return smallestCandidate.toUTC().toISO();
    }
  } catch {
    return null;
  }
  return null;
}

export function validateReminderPure(params = {}, options = {}) {
  const {
    reminderType,
    aiPrompt,
    message,
    prompt: legacyPrompt,
    frequency,
    scheduleWithTZ = {},
  } = params;

  const MIN_PROMPT =
    typeof options.minPromptLength === "number"
      ? options.minPromptLength
      : DEFAULT_MIN_PROMPT_LENGTH;
  const MIN_PROMPT_AI =
    typeof options.minPromptLengthForAI === "number"
      ? options.minPromptLengthForAI
      : DEFAULT_MIN_PROMPT_LENGTH_AI;
  const MAX_WEEKDAYS =
    typeof options.maxWeekdays === "number"
      ? options.maxWeekdays
      : DEFAULT_MAX_WEEKDAYS;

  const normalizedType =
    typeof reminderType === "string" && reminderType.toLowerCase() === "ai"
      ? "AI"
      : "SIMPLE";

  const rawAi = typeof aiPrompt === "string" ? aiPrompt : undefined;
  const rawMsg = typeof message === "string" ? message : undefined;
  const fallback = typeof legacyPrompt === "string" ? legacyPrompt : "";

  const content = {};
  if (normalizedType === "AI") {
    const candidate = (rawAi ?? fallback ?? "").trim();
    if (!candidate || candidate.length < MIN_PROMPT_AI) {
      return {
        ok: false,
        errorCode: "PROMPT_TOO_SHORT",
        errors: {
          aiPrompt: `Prompt must be at least ${MIN_PROMPT_AI} characters.`,
        },
      };
    }

    // catches garbage like "kjojogioiepefsdfsdfd" — no point saving a draft slot for this
    if (isWeakInput(candidate)) {
      return {
        ok: false,
        errorCode: "WEAK_INPUT",
        errors: {
          aiPrompt:
            "This doesn’t look like a clear idea yet. Try one of the suggestions below.",
        },
      };
    }

    content.aiPrompt = candidate.slice(0, 2000);
  } else {
    const candidate = (rawMsg ?? fallback ?? "").trim();
    if (!candidate || candidate.length < MIN_PROMPT) {
      return {
        ok: false,
        errorCode: "PROMPT_TOO_SHORT",
        errors: {
          message: `Message must be at least ${MIN_PROMPT} characters.`,
        },
      };
    }
    content.message = candidate.slice(0, 2000);
  }

  if (!VALID_FREQUENCIES.includes(frequency)) {
    return {
      ok: false,
      errorCode: "FREQUENCY_INVALID",
      errors: { frequency: "Invalid reminder frequency selected." },
    };
  }

  const tz =
    typeof scheduleWithTZ?.timezone === "string" &&
    scheduleWithTZ.timezone.length > 0
      ? scheduleWithTZ.timezone
      : Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!tz || typeof tz !== "string") {
    return {
      ok: false,
      errorCode: "TIMEZONE_MISSING",
      errors: { timezone: "Timezone is missing or invalid." },
    };
  }
  const tzCheck = DateTime.now().setZone(tz);
  if (!tzCheck.isValid) {
    return {
      ok: false,
      errorCode: "TIMEZONE_MISSING",
      errors: { timezone: "Timezone is missing or invalid." },
    };
  }

  const timeRaw =
    scheduleWithTZ?.timeOfDay ||
    scheduleWithTZ?.time ||
    scheduleWithTZ?.timeLocal ||
    "";
  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec((timeRaw || "").trim());
  if (!timeMatch) {
    return {
      ok: false,
      errorCode: "TIME_FORMAT_INVALID",
      errors: { time: "Time must be in HH:mm format." },
    };
  }
  const hh = Number(timeMatch[1]);
  const mm = Number(timeMatch[2]);
  const canonicalLocalTime = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

  const normalizedSchedule = {
    kind: frequency,
    timezone: tz,
    localTime: canonicalLocalTime,
  };

  if (frequency === "one_time") {
    const dateRaw = scheduleWithTZ?.date;
    if (!dateRaw) {
      return {
        ok: false,
        errorCode: "DATE_MISSING",
        errors: { date: "Please select a valid date." },
      };
    }

    const candidate = DateTime.fromISO(`${dateRaw}T${canonicalLocalTime}`, {
      zone: tz,
    });
    const now = DateTime.now().setZone(tz);
    if (!candidate.isValid) {
      return {
        ok: false,
        errorCode: "DATE_INVALID",
        errors: { date: "Selected date or time is invalid." },
      };
    }
    if (candidate <= now) {
      return {
        ok: false,
        errorCode: "TIME_IN_PAST",
        errors: {
          time: "Selected time must be in the future.",
          date: "Please choose a future date.",
        },
      };
    }

    normalizedSchedule.localDate = dateRaw;
  }

  if (frequency === "weekly") {
    const rawW =
      scheduleWithTZ?.weekDays ??
      scheduleWithTZ?.daysOfWeek ??
      scheduleWithTZ?.weekdays;
    const normWd = normalizeWeekdays(rawW);
    if (!Array.isArray(normWd) || normWd.length === 0) {
      return {
        ok: false,
        errorCode: "WEEKDAYS_MISSING",
        errors: { weekDays: "Please select at least one weekday." },
      };
    }
    if (normWd.length > DEFAULT_MAX_WEEKDAYS) {
      return {
        ok: false,
        errorCode: "WEEKDAYS_TOO_MANY",
        errors: {
          weekDays: `You can only select a maximum of ${DEFAULT_MAX_WEEKDAYS} days per week.`,
        },
      };
    }
    normalizedSchedule.daysOfWeek = normWd;
  }

  const nextRunIso = computeNextRunIso(normalizedSchedule);
  if (!nextRunIso) {
    return {
      ok: false,
      errorCode: "NEXT_RUN_FAILED",
      errors: {
        nextRun:
          "Next run time could not be computed. Please check your schedule.",
      },
    };
  }

  return {
    ok: true,
    normalized: {
      type: normalizedType,
      content,
      schedule: normalizedSchedule,
      nextRunUtc: nextRunIso,
    },
  };
}

export default function useReminderValidation(defaultOptions = {}) {
  const validate = useCallback(
    (params = {}) => validateReminderPure(params, defaultOptions),
    [defaultOptions],
  );
  return { validate };
}
