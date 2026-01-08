import React from "react";
import { motion } from "framer-motion";

import Logo from "../../../public/assets//Navbar-logo/logo.png";

export const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      // Fixed position, top, full width, high z-index to sit above everything
      className="fixed top-0 left-0 w-full p-4 sm:px-6 lg:px-8 bg-white dark:bg-black/95   text-center shadow z-50"
    >
      <div className="flex items-center justify-center max-w-7xl text-center mx-auto">
        {/* Logo and App Name */}
        <div className="flex items-center space-x-3">
          <img src={Logo} alt="RemindrAI Logo" className="h-8 sm:h-10" />
        </div>
        {/* You can add navigation links or other elements here if needed */}
      </div>
    </motion.nav>
  );
};
