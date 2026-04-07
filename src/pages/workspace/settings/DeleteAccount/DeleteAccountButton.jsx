import React, { useState } from "react";
import {
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
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
    authProvider,
    hasPasswordAuth,
  } = useAuthContext();
  const [confirming, setConfirming] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthLoading, setReauthLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
        // Firebase threw auth/requires-recent-login — user needs to re-verify
        // before we can delete. Show the modal instead of a dead-end error.
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

  // Firebase requires re-verification before account deletion regardless of
  // how recently the user signed in. The method depends on how they signed up —
  // password users re-enter their password, OAuth users go back through their
  // provider's popup. Same security guarantee, different UX path.
  const handleReauthenticate = async (password) => {
    const user = auth.currentUser;
    if (!user) {
      showToast({
        type: "error",
        message: "Session expired. Please log in again.",
      });
      return;
    }

    setReauthLoading(true);

    try {
      if (hasPasswordAuth) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      } else if (authProvider === "google.com") {
        await reauthenticateWithPopup(user, new GoogleAuthProvider());
      } else if (authProvider === "github.com") {
        await reauthenticateWithPopup(user, new GithubAuthProvider());
      }

      setShowReauthModal(false);
      await handleDeleteConfirmed();
    } catch (err) {
      console.error("Reauthentication error:", err);
      showToast({
        type: "error",
        message:
          err.code === "auth/popup-closed-by-user"
            ? "Authentication cancelled."
            : "Verification failed. Please try again.",
      });
    } finally {
      setReauthLoading(false);
    }
  };

  // Button is disabled while auth is loading, if there's no valid user session,
  // or if a deletion is already in progress.
  const isDisabled =
    authLoading || !currentUser || !currentUser.uid || isAccountDeleting;
  const loading = isAccountDeleting || reauthLoading;

  return (
    <div className="w-full mt-6 max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-red-50/80 to-pink-50/80 dark:from-red-900/20 dark:to-pink-900/20 backdrop-blur-sm rounded-2xl border border-red-200/50 dark:border-red-800/50 p-6 sm:p-8 shadow-xl">
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

        {/* Only show inline error when the reauth modal is closed — otherwise
            the modal itself handles the error feedback */}
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

      {showReauthModal && (
        <ReauthenticateModal
          onClose={handleCancelDelete}
          onReauthenticate={handleReauthenticate}
          loading={reauthLoading}
          hasPasswordAuth={hasPasswordAuth}
          authProvider={authProvider}
        />
      )}
    </div>
  );
};

export default DeleteAccountButton;
