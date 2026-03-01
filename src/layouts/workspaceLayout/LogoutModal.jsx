import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const LogoutModal = ({ isOpen, onCancel, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-white dark:bg-black rounded-xl p-6 w-full max-w-sm shadow-xl border border-black/5 dark:border-white/10"
            variants={modalVariants}
          >
            {/* Title */}
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              Confirm Logout
            </h2>

            {/* Message */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-5">
              Are you sure you want to logout from your account?
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-md text-gray-800 dark:text-gray-300 border border-black/10 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-md bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogoutModal;
