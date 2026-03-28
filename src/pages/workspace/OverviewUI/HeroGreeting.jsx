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
    if (hasError) return "Sync issue detected";

    if (isFirstTime) {
      return "Add what should be prepared to start the system";
    }

    if (hasActiveDraft) {
      return "Next draft is being prepared";
    }

    return "No active preparations";
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
