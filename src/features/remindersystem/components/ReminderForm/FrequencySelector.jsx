import React, { useCallback } from "react";
import PropTypes from "prop-types";

export default function FrequencySelector({ value, onChange }) {
  const options = [
    { id: "one_time", label: "One-time" },
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
  ];

  // Handles button click or keyboard activation
  const handleChange = useCallback(
    (id) => {
      onChange(id); // Parent handles schedule updates
    },
    [onChange],
  );

  // Handles keyboard navigation between options
  const handleKeyDown = (e, index) => {
    const { key } = e;
    const last = options.length - 1;
    let nextIndex = index;

    if (key === "ArrowRight") nextIndex = index === last ? 0 : index + 1;
    if (key === "ArrowLeft") nextIndex = index === 0 ? last : index - 1;

    if (nextIndex !== index && ["ArrowRight", "ArrowLeft"].includes(key)) {
      e.preventDefault();
      handleChange(options[nextIndex].id);
    }
  };

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-gray-700 dark:text-gray-200">
        How often should this be ready?
      </legend>

      <div
        className="flex gap-2"
        role="tablist"
        aria-label="AI draft delivery timing"
      >
        {options.map((opt, i) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleChange(opt.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                active
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

FrequencySelector.propTypes = {
  value: PropTypes.oneOf(["one_time", "daily", "weekly"]).isRequired,
  onChange: PropTypes.func.isRequired,
};
