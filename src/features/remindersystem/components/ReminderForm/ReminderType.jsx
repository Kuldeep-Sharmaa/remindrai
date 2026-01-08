// ReminderType.jsx
// Minimal, OpenAI-style, mobile-first selector.
// - Single column on mobile, two columns on sm+
// - Subtle selection treatment (soft tint + outline), no heavy shadows
// - Clear typography, roomy taps, accessible keyboard support
// - onOpenLearnMore(mode) callback for Learn more links

import React, { useCallback } from "react";
import PropTypes from "prop-types";

export default function ReminderType({
  value = "ai",
  onChange = () => {},
  onOpenLearnMore = () => {},
  className = "",
  disabled = false,
}) {
  const select = useCallback(
    (next) => {
      if (disabled) return;
      if (next === value) return;
      if (typeof onChange === "function") onChange(next);
    },
    [value, onChange, disabled]
  );

  const handleKey = useCallback(
    (e) => {
      if (disabled) return;
      const key = e.key;
      if (key === "ArrowLeft" || key === "ArrowUp") {
        e.preventDefault();
        select("ai");
      } else if (key === "ArrowRight" || key === "ArrowDown") {
        e.preventDefault();
        select("simple");
      } else if (key === " " || key === "Enter") {
        e.preventDefault();
        select(value === "ai" ? "simple" : "ai");
      }
    },
    [select, value, disabled]
  );

  const optionBase =
    "w-full text-left rounded-xl p-4 border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400";
  const optionIdle =
    "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900";
  const optionActive = "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40";

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Choose how you want RemindrAI to assist
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* AI */}
        <button
          type="button"
          role="radio"
          aria-checked={value === "ai"}
          aria-label="AI-powered reminder"
          onClick={() => select("ai")}
          onKeyDown={handleKey}
          disabled={disabled}
          className={`${optionBase} ${
            value === "ai" ? optionActive : optionIdle
          } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-500 text-white text-base font-semibold">
              🤖
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  AI-Powered Draft
                </div>
                <div
                  className={`text-xs font-medium ${
                    value === "ai" ? "text-indigo-600" : "text-gray-400"
                  }`}
                >
                  {value === "ai" ? "Selected" : "Choose"}
                </div>
              </div>

              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                writes and delivers a fresh, on-brand draft right when it’s time
                to post.
              </p>

              {/* FIX: Replaced nested <button> with accessible <span> */}
              <div className="mt-3">
                <span
                  role="link"
                  tabIndex={0}
                  onClick={(ev) => {
                    ev.stopPropagation(); // Prevents radio button click
                    onOpenLearnMore("ai");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      onOpenLearnMore("ai");
                    }
                  }}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-300 hover:underline focus:outline-none cursor-pointer"
                >
                  Learn more
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Simple */}
        <button
          type="button"
          role="radio"
          aria-checked={value === "simple"}
          aria-label="Simple reminder"
          onClick={() => select("simple")}
          onKeyDown={handleKey}
          disabled={disabled}
          className={`${optionBase} ${
            value === "simple" ? optionActive : optionIdle
          } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center bg-gray-700 text-white text-base font-semibold">
              🔔
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Simple Draft
                </div>
                <div
                  className={`text-xs font-medium ${
                    value === "simple" ? "text-indigo-600" : "text-gray-400"
                  }`}
                >
                  {value === "simple" ? "Selected" : "Choose"}
                </div>
              </div>

              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                Just need a gentle nudge? I’ll remind you to stay consistent
              </p>

              {/* FIX: Replaced nested <button> with accessible <span> */}
              <div className="mt-3">
                <span
                  role="link"
                  tabIndex={0}
                  onClick={(ev) => {
                    ev.stopPropagation(); // Prevents radio button click
                    onOpenLearnMore("simple");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      onOpenLearnMore("simple");
                    }
                  }}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-300 hover:underline focus:outline-none cursor-pointer"
                >
                  Learn more
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

ReminderType.propTypes = {
  value: PropTypes.oneOf(["ai", "simple"]),
  onChange: PropTypes.func,
  onOpenLearnMore: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};
