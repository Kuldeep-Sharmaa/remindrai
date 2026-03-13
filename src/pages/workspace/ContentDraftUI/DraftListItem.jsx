import React from "react";
import { motion } from "framer-motion";
import { HiOutlineCpuChip, HiOutlineBookmark } from "react-icons/hi2";
import { DateTime } from "luxon";

export default function DraftListItem({
  draft,
  reminderTitle,
  reminderType,
  isUnread,
  onClick,
}) {
  // Prefer scheduledForUTC over createdAt — it's when the draft was meant to arrive,
  // not when Firestore wrote it (those can differ by a few seconds).
  const timestamp = draft.scheduledForUTC
    ? DateTime.fromISO(draft.scheduledForUTC, { zone: "utc" }).setZone(
        DateTime.local().zoneName,
      )
    : draft.createdAt?.toDate
      ? DateTime.fromJSDate(draft.createdAt.toDate())
      : null;

  // Calendar-day comparison via Luxon so DST and timezone edges don't bite us.
  // Comparing startOf("day") is the standard correct approach here.
  const formatTime = (dt) => {
    if (!dt || !dt.isValid) return "";

    const diffDays = Math.round(
      DateTime.local().startOf("day").diff(dt.startOf("day"), "days").days,
    );

    if (diffDays === 0) return dt.toFormat("h:mm a");
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return dt.toFormat("ccc");

    return dt.toFormat("MMM d");
  };

  const preview =
    draft.content?.slice(0, 100) || "Prepared and ready when you are.";
  const isAiDraft = reminderType === "ai";
  const ReminderIcon = isAiDraft ? HiOutlineCpuChip : HiOutlineBookmark;

  return (
    <motion.button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-colors duration-150
                  hover:border-brand/40 hover:bg-brand/5
                  ${
                    isUnread
                      ? "border-brand/40 bg-brand/5"
                      : "border-border/20 bg-white dark:bg-transparent"
                  }`}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex-shrink-0 ${isAiDraft ? "text-brand" : "text-textLight dark:text-textDark"}`}
        >
          <ReminderIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isUnread && (
                <div
                  className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0"
                  aria-label="Unread"
                />
              )}
              <h3 className="font-grotesk font-semibold text-sm sm:text-base text-textLight dark:text-textDark truncate">
                {reminderTitle}
              </h3>
            </div>
            <time className="text-xs text-muted whitespace-nowrap flex-shrink-0 mt-0.5">
              {formatTime(timestamp)}
            </time>
          </div>

          <p className="text-xs sm:text-sm text-textLight/80 dark:text-textDark/80 line-clamp-2 leading-relaxed">
            {preview}
            {draft.content?.length > 100 && "…"}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
