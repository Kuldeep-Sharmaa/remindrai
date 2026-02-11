/**
 * DraftDetailView.jsx
 *
 * Detailed view of a generated draft with full reminder context.
 * Shows prompt, metadata, content, and copy action.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineCpuChip, HiOutlineBookmark } from "react-icons/hi2";
import { CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useAuthContext } from "../../../context/AuthContext";
import { markCopied } from "../../../services/draftInteractionsService";

export default function DraftDetailView({ draft: deliveryItem }) {
  const [copied, setCopied] = useState(false);
  const { currentUser } = useAuthContext();
  const uid = currentUser?.uid;

  if (!deliveryItem) return null;

  // Destructure all context from the delivery item
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

  // Show whether the parent reminder is still active
  const statusLabel = enabled ? "Active" : "Completed";

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
    <div className="p-6 sm:p-8">
      {/* Header with status and context */}
      <div className="mb-6 pb-6 border-b border-[#1f2933]/30">
        {/* Status badges */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              enabled
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                : "bg-[#9ca3af]/10 text-[#9ca3af] border border-[#9ca3af]/20"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${enabled ? "bg-green-500" : "bg-[#9ca3af]"}`}
            />
            {statusLabel}
          </span>

          {/* Type badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isAI
                ? "bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20"
                : "bg-white dark:bg-black border border-[#1f2933] text-[#9ca3af]"
            }`}
          >
            {isAI ? (
              <HiOutlineCpuChip className="w-3.5 h-3.5" />
            ) : (
              <HiOutlineBookmark className="w-3.5 h-3.5" />
            )}
            {isAI ? "AI Draft" : "Simple Note"}
          </span>
        </div>

        {/* Prompt */}
        {prompt && (
          <h3 className="text-lg sm:text-xl font-grotesk font-semibold text-[#0f172a] dark:text-[#e5e7eb] mb-3 leading-tight">
            {prompt}
          </h3>
        )}

        {/* Metadata */}
        {(platform || tone || role || frequency) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#9ca3af] mb-3">
            {platform && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Platform:</span> {platform}
              </span>
            )}
            {tone && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Tone:</span> {tone}
              </span>
            )}
            {role && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Role:</span> {role}
              </span>
            )}
            {frequency && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Frequency:</span>{" "}
                {frequency.replace("_", " ")}
              </span>
            )}
          </div>
        )}

        {/* Timestamp */}
        <time className="block text-xs text-[#9ca3af]">
          {timestamp
            ? new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              }).format(timestamp)
            : "Unknown date"}
        </time>
      </div>

      {/* Draft content */}
      <div className="mb-8">
        <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap text-[#0f172a] dark:text-[#e5e7eb] leading-relaxed">
          {draft.content}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <motion.button
          onClick={handleCopy}
          disabled={copied}
          className={`relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all overflow-hidden ${
            copied
              ? "bg-green-600 text-white"
              : "bg-[#2563eb] hover:brightness-110 text-white"
          }`}
          whileTap={{ scale: 0.97 }}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="flex items-center gap-2"
              >
                <CheckIcon className="w-4 h-4" />
                Copied
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
                Copy to clipboard
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <div className="text-xs text-[#9ca3af] flex items-center gap-2">
          <span>{draft.content?.length || 0} characters</span>
          <span className="text-[#1f2933]">·</span>
          <span>
            {Math.ceil((draft.content?.length || 0) / 5)} words (approx)
          </span>
        </div>
      </div>
    </div>
  );
}
