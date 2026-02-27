import React, { useCallback } from "react";
import PropTypes from "prop-types";

export default function FrequencySelector({ value, onChange }) {
  const options = [
    { id: "one_time", label: "One time" },
    { id: "daily", label: "Every day" },
    { id: "weekly", label: "Every week" },
  ];

  const handleChange = useCallback(
    (id) => {
      onChange(id);
    },
    [onChange],
  );

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
      {/* System-oriented label */}
      <legend className="text-sm font-medium  text-gray-700 dark:text-gray-200 tracking-wide ">
        How often should this be ready?
      </legend>

      <div
        className="flex gap-2"
        role="radiogroup"
        aria-label="Draft frequency"
      >
        {options.map((opt, i) => {
          const active = value === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => handleChange(opt.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-brand ${
                active
                  ? "border border-brand text-brand bg-brand/10"
                  : "border border-border  hover:text-brand dark:hover:text-brand"
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
