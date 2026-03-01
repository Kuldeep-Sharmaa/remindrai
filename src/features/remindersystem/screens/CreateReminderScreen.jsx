import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReminderForm from "../components/ReminderForm/ReminderForm";
import { useAuthContext } from "../../../context/AuthContext";
import ErrorBoundary from "../../../components/ErrorBoundary/ErrorBoundary";

export default function CreateReminderScreen() {
  const navigate = useNavigate();
  const { user, loading: isAuthLoading } = useAuthContext();

  const handleSettingsClick = useCallback(() => {
    navigate("/workspace/settings/preferences");
  }, [navigate]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [isAuthLoading, user, navigate]);

  // Development-only mount log
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[CreateReminderScreen] mounted", {
        pathname: window.location.pathname,
      });
    }
  }, []);

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-300 p-6">
        <div className="max-w-2xl w-full space-y-4">
          <div className="h-10 rounded bg-gray-200 dark:bg-gray-800 w-2/3 animate-pulse" />
          <div className="h-72 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="h-10 rounded bg-gray-200 dark:bg-gray-800 w-1/3 animate-pulse" />
        </div>
      </div>
    );
  }

  const initial = {
    prompt: "",
    platform: user?.platform || (user?.preferences?.platform ?? undefined),
    tone: user?.tone || user?.preferences?.tone,
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <ErrorBoundary>
          <ReminderForm
            initial={initial}
            onSuccess={() => navigate("/workspace/studio")}
            onOpenPreferences={handleSettingsClick}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}
