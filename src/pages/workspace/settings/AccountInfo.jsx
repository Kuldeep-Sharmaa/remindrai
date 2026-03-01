// src/components/settings/AccountInfo.jsx - Production-Ready with Button Loading

import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore"; // Ensure getDoc is actually used if data fetched from Firestore
import { db } from "../../../services/firebase"; // Assuming db is exported from here
import { useAuthContext } from "../../../context/AuthContext";
import Spinner from "../../../components/Loaders/Spinner"; // Import the Spinner component for button loading

// Import Lucide Icons
import {
  User,
  Mail,
  CalendarDays,
  Globe,
  Bot,
  Briefcase,
  MessageSquareText,
  Monitor,
  Fingerprint,
  Info,
} from "lucide-react";

// For persistent data (makes the initial data load only happen once per session)
let _accountInfoFetchedOnce = false;

const AccountInfo = () => {
  const {
    currentUser,
    loading: loadingAuth, // AuthContext's overall loading state
    formatDateFromTimestamp,
  } = useAuthContext();

  // State for initial page data loading (skeleton display)
  const [loadingPageData, setLoadingPageData] = useState(true);

  // State for the copy UID button's loading state
  const [isCopying, setIsCopying] = useState(false);

  // Original states for display
  const [fullName, setFullName] = useState("");
  const [memberSince, setMemberSince] = useState("N/A");
  const [timezone, setTimezone] = useState("N/A");
  const [aiPreferences, setAiPreferences] = useState({
    role: "Not set",
    tone: "Not set",
    platform: "Not set",
  });
  const [showUID, setShowUID] = useState(false);
  const [copyMessage, setCopyMessage] = useState(""); // Message for copy status

  // --- Utility functions (unchanged) ---
  const formatFirebaseDate = (dateValue) => {
    if (!dateValue) return "N/A";

    let date;
    if (dateValue.toDate && typeof dateValue.toDate === "function") {
      date = dateValue.toDate();
    } else if (typeof dateValue === "string" || typeof dateValue === "number") {
      try {
        date = new Date(dateValue);
      } catch (e) {
        console.error(
          "formatFirebaseDate: Could not parse date string/number:",
          dateValue,
          e,
        );
        return "N/A";
      }
    } else {
      console.warn(
        "formatFirebaseDate: Unknown date format:",
        typeof dateValue,
        dateValue,
      );
      return "N/A";
    }

    if (isNaN(date.getTime())) {
      console.warn(
        "formatFirebaseDate: Invalid Date object after parsing:",
        dateValue,
      );
      return "N/A";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  // --- End utility functions ---

  // Modified handleCopyUID to include button loading
  const handleCopyUID = async () => {
    if (!currentUser?.uid) {
      setCopyMessage("No UID to copy.");
      setTimeout(() => setCopyMessage(""), 2000);
      return;
    }

    setIsCopying(true); // Start loading for the button
    setCopyMessage(""); // Clear previous message immediately

    try {
      // Simulate a very short delay to make the spinner visible for a moment
      // In a real, purely synchronous copy, you might skip this setTimeout
      // and just show the "Copied!" message instantly.
      // But for "production-level loader" as requested, we make it briefly visible.
      await new Promise((resolve) => setTimeout(resolve, 300)); // Short 300ms delay

      const textarea = document.createElement("textarea");
      textarea.value = currentUser.uid;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopyMessage("Copied!"); // Success message
    } catch (err) {
      console.error("Failed to copy UID:", err);
      setCopyMessage("Failed to copy."); // Error message
    } finally {
      setIsCopying(false); // End loading for the button
      setTimeout(() => setCopyMessage(""), 3000); // Clear message after 3 seconds
    }
  };

  // Effect to load initial user data. Uses module-level flag for persistence.
  useEffect(() => {
    if (!loadingAuth && currentUser) {
      if (!_accountInfoFetchedOnce) {
        setLoadingPageData(true); // Show page loading state initially
        console.log("AccountInfo: Fetching initial user data...");

        // Simulate a small delay for data processing, even if it's from context/Firestore
        const loadData = async () => {
          try {
            // Simulate Firestore fetch if needed, currently data comes from currentUser directly
            // For example, if you had a specific 'profile' document to load:
            // const userDocRef = doc(db, "users", currentUser.uid);
            // const docSnap = await getDoc(userDocRef);
            // if (docSnap.exists()) {
            //   const data = docSnap.data();
            //   setFullName(data.fullName || currentUser.displayName || currentUser.email?.split("@")[0] || "User Name");
            //   setTimezone(data.timezone || "N/A");
            //   setAiPreferences({
            //     role: data.role || "Not set",
            //     tone: data.tone || "Not set",
            //     platform: data.platform || "Not set",
            //   });
            // } else {
            //   console.log("No such profile document!");
            //   // Fallback to basic info if profile doc doesn't exist
            //   setFullName(currentUser.displayName || currentUser.email?.split("@")[0] || "User Name");
            // }

            // Using data directly from currentUser for now as per your original component
            setFullName(
              currentUser.fullName ||
                currentUser.displayName ||
                currentUser.email?.split("@")[0] ||
                "User Name",
            );
            setMemberSince(formatDateFromTimestamp(currentUser.createdAt));
            setTimezone(currentUser.timezone || "N/A"); // Default or from currentUser
            setAiPreferences({
              role: currentUser.role || "Not set",
              tone: currentUser.tone || "Not set",
              platform: currentUser.platform || "Not set",
            });

            _accountInfoFetchedOnce = true; // Mark as fetched once this session
          } catch (error) {
            console.error("Error loading account info:", error);
            // setFeedbackMessage({ text: "Failed to load account info.", type: "error" }); // Using your existing message state
            setCopyMessage("Failed to load account info."); // Using the only message state
          } finally {
            setLoadingPageData(false); // Hide page loading state
          }
        };
        loadData();
      } else {
        // If already fetched this session, initialize states directly from currentUser
        setFullName(
          currentUser.fullName ||
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "User Name",
        );
        setMemberSince(formatDateFromTimestamp(currentUser.createdAt));
        setTimezone(currentUser.timezone || "N/A");
        setAiPreferences({
          role: currentUser.role || "Not set",
          tone: currentUser.tone || "Not set",
          platform: currentUser.platform || "Not set",
        });
        setLoadingPageData(false); // Ensure loader is hidden
      }
    } else if (!loadingAuth && !currentUser) {
      setLoadingPageData(false); // If no user, hide loader
    }
  }, [currentUser, loadingAuth, formatDateFromTimestamp]); // Dependencies

  const firstLetter = fullName
    ? fullName.charAt(0).toUpperCase()
    : currentUser?.email
      ? currentUser.email.charAt(0).toUpperCase()
      : "";

  // Skeleton Loader
  if (loadingAuth || loadingPageData) {
    return (
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 flex justify-center items-center p-4">
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-300/40 dark:border-white/10 rounded-xl shadow-lg p-8 max-w-sm w-full">
          <div className="animate-pulse space-y-4">
            {/* Avatar Placeholder */}
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700/40 rounded-full mx-auto"></div>

            {/* Title Placeholders */}
            <div className="space-y-2 mt-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700/40 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700/40 rounded w-1/2 mx-auto"></div>
            </div>

            {/* Content Placeholders */}
            <div className="space-y-3 mt-6">
              <div className="h-3 bg-gray-200 dark:bg-gray-700/40 rounded w-full"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700/40 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700/40 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback if no current user
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 flex justify-center items-center p-4">
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-300/40 dark:border-white/10 rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to view your account information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl w-full mx-auto ">
        {/* Header Section */}
        <div className="text-center mb-10 mt-3 ">
          <div className="relative inline-block mb-4">
            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-brand rounded-full flex items-center justify-center text-white text-4xl sm:text-5xl font-bold uppercase shadow-lg ring-4 ring-white dark:ring-gray-800">
              {firstLetter}
            </div>

            <div className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
              <span className="sr-only">Online</span>
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-6 mb-2 tracking-tight">
            Account Overview
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto"></p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-300/40 dark:border-white/10 rounded-xl p-6 shadow-lg overflow-hidden">
          {/* Personal Information */}
          <div className="p-4 sm:p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User size={24} className="text-gray-700 dark:text-gray-300" />
              Personal Information
            </h2>

            <div className="space-y-5">
              {/* Full Name */}
              <div className="group">
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-400">
                  <User
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />
                  Full Name
                </label>
                <div className="bg-white/70 dark:bg-black/40 backdrop-blur-md rounded-xl p-4 border border-gray-300/40 dark:border-white/10 shadow-md">
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {fullName}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="group">
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-400">
                  <Mail
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />
                  Email Address
                </label>
                <div className="bg-white/70 dark:bg-black/40 backdrop-blur-md rounded-xl p-4 border border-gray-300/40 dark:border-white/10 shadow-md">
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 break-all">
                    {currentUser?.email || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-t border-gray-300 dark:border-gray-700" />

          {/* Account History */}
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <CalendarDays
                size={24}
                className="text-gray-700 dark:text-gray-300"
              />
              Account History
            </h2>

            <div className="space-y-5">
              {/* Member Since */}
              <div className="group">
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-400">
                  <CalendarDays
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />
                  Member Since
                </label>
                <div className="bg-white/70 dark:bg-black/40 backdrop-blur-md rounded-xl p-4 border border-gray-300/40 dark:border-white/10 shadow-sm">
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {memberSince}
                  </p>
                </div>
              </div>

              {/* Timezone */}
              <div className="group">
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-400">
                  <Globe
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />
                  Current Timezone
                </label>
                <div className="bg-white/70 dark:bg-black/40 backdrop-blur-md rounded-xl p-4 border border-gray-300/40 dark:border-white/10 shadow-sm">
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {timezone}
                  </p>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-400 mt-2">
                  All content is aligned with your local timezone.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-t border-gray-200 dark:border-gray-700" />

          {/* AI Preferences */}
          <div className="p-6 sm:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Bot size={24} className="text-gray-700 dark:text-gray-300" />
              AI Content Preferences
            </h2>
            <p className="text-gray-700 dark:text-gray-400 text-sm mb-6">
              These preferences help our AI tailor content for you. Update them
              in{" "}
              <a
                href="/workspace/settings/preferences"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                AI Preferences
              </a>
              .
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {["role", "tone", "platform"].map((key) => (
                <div className="group" key={key}>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-400">
                    {key === "role" ? (
                      <Briefcase
                        size={16}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    ) : key === "tone" ? (
                      <MessageSquareText
                        size={16}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    ) : (
                      <Monitor
                        size={16}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    )}
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <div className="bg-white/70 dark:bg-black/40 backdrop-blur-md rounded-xl p-4 border border-gray-300/40 dark:border-white/10 shadow-sm">
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {aiPreferences[key]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-t border-gray-300 dark:border-white/10 my-6" />

          {/* User ID Section */}
          <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md p-6 sm:p-8 rounded-xl border border-gray-300/40 dark:border-white/10 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Fingerprint
                  size={24}
                  className="text-gray-700 dark:text-gray-300"
                />
                User ID
              </h2>
              <button
                onClick={() => setShowUID(!showUID)}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                {showUID ? "Hide User ID" : "Show User ID"}
              </button>
            </div>

            {showUID && (
              <div className="space-y-3 transition-all duration-300 ease-in-out">
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-400">
                  <Fingerprint
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />
                  Your Unique User Identifier
                </label>
                <div className="bg-white/70 dark:bg-black/70 backdrop-blur-md rounded-xl p-4 border border-gray-300/40 dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <span className="font-mono text-base sm:text-lg block text-gray-900 dark:text-gray-100">
                    {currentUser.uid}
                  </span>
                  <button
                    onClick={handleCopyUID}
                    disabled={isCopying || !currentUser?.uid}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium disabled:opacity-50"
                  >
                    {isCopying ? "Copying..." : "Copy"}
                  </button>
                </div>
                {copyMessage && (
                  <p
                    className={`text-xs mt-2 ${
                      copyMessage === "Copied!"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {copyMessage}
                  </p>
                )}
                <p className="text-xs text-gray-700 dark:text-gray-400 mt-2">
                  Do not share this User ID publicly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
