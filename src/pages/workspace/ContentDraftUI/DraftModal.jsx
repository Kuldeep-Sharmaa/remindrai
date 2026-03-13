import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuthContext } from "../../../context/AuthContext";
import { markDismissed } from "../../../services/draftInteractionsService";
import DraftDetailView from "./DraftDetailView";

export default function DraftModal({ draft, onClose }) {
  const { currentUser } = useAuthContext();
  const uid = currentUser?.uid;

  const handleClose = useCallback(() => {
    if (uid && draft?.id) {
      markDismissed({ uid, draftId: draft.id, hasOpened: true });
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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />

        {/* Panel */}
        <motion.div
          className="relative w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh]
                     bg-white dark:bg-bgImpact
                     border border-border/40
                     rounded-t-2xl sm:rounded-2xl
                     shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 28, stiffness: 380 }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center
                       rounded-full text-muted transition-colors duration-150
                       hover:bg-border/20 hover:text-textLight dark:hover:text-textDark"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scroll container — only one max-h here */}
          <div className="overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
            <DraftDetailView draft={draft} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
