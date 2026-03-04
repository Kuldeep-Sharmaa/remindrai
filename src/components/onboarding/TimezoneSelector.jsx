import React, { useEffect, useState } from "react";
import { Globe, HelpCircle } from "lucide-react";
import { useTimezoneDetection } from "../../hooks/useTimezoneDetection";

function formatTimeForTimezone(timezone) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date());
  } catch {
    return "--:--:--";
  }
}

const TimezoneSelector = ({ selectedTimezone, setSelectedTimezone }) => {
  const { detectedTimezone, candidateTimezone, isStable } =
    useTimezoneDetection();
  const displayTimezone = detectedTimezone || candidateTimezone || "UTC";
  const [currentTime, setCurrentTime] = useState(() =>
    formatTimeForTimezone(displayTimezone),
  );
  const isLoading =
    !displayTimezone || (!isStable && candidateTimezone !== detectedTimezone);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (
      !isLoading &&
      !selectedTimezone &&
      displayTimezone &&
      displayTimezone !== "Loading..."
    ) {
      if (typeof setSelectedTimezone === "function") {
        setSelectedTimezone(displayTimezone);
      }
    }
  }, [isLoading, selectedTimezone, displayTimezone, setSelectedTimezone]);

  useEffect(() => {
    const tick = () => setCurrentTime(formatTimeForTimezone(displayTimezone));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [displayTimezone]);

  if (isLoading) {
    return (
      <div className="w-full rounded-xl border border-border bg-bgImpact px-4 py-4 flex items-center gap-3">
        <Globe className="w-4 h-4 text-muted animate-spin flex-shrink-0" />
        <p className="text-xs font-inter text-muted">Detecting timezone...</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-border bg-bgImpact px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted" />
          <span className="text-xs font-grotesk font-medium text-muted uppercase tracking-widest">
            Timezone
          </span>
        </div>

        {/* Tells the user why timezone matters without cluttering the default view */}
        <button
          onClick={() => setShowInfo((prev) => !prev)}
          className="p-1 rounded-md hover:bg-border transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-brand"
          aria-label="Why does this matter?"
        >
          <HelpCircle className="w-3.5 h-3.5 text-muted" />
        </button>
      </div>

      {showInfo && (
        <p className="text-xs font-inter text-muted mb-3 leading-relaxed">
          Used to deliver the drafts at the right local time.
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm font-grotesk font-semibold text-textDark">
          {displayTimezone}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-inter text-muted tabular-nums">
            {currentTime}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default TimezoneSelector;
