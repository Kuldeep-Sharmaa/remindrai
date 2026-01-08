// src/Auth/components/signup/index.jsx (Final Version - CORRECTED error handling)

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";

import { useAuthContext } from "../../../context/AuthContext";

import NameInput from "./NameInput";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import ConfirmPasswordInput from "./ConfirmPasswordInput";
import TermsCheckbox from "./TermsCheckbox";
import SubmitButton from "./SubmitButton";
import SocialSignupButtons from "./SocialSignupButtons";

import { showToast } from "../../ToastSystem/toastUtils";

const SignupForm = ({ onSwitchToLogin }) => {
  const { signup } = useAuthContext();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isFullNameValid, setIsFullNameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [passwordStrengthResult, setPasswordStrengthResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [shakePasswordInput, setShakePasswordInput] = useState(false);

  const isFormValid =
    isFullNameValid &&
    isEmailValid &&
    isPasswordValid &&
    isConfirmPasswordValid &&
    termsAccepted;

  useEffect(() => {
    if (shakePasswordInput) {
      const timer = setTimeout(() => setShakePasswordInput(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shakePasswordInput]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setShowTermsError(true); // Show terms error if not accepted on submit attempt

    // Pre-submission validation checks
    if (!isFullNameValid) {
      showToast({ type: "error", message: "Please enter your full name." });
      return;
    }
    if (!isEmailValid) {
      showToast({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }
    if (!isPasswordValid) {
      showToast({
        type: "error",
        message: "Your password must be at least 6 characters long.",
      });
      setShakePasswordInput(true);
      return;
    }
    if (password !== confirmPassword) {
      // Direct check for password match
      showToast({ type: "error", message: "Passwords do not match." });
      setShakePasswordInput(true);
      return;
    }
    if (!termsAccepted) {
      showToast({
        type: "error",
        message:
          "Please accept the Terms of Service and Privacy Policy to proceed.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // --- CRITICAL: Ensure fullName is passed here ---
      // The signup function now directly throws the { success, error, code } object
      await signup(email, password, fullName);

      // If signup completes without throwing an error, it's successful
      showToast({
        type: "success",
        message: "Account created! Please check your email for verification.",
      });
      console.log("User signed up. Email verification sent.");
      navigate("/verify-email", { replace: true });
    } catch (err) {
      // Now, 'err' directly contains the { success: false, error: message, code: firebaseCode } object
      console.error("Signup error:", err); // Log the full error object for debugging

      let errorMessage =
        "An unexpected error occurred during signup. Please try again.";

      // Handle specific error codes returned by authService.js
      if (err.code) {
        // Check if 'err' has a 'code' property
        switch (err.code) {
          case "auth/email-already-in-use":
            errorMessage =
              "This email is already registered. Please log in or use a different email.";
            break;
          case "auth/weak-password":
            errorMessage =
              "Password is too weak. Please choose a stronger password.";
            setShakePasswordInput(true); // Shake on weak password as well
            break;
          case "auth/invalid-email":
            errorMessage = "The email address is not valid.";
            break;
          case "auth/operation-not-allowed":
            errorMessage =
              "Email/password accounts are not enabled. Please contact support.";
            break;
          default:
            errorMessage = err.error || errorMessage; // Use the provided error message if available
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
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <NameInput
          fullName={fullName}
          setFullName={setFullName}
          isValid={isFullNameValid}
          setIsValid={setIsFullNameValid}
        />
        <EmailInput
          email={email}
          setEmail={setEmail}
          isValid={isEmailValid}
          setIsValid={setIsEmailValid}
        />
        <PasswordInput
          password={password}
          setPassword={setPassword}
          passwordStrengthResult={passwordStrengthResult}
          setPasswordStrengthResult={setPasswordStrengthResult}
          setIsValid={setIsPasswordValid}
          shake={shakePasswordInput}
        />
        <ConfirmPasswordInput
          password={password}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          setIsValid={setIsConfirmPasswordValid}
          passwordStrengthResult={passwordStrengthResult}
          shake={shakePasswordInput && password !== confirmPassword}
        />
        <TermsCheckbox
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
          setIsValid={setTermsAccepted} // This seems redundant, termsAccepted is already managed
          showValidationError={showTermsError}
        />
        <SubmitButton isSubmitting={isSubmitting} isFormValid={isFormValid} />
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600/50"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 rounded-full">
              sign up with
            </span>
          </div>
        </div>
        <SocialSignupButtons />
      </form>
    </div>
  );
};

export default SignupForm;
