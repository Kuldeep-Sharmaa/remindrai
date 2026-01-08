// src/components/Loaders/FullScreenLoader.jsx
import React from "react";
import { motion } from "framer-motion";
import "./FullScreenLoader.css";

const FullScreenLoader = ({ text = "Loading..." }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }} // This exit animation will be triggered by AnimatePresence
      className="fullscreen-loader-container"
      role="status"
      aria-live="polite"
      aria-label="Loading application data"
    >
      {/* The Loader HTML */}
      <div className="loader-wrapper">
        <div className="loader-circle"></div>
        <div className="loader-circle"></div>
        <div className="loader-circle"></div>
        <div className="loader-shadow"></div>
        <div className="loader-shadow"></div>
        <div className="loader-shadow"></div>
      </div>
      {/* End Loader HTML */}
      <p className="mt-8 text-lg font-semibold animate-pulse">{text}</p>
    </motion.div>
  );
};

export default FullScreenLoader;
