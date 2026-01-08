// src/components/AppearanceSettings.jsx
import React from "react";
import {
  Monitor,
  Sun,
  Moon,
  Check,
  Palette,
  Clock,
  Info,
  Zap,
  Lightbulb,
} from "lucide-react";

import TimezoneSettingCard from "./TimezoneSettingCard";
import { useTheme } from "../../../hooks/useTheme"; // Ensure this path is correct

const AppearanceSettings = () => {
  const {
    theme, // User's selected preference ('light', 'dark', 'auto')
    setTheme, // (Note: handleThemeChange is preferred for external use)
    systemTheme,
    currentEffectiveTheme, // The actual theme applied ('light' or 'dark')
    isLoadingThemeChange,
    themeUsage,
    handleThemeChange, // Use this for changing theme
    updateCounter, // Add this line
    isInitialized, // Add this line
  } = useTheme();

  // ENHANCED DEBUG LOGGING
  console.log("AppearanceSettings re-rendered:", {
    theme,
    systemTheme,
    currentEffectiveTheme,
    updateCounter,
    isInitialized,
    timestamp: Date.now(),
    renderCount: React.useRef(0).current++,
  });

  // Wait for initialization
  if (!isInitialized) {
    return <div>Loading theme settings...</div>;
  }

  const getTotalUsage = () => {
    return Object.values(themeUsage).reduce((sum, time) => sum + time, 0);
  };

  const getUsagePercentage = (themeTime) => {
    const total = getTotalUsage();
    return total > 0 ? Math.round((themeTime / total) * 100) : 0;
  };

  const themeOptions = [
    {
      id: "light",
      label: "Light",
      icon: Sun,
      description: "Clean interface optimized for bright environments",
      color: "amber",
      imagePreview: "light-theme-preview.jpg",
    },
    {
      id: "dark",
      label: "Dark",
      icon: Moon,
      description: "Reduces eye strain during extended work sessions",
      color: "slate",
      imagePreview: "dark-theme-preview.jpg",
    },
    {
      id: "auto",
      label: "System",
      icon: Monitor,
      description: "Automatically matches your device settings",
      color: "blue",
      imagePreview: "system-theme-preview.jpg",
    },
  ];

  const totalUsage = getTotalUsage();

  const appearanceTips = [
    {
      theme: "Light Theme",
      icon: Sun,
      color: "amber",
      tips: [
        "Best for bright environments (daytime/work hours)",
        "Helps with focus and readability in daylight",
        "Ideal for documents, emails, and writing tasks",
      ],
    },
    {
      theme: "Dark Theme",
      icon: Moon,
      color: "slate",
      tips: [
        "Best for low-light, night use, or eye comfort",
        "Saves battery on OLED screens",
        "Great for coding, design, and long reading",
      ],
    },
    {
      theme: "System Theme",
      icon: Monitor,
      color: "blue",
      tips: [
        "Follows your device settings, adapts automatically",
        "Recommended for users who switch day/night frequently",
        "Balanced choice if unsure",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <div className="max-w-4xl mx-auto  sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-8">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 dark:text-white tracking-tight mb-3">
            Appearance Settings
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Tailor your experience for optimal comfort and productivity.
          </p>
        </header>

        {/* Theme Overview */}
        <section className="bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-300/40 dark:border-white/10 rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="h-7 w-7 text-blue-600 dark:text-blue-400" />{" "}
            Theme Overview
          </h2>

          {/* Current Active Theme */}
          <div className="border-b border-gray-300/40 dark:border-white/10 pb-4">
            <h3 className="font-medium text-gray-800 dark:text-gray-300 mb-3">
              Current Active Theme
            </h3>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <div
                className={`w-4 h-4 rounded-full ${
                  currentEffectiveTheme === "dark"
                    ? "bg-slate-500"
                    : "bg-amber-500"
                } animate-pulse`}
              ></div>
              <span className="text-lg text-gray-900 dark:text-white">
                {themeOptions.find((opt) => opt.id === theme)?.label ||
                  "Unknown"}
                {theme === "auto" && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    (System: {systemTheme})
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Theme Usage Statistics */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Your Theme Usage
            </h3>
            {totalUsage === 0 ? (
              <div className="p-6 text-center rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-300/30 dark:border-white/10">
                <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No usage data yet. Start using themes to see analytics!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {themeOptions.map((option) => {
                  const percentage = getUsagePercentage(themeUsage[option.id]);
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.id}
                      className="bg-white/70 dark:bg-black/30 border border-gray-300/30 dark:border-white/10 rounded-lg p-4 text-center shadow-sm"
                    >
                      <Icon
                        className={`h-6 w-6 mx-auto mb-2 ${
                          option.color === "amber"
                            ? "text-amber-500"
                            : option.color === "slate"
                            ? "text-slate-500"
                            : "text-blue-500"
                        }`}
                      />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {percentage}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.label}
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                        <div
                          className={`h-2 rounded-full ${
                            option.color === "amber"
                              ? "bg-amber-500"
                              : option.color === "slate"
                              ? "bg-slate-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Theme Selection */}
        <section className="bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-300/40 dark:border-white/10 rounded-xl shadow-lg p-6 sm:p-8 space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sun className="h-7 w-7 text-blue-600 dark:text-blue-400" /> Choose
            Your Theme
          </h2>

          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleThemeChange(option.id)}
                disabled={isLoadingThemeChange}
                className={`w-full flex justify-between items-center p-4 rounded-lg border transition-all duration-300 ${
                  isActive
                    ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : "border-gray-300 dark:border-white/10 hover:bg-gray-100/40 dark:hover:bg-gray-800/40"
                } ${
                  isLoadingThemeChange
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      option.color === "amber"
                        ? "bg-amber-500"
                        : option.color === "slate"
                        ? "bg-slate-500"
                        : "bg-blue-500"
                    }`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isActive
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-400 dark:border-gray-600"
                  }`}
                >
                  {isActive && <Check className="h-3 w-3 text-white" />}
                </div>
              </button>
            );
          })}
        </section>

        {/* Recommendations */}
        <section className="bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-300/40 dark:border-white/10 rounded-xl shadow-lg p-6 sm:p-8 space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="h-7 w-7 text-blue-600 dark:text-blue-400" />{" "}
            Theme Recommendations
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {appearanceTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div
                  key={index}
                  className="bg-white/70 dark:bg-black/30 border border-gray-300/30 dark:border-white/10 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      className={`h-5 w-5 ${
                        tip.color === "amber"
                          ? "text-amber-500"
                          : "text-blue-500"
                      }`}
                    />
                    <h3 className="text-gray-900 dark:text-white font-medium">
                      {tip.theme}
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {tip.tips.map((t, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-600 dark:text-gray-400 flex gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2"></span>{" "}
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Timezone Setting */}
        <TimezoneSettingCard />

        {/* Performance Tips */}
        <section className="bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-300/40 dark:border-white/10 rounded-xl shadow-lg p-6 sm:p-8 space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="h-7 w-7 text-blue-600 dark:text-blue-400" />{" "}
            Performance Tips
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-300/30 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="text-green-700 dark:text-green-300 font-medium">
                  Dark Mode Benefits
                </h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                Can save up to 30% battery on OLED displays and reduces blue
                light exposure.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300/30 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-blue-700 dark:text-blue-300 font-medium">
                  Auto Theme Smart
                </h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Automatically adapts based on system preferences for better
                comfort.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AppearanceSettings;
