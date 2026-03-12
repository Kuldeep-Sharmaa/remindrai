import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

function ConfirmDeletePortal({ open, onConfirm, onCancel }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target))
        onCancel?.();
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        />

        {/* Panel */}
        <motion.div
          ref={modalRef}
          className="relative w-full sm:w-auto sm:min-w-[400px] sm:max-w-md
                     bg-white dark:bg-black
                     rounded-t-2xl sm:rounded-2xl
                     border-t border-border sm:border
                     shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 100, scale: 1 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/30">
            <h2
              id="delete-modal-title"
              className="text-lg font-semibold text-textLight dark:text-textDark"
            >
              Delete this prompt?
            </h2>
            <button
              onClick={onCancel}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-full
                         hover:bg-border/20 transition-colors duration-150
                         text-muted hover:text-textLight dark:hover:text-textDark"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p className="text-sm text-muted leading-relaxed">
              This will prevent new drafts from being prepared. Any drafts that
              have already been created will remain available in your inbox.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/30 bg-bgLight/50 dark:bg-bgDark/50">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg
                         text-textLight dark:text-textDark
                         hover:bg-border/20 transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium rounded-lg
                         bg-red-600 hover:bg-red-700 text-white
                         transition-colors duration-150 shadow-sm"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}

export default ConfirmDeletePortal;
