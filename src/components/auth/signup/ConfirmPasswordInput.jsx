import React, { useState, useRef } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { showToast } from "../../ToastSystem/toastUtils"; // Import toast utility

const ConfirmPasswordInput = ({
  password,
  confirmPassword,
  setConfirmPassword,
  setIsValid,
  passwordStrengthResult, // Receive password strength result
  shake,
}) => {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTouched, setIsTouched] = useState(false); // To track if user has interacted
  const toastShownRef = useRef(false); // Ref to track if the weak password toast has been shown

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setIsTouched(true);

    // Validate if passwords match
    const match = password === newConfirmPassword;
    setIsValid(match);

    // NEW: Show weak password toast immediately if conditions are met
    // 1. Password and confirm password match
    // 2. Both fields have content
    // 3. Password strength result is available and indicates weakness (score < 2)
    // 4. The toast hasn't been shown yet for this weak password state
    if (
      match &&
      newConfirmPassword.length > 0 &&
      passwordStrengthResult &&
      passwordStrengthResult.score < 2 &&
      !toastShownRef.current
    ) {
      showToast({
        type: "warning",
        message:
          "Your password is weak. You can still continue, but we recommend a stronger one for better security.",
        duration: 5000,
      });
      toastShownRef.current = true; // Mark toast as shown
    } else if (
      // Reset toastShownRef if conditions are no longer met (e.g., user makes password strong or clears field)
      !match ||
      newConfirmPassword.length === 0 ||
      (passwordStrengthResult && passwordStrengthResult.score >= 2)
    ) {
      toastShownRef.current = false;
    }
  };

  // The onBlur is now a fallback, or for cases where user types quickly and leaves
  const handleBlur = () => {
    // Re-evaluate toast on blur, in case the toast was dismissed or not shown
    // AND ensure passwords match to prevent toast from showing for mismatch
    if (
      isTouched &&
      password.length > 0 &&
      password === confirmPassword && // Only show if they actually match
      passwordStrengthResult &&
      passwordStrengthResult.score < 2 &&
      !toastShownRef.current // Only show if not already shown
    ) {
      showToast({
        type: "warning",
        message:
          "Your password is weak. You can still continue, but we recommend a stronger one for better security.",
        duration: 5000,
      });
      toastShownRef.current = true;
    } else if (
      // Reset toastShownRef if conditions are no longer met (e.g., user makes password strong or clears field)
      password.length === 0 ||
      (passwordStrengthResult && passwordStrengthResult.score >= 2)
    ) {
      toastShownRef.current = false;
    }
  };

  const shakeVariants = {
    shake: {
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    noShake: {
      x: 0,
    },
  };

  // Determine border color based on match
  const getBorderColorClass = () => {
    if (confirmPassword.length === 0) {
      return "border-gray-300 dark:border-gray-600";
    }
    // Only show red border for mismatch if both fields have content and are touched
    if (isTouched && password.length > 0 && password !== confirmPassword) {
      return "border-red-500";
    }
    // If they match and touched, can be neutral or green if desired for match confirmation
    if (isTouched && password.length > 0 && password === confirmPassword) {
      return "border-green-500"; // Green for a match
    }
    return "border-gray-300 dark:border-gray-600";
  };

  return (
    <motion.div variants={shakeVariants} animate={shake ? "shake" : "noShake"}>
      <label
        htmlFor="confirm-password"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Confirm Password
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400 dark:text-gray-400" />
        </div>
        <input
          type={showConfirmPassword ? "text" : "password"}
          id="confirm-password"
          name="confirm-password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          onBlur={handleBlur} // Trigger on blur for the weak password warning
          className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200
            ${getBorderColorClass()}
          `}
          placeholder="Re-enter your password"
          required
          aria-invalid={
            isTouched && password.length > 0 && password !== confirmPassword
          }
        />
        <button
          type="button"
          onClick={toggleConfirmPasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          aria-label={
            showConfirmPassword
              ? "Hide confirm password"
              : "Show confirm password"
          }
        >
          {showConfirmPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
      {isTouched && password.length > 0 && password !== confirmPassword && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          Passwords do not match.
        </p>
      )}
    </motion.div>
  );
};

export default ConfirmPasswordInput;
