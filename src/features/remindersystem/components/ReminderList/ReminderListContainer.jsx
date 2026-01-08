// ReminderListContainer.jsx — polished, brand-aligned, mobile-first
// ----------------------------------------------------------------------------
// - OpenAI-style minimal UX
// - Brand tone: calm, professional, proactive (focus: drafts & nudges)
// - Keeps optimistic delete (no undo), accessible modal wiring
// - Uses EmptyState component for the empty screen (eyes animation, monochrome)
// ----------------------------------------------------------------------------

import React, { useCallback, useEffect, useState } from "react";
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

const ReminderListContainer = ({
  reminders,
  error,
  onAddReminderClick,
  limitReached,
}) => {
  const { user } = useAuthContext();

  const [visibleReminders, setVisibleReminders] = useState(reminders || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Keep visibleReminders in sync with upstream reminders while
  // preserving existing DOM order with new items prepended.
  useEffect(() => {
    if (!reminders) {
      setVisibleReminders([]);
      return;
    }
    const incomingById = new Map(reminders.map((r) => [r.id, r]));
    setVisibleReminders((prev) => {
      // keep items that still exist upstream
      const kept = prev.filter((p) => incomingById.has(p.id));
      // find new upstream items that were not in kept
      const newItems = reminders.filter(
        (r) => !kept.some((k) => k.id === r.id)
      );
      // place new items at the front so new drafts appear top
      return [...newItems, ...kept];
    });
  }, [reminders]);

  // Modal open / close handlers
  const handleViewDetails = useCallback((id) => {
    setSelectedTaskId(id);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTaskId(null);
    setIsModalOpen(false);
  }, []);

  // Delete logic (optimistic, no undo)
  const handleDelete = useCallback(
    async (id) => {
      if (!user?.uid) {
        toast.error("Login required to remove this item.");
        return;
      }

      // Keep a copy to allow rollback on failure
      const previous = visibleReminders;

      // Optimistically remove from UI
      setVisibleReminders((prev) => prev.filter((r) => r.id !== id));

      try {
        await remindrClient.deleteReminder(user.uid, id);
        toast.success("Task deleted.");
      } catch (err) {
        // rollback UI
        const upstream = reminders?.find((r) => r.id === id);
        if (upstream) {
          setVisibleReminders((prev) => [upstream, ...prev]);
        } else {
          setVisibleReminders(previous);
        }
        toast.error("Failed to delete item. Try again.");
        console.error("deleteReminder error:", err);
      }
    },
    [user, reminders, visibleReminders]
  );

  // Error screen
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

  // Empty state — emphasize drafts & consistency (USP)
  if (!visibleReminders || visibleReminders.length === 0) {
    return <EmptyState onCreate={onAddReminderClick} />;
  }

  // Main list view
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 overflow-hidden">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Your drafts & nudges
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage active items — we’ll deliver the next idea when it’s time.
        </p>
      </div>

      {/* List */}
      <motion.div
        className="flex flex-col gap-4"
        initial="hidden"
        animate="show"
        variants={containerVariants}
        role="list"
      >
        <AnimatePresence initial={false}>
          {visibleReminders.map((reminder) => (
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

        {/* Loading skeletons when upstream is null (initial load) */}
        {reminders === null && (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}
      </motion.div>

      {/* Details modal (read-only) */}
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
