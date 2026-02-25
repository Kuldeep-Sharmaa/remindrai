// ============================================================================
// 📁 src/features/remindersystem/components/TimezoneChangeModal.jsx
// ----------------------------------------------------------------------------
// 🕐 TimezoneChangeModal — Smart confirmation modal
//  - Shows when device timezone differs from user’s saved timezone
//  - Offers "Keep Current" or "Switch to New" choices
//  - Connects to AuthContext (pendingDeviceTimezone, acceptDeviceTimezone, etc.)
// ----------------------------------------------------------------------------

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "../context/AuthContext";

const TimezoneChangeModal = () => {
  const {
    user,
    pendingDeviceTimezone,
    acceptDeviceTimezone,
    declineDeviceTimezone,
    detectedTimezone,
  } = useAuthContext();

  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null);

  // Early exit — render nothing if no timezone change is pending
  if (!pendingDeviceTimezone || !user?.timezone) return null;

  const handleAccept = async () => {
    if (!pendingDeviceTimezone) return;
    setIsProcessing(true);
    setStatus(null);
    try {
      const res = await acceptDeviceTimezone({
        newTimezone: pendingDeviceTimezone,
        persistToProfile: true,
        runClientRecompute: true,
      });
      setStatus(res.status);
      console.log("✅ TimezoneChangeModal -> accept result:", res);
    } catch (err) {
      console.error("❌ TimezoneChangeModal accept error:", err);
      setStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = () => {
    declineDeviceTimezone();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-gray-200 dark:border-zinc-800 p-6"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
        >
          <div className="flex flex-col space-y-4 text-center">
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              Timezone Changed
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              We noticed your device timezone doesn’t match your saved timezone.
              <br />
              Would you like to update it for accurate Draft delivery?
            </p>

            {/* Timezone comparison box */}
            <div className="mt-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-3 text-sm text-gray-700 dark:text-gray-200">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-gray-500">Current</span>
                <span className="font-semibold">{user?.timezone || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Detected</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {pendingDeviceTimezone}
                </span>
              </div>
            </div>

            {/* Status feedback */}
            {status === "queued" && (
              <p className="text-xs text-amber-600">
                You’re offline or have too many Propmts — update queued for
                server sync.
              </p>
            )}
            {status === "ok" && (
              <p className="text-xs text-green-600">Timezone updated!</p>
            )}
            {status === "error" && (
              <p className="text-xs text-red-600">
                Something went wrong. Try again later.
              </p>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={handleDecline}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              >
                Keep Current
              </button>
              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition"
              >
                {isProcessing ? "Updating…" : "Switch to New"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(TimezoneChangeModal);
