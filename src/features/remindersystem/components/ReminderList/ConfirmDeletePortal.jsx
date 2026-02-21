import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

function ConfirmDeletePortal({ open, anchorRect, onConfirm, onCancel }) {
  const ref = useRef(null);

  const popMotion = {
    initial: { opacity: 0, y: -4 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.14, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -4,
      transition: { duration: 0.1 },
    },
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };

    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onCancel?.();
      }
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open, onCancel]);

  if (!open || !anchorRect) return null;

  const isMobile = window.innerWidth < 640;

  let top;
  let right;
  let left;
  let width;

  if (isMobile) {
    // Centered dialog for mobile
    top = window.innerHeight / 2 - 80;
    left = 16;
    right = 16;
    width = "auto";
  } else {
    // Anchored behavior for desktop
    const padding = 8;
    const approxHeight = 120;

    const aboveTop = anchorRect.top - approxHeight - padding;
    const placeTop = aboveTop > 12 ? aboveTop : anchorRect.bottom + padding;

    top = Math.max(12, placeTop);
    right = Math.max(12, window.innerWidth - (anchorRect.right + 12));
    left = "auto";
    width = 280;
  }

  return createPortal(
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={popMotion}
      role="dialog"
      aria-modal="true"
      className="z-[9999] border border-border bg-bgImpact shadow-xl max-w-xs w-full"
      style={{
        position: "fixed",
        top,
        right,
        left,
        width,
      }}
    >
      <div ref={ref} className="p-4">
        {/* Title */}
        <div className="text-sm font-semibold text-textDark mb-2">
          Stop this draft?
        </div>

        {/* Description */}
        <div className="text-xs text-muted leading-relaxed mb-5">
          No new drafts will be prepared. Existing drafts remain available.
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 text-xs">
          <button
            onClick={onCancel}
            className="text-muted hover:text-textDark transition"
          >
            Cancel
          </button>

          <button onClick={onConfirm} className="text-brand hover:underline">
            Stop
          </button>
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}

export default ConfirmDeletePortal;
