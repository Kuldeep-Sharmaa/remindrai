import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { useAuthContext } from "../../../context/AuthContext";
import { showToast } from "../../../components/ToastSystem/toastUtils";
import SettingsSkeleton from "./SettingsSkeleton";
import { Bell, ShieldCheck } from "lucide-react";
const NOTIFICATIONS = [
  {
    id: "aiReminders",
    label: "Draft Ready Notifications",
    description:
      "Get notified when a new AI draft is prepared and ready to review.",
    Icon: Bell,
  },
  {
    id: "accountAlerts",
    label: "Account & Security Alerts",
    description:
      "Get notified about login activity, password changes, and security updates.",
    Icon: ShieldCheck,
  },
];

const NotificationPreferences = () => {
  const { currentUser } = useAuthContext();
  const [preferences, setPreferences] = useState({
    aiReminders: true,
    accountAlerts: true,
  });
  const [loading, setLoading] = useState(true);
  // Tracks which toggle is currently saving
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!currentUser?.uid) return setLoading(false);
      try {
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (docSnap.exists()) {
          const userPrefs = docSnap.data().notificationPreferences ?? {};
          setPreferences({
            aiReminders: userPrefs.aiReminders ?? true,
            accountAlerts: userPrefs.accountAlerts ?? true,
          });
        }
      } catch {
        showToast({ type: "error", message: "Failed to load preferences." });
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, [currentUser]);

  const handleToggle = async (key) => {
    if (savingKey) return; // Prevent overlapping saves
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    setSavingKey(key);
    try {
      // 2s minimum so the user sees the saving state
      await Promise.all([
        updateDoc(doc(db, "users", currentUser.uid), {
          notificationPreferences: updated,
        }),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
      showToast({ type: "success", message: "Preferences saved." });
    } catch {
      setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
      showToast({ type: "error", message: "Could not save. Try again." });
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="py-4 max-w-2xl w-full mx-auto">
      <section className="rounded-xl border border-gray-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-bgDark">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <h2 className="text-xl font-semibold font-grotesk text-textLight dark:text-textDark">
            Notifications
          </h2>
          <p className="text-sm text-muted font-inter mt-0.5">
            Choose what notifications you want to receive
          </p>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
          {NOTIFICATIONS.map(({ id, label, description, Icon }) => {
            const isSaving = savingKey === id;
            return (
              <div key={id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium font-grotesk text-textLight dark:text-textDark">
                    {label}
                  </p>
                  <p className="text-sm text-muted font-inter mt-0.5">
                    {description}
                  </p>
                </div>

                {/* Toggle with saving state */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {isSaving && (
                    <svg
                      className="w-4 h-4 text-muted animate-spin"
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
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                  )}
                  <label
                    className={`relative inline-flex items-center ${isSaving ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  >
                    <input
                      type="checkbox"
                      checked={preferences[id]}
                      onChange={() => handleToggle(id)}
                      disabled={!!savingKey}
                      className="sr-only peer"
                    />
                    <div
                      className="w-11 h-6 rounded-full bg-gray-200 dark:bg-white/[0.1]
                      peer-checked:bg-brand
                      transition-colors duration-200
                      after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                      after:w-5 after:h-5 after:bg-white after:rounded-full
                      after:shadow-sm after:transition-transform after:duration-200
                      peer-checked:after:translate-x-full"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default NotificationPreferences;
