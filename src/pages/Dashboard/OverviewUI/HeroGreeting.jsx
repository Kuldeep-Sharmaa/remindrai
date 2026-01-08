import React from "react";
import { motion } from "framer-motion";

const HeroGreeting = ({ userName = "there", subtitle, primaryAction }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800 text-white p-6 sm:p-8 rounded-2xl shadow-2xl mb-6 sm:mb-8"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 -left-8 w-16 h-16 bg-white/5 rounded-full"
          animate={{ y: [-10, 10, -10], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-4 right-1/4 w-8 h-8 bg-white/8 rounded-full"
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.4, 0.8, 0.4] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Text content */}
        <div className="flex-1">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-3 leading-tight"
          >
            Welcome, <span className="text-yellow-300">{userName}</span> 👋
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-blue-100 dark:text-purple-100 text-sm sm:text-base opacity-90 leading-relaxed max-w-2xl"
          >
            {subtitle ??
              "Your AI is keeping your brand consistent — new ideas and drafts are on the way."}
          </motion.p>
        </div>

        {/* Button (optional) */}
        {primaryAction && (
          <motion.button
            onClick={primaryAction.onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-white text-black rounded-md font-medium shadow-sm hover:bg-gray-100 transition"
          >
            {primaryAction.label}
          </motion.button>
        )}
      </div>
    </motion.section>
  );
};

export default HeroGreeting;
