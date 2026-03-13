import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DateTime } from "luxon";
import toast from "react-hot-toast";

import { Clock, Copy, X } from "lucide-react";
import Spinner from "../../../../components/Ui/LoadingSpinner";
import { useAuthContext } from "../../../../context/AuthContext";

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
      tz || DateTime.local().zoneName,
    );
    return dt.toFormat("MMM d • h:mm a");
  } catch {
    return "Invalid time";
  }
};

const freqLabel = (reminder = {}) => {
  const raw = reminder?.frequency || null;
  if (!raw) return "One-time";
  const map = {
    daily: "Every day",
    weekly: "Every week",
    one_time: "One time",
  };
  return map[String(raw).toLowerCase()] || String(raw).replace(/_/g, " ");
};

const formatWeekDays = (weekDays = []) => {
  if (!Array.isArray(weekDays) || weekDays.length === 0) return null;
  const map = {
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
    7: "Sun",
  };
  return weekDays
    .sort((a, b) => a - b)
    .map((d) => map[d])
    .filter(Boolean)
    .join(", ");
};

const overlayMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const panelMotion = {
  hidden: { opacity: 0, y: 100, scale: 1 },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 28, stiffness: 380 },
  },
  exit: {
    opacity: 0,
    y: 100,
    scale: 0.95,
    transition: { type: "spring", damping: 28, stiffness: 380 },
  },
};

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
  const [copied, setCopied] = useState(false);

  const lastActiveRef = useRef(null);
  const closeRef = useRef(null);
  const containerRef = useRef(null);

  const handleClose = useCallback(() => onClose?.(), [onClose]);

  useEffect(() => {
    let mounted = true;
    if (!isOpen) return undefined;

    lastActiveRef.current = document.activeElement;

    (async () => {
      if (!uid || !taskId || !remindrClient) {
        toast.error("Unable to load details");
        return;
      }
      setLoading(true);
      try {
        const doc = await remindrClient.getReminder(uid, taskId);
        if (!mounted) return;
        if (!doc) {
          setTask(null);
          toast.error("Item not found");
        } else {
          setTask(doc);
        }
      } catch (err) {
        console.error("TaskDetailModal fetch error:", err);
        if (mounted) {
          setTask(null);
          toast.error("Could not load details");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => closeRef.current?.focus?.(), 0);

    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
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
  }, [isOpen, uid, taskId, remindrClient, handleClose]);

  const handleCopy = async () => {
    try {
      const txt = task?.content?.aiPrompt || task?.content?.message || "";
      await navigator.clipboard.writeText(txt);
      toast.success("Copied");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Unable to copy");
    }
  };

  if (!isOpen) return null;

  const isAI = task?.reminderType === "ai";
  const aiPrompt = task?.content?.aiPrompt || "";
  const message = task?.content?.message || "";
  const role = task?.content?.role || "";
  const tone = task?.content?.tone || "";
  const platform = task?.content?.platform || "";
  const nextIso = toIso(task?.nextRunAtUTC);
  const timezone = task?.schedule?.timezone || DateTime.local().zoneName;
  const frequency = freqLabel(task || {});
  const enabled = task?.enabled === undefined ? true : !!task?.enabled;
  const createdAt = task?.createdAt;
  const isPendingBackend = enabled === true && !nextIso;
  const weekDaysLabel = formatWeekDays(task?.schedule?.weekDays || []);

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="task-detail-portal"
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
        aria-modal="true"
        role="dialog"
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
          variants={overlayMotion}
          initial="initial"
          animate="animate"
          exit="exit"
        />

        {/* Panel */}
        <motion.div
          ref={containerRef}
          variants={panelMotion}
          initial="hidden"
          animate="enter"
          exit="exit"
          className="relative z-10 w-full sm:max-w-2xl
                     rounded-t-2xl sm:rounded-2xl
                     bg-white dark:bg-bgImpact
                     border border-border/40
                     shadow-2xl
                     overflow-hidden
                     max-h-[92vh] sm:max-h-[85vh]"
        >
          {/* Close */}
          <button
            ref={closeRef}
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center
                       rounded-full hover:bg-bgImpact/40 transition-colors duration-150
                       text-muted hover:text-textLight dark:hover:text-textDark"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable content */}
          <div className="overflow-y-auto max-h-[92vh] sm:max-h-[85vh]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner />
              </div>
            ) : (
              <div className="p-5 sm:p-8">
                {/* Type + status badges */}
                <div className="flex items-center gap-2 mb-5 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      enabled
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                        : "bg-muted/10 text-brand"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${enabled ? "bg-emerald-400/80" : "bg-brand/70"}`}
                    />
                    {enabled ? "Active" : "Completed"}
                  </span>

                  {isPendingBackend && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/20">
                      <Clock className="w-3.5 h-3.5" />
                      Preparing
                    </span>
                  )}
                </div>

                {/* Prompt */}
                <div className="mb-6 pb-6 border-b border-border/20">
                  <p className="text-xs text-textLight/80 dark:text-textDark/80 uppercase tracking-wide font-medium mb-2">
                    Your Prompt
                  </p>
                  <p className="text-sm sm:text-base font-medium text-textLight dark:text-textDark leading-snug whitespace-pre-wrap">
                    {aiPrompt || message || "No content provided"}
                  </p>
                </div>

                {/* Parameters */}
                {(platform || tone || role) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
                    {[
                      { label: "Platform", value: platform },
                      { label: "Tone", value: tone },
                      { label: "Role", value: role },
                    ]
                      .filter((f) => f.value)
                      .map((field) => (
                        <div
                          key={field.label}
                          className="bg-bgImpact/40 dark:bg-bgDark/40 rounded-lg px-3 py-2 border border-border/20"
                        >
                          <p className="text-xs text-textLight/80 dark:text-textDark/80 mb-0.5">
                            {field.label}
                          </p>
                          <p className="text-sm text-textLight dark:text-textDark font-medium capitalize">
                            {field.value}
                          </p>
                        </div>
                      ))}
                  </div>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                  <div>
                    <p className="text-muted mb-1">Created</p>
                    <p className="text-textLight dark:text-textDark font-medium">
                      {formatDate(createdAt, timezone)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Next draft</p>
                    <p className="text-textLight dark:text-textDark font-medium">
                      {enabled
                        ? isPendingBackend
                          ? "Setting up…"
                          : formatNext(nextIso, timezone)
                        : "Nothing pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted mb-1">How often</p>
                    <p className="text-textLight dark:text-textDark font-medium">
                      {frequency}
                    </p>
                  </div>
                  {task?.frequency === "weekly" && weekDaysLabel && (
                    <div>
                      <p className="text-muted mb-1">Delivery days</p>
                      <p className="text-textLight dark:text-textDark font-medium">
                        {weekDaysLabel}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-end gap-3 flex-wrap pt-5 border-t border-border/20">
                  <button
                    onClick={handleCopy}
                    disabled={copied}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      copied
                        ? "bg-green-600 text-white"
                        : "bg-brand hover:brightness-110 text-white"
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? "Copied" : "Copy prompt"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
