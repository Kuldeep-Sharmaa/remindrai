/**
 * ReminderListContainer.jsx
 *
 * Main list view for user's active reminders.
 * Handles optimistic deletes, modal state, and empty/error states.
 */

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { ChevronDown, ChevronRight } from "lucide-react";
import ReminderListItem from "./ReminderListItem";
import TaskDetailModal from "./TaskDetailModal";
import { useAuthContext } from "../../../../context/AuthContext";
import remindrClient from "../../services/remindrClient";
import EmptyState from "./EmptyState";
import { DateTime } from "luxon";
import { useAppTimezone } from "../../../../context/TimezoneProvider";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const listItemMotion = {
  initial: { opacity: 0, y: -8, scale: 0.995 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
  exit: { opacity: 0, y: 8, scale: 0.995, transition: { duration: 0.12 } },
};

const SkeletonRow = () => (
  <div className="bg-bgImpact rounded-xl px-4 py-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-7 rounded-full bg-border" />
      <div className="flex-1 min-w-0">
        <div className="h-3 bg-border rounded w-1/3 mb-2" />
        <div className="h-2.5 bg-border rounded w-2/3" />
      </div>
      <div className="w-24 h-6 bg-border rounded ml-auto" />
    </div>
  </div>
);

const ReminderListContainer = ({ reminders, error, onAddReminderClick }) => {
  const { user } = useAuthContext();

  const [visibleReminders, setVisibleReminders] = useState(reminders || []);
  const [showPast, setShowPast] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const { timezone: userTimezone } = useAppTimezone();

  // --- Semantic grouping: Active vs Past ---
  const { activePrompts, pastPrompts } = useMemo(() => {
    const active = [];
    const past = [];

    // start of today in user's timezone — same anchor as slot count hook
    // one-time reminders that fired today stay in active list until midnight
    const startOfToday = DateTime.now()
      .setZone(userTimezone)
      .startOf("day")
      .toMillis();

    for (const r of visibleReminders || []) {
      if (r?.enabled === false) {
        // check if this is a one-time that fired today
        const updatedAtMs = r?.updatedAt?.toMillis?.() ?? 0;
        const firedToday =
          r?.frequency === "one_time" && updatedAtMs >= startOfToday;

        if (firedToday) {
          // holds slot until midnight — stays in active list visually
          active.push(r);
        } else {
          past.push(r);
        }
      } else {
        active.push(r);
      }
    }

    return { activePrompts: active, pastPrompts: past };
  }, [visibleReminders, userTimezone]);

  // Sync with upstream reminders, exclude deleted ones, prepend new items
  useEffect(() => {
    if (!reminders) {
      setVisibleReminders([]);
      return;
    }

    const activeReminders = reminders.filter((r) => !r.deletedAt);
    const incomingById = new Map(activeReminders.map((r) => [r.id, r]));

    setVisibleReminders((prev) => {
      const kept = prev
        .filter((p) => incomingById.has(p.id))
        .map((p) => incomingById.get(p.id));

      const newItems = activeReminders.filter(
        (r) => !kept.some((k) => k.id === r.id),
      );

      return [...newItems, ...kept];
    });
  }, [reminders]);

  const handleViewDetails = useCallback((id) => {
    setSelectedTaskId(id);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTaskId(null);
    setIsModalOpen(false);
  }, []);

  // Optimistic delete — remove from UI and show toast instantly.
  // Backend runs in the background. If it fails, we rollback and tell the user.
  const handleDelete = useCallback(
    async (id) => {
      if (!user?.uid) {
        toast.error("Login required to remove this item.");
        return;
      }

      const deletedItem = visibleReminders.find((r) => r.id === id);
      if (!deletedItem) return;

      // Remove from UI and confirm immediately
      setVisibleReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success("Prompt deleted.");

      try {
        await remindrClient.deleteReminder(user.uid, id);
      } catch (err) {
        //if Backend failed
        setVisibleReminders((prev) => {
          if (prev.some((r) => r.id === id)) return prev;
          return [deletedItem, ...prev];
        });
        toast.error("Failed to delete prompt. Try again.");
        console.error("deleteReminder error:", err);
      }
    },
    [user, visibleReminders],
  );

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="rounded-lg p-6 text-center border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
            Something went wrong
          </h3>
          <p className="text-sm text-red-600 dark:text-red-200 mt-1">
            Unable to load your items. Please check your connection and try
            again.
          </p>
        </div>
      </div>
    );
  }

  const showEmptyActive = reminders !== null && activePrompts.length === 0;

  return (
    <div className="w-full max-w-4xl mx-auto  py-8">
      <motion.div
        className="flex flex-col gap-4"
        initial="hidden"
        animate="show"
        variants={containerVariants}
        role="list"
      >
        <AnimatePresence initial={false}>
          {showEmptyActive && <EmptyState onCreate={onAddReminderClick} />}
          {activePrompts.map((reminder) => (
            <motion.div
              key={reminder.id}
              layout
              initial="initial"
              animate="animate"
              exit="exit"
              variants={listItemMotion}
            >
              <ReminderListItem
                reminder={{
                  ...reminder,
                  enabled:
                    reminder.enabled === undefined ? true : reminder.enabled,
                }}
                onView={handleViewDetails}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading skeletons on initial load */}
        {reminders === null && (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}
      </motion.div>

      {/* Past Prompts */}
      {pastPrompts.length > 0 && (
        <div className="mt-10">
          <button
            onClick={() => setShowPast((v) => !v)}
            className="flex items-center justify-between w-full text-left group"
          >
            <h3 className="text-sm font-medium text-textLight/80 dark:text-textDark/80">
              Past Prompts ({pastPrompts.length})
            </h3>
            {showPast ? (
              <ChevronDown className="w-4 h-4 text-muted" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {showPast && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex flex-col gap-4 mt-4"
              >
                {pastPrompts.map((reminder) => (
                  <ReminderListItem
                    key={reminder.id}
                    reminder={{ ...reminder, enabled: false }}
                    onView={handleViewDetails}
                    onDelete={handleDelete}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <TaskDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        taskId={selectedTaskId}
        remindrClient={remindrClient}
      />
    </div>
  );
};

export default ReminderListContainer;
