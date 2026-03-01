import React, { useMemo } from "react";
import { useAuthContext } from "../../context/AuthContext";
import Spinner from "../../components/Loaders/Spinner";
import PageTransition from "../../components/workspaceAnimations/PageTransition";
import OverviewGreeting from "./OverviewUI/HeroGreeting";
import NextDeliveryPanel from "./OverviewUI/NextDeliveryPanel";

function getNextActiveReminder(reminders) {
  if (!reminders?.length) return null;

  const now = Date.now();

  return (
    reminders
      .filter(
        (r) =>
          r.enabled === true &&
          r.nextRunAtUTC &&
          new Date(r.nextRunAtUTC).getTime() > now,
      )
      .sort((a, b) => new Date(a.nextRunAtUTC) - new Date(b.nextRunAtUTC))[0] ??
    null
  );
}

function getTimeGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon ";
  if (hour >= 18 && hour < 22) return "Good evening";
  return "Late night";
}

const InlineSpinner = ({ text = "Loading…" }) => (
  <div className="flex flex-col items-center justify-center p-8 text-textLight dark:text-textDark">
    <Spinner size="w-6 h-6" color="text-blue-500" srText={text} />
  </div>
);

const Overview = () => {
  const {
    currentUser,
    loading,
    isLoadingReminders,
    reminders,
    isEmpty,
    remindersError,
  } = useAuthContext();

  const next = useMemo(() => getNextActiveReminder(reminders), [reminders]);

  const greeting = getTimeGreeting();

  if (loading || isLoadingReminders) {
    return <InlineSpinner />;
  }

  if (!currentUser) return null;

  const userName =
    currentUser?.fullName ||
    currentUser?.displayName ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "User");

  return (
    <PageTransition>
      <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-8">
        <OverviewGreeting
          greeting={greeting}
          userName={userName}
          hasActiveDraft={!!next}
          isFirstTime={isEmpty}
          hasError={!!remindersError}
        />

        <NextDeliveryPanel next={next} />
      </div>
    </PageTransition>
  );
};

export default Overview;

