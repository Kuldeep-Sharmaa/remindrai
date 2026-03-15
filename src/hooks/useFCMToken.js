/**
 * useFCMToken.js
 *
 * Registers the current device for push notifications.
 * Runs once when the user lands in the workspace.
 *
 * Each browser gets a stable UUID in localStorage so we always write
 * to the same Firestore document even if the FCM token rotates.
 * Token rotation is handled automatically — we just overwrite on mount.
 */

import { useEffect } from "react";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import app, { db } from "../services/firebase";
import { useAuthContext } from "../context/AuthContext";

const DEVICE_ID_KEY = "remindrai_device_id";

// Generate once, reuse forever — this ties a browser to a single device document
function getOrCreateDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function getPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  return "web";
}

export function useFCMToken() {
  const { currentUser } = useAuthContext();

  useEffect(() => {
    if (!currentUser?.uid) return;

    const register = async () => {
      try {
        // Check support first — FCM doesn't work in all browsers
        const supported = await isSupported();
        if (!supported) {
          console.log(
            "[useFCMToken] FCM not supported in this browser, skipping",
          );
          return;
        }

        // Guard browser-only API
        if (!("Notification" in window)) return;

        // No point prompting if the user already said no
        if (Notification.permission === "denied") return;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("[useFCMToken] Permission not granted, skipping");
          return;
        }

        // Call getMessaging(app) directly here — avoids the race condition
        // where the exported messaging instance from firebase.js might still
        // be null when this hook runs (it's set inside an async .then())
        const messaging = getMessaging(app);

        // Explicitly pass our service worker to getToken so FCM doesn't
        // register its own at a different path and cause conflicts
        const registration = await navigator.serviceWorker.getRegistration(
          "/firebase-messaging-sw.js",
        );

        if (!registration) {
          console.warn("[useFCMToken] Service worker not found, skipping");
          return;
        }

        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (!token) {
          console.warn("[useFCMToken] No token returned from FCM");
          return;
        }

        const deviceId = getOrCreateDeviceId();

        // Overwrite on every mount so stale tokens never build up
        await setDoc(doc(db, "users", currentUser.uid, "devices", deviceId), {
          token,
          platform: getPlatform(),
          createdAt: serverTimestamp(),
        });

        console.log("[useFCMToken] Device registered successfully", {
          deviceId,
          platform: getPlatform(),
        });
      } catch (error) {
        // Registration failing is not critical — the app works fine without it
        console.error("[useFCMToken] Failed to register device", error);
      }
    };

    register();
  }, [currentUser?.uid]);
}
