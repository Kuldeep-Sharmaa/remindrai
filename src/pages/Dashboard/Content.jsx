import React, { useState, useMemo } from "react";
import { collection, query, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { DateTime } from "luxon";
import { db } from "../../services/firebase";
import { useCollection } from "../../hooks/useCollection";

/* -------------------------------------------------------------------------- */
/* Sub-Components                              */
/* -------------------------------------------------------------------------- */

/**
 * Status Badge - Fixed "Delivered" state per requirements
 */
const StatusBadge = () => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-green-500/10 text-green-500 border border-green-500/20">
    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
    Delivered
  </span>
);

/**
 * Metadata Pill
 */
const MetaPill = ({ label, value }) => {
  if (!value) return null;
  return (
    <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-border text-muted font-medium">
      <span className="opacity-50 mr-1">{label}:</span>
      <span className="text-textLight dark:text-textDark">{value}</span>
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Component                              */
/* -------------------------------------------------------------------------- */

export default function DeliveredDrafts({ userId }) {
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // 1. Data Source: Passive real-time listener
  const draftsQuery = useMemo(() => {
    if (!userId) return null;
    return query(
      collection(db, "users", userId, "drafts"),
      orderBy("createdAt", "desc"),
    );
  }, [userId]);

  const { documents: drafts, isPending } = useCollection(draftsQuery);

  // 2. Formatting Helper
  const formatTime = (ts) => {
    if (!ts) return "";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return DateTime.fromJSDate(date).toFormat("LLL d, h:mm a");
  };

  // 3. Copy Logic
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  if (isPending) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-grotesk text-xl font-bold text-textLight dark:text-textDark flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-brand" />
          Delivered Drafts
        </h2>
        <span className="text-xs text-muted font-medium bg-gray-100 dark:bg-border px-2 py-1 rounded">
          {drafts?.length || 0} Total
        </span>
      </div>

      {/* 4. Empty State Handling */}
      {!drafts || drafts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border-2 border-dashed border-gray-100 dark:border-border p-12 text-center"
        >
          <div className="max-w-xs mx-auto space-y-3">
            <div className="w-12 h-12 bg-gray-50 dark:bg-border/50 rounded-full flex items-center justify-center mx-auto">
              <ClockIcon className="w-6 h-6 text-muted" />
            </div>
            <p className="text-sm font-medium text-textLight dark:text-textDark">
              No drafts delivered yet.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {drafts.map((draft) => (
              <motion.div
                key={draft.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedDraft(draft)}
                className="group relative cursor-pointer bg-white dark:bg-bgDark border border-gray-100 dark:border-border hover:border-brand/40 dark:hover:border-brand/40 rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-brand/5"
              >
                <div className="flex justify-between items-start mb-4">
                  <StatusBadge />
                  <span className="text-[10px] text-muted font-inter">
                    {formatTime(draft.createdAt)}
                  </span>
                </div>

                {/* Preview: Truncated text */}
                <p className="text-sm text-textLight dark:text-textDark line-clamp-3 leading-relaxed mb-6 italic font-inter">
                  "{draft.content?.text || "No content generated."}"
                </p>

                <div className="flex flex-wrap gap-1.5 mt-auto">
                  <MetaPill label="Tone" value={draft.tone} />
                  <MetaPill label="Platform" value={draft.platform} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 5. Detail View (Read-Only Modal) */}
      <AnimatePresence>
        {selectedDraft && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDraft(null)}
              className="absolute inset-0 bg-bgDark/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-bgDark border border-gray-100 dark:border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-border">
                <div>
                  <h3 className="text-lg font-bold font-grotesk dark:text-textDark">
                    Draft Detail
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    Generated on {formatTime(selectedDraft.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDraft(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-border rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 dark:text-textDark" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand">
                    Generated Text
                  </label>
                  <div className="relative group">
                    <div className="w-full bg-gray-50 dark:bg-bgDark border border-gray-100 dark:border-border rounded-xl p-6 text-sm leading-relaxed dark:text-textDark min-h-[160px] whitespace-pre-wrap font-inter">
                      {selectedDraft.content?.text}
                    </div>

                    <button
                      onClick={() => handleCopy(selectedDraft.content?.text)}
                      className="absolute top-4 right-4 p-2 bg-white dark:bg-border border border-gray-200 dark:border-border rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-xs font-medium dark:text-textDark"
                    >
                      {copyFeedback ? (
                        <>
                          <CheckIcon className="w-4 h-4 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="w-4 h-4 text-brand" />
                          Copy to Clipboard
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted">
                      Aesthetics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <MetaPill label="Tone" value={selectedDraft.tone} />
                      <MetaPill label="Role" value={selectedDraft.role} />
                      <MetaPill
                        label="Platform"
                        value={selectedDraft.platform}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted">
                      Source
                    </h4>
                    <div className="text-[11px] font-mono p-2 bg-gray-50 dark:bg-border/30 rounded text-muted break-all">
                      RID: {selectedDraft.reminderId || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer (Passive) */}
              <div className="p-6 bg-gray-50 dark:bg-border/20 border-t border-gray-100 dark:border-border text-center">
                <p className="text-[10px] text-muted italic  leading-relaxed">
                  This draft was generated by your AI agent and is read-only.{" "}
                  <br />
                  To change future outputs, update your Reminder settings.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
