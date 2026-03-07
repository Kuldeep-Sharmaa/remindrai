import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../../hooks/useTheme";
import TimezoneSettingCard from "./TimezoneSettingCard";

const THEME_OPTIONS = [
  {
    id: "light",
    label: "Light",
    icon: Sun,
    description:
      "Bright interface with clear contrast. Useful in well-lit environments.",
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    description:
      "Lower brightness and reduced glare. More comfortable when reading drafts or working for longer periods.",
  },
  {
    id: "auto",
    label: "System",
    icon: Monitor,
    description: "Automatically matches your device appearance settings.",
  },
];

const AppearanceSettings = () => {
  const { theme, effectiveTheme, handleThemeChange } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <section className="rounded-xl border border-gray-200 dark:border-white/[0.08] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <h2 className="text-xl sm:text-2xl font-semibold d text-textLight dark:text-textDark font-grotesk">
            Theme
          </h2>
          <p className="text-xs text-textLight dark:text-textDark mt-0.5 font-inter">
            Controls how the interface appears while you read drafts, review
            ideas, or manage prompts.
          </p>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
          {THEME_OPTIONS.map(({ id, label, icon: Icon, description }) => {
            const isActive = theme === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleThemeChange(id)}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors duration-150
                  ${
                    isActive
                      ? "bg-brand/[0.05] dark:bg-brand/[0.08]"
                      : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  }`}
              >
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-150
                  ${
                    isActive
                      ? "bg-brand text-white"
                      : "bg-gray-100 dark:bg-white/[0.06] text-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium font-grotesk
                    ${
                      isActive
                        ? "text-brand dark:text-brand-soft"
                        : "text-textLight dark:text-textDark"
                    }`}
                  >
                    {label}
                    {id === "auto" && theme === "auto" && (
                      <span className="ml-2 text-xs font-normal text-textLight dark:text-textDark font-inter">
                        ({effectiveTheme} active)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-textLight dark:text-textDark mt-0.5 font-inter">
                    {description}
                  </p>
                </div>

                <div
                  className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-150
                  ${
                    isActive
                      ? "border-brand"
                      : "border-gray-300 dark:border-white/20"
                  }`}
                >
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-brand" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-white/[0.08] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <h2 className="text-xl sm:text-2xl font-semibold  text-textLight dark:text-textDark font-grotesk">
            Display preference
          </h2>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex gap-3.5 p-4 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
            <div className="flex-shrink-0 mt-0.5">
              <Moon className="w-4 h-4 text-brand dark:text-brand-soft" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-textLight dark:text-textDark font-grotesk">
                  Dark mode for longer sessions
                </p>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand/10 text-brand dark:text-brand-soft font-grotesk uppercase tracking-wide">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-textLight dark:text-textDark font-inter leading-relaxed">
                Reduces brightness and visual noise. Helpful when reading drafts
                or reviewing ideas for extended periods.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5 p-4 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
            <div className="flex-shrink-0 mt-0.5">
              <Monitor className="w-4 h-4 text-textLight dark:text-textDark" />
            </div>
            <div>
              <p className="text-sm font-medium text-textLight dark:text-textDark font-grotesk mb-1">
                Match your device
              </p>
              <p className="text-xs text-textLight dark:text-textDark font-inter leading-relaxed">
                Uses your system appearance automatically. The interface follows
                your device setting without manual switching.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TimezoneSettingCard />
    </div>
  );
};

export default AppearanceSettings;
