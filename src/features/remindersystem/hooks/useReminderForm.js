/**
 * useReminderForm.js
 * ------------------
 * Production-grade React hook for reminder creation UI.
 *
 * Purpose:
 *  - Lazy-activated: does nothing until user interacts (isActive guard).
 *  - Builds a canonical, minimal payload for remindrClient.addReminder().
 *  - Enforces idempotency (client-generated idempotencyKey) and supports AbortController for cancel.
 *  - Injects brand context (role, tone, platform) ONLY for AI reminders and only when present.
 *  - Keeps simple reminders minimal (only message/title/notes).
 *
 * Contents:
 *  - Safe localStorage helpers & uuidv4
 *  - Default schedule generator (5 minutes ahead)
 *  - Lazy state management (prompt, platform, tone, frequency, schedule)
 *  - Derived next-run (via useNextRun hook) & validation (useReminderValidation)
 *  - buildCanonicalPayload: canonicalizes payload for Firestore (normalizes types & minimal fields)
 *  - save(): performs validation, builds payload, calls remindrClient.addReminder() with idempotencyKey
 *
 * Invariants:
 *  - If reminderType === 'ai' -> content MAY include { role, tone, platform } (only when present)
 *  - If reminderType === 'simple' -> content MUST NOT include role/tone/platform
 *
 * Note:
 *  - remindrClient.addReminder currently does not accept AbortController.signal; this hook still uses AbortController
 *    to cancel local in-flight UI work and to avoid duplicate concurrent saves.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { DateTime } from "luxon";
import client from "../services/remindrClient";
import { useAuthContext } from "../../../context/AuthContext";
import { useAppTimezone } from "../../../context/TimezoneProvider";

import useNextRun from "./useNextRun";
import useReminderValidation from "./useReminderValidation";

const LS_PROMPT_KEY = "remindr_prompt_autosave_v1";

/* -----------------------
   Helpers (safe localStorage + UUID)
   ----------------------- */
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

/* -----------------------
   Default schedule (5 min ahead)
   ----------------------- */
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

/* ============================================================================
   Hook
   =========================================================================== */
export default function useReminderForm(opts = {}) {
  const { user: userProfile } = useAuthContext();
  const { timezone: providerTimezone } = useAppTimezone();
  const initial = opts.initial ?? null;
  const onSaved = typeof opts.onSaved === "function" ? opts.onSaved : null;

  // --------------------------------------------------------------------------
  // Lazy activation (no work until user interacts)
  // --------------------------------------------------------------------------
  const [isActive, setIsActive] = useState(false);
  const activate = useCallback(() => {
    if (!isActive) setIsActive(true);
  }, [isActive]);

  // validator (disabled until active)
  const { validate: validateReminder } = useReminderValidation({
    enabled: isActive,
  });

  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
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
      "friendly"
  );

  const [frequency, setFrequency] = useState(
    () => initial?.frequency || "one_time"
  );

  const [scheduleInternal, setScheduleInternal] = useState(() => {
    return initial?.schedule
      ? { ...initial.schedule }
      : makeDefaultSchedule(providerTimezone);
  });

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lastError, setLastError] = useState(null);

  // refs
  const apiInFlightRef = useRef(false);
  const saveAbortControllerRef = useRef(null);
  const lastIdempotencyKeyRef = useRef(null);
  const unmountedRef = useRef(false);

  // --------------------------------------------------------------------------
  // Setter wrappers (auto-activate on change)
  // --------------------------------------------------------------------------
  const setPromptInternal = useCallback(
    (val) => {
      activate();
      setPrompt(val);
    },
    [activate]
  );

  const setPlatformInternal = useCallback(
    (val) => {
      activate();
      setPlatform(val);
    },
    [activate]
  );

  const setToneInternal = useCallback(
    (val) => {
      activate();
      setTone(val);
    },
    [activate]
  );

  const setFrequencyInternal = useCallback(
    (val) => {
      activate();
      setFrequency(val);
    },
    [activate]
  );

  const setSchedule = useCallback(
    (partial) => {
      activate();
      setScheduleInternal((prev) => ({ ...(prev || {}), ...(partial || {}) }));
    },
    [activate]
  );

  // --------------------------------------------------------------------------
  // Derived schedule with timezone
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // Next-run calculation (lazy)
  // --------------------------------------------------------------------------
  const { nextRunIso: nextRunIsoFromHook, nextRunHuman: nextRunHumanFromHook } =
    useNextRun({
      frequency,
      schedule: scheduleWithTZ,
      enabled: isActive,
    });

  // --------------------------------------------------------------------------
  // Validation (lazy)
  // --------------------------------------------------------------------------
  const uiValidation = useMemo(() => {
    if (!isActive) {
      return { ok: false, errors: {} };
    }
    const reminderType = initial?.reminderType || "ai";
    const params = {
      reminderType,
      aiPrompt: reminderType === "ai" ? prompt : undefined,
      message: reminderType === "simple" ? prompt : undefined,
      frequency,
      scheduleWithTZ,
      nextRunIso: nextRunIsoFromHook,
    };
    try {
      return validateReminder(params);
    } catch {
      return { ok: false, errors: { _global: "Validation failed." } };
    }
  }, [
    isActive,
    prompt,
    frequency,
    scheduleWithTZ,
    nextRunIsoFromHook,
    validateReminder,
    initial,
  ]);

  // --------------------------------------------------------------------------
  // Derived next-run
  // --------------------------------------------------------------------------
  const derivedNextRunIso =
    nextRunIsoFromHook ||
    (uiValidation.ok && uiValidation.normalized?.nextRunUtc) ||
    null;

  const derivedNextRunHuman =
    nextRunHumanFromHook ||
    (derivedNextRunIso
      ? DateTime.fromISO(derivedNextRunIso).toLocaleString(
          DateTime.DATETIME_MED_WITH_WEEKDAY
        )
      : null);

  const derivedIsNextRunValid = !!derivedNextRunIso;

  const validationResult = uiValidation;

  // --------------------------------------------------------------------------
  // Autosave prompt (lazy)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isActive) return;
    const t = setTimeout(() => safeLocalSet(LS_PROMPT_KEY, prompt || ""), 700);
    return () => clearTimeout(t);
  }, [prompt, isActive]);

  // --------------------------------------------------------------------------
  // Toggle weekday
  // --------------------------------------------------------------------------
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
    [activate, setSchedule]
  );

  // --------------------------------------------------------------------------
  // Cancel in-flight requests
  // --------------------------------------------------------------------------
  const cancelInFlight = useCallback(() => {
    try {
      if (saveAbortControllerRef.current) {
        saveAbortControllerRef.current.abort();
        saveAbortControllerRef.current = null;
      }
    } catch {}
  }, []);

  // --------------------------------------------------------------------------
  // Perform save (thin wrapper)
  // --------------------------------------------------------------------------
  async function performSave(canonicalPayload, { idempotencyKey } = {}) {
    // remindrClient.addReminder currently accepts (payload, { idempotencyKey, resolveTimestamps })
    // do NOT pass an AbortController.signal here since remindrClient (current) doesn't support it.
    const opts = {};
    if (idempotencyKey) opts.idempotencyKey = idempotencyKey;
    return client.addReminder(canonicalPayload, opts);
  }

  // --------------------------------------------------------------------------
  // Build canonical Firestore payload
  //  - For AI reminders: include role, tone, platform safely
  //  - Do not write undefined values (keep payload minimal)
  // --------------------------------------------------------------------------
  const buildCanonicalPayload = useCallback(
    ({ normalized, overrides = {}, idempotencyKey }) => {
      if (!normalized || typeof normalized !== "object") {
        throw new Error("Normalized payload missing.");
      }

      const ownerId = userProfile?.uid ?? null;
      const nowIso = new Date().toISOString();

      // Normalize type to lower-case for remindrClient expectations
      const normalizedType =
        (normalized.type && String(normalized.type).toLowerCase()) ||
        (initial?.reminderType
          ? String(initial.reminderType).toLowerCase()
          : "ai");

      // Decide authoritative role/tone/platform values:
      // - role: prefer userProfile.role (server/source-of-truth) if present
      // - tone/platform: prefer current form state, fallback to userProfile
      const resolvedRole = userProfile?.role ?? undefined;
      const resolvedTone =
        (typeof tone === "string" && tone.length > 0
          ? tone
          : userProfile?.tone ?? userProfile?.preferences?.tone) ?? undefined;
      const resolvedPlatform =
        (typeof platform === "string" && platform.length > 0
          ? platform
          : userProfile?.platform) ?? undefined;

      const base = {
        ownerId,
        reminderType: normalizedType, // 'ai' | 'simple'
        frequency,
        schedule: {
          timezone: normalized.schedule?.timezone,
          ...(normalized.schedule?.localTime
            ? { localTime: normalized.schedule.localTime }
            : {}),
          ...(normalized.schedule?.localDate
            ? { localDate: normalized.schedule.localDate }
            : {}),
          ...(normalized.schedule?.daysOfWeek
            ? { daysOfWeek: normalized.schedule.daysOfWeek }
            : {}),
        },
        // client uses nextRunAtUTC_iso (remindrClient will interpret it)
        nextRunAtUTC_iso: normalized.nextRunUtc || null,
        enabled: true,
        createdByClientAt: nowIso,
        meta: {
          // explicit idempotency: prefer arg, else normalized.meta.idempotencyKey, else generate
          idempotencyKey:
            idempotencyKey ||
            (normalized.meta && normalized.meta.idempotencyKey) ||
            uuidv4(),
        },
      };

      // Content block — use normalizedType (lowercased) so "AI"/"ai"/"Ai" all work
      if (normalizedType === "ai") {
        const content = {
          aiPrompt: normalized.content?.aiPrompt,
        };

        // Inject resolved brand/context values only when present (keep payload minimal)
        if (resolvedTone) content.tone = resolvedTone;
        if (resolvedPlatform) content.platform = resolvedPlatform;
        if (resolvedRole) content.role = resolvedRole;

        base.content = content;
      } else {
        // simple reminder content — explicit to avoid accidental brand injection
        base.content = {
          message: normalized.content?.message,
          ...(overrides.title ? { title: overrides.title } : {}),
          ...(overrides.notes ? { notes: overrides.notes } : {}),
        };
      }

      return { ...base, ...overrides };
    },
    [userProfile, frequency, tone, platform, initial]
  );

  // --------------------------------------------------------------------------
  // Public save()
  // --------------------------------------------------------------------------
  const save = useCallback(
    async (overrides = {}) => {
      activate();
      setLastError(null);
      setSaving(true);
      cancelInFlight();

      const controller = new AbortController();
      saveAbortControllerRef.current = controller;

      // client-visible idempotencyKey: generate now and keep reference
      const idempotencyKey = uuidv4();
      lastIdempotencyKeyRef.current = idempotencyKey;

      const reminderType =
        overrides.reminderType || initial?.reminderType || "ai";

      const validatorParams = {
        reminderType: reminderType.toLowerCase(),
        aiPrompt:
          reminderType === "ai" ? overrides.aiPrompt ?? prompt : undefined,
        message:
          reminderType === "simple" ? overrides.message ?? prompt : undefined,
        frequency,
        scheduleWithTZ,
        nextRunIso: derivedNextRunIso,
      };

      const validation = validateReminder(validatorParams);

      if (!validation || validation.ok !== true) {
        const errMsg =
          validation?.errorMessage ||
          JSON.stringify(validation?.errors || {}) ||
          "Validation failed";
        setSaving(false);
        setLastError(errMsg);
        throw new Error(errMsg);
      }

      const normalized = validation.normalized;
      // ensure normalized carries the idempotencyKey for downstream debugging if needed
      const normalizedWithMeta = {
        ...normalized,
        meta: { ...(normalized.meta || {}), idempotencyKey },
      };

      const canonicalPayload = buildCanonicalPayload({
        normalized: normalizedWithMeta,
        overrides,
        idempotencyKey,
      });

      try {
        const saved = await performSave(canonicalPayload, {
          idempotencyKey,
        });

        safeLocalRemove(LS_PROMPT_KEY);
        setSaving(false);
        if (onSaved) onSaved(saved, null);
        saveAbortControllerRef.current = null;
        return saved;
      } catch (err) {
        if (err?.name === "AbortError") {
          setLastError("Save cancelled.");
        } else {
          setLastError(err?.message || "Failed to save reminder.");
        }
        setSaving(false);
        saveAbortControllerRef.current = null;
        throw err;
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
      derivedNextRunIso,
      validateReminder,
      initial,
    ]
  );

  // --------------------------------------------------------------------------
  // Keyboard shortcut: Ctrl/Cmd+Enter -> save()
  // --------------------------------------------------------------------------
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

      (async () => {
        try {
          await save();
        } catch {
        } finally {
          apiInFlightRef.current = false;
        }
      })();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [save, saving, generating, isActive]);

  // --------------------------------------------------------------------------
  // Cleanup on unmount
  // --------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      unmountedRef.current = true;
      cancelInFlight();
    };
  }, [cancelInFlight]);

  // --------------------------------------------------------------------------
  // Return public API
  // --------------------------------------------------------------------------
  return {
    // form state
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

    // derived values
    nextRunIso: derivedNextRunIso,
    nextRunHuman: derivedNextRunHuman,
    isNextRunValid: derivedIsNextRunValid,

    // status
    saving,
    generating,
    lastError,
    validation: validationResult,
    save,
    cancelSave: cancelInFlight,
    toggleWeekday,
    providerTimezone,
    userProfile,
    isDirty: isActive,
    lastIdempotencyKey: lastIdempotencyKeyRef.current,
  };
}
