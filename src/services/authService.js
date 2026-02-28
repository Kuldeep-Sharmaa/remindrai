// services/authService.js
//
// Handles all Firebase Auth operations and the Firestore user profile
// that lives alongside each auth account.
//
// What lives here:
//   signup, login, logout, sendPasswordReset, updateFirestoreProfile
//   plus some helpers for retrying flaky network calls and classifying errors.
//
// What does NOT live here:
//   Account deletion — that logic lives in AuthContext.deleteAccount
//   so it has direct access to the live firebaseUser object and React state.

import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Retries a flaky async operation with exponential backoff.
 * Won't retry on errors that are the user's fault (wrong password, bad email etc.)
 * since retrying those would just spam Firebase with the same bad request.
 */
const retryOperation = async (operation, maxAttempts = MAX_RETRY_ATTEMPTS) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const nonRetryableErrors = [
        "auth/user-not-found",
        "auth/wrong-password",
        "auth/invalid-email",
        "auth/user-disabled",
        "auth/email-already-in-use",
        "auth/weak-password",
        "auth/requires-recent-login",
      ];

      if (nonRetryableErrors.includes(error.code) || attempt === maxAttempts) {
        throw error;
      }

      // Wait longer between each retry — 1s, 2s, 4s
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt - 1)),
      );
      console.log(`Retrying operation, attempt ${attempt + 1}/${maxAttempts}`);
    }
  }
};

/**
 * Turns a raw Firebase error into something we can act on.
 * Returns a type, a user-facing message, and whether it's worth retrying.
 */
const classifyError = (error) => {
  const classification = {
    type: "UNKNOWN",
    userMessage: "An unexpected error occurred. Please try again.",
    shouldRetry: false,
  };

  switch (error.code) {
    case "auth/network-request-failed":
      classification.type = "NETWORK";
      classification.userMessage =
        "Network error. Please check your connection.";
      classification.shouldRetry = true;
      break;
    case "auth/too-many-requests":
      classification.type = "RATE_LIMIT";
      classification.userMessage = "Too many attempts. Please try again later.";
      break;
    case "auth/user-not-found":
    case "auth/wrong-password":
      classification.type = "INVALID_CREDENTIALS";
      classification.userMessage = "Invalid email or password.";
      break;
    case "auth/email-already-in-use":
      classification.type = "EMAIL_EXISTS";
      classification.userMessage = "An account with this email already exists.";
      break;
    case "auth/weak-password":
      classification.type = "WEAK_PASSWORD";
      classification.userMessage = "Password should be at least 6 characters.";
      break;
    case "auth/invalid-email":
      classification.type = "INVALID_EMAIL";
      classification.userMessage = "Please enter a valid email address.";
      break;
    case "auth/requires-recent-login":
      classification.type = "REAUTHENTICATION_REQUIRED";
      classification.userMessage =
        "For security, please log in again to delete your account.";
      break;
  }

  return classification;
};

/**
 * Creates a fresh Firestore profile for a new user, or updates login stats
 * for someone returning. Kept separate from signup/login so both can share it.
 *
 * New users get the full profile structure.
 * Returning users just get their login count bumped — nothing else touched.
 */
const createUserProfileDocument = async (userAuth, additionalData) => {
  if (!userAuth) return;

  const userDocRef = doc(db, "users", userAuth.uid);

  try {
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      // Brand new user — build the full profile from scratch
      const { email, uid } = userAuth;

      await setDoc(userDocRef, {
        uid,
        email,
        createdAt: serverTimestamp(),
        ...additionalData, // picks up { fullName } from signup

        onboardingComplete: false,
        isPro: false,

        // Set during onboarding, null until then
        role: null,
        platform: null,
        tone: null,

        notificationPreferences: {
          reminders: true,
          aiTips: true,
          automatedAlerts: true,
        },

        usage: {
          loginCount: 1,
          lastLoginAt: serverTimestamp(),
        },

        updatedAt: serverTimestamp(),
      });

      console.log("New user profile created");
    } else {
      // Returning user — just bump the login stats, leave everything else alone
      await setDoc(
        userDocRef,
        {
          usage: {
            lastLoginAt: serverTimestamp(),
            loginCount: increment(1),
          },
        },
        { merge: true },
      );

      console.log("Login stats updated for returning user");
    }
  } catch (error) {
    console.error("Error writing user profile:", error);
    throw error;
  }
};

/**
 * Creates a new account with email + password, writes the Firestore profile,
 * and sends a verification email. Throws a structured error object on failure
 * so SignupForm.jsx can switch on err.code directly.
 */
export const signup = async (email, password, fullName) => {
  try {
    const result = await retryOperation(async () => {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await createUserProfileDocument(user, { fullName });
      await sendEmailVerification(user);

      return { success: true, user };
    });

    console.log("Signup successful, verification email sent");
    return result;
  } catch (error) {
    console.error("Signup error:", error);
    const classification = classifyError(error);
    throw {
      success: false,
      error: error.message,
      code: error.code,
      classification,
    };
  }
};

/**
 * Logs in with email + password and updates the user's login stats in Firestore.
 * Throws a structured error object on failure — same shape as signup errors.
 */
export const login = async (email, password) => {
  try {
    const result = await retryOperation(async () => {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await createUserProfileDocument(user);

      return { success: true, user };
    });

    console.log("Login successful");
    return result;
  } catch (error) {
    console.error("Login error:", error);
    const classification = classifyError(error);
    throw {
      success: false,
      error: error.message,
      code: error.code,
      classification,
    };
  }
};

/**
 * Sends a password reset email. Nothing fancy — just wraps Firebase's
 * built-in method with retry logic and consistent error shape.
 */
export const sendPasswordReset = async (email) => {
  try {
    await retryOperation(() => sendPasswordResetEmail(auth, email));
    console.log("Password reset email sent");
    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    const classification = classifyError(error);
    throw {
      success: false,
      error: error.message,
      code: error.code,
      classification,
    };
  }
};

/**
 * Logs out the current user. Stamps a logout timestamp in Firestore first
 * so we have an accurate picture of last active time.
 */
export const logout = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        { "usage.lastLogoutAt": serverTimestamp() },
        { merge: true },
      );
    }

    await signOut(auth);
    console.log("User logged out");
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Updates any fields on the user's Firestore profile.
 * Always stamps updatedAt so we know when the profile last changed.
 */
export const updateFirestoreProfile = async (uid, data) => {
  if (!uid) {
    throw new Error("UID is required to update Firestore profile.");
  }

  const userDocRef = doc(db, "users", uid);

  try {
    await retryOperation(async () => {
      await setDoc(
        userDocRef,
        { ...data, updatedAt: serverTimestamp() },
        { merge: true },
      );
    });

    console.log("Profile updated for uid:", uid);
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    throw { success: false, error: error.message };
  }
};

/**
 * Forces a token refresh for the current user.
 * Useful after profile changes that affect custom claims.
 */
export const refreshUserToken = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await user.getIdToken(true);
      return { success: true };
    }
    return { success: false, error: "No authenticated user" };
  } catch (error) {
    console.error("Token refresh error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetches usage stats from the user's Firestore profile.
 * Handy for analytics dashboards without pulling the whole profile.
 */
export const getUserUsageStats = async (uid) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return { success: true, usage: docSnap.data().usage || {} };
    }

    return { success: false, error: "User not found" };
  } catch (error) {
    console.error("Error fetching usage stats:", error);
    return { success: false, error: error.message };
  }
};
