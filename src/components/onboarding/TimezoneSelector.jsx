import React, { useEffect, useState, useCallback } from "react";
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

  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMobileInfoToggle = useCallback(() => {
    setShowMobileInfo((prev) => !prev);
  }, []);

  // Set initial selectedTimezone from the hook's detectedZone
  useEffect(() => {
    if (
      !isLoading &&
      !selectedTimezone &&
      displayTimezone &&
      displayTimezone !== "Loading..."
    ) {
      // Ensure setSelectedTimezone is indeed a function before calling
      if (typeof setSelectedTimezone === "function") {
        setSelectedTimezone(displayTimezone);
      } else {
        console.error(
          "setSelectedTimezone is not a function in TimezoneSelector!",
          setSelectedTimezone,
        );
        // You might want to throw an error or handle this more gracefully depending on app needs
      }
    }
  }, [isLoading, selectedTimezone, displayTimezone, setSelectedTimezone]);

  useEffect(() => {
    const tick = () => setCurrentTime(formatTimeForTimezone(displayTimezone));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [displayTimezone]);

  // Handle loading and error states for the UI
  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-4 sm:p-8 rounded-xl shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-center flex flex-col items-center justify-center h-48">
        <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        <p className="mt-4 text-lg font-medium">Detecting your timezone...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-8 rounded-xl shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-center transform transition-all duration-500 ease-out opacity-100 translate-y-0">
      {/* Header with icon and title */}
      <div className="mb-4 flex items-center justify-center gap-3">
        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 transition-colors duration-200">
          <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Detected Timezone
          </h2>

          {/* Help button with tooltip */}
          <div className="relative">
            <button
              onClick={handleMobileInfoToggle}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
              aria-label="Why is this timezone detected?"
            >
              <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200" />
            </button>

            {/* Desktop tooltip */}
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden sm:block z-50">
                <div className="bg-gray-900 dark:bg-gray-800 text-white text-sm px-4 py-3 rounded-lg shadow-xl w-72 text-left border border-gray-700 dark:border-gray-600 animate-in fade-in zoom-in-95 duration-200">
                  RemindrAI adapts to your timezone to deliver reminders, posts,
                  and ideas at the perfect local moments.
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile info panel */}
      <div
        className={`mb-4 sm:hidden overflow-hidden transition-all duration-300 ease-out ${
          showMobileInfo ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            RemindrAI adapts to your timezone to deliver reminders, posts, and
            ideas at the perfect local moments.
          </p>
        </div>
      </div>

      {/* Main timezone display */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-all duration-300">
          {displayTimezone}
        </div>
        <div className="flex items-center justify-center gap-2 text-xl font-medium text-blue-600 dark:text-blue-400">
          {currentTime}
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Informative note */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed transition-opacity duration-300">
        We’ve detected your timezone automatically. If this looks off, you can
        update it anytime in settings.
      </p>
    </div>
  );
};

export default TimezoneSelector;
