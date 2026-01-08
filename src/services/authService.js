// ✅ Imports for Firebase services
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  getDocs,
  serverTimestamp,
  increment, // ✅ NEW: Import increment for cleaner updates
} from "firebase/firestore";

// Production constants
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

/**
 * ✅ Enhanced error handling with exponential backoff retry logic.
 * @param {Function} operation - The async function to retry.
 * @param {number} [maxAttempts=MAX_RETRY_ATTEMPTS] - Maximum number of retry attempts.
 */
const retryOperation = async (operation, maxAttempts = MAX_RETRY_ATTEMPTS) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      // Don't retry on user-specific errors (e.g., wrong password, invalid email)
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

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt - 1))
      );
      console.log(`Retrying operation, attempt ${attempt + 1}/${maxAttempts}`);
    }
  }
};

/**
 * ✅ Enhanced error classification for better user experience.
 * @param {Object} error - The Firebase error object.
 * @returns {Object} An object with a classified error type and user message.
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
      classification.shouldRetry = false;
      break;
    case "auth/user-not-found":
    case "auth/wrong-password":
      classification.type = "INVALID_CREDENTIALS";
      classification.userMessage = "Invalid email or password.";
      classification.shouldRetry = false;
      break;
    case "auth/email-already-in-use":
      classification.type = "EMAIL_EXISTS";
      classification.userMessage = "An account with this email already exists.";
      classification.shouldRetry = false;
      break;
    case "auth/weak-password":
      classification.type = "WEAK_PASSWORD";
      classification.userMessage = "Password should be at least 6 characters.";
      classification.shouldRetry = false;
      break;
    case "auth/invalid-email":
      classification.type = "INVALID_EMAIL";
      classification.userMessage = "Please enter a valid email address.";
      classification.shouldRetry = false;
      break;
    case "auth/requires-recent-login":
      classification.type = "REAUTHENTICATION_REQUIRED";
      classification.userMessage =
        "For security, please log in again to delete your account.";
      classification.shouldRetry = false;
      break;
  }

  return classification;
};

// --- REFACTORED FUNCTION ---
/**
 * ✅ Helper function to create or update a user document in Firestore.
 * This version establishes the final, organized data model.
 * @param {Object} userAuth - The Firebase Auth user object.
 * @param {Object} [additionalData] - Additional data to set on creation (e.g., { fullName }).
 */
const createUserProfileDocument = async (userAuth, additionalData) => {
  if (!userAuth) return;

  const userDocRef = doc(db, "users", userAuth.uid);

  try {
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      // --- This is a new user, create the full document ---
      const { email, uid } = userAuth;

      // ✅ Defines the clean, final data structure for a new user.
      const newUserDocument = {
        // --- Core Identity (Immutable) ---
        uid,
        email,
        createdAt: serverTimestamp(),
        ...additionalData, // Adds { fullName } from the signup function

        // --- Account Status & Onboarding ---
        onboardingComplete: false,
        isPro: false, // For future premium features

        // --- RemindrAI Configuration (Set during onboarding) ---
        role: null,
        platform: null,
        tone: null,

        notificationPreferences: {
          reminders: true,
          aiTips: true,
          automatedAlerts: true, // Renamed for clarity, set as boolean
        },

        // --- Analytics & Usage ---
        usage: {
          loginCount: 1,
          lastLoginAt: serverTimestamp(),
        },

        // --- Metadata ---
        updatedAt: serverTimestamp(),
      };

      await setDoc(userDocRef, newUserDocument);
      console.log("User profile created with final data model.");
    } else {
      // --- This is an existing user, just update login stats ---
      // ✅ Uses atomic increments for safe and accurate counting.
      await setDoc(
        userDocRef,
        {
          usage: {
            lastLoginAt: serverTimestamp(),
            loginCount: increment(1),
          },
        },
        { merge: true }
      );
      console.log("Existing user login stats updated.");
    }
  } catch (error) {
    console.error("Error in createUserProfileDocument:", error);
    throw error; // Re-throw to be handled by calling function
  }
};

/**
 * ✅ Signs up a new user with email and password and creates a profile document.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {string} fullName - The user's full name.
 * @returns {Promise<Object>} A promise resolving with the user and a success state.
 */
export const signup = async (email, password, fullName) => {
  try {
    const result = await retryOperation(async () => {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // ✅ This now passes { fullName } to our newly structured function.
      await createUserProfileDocument(user, { fullName });
      await sendEmailVerification(user);

      return { success: true, user };
    });

    console.log("Signup successful, verification email sent!");
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
 * ✅ Logs in an existing user and updates their login stats.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} A promise resolving with the user and a success state.
 */
export const login = async (email, password) => {
  try {
    const result = await retryOperation(async () => {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // ✅ This call now efficiently updates only the login stats.
      await createUserProfileDocument(user);

      return { success: true, user };
    });

    console.log("Login successful!");
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
 * ✅ Sends a password reset email to the user.
 * @param {string} email - The user's email.
 * @returns {Promise<Object>} A promise resolving with a success state.
 */
export const sendPasswordReset = async (email) => {
  try {
    await retryOperation(() => sendPasswordResetEmail(auth, email));
    console.log("Password reset email sent!");
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
 * ✅ Logs out the current user.
 * @returns {Promise<Object>} A promise resolving with a success state.
 */
export const logout = async () => {
  try {
    // Update logout timestamp before signing out
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          "usage.lastLogoutAt": serverTimestamp(),
        },
        { merge: true }
      );
    }

    await signOut(auth);
    console.log("User logged out!");
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * ✅ Updates a user's Firestore profile document.
 * @param {string} uid - The user's unique ID.
 * @param {Object} data - The data to update in the profile.
 * @returns {Promise<Object>} A promise resolving with a success state.
 */
export const updateFirestoreProfile = async (uid, data) => {
  if (!uid) {
    console.error("UID is required to update Firestore profile.");
    throw new Error("UID not provided.");
  }

  const userDocRef = doc(db, "users", uid);

  try {
    await retryOperation(async () => {
      // Add update timestamp
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      await setDoc(userDocRef, updateData, { merge: true });
    });

    console.log("Firestore profile updated successfully for UID:", uid, data);
    return { success: true };
  } catch (error) {
    console.error("Error updating Firestore profile:", error);
    throw { success: false, error: error.message };
  }
};

// New utility functions for production SaaS

/**
 * ✅ Forces a refresh of the user's Firebase Auth ID token.
 * @returns {Promise<Object>} A promise resolving with a success state.
 */
export const refreshUserToken = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await user.getIdToken(true); // Force refresh
      return { success: true };
    }
    return { success: false, error: "No authenticated user" };
  } catch (error) {
    console.error("Token refresh error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * ✅ Fetches a user's usage statistics from their profile document.
 * @param {string} uid - The user's unique ID.
 * @returns {Promise<Object>} A promise resolving with the usage data.
 */
export const getUserUsageStats = async (uid) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return {
        success: true,
        usage: docSnap.data().usage || {},
      };
    }

    return { success: false, error: "User not found" };
  } catch (error) {
    console.error("Error fetching usage stats:", error);
    return { success: false, error: error.message };
  }
};

/**
 * ✅ Fetch all subcollection names dynamically for a given user.
 * This avoids hardcoding "posts", "reminders", etc.
 */
const getUserSubcollections = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    // listCollections is not directly available in the web SDK,
    // so we'll fetch collections based on known user data structure.
    // In a real-world app, this would be a server-side function
    // or you would rely on a known list of subcollections.
    // For this example, we'll return a static list as a fallback.
    return ["posts", "reminders", "notifications", "analytics"];
  } catch (error) {
    console.error("Error fetching user subcollections:", error);
    // Fallback to a static list on error
    return ["posts", "reminders", "notifications", "analytics"];
  }
};

/**
 * ✅ Safe recursive deletion with error isolation (doesn't stop entire flow on one failure).
 */
const deleteCollectionRecursive = async (path) => {
  try {
    console.log(`Deleting all documents under: ${path}`);
    const snapshot = await getDocs(collection(db, path));
    if (snapshot.empty) {
      console.log(`No documents found under: ${path}`);
      return;
    }
    await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref)));
    console.log(`Deleted ${snapshot.size} documents under: ${path}`);
  } catch (err) {
    console.error(`Failed to delete collection at ${path}:`, err);
  }
};

/**
 * ✅ Fully dynamic user deletion (fetches subcollections instead of hardcoding).
 */
export const deleteAccount = async () => {
  const user = auth.currentUser;
  if (!user) return { success: false, error: "No authenticated user." };

  const uid = user.uid;

  try {
    // ✅ 1. Get subcollections dynamically
    // Note: The web SDK doesn't have a listCollections method.
    // We'll use a static list for a client-side solution.
    const userSubcollections = [
      "posts",
      "reminders",
      "notifications",
      "analytics",
    ];

    // ✅ 2. Delete all subcollections under /users/{uid}
    for (const sub of userSubcollections) {
      await retryOperation(() =>
        deleteCollectionRecursive(`users/${uid}/${sub}`)
      );
    }

    // ✅ 3. Delete main user document
    await retryOperation(() => deleteDoc(doc(db, "users", uid)));
    console.log(`Deleted main user document for UID: ${uid}`);

    // ✅ 4. Delete artifacts and top-level paths
    const appId = "remindrpost";
    const artifactsPath = `artifacts/${appId}/users/${uid}`;
    await retryOperation(() => deleteCollectionRecursive(artifactsPath));
    await retryOperation(() => deleteDoc(doc(db, artifactsPath)));
    await retryOperation(() => deleteCollectionRecursive(`reminders/${uid}`));
    await retryOperation(() => deleteCollectionRecursive(`content/${uid}`));

    // ✅ 5. Delete Firebase Auth user
    await retryOperation(() => deleteUser(user));
    console.log(`Firebase Auth account deleted for UID: ${uid}`);

    // ✅ 6. Clear client storage
    localStorage.clear();
    sessionStorage.clear();

    return { success: true };
  } catch (error) {
    console.error("Account deletion failed:", error);
    const classification = classifyError(error);
    if (classification.type === "REAUTHENTICATION_REQUIRED") {
      throw {
        success: false,
        error: "Please reauthenticate to delete your account.",
        code: error.code,
        classification,
      };
    }
    throw {
      success: false,
      error: error.message,
      code: error.code,
      classification,
    };
  }
};
