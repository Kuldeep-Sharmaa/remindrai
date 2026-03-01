import React from "react";

const LEVELS = [
  { label: "Very weak", color: "#ef4444", width: "20%" },
  { label: "Weak", color: "#f97316", width: "40%" },
  { label: "Fair", color: "#eab308", width: "60%" },
  { label: "Good", color: "#3b82f6", width: "80%" },
  { label: "Strong", color: "#22c55e", width: "100%" },
];

const PasswordStrengthBar = ({ score, feedback }) => {
  if (score === null || score === undefined) return null;

  const level = LEVELS[score] ?? LEVELS[0];

  return (
    <div id="password-strength" className="mt-2.5 space-y-1.5">
      <div className="h-[3px] w-full rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: level.width, backgroundColor: level.color }}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[11px] font-medium font-inter"
          style={{ color: level.color }}
        >
          {level.label}
        </span>
        {feedback?.suggestions?.[0] && (
          <span className="text-[11px] font-inter text-muted truncate text-right">
            {feedback.suggestions[0]}
          </span>
        )}
      </div>
    </div>
  );
};

export default PasswordStrengthBar;
