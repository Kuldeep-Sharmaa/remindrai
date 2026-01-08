// TaskDetailModal.jsx — centered portal modal, read-only, accessible, brand-aligned
// ============================================================================

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DateTime } from "luxon";
import clsx from "clsx";
import toast from "react-hot-toast";
import Spinner from "../../../../components/Ui/LoadingSpinner";
import { useAuthContext } from "../../../../context/AuthContext";

/* -------------------------
   Helpers
   ------------------------- */
const toIso = (v) => {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString();
  if (typeof v?.toDate === "function") return v.toDate().toISOString();
  return null;
};

const formatDate = (value, tz) => {
  if (!value) return "N/A";
  try {
    const iso = toIso(value);
    if (!iso) return "N/A";
    return DateTime.fromISO(iso, { zone: "utc" })
      .setZone(tz || DateTime.local().zoneName)
      .toLocaleString(DateTime.DATETIME_MED);
  } catch {
    return "N/A";
  }
};

const formatNext = (isoValue, tz) => {
  if (!isoValue) return "Not scheduled";
  try {
    const iso = toIso(isoValue);
    const dt = DateTime.fromISO(iso, { zone: "utc" }).setZone(
      tz || DateTime.local().zoneName
    );
    return dt.toFormat("MMM d • h:mm a");
  } catch {
    return "Invalid time";
  }
};

const freqLabel = (reminder = {}, schedule = {}) => {
  const raw =
    reminder?.frequency || schedule?.frequency || schedule?.kind || null;
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

/* Small chip */
const Chip = ({ children, variant = "muted" }) => {
  const base =
    "inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium";
  const vStyles =
    variant === "muted"
      ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
      : "bg-blue-600 text-white";
  return <span className={clsx(base, vStyles)}>{children}</span>;
};

/* -------------------------
   Modal portal + motions
   ------------------------- */
const overlayMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};
const panelMotion = {
  hidden: { opacity: 0, y: 8, scale: 0.995 },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.15, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.995,
    transition: { duration: 0.1, ease: "easeIn" },
  },
};

/* -------------------------
   TaskDetailModal (main)
   ------------------------- */
export default function TaskDetailModal({
  isOpen,
  onClose,
  taskId,
  remindrClient,
}) {
  const { user } = useAuthContext();
  const uid = user?.uid;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastActiveRef = useRef(null);
  const closeRef = useRef(null);
  const containerRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mq.matches);
    } catch {}
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!isOpen) return undefined;

    // Save current active element so we can restore focus later
    lastActiveRef.current = document.activeElement;

    (async () => {
      if (!uid || !taskId || !remindrClient) {
        toast.error("Unable to load details (missing context).");
        return;
      }
      setLoading(true);
      try {
        const doc = await remindrClient.getReminder(uid, taskId);
        if (!mounted) return;
        if (!doc) {
          setTask(null);
          toast.error("Item not found.");
        } else {
          setTask(doc);
        }
      } catch (err) {
        console.error("TaskDetailModal: fetch error", err);
        if (mounted) {
          setTask(null);
          toast.error("Could not load details.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // lock body scroll while modal open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus the close button on open (after paint)
    setTimeout(() => closeRef.current?.focus?.(), 0);

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      // Basic focus trap: keep tab inside modal container
      if (e.key === "Tab" && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      mounted = false;
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      try {
        lastActiveRef.current?.focus?.();
      } catch {}
    };
  }, [isOpen, uid, taskId, remindrClient, onClose]);

  // Close early if not open
  if (!isOpen) return null;

  // Data extracts
  const title =
    task?.content?.title?.trim?.() ||
    (task?.reminderType === "ai" ? "AI Draft" : "Simple Draft");
  const aiPrompt = task?.content?.aiPrompt || "";
  const message = task?.content?.message || "";
  const role = task?.content?.role || "";
  const tone = task?.content?.tone || "";
  const platform = task?.content?.platform || "";
  const nextIso = toIso(task?.nextRunAtUTC);
  const timezone = task?.schedule?.timezone || DateTime.local().zoneName;
  const frequency = freqLabel(task || {}, task?.schedule || {});
  const enabled = task?.enabled === undefined ? true : !!task?.enabled;
  const createdAt = task?.createdAt;

  // Clipboard copy
  const handleCopy = async () => {
    try {
      const txt = aiPrompt || message || task?.content?.title || "";
      await navigator.clipboard.writeText(txt);
      toast.success("Copied content");
    } catch {
      toast.error("Unable to copy");
    }
  };

  /* Render portal */
  return createPortal(
    <AnimatePresence>
      <motion.div
        key="task-detail-portal"
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
        aria-modal="true"
        role="dialog"
        aria-labelledby="task-detail-title"
      >
        {/* backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          variants={overlayMotion}
          initial="initial"
          animate="animate"
          exit="exit"
          aria-hidden="true"
        />

        {/* panel */}
        <motion.div
          ref={containerRef}
          variants={panelMotion}
          initial="hidden"
          animate="enter"
          exit="exit"
          className={clsx(
            "relative z-10 w-full max-w-lg sm:max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-xl ring-0"
            // ensure inner scrolling without overflowing viewport
          )}
          style={{ maxHeight: "calc(100vh - 64px)" }}
          role="document"
        >
          {/* header */}
          <div className="px-5 py-4 border-b dark:border-gray-800 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                id="task-detail-title"
                className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate"
              >
                {title}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {/* active / paused */}
                <span
                  className={clsx(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    enabled
                      ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      : "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                  )}
                >
                  {enabled ? "Active" : "Paused"}
                </span>

                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  {frequency}
                </span>
              </div>
            </div>

            {/* only close */}
            <div className="flex items-center gap-3">
              <button
                ref={closeRef}
                onClick={onClose}
                className="inline-flex items-center px-3 py-2 rounded-md text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Close details"
              >
                Close
              </button>
            </div>
          </div>

          {/* content */}
          <div className="p-5 max-h-[72vh] overflow-y-auto text-sm text-gray-700 dark:text-gray-300 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Spinner />
              </div>
            ) : (
              <>
                {/* Prompt */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Prompt
                  </h4>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
                    {aiPrompt ||
                      message ||
                      task?.content?.title ||
                      "No content provided."}
                  </div>
                </div>

                {/* Brand anchors */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Brand anchors
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {platform ? <Chip>{platform}</Chip> : null}
                    {tone ? <Chip>{tone}</Chip> : null}
                    {role ? <Chip>{role}</Chip> : null}
                    {!platform && !tone && !role && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        No brand anchors set for this item.
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Created
                    </div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {formatDate(createdAt, timezone)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Next run
                    </div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {formatNext(nextIso, timezone)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* footer (sticky inside modal) */}
          <div className="border-t dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-3 sticky bottom-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Copy
                </button>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                Draft ID: {task?.meta?.idempotencyKey || "—"}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
