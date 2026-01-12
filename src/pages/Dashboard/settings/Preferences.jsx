import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { useAuthContext } from "../../../context/AuthContext";
import {
  Loader2,
  CheckCircle,
  XCircle,
  User,
  MessageCircle,
  Share2,
  ChevronDown,
  Check,
  Brain,
  Target,
  Mic,
  Globe,
} from "lucide-react";

const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full p-4 bg-white dark:bg-black border border-gray-200 dark:border-neutral-700 rounded-xl text-left transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-600 hover:shadow-sm focus:ring-2 focus:ring-neutral-400 disabled:opacity-50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-md">
              <Icon size={18} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-black dark:text-white">
                {selected ? selected.name : placeholder}
              </div>
              {selected && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {selected.description}
                </div>
              )}
            </div>
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-32 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange({
                    target: { name: label.toLowerCase(), value: option.value },
                  });
                  setIsOpen(false);
                }}
                className={`w-full p-3.5 text-left transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl ${
                  value === option.value
                    ? "bg-neutral-100 dark:bg-neutral-800"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div
                      className={`font-medium text-sm ${
                        value === option.value
                          ? "text-black dark:text-white"
                          : "text-gray-900 dark:text-gray-200"
                      }`}
                    >
                      {option.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {option.description}
                    </div>
                  </div>
                  {value === option.value && (
                    <Check
                      size={18}
                      className="text-black dark:text-white ml-2"
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Loading Component
const Loading = () => (
  <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-lg p-8 max-w-sm w-full">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative">
          <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
            <Loader2 className="animate-spin w-8 h-8 text-black dark:text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded-full animate-ping"></div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Loading Preferences
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Preparing your personalized settings...
          </p>
        </div>
      </div>
    </div>
  </div>
);

const Preferences = () => {
  const { currentUser } = useAuthContext();
  const [preferences, setPreferences] = useState({
    role: "",
    tone: "",
    platform: "",
  });
  const [originalPreferences, setOriginalPreferences] = useState({});
  const [loading, setLoading] = useState(true); // Changed to true to show loading initially
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Enhanced Data with better icons and descriptions (retained as is)
  const roles = [
    {
      value: "busy-founder",
      name: "Busy Founder",
      description: "Fast-paced founders needing consistent presence",
    },
    {
      value: "solopreneur",
      name: "Solopreneur",
      description: "Solo business owners building their brand",
    },
    {
      value: "career-builder",
      name: "Career Builder",
      description: "Professionals growing their personal brand",
    },
    {
      value: "content-creator",
      name: "Content Creator",
      description: "High-volume creators reducing burnout",
    },
  ];

  const tones = [
    {
      value: "professional",
      name: "Professional",
      description: "Clear, confident, and authoritative",
    },
    { value: "casual", name: "Casual", description: "Warm and conversational" },
    {
      value: "humorous",
      name: "Humorous",
      description: "Witty and charming content",
    },
    {
      value: "informative",
      name: "Informative",
      description: "Educational and straightforward",
    },
    {
      value: "inspirational",
      name: "Inspirational",
      description: "Uplifting and motivating",
    },
  ];

  const platforms = [
    {
      value: "linkedin",
      name: "LinkedIn",
      description: "Professional networking and B2B content",
    },
    {
      value: "twitter",
      name: "X (Twitter)",
      description: "Real-time updates and thought leadership",
    },
    {
      value: "facebook",
      name: "Facebook",
      description: "Community building and connections",
    },
    {
      value: "threads",
      name: "Threads",
      description: "Engaging conversations and updates",
    },
  ];

  // Fetch preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!currentUser?.uid || !db) {
        setLoading(false); // Stop loading if no user or db
        return;
      }

      setLoading(true);
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          const fetchedPreferences = {
            role: data.role || "",
            tone: data.tone || "",
            platform: data.platform || "",
          };
          setPreferences(fetchedPreferences);
          setOriginalPreferences(fetchedPreferences);
        } else {
          // Initialize with empty preferences if no existing data
          setPreferences({ role: "", tone: "", platform: "" });
          setOriginalPreferences({ role: "", tone: "", platform: "" });
        }
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
        setMessage({
          type: "error",
          text: "Failed to load preferences. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [currentUser, db]);

  // Handle changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
    setMessage(null); // Clear message on any change
  };

  // Check for changes
  const hasChanges =
    preferences.role !== originalPreferences.role ||
    preferences.tone !== originalPreferences.tone ||
    preferences.platform !== originalPreferences.platform;

  // Save preferences
  const handleSave = async () => {
    if (!currentUser?.uid || !hasChanges) return; // Prevent saving if no changes or no user

    setIsSaving(true);
    setMessage(null); // Clear previous message before saving
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, preferences);

      setMessage({
        type: "success",
        text: "Preferences updated successfully!",
      });
      setOriginalPreferences(preferences);
    } catch (error) {
      console.error("Failed to update preferences:", error);
      setMessage({
        type: "error",
        text: "Failed to update preferences. Please try again.",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 6000); // Clear success/error message after 6 seconds
    }
  };

  // Cancel changes
  const handleCancel = () => {
    setPreferences(originalPreferences);
    setMessage(null); // Clear message on cancel
  };

  if (!currentUser || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen  py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Notification */}
        {message && (
          <div className="mb-6">
            <div
              className={`p-4 rounded-xl border shadow-sm text-center ${
                message.type === "success"
                  ? "bg-gray-50 dark:bg-gray-900 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                  : "bg-gray-50 dark:bg-gray-900 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
              }`}
            >
              <div className="flex justify-center items-center space-x-2">
                {message.type === "success" ? (
                  <CheckCircle
                    size={18}
                    className="text-green-600 dark:text-green-400"
                  />
                ) : (
                  <XCircle
                    size={18}
                    className="text-red-600 dark:text-red-400"
                  />
                )}
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Card */}
        <section className="bg-white dark:bg-black rounded-2xl shadow-lg border border-gray-200 dark:border-neutral-800 p-6 sm:p-8">
          <div className="space-y-6">
            {/* Professional Role */}
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <Target className="w-5 h-5 text-black dark:text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    Professional Role
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose your professional identity to tailor strategies
                  </p>
                </div>
              </div>
              <Select
                label="Role"
                value={preferences.role}
                onChange={handleChange}
                options={roles}
                placeholder="Select your professional role"
                disabled={isSaving}
                icon={User}
              />
            </div>

            {/* Content Tone */}
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <Mic className="w-5 h-5 text-black dark:text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    Content Tone
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Define your brand voice and communication style
                  </p>
                </div>
              </div>
              <Select
                label="Tone"
                value={preferences.tone}
                onChange={handleChange}
                options={tones}
                placeholder="Select your content tone"
                disabled={isSaving}
                icon={MessageCircle}
              />
            </div>

            {/* Primary Platform */}
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <Globe className="w-5 h-5 text-black dark:text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    Primary Platform
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose where you'll primarily share your content
                  </p>
                </div>
              </div>
              <Select
                label="Platform"
                value={preferences.platform}
                onChange={handleChange}
                options={platforms}
                placeholder="Select your primary platform"
                disabled={isSaving}
                icon={Share2}
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-8">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-gray-200 dark:border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              {hasChanges && (
                <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  Unsaved changes
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCancel}
                disabled={isSaving || !hasChanges}
                className="flex-1 px-6 py-3 text-sm font-semibold text-black dark:text-white bg-gray-100 dark:bg-neutral-800 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-40 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-black dark:bg-white dark:text-black rounded-xl hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Save Preferences</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
