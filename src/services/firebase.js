// src/services/firebase.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// ✅ Firebase config loaded securely from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ✅ Prevent re-initialization during hot reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Initialize Firebase core services
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ (Optional) Analytics only in supported browsers & production
export let analytics = null;
if (import.meta.env.MODE === "production") {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
}

// ✅ Log project info in development for debugging
if (import.meta.env.DEV) {
  console.log(`🔥 Firebase initialized → Project: ${firebaseConfig.projectId}`);
}

export default app;
