import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "../../../context/AuthContext";
import { markDismissed } from "../../../services/draftInteractionsService";
import DraftDetailView from "./DraftDetailView";

export default function DraftModal({ draft, onClose }) {
  const { currentUser } = useAuthContext();
  const uid = currentUser?.uid;

  const handleClose = useCallback(() => {
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!draft) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />

        <motion.div
          className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-bgImpact
                     border border-[#1f2933]/40 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center
                       rounded-full hover:bg-[#1f2933]/20 transition-colors text-[#9ca3af] 
                       hover:text-[#0f172a] dark:hover:text-[#e5e7eb]"
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

          <div className="overflow-y-auto max-h-[85vh]">
            <DraftDetailView draft={draft} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
