import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import PropTypes from "prop-types";

const ISO_WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_WEEKDAYS = 4;

export default function TimeSelector({
  frequency,
  schedule = {},
  onChange,
  timezone,
  error,
}) {
  const [date, setDate] = useState(schedule?.date || "");
  const [time, setTime] = useState(schedule?.timeOfDay || schedule?.time || "");
  const [weekdays, setWeekdays] = useState(
    Array.isArray(schedule?.weekDays) ? schedule.weekDays : [],
  );

  // Keep a ref to onChange so we never need it in effect deps —
  // avoids the re-emission loop when the parent re-renders
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const tz = useMemo(() => {
    const browserTZ =
      Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || "UTC";
    const raw = (timezone || schedule?.timezone || browserTZ || "UTC").trim();

    const TZ_ALIAS_MAP = {
      "Asia/Calcutta": "Asia/Kolkata",
      "Asia/Calcutta ": "Asia/Kolkata",
      Calcutta: "Asia/Kolkata",
      Kolkata: "Asia/Kolkata",
      IST: "Asia/Kolkata",
    };

    const candidate = TZ_ALIAS_MAP[raw] || raw;

    try {
      new Intl.DateTimeFormat(undefined, { timeZone: candidate });
      return candidate;
    } catch (e) {
      return browserTZ || "UTC";
    }
  }, [timezone, schedule?.timezone]);

  // Sync local state when parent changes schedule externally
  useEffect(() => {
    if (schedule?.date !== undefined && schedule.date !== date)
      setDate(schedule.date || "");
    const incomingTime = schedule?.timeOfDay || schedule?.time || "";
    if (incomingTime !== time) setTime(incomingTime);
    const incomingWeek = Array.isArray(schedule?.weekDays)
      ? schedule.weekDays
      : [];
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

  // Emit schedule — onChange is intentionally accessed via ref, not in deps,
  // so this effect only fires when the actual schedule values change
  useEffect(() => {
    const payload = {
      date: date || undefined,
      timeOfDay: time || undefined,
      weekDays: weekdays && weekdays.length > 0 ? weekdays : undefined,
      timezone: tz,
    };

    const cleaned = Object.keys(payload).reduce((acc, k) => {
      if (payload[k] !== undefined) acc[k] = payload[k];
      return acc;
    }, {});

    onChangeRef.current?.(cleaned);
  }, [date, time, weekdays, tz]); // onChange deliberately omitted — using ref

  const toggleWeekday = useCallback((isoDayValue) => {
    setWeekdays((prev) => {
      if (prev.includes(isoDayValue))
        return prev.filter((d) => d !== isoDayValue);
      if (prev.length >= MAX_WEEKDAYS) return prev;
      return [...prev, isoDayValue].sort((a, b) => a - b);
    });
  }, []);

  const isMaxedOut = weekdays.length >= MAX_WEEKDAYS;

  const errorString =
    error === null || typeof error === "undefined"
      ? null
      : typeof error === "string"
        ? error
        : error?.message || JSON.stringify(error);

  return (
    <div className="space-y-4">
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
            type="date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-sm focus:ring-brand focus:border-brand"
            aria-describedby={
              errorString ? "remindr-schedule-error" : undefined
            }
          />
        </div>
      )}

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
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-sm focus:ring-brand focus:border-brand"
          aria-describedby={errorString ? "remindr-schedule-error" : undefined}
        />
      </div>

      {errorString && (
        <div
          id="remindr-schedule-error"
          role="alert"
          className="text-sm text-yellow-700 dark:text-yellow-300 p-2 rounded-md bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-400 mt-1"
        >
          {errorString}
        </div>
      )}

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
                        ? "bg-brand text-white border-brand shadow-md"
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
