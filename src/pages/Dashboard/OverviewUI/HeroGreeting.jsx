import React from "react";

const OverviewGreeting = ({
  greeting,
  userName,
  hasActiveDraft,
  isFirstTime,
  hasError,
}) => {
  const getStatusLine = () => {
    if (hasError) return "There was an issue loading your schedule.";
    if (isFirstTime) return "No drafts configured yet.";
    if (hasActiveDraft) return "Everything is on track.";
    return "No active deliveries.";
  };

  return (
    <div className="space-y-1">
      <p className="text-base sm:text-lg font-semibold text-textDark tracking-tight">
        {greeting}, {userName}.
      </p>

      <p className="text-sm text-muted">{getStatusLine()}</p>
    </div>
  );
};

export default OverviewGreeting;
