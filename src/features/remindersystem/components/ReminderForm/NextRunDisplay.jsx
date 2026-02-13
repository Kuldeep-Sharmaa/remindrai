import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { HiOutlineCpuChip, HiOutlineBookmark } from "react-icons/hi2";

export default function NextRunDisplay({
  nextRunHuman,
  isNextRunValid,
  reminderMode = "ai",
  schedule = {},
}) {
  const displayText = useMemo(() => {
    if (isNextRunValid && nextRunHuman) return nextRunHuman;

    if (!schedule?.timeOfDay && !schedule?.time)
      return "Select a time to preview.";
    if (schedule?.kind === "one_time" && !schedule?.date)
      return "Select a date to preview.";

    return null;
  }, [isNextRunValid, nextRunHuman, schedule]);

  if (!displayText) return null;

  const isWaiting = !isNextRunValid;

  const title = isWaiting
    ? "Choose when this should continue."
    : reminderMode === "ai"
      ? "Your next draft will be ready"
      : "Your note will be ready";
  const Icon = reminderMode === "ai" ? HiOutlineCpuChip : HiOutlineBookmark;

  return (
    <div
      className={`mt-4 p-3 rounded-lg border transition-colors ${
        isWaiting
          ? "bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700"
          : "bg-brand/10 border-brand/30"
      }`}
      role="status"
      aria-live="polite"
    >
      <p
        className={`flex items-center gap-2 text-sm font-medium ${
          isWaiting ? "text-gray-600 dark:text-gray-400" : "text-brand"
        }`}
      >
        <Icon className="w-4 h-4" />
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
  isNextRunValid: PropTypes.bool,
  reminderMode: PropTypes.oneOf(["ai", "simple"]),
  schedule: PropTypes.object,
};
