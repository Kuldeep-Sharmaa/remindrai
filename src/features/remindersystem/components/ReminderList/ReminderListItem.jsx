/**
 * ReminderListItem.jsx
 *
 * Individual reminder definition item.
 * Shows next run time, frequency, and delete confirmation.
 */

import React, {
  memo,
  useMemo,
  useCallback,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
import { motion } from "framer-motion";
import { TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { HiOutlineCpuChip, HiOutlineBookmark } from "react-icons/hi2";
import { DateTime } from "luxon";
import clsx from "clsx";

import ConfirmDeletePortal from "./ConfirmDeletePortal";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

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

  // AI preview
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

  // Simple preview
  const simplePreview = useMemo(() => {
    if (isAI) return null;

    const message = String(content?.message || "").trim();
    return message.length > 200
      ? message.slice(0, 200) + "…"
      : message || "No message.";
  }, [isAI, content]);

  // ─────────────────────────────────────────────
  // Delete logic (UNCHANGED)
  // ─────────────────────────────────────────────

  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteBtnRef = useRef(null);
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

      setAnchorRect(deleteBtnRef.current?.getBoundingClientRect() || null);
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

  // Keep anchor synced on scroll / resize
  useLayoutEffect(() => {
    if (!confirmOpen) return;

    const updateRect = () =>
      setAnchorRect(deleteBtnRef.current?.getBoundingClientRect() || null);

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [confirmOpen]);

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={clsx(
        "w-full border-t border-border py-8 transition-colors",
        enabled && "hover:bg-bgImpact/20",
        !enabled && "opacity-60",
      )}
      onClick={() => enabled && onView?.(id)}
      role="listitem"
    >
      <div
        className="flex flex-col gap-5"
        style={{ cursor: enabled ? "pointer" : "default" }}
      >
        {/* Meta Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-widest text-muted">
              {isAI ? "AI Draft" : "Simple Note"}
            </span>

            {isPendingBackend && (
              <span className="text-[11px] text-brand tracking-wide">
                Preparing
              </span>
            )}
          </div>

          {!enabled && (
            <span className="text-[11px] text-muted tracking-wide">
              Completed
            </span>
          )}
        </div>

        {/* Intent Preview (Primary Focus) */}
        <div className="text-base sm:text-lg font-medium text-textDark leading-relaxed line-clamp-3">
          {isAI ? aiPreviewSentence : simplePreview}
        </div>

        {/* Schedule (Secondary Metadata) */}
        {enabled && (
          <div className="text-xs text-muted tracking-wide">
            Next · {formatNextRun(nextIso, tz)} · {freqLabel(reminder)}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleView}
            title="View details"
            className="p-2 rounded-md hover:bg-bgImpact/40 transition"
          >
            <EyeIcon className="w-4 h-4 text-muted" />
          </button>

          {enabled && (
            <>
              <button
                ref={deleteBtnRef}
                type="button"
                onClick={handleDeleteClick}
                title="Stop future deliveries"
                aria-label="Stop future deliveries"
                className="p-2 rounded-md transition hover:bg-brand/10 text-brand"
              >
                <TrashIcon className="w-4 h-4" />
              </button>

              <ConfirmDeletePortal
                open={confirmOpen}
                anchorRect={anchorRect}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
              />
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default memo(ReminderListItem);
