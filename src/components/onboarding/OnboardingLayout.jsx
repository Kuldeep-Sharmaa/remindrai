import React from "react";
import { motion } from "framer-motion";
import StaticTimezoneDetector from "./TimezoneSelector";

export const OnboardingLayout = ({
  children,
  containerVariants,
  itemVariants,
  selectedTimezone,
  setSelectedTimezone,
}) => {
  return (
    <motion.div
      className="flex-1 flex flex-col lg:flex-row relative z-20 mt-[64px] overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col w-full dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-6 py-8 sm:px-8 sm:py-10 flex-shrink-0"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2  dark:text-white leading-tight">
              Shape Your <span className="text-blue-400">RemindrAI</span>{" "}
              Experience
            </h2>
            <p className="text-base dark:text-gray-400 sm:text-lg leading-relaxed">
              Let us tailor your AI-powered content reminders — it takes just a
              minute.
            </p>
            {/* Arrow for Mobile */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 120 200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="block md:hidden w-36 h-28 text-blue-400 absolute left-1/2 transform -translate-x-1/2 rotate-6 pointer-events-none"
            >
              <path d="M60,30 C70,80 50,120 60,170" />
              <path d="M50,165 L60,180 L70,165" />
            </svg>
          </div>
        </motion.div>

        <div className="flex-1 px-6 pb-8 sm:px-8 sm:pb-10">
          <div className="max-w-md mx-auto w-full h-full flex flex-col justify-center">
            {children}
          </div>
        </div>

        <StaticTimezoneDetector
          selectedTimezone={selectedTimezone}
          setSelectedTimezone={setSelectedTimezone}
          className="px-6 sm:px-8 sm:pb-10 mt-4"
        />

        <p className="text-xs text-gray-400 text-center my-4 px-4">
          You can fine-tune these preferences anytime in your settings.
        </p>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-3/5 flex flex-col mt-28 px-12 xl:px-16 2xl:px-20"
        >
          <div className="max-w-2xl text-center mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-12 relative"
            >
              <h1 className="text-3xl sm:text-4xl font-bold dark:text-white mb-3">
                Shape Your <span className="text-blue-400">RemindrAI</span>{" "}
                Experience
              </h1>
              <p className="text-base dark:text-gray-400 max-w-md mx-auto">
                Just a few quick steps to set up your AI-powered reminders and
                stay consistent — effortlessly.
              </p>

              {/* Sketch Arrow */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 300 150"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-64 h-36 text-blue-400 absolute top-0 -right-36 rotate-12 pointer-events-none"
              >
                <path d="M30,120 C80,60 180,50 270,80" />
                <path d="M265,70 L280,80 L265,90" />
              </svg>
            </motion.div>

            <StaticTimezoneDetector
              selectedTimezone={selectedTimezone}
              setSelectedTimezone={setSelectedTimezone}
            />
          </div>

          <p className="text-xs dark:text-gray-400 text-center mt-3">
            You can fine-tune these preferences anytime in your settings.
          </p>
        </motion.div>

        {/* Right Panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="w-2/5 flex flex-col overflow-hidden"
        >
          <div className="flex-1 flex flex-col max-w-lg w-full mx-auto justify-center">
            {children}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OnboardingLayout;
