// src/components/auth/login/LoginForm.jsx - REFINED ERROR HANDLING

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Corrected import paths for Auth hooks
// If useAuthContext provides all necessary auth states and functions,
// you might not need useAuth separately. I'll stick to useAuthContext.
import { useAuthContext } from "../../../context/AuthContext";

// Import your existing toast utilities
import { showToast } from "../../ToastSystem/toastUtils";

// Import the modular components
import EmailInput from "../signup/EmailInput"; // Reusing from signup
import PasswordInput from "./PasswordInput";
import RememberMeCheckbox from "./RememberMeCheckbox";
import ForgotPasswordLink from "./ForgotPasswordLink";
import SubmitButton from "./SubmitButton"; // Local SubmitButton for login
import SocialAuthButtons from "../signup/SocialSignupButtons"; // Assuming SocialAuthButtons is in src/components/auth/signup/

// Props:
// - onSwitchToSignup: Function to call when the user clicks "Don't have an account? Sign Up"
const LoginForm = ({ onSwitchToSignup }) => {
  // Destructure login, currentUser, authLoading, and userProfile from useAuthContext
  const { login, currentUser, authLoading, userProfile } = useAuthContext();
  const navigate = useNavigate();

  // Local state for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Validation states for each input
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // UI state
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for password shake animation
  const [shakePasswordInput, setShakePasswordInput] = useState(false);

  // Derived state to check if the entire form is valid for submission
  const isFormValid = isEmailValid && isPasswordValid;

  // Effect to reset shake animation
  useEffect(() => {
    if (shakePasswordInput) {
      const timer = setTimeout(() => setShakePasswordInput(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shakePasswordInput]);

  // NEW useEffect for navigation after auth state is stable
  useEffect(() => {
    // Only attempt navigation if auth is NOT loading and a user is present
    if (!authLoading && currentUser) {
      // Check userProfile for onboarding status
      if (userProfile?.onboardingComplete) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [authLoading, currentUser, userProfile, navigate]); // Dependencies

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation checks
    if (!isEmailValid) {
      showToast({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }
    if (!isPasswordValid) {
      showToast({ type: "error", message: "Please enter your password." });
      setShakePasswordInput(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email, password); // This should directly throw Firebase errors now

      // If login succeeds, the try block completes, and the useEffect handles navigation
      showToast({
        type: "success",
        message: "Successfully logged in",
      });
    } catch (err) {
      // Catch the thrown error directly
      console.error("Login error:", err); // Log the full error object for debugging

      let errorMessage =
        "An unexpected error occurred during login. Please try again.";

      // Check the error code for specific messages
      if (err.code) {
        // Ensure the error object has a 'code' property
        switch (err.code) {
          case "auth/invalid-credential": // Most common for incorrect email/password
          case "auth/user-not-found": // Older, less specific but good to include
          case "auth/wrong-password": // Older, less specific but good to include
            errorMessage =
              "Invalid email or password. Please check your credentials and try again.";
            setShakePasswordInput(true); // Shake on invalid credentials
            break;
          case "auth/invalid-email":
            errorMessage =
              "The email address format is invalid. Please check and try again.";
            break;
          case "auth/too-many-requests":
            errorMessage =
              "Too many failed login attempts. Please wait a moment and try again.";
            break;
          case "auth/network-request-failed":
            errorMessage =
              "Network connection lost. Please check your internet and try again.";
            break;
          case "auth/operation-not-allowed":
            errorMessage =
              "Email/password login is currently disabled. Please contact support.";
            break;
          case "auth/user-disabled": // Added case for disabled user
            errorMessage =
              "Your account has been disabled. Please contact support.";
            break;
          default:
            errorMessage = err.error || errorMessage; // Fallback to authService message or generic
        }
      } else if (err.error) {
        // Fallback if 'err' is just an object with an 'error' message but no code
        errorMessage = err.error;
      }

      showToast({ type: "error", message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="transition-colors duration-200">
      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Email Field */}
        <EmailInput
          email={email}
          setEmail={setEmail}
          isValid={isEmailValid}
          setIsValid={setIsEmailValid}
        />

        {/* Password Field */}
        <PasswordInput
          password={password}
          setPassword={setPassword}
          setIsValid={setIsPasswordValid}
          shake={shakePasswordInput}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <RememberMeCheckbox
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
          />
          <ForgotPasswordLink />
        </div>

        {/* Submit Button */}
        <SubmitButton isSubmitting={isSubmitting} isFormValid={isFormValid} />

        {/* Divider */}
        <div className="relative my-6">
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 rounded-full">
              continue with
            </span>
          </div>
        </div>

        {/* Social Login Options */}
        <SocialAuthButtons />
      </form>
    </div>
  );
};

export default LoginForm;
