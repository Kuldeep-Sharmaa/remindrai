import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "../../../context/AuthContext";
import { markDismissed } from "../../../services/draftInteractionsService";
import DraftDetailView from "./DraftDetailView";

export default function DraftModal({ draft, onClose }) {
  const { currentUser } = useAuthContext();
  const uid = currentUser?.uid;

  const handleClose = React.useCallback(() => {
    if (uid && draft?.id) {
      markDismissed({
        uid,
        draftId: draft.id,
        hasOpened: true,
      });
    }
    onClose();
  }, [uid, draft, onClose]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-2xl max-h-[85vh] bg-bgLight dark:bg-bgDark 
                     border border-border/40 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center
                       rounded-full hover:bg-border/20 transition-colors text-muted hover:text-textLight 
                       dark:hover:text-textDark"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Content */}
          <div className="overflow-y-auto max-h-[85vh]">
            <DraftDetailView draft={draft} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
