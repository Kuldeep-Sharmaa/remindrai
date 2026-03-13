import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { useAuthContext } from "../../../context/AuthContext";
import { showToast } from "../../../components/ToastSystem/toastUtils";
import SettingsSkeleton from "./SettingsSkeleton";
import {
  Loader2,
  CheckCircle,
  User,
  MessageCircle,
  Share2,
  ChevronDown,
  Check,
  Target,
  Mic,
  Globe,
} from "lucide-react";

const ROLES = [
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

const TONES = [
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

const PLATFORMS = [
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

const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  icon: Icon,
  placement = "down",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full p-4 bg-white dark:bg-bgDark border border-gray-200 dark:border-white/[0.08] rounded-xl text-left transition-colors duration-150 hover:border-gray-300 dark:hover:border-white/[0.15] disabled:opacity-50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon size={16} className="text-muted flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-textLight dark:text-textDark font-grotesk">
                {selected ? selected.name : placeholder}
              </p>
              {selected && (
                <p className="text-xs text-muted font-inter mt-0.5">
                  {selected.description}
                </p>
              )}
            </div>
          </div>
          <ChevronDown
            size={16}
            className={`text-muted flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute z-20 w-full bg-white dark:bg-bgImpact border border-gray-200 dark:border-white/[0.08] rounded-xl shadow-lg max-h-48 overflow-y-auto ${placement === "up" ? "bottom-full mb-2" : "top-full mt-2"}`}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange({
                    target: { name: label.toLowerCase(), value: option.value },
                  });
                  setIsOpen(false);
                }}
                className={`w-full p-3.5 text-left transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl
                  ${
                    value === option.value
                      ? "bg-brand/[0.06] dark:bg-brand/[0.1]"
                      : "hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium font-grotesk ${value === option.value ? "text-brand dark:text-brand-soft" : "text-textLight dark:text-textDark"}`}
                    >
                      {option.name}
                    </p>
                    <p className="text-xs text-muted font-inter mt-0.5">
                      {option.description}
                    </p>
                  </div>
                  {value === option.value && (
                    <Check
                      size={15}
                      className="text-brand dark:text-brand-soft flex-shrink-0"
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

const Preferences = () => {
  const { currentUser } = useAuthContext();
  const [preferences, setPreferences] = useState({
    role: "",
    tone: "",
    platform: "",
  });
  const [originalPreferences, setOriginalPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!currentUser?.uid || !db) return setLoading(false);
      setLoading(true);
      try {
        const snapshot = await getDoc(doc(db, "users", currentUser.uid));
        if (snapshot.exists()) {
          const data = snapshot.data();
          // Some users have these saved under preferences.{} from onboarding,
          // others have them at root from later saves — check both.
          const fetched = {
            role: data.role || data.preferences?.role || "",
            tone: data.tone || data.preferences?.tone || "",
            platform: data.platform || data.preferences?.platform || "",
          };
          setPreferences(fetched);
          setOriginalPreferences(fetched);
        }
      } catch {
        showToast({ type: "error", message: "Failed to load preferences." });
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => setPreferences(originalPreferences);

  const hasChanges =
    preferences.role !== originalPreferences.role ||
    preferences.tone !== originalPreferences.tone ||
    preferences.platform !== originalPreferences.platform;

  const handleSave = async () => {
    if (!currentUser?.uid || !hasChanges) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), preferences);
      showToast({ type: "success", message: "Preferences updated." });
      setOriginalPreferences(preferences);
    } catch {
      showToast({ type: "error", message: "Failed to update preferences." });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="py-4 max-w-2xl w-full mx-auto">
      <div className="bg-white dark:bg-bgDark border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden">
        {/* Professional Role */}
        <div className="px-5 py-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 mb-1">
            <Target
              size={15}
              className="text-textLight/80 dark:text-textDark/80"
            />
            <h3 className="text-xl font-semibold text-textLight dark:text-textDark font-grotesk">
              Professional Role
            </h3>
          </div>
          <p className="text-sm text-textLight/80 dark:text-textDark/80  font-inter mb-3">
            Choose your professional identity to tailor strategies
          </p>
          <Select
            label="Role"
            value={preferences.role}
            onChange={handleChange}
            options={ROLES}
            placeholder="Select your professional role"
            disabled={isSaving}
            icon={User}
          />
        </div>

        {/* Content Tone */}
        <div className="px-5 py-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 mb-1">
            <Mic
              size={15}
              className="text-textLight/80 dark:text-textDark/80 "
            />
            <h3 className="text-xl font-semibold text-textLight dark:text-textDark font-grotesk">
              Content Tone
            </h3>
          </div>
          <p className="text-sm text-textLight/80 dark:text-textDark/80  font-inter mb-3">
            Define your brand voice and communication style
          </p>
          <Select
            label="Tone"
            value={preferences.tone}
            onChange={handleChange}
            options={TONES}
            placeholder="Select your content tone"
            disabled={isSaving}
            icon={MessageCircle}
          />
        </div>

        {/* Primary Platform */}
        <div className="px-5 py-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 mb-1">
            <Globe
              size={15}
              className="text-textLight/80 dark:text-textDark/80"
            />
            <h3 className="text-xl font-semibold text-textLight dark:text-textDark font-grotesk">
              Primary Platform
            </h3>
          </div>
          <p className="text-sm text-textLight/80 dark:text-textDark/80  font-inter mb-3">
            Choose where you'll primarily share your content
          </p>
          <Select
            label="Platform"
            value={preferences.platform}
            onChange={handleChange}
            options={PLATFORMS}
            placeholder="Select your primary platform"
            disabled={isSaving}
            icon={Share2}
            placement="up"
          />
        </div>

        {/* Save / Cancel — lives inside the card */}
        <div className="px-5 py-4 bg-gray-50 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between gap-3">
            {hasChanges && (
              <span className="flex items-center gap-1.5 text-xs text-muted font-inter">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                Unsaved changes
              </span>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving || !hasChanges}
                className="px-4 py-2 text-sm font-medium font-grotesk text-textLight dark:text-textDark bg-gray-100 dark:bg-white/[0.06] rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.1] disabled:opacity-40 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="px-4 py-2 text-bs font-medium font-grotesk text-white bg-brand hover:bg-brand-hover rounded-lg disabled:opacity-40 flex items-center gap-2 transition-colors duration-150"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    Save
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
