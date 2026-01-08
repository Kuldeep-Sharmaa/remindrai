import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { useAuthContext } from "../../../context/AuthContext";

const NotificationPreferences = () => {
  const { currentUser } = useAuthContext();
  const [preferences, setPreferences] = useState({
    aiReminders: true,
    aiTips: false,
    accountAlerts: true,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!currentUser?.uid) return setLoading(false);

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const userPrefs = data.notificationPreferences ?? {};
          setPreferences({
            aiReminders: userPrefs.aiReminders ?? true,
            aiTips: userPrefs.aiTips ?? false,
            accountAlerts: userPrefs.accountAlerts ?? true,
          });
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
        setMessage("❌ Failed to load preferences.");
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, [currentUser]);

  const handleToggle = async (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        notificationPreferences: updated,
      });
      setMessage("✅ Preferences updated!");
    } catch (error) {
      console.error("Update error:", error);
      setMessage("❌ Could not save. Try again.");
      setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    setTimeout(() => setMessage(""), 3000);
  };

  // ✅ Fixed toggle with working Tailwind peer styles
  const renderToggle = (id, label, description) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex-1 pr-4">
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
      <label className="inline-flex relative items-center cursor-pointer">
        <input
          type="checkbox"
          checked={preferences[id]}
          onChange={() => handleToggle(id)}
          className="sr-only peer"
        />
        <div
          className="w-11 h-6 bg-gray-300 rounded-full dark:bg-gray-700 
             peer-checked:bg-green-500 transition-colors duration-300 
             peer-focus:ring-2 peer-focus:ring-green-400 
             after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
             after:w-5 after:h-5 after:bg-white dark:after:bg-gray-200 
             after:rounded-full after:shadow-md after:transition-transform after:duration-300 
             peer-checked:after:translate-x-full"
        ></div>
      </label>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md max-w-2xl mx-auto text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          Loading preferences...
        </p>
      </div>
    );
  }

  return (
    <div
      className="p-6 sm:p-8 w-full max-w-2xl mx-auto rounded-2xl shadow-lg 
         bg-white dark:bg-black border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        Notification Preferences
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
        Choose what notifications you want to receive from RemindrAI.
      </p>

      {renderToggle(
        "aiReminders",
        "AI Reminders",
        "Get reminders for posting schedules and missed posts."
      )}
      {renderToggle(
        "aiTips",
        "Smart AI Tips",
        "Receive occasional helpful tips to improve your strategy."
      )}
      {renderToggle(
        "accountAlerts",
        "Account & Security Alerts",
        "Get login activity, password change, and security alerts."
      )}

      {message && (
        <p
          className={`mt-4 text-sm font-medium ${
            message.startsWith("✅")
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default NotificationPreferences;
