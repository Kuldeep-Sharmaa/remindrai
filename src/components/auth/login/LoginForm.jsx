import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthContext } from "../../../context/AuthContext";
import { showToast } from "../../ToastSystem/toastUtils";

import EmailInput from "../signup/EmailInput";
import PasswordInput from "./PasswordInput";
import ForgotPasswordLink from "./ForgotPasswordLink";
import SubmitButton from "./SubmitButton";
import SocialAuthButtons from "../signup/SocialSignupButtons";

const LoginForm = ({ onSwitchToSignup }) => {
  const {
    login,
    currentUser,
    loading: authLoading,
    userProfile,
  } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakePasswordInput, setShakePasswordInput] = useState(false);

  const isFormValid = isEmailValid && isPasswordValid;

  useEffect(() => {
    if (shakePasswordInput) {
      const timer = setTimeout(() => setShakePasswordInput(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shakePasswordInput]);

  useEffect(() => {
    if (!authLoading && currentUser) {
      if (userProfile?.onboardingComplete) {
        navigate("/workspace", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [authLoading, currentUser, userProfile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      await login(email, password);
      showToast({ type: "success", message: "Successfully logged in" });
    } catch (err) {
      console.error("Login error:", err);

      let errorMessage =
        "An unexpected error occurred during login. Please try again.";

      if (err.code) {
        switch (err.code) {
          case "auth/invalid-credential":
          case "auth/user-not-found":
          case "auth/wrong-password":
            errorMessage =
              "Invalid email or password. Please check your credentials and try again.";
            setShakePasswordInput(true);
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
          case "auth/user-disabled":
            errorMessage =
              "Your account has been disabled. Please contact support.";
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
        <EmailInput
          email={email}
          setEmail={setEmail}
          isValid={isEmailValid}
          setIsValid={setIsEmailValid}
        />

        <PasswordInput
          password={password}
          setPassword={setPassword}
          setIsValid={setIsPasswordValid}
          shake={shakePasswordInput}
        />

        <div className="flex items-center justify-end">
          <ForgotPasswordLink />
        </div>

        <SubmitButton isSubmitting={isSubmitting} isFormValid={isFormValid} />

        <div className="relative my-6">
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 rounded-full">
              continue with
            </span>
          </div>
        </div>

        <SocialAuthButtons />
      </form>
    </div>
  );
};

export default LoginForm;
