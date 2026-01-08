import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react"; // Removed CheckCircle, XCircle as they are now in StrengthBar
import zxcvbn from "zxcvbn";
import PasswordStrengthBar from "./PasswordStrengthBar";
import { motion } from "framer-motion"; // Import motion

const PasswordInput = ({
  password,
  setPassword,
  passwordStrengthResult,
  setPasswordStrengthResult,
  setIsValid, // This now will primarily be based on minLength >= 6
  shake,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validatePasswordPolicy = (pwd) => {
    // Policy checks for displaying in the strength bar, not blocking submission
    const policy = {
      minLength: pwd.length >= 6, // Updated to minimum 6 characters
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    };
    setPasswordPolicy(policy);

    // This `allPolicyMet` is for internal tracking for the strength bar's policy list,
    // not directly used for blocking form submission here.
    const allPolicyMet = Object.values(policy).every(Boolean);
    return allPolicyMet;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword.length > 0) {
      const zxcvbnResult = zxcvbn(newPassword);
      setPasswordStrengthResult(zxcvbnResult); // Store the full result object

      validatePasswordPolicy(newPassword); // Update policy checks for strength bar display

      // Password is valid for submission if it meets the minimum length requirement (>= 6)
      setIsValid(newPassword.length >= 6);
    } else {
      setPasswordStrengthResult(null); // Clear strength feedback if input is empty
      setPasswordPolicy({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
      setIsValid(false);
    }
  };

  // Framer Motion animation variants for shaking
  const shakeVariants = {
    shake: {
      x: [0, -5, 5, -5, 5, 0], // Shake left and right
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    noShake: {
      x: 0,
    },
  };

  // Determine border color based on minimum length or overall strength
  const getBorderColorClass = () => {
    if (password.length === 0) {
      return "border-gray-300 dark:border-gray-600"; // Default border
    }
    if (password.length < 6) {
      return "border-red-500"; // Red for less than 6 characters
    }
    // If meets min length, then if it's "Good" or "Strong" visually reinforce with green
    if (passwordStrengthResult && passwordStrengthResult.score >= 3) {
      return "border-green-500";
    }
    return "border-gray-300 dark:border-gray-600"; // Neutral if just meets min or "Fair"
  };

  return (
    <motion.div variants={shakeVariants} animate={shake ? "shake" : "noShake"}>
      <label
        htmlFor="password"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Password
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400 dark:text-gray-400" />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          onBlur={() => handlePasswordChange({ target: { value: password } })} // Re-validate on blur
          className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200
            ${getBorderColorClass()}
          `}
          placeholder="Create a strong password"
          required
          aria-invalid={password.length > 0 && password.length < 6} // ARIA invalid if less than 6
          aria-describedby="password-strength-feedback"
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      {password.length > 0 && passwordStrengthResult && (
        <PasswordStrengthBar
          score={passwordStrengthResult.score}
          feedback={passwordStrengthResult.feedback}
          policy={passwordPolicy}
        />
      )}
    </motion.div>
  );
};

export default PasswordInput;
