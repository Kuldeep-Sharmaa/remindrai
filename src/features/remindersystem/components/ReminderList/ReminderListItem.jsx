// ReminderListItem.jsx — single-badge, meaningful title, anchor-rich preview
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
import { TrashIcon, EyeIcon, BoltIcon } from "@heroicons/react/24/outline";
import { DateTime } from "luxon";
import clsx from "clsx";

/* Helpers */
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
      timezone || DateTime.local().zoneName
    );
    return dt.toFormat("MMM d • h:mm a");
  } catch {
    return "Invalid time";
  }
};

const freqLabel = (reminder = {}, schedule = {}) => {
  const raw =
    reminder?.frequency ||
    schedule?.frequency ||
    schedule?.kind ||
    (schedule?.rule && schedule.rule.frequency) ||
    schedule?.recurrence ||
    null;
  if (!raw) return "One-time";
  const map = {
    one_time: "One-time",
    onetime: "One-time",
    oneTime: "One-time",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    hourly: "Hourly",
  };
  const key = String(raw).toLowerCase();
  return map[key] || String(raw).replace(/_/g, " ");
};

/* Confirm portal (with Escape & outside-click handling) */
function ConfirmPortal({ open, anchorRect, onConfirm, onCancel }) {
  const popMotion = {
    initial: { opacity: 0, y: -6, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.12 } },
    exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.12 } },
  };
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onCancel?.();
    };
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
      aria-labelledby="confirm-delete-title"
      className="z-[9999] bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg"
      style={{
        position: "fixed",
        top: Math.max(8, placeTop),
        right,
        width: 280,
      }}
    >
      <div ref={ref} className="p-3 text-sm text-gray-800 dark:text-gray-100">
        <div id="confirm-delete-title" className="font-medium mb-1">
          Delete Task?
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          This action cannot be undone.
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}

/* Motion presets */
const cardMotion = {
  initial: { opacity: 0, y: -6, scale: 0.995 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.14 } },
  exit: { opacity: 0, y: 8, scale: 0.995, transition: { duration: 0.12 } },
};
const hoverMotion = { rest: { scale: 1 }, hover: { scale: 1.01 } };

/* Component */
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

  // Content fields
  const explicitTitle =
    content?.title && String(content.title).trim().length > 0
      ? String(content.title).trim()
      : null;
  const message = String(content?.message || content?.aiPrompt || "").trim();
  const role = content?.role || "";
  const tone = content?.tone || "";
  const platform = content?.platform || "";

  // --- Title selection

  // --- aiPreviewSentence: keep your natural anchors ("I'm a...", "I prefer...", "for/on...") and connect to user prompt
  const aiPreviewSentence = useMemo(() => {
    if (!isAI) return null;

    // Build anchor pieces with natural-language grammar (preserve your original phrasing)
    const parts = [];
    if (role) parts.push(`I'm a ${role}`);
    if (tone) parts.push(`I prefer a ${tone} tone`);
    // use "on" for platform reads more natural in sentence: "for LinkedIn" also works — use "on"
    if (platform) parts.push(`on ${platform}`);

    // Combine anchors into one readable clause using sentences (preserves your style)
    const anchorsClause = parts.length ? parts.join(". ") : "";

    // Body content (the actual message/prompt) — prefer explicit title if present
    const body = message || explicitTitle || "No prompt provided.";
    const truncatedBody =
      body.length > 240 ? body.slice(0, 240).trim() + "…" : body;

    // Final sentence: anchors (if any) + em dash + body.
    // Example: "I'm a Founder. I prefer a casual tone. on LinkedIn — Write a short motivational post..."
    if (anchorsClause) {
      // ensure anchorsClause ends without extra punctuation
      const normalizedAnchors = anchorsClause.replace(/\s+$/g, "");
      return `${normalizedAnchors} — ${truncatedBody}`;
    }

    // If no anchors, just return the body
    return truncatedBody;
  }, [isAI, role, tone, platform, message, explicitTitle]);

  // For simple reminders show the message plainly under title
  const simplePreview = useMemo(() => {
    if (isAI) return null;
    if (message)
      return message.length > 200
        ? message.slice(0, 200).trim() + "…"
        : message;
    return explicitTitle || "No message provided.";
  }, [isAI, message, explicitTitle]);

  const nextLabel = formatNextRun(nextIso, tz);
  const frequencyLabel = freqLabel(reminder, schedule);

  /* delete confirm */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteBtnRef = useRef(null);
  const [anchorRect, setAnchorRect] = useState(null);

  const handleView = useCallback(
    (e) => {
      e?.stopPropagation?.();
      if (typeof onView === "function") onView(id);
    },
    [id, onView]
  );

  const handleCardClick = useCallback(() => {
    if (typeof onView === "function") onView(id);
  }, [id, onView]);

  const stop = useCallback((e) => e?.stopPropagation?.(), []);

  const handleDeleteClick = useCallback(
    (e) => {
      stop(e);
      const rect = deleteBtnRef.current?.getBoundingClientRect?.();
      setAnchorRect(rect || null);
      setConfirmOpen(true);
    },
    [stop]
  );

  const confirmDelete = useCallback(
    (e) => {
      stop(e);
      setConfirmOpen(false);
      setAnchorRect(null);
      if (typeof onDelete === "function") onDelete(id);
    },
    [id, onDelete, stop]
  );

  const cancelDelete = useCallback(
    (e) => {
      stop(e);
      setConfirmOpen(false);
      setAnchorRect(null);
    },
    [stop]
  );

  useLayoutEffect(() => {
    if (!confirmOpen) return;
    const onResize = () => {
      if (deleteBtnRef.current) {
        setAnchorRect(deleteBtnRef.current.getBoundingClientRect());
      }
    };
    const onScroll = () => {
      if (deleteBtnRef.current) {
        setAnchorRect(deleteBtnRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [confirmOpen]);

  const badgeText = isAI ? "Brand consistent" : "Basic Task";

  return (
    <>
      <motion.article
        layout
        initial="initial"
        animate="animate"
        exit="exit"
        variants={cardMotion}
        className={clsx(
          "rounded-xl overflow-visible w-full",
          !enabled && "opacity-70"
        )}
        onClick={handleCardClick}
        role="listitem"
        tabIndex={0}
        aria-labelledby={`reminder-${id}-title`}
      >
        <motion.div
          variants={hoverMotion}
          initial="rest"
          whileHover="hover"
          whileTap="rest"
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-5 py-5 flex flex-col sm:flex-row sm:items-start gap-4"
          style={{ cursor: "pointer" }}
        >
          {/* Left: badge + title + preview */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold select-none",
                      isAI
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    )}
                    aria-hidden
                  >
                    <BoltIcon
                      className={clsx(
                        "w-4 h-4",
                        isAI ? "text-white" : "text-blue-600"
                      )}
                    />
                    <span className="truncate">{badgeText}</span>
                  </span>
                </div>

                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                  {isAI ? aiPreviewSentence : simplePreview}
                </div>
              </div>
            </div>
          </div>

          {/* Right: time, freq, actions */}
          <div className="flex flex-col items-end justify-between gap-3 sm:gap-0 min-w-[160px]">
            <div className="text-right">
              <div className="text-sm sm:text-base text-gray-800 dark:text-gray-100 font-medium">
                Next Run: {nextLabel}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Frequency: {frequencyLabel}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                type="button"
                onClick={(e) => {
                  stop(e);
                  handleView(e);
                }}
                title="View reminder"
                aria-label="View reminder details"
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
              >
                <EyeIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              <div className="relative">
                <button
                  ref={deleteBtnRef}
                  type="button"
                  onClick={handleDeleteClick}
                  title="Delete reminder"
                  aria-label="Delete reminder"
                  className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                >
                  <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                </button>

                <ConfirmPortal
                  open={confirmOpen}
                  anchorRect={anchorRect}
                  onConfirm={confirmDelete}
                  onCancel={cancelDelete}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.article>
    </>
  );
};

export default memo(ReminderListItem);
