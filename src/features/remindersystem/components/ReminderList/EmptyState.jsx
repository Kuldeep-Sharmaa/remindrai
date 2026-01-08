import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { motion } from "framer-motion";

/**
 * EmptyState — polished empty state with eyes Lottie animation
 * Props:
 *  - onCreate: function to call when CTA pressed
 *  - className: optional wrapper classes
 *  - animationSrc: optional src string (defaults to /animations/eyes.json)
 */

export default function EmptyState({
  onCreate,
  className = "",
  animationSrc = "../../../../../public/assets/Animation/Eyes.json",
}) {
  // subtle fade-in motion
  const fade = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fade}
      className={`w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 overflow-hidden ${className}`}
    >
      <div className="flex flex-col items-center text-center border border-dashed rounded-2xl py-12 px-6">
        {/* Lottie player — container class used to force monochrome via CSS below */}
        <div className="empty-eyes-animation w-[160px] h-[160px]">
          <Player
            autoplay
            loop
            src={animationSrc}
            style={{ width: "100%", height: "100%" }}
            speed={0.75} // slow, calm loop
          />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">
          No drafts yet
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-md">
          Create your first draft — we’ll remember your voice and deliver fresh
          content when you choose.
        </p>
      </div>
    </motion.div>
  );
}
