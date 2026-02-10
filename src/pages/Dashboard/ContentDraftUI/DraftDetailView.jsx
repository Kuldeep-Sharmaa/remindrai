/**
 * DraftDetailView.jsx
 *
 * Detailed view of a generated draft with full reminder context.
 * Shows prompt, metadata, content, and copy action.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuthContext } from "../../../context/AuthContext";
import { markCopied } from "../../../services/draftInteractionsService";

export default function DraftDetailView({ delivery }) {
  const [copied, setCopied] = useState(false);
  const { user } = useAuthContext();
  const uid = user?.uid;

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
  } = delivery;

  const timestamp = createdAt?.toDate?.();
  const statusLabel = enabled ? "Active reminder" : "Deleted reminder";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft.content);
      markCopied({ uid, draftId: draft.id });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Reminder context */}
      <div className="mb-6 pb-6 border-b border-[#1f2933]/30">
        <div className="text-sm text-[#9ca3af] mb-2">{statusLabel}</div>

        <h3 className="text-lg font-grotesk font-semibold text-[#0f172a] dark:text-[#e5e7eb] mb-2">
          {prompt}
        </h3>

        {/* Metadata */}
        <div className="text-xs text-[#9ca3af] flex flex-wrap gap-x-2">
          {[
            platform && "Platform: " + platform,
            tone && "Tone: " + tone,
            role && "Role: " + role,
            reminderType && "Type: " + reminderType,
            frequency,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>

        <time className="block text-xs text-[#9ca3af] mt-2">
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
        <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap text-[#0f172a] dark:text-[#e5e7eb]">
          {draft.content}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <motion.button
          onClick={handleCopy}
          className="px-5 py-2.5 bg-[#2563eb] hover:brightness-110 text-white rounded-lg text-sm font-medium transition-all"
          whileTap={{ scale: 0.97 }}
        >
          {copied ? "Copied" : "Copy"}
        </motion.button>

        <div className="text-xs text-[#9ca3af]">
          {draft.content?.length || 0} characters
        </div>
      </div>
    </div>
  );
}
