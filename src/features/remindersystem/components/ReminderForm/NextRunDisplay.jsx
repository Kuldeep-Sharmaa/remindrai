// ============================================================================
// 📁 NextRunDisplay.jsx (Enhanced — Smart Schedule Awareness with Icons)
// ----------------------------------------------------------------------------
// - Professional UI: uses Lucide icons instead of emojis
// - Adapts tone for "ai" or "simple" reminders with clean, minimal design
// - Fully accessible (aria-live)
// - Feels like Linear or Notion AI-level UX
// ----------------------------------------------------------------------------

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Bot, Bell, Hourglass, CalendarDays } from "lucide-react"; // ✅ Professional icons

export default function NextRunDisplay({
  nextRunHuman,
  isFormValid,
  isNextRunValid,
  reminderMode = "ai",
  schedule = {},
}) {
  const displayText = useMemo(() => {
    if (isNextRunValid && nextRunHuman) return nextRunHuman;

    if (!schedule?.timeOfDay && !schedule?.time)
      return "Waiting for a valid time...";
    if (schedule?.kind === "one_time" && !schedule?.date)
      return "Pick a date to see your next run time.";

    return "Waiting for a valid schedule...";
  }, [isNextRunValid, nextRunHuman, schedule]);

  const shouldShow =
    (isNextRunValid && nextRunHuman) ||
    (!isNextRunValid && displayText !== "Waiting for a valid schedule...");

  if (!shouldShow) return null;

  // ✅ Professional titles with icons
  const title = (() => {
    const waiting = !isNextRunValid;

    if (reminderMode === "ai") {
      return waiting ? (
        <>
          <Hourglass className="inline-block w-4 h-4 mr-1 text-indigo-500" />
          <Bot className="inline-block w-4 h-4 mr-1 text-indigo-500" />
          <span>AI Reminder preview — waiting for your schedule</span>
        </>
      ) : (
        <>
          <Bot className="inline-block w-4 h-4 mr-1 text-indigo-600" />

          <span>
            Your AI will deliver a fresh, on-brand draft — right on time
          </span>
        </>
      );
    } else {
      return waiting ? (
        <>
          <Hourglass className="inline-block w-4 h-4 mr-1 text-indigo-500" />
          <Bell className="inline-block w-4 h-4 mr-1 text-indigo-500" />
          <span>Reminder preview — waiting for your schedule</span>
        </>
      ) : (
        <>
          <Bell className="inline-block w-4 h-4 mr-1 text-indigo-600" />

          <span>Your reminder is set — we’ll make sure you don’t miss it.</span>
        </>
      );
    }
  })();

  const isWaiting = !isNextRunValid;

  return (
    <div
      className={`mt-4 p-3 rounded-lg border transition-all duration-200 ${
        isWaiting
          ? "bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700"
          : "bg-indigo-50 dark:bg-gray-700/50 border-indigo-200 dark:border-gray-700"
      }`}
      role="status"
      aria-live="polite"
    >
      <p
        className={`flex items-center gap-1 text-sm font-medium ${
          isWaiting
            ? "text-gray-600 dark:text-gray-400"
            : "text-indigo-700 dark:text-indigo-300"
        }`}
      >
        {title}
      </p>

      <p
        className={`text-base font-semibold mt-1 ${
          isWaiting
            ? "text-gray-800 dark:text-gray-300"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {displayText}
      </p>
    </div>
  );
}

NextRunDisplay.propTypes = {
  nextRunHuman: PropTypes.string,
  isFormValid: PropTypes.bool,
  isNextRunValid: PropTypes.bool,
  reminderMode: PropTypes.oneOf(["ai", "simple"]),
  schedule: PropTypes.object,
};
