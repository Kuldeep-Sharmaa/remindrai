/**
 * ReminderListContainer.jsx
 *
 * Main list view for user's active reminders.
 * Handles optimistic deletes, modal state, and empty/error states.
 */

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import ReminderListItem from "./ReminderListItem";
import TaskDetailModal from "./TaskDetailModal";
import { useAuthContext } from "../../../../context/AuthContext";
import remindrClient from "../../services/remindrClient";
import EmptyState from "./EmptyState";

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
  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-7 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1 min-w-0">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
      <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
    </div>
  </div>
);

const ReminderListContainer = ({ reminders, error, onAddReminderClick }) => {
  const { user } = useAuthContext();

  const [visibleReminders, setVisibleReminders] = useState(reminders || []);
  const [showPast, setShowPast] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // --- Semantic grouping: Active vs Past ---
  const { activePrompts, pastPrompts } = useMemo(() => {
    const active = [];
    const past = [];

    for (const r of visibleReminders || []) {
      if (r?.enabled === false) {
        past.push(r);
      } else {
        active.push(r);
      }
    }

    return { activePrompts: active, pastPrompts: past };
  }, [visibleReminders]);

  // Sync with upstream reminders, exclude deleted ones, prepend new items
  useEffect(() => {
    if (!reminders) {
      setVisibleReminders([]);
      return;
    }

    // Deleted reminders never appear in UI
    const activeReminders = reminders.filter((r) => !r.deletedAt);

    const incomingById = new Map(activeReminders.map((r) => [r.id, r]));

    setVisibleReminders((prev) => {
      // Keep items that still exist, but refresh with upstream data
      const kept = prev
        .filter((p) => incomingById.has(p.id))
        .map((p) => incomingById.get(p.id));

      // Find new items not in kept
      const newItems = activeReminders.filter(
        (r) => !kept.some((k) => k.id === r.id),
      );

      // New items appear at top
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

  // Optimistic delete with rollback on failure
  const handleDelete = useCallback(
    async (id) => {
      if (!user?.uid) {
        toast.error("Login required to remove this item.");
        return;
      }

      // Capture the item being deleted for potential rollback
      const deletedItem = visibleReminders.find((r) => r.id === id);
      if (!deletedItem) return;

      // Remove from UI immediately
      setVisibleReminders((prev) => prev.filter((r) => r.id !== id));

      try {
        await remindrClient.deleteReminder(user.uid, id);
        toast.success("Task deleted.");
      } catch (err) {
        // Rollback: restore the deleted item at its original position
        setVisibleReminders((prev) => {
          // Check if it was already re-added somehow
          if (prev.some((r) => r.id === id)) return prev;
          // Add back to front (safest position)
          return [deletedItem, ...prev];
        });
        toast.error("Failed to delete item. Try again.");
        console.error("deleteReminder error:", err);
      }
    },
    [user, visibleReminders],
  );

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 overflow-hidden">
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
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 overflow-hidden">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Upcoming drafts
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Drafts your assistant is preparing from your intent. Each one appears
          when it’s ready.
        </p>
      </div>

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

      {/* --- Past Prompts (collapsed) --- */}
      {pastPrompts.length > 0 && (
        <div className="mt-10">
          <button
            onClick={() => setShowPast((v) => !v)}
            className="flex items-center justify-between w-full text-left"
          >
            <div>
              <h3 className="text-sm font-medium text-muted">
                Past drafts ({pastPrompts.length})
              </h3>
            </div>

            <span className="text-muted text-sm">{showPast ? "▾" : "▸"}</span>
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
