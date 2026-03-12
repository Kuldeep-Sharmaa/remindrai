import React, { memo, useMemo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Eye } from "lucide-react";
import { DateTime } from "luxon";
import clsx from "clsx";
import ConfirmDeletePortal from "./ConfirmDeletePortal";

const toIsoString = (v) => {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString();
  if (typeof v?.toDate === "function") return v.toDate().toISOString();
  return null;
};

const formatNextRun = (isoString, timezone) => {
  if (!isoString) return "Not scheduled";
  try {
    const dt = DateTime.fromISO(isoString, { zone: "utc" }).setZone(
      timezone || DateTime.local().zoneName,
    );
    return dt.toFormat("MMM d • h:mm a");
  } catch {
    return "Invalid time";
  }
};

const freqLabel = (reminder = {}) => {
  const raw = reminder?.frequency || "one_time";
  const map = {
    one_time: "One time",
    daily: "Every day",
    weekly: "Every week",
  };
  return map[String(raw).toLowerCase()] || String(raw).replace(/_/g, " ");
};

// truncates the full constructed string — identity + brief combined
const truncate = (text, limit = 90) => {
  if (!text) return "";
  return text.length > limit ? text.slice(0, limit).trimEnd() + "…" : text;
};

const ReminderListItem = ({ reminder, onView, onDelete }) => {
  const {
    id,
    reminderType,
    schedule = {},
    content = {},
    nextRunAtUTC,
    enabled = true,
  } = reminder || {};

  const isAI = String(reminderType || "").toLowerCase() === "ai";
  const tz = schedule?.timezone || DateTime.local().zoneName;
  const nextIso = toIsoString(nextRunAtUTC);
  const isPendingBackend = enabled === true && !nextIso;

  const cardPreview = useMemo(() => {
    if (isAI) {
      const parts = [];
      if (content.role) parts.push(`I'm a ${content.role}`);
      if (content.tone) parts.push(`I prefer a ${content.tone} tone`);
      if (content.platform) parts.push(`on ${content.platform}`);

      const identity = parts.join(". ");
      const brief = String(content?.aiPrompt || "").trim();
      const full =
        identity && brief ? `${identity} — ${brief}` : identity || brief;

      return truncate(full) || "No prompt provided.";
    }

    const message = String(content?.message || "").trim();
    return truncate(message) || "No message.";
  }, [isAI, content]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleView = useCallback(
    (e) => {
      e?.stopPropagation();
      if (onView) onView(id);
    },
    [id, onView],
  );

  const handleDeleteClick = useCallback(
    (e) => {
      e?.stopPropagation();
      if (!enabled) return;
      setConfirmOpen(true);
    },
    [enabled],
  );

  const confirmDelete = useCallback(
    (e) => {
      e?.stopPropagation();
      setConfirmOpen(false);
      if (onDelete) onDelete(id);
    },
    [id, onDelete],
  );

  const cancelDelete = useCallback((e) => {
    e?.stopPropagation();
    setConfirmOpen(false);
  }, []);

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className={clsx(
          "w-full rounded-xl border border-border/40 px-4 py-5",
          "bg-bgImpact transition-colors duration-150",
          enabled && "cursor-pointer hover:border-border/70",
          !enabled && "opacity-50 cursor-default",
        )}
        onClick={() => enabled && onView?.(id)}
        role="listitem"
      >
        <div className="flex flex-col gap-3">
          {/* Type badge + status */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest font-medium text-muted">
              {isAI ? "AI Draft" : "Simple Note"}
            </span>
            {isPendingBackend && (
              <span className="text-[11px] text-brand tracking-wide">
                Preparing…
              </span>
            )}
            {!enabled && (
              <span className="text-[11px] text-muted tracking-wide">
                Completed
              </span>
            )}
          </div>

          {/* Preview — identity context + brief glimpse */}
          <p className="text-sm sm:text-base font-medium text-textLight dark:text-textDark leading-snug">
            {cardPreview}
          </p>

          {/* Schedule */}
          {enabled && (
            <p className="text-xs text-textLight/80 dark:text-textDark/80 tracking-wide">
              Next · {formatNextRun(nextIso, tz)} · {freqLabel(reminder)}
            </p>
          )}

          {/* Actions — stop propagation so clicks don't open the modal */}
          <div
            className="flex items-center gap-0.5 pt-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleView}
              aria-label="View prompt details"
              className="p-2 rounded-md text-muted hover:text-textLight dark:hover:text-textDark hover:bg-white/5 transition-colors duration-150"
            >
              <Eye className="w-4 h-4" />
            </button>

            {enabled && (
              <button
                type="button"
                onClick={handleDeleteClick}
                aria-label="Stop future deliveries"
                className="p-2 rounded-md text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-150"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.article>

      <ConfirmDeletePortal
        open={confirmOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};

export default memo(ReminderListItem);
