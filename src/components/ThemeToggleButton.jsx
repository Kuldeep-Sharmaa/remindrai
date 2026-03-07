import React, { useCallback } from "react";
import { useTheme } from "../hooks/useTheme";

// New users: hook defaults to "auto" (system) when nothing in localStorage
// so system theme is always respected on first visit — no extra code needed.

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4.5"/>
    <line x1="12" y1="2" x2="12" y2="4"/>
    <line x1="12" y1="20" x2="12" y2="22"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="2" y1="12" x2="4" y2="12"/>
    <line x1="20" y1="12" x2="22" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const SystemIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const OPTIONS = [
  { key: "light", label: "Light", Icon: SunIcon },
  { key: "dark",  label: "Dark",  Icon: MoonIcon },
  { key: "auto",  label: "System", Icon: SystemIcon },
];

const ThemeToggleButton = ({ className = "", disabled = false }) => {
  const { theme, handleThemeChange } = useTheme();

  const handleSelect = useCallback((key) => {
    if (!disabled) handleThemeChange(key);
  }, [handleThemeChange, disabled]);

  return (
    <div
      role="group"
      aria-label="Theme preference"
      className={`
        inline-flex items-center
        p-0.5 gap-0.5
        rounded-lg
        bg-black/5 dark:bg-white/[0.06]
        border border-black/[0.06] dark:border-white/[0.08]
        ${disabled ? "opacity-40 pointer-events-none" : ""}
        ${className}
      `}
    >
      {OPTIONS.map(({ key, label, Icon }) => {
        const isActive = theme === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleSelect(key)}
            aria-pressed={isActive}
            aria-label={label}
            title={label}
            className={`
              relative inline-flex items-center justify-center
              w-7 h-7 rounded-md
              transition-all duration-150
              ${isActive
                ? "bg-white dark:bg-white/[0.12] shadow-sm text-textLight dark:text-textDark"
                : "text-muted hover:text-textLight dark:hover:text-textDark hover:bg-white/50 dark:hover:bg-white/[0.06]"
              }
            `}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggleButton;