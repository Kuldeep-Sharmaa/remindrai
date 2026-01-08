// src/components/settings/DeleteAccountButton.jsx

import React, { useState, useEffect } from "react";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../context/AuthContext";
import { auth } from "../../../services/firebase"; // Import the auth instance directly for Firebase Auth operations

// Import your actual toast system
import { showToast } from "../../../components/ToastSystem/toastUtils"; // Adjust path as needed

/**
 * Reauthentication Modal Component
 * Enhanced with better animations and mobile-first design
 */
const ReauthenticateModal = ({ onClose, onReauthenticate, loading, error }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onReauthenticate(password);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white/90 dark:bg-black backdrop-blur-md rounded-2xl shadow-2xl border border-gray-300/40 dark:border-gray-700/50 w-full max-w-md p-6 sm:p-8 transform animate-in zoom-in-95 duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/30 shadow-inner">
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
                  d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-5a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Verify Identity
            </h3>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-full hover:bg-gray-200/60 dark:hover:bg-gray-800 transition duration-200 disabled:opacity-50"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Info Text */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          For your security, please re-enter your password to confirm this
          sensitive action.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Field */}
          <div>
            <label
              htmlFor="reauth-password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="reauth-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoFocus
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-400 transition-all duration-200 pr-12"
              />
              {/* Toggle Visibility */}
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
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
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 mr-2 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
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
                  Verifying...
                </>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Enhanced DeleteAccountButton Component
 * Now integrated with AuthContext deleteAccount method
 */
const DeleteAccountButton = () => {
  // Use deleteAccount and isAccountDeleting from AuthContext
  const {
    currentUser,
    loading: authLoading,
    deleteAccount,
    isAccountDeleting,
  } = useAuthContext();
  const [confirming, setConfirming] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthLoading, setReauthLoading] = useState(false); // Local loading for reauthentication
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Debugging useEffect - now uses currentUser directly
  useEffect(() => {
    console.log("DeleteAccountButton Mounted/Updated:");
    console.log("  currentUser:", currentUser);
    console.log("  isAccountDeleting:", isAccountDeleting);
    if (!currentUser) {
      console.warn("currentUser is NULL. Delete button will be disabled.");
    }
    if (!currentUser?.uid) {
      console.warn("currentUser.uid is NULL. Delete button will be disabled.");
    }
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

  const handleReauthenticate = async (password) => {
    // Use auth.currentUser directly for reauthentication
    const user = auth.currentUser;
    if (!user || !user.email) {
      setError("Cannot reauthenticate: User not found or email is missing.");
      return;
    }

    setReauthLoading(true);
    setError("");

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      setShowReauthModal(false);
      await handleDeleteConfirmed();
    } catch (err) {
      console.error("Reauthentication error:", err);
      if (err.code === "auth/wrong-password") {
        setError("Invalid password. Please try again.");
      } else if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-email"
      ) {
        setError(
          "Account not found. Please ensure you are logged in correctly."
        );
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(
          `Reauthentication failed: ${
            err.message || "An unknown error occurred."
          }`
        );
      }
    } finally {
      setReauthLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!currentUser?.uid) {
      setError("No user data available for deletion. Please log in again.");
      setConfirming(false);
      return;
    }

    setError("");

    try {
      // Use the deleteAccount method from AuthContext
      const result = await deleteAccount();

      if (result.success) {
        console.log("Account deleted successfully");
        showToast({
          type: "success",
          message:
            "Your remindrai.app account has been successfully deleted. We're sad to see you go!",
        });
        // User will be automatically redirected by ProtectedRoute
        navigate("/", { replace: true });
      } else if (result.requiresRecentLogin) {
        // Handle re-authentication requirement
        console.log("Please log in again to delete account");
        setError("For security, please re-enter your password to confirm.");
        setShowReauthModal(true);
      } else {
        console.error("Error deleting account:", result.error);
        setError(
          `Failed to delete account: ${
            result.error || "An unknown error occurred."
          }. Please try again or contact support.`
        );
      }
    } catch (err) {
      console.error("Unexpected error during account deletion:", err);
      setError(
        `An unexpected error occurred: ${
          err.message || "Please try again or contact support."
        }`
      );
    } finally {
      setConfirming(false);
    }
  };

  // The button should be disabled if auth is still loading, or if no currentUser is present, or if account deletion is in progress
  const isDisabled =
    authLoading || !currentUser || !currentUser.uid || isAccountDeleting;

  // Determine the current loading state (either from AuthContext or local reauthentication)
  const loading = isAccountDeleting || reauthLoading;

  return (
    <div className="w-full mt-6 max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-red-50/80 to-pink-50/80 dark:from-red-900/20 dark:to-pink-900/20 backdrop-blur-sm rounded-2xl border border-red-200/50 dark:border-red-800/50 p-6 sm:p-8 shadow-xl">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/30 rounded-xl flex items-center justify-center shadow-inner">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400"
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
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Delete Account
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Permanently delete your{" "}
              <span className="font-medium text-gray-800 dark:text-gray-200">
                remindrai.app
              </span>{" "}
              account, including all associated data, scheduled posts, and
              AI-generated drafts.
            </p>
          </div>
        </div>

        {/* Warning */}
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

        {/* Action Buttons */}
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
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
                  Are you absolutely sure?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  This will permanently delete your account and all associated
                  data. There is no way to recover it after deletion.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleCancelDelete}
                  disabled={loading}
                  aria-label="Cancel deletion"
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowReauthModal(true)}
                  disabled={loading}
                  aria-label="Confirm deletion"
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-xl hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 font-semibold disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    "Yes, Delete Permanently"
                  )}
                </button>
              </div>
            </div>
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
          error={error}
        />
      )}
    </div>
  );
};

export default DeleteAccountButton;
