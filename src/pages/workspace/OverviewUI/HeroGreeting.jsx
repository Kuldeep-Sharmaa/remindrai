import React from "react";

const OverviewGreeting = ({
  greeting,
  userName,
  hasActiveDraft,
  isFirstTime,
  hasError,
}) => {
  const firstName = userName?.split(" ")[0] || userName;

  const getStatusLine = () => {
    if (hasError) return "Sync issue detected.";
    if (isFirstTime) return "Start by creating your first preparation.";
    if (hasActiveDraft) return "Your next draft is in preparation.";
    return "Ready when you are.";
  };

  return (
    <section className="space-y-2">
      <h1 className="text-xl sm:text-2xl font-semibold font-grotesk tracking-tight text-textLight dark:text-textDark">
        {greeting}, {firstName}.
      </h1>
      <p className="text-sm sm:text-base font-inter text-textLight/80 dark:text-textDark/80 leading-relaxed">
        {getStatusLine()}
      </p>
    </section>
  );
};

export default OverviewGreeting;
