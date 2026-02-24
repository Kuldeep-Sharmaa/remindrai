/**
 * Studio.jsx
 *
 * Configuration workspace.
 * Defines what the assistant prepares.
 * Uses global reminder pipeline from AuthContext.
 */

import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import Spinner from "../../components/Ui/LoadingSpinner";
import UserPreferencesCard from "../../features/remindersystem/components/UserPreferencesCard";
import ReminderListContainer from "../../features/remindersystem/components/ReminderList/ReminderListContainer";
import { useAuthContext } from "../../context/AuthContext";
import PageTransition from "../../components/DashboardAnimations/PageTransition";

const Reminders = () => {
  const navigate = useNavigate();

  const {
    user,
    loading: isAuthLoading,
    reminders,
    isLoadingReminders,
  } = useAuthContext();

  const handleAddReminderClick = useCallback(() => {
    navigate("/dashboard/studio/create");
  }, [navigate]);

  const handleDeleteReminder = useCallback(async () => {}, []);

  const handleSettingsClick = useCallback(() => {
    navigate("/dashboard/settings/preferences");
  }, [navigate]);

  const isAppLoading = isAuthLoading || isLoadingReminders;

  if (isAppLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bgLight dark:bg-bgDark">
        <Spinner />
      </div>
    );
  }

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
        <div className="w-full max-w-screen-xl mx-auto">
          {/* Header */}
          <motion.header
            className="text-center mt-10 mb-12"
            initial="hidden"
            animate="enter"
            variants={heroVariants}
          >
            <h1 className="text-3xl sm:text-4xl font-grotesk font-semibold tracking-tight text-textLight dark:text-textDark mb-2">
              Studio
            </h1>

            <p className="text-base text-muted max-w-xl mx-auto">
              Define what your assistant prepares.
            </p>
          </motion.header>

          {/* Preferences */}
          <section className="mb-10">
            <UserPreferencesCard
              userProfile={user}
              loading={isAuthLoading}
              handleSettingsClick={handleSettingsClick}
            />
          </section>

          {/* CTA */}
          <motion.section
            className="flex justify-center mb-14"
            initial="hidden"
            animate="enter"
            variants={ctaVariants}
          >
            <button
              onClick={handleAddReminderClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base font-medium rounded-xl bg-brand hover:brightness-110 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
            >
              <Plus className="w-4 h-4" />
              Create new prompt
            </button>
          </motion.section>

          {/*  List */}
          <section className="mt-6">
            <ReminderListContainer
              reminders={reminders}
              error={null}
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
