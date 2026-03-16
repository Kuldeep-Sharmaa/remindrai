/**
 * useFCMForeground.js
 *
 * Handles push notifications when the user is already inside the app.
 * The service worker handles background — this handles foreground.
 *
 * When a draft is ready and the user is on the dashboard, we show
 * a toast instead of a native browser notification. Keeps the experience
 * clean and consistent with the rest of the UI.
 */

import { useEffect } from "react";
import { getMessaging, onMessage, isSupported } from "firebase/messaging";
import app from "../services/firebase";
import { showToast } from "../components/ToastSystem/toastUtils";
import { useAuthContext } from "../context/AuthContext";

export function useFCMForeground() {
  const { currentUser } = useAuthContext();

  useEffect(() => {
    if (!currentUser?.uid) return;

    let unsubscribe = null;

    const setupListener = async () => {
      try {
        const supported = await isSupported();
        if (!supported) return;

        const messaging = getMessaging(app);

        // Listen for incoming messages while the app is open.
        // This fires instead of the service worker when the tab is focused.
        // We read from payload.data — not payload.notification — because we
        // send data-only payloads to prevent duplicate notifications.
        unsubscribe = onMessage(messaging, (payload) => {
          const title = payload.data?.title ?? "RemindrAI";
          const body = payload.data?.body ?? "You have a new notification.";

          showToast({
            type: "success",
            message: `${title} — ${body}`,
          });
        });
      } catch (error) {
        console.error("[useFCMForeground] Failed to set up listener", error);
      }
    };

    setupListener();

    // Clean up the listener when the user logs out or component unmounts
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.uid]);
}
