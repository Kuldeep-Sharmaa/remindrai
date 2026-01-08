import React from "react";
import { Globe, Clock, Info, Loader2, CheckCircle } from "lucide-react";
import { useTimezoneDetection } from "../../../hooks/useTimezoneDetection";

const TimezoneSettingCard = () => {
  const { currentTime, detectedTimezone, isLoading, error } =
    useTimezoneDetection();
  const isAutoDetected = true; // placeholder for future manual override support

  return (
    <section className="bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-300/40 dark:border-white/10 rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
      {/* Header */}
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Clock className="h-7 w-7 text-blue-600 dark:text-blue-400" /> Your
        Timezone
      </h2>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-700 dark:text-gray-300">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-500" />
          <span>Detecting timezone...</span>
        </div>
      ) : error ? (
        /* Error State */
        <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
          <Info className="w-5 h-5 flex-shrink-0 mr-3" />
          <div>
            <p className="font-medium">Timezone detection failed.</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : (
        /* Success State */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Detected Timezone */}
          <div className="bg-white/70 dark:bg-black/30 border border-gray-300/30 dark:border-white/10 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                Detected Timezone
              </span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {detectedTimezone}
            </p>

            {isAutoDetected && (
              <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium w-fit">
                <CheckCircle className="w-3.5 h-3.5" />
                Auto-detected from your device
              </div>
            )}
          </div>

          {/* Current Local Time */}
          <div className="bg-white/70 dark:bg-black/30 border border-gray-300/30 dark:border-white/10 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                Current Local Time
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {currentTime}
              </p>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </div>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-300/30 dark:border-white/10 rounded-lg flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
        <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
        <p>
          RemindrAI automatically syncs with your device's timezone to ensure
          accurate scheduling. Keep your device settings correct for best
          results.
        </p>
      </div>
    </section>
  );
};

export default TimezoneSettingCard;
