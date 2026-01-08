import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReminderForm from "../components/ReminderForm/ReminderForm";
import { useAuthContext } from "../../../context/AuthContext";
import ErrorBoundary from "../../../components/ErrorBoundary/ErrorBoundary";

/**
 * CreateReminderScreen
 *
 * - Verifies auth state before rendering the ReminderForm.
 * - Uses an effect for redirect to avoid navigate during render.
 * - Passes a centralized onOpenPreferences handler to the ReminderForm.
 */
export default function CreateReminderScreen() {
  const navigate = useNavigate();
  const { user, loading: isAuthLoading } = useAuthContext();

  // Centralized settings/navigation handler (passed into ReminderForm)
  const handleSettingsClick = useCallback(() => {
    navigate("/dashboard/settings/preferences");
  }, [navigate]);

  // Safely redirect unauthenticated users after auth state resolves
  useEffect(() => {
    if (!isAuthLoading && !user) {
      // If user is not logged in, send them to login page
      // replace: true to avoid back-navigation to this protected page
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

  // Show a friendly loading state while auth is resolving
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

  // By this point, user exists and we can render the form
  // Optionally pass a small `initial` object to prefill form fields from user profile
  const initial = {
    // only pass fields you want prefilled. Keep it minimal and safe.
    prompt: "",
    platform: user?.platform || (user?.preferences?.platform ?? undefined),
    tone: user?.tone || user?.preferences?.tone,
    // frequency or schedule could also be provided if you want a smart default
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <ErrorBoundary>
          <ReminderForm
            initial={initial}
            onSuccess={() => navigate("/dashboard/studio")}
            onOpenPreferences={handleSettingsClick}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}
