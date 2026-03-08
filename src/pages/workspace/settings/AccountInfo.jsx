import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import SettingsSkeleton from "./SettingsSkeleton";
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
} from "lucide-react";

// Keeps the fetch from firing again if user navigates away and back
let _accountInfoFetchedOnce = false;

const AccountInfo = () => {
  const {
    currentUser,
    loading: loadingAuth,
    formatDateFromTimestamp,
  } = useAuthContext();

  const [loadingPageData, setLoadingPageData] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const [fullName, setFullName] = useState("");
  const [memberSince, setMemberSince] = useState("N/A");
  const [timezone, setTimezone] = useState("N/A");
  const [aiPreferences, setAiPreferences] = useState({
    role: "Not set",
    tone: "Not set",
    platform: "Not set",
  });
  const [showUID, setShowUID] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  const handleCopyUID = async () => {
    if (!currentUser?.uid) {
      setCopyMessage("No UID to copy.");
      setTimeout(() => setCopyMessage(""), 2000);
      return;
    }
    setIsCopying(true);
    setCopyMessage("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const textarea = document.createElement("textarea");
      textarea.value = currentUser.uid;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopyMessage("Copied!");
    } catch {
      setCopyMessage("Failed to copy.");
    } finally {
      setIsCopying(false);
      setTimeout(() => setCopyMessage(""), 3000);
    }
  };

  useEffect(() => {
    if (!loadingAuth && currentUser) {
      if (!_accountInfoFetchedOnce) {
        setLoadingPageData(true);
        const loadData = async () => {
          try {
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
            _accountInfoFetchedOnce = true;
          } catch {
            setCopyMessage("Failed to load account info.");
          } finally {
            setLoadingPageData(false);
          }
        };
        loadData();
      } else {
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
        setLoadingPageData(false);
      }
    } else if (!loadingAuth && !currentUser) {
      setLoadingPageData(false);
    }
  }, [currentUser, loadingAuth, formatDateFromTimestamp]);

  const firstLetter = fullName
    ? fullName.charAt(0).toUpperCase()
    : currentUser?.email?.charAt(0).toUpperCase() || "";

  if (loadingAuth || loadingPageData) return <SettingsSkeleton />;

  if (!currentUser) {
    return (
      <div className="py-4">
        <div className="rounded-xl border border-gray-200 dark:border-white/[0.08] px-5 py-8 text-center">
          <p className="text-sm text-muted font-inter">
            Please sign in to view your account information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 max-w-2xl w-full mx-auto">
      {/* Avatar + title */}
      <div className="text-center mb-8 mt-2">
        <div className="relative inline-block mb-4">
          <div className="w-28 h-28 sm:w-32 sm:h-32 bg-brand rounded-full flex items-center justify-center text-white text-4xl sm:text-5xl font-bold uppercase shadow-lg ring-4 ring-white dark:ring-black">
            {firstLetter}
          </div>
          <div className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white dark:border-black flex items-center justify-center">
            <span className="sr-only">Online</span>
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-textLight dark:text-textDark mt-6 mb-2 tracking-tight font-grotesk">
          Account Overview
        </h1>
      </div>

      {/* Main card */}
      <div className="bg-white dark:bg-bgDark border border-gray-200 dark:border-white/[0.08] rounded-xl shadow-sm overflow-hidden">
        {/* Personal Information */}
        <div className="p-5 sm:p-8 space-y-5">
          <h2 className="text-xl font-bold text-textLight dark:text-textDark font-grotesk flex items-center gap-2">
            <User size={22} className="text-muted" />
            Personal Information
          </h2>

          {/* Full name */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 text-muted font-inter">
              <User size={14} />
              Full Name
            </label>
            <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4 border border-gray-200 dark:border-white/[0.08]">
              <p className="text-base font-semibold text-textLight dark:text-textDark font-inter">
                {fullName}
              </p>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 text-muted font-inter">
              <Mail size={14} />
              Email Address
            </label>
            <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4 border border-gray-200 dark:border-white/[0.08]">
              <p className="text-base font-semibold text-textLight dark:text-textDark font-inter break-all">
                {currentUser?.email || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-white/[0.08]" />

        {/* Account History */}
        <div className="p-5 sm:p-8 space-y-5">
          <h2 className="text-xl font-bold text-textLight dark:text-textDark font-grotesk flex items-center gap-2">
            <CalendarDays size={22} className="text-muted" />
            Account History
          </h2>

          {/* Member since */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 text-muted font-inter">
              <CalendarDays size={14} />
              Member Since
            </label>
            <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4 border border-gray-200 dark:border-white/[0.08]">
              <p className="text-base font-semibold text-textLight dark:text-textDark font-inter">
                {memberSince}
              </p>
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 text-muted font-inter">
              <Globe size={14} />
              Current Timezone
            </label>
            <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4 border border-gray-200 dark:border-white/[0.08]">
              <p className="text-base font-semibold text-textLight dark:text-textDark font-inter">
                {timezone}
              </p>
            </div>
            <p className="text-xs text-muted font-inter mt-2">
              All content is aligned with your local timezone.
            </p>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-white/[0.08]" />

        {/* AI Preferences */}
        <div className="p-5 sm:p-8 space-y-5 mb-2">
          <h2 className="text-xl font-bold text-textLight dark:text-textDark font-grotesk flex items-center gap-2">
            <Bot size={22} className="text-muted" />
            AI Content Preferences
          </h2>
          <p className="text-sm text-muted font-inter -mt-2">
            These preferences help our AI tailor content for you. Update them in{" "}
            <a
              href="/workspace/settings/preferences"
              className="text-brand dark:text-brand-soft hover:underline"
            >
              AI Preferences
            </a>
            .
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: "role", label: "Role", Icon: Briefcase },
              { key: "tone", label: "Tone", Icon: MessageSquareText },
              { key: "platform", label: "Platform", Icon: Monitor },
            ].map(({ key, label, Icon }) => (
              <div key={key}>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 text-muted font-inter">
                  <Icon size={14} />
                  {label}
                </label>
                <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4 border border-gray-200 dark:border-white/[0.08]">
                  <p className="text-base font-semibold text-textLight dark:text-textDark font-inter">
                    {aiPreferences[key]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-gray-200 dark:border-white/[0.08]" />

        {/* User ID */}
        <div className="p-5 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-textLight dark:text-textDark font-grotesk flex items-center gap-2">
              <Fingerprint size={22} className="text-muted" />
              User ID
            </h2>
            <button
              onClick={() => setShowUID(!showUID)}
              className="text-sm text-brand dark:text-brand-soft hover:underline font-inter"
            >
              {showUID ? "Hide User ID" : "Show User ID"}
            </button>
          </div>

          {showUID && (
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 text-muted font-inter">
                <Fingerprint size={14} />
                Your Unique User Identifier
              </label>
              <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4 border border-gray-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="font-mono text-sm text-textLight dark:text-textDark break-all">
                  {currentUser.uid}
                </span>
                <button
                  onClick={handleCopyUID}
                  disabled={isCopying || !currentUser?.uid}
                  className="text-sm text-brand dark:text-brand-soft hover:underline font-inter disabled:opacity-50 flex-shrink-0"
                >
                  {isCopying ? "Copying..." : "Copy"}
                </button>
              </div>
              {copyMessage && (
                <p
                  className={`text-xs font-inter ${copyMessage === "Copied" ? "text-green-500" : "text-red-500"}`}
                >
                  {copyMessage}
                </p>
              )}
              <p className="text-xs text-muted font-inter">
                Do not share this User ID publicly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
