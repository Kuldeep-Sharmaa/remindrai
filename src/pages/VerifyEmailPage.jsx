// src/pages/VerifyEmailPage.jsx (FINAL, CORRECTED Version - Polling for Email Verification)
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../services/firebase"; // Ensure 'auth' is imported
import { showToast } from "../components/ToastSystem/toastUtils";

// Import Lucide Icons
import { MailCheck, RefreshCw, AlertCircle } from "lucide-react";

const VERIFICATION_CHECK_INTERVAL_MS = 3000; // Check every 3 seconds

const VerifyEmailPage = () => {
  const {
    firebaseUser,
    currentUser,
    loading,
    emailVerified,
    updateUserProfile, // Use this to update context after reload
  } = useAuthContext();
  const navigate = useNavigate();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [lastResendTime, setLastResendTime] = useState(null); // Keep track of last resend time

  const reloadIntervalRef = useRef(null); // Ref to store the interval ID

  // Effect for handling redirection based on emailVerified and onboardingComplete status
  useEffect(() => {
    console.log("VerifyEmailPage useEffect (navigation): Running...");
    console.log("   loading:", loading);
    console.log("   emailVerified (from context):", emailVerified);
    console.log(
      "   currentUser?.onboardingComplete:",
      currentUser?.onboardingComplete
    );
    console.log(
      "   currentUser (profile object):",
      currentUser
        ? {
            uid: currentUser.uid,
            email: currentUser.email,
            emailVerified: currentUser.emailVerified,
            onboardingComplete: currentUser.onboardingComplete,
          }
        : null
    );

    if (!loading) {
      if (emailVerified) {
        console.log(
          "VerifyEmailPage useEffect (navigation): Email is verified. Initiating redirect logic."
        );
        // Clear any active polling interval once email is verified
        if (reloadIntervalRef.current) {
          clearInterval(reloadIntervalRef.current);
          reloadIntervalRef.current = null;
          console.log(
            "VerifyEmailPage: Cleared email verification reload interval."
          );
        }

        if (currentUser?.onboardingComplete) {
          console.log(
            "VerifyEmailPage useEffect (navigation): Onboarding complete. Redirecting to /dashboard."
          );
          navigate("/dashboard", { replace: true });
        } else {
          console.log(
            "VerifyEmailPage useEffect (navigation): Onboarding NOT complete. Redirecting to /onboarding."
          );
          navigate("/onboarding", { replace: true });
        }
      } else if (!currentUser) {
        console.log(
          "VerifyEmailPage useEffect (navigation): Not logged in after loading. Redirecting to /auth."
        );
        navigate("/auth", { replace: true });
      } else {
        console.log(
          "VerifyEmailPage useEffect (navigation): User logged in but email not verified yet. Staying on /verify-email."
        );
      }
    } else {
      console.log(
        "VerifyEmailPage useEffect (navigation): Still loading authentication. Waiting..."
      );
    }
  }, [loading, emailVerified, currentUser, navigate]);

  // CRITICAL FIX: Effect to periodically reload Firebase user until email is verified
  useEffect(() => {
    // Only start polling if firebaseUser exists, email is NOT verified, and AuthContext is done loading
    if (firebaseUser && !emailVerified && !loading) {
      console.log(
        "VerifyEmailPage useEffect (polling): Starting email verification polling..."
      );
      // Clear any existing interval before setting a new one
      if (reloadIntervalRef.current) {
        clearInterval(reloadIntervalRef.current);
      }

      reloadIntervalRef.current = setInterval(async () => {
        console.log(
          "VerifyEmailPage useEffect (polling): Reloading Firebase user to check emailVerified status..."
        );
        try {
          // Force reload the Firebase Auth user object
          await firebaseUser.reload();
          const updatedFirebaseUser = auth.currentUser; // Get the latest user object after reload

          if (updatedFirebaseUser && updatedFirebaseUser.emailVerified) {
            console.log(
              "VerifyEmailPage useEffect (polling): Email verification status changed to TRUE! Updating context."
            );
            // Update the currentUser in AuthContext to reflect the new emailVerified status
            // This will trigger the navigation useEffect.
            updateUserProfile({
              ...currentUser, // Keep existing Firestore data
              emailVerified: updatedFirebaseUser.emailVerified, // Update the verified status
              // You might also want to update displayName if it was set after signup
              // displayName: updatedFirebaseUser.displayName,
            });
            // Clear the interval immediately once verified
            if (reloadIntervalRef.current) {
              clearInterval(reloadIntervalRef.current);
              reloadIntervalRef.current = null;
            }
          } else {
            console.log(
              "VerifyEmailPage useEffect (polling): Email status unchanged or user not found after reload."
            );
          }
        } catch (error) {
          console.error(
            "VerifyEmailPage useEffect (polling): Error reloading firebaseUser:",
            error
          );
          // If there's an error (e.g., network, user session expired), stop polling
          if (reloadIntervalRef.current) {
            clearInterval(reloadIntervalRef.current);
            reloadIntervalRef.current = null;
          }
        }
      }, VERIFICATION_CHECK_INTERVAL_MS);
    } else if (emailVerified || !firebaseUser || loading) {
      // If email is verified, no firebaseUser, or still loading, ensure interval is cleared
      if (reloadIntervalRef.current) {
        clearInterval(reloadIntervalRef.current);
        reloadIntervalRef.current = null;
        console.log(
          "VerifyEmailPage useEffect (polling): Cleanup - Cleared interval."
        );
      }
    }

    // Cleanup function for when the component unmounts
    return () => {
      if (reloadIntervalRef.current) {
        clearInterval(reloadIntervalRef.current);
        reloadIntervalRef.current = null;
        console.log(
          "VerifyEmailPage useEffect (polling): Cleanup on unmount - Cleared interval."
        );
      }
    };
  }, [firebaseUser, emailVerified, loading, currentUser, updateUserProfile]); // Dependencies: ensure effect re-runs if these change

  // Effect for resend email cooldown (existing logic)
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendVerificationEmail = async () => {
    if (resendLoading || resendCooldown > 0) return;
    if (!auth.currentUser) {
      showToast({
        type: "error",
        message: "No active user to send email to. Please log in.",
      });
      return;
    }

    setResendLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      showToast({
        type: "success",
        message: "Verification email sent! Check your inbox.",
      });
      setResendCooldown(60); // Set cooldown for 60 seconds
      setLastResendTime(new Date().toISOString()); // Record last resend time
    } catch (error) {
      console.error("Error sending verification email:", error);
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

  // If email is verified, show a success message briefly before redirecting
  if (emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
        <div className="bg-white dark:bg-neutral-900 border border-green-300/40 dark:border-green-700/40 rounded-3xl shadow-md p-8 sm:p-10 text-center max-w-md w-full">
          <MailCheck className="mx-auto h-20 w-20 text-green-600 dark:text-green-400 mb-6 animate-bounce" />
          <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
            Email Verified!
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Your email address has been successfully verified. Redirecting you
            now...
          </p>
        </div>
      </div>
    );
  }

  // If not verified, show the verification prompt
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
              <RefreshCw size={20} className="animate-spin" /> Sending...
            </>
          ) : resendCooldown > 0 ? (
            `Resend in ${resendCooldown}s`
          ) : (
            <>
              <MailCheck size={20} /> Resend Verification Email
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
