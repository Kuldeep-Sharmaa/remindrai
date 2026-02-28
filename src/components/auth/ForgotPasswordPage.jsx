// src/components/auth/ForgotPasswordPage.jsx - UPDATED VERSION

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
// ✅ Corrected import: Use 'sendPasswordReset' as it's the exported function from authService
import { sendPasswordReset } from "../../services/authService";
import { showToast } from "../ToastSystem/toastUtils"; // Assuming this path is correct

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (emailAddress) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(emailAddress);
    setIsEmailValid(valid);
    return valid;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailValid) {
      showToast({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Use the correctly imported 'sendPasswordReset' function
      await sendPasswordReset(email); // This function handles the Firebase call internally

      // On success (or a generic message for security reasons, as Firebase does)
      showToast({
        type: "success", // Using success here because the service call completed without a thrown error
        message:
          "If an account exists for that email, a password reset link has been sent.",
      });
      setTimeout(() => {
        navigate("/", { replace: true }); // Redirect to login page
      }, 3000); // Give user time to read the message
    } catch (error) {
      // Catch actual errors thrown by sendPasswordReset
      console.error("Password reset error details:", error); // Log the actual error
      showToast({
        type: "error", // Use error type for actual errors caught
        message:
          "Failed to send reset email. Please check your email or try again later.",
      });
      // Optionally redirect even on explicit error after showing toast
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 p-10 rounded-xl shadow-lg transition-colors duration-200"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email address below and we'll send you a link to reset
            your password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="sr-only">
              Email Address
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail
                  className="h-5 w-5 text-gray-400 dark:text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none relative block w-full pl-10 px-3 py-3 border rounded-md placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200
                  ${
                    email.length > 0 &&
                    (isEmailValid ? "border-green-500" : "border-red-500")
                  }
                `}
                placeholder="Enter your email address"
                value={email}
                onChange={handleChange}
                onBlur={() => validateEmail(email)}
                aria-invalid={email.length > 0 && !isEmailValid}
                aria-describedby="email-error"
              />
            </div>
            {email.length > 0 && !isEmailValid && (
              <p
                id="email-error"
                className="mt-2 text-sm text-red-600 dark:text-red-400"
              >
                Please enter a valid email address.
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={!isEmailValid || isSubmitting}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-200
                ${
                  isEmailValid && !isSubmitting
                    ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    : "bg-blue-400 dark:bg-blue-500 cursor-not-allowed opacity-70"
                }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  Sending...
                  <svg
                    className="animate-spin ml-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          <button
            onClick={() => navigate("/auth", { replace: true })}
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
