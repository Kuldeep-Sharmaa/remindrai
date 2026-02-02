/**
 * Firebase SDK initialization for RemindrAI frontend.
 * Supports both production and local emulator environments.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Prevent re-initialization during HMR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Core Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Emulator connection (explicit opt-in only)
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true";

if (useEmulator) {
  console.log("🧪 Connected to Firebase emulators");
  connectAuthEmulator(auth, "http://localhost:9099", {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, "localhost", 8081);
} else {
  console.log("🔥 Connected to Firebase production");
}

// Analytics (production only)
export let analytics = null;

if (import.meta.env.MODE === "production") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

console.log(`Firebase initialized: ${firebaseConfig.projectId}`);

export default app;
