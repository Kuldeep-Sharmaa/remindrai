import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthContext } from "../../../context/AuthContext";

import NameInput from "./NameInput";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import ConfirmPasswordInput from "./ConfirmPasswordInput";
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

  const [passwordStrengthResult, setPasswordStrengthResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakePasswordInput, setShakePasswordInput] = useState(false);

  const isFormValid =
    isFullNameValid &&
    isEmailValid &&
    isPasswordValid &&
    isConfirmPasswordValid;

  // Reset shake after animation completes
  useEffect(() => {
    if (!shakePasswordInput) return;
    const timer = setTimeout(() => setShakePasswordInput(false), 500);
    return () => clearTimeout(timer);
  }, [shakePasswordInput]);

  // Keep isConfirmPasswordValid in sync whenever password or confirmPassword changes.
  // Also handles the case where user clears the confirm field (resets to false).
  useEffect(() => {
    if (confirmPassword.length === 0) {
      setIsConfirmPasswordValid(false);
    } else {
      setIsConfirmPasswordValid(
        password.length > 0 && password === confirmPassword,
      );
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      showToast({ type: "error", message: "Passwords do not match." });
      setShakePasswordInput(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(email, password, fullName);
      showToast({
        type: "success",
        message: "Account created! Please check your email for verification.",
      });
      navigate("/verify-email", { replace: true });
    } catch (err) {
      console.error("Signup error:", err);

      let errorMessage =
        "An unexpected error occurred during signup. Please try again.";

      if (err.code) {
        switch (err.code) {
          case "auth/email-already-in-use":
            errorMessage =
              "This email is already registered. Please log in or use a different email.";
            break;
          case "auth/weak-password":
            errorMessage =
              "Password is too weak. Please choose a stronger password.";
            setShakePasswordInput(true);
            break;
          case "auth/invalid-email":
            errorMessage = "The email address is not valid.";
            break;
          case "auth/operation-not-allowed":
            errorMessage =
              "Email/password accounts are not enabled. Please contact support.";
            break;
          default:
            errorMessage = err.error || errorMessage;
        }
      } else if (err.error) {
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
          shake={shakePasswordInput && password !== confirmPassword}
        />
        <SubmitButton isSubmitting={isSubmitting} isFormValid={isFormValid} />

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-border" />
          <span className="text-[11.5px] font-inter text-muted flex-shrink-0">
            or continue with
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-border" />
        </div>

        <SocialSignupButtons />
      </form>
    </div>
  );
};

export default SignupForm;
