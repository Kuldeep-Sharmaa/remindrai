// DraftListItem.
import React from "react";
import { motion } from "framer-motion";

export default function DraftListItem({ draft, onClick }) {
  const timestamp = draft.createdAt?.toDate?.();
  const preview = draft.content?.slice(0, 180) || "";
  const hasMore = draft.content?.length > 180;

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left bg-bgLight dark:bg-bgDark border border-border/30 
                 rounded-lg p-5 hover:border-brand/40 transition-all duration-200
                 group cursor-pointer"
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.998 }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <time className="text-xs font-inter text-muted">
          {timestamp
            ? new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              }).format(timestamp)
            : "Unknown"}
        </time>
        <div className="text-xs text-brand opacity-0 group-hover:opacity-100 transition-opacity">
          View →
        </div>
      </div>

      <div className="text-textLight dark:text-textDark leading-relaxed">
        {preview}
        {hasMore && <span className="text-muted ml-1">...</span>}
      </div>
    </motion.button>
  );
}
