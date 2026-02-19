import React from "react";
import { motion } from "framer-motion";
import { HiOutlineCpuChip, HiOutlineBookmark } from "react-icons/hi2";

export default function DraftListItem({
  draft,
  reminderTitle,
  reminderType,
  isUnread,
  onClick,
}) {
  const timestamp = draft.createdAt?.toDate?.();

  const formatTime = (date) => {
    if (!date) return "";

    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    if (days === 1) return "Yesterday";

    if (days < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Emotional preview fallback (important change)
  const preview =
    draft.content?.slice(0, 100) || "Prepared and ready when you are.";

  const hasMore = draft.content?.length > 100;

  const isAiDraft = reminderType === "ai";
  const ReminderIcon = isAiDraft ? HiOutlineCpuChip : HiOutlineBookmark;

  return (
    <motion.button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all
                  hover:border-brand/40 hover:bg-brand/5
                  ${
                    isUnread
                      ? "border-brand/40 bg-brand/5"
                      : "border-border/20 bg-transparent"
                  }`}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-1 flex-shrink-0 ${
            isAiDraft ? "text-brand" : "text-muted"
          }`}
        >
          <ReminderIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isUnread && (
                <div
                  className="w-2 h-2 rounded-full bg-brand flex-shrink-0"
                  aria-label="Unread"
                />
              )}

              <h3 className="font-grotesk font-semibold text-base text-textLight dark:text-textDark truncate">
                {reminderTitle}
              </h3>
            </div>

            <time className="text-xs text-muted whitespace-nowrap flex-shrink-0 mt-0.5">
              {formatTime(timestamp)}
            </time>
          </div>

          <p className="text-sm text-muted line-clamp-2 leading-relaxed">
            {preview}
            {hasMore && "..."}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
