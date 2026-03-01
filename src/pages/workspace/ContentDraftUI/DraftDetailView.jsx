/**
 * DraftDetailView.jsx
 *
 * Refined value-moment experience.
 * Focus: calm reassurance → clear content → simple handoff.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineCpuChip, HiOutlineBookmark } from "react-icons/hi2";
import { CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useAuthContext } from "../../../context/AuthContext";
import { markCopied } from "../../../services/draftInteractionsService";

export default function DraftDetailView({ draft: deliveryItem }) {
  const [copied, setCopied] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const { currentUser } = useAuthContext();
  const uid = currentUser?.uid;

  if (!deliveryItem) return null;

  const {
    draft,
    prompt,
    role,
    tone,
    platform,
    reminderType,
    frequency,
    enabled,
    createdAt,
  } = deliveryItem;

  const timestamp = (createdAt || draft?.createdAt)?.toDate?.();
  const isAI = reminderType === "ai";

  const formattedTime =
    timestamp &&
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(timestamp);

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
      {/* ================= Calm confirmation header ================= */}
      <div className="px-5 sm:px-6 pt-6 pb-5 border-b border-[#1f2933]/10">
        <div className="space-y-2">
          {/* Emotional reassurance */}
          <h2 className="text-lg sm:text-xl font-semibold text-[#0f172a] dark:text-[#e5e7eb]">
            You’re all set.
          </h2>

          {/* Quiet context */}
          <p className="text-sm text-[#9ca3af]">
            {platform || "Content"} ready
            {tone && ` • ${tone} tone`}
            {formattedTime && ` • ${formattedTime}`}
          </p>
        </div>

        {/* Original prompt (kept, but visually secondary) */}
        {prompt && (
          <div className="mt-4">
            <div className="text-xs text-[#9ca3af] mb-1.5">Prompt</div>
            <p className="text-[15px] text-[#0f172a] dark:text-[#e5e7eb] leading-normal">
              {prompt}
            </p>
          </div>
        )}
      </div>

      {/* ================= Draft content (primary focus) ================= */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6">
        <div className="max-w-2xl">
          <div className="text-[15.5px] sm:text-base leading-relaxed whitespace-pre-wrap text-[#0f172a] dark:text-[#e5e7eb] font-inter">
            {draft.content}
          </div>

          {/* Collapsible metadata (quiet + optional) */}
          {(platform || tone || role || frequency) && (
            <div className="mt-10 pt-6 border-t border-[#1f2933]/10">
              <button
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide">
                  Details
                </span>

                <motion.svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-[#9ca3af]"
                  animate={{ rotate: showMoreDetails ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
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
                        <Meta label="Frequency" value={frequency} />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ================= Action bar ================= */}
      <div className="px-5 sm:px-6 py-4 border-t border-[#1f2933]/10 bg-bgLight dark:bg-bgImpact">
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-[#9ca3af] hidden sm:block">
            {draft.content?.length || 0} characters
          </div>

          <motion.button
            onClick={handleCopy}
            disabled={copied}
            className={`ml-auto px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
              copied
                ? "bg-green-600 text-white"
                : "bg-[#2563eb] hover:bg-[#2563eb]/90 text-white"
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
                  className="inline-flex items-center gap-2"
                >
                  <CheckIcon className="w-4 h-4" />
                  Copied. Ready to share.
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  className="inline-flex items-center gap-2"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  Copy draft
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

/* Small helper for metadata */
function Meta({ label, value }) {
  return (
    <div>
      <div className="text-xs text-[#9ca3af] mb-1">{label}</div>
      <div className="text-sm text-[#0f172a] dark:text-[#e5e7eb]">{value}</div>
    </div>
  );
}
