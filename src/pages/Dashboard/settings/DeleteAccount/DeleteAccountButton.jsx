// src/components/settings/DeleteAccountButton.jsx

import React, { useState, useEffect } from "react";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../../context/AuthContext";
import { auth } from "../../../../services/firebase";
import { showToast } from "../../../../components/ToastSystem/toastUtils";
import ReauthenticateModal from "./Reauthenticatemodal";
import DeleteConfirmPanel from "./ConfirmPanel";

const DeleteAccountButton = () => {
  const {
    currentUser,
    loading: authLoading,
    deleteAccount,
    isAccountDeleting,
  } = useAuthContext();
  const [confirming, setConfirming] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthLoading, setReauthLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("DeleteAccountButton Mounted/Updated:");
    console.log("  currentUser:", currentUser);
    console.log("  isAccountDeleting:", isAccountDeleting);
    if (!currentUser)
      console.warn("currentUser is NULL. Delete button will be disabled.");
    if (!currentUser?.uid)
      console.warn("currentUser.uid is NULL. Delete button will be disabled.");
  }, [currentUser, isAccountDeleting]);

  const handleInitiateDelete = () => {
    setError("");
    setConfirming(true);
  };

  const handleCancelDelete = () => {
    setConfirming(false);
    setShowReauthModal(false);
    setError("");
    setReauthLoading(false);
  };

  const handleDeleteConfirmed = async () => {
    if (!currentUser?.uid) {
      setError("No user data available for deletion. Please log in again.");
      setConfirming(false);
      return;
    }

    setError("");

    try {
      const result = await deleteAccount();

      if (result.success) {
        showToast({
          type: "success",
          message:
            "Your remindrai.app account has been successfully deleted. We're sad to see you go!",
        });
        navigate("/", { replace: true });
      } else if (result.requiresRecentLogin) {
        setError("For security, please re-enter your password to confirm.");
        setShowReauthModal(true);
      } else {
        setError(
          `Failed to delete account: ${result.error || "An unknown error occurred."}. Please try again or contact support.`,
        );
      }
    } catch (err) {
      console.error("Unexpected error during account deletion:", err);
      setError(
        `An unexpected error occurred: ${err.message || "Please try again or contact support."}`,
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleReauthenticate = async (password) => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      showToast({
        type: "error",
        message: "Session expired. Please log in again and retry.",
      });
      return;
    }

    setReauthLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      setShowReauthModal(false);
      await handleDeleteConfirmed();
    } catch (err) {
      console.error("Reauthentication error:", err);
      const toastMessage =
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
          ? "Incorrect password. Please try again."
          : err.code === "auth/user-not-found" ||
              err.code === "auth/invalid-email"
            ? "We couldn't find your account. Please log out and log back in."
            : err.code === "auth/too-many-requests"
              ? "Too many failed attempts. Please wait a moment and try again."
              : "Verification failed. Please try again or contact support.";

      showToast({ type: "error", message: toastMessage });
    } finally {
      setReauthLoading(false);
    }
  };

  const isDisabled =
    authLoading || !currentUser || !currentUser.uid || isAccountDeleting;
  const loading = isAccountDeleting || reauthLoading;

  return (
    <div className="w-full mt-6 max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-red-50/80 to-pink-50/80 dark:from-red-900/20 dark:to-pink-900/20 backdrop-blur-sm rounded-2xl border border-red-200/50 dark:border-red-800/50 p-6 sm:p-8 shadow-xl">
        {/* Warning Banner */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="font-semibold text-red-800 dark:text-red-300">
              This action cannot be undone
            </span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 pl-7">
            Once deleted, your account and data cannot be recovered.
          </p>
        </div>

        {/* Error Message */}
        {error && !showReauthModal && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Action Area */}
        <div className="space-y-4">
          {!confirming ? (
            <button
              onClick={handleInitiateDelete}
              disabled={isDisabled}
              aria-label="Delete my account"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-xl hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 font-semibold text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete My Account
                </>
              )}
            </button>
          ) : (
            <DeleteConfirmPanel
              onCancel={handleCancelDelete}
              onConfirm={() => setShowReauthModal(true)}
              loading={loading}
            />
          )}
        </div>

        {/* Disabled State Info */}
        {isDisabled && !loading && (
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-2">
            <svg
              className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Account deletion is temporarily unavailable. Please check your
              session and try again.
            </p>
          </div>
        )}
      </div>

      {/* Reauthentication Modal */}
      {showReauthModal && (
        <ReauthenticateModal
          onClose={handleCancelDelete}
          onReauthenticate={handleReauthenticate}
          loading={reauthLoading}
        />
      )}
    </div>
  );
};

export default DeleteAccountButton;
