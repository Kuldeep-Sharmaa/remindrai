/**
 * DraftDetailView.jsx
 *
 * Detailed view of AI-generated content.
 * Mobile-first, content-focused design.
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
      {/* Header - Context at a glance */}
      <div className="px-4 sm:px-6 pt-6 pb-4 border-b border-[#1f2933]/10">
        <div className="flex items-center  gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                isAI
                  ? "bg-[#2563eb]/10 text-[#2563eb]"
                  : "bg-[#9ca3af]/10 text-[#9ca3af]"
              }`}
            >
              {isAI ? (
                <HiOutlineCpuChip className="w-3.5 h-3.5" />
              ) : (
                <HiOutlineBookmark className="w-3.5 h-3.5" />
              )}
              {isAI ? "Draft" : "Note"}
            </span>

            {enabled !== undefined && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                  enabled
                    ? "text-green-600 dark:text-green-400"
                    : "text-[#9ca3af]"
                }`}
              >
                <span
                  className={`h-1 w-1 rounded-full ${enabled ? "bg-green-500" : "bg-[#9ca3af]"}`}
                />
                {enabled ? "Active" : "Completed"}
              </span>
            )}
          </div>

          <time className="text-xs text-[#9ca3af] tabular-nums">
            {timestamp
              ? new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }).format(timestamp)
              : "Unknown"}
          </time>
        </div>

        {/* Prompt - Always visible */}
        {prompt && (
          <div className="pr-8">
            <div className="text-xs text-[#9ca3af] mb-1.5">Prompt</div>
            <p className="text-[15px] text-[#0f172a] dark:text-[#e5e7eb] leading-normal">
              {prompt}
            </p>
          </div>
        )}
      </div>

      {/* Content - Primary focus */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-2xl">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="text-[15px] sm:text-base leading-relaxed text-[#0f172a] dark:text-[#e5e7eb] whitespace-pre-wrap font-inter">
              {draft.content}
            </div>
          </div>

          {/* Additional metadata - Collapsible */}
          {(platform || tone || role || frequency) && (
            <div className="mt-8 pt-6 border-t border-[#1f2933]/10">
              <button
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="flex items-center justify-between w-full text-left group"
              >
                <span className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide">
                  More details
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
                      {platform && (
                        <div>
                          <div className="text-xs text-[#9ca3af] mb-1">
                            Platform
                          </div>
                          <div className="text-sm text-[#0f172a] dark:text-[#e5e7eb]">
                            {platform}
                          </div>
                        </div>
                      )}
                      {tone && (
                        <div>
                          <div className="text-xs text-[#9ca3af] mb-1">
                            Tone
                          </div>
                          <div className="text-sm text-[#0f172a] dark:text-[#e5e7eb]">
                            {tone}
                          </div>
                        </div>
                      )}
                      {role && (
                        <div>
                          <div className="text-xs text-[#9ca3af] mb-1">
                            Role
                          </div>
                          <div className="text-sm text-[#0f172a] dark:text-[#e5e7eb]">
                            {role}
                          </div>
                        </div>
                      )}
                      {frequency && (
                        <div>
                          <div className="text-xs text-[#9ca3af] mb-1">
                            How often
                          </div>
                          <div className="text-sm text-[#0f172a] dark:text-[#e5e7eb]">
                            {frequency}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="px-4 sm:px-6 py-4 border-t border-[#1f2933]/10 bg-bgLight dark:bg-bgImpact">
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
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="inline-flex items-center gap-2"
                >
                  <CheckIcon className="w-4 h-4" />
                  Copied
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="inline-flex items-center gap-2"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  Copy
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
