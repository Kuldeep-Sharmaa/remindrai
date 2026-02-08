/**
 * Reminders.jsx
 *
 * Main reminders dashboard page.
 * Shows active drafts, slot usage, and creation CTA.
 * Uses global reminder pipeline from AuthContext.
 */

import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import Spinner from "../../components/Ui/LoadingSpinner";
import UserPreferencesCard from "../../features/remindersystem/components/UserPreferencesCard";
import ReminderListContainer from "../../features/remindersystem/components/ReminderList/ReminderListContainer";
import { useAuthContext } from "../../context/AuthContext";
import PageTransition from "../../components/DashboardAnimations/PageTransition";

const REMINDER_CONFIG = Object.freeze({
  MAX_REMINDERS: 7, // for local and devlopment users
});

const Reminders = () => {
  const navigate = useNavigate();

  const {
    user,
    loading: isAuthLoading,
    reminders,
    isLoadingReminders,
    totalReminders,
  } = useAuthContext();

  const maxSlots = user?.maxSlots || REMINDER_CONFIG.MAX_REMINDERS;

  // Calculate slot usage
  const reminderStatus = useMemo(() => {
    const remindersUsed = totalReminders;
    const limitReached = remindersUsed >= maxSlots;
    return { remindersUsed, limitReached };
  }, [totalReminders, maxSlots]);

  const handleAddReminderClick = useCallback(() => {
    if (reminderStatus.limitReached) {
      toast.error(
        `You've reached your current limit of ${maxSlots} active drafts. Upgrade to add more.`,
        { duration: 4000 },
      );
      return;
    }
    navigate("/dashboard/studio/create");
  }, [reminderStatus.limitReached, maxSlots, navigate]);

  const handleDeleteReminder = useCallback(async () => {
    if (!user?.uid) {
      toast.error("Authentication required to delete this item.");
      return;
    }
    try {
      toast.success("Removal requested…");
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast.error("Failed to remove. Please try again.");
    }
  }, [user]);

  const handleSettingsClick = useCallback(() => {
    navigate("/dashboard/settings");
  }, [navigate]);

  const isAppLoading = isAuthLoading || isLoadingReminders;

  if (isAppLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bgLight dark:bg-bgDark">
        <Spinner />
      </div>
    );
  }

  // Slot usage indicator
  const SlotDots = ({ used, total }) => {
    const dots = Array.from({ length: total });
    return (
      <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2">
        <div
          className="flex items-center gap-2"
          aria-hidden="true"
          title={`${used} of ${total} active drafts`}
        >
          {dots.map((_, i) => {
            const isUsed = i < used;
            return (
              <span
                key={i}
                className={`inline-block w-2.5 h-2.5 rounded-full transition-all duration-150 ${
                  isUsed
                    ? "bg-brand shadow-sm"
                    : "border border-border bg-transparent"
                }`}
              />
            );
          })}
        </div>

        <div className="hidden sm:block text-xs text-muted ml-2">
          {used}/{total}
        </div>

        <span className="sr-only">{`${used} of ${total} active drafts`}</span>
      </div>
    );
  };

  const heroVariants = {
    hidden: { opacity: 0, y: 8 },
    enter: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.32, ease: "easeOut" },
    },
  };

  const ctaVariants = {
    hidden: { opacity: 0, y: 6 },
    enter: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.36, ease: "easeOut", delay: 0.08 },
    },
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        <div className="w-full max-w-screen-xl mx-auto ">
          {/* Header */}
          <motion.header
            className="text-center mb-10"
            initial="hidden"
            animate="enter"
            variants={heroVariants}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-grotesk font-semibold tracking-tight text-textLight dark:text-textDark mb-3">
              You plan once. We handle the rest
            </h1>

            <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              Your consistency engine — it remembers, creates, and delivers when
              you need it.
            </p>
          </motion.header>

          {/* Preferences */}
          <section className="mb-8">
            <UserPreferencesCard
              userProfile={user}
              loading={isAuthLoading}
              handleSettingsClick={handleSettingsClick}
            />
          </section>

          {/* CTA and slot indicator */}
          <motion.section
            className="flex flex-col items-center justify-center gap-5 mt-10 mb-12 text-center"
            initial="hidden"
            animate="enter"
            variants={ctaVariants}
          >
            {reminderStatus.limitReached ? (
              <div className="flex flex-col items-center gap-3">
                <button
                  disabled
                  aria-disabled
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base font-medium rounded-xl bg-bgLight dark:bg-bgDark border border-border text-muted cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 opacity-60" />
                  All slots active
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted">
                  <span>You've reached your current plan limit.</span>
                  <button
                    onClick={() =>
                      toast.promise(Promise.resolve(), {
                        loading: "Opening upgrade options…",
                        success: "Upgrade flow opened (placeholder).",
                        error: "Unable to open upgrade right now.",
                      })
                    }
                    className="font-medium text-brand hover:underline ml-0 sm:ml-2"
                  >
                    Upgrade to add more drafts
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={handleAddReminderClick}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base font-medium rounded-xl bg-brand hover:brightness-110 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand hover:shadow-md hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" />
                  Start a draft
                </button>
              </div>
            )}

            <SlotDots used={reminderStatus.remindersUsed} total={maxSlots} />
          </motion.section>

          {/* Reminder list */}
          <section className="mt-8">
            <ReminderListContainer
              reminders={reminders}
              error={null}
              remindersUsed={reminderStatus.remindersUsed}
              maxSlots={maxSlots}
              limitReached={reminderStatus.limitReached}
              onDelete={handleDeleteReminder}
              onAddReminderClick={handleAddReminderClick}
            />
          </section>
        </div>
      </div>
    </PageTransition>
  );
};

export default Reminders;
