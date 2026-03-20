import React from "react";
import { motion } from "framer-motion";

export const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 bg-bgLight dark:bg-bgDark border-b border-border"
    >
      <div className="flex items-center justify-center h-16 px-5">
        <div className="flex items-center gap-2.5">
          <img
            src="/transparent_logo.svg"
            alt="RemindrAI"
            className="h-10 w-auto"
          />
        </div>
      </div>
    </motion.nav>
  );
};
