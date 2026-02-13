// ============================================================================
// 📁 TimeSelector.jsx (FINAL - ISO Weekday 1-7 & Max 4 Days Enforced + inline error)
// ----------------------------------------------------------------------------
// - Adds `error` prop to display schedule/time validation messages inline
// - Emits canonical schedule keys via onChange: { date, timeOfDay, weekDays, timezone }
// - Normalizes common timezone aliases to valid IANA zones (e.g. Asia/Calcutta -> Asia/Kolkata)
// ----------------------------------------------------------------------------

import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";

// --- Constants ---
const ISO_WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_WEEKDAYS = 4;

export default function TimeSelector({
  frequency,
  schedule = {},
  onChange,
  timezone,
  error, // new prop: string | null (inline schedule/time error message)
}) {
  // Use local state for immediate input feedback
  const [date, setDate] = useState(schedule?.date || "");
  const [time, setTime] = useState(schedule?.timeOfDay || schedule?.time || "");
  const [weekdays, setWeekdays] = useState(
    Array.isArray(schedule?.weekDays) ? schedule.weekDays : [],
  );

  // 1. Determine & normalize Timezone (Memoized for efficiency)
  const tz = useMemo(() => {
    const browserTZ =
      Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || "UTC";
    const raw = (timezone || schedule?.timezone || browserTZ || "UTC").trim();

    // small alias map — extend as needed if you see other non-IANA values in your user data
    const TZ_ALIAS_MAP = {
      // common legacy / misnamed values -> canonical IANA
      "Asia/Calcutta": "Asia/Kolkata",
      "Asia/Calcutta ": "Asia/Kolkata",
      Calcutta: "Asia/Kolkata",
      Kolkata: "Asia/Kolkata",
      IST: "Asia/Kolkata", // optional; be careful with ambiguous abbreviations
    };

    const candidate = TZ_ALIAS_MAP[raw] || raw;

    // final sanity: attempt to construct Intl.DateTimeFormat with the zone.
    // If it throws, fallback to browserTZ or 'UTC'.
    try {
      // This will throw on invalid zones in some browsers/environments
      /* eslint-disable no-new */
      new Intl.DateTimeFormat(undefined, { timeZone: candidate });
      /* eslint-enable no-new */
      return candidate;
    } catch (e) {
      // fallback gracefully
      return browserTZ || "UTC";
    }
    // note: include schedule?.timezone in deps to re-evaluate when it changes
  }, [timezone, schedule?.timezone]);

  // dev-only debug: show the normalized timezone when running locally
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(
      "[TimeSelector] normalized tz ->",
      tz,
      "raw schedule.timezone:",
      schedule?.timezone,
    );
  }

  // Normalize incoming schedule if the parent changes it externally
  useEffect(() => {
    if (schedule?.date !== undefined && schedule.date !== date)
      setDate(schedule.date || "");
    const incomingTime = schedule?.timeOfDay || schedule?.time || "";
    if (incomingTime !== time) setTime(incomingTime);
    const incomingWeek = Array.isArray(schedule?.weekDays)
      ? schedule.weekDays
      : [];
    // shallow compare
    const equal =
      incomingWeek.length === weekdays.length &&
      incomingWeek.every((v, i) => v === weekdays[i]);
    if (!equal) setWeekdays(incomingWeek);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    schedule?.date,
    schedule?.timeOfDay,
    schedule?.time,
    JSON.stringify(schedule?.weekDays),
  ]);

  // 2. Schedule Change Effect: Emit the unified schedule object on change
  useEffect(() => {
    // Build canonical schedule payload
    const payload = {
      date: date || undefined,
      timeOfDay: time || undefined,
      weekDays: weekdays && weekdays.length > 0 ? weekdays : undefined,
      timezone: tz,
    };

    // Only include defined keys (parent can merge as needed)
    onChange &&
      onChange(
        Object.keys(payload).reduce((acc, k) => {
          if (payload[k] !== undefined) acc[k] = payload[k];
          return acc;
        }, {}),
      );
    // Intentionally exclude `schedule` to avoid render loops
    // onChange stable (parent hook should be memoized)
  }, [date, time, weekdays, tz, onChange]);

  // 3. Weekday Toggle Logic (Handles ISO 1-7 and MAX_WEEKDAYS limit)
  const toggleWeekday = useCallback((isoDayValue) => {
    setWeekdays((prev) => {
      const exists = prev.includes(isoDayValue);

      if (exists) {
        return prev.filter((d) => d !== isoDayValue);
      }

      if (prev.length >= MAX_WEEKDAYS) {
        return prev;
      }

      return [...prev, isoDayValue].sort((a, b) => a - b);
    });
  }, []);

  // Determine if the "weekly" selection limit has been reached
  const isMaxedOut = weekdays.length >= MAX_WEEKDAYS;

  // Helper to render error message (stringify defensively)
  const errorString =
    error === null || typeof error === "undefined"
      ? null
      : typeof error === "string"
        ? error
        : // if object, attempt to extract message or stringify
          error?.message || JSON.stringify(error);

  return (
    <div className="space-y-4">
      {/* 🔹 Date Input (One-time only) 🔹 */}
      {frequency === "one_time" && (
        <div>
          <label
            htmlFor="remindr-date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Delivery date
          </label>
          <input
            id="remindr-date"
            type="Delivery date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            aria-describedby={
              errorString ? "remindr-schedule-error" : undefined
            }
          />
        </div>
      )}

      {/* 🔹 Time Input (All frequencies) 🔹 */}
      <div>
        <label
          htmlFor="remindr-time"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Delivery time ({tz})
        </label>
        <input
          id="remindr-time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          aria-describedby={errorString ? "remindr-schedule-error" : undefined}
        />
      </div>

      {/* Inline error rendered under time/date controls */}
      {errorString && (
        <div
          id="remindr-schedule-error"
          role="alert"
          className="text-sm text-yellow-700 dark:text-yellow-300 p-2 rounded-md bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-400 mt-1"
        >
          {errorString}
        </div>
      )}

      {/* 🔹 Weekday Picker (Weekly only) 🔹 */}
      {frequency === "weekly" && (
        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Delivery days
          </label>
          <div className="flex gap-2 flex-wrap justify-start">
            {ISO_WEEKDAY_LABELS.map((label, i) => {
              const isoDayValue = i + 1;
              const isSelected = weekdays.includes(isoDayValue);
              const isDisabled = isMaxedOut && !isSelected;

              return (
                <button
                  key={isoDayValue}
                  type="button"
                  onClick={() => toggleWeekday(isoDayValue)}
                  disabled={isDisabled}
                  className={`
                    w-10 h-10 rounded-full text-xs font-semibold border-2 transition-all duration-150 ease-in-out
                    ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-700 shadow-md"
                        : isDisabled
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed opacity-60"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }
                  `}
                  title={
                    isDisabled
                      ? `Maximum of ${MAX_WEEKDAYS} days selected`
                      : label
                  }
                  aria-pressed={isSelected}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            AI prepares a new draft on these days (Max {MAX_WEEKDAYS} days).
          </div>
        </div>
      )}
    </div>
  );
}

TimeSelector.propTypes = {
  frequency: PropTypes.oneOf(["one_time", "daily", "weekly"]).isRequired,
  schedule: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  timezone: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
