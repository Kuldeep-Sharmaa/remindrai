import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { HiOutlineCpuChip, HiOutlineBookmark } from "react-icons/hi2";

export default function ReminderType({
  value = "ai",
  onChange = () => {},
  onOpenLearnMore = () => {},
  className = "",
  disabled = false,
}) {
  const select = useCallback(
    (next) => {
      if (disabled || next === value) return;
      onChange?.(next);
    },
    [value, onChange, disabled],
  );

  const optionBase =
    "w-full text-left rounded-xl p-4 border transition-colors focus:outline-none focus:ring-2 focus:ring-brand";
  const optionIdle = "border-border bg-white dark:bg-bgDark";
  const optionActive = "border-brand bg-brand/10";

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-textLight dark:text-textDark">
        What should be ready next?
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* AI Draft */}
        <button
          type="button"
          role="radio"
          aria-checked={value === "ai"}
          onClick={() => select("ai")}
          disabled={disabled}
          className={`${optionBase} ${
            value === "ai" ? optionActive : optionIdle
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-start gap-3">
            <HiOutlineCpuChip className="w-6 h-6 text-brand mt-0.5" />

            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-textLight dark:text-textDark">
                  AI Draft
                </span>
                <span className="text-xs text-muted">
                  {value === "ai" ? "Selected" : "Choose"}
                </span>
              </div>

              <p className="mt-1 text-xs text-muted">
                Prepares an on-brand draft and brings it to you when it’s ready.
              </p>
            </div>
          </div>
        </button>

        {/* Simple Note */}
        <button
          type="button"
          role="radio"
          aria-checked={value === "simple"}
          onClick={() => select("simple")}
          disabled={disabled}
          className={`${optionBase} ${
            value === "simple" ? optionActive : optionIdle
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-start gap-3">
            <HiOutlineBookmark className="w-6 h-6 text-muted mt-0.5" />

            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-textLight dark:text-textDark">
                  Simple Note
                </span>
                <span className="text-xs text-muted">
                  {value === "simple" ? "Selected" : "Choose"}
                </span>
              </div>

              <p className="mt-1 text-xs text-muted">
                Keeps an idea ready so you can return to it anytime.
              </p>
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
