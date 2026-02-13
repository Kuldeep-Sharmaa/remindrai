/**
 * ReminderListItem.jsx
 *
 * Individual reminder card with AI/Simple type indicators.
 * Shows next run time, frequency, and delete confirmation.
 */

import React, {
  memo,
  useMemo,
  useCallback,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { TrashIcon, EyeIcon, ClockIcon } from "@heroicons/react/24/outline";
import { HiOutlineCpuChip, HiOutlineBookmark } from "react-icons/hi2";
import { DateTime } from "luxon";
import clsx from "clsx";

// Convert various timestamp formats to ISO string
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
    one_time: "One-time",
    daily: "Daily",
    weekly: "Weekly",
  };
  return map[String(raw).toLowerCase()] || String(raw).replace(/_/g, " ");
};

// Delete confirmation dialog
function ConfirmDeletePortal({ open, anchorRect, onConfirm, onCancel }) {
  const popMotion = {
    initial: { opacity: 0, y: -6, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.12 } },
    exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.12 } },
  };
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => (e.key === "Escape" ? onCancel?.() : null);
    const onClick = (e) =>
      ref.current && !ref.current.contains(e.target) ? onCancel?.() : null;

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open, onCancel]);

  if (!open || !anchorRect) return null;

  const padding = 8;
  const approxHeight = 110;
  const aboveTop = anchorRect.top - approxHeight - padding;
  const placeTop = aboveTop > 10 ? aboveTop : anchorRect.bottom + padding;
  const right = Math.max(8, window.innerWidth - (anchorRect.right + 8));

  return createPortal(
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={popMotion}
      role="dialog"
      aria-modal="true"
      className="z-[9999] bg-bgLight dark:bg-bgDark border border-border rounded-lg shadow-lg"
      style={{
        position: "fixed",
        top: Math.max(8, placeTop),
        right,
        width: 280,
      }}
    >
      <div ref={ref} className="p-3 text-sm text-textLight dark:text-textDark">
        <div className="font-medium mb-1">Stop future deliveries?</div>

        <div className="text-xs text-muted mb-3">
          RemindrAI will no longer create or deliver new drafts for this.
          <div className="text-muted mt-1">
            Existing drafts will remain accessible, but no new ones will be
            generated or sent. You can always create a new Prompt later.
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-2 py-1 text-xs rounded-md bg-bgLight dark:bg-bgDark border border-border text-textLight dark:text-textDark hover:brightness-95"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-2 py-1 text-xs rounded-md bg-brand text-white hover:brightness-110"
          >
            Stop deliveries
          </button>
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}

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

  // AI content preview
  const aiPreviewSentence = useMemo(() => {
    if (!isAI) return null;
    const parts = [];
    if (content.role) parts.push(`I'm a ${content.role}`);
    if (content.tone) parts.push(`I prefer a ${content.tone} tone`);
    if (content.platform) parts.push(`on ${content.platform}`);
    const anchors = parts.join(". ");
    const body =
      String(content?.aiPrompt || "").trim() || "No prompt provided.";
    return anchors ? `${anchors} — ${body.slice(0, 240)}…` : body.slice(0, 240);
  }, [isAI, content]);

  // Simple content preview
  const simplePreview = useMemo(() => {
    if (isAI) return null;
    const message = String(content?.message || "").trim();
    return message.length > 200
      ? message.slice(0, 200) + "…"
      : message || "No message.";
  }, [isAI, content]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const DeleteBtnRef = useRef(null);
  const [anchorRect, setAnchorRect] = useState(null);

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
      setAnchorRect(DeleteBtnRef.current?.getBoundingClientRect() || null);
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

  // Update anchor position on scroll/resize
  useLayoutEffect(() => {
    if (!confirmOpen) return;
    const updateRect = () =>
      setAnchorRect(DeleteBtnRef.current?.getBoundingClientRect() || null);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [confirmOpen]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={clsx(
        "rounded-xl w-full",
        !enabled && "opacity-60 grayscale-[0.5]",
      )}
      onClick={() => enabled && onView?.(id)}
      role="listitem"
    >
      <div
        className="bg-bgLight  dark:bg-gray-900 border border-border rounded-xl px-4 sm:px-5 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-start gap-4 transition-shadow hover:shadow-sm"
        style={{ cursor: enabled ? "pointer" : "default" }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={clsx(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold",
                isAI
                  ? "bg-brand text-white"
                  : "bg-bgLight dark:bg-bgDark border border-border text-muted",
              )}
            >
              {isAI ? (
                <HiOutlineCpuChip className="w-4 h-4" />
              ) : (
                <HiOutlineBookmark className="w-4 h-4" />
              )}
              {isAI ? "AI Draft" : "Simple Note"}
            </span>

            {isPendingBackend && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/20">
                <ClockIcon className="w-3.5 h-3.5" />
                Preparing
              </span>
            )}
          </div>

          <div className="text-sm sm:text-base text-textLight dark:text-textDark mt-3 line-clamp-3 ">
            {isAI ? aiPreviewSentence : simplePreview}
          </div>
        </div>

        <div className="flex flex-col items-end justify-between min-w-[160px] sm:min-w-[180px]">
          <div className="text-right">
            <div className="text-sm font-medium text-textLight dark:text-textDark">
              {!enabled
                ? "Completed"
                : isPendingBackend
                  ? "Setting up"
                  : `Delivers on: ${formatNextRun(nextIso, tz)}`}
            </div>
            <div className="text-xs text-muted mt-1">{freqLabel(reminder)}</div>
          </div>

          <div className="flex items-center gap-2 mt-3 sm:mt-4">
            <button
              type="button"
              onClick={handleView}
              title="View details"
              className="p-2 rounded-md hover:bg-bgLight/50 dark:hover:bg-bgDark/50 border border-transparent hover:border-border transition"
            >
              <EyeIcon className="w-5 h-5 text-muted" />
            </button>

            <div className="relative">
              <button
                ref={DeleteBtnRef}
                type="button"
                onClick={handleDeleteClick}
                title={enabled ? "Stop future deliveries" : "Delivery stopped"}
                aria-label={
                  enabled ? "Stop future deliveries" : "Delivery stopped"
                }
                className={clsx(
                  "p-2 rounded-md transition",
                  enabled
                    ? "hover:bg-brand/10 text-brand border border-transparent hover:border-brand/20"
                    : "opacity-30 cursor-not-allowed text-muted",
                )}
              >
                <TrashIcon className="w-5 h-5" />
              </button>

              <ConfirmDeletePortal
                open={confirmOpen}
                anchorRect={anchorRect}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default memo(ReminderListItem);
