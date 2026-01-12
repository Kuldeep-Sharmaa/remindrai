// src/components/settings/Security.jsx
import React, { useState, useEffect } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { showToast } from "../../../components/ToastSystem/toastUtils";
import { useAuthContext } from "../../../context/AuthContext";
import { DateTime } from "luxon";
import zxcvbn from "zxcvbn";

import {
  ShieldCheck,
  Key,
  Clock,
  ScanText,
  Sparkles,
  Lightbulb,
} from "lucide-react";

const Security = () => {
  const {
    firebaseUser,
    currentUser,
    loading: authContextLoading,
  } = useAuthContext();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [lastSignInTime, setLastSignInTime] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(null);

  useEffect(() => {
    // Use currentUser.lastSignInTime from the userProfile
    if (currentUser) {
      setLastSignInTime(currentUser.lastSignInTime);
    } else {
      setLastSignInTime(null);
    }
  }, [currentUser]); // Dependency updated to currentUser

  const formatTimestamp = (timestamp) => {
    if (!timestamp) {
      return "N/A";
    }

    let dt;
    dt = DateTime.fromISO(timestamp);

    if (!dt.isValid) {
      dt = DateTime.fromHTTP(timestamp);
    }

    if (!dt.isValid) {
      dt = DateTime.fromJSDate(new Date(timestamp));
    }

    if (!dt.isValid) {
      console.error(
        "Luxon failed to parse timestamp after multiple attempts:",
        dt.invalidExplanation,
        "Original Timestamp:",
        timestamp,
        "Input Type:",
        typeof timestamp
      );
      return "Invalid DateTime";
    }

    return dt
      .setZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
      .toFormat("dd/MM/yyyy, hh:mm:ss a ZZZZ");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    if (newPassword !== confirmNewPassword) {
      showToast({ type: "error", message: "New passwords do not match." });
      setFormLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      showToast({
        type: "error",
        message: "New password must be at least 6 characters long.",
      });
      setFormLoading(false);
      return;
    }

    if (!firebaseUser) {
      showToast({
        type: "error",
        message: "Authentication required. Please log in again.",
      });
      setFormLoading(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        oldPassword
      );

      await reauthenticateWithCredential(firebaseUser, credential);

      await updatePassword(firebaseUser, newPassword);

      showToast({
        type: "success",
        message: "Password updated successfully",
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordStrength(null);
    } catch (error) {
      console.error("Error changing password:", error);

      let errorMessage = "An unexpected error occurred. Please try again.";

      switch (error.code) {
        case "auth/wrong-password":
          errorMessage = "Incorrect current password. Please try again.";
          break;
        case "auth/requires-recent-login":
          errorMessage =
            "This action requires recent authentication. Please log out and log back in to change your password.";
          break;
        case "auth/weak-password":
          errorMessage =
            "The new password is too weak. Please choose a stronger password.";
          break;
        case "auth/invalid-credential":
          errorMessage =
            "Invalid credentials provided. Please check your current password.";
          break;
        default:
          errorMessage = "Failed to update password. " + error.message;
          break;
      }
      showToast({ type: "error", message: errorMessage });
    } finally {
      setFormLoading(false);
    }
  };

  if (authContextLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 dark:text-gray-400">
        Loading User Data...
      </div>
    );
  }

  // Use currentUser (userProfile) for display checks
  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto p-4 md:p-8 text-center text-red-600">
        You must be logged in to access security settings.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-50 flex flex-col items-center py-8  sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Change Password Section */}
        <div className="mb-8 p-6 bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-300/40 dark:border-white/10 rounded-2xl shadow-md">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-2 text-black dark:text-white">
            <Key className="h-6 w-6 text-black dark:text-white" />
            Change Password
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-5">
            {/* Current Password */}
            <div>
              <label
                htmlFor="oldPassword"
                className="block text-sm mb-2 text-gray-700 dark:text-gray-300"
              >
                Current Password
              </label>
              <input
                type="password"
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                placeholder="Enter current password"
                className="w-full p-3 rounded-lg border border-gray-300/40 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-md text-black dark:text-white focus:ring-2 focus:ring-gray-400 outline-none"
              />
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm mb-2 text-gray-700 dark:text-gray-300"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewPassword(value);
                  setPasswordStrength(value ? zxcvbn(value) : null);
                }}
                required
                placeholder="Enter new password"
                className="w-full p-3 rounded-lg border border-gray-300/40 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-md text-black dark:text-white focus:ring-2 focus:ring-gray-400 outline-none"
              />
              {newPassword && passwordStrength && (
                <div className="mt-2">
                  <div
                    className={`h-2 rounded transition-all duration-300 ${
                      [
                        "bg-red-500 w-1/5",
                        "bg-orange-500 w-2/5",
                        "bg-yellow-500 w-3/5",
                        "bg-blue-500 w-4/5",
                        "bg-green-600 w-full",
                      ][passwordStrength.score]
                    }`}
                  />
                  <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                    Strength:{" "}
                    {
                      ["Very Weak", "Weak", "Fair", "Good", "Strong"][
                        passwordStrength.score
                      ]
                    }
                  </p>
                  {passwordStrength.feedback.suggestions.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Lightbulb className="h-3.5 w-3.5" />{" "}
                      {passwordStrength.feedback.suggestions.join(" ")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm mb-2 text-gray-700 dark:text-gray-300"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                className="w-full p-3 rounded-lg border border-gray-300/40 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-md text-black dark:text-white focus:ring-2 focus:ring-gray-400 outline-none"
              />
              {newPassword &&
                confirmNewPassword &&
                newPassword !== confirmNewPassword && (
                  <p className="text-red-500 text-sm mt-2">
                    Passwords do not match.
                  </p>
                )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                formLoading ||
                newPassword !== confirmNewPassword ||
                newPassword.length < 6 ||
                !firebaseUser
              }
              className="w-full py-3 px-4 rounded-lg bg-black dark:bg-white text-white dark:text-black font-medium hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {formLoading ? "Changing Password..." : "Change Password"}
            </button>
          </form>
        </div>

        {/* Account Activity */}
        <div className="mb-8 p-6 bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-300/40 dark:border-white/10 rounded-2xl shadow-md">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center gap-2 text-black dark:text-white">
            <Clock className="h-6 w-6 text-black dark:text-white" />
            Account Activity
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Last Log-In:{" "}
            <strong className="text-black dark:text-white">
              {formatTimestamp(lastSignInTime)}
            </strong>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            This shows your last successful login to remindrai.app.
          </p>
        </div>

        {/* 2FA Placeholder */}
        <div className="mb-8 p-6 bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-300/40 dark:border-white/10 rounded-2xl shadow-md">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center gap-2 text-black dark:text-white">
            <ScanText className="h-6 w-6 text-black dark:text-white" />
            Two-Factor Authentication (2FA)
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Protect your account with an extra layer of security. This feature
            is coming soon.
          </p>
          <button className="w-full py-3 px-4 mt-6 rounded-lg bg-neutral-300 dark:bg-neutral-700 text-gray-600 dark:text-gray-400 cursor-not-allowed">
            Enable 2FA (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Security;
