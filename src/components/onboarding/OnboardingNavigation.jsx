// src/components/onboarding/OnboardingNavigation.jsx (Update this file)

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

// Add isSaving to props
const OnboardingNavigation = ({
  step,
  totalSteps,
  changeStep,
  isStepValid,
  handleSubmit,
  selectedTimezone,
  isSaving,
}) => {
  const isLastStep = step === totalSteps;
  const canProceed = isStepValid() && selectedTimezone; // Ensure timezone is selected before finishing

  return (
    <div className="flex justify-between items-center">
      {/* Back Button */}
      <motion.button
        type="button"
        onClick={() => changeStep(step - 1)}
        disabled={step === 1 || isSaving} // Disable if on first step or saving
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          step === 1 || isSaving
            ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </motion.button>

      {/* Step Indicator (optional, but good for UX) */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Step {step} of {totalSteps}
      </div>

      {/* Next / Finish Button */}
      {isLastStep ? (
        <motion.button
          type="button" // Keep as button, handleSubmit is called via onClick
          onClick={handleSubmit} // Call the handleSubmit from OnboardingSetup
          disabled={!canProceed || isSaving} // Disable if not valid or saving
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            canProceed && !isSaving
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
              : "bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed"
          }`}
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              Saving...
            </>
          ) : (
            <>
              Finish Setup <Check className="h-4 w-4 ml-2" />
            </>
          )}
        </motion.button>
      ) : (
        <motion.button
          type="button"
          onClick={() => changeStep(step + 1)}
          disabled={!isStepValid() || isSaving} // Disable if current step not valid or saving
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            isStepValid() && !isSaving
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              : "bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed"
          }`}
        >
          Next <ArrowRight className="h-4 w-4 ml-2" />
        </motion.button>
      )}
    </div>
  );
};

export default OnboardingNavigation;
