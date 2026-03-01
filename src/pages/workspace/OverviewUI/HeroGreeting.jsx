import React from "react";

const OverviewGreeting = ({
  greeting,
  userName,
  hasActiveDraft,
  isFirstTime,
  hasError,
}) => {
  const getStatusLine = () => {
    if (hasError) return "Sync issue detected.";
    if (isFirstTime) return "Let’s begin.";
    if (hasActiveDraft) return "Everything is on track.";
    return "Ready when you are.";
  };

  return (
    <section className="space-y-3">
      {/* Primary Identity Line */}
      <h1 className="text-xl sm:text-2xl font-semibold font-grotesk tracking-tight text-textLight dark:text-textDark">
        {greeting}, {userName}.
      </h1>

      {/* System State Line */}
      <p className="text-sm sm:text-base font-inter text-muted leading-relaxed">
        {getStatusLine()}
      </p>
    </section>
  );
};

export default OverviewGreeting;
