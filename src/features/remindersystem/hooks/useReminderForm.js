/**
 * useReminderForm.js
 *
 * Main hook for reminder creation form.
 * Validates locally, saves intent to backend.
 * Backend owns execution timing - we only show preview to user.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { DateTime } from "luxon";
import client from "../services/remindrClient";
import { useAuthContext } from "../../../context/AuthContext";
import { useAppTimezone } from "../../../context/TimezoneProvider";

import useNextRun from "./useNextRun";
import useReminderValidation from "./useReminderValidation";

const LS_PROMPT_KEY = "remindr_prompt_autosave_v1";

function safeLocalGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeLocalSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}
function safeLocalRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function makeDefaultSchedule(confirmedTimezone) {
  const timezone =
    confirmedTimezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "UTC";

  const now = DateTime.now().setZone(timezone);
  const defaultTime = now
    .plus({ minutes: 5 })
    .set({ second: 0, millisecond: 0 });

  return {
    timezone,
    timeOfDay: defaultTime.toFormat("HH:mm"),
    date: defaultTime.toISODate(),
    weekDays: [defaultTime.weekday],
  };
}

export default function useReminderForm(opts = {}) {
  const { user: userProfile } = useAuthContext();
  const { timezone: providerTimezone } = useAppTimezone();
  const initial = opts.initial ?? null;
  const onSaved = typeof opts.onSaved === "function" ? opts.onSaved : null;

  const [isActive, setIsActive] = useState(false);

  const activate = useCallback(() => {
    if (!isActive) setIsActive(true);
  }, [isActive]);

  const { validate: validateReminder } = useReminderValidation({
    enabled: isActive,
  });

  const [prompt, setPrompt] = useState(() => {
    if (initial?.prompt) return initial.prompt;
    return safeLocalGet(LS_PROMPT_KEY) || "";
  });

  const [platform, setPlatform] = useState(() => {
    if (initial?.platform) return initial.platform;
    if (userProfile?.platform) return userProfile.platform;
    return "linkedin";
  });

  const [tone, setTone] = useState(
    () =>
      initial?.tone ||
      userProfile?.tone ||
      userProfile?.preferences?.tone ||
      "friendly",
  );

  const [frequency, setFrequency] = useState(
    () => initial?.frequency || "one_time",
  );

  const [scheduleInternal, setScheduleInternal] = useState(() => {
    return initial?.schedule
      ? { ...initial.schedule }
      : makeDefaultSchedule(providerTimezone);
  });

  const [saving, setSaving] = useState(false);
  const [generating] = useState(false);
  const [lastError, setLastError] = useState(null);

  const apiInFlightRef = useRef(false);
  const saveAbortControllerRef = useRef(null);
  const lastIdempotencyKeyRef = useRef(null);
  const unmountedRef = useRef(false);

  const setPromptInternal = useCallback(
    (val) => {
      activate();
      setPrompt(val);
    },
    [activate],
  );
  const setPlatformInternal = useCallback(
    (val) => {
      activate();
      setPlatform(val);
    },
    [activate],
  );
  const setToneInternal = useCallback(
    (val) => {
      activate();
      setTone(val);
    },
    [activate],
  );
  const setFrequencyInternal = useCallback(
    (val) => {
      activate();
      setFrequency(val);
    },
    [activate],
  );

  const setSchedule = useCallback(
    (partial) => {
      activate();
      setScheduleInternal((prev) => ({ ...(prev || {}), ...(partial || {}) }));
    },
    [activate],
  );

  const scheduleWithTZ = useMemo(() => {
    const tz =
      scheduleInternal?.timezone ||
      providerTimezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC";

    return {
      timezone: tz,
      timeOfDay: scheduleInternal?.timeOfDay || "09:00",
      date: scheduleInternal?.date,
      weekDays: Array.isArray(scheduleInternal?.weekDays)
        ? scheduleInternal.weekDays
        : [],
    };
  }, [scheduleInternal, providerTimezone]);

  const { nextRunIso: nextRunIsoFromHook, nextRunHuman: nextRunHumanFromHook } =
    useNextRun({
      frequency,
      schedule: scheduleWithTZ,
      enabled: isActive,
    });

  const uiValidation = useMemo(() => {
    if (!isActive) return { ok: false, errors: {} };

    // reminderType comes from parent component — hook doesn't own this state
    // without this, simple notes always validate as "ai" and trigger WEAK_INPUT
    const reminderType = opts.reminderType || initial?.reminderType || "ai";

    const params = {
      reminderType,
      aiPrompt: reminderType === "ai" ? prompt : undefined,
      message: reminderType === "simple" ? prompt : undefined,
      frequency,
      scheduleWithTZ,
    };

    try {
      return validateReminder(params);
    } catch {
      return { ok: false, errors: { _global: "Validation failed." } };
    }
  }, [
    isActive,
    opts.reminderType,
    prompt,
    frequency,
    scheduleWithTZ,
    validateReminder,
    initial,
  ]);

  const isNextRunValid = !!nextRunIsoFromHook;

  useEffect(() => {
    if (!isActive) return;
    const t = setTimeout(() => safeLocalSet(LS_PROMPT_KEY, prompt || ""), 700);
    return () => clearTimeout(t);
  }, [prompt, isActive]);

  const toggleWeekday = useCallback(
    (weekday) => {
      activate();
      if (typeof weekday !== "number" || weekday < 1 || weekday > 7) return;
      setSchedule((prev) => {
        const cur = Array.isArray(prev?.weekDays) ? prev.weekDays : [];
        const s = new Set(cur);
        if (s.has(weekday)) s.delete(weekday);
        else if (s.size < 4) s.add(weekday);
        return { ...(prev || {}), weekDays: Array.from(s).sort() };
      });
    },
    [activate, setSchedule],
  );

  const cancelInFlight = useCallback(() => {
    try {
      if (saveAbortControllerRef.current) {
        saveAbortControllerRef.current.abort();
        saveAbortControllerRef.current = null;
      }
    } catch {}
  }, []);

  const buildCanonicalPayload = useCallback(
    ({ normalized, overrides = {} }) => {
      if (!normalized) throw new Error("Normalized payload missing.");

      const ownerId = userProfile?.uid;
      if (!ownerId) throw new Error("Cannot save: Missing Owner ID");

      const rawType = normalized.type || initial?.reminderType || "ai";
      const reminderType =
        String(rawType).toLowerCase() === "ai" ? "ai" : "simple";

      const resolvedRole = userProfile?.role;
      const resolvedTone =
        tone && tone.length > 0
          ? tone
          : userProfile?.tone || userProfile?.preferences?.tone;
      const resolvedPlatform =
        platform && platform.length > 0 ? platform : userProfile?.platform;

      const cleanSchedule = {
        timezone: normalized.schedule?.timezone,
        timeOfDay: normalized.schedule?.localTime || "09:00",
      };

      if (normalized.schedule?.localDate) {
        cleanSchedule.date = normalized.schedule.localDate;
      }
      if (normalized.schedule?.daysOfWeek) {
        cleanSchedule.weekDays = normalized.schedule.daysOfWeek;
      }

      const payload = {
        ownerId,
        reminderType,
        frequency,
        schedule: cleanSchedule,
      };

      if (reminderType === "ai") {
        const content = { aiPrompt: normalized.content?.aiPrompt };
        if (resolvedTone) content.tone = resolvedTone;
        if (resolvedPlatform) content.platform = resolvedPlatform;
        if (resolvedRole) content.role = resolvedRole;
        payload.content = content;
      } else {
        payload.content = {
          message: normalized.content?.message,
          ...(overrides.title ? { title: overrides.title } : {}),
          ...(overrides.notes ? { notes: overrides.notes } : {}),
        };
      }

      return payload;
    },
    [userProfile, frequency, tone, platform, initial],
  );

  const save = useCallback(
    async (overrides = {}) => {
      activate();
      setLastError(null);
      setSaving(true);
      cancelInFlight();

      const controller = new AbortController();
      saveAbortControllerRef.current = controller;

      const idempotencyKey = uuidv4();
      lastIdempotencyKeyRef.current = idempotencyKey;

      try {
        const reminderType =
          overrides.reminderType || initial?.reminderType || "ai";
        const validatorParams = {
          reminderType: reminderType.toLowerCase(),
          aiPrompt:
            reminderType === "ai" ? (overrides.aiPrompt ?? prompt) : undefined,
          message:
            reminderType === "simple"
              ? (overrides.message ?? prompt)
              : undefined,
          frequency,
          scheduleWithTZ,
        };

        const validation = validateReminder(validatorParams);
        if (!validation || validation.ok !== true) {
          throw new Error(validation?.errorMessage || "Validation failed");
        }

        const canonicalPayload = buildCanonicalPayload({
          normalized: validation.normalized,
          overrides,
        });

        const saved = await client.addReminder(canonicalPayload, {
          idempotencyKey,
        });

        safeLocalRemove(LS_PROMPT_KEY);
        setSaving(false);
        saveAbortControllerRef.current = null;

        if (onSaved) onSaved(saved, null);
        return saved;
      } catch (err) {
        setSaving(false);
        saveAbortControllerRef.current = null;

        if (err?.name === "AbortError") {
          setLastError("Save cancelled.");
        } else {
          const msg = err?.message || "Failed to save reminder.";
          setLastError(msg);
          throw err;
        }
      }
    },
    [
      activate,
      cancelInFlight,
      buildCanonicalPayload,
      onSaved,
      prompt,
      frequency,
      scheduleWithTZ,
      validateReminder,
      initial,
    ],
  );

  useEffect(() => {
    const handler = (e) => {
      const isSubmit = (e.ctrlKey || e.metaKey) && e.key === "Enter";
      if (!isSubmit || !isActive) return;

      if (apiInFlightRef.current || saving || generating) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      apiInFlightRef.current = true;

      save()
        .catch(() => {})
        .finally(() => {
          apiInFlightRef.current = false;
        });
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [save, saving, generating, isActive]);

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
      cancelInFlight();
    };
  }, [cancelInFlight]);

  return {
    prompt,
    setPrompt: setPromptInternal,
    platform,
    setPlatform: setPlatformInternal,
    tone,
    setTone: setToneInternal,
    frequency,
    setFrequency: setFrequencyInternal,
    schedule: scheduleWithTZ,
    setSchedule,
    nextRunHuman: nextRunHumanFromHook,
    isNextRunValid,
    saving,
    generating,
    lastError,
    validation: uiValidation,
    save,
    cancelSave: cancelInFlight,
    toggleWeekday,
    providerTimezone,
    userProfile,
    isDirty: isActive,
    lastIdempotencyKey: lastIdempotencyKeyRef.current,
  };
}
