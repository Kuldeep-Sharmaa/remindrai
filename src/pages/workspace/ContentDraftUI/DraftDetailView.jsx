import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Copy,
  ChevronDown,
  Pencil,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import { DateTime } from "luxon";
import { useAuthContext } from "../../../context/AuthContext";
import { markCopied } from "../../../services/draftInteractionsService";

const freqLabel = (raw) => {
  const map = {
    daily: "Every day",
    weekly: "Every week",
    one_time: "One time",
  };
  return map[raw] || "One time";
};

export default function DraftDetailView({ draft: deliveryItem }) {
  const [copied, setCopied] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const { currentUser } = useAuthContext();
  const uid = currentUser?.uid;

  if (!deliveryItem) return null;

  const { draft, prompt, role, tone, platform, reminderType, frequency } =
    deliveryItem;

  const timestamp = draft?.scheduledForUTC
    ? DateTime.fromISO(draft.scheduledForUTC, { zone: "utc" }).setZone(
        DateTime.local().zoneName,
      )
    : draft?.createdAt?.toDate
      ? DateTime.fromJSDate(draft.createdAt.toDate())
      : null;

  const formattedTime = timestamp?.isValid
    ? timestamp.toFormat("MMM d · h:mm a")
    : null;

  const platformLabel = platform
    ? platform.charAt(0).toUpperCase() + platform.slice(1)
    : null;

  const ctaLabel = platformLabel ? `Use on ${platformLabel}` : "Got it";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft.content);
      markCopied({ uid, draftId: draft.id });
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 sm:px-6 pt-6 pb-5 border-b border-border/10">
        <div className="space-y-1.5">
          <h2 className="text-lg sm:text-xl font-semibold text-textLight dark:text-textDark">
            You're all set.
          </h2>
          <p className="text-sm text-textLight dark:text-textDark">
            {platformLabel || "Content"} ready
            {tone && ` · ${tone} tone`}
            {formattedTime && ` · ${formattedTime}`}
          </p>
        </div>

        {prompt && (
          <div className="mt-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Pencil className="w-3 h-3 text-muted" />
              <p className="text-xs text-muted uppercase tracking-wide">
                Prompt
              </p>
            </div>
            <p className="text-sm sm:text-base text-textLight dark:text-textDark leading-normal">
              {prompt}
            </p>
          </div>
        )}
      </div>

      {/* Draft output */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
        <div className="flex items-center gap-1.5 mb-3">
          <FileText className="w-3 h-3 text-muted" />
          <p className="text-xs text-muted uppercase tracking-wide">Content</p>
        </div>

        <div className="bg-black/5 dark:bg-white/5 rounded-xl px-4 py-4">
          <p className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap text-textLight dark:text-textDark font-inter">
            {draft.content}
          </p>
          <p className="text-xs text-muted text-right mt-3">
            {draft.content?.length || 0} characters
          </p>
        </div>

        {(platform || tone || role || frequency) && (
          <div className="mt-4 pt-4 border-t border-border/10">
            <button
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 text-muted" />
                <span className="text-xs font-medium text-muted uppercase tracking-wide">
                  Details
                </span>
              </div>
              <motion.div
                animate={{ rotate: showMoreDetails ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-muted" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showMoreDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 grid grid-cols-2 gap-3">
                    {platform && <Meta label="Platform" value={platform} />}
                    {tone && <Meta label="Tone" value={tone} />}
                    {role && <Meta label="Role" value={role} />}
                    {frequency && (
                      <Meta label="How often" value={freqLabel(frequency)} />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-5 sm:px-6 py-4 border-t border-border/10 bg-bgLight dark:bg-bgImpact">
        <motion.button
          onClick={handleCopy}
          disabled={copied}
          className={`w-full px-6 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 shadow-sm ${
            copied
              ? "bg-green-600 text-white"
              : "bg-brand hover:brightness-110 text-white"
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className="inline-flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Copied. Ready to share.
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className="inline-flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {ctaLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-sm text-textLight dark:text-textDark capitalize">
        {value}
      </p>
    </div>
  );
}
