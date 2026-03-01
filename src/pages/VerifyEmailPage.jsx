import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../services/firebase";
import { showToast } from "../components/ToastSystem/toastUtils";
import { MailCheck, RefreshCw, AlertCircle } from "lucide-react";

// How often we ask Firebase "has the user clicked the link yet?"
const VERIFICATION_CHECK_INTERVAL_MS = 3000;

const VerifyEmailPage = () => {
  const {
    firebaseUser,
    currentUser,
    loading,
    emailVerified,
    updateUserProfile,
  } = useAuthContext();

  const navigate = useNavigate();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [lastResendTime, setLastResendTime] = useState(null);
  const reloadIntervalRef = useRef(null);

  // Once email is verified, decide where to send the user next.
  // If they haven't finished onboarding yet, send them there first.
  useEffect(() => {
    if (loading) return;

    if (emailVerified) {
      if (reloadIntervalRef.current) {
        clearInterval(reloadIntervalRef.current);
        reloadIntervalRef.current = null;
      }

      if (currentUser?.onboardingComplete) {
        navigate("/workspace", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    } else if (!currentUser) {
      navigate("/auth", { replace: true });
    }
  }, [loading, emailVerified, currentUser, navigate]);

  // Poll Firebase every 3 seconds to detect when the user clicks the email link.
  // Firebase doesn't push this update — we have to ask.
  useEffect(() => {
    if (!firebaseUser || emailVerified || loading) {
      if (reloadIntervalRef.current) {
        clearInterval(reloadIntervalRef.current);
        reloadIntervalRef.current = null;
      }
      return;
    }

    if (reloadIntervalRef.current) {
      clearInterval(reloadIntervalRef.current);
    }

    reloadIntervalRef.current = setInterval(async () => {
      try {
        await firebaseUser.reload();
        const updatedUser = auth.currentUser;

        if (updatedUser?.emailVerified) {
          updateUserProfile({
            ...currentUser,
            emailVerified: true,
          });

          clearInterval(reloadIntervalRef.current);
          reloadIntervalRef.current = null;
        }
      } catch {
        // Network error or expired session — stop polling rather than hammering the server
        clearInterval(reloadIntervalRef.current);
        reloadIntervalRef.current = null;
      }
    }, VERIFICATION_CHECK_INTERVAL_MS);

    return () => {
      if (reloadIntervalRef.current) {
        clearInterval(reloadIntervalRef.current);
        reloadIntervalRef.current = null;
      }
    };
  }, [firebaseUser, emailVerified, loading, currentUser, updateUserProfile]);

  // Count down the resend cooldown one second at a time
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendVerificationEmail = async () => {
    if (resendLoading || resendCooldown > 0) return;

    if (!auth.currentUser) {
      showToast({ type: "error", message: "No active user. Please log in." });
      return;
    }

    setResendLoading(true);
    try {
      await sendEmailVerification(auth.currentUser, {
        url: "https://remindrai.vercel.app/verify-email",
        handleCodeInApp: false,
      });
      showToast({
        type: "success",
        message: "Verification email sent! Check your inbox.",
      });
      setResendCooldown(60);
      setLastResendTime(new Date().toISOString());
    } catch (error) {
      showToast({
        type: "error",
        message: `Failed to send email: ${error.message}`,
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-gray-700 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  if (emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
        <div className="bg-white dark:bg-neutral-900 border border-green-300/40 dark:border-green-700/40 rounded-3xl shadow-md p-8 sm:p-10 text-center max-w-md w-full">
          <MailCheck className="mx-auto h-20 w-20 text-green-600 dark:text-green-400 mb-6 animate-bounce" />
          <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
            Email Verified!
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Your email has been verified. Redirecting you now...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="bg-white dark:bg-neutral-900 border border-gray-300/40 dark:border-neutral-800/50 rounded-3xl shadow-md p-8 sm:p-10 text-center max-w-md w-full">
        <AlertCircle className="mx-auto h-20 w-20 text-black dark:text-white mb-6 animate-pulse" />
        <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
          Verify Your Email
        </h1>
        <p className="text-gray-700 dark:text-gray-400 mb-6">
          A verification link has been sent to{" "}
          <strong>{currentUser?.email || "your email address"}</strong>. Please
          check your inbox (and spam folder) to verify your account.
        </p>
        <button
          onClick={handleResendVerificationEmail}
          disabled={resendLoading || resendCooldown > 0}
          className="w-full py-3 px-6 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium hover:opacity-80 disabled:opacity-40 transition flex items-center justify-center gap-2"
        >
          {resendLoading ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              Sending...
            </>
          ) : resendCooldown > 0 ? (
            `Resend in ${resendCooldown}s`
          ) : (
            <>
              <MailCheck size={20} />
              Resend Verification Email
            </>
          )}
        </button>
        {resendCooldown > 0 && (
          <p className="text-xs text-gray-600 dark:text-gray-500 mt-3">
            Please wait before requesting another email.
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
