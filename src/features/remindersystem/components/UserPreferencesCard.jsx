import React from "react";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { useAuthContext } from "../../../context/AuthContext";
import Spinner from "../../../components/Ui/LoadingSpinner";

export default function UserPreferencesCard({ handleSettingsClick }) {
  const { currentUser, loading } = useAuthContext();

  // Safe extraction of preferences
  const prefs = currentUser?.preferences || {};
  const role = prefs.role || currentUser?.role || null;
  const tone = prefs.tone || currentUser?.tone || null;
  const platform = prefs.platform || currentUser?.platform || null;
  const fullName = currentUser?.fullName || currentUser?.displayName || "You";

  // Loading skeleton
  if (loading || !currentUser) {
    return (
      <div className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 mb-4">
        <div className="flex items-center justify-center h-20">
          <Spinner />
        </div>
      </div>
    );
  }

  // Pill component (tiny, expressive)
  const Pill = ({ children, tone = "accent" }) => {
    const base =
      "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold";
    const styles =
      tone === "muted"
        ? "text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800"
        : "text-indigo-700 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800";

    return <span className={`${base} ${styles}`}>{children}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 mb-4"
      role="region"
      aria-label="Your content preferences"
    >
      {/* Top row: avatar + name + edit button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            }}
            aria-hidden="true"
          >
            {String(fullName).charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {fullName}
              </h4>
            </div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
              Your AI identity — how RemindrAI writes for you
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof handleSettingsClick === "function")
                handleSettingsClick();
            }}
            aria-label="Edit content preferences"
            className="inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            {/* dashboard/settings/preferences */}
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>
      </div>

      {/* Preferences summary: stacked on mobile, inline on sm+ */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
            I’m a{" "}
            {role ? (
              <Pill>{role}</Pill>
            ) : (
              <Pill tone="muted">Role not set</Pill>
            )}{" "}
            who likes to sound{" "}
            {tone ? (
              <Pill>{tone}</Pill>
            ) : (
              <Pill tone="muted">Tone not set</Pill>
            )}{" "}
            on{" "}
            {platform ? (
              <Pill>{platform}</Pill>
            ) : (
              <Pill tone="muted">Platform not set</Pill>
            )}
            .
          </p>

          {/* CTA when preferences missing */}
          {!(role && tone && platform) && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Tip: set your Role, Tone, and Platform for more accurate drafts.{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof handleSettingsClick === "function")
                    handleSettingsClick();
                }}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-300 hover:underline focus:outline-none"
              >
                Update preferences
              </button>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
