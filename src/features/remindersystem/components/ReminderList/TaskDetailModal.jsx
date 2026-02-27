/**
 * TaskDetailModal.jsx
 *
 * Modal showing reminder/intent details.
 * Emphasizes what the user asked RemindrAI to create.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import { HiOutlineCpuChip, HiOutlineBookmark } from "react-icons/hi2";
import { ClockIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import Spinner from "../../../../components/Ui/LoadingSpinner";
import { useAuthContext } from "../../../../context/AuthContext";

// Timestamp helpers
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
    one_time: "One Time",
    daily: "Daily",
    weekly: "Weekly",
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
// Modal animations
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

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

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
        console.error("TaskDetailModal: fetch error", err);
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
  const weekDays = task?.schedule?.weekDays || [];
  const weekDaysLabel = formatWeekDays(weekDays);
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

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="task-detail-portal"
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
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
          className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-white dark:bg-[#111827] border border-[#1f2933]/40 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            ref={closeRef}
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center
                       rounded-full hover:bg-[#1f2933]/20 transition-colors text-[#9ca3af] 
                       hover:text-[#0f172a] dark:hover:text-[#e5e7eb]"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Content */}
          <div className="overflow-y-auto max-h-[85vh]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner />
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                {/* Intent snapshot */}
                <div className="mb-8 pb-6 border-b border-[#1f2933]/20">
                  {/* Type and status badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                        isAI
                          ? "bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20"
                          : "bg-white dark:bg-[#111827] border border-[#1f2933] text-[#9ca3af]"
                      }`}
                    >
                      {isAI ? (
                        <HiOutlineCpuChip className="w-4 h-4" />
                      ) : (
                        <HiOutlineBookmark className="w-4 h-4" />
                      )}
                      {isAI ? "AI Draft" : "Note"}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        enabled
                          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                          : "bg-[#9ca3af]/10 text-[#9ca3af]"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          enabled ? "bg-emerald-400/80" : "bg-gray-400/70"
                        }`}
                      />
                      {enabled ? "Active" : "Completed"}
                    </span>

                    {isPendingBackend && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20">
                        <ClockIcon className="w-3.5 h-3.5" />
                        Preparing
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-[#9ca3af] uppercase tracking-wide font-medium mb-2">
                      Your Prompt
                    </div>
                    <p className="text-base font-grotesk font-medium text-[#0f172a] dark:text-[#e5e7eb] leading-snug whitespace-pre-wrap">
                      {aiPrompt || message || "No content provided"}
                    </p>
                  </div>

                  {/* Parameters */}
                  {(platform || tone || role) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {platform && (
                        <div className="bg-[#1f2933]/5 dark:bg-[#111827] rounded-lg px-3 py-2 border border-[#1f2933]/10 dark:border-[#1f2933]/30">
                          <div className="text-xs text-[#9ca3af] mb-0.5">
                            Platform
                          </div>
                          <div className="text-sm text-[#0f172a] dark:text-[#e5e7eb] font-medium">
                            {platform}
                          </div>
                        </div>
                      )}
                      {tone && (
                        <div className="bg-[#1f2933]/5 dark:bg-[#111827] rounded-lg px-3 py-2 border border-[#1f2933]/10 dark:border-[#1f2933]/30">
                          <div className="text-xs text-[#9ca3af] mb-0.5">
                            Tone
                          </div>
                          <div className="text-sm text-[#0f172a] dark:text-[#e5e7eb] font-medium">
                            {tone}
                          </div>
                        </div>
                      )}
                      {role && (
                        <div className="bg-[#1f2933]/5 dark:bg-[#111827] rounded-lg px-3 py-2 border border-[#1f2933]/10 dark:border-[#1f2933]/30">
                          <div className="text-xs text-[#9ca3af] mb-0.5">
                            Role
                          </div>
                          <div className="text-sm text-[#0f172a] dark:text-[#e5e7eb] font-medium">
                            {role}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-[#9ca3af] mb-1">Created</div>
                      <div className="text-[#0f172a] dark:text-[#e5e7eb] font-medium">
                        {formatDate(createdAt, timezone)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#9ca3af] mb-1">Next draft</div>

                      <div className="text-[#0f172a] dark:text-[#e5e7eb] font-medium">
                        {enabled
                          ? isPendingBackend
                            ? "Setting up..."
                            : formatNext(nextIso, timezone)
                          : "Nothing pending"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#9ca3af] mb-1">How often</div>
                      <div className="text-[#0f172a] dark:text-[#e5e7eb] font-medium">
                        {frequency}
                      </div>
                    </div>
                    {task?.frequency === "weekly" && weekDaysLabel && (
                      <div>
                        <div className="text-[#9ca3af] mb-1">Delivery days</div>
                        <div className="text-[#0f172a] dark:text-[#e5e7eb] font-medium">
                          {weekDaysLabel}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-between gap-3 flex-wrap pt-6 border-t border-[#1f2933]/20">
                  <div className="text-xs text-[#9ca3af]">
                    {enabled ? "This will create drafts" : "No longer active"}
                  </div>

                  <button
                    onClick={handleCopy}
                    disabled={copied}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      copied
                        ? "bg-green-600 text-white"
                        : "bg-[#2563eb] hover:brightness-110 text-white"
                    }`}
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
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
