// src/components/onboarding/OnboardingStepsContent.jsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export const OnboardingStepsContent = ({ step, stepData, stepVariants }) => {
  // Named export for immersive compatibility
  const currentStepContent = stepData[step - 1];

  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center px-4 py-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={step} // Key change triggers re-animation
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-md mx-auto"
        >
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 leading-tight"
            variants={stepVariants}
          >
            {currentStepContent.title}
          </motion.h2>
          <motion.p
            className="text-md sm:text-lg text-gray-600 dark:text-gray-300 mb-6"
            variants={stepVariants}
          >
            {currentStepContent.subtitle}
          </motion.p>
          <motion.div className="w-full" variants={stepVariants}>
            {currentStepContent.component}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
export default OnboardingStepsContent;
