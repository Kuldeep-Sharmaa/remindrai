// src/components/workspaceAnimations/PageTransition.jsx
import React, { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";

/**
 * Robust PageTransition (patched to avoid routing click-block bug)
 * - switched AnimatePresence to mode="sync" and initial={false}
 * - ensures motion wrapper allows pointer events and sits at z-0
 * - preserves reduced-motion + localStorage toggle behavior
 */

const STORAGE_KEY = "remindr_animations_enabled_v1";

function readAnimationsEnabled(defaultEnabled = true) {
  try {
    if (typeof window === "undefined") return defaultEnabled;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      window.localStorage.setItem(STORAGE_KEY, defaultEnabled ? "1" : "0");
      return defaultEnabled;
    }
    return raw === "1";
  } catch {
    return defaultEnabled;
  }
}

const DEFAULT_MOTION = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25, ease: "easeOut" },
};

export default function PageTransition({
  children,
  className = "",
  motionProps = {},
}) {
  const location = useLocation();
  const prefersReduced = useReducedMotion();
  const animationsEnabled = useMemo(() => readAnimationsEnabled(true), []);

  // Decide whether to actually animate or render "no-op" animation
  const shouldAnimate = !(prefersReduced || !animationsEnabled);

  // Merge defaults with overrides
  const base = { ...DEFAULT_MOTION, ...motionProps };

  // If animations are disabled, use "no-op" motion (initial === animate) so nothing jumps,
  // but keep the same DOM structure (avoids early-return pitfalls).
  const appliedMotion = shouldAnimate
    ? base
    : {
        // Use the final state for all phases so there's no visible animation
        initial: base.animate,
        animate: base.animate,
        exit: base.animate,
        transition: { duration: 0 },
      };

  return (
    // NOTE: mode="sync" mounts entering + exiting children together (prevents exiting layer
    // from blocking pointer events). initial={false} avoids running enter on the first load.
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={location.pathname}
        initial={appliedMotion.initial}
        animate={appliedMotion.animate}
        exit={appliedMotion.exit}
        transition={appliedMotion.transition}
        // defensive styles: ensure pointer events flow to children & stacking context is zero
        className={`${className} relative z-0`}
        style={{ pointerEvents: "auto" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

