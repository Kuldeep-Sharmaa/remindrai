// DraftDetailView.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuthContext } from "../../../context/AuthContext";
import { markCopied } from "../../../services/draftInteractionsService";

export default function DraftDetailView({ draft }) {
  const [copied, setCopied] = useState(false);
  const { user } = useAuthContext();
  const uid = user?.uid;
  const timestamp = draft.createdAt?.toDate?.();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft.content);

      markCopied({
        uid,
        draftId: draft.id,
      });

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-border/30">
        <time className="text-sm font-inter text-muted block mb-2">
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
        <h3 className="text-xl font-grotesk font-semibold text-textLight dark:text-textDark">
          Draft Content
        </h3>
      </div>

      {/* Content */}
      <div className="mb-8">
        <div
          className="prose prose-slate dark:prose-invert max-w-none
                     font-inter text-textLight dark:text-textDark leading-relaxed
                     whitespace-pre-wrap"
        >
          {draft.content}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={handleCopy}
          className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-lg
                     font-inter text-sm font-medium transition-colors
                     flex items-center gap-2"
          whileTap={{ scale: 0.97 }}
        >
          {copied ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13 4L6 11L3 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect
                  x="5"
                  y="5"
                  width="9"
                  height="9"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M3 10.5V3.5C3 2.67157 3.67157 2 4.5 2H10.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Copy
            </>
          )}
        </motion.button>

        <div className="text-xs text-muted">
          {draft.content?.length || 0} characters
        </div>
      </div>
    </div>
  );
}
