import React from "react";
import { Lightbulb } from "lucide-react"; // Removed CheckCircle, XCircle

// Helper function to determine the color of the strength bar
const getStrengthColor = (score) => {
  switch (score) {
    case 0:
      return "bg-red-500 w-1/5"; // Very Weak
    case 1:
      return "bg-orange-500 w-2/5"; // Weak
    case 2:
      return "bg-yellow-500 w-3/5"; // Fair
    case 3:
      return "bg-blue-500 w-4/5"; // Good
    case 4:
      return "bg-green-600 w-full"; // Strong
    default:
      return "bg-gray-300 w-0"; // No password or unknown
  }
};

// Helper function to determine the text description of the strength
const getStrengthText = (score) => {
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  return strengthLabels[score] || "No password entered";
};

// PasswordStrengthBar component displays the visual strength indicator and text
const PasswordStrengthBar = ({ score, feedback }) => {
  // Removed 'policy' prop
  if (score === null || score === undefined) {
    return null; // Don't render if no score is provided
  }

  return (
    <div className="mt-2" id="password-strength-feedback">
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor(
              score
            )}`}
          />
        </div>
        <span
          className={`text-xs font-medium ${
            score <= 1
              ? "text-red-600 dark:text-red-400"
              : score <= 2
              ? "text-orange-600 dark:text-orange-400"
              : score <= 3
              ? "text-blue-600 dark:text-blue-400"
              : "text-green-600 dark:text-green-400"
          }`}
        >
          {getStrengthText(score)}
        </span>
      </div>
      {/* Show Zxcvbn suggestions only, rephrased */}
      {feedback?.suggestions?.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
          <Lightbulb className="h-3.5 w-3.5 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
          {feedback.suggestions.join(" ")}{" "}
          {/* Join suggestions for a single sentence */}
        </p>
      )}

      {/* Removed the explicit password policy list */}
    </div>
  );
};

export default PasswordStrengthBar;
