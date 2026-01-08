// src/pages/Dashboard/Overview.jsx
import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import Spinner from "../../components/Loaders/Spinner";
import PageTransition from "../../components/DashboardAnimations/PageTransition";

import HeroGreeting from "./OverviewUI/HeroGreeting";
import RemindersKpi from "./OverviewUI/RemindersKpi";

const InlineSpinner = ({
  text = "Loading your dashboard…",
  size = "w-6 h-6",
  color = "text-blue-500",
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-textLight dark:text-textDark">
    <Spinner size={size} color={color} srText={text} />
    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
      {text}
    </p>
  </div>
);

const Overview = () => {
  const {
    currentUser,
    loading,
    isLoadingReminders,
    aiCount,
    simpleCount,
    activeCount,
    completedCount,
    totalReminders,
  } = useAuthContext();

  const [showWelcomeGreeting, setShowWelcomeGreeting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setShowWelcomeGreeting(!!currentUser.isFirstLoginSession);
    }
  }, [currentUser]);

  // 🔹 Loading states
  if (loading || isLoadingReminders) {
    return <InlineSpinner text="Loading your dashboard…" />;
  }

  // 🔹 Auth guard
  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50 dark:bg-red-900">
        <p className="text-xl text-red-700 dark:text-red-300">
          You are not logged in. Please sign in to access your assistant.
        </p>
      </div>
    );
  }

  const userName =
    currentUser?.fullName ||
    currentUser?.displayName ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "User");

  const greeting = showWelcomeGreeting ? "Welcome" : "Welcome back";

  const heroProps = {
    greeting,
    userName,
    subtitle:
      "A proactive content assistant that remembers your voice and delivers on-brand drafts when you need them.",
  };

  return (
    <PageTransition>
      <div className="min-h-screen p-6 max-w-6xl mx-auto space-y-8">
        <HeroGreeting
          userName={userName}
          subtitle={heroProps.subtitle}
          primaryAction={heroProps.primaryAction}
        />

        <RemindersKpi
          aiCount={aiCount}
          simpleCount={simpleCount}
          activeCount={activeCount}
          completedCount={completedCount}
        />

        <div className="mt-8 text-sm text-gray-400">
          <p>
            {activeCount > 0 ? (
              <>
                Your assistant will deliver <strong>{activeCount}</strong>{" "}
                {activeCount > 1 ? "content drafts" : "content draft"} at the
                times you set — fresh, on-brand, and ready to post.
              </>
            ) : (
              "You don't have any active content reminders yet — create one and let your assistant draft for you."
            )}
          </p>

          {totalReminders === 0 && (
            <p className="mt-3 text-sm text-gray-500">
              Tip: create an AI reminder to receive a tailored draft when the
              time comes — you can edit or post it instantly.
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Overview;
