import React, { useMemo } from "react";
import PropTypes from "prop-types";

export default function NextRunDisplay({
  nextRunHuman,
  isNextRunValid,
  reminderMode = "ai",
  schedule = {},
}) {
  const displayText = useMemo(() => {
    if (isNextRunValid && nextRunHuman) return nextRunHuman;

    if (!schedule?.timeOfDay && !schedule?.time) return "Select a time.";
    if (schedule?.kind === "one_time" && !schedule?.date)
      return "Select a date.";

    return null;
  }, [isNextRunValid, nextRunHuman, schedule]);

  if (!displayText) return null;

  const isWaiting = !isNextRunValid;

  return (
    <div
      className={`mt-4 p-4 rounded-lg border transition-colors ${
        isWaiting ? "border-border bg-bgImpact" : "border-brand/30 bg-brand/5"
      }`}
      role="status"
      aria-live="polite"
    >
      <p className={`text-sm ${isWaiting ? "text-muted" : "text-brand"}`}>
        {isWaiting
          ? "Waiting for schedule"
          : reminderMode === "ai"
            ? "Next draft ready"
            : "Note scheduled"}
      </p>

      <p className="text-base font-semibold mt-1 text-textLight dark:text-textDark">
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
