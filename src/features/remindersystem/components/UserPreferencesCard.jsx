import React from "react";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { useAuthContext } from "../../../context/AuthContext";
import Spinner from "../../../components/Ui/LoadingSpinner";

export default function UserPreferencesCard({ handleSettingsClick }) {
  const { currentUser, loading } = useAuthContext();

  const prefs = currentUser?.preferences || {};
  const role = prefs.role || currentUser?.role || null;
  const tone = prefs.tone || currentUser?.tone || null;
  const platform = prefs.platform || currentUser?.platform || null;

  if (loading || !currentUser) {
    return (
      <div className="w-full rounded-2xl border border-border bg-bgLight dark:bg-bgDark p-4 mb-4">
        <div className="flex items-center justify-center h-20">
          <Spinner />
        </div>
      </div>
    );
  }

  const Pill = ({ children, muted }) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border
      ${
        muted
          ? "text-muted border-border"
          : "text-brand border-brand/30 bg-brand/10"
      }`}
    >
      {children}
    </span>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full rounded-2xl border border-border bg-bgLight dark:bg-bgDark p-4 mb-4"
      role="region"
      aria-label="Content identity"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-textLight dark:text-textDark">
            Content Identity
          </h4>
          <p className="text-xs text-muted mt-1">
            how drafts are written for you
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSettingsClick?.();
          }}
          className="inline-flex items-center gap-1 text-xs font-medium text-textLight dark:text-textDark hover:text-brand transition-colors"
          aria-label="Edit content identity"
        >
          <Settings className="w-4 h-4" />
          <span>Edit</span>
        </button>
      </div>

      {/* Identity Summary */}
      <div className="mt-4 w-full sm:max-w-xl lg:max-w-xl">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2">
          <span className="text-[11px] uppercase tracking-wide text-muted">
            Role
          </span>
          {role ? <Pill>{role}</Pill> : <Pill muted>Not set</Pill>}

          <span className="text-[11px] uppercase tracking-wide text-muted">
            Tone
          </span>
          {tone ? <Pill>{tone}</Pill> : <Pill muted>Not set</Pill>}

          <span className="text-[11px] uppercase tracking-wide text-muted">
            Platform
          </span>
          {platform ? <Pill>{platform}</Pill> : <Pill muted>Not set</Pill>}
        </div>
      </div>

      {/* Missing Config Hint */}
      {!(role && tone && platform) && (
        <p className="mt-3 text-xs text-muted">
          Complete identity settings for more accurate drafts.
        </p>
      )}
    </motion.section>
  );
}
