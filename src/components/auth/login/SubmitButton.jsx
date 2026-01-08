// src/components/auth/login/SubmitButton.jsx

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const SubmitButton = ({ isSubmitting, isFormValid }) => {
  const buttonText = "Log In";
  const loadingText = "Logging In...";

  return (
    <motion.button
      type="submit"
      whileHover={{ scale: isFormValid && !isSubmitting ? 1.02 : 1 }}
      whileTap={{ scale: isFormValid && !isSubmitting ? 0.98 : 1 }}
      disabled={!isFormValid || isSubmitting}
      className={`group w-full flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60
        ${
          isFormValid && !isSubmitting
            ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 cursor-pointer text-white font-medium"
            : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-gray-200 dark:text-gray-400"
        }
      `}
      aria-label={isSubmitting ? loadingText : buttonText}
    >
      <span>{isSubmitting ? loadingText : buttonText}</span>
      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
    </motion.button>
  );
};

export default SubmitButton;
