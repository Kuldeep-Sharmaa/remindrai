// ============================================================================
// AUTH CONTEXT (production-ready with comprehensive fixes)
// - Handles auth state, user profile sync, timezone queue flushing,
//   pending-device-timezone staging (modal), accept/decline flows,
//   timezone queue for offline, and centralized reminders pipeline.
// - Defensive, with safe cleanup and minimal risk of infinite loops.
// - All critical fixes applied for race conditions and edge cases.
// ============================================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";

// Firebase Auth + Firestore
import { auth, db } from "../services/firebase";
import { onAuthStateChanged, deleteUser } from "firebase/auth";
import {
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// Custom Hooks & Services
import {
  signup as authServiceSignup,
  login as authServiceLogin,
  logout as authServiceLogout,
  updateFirestoreProfile,
} from "../services/authService";

// Reminders pipeline (centralized hook)
import useUserReminders from "../features/remindersystem/hooks/useUserReminders";

// Timezone sync hook
import useTimezoneSync from "../hooks/useTimezoneSync";
import { clearAllDeclinedForUser } from "./timezoneStorage";

/**
 * @typedef {Object} UserProfile
 * @property {string} uid
 * @property {string} [email]
 * @property {boolean} [emailVerified]
 * @property {string} [fullName]
 * @property {boolean} [onboardingComplete]
 * @property {boolean} [isFirstLoginSession]
 * @property {string} [timezone]
 * @property {boolean} [isAutoTimezone]
 * @property {Object} [preferences]
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {import("firebase/auth").User | null} firebaseUser
 * @property {UserProfile | null} user
 * @property {boolean} loading
 * @property {boolean} hasLoadedProfile
 * @property {boolean} isAccountDeleting
 * @property {boolean} isUserLoggingOut
 * @property {string | null} detectedTimezone
 * @property {boolean} isTimezoneStable
 * @property {string | null} pendingDeviceTimezone
 * @property {string | null} pendingOriginalTimezone
 * @property {Function} stageDeviceTimezone
 * @property {Function} declineDeviceTimezone
 * @property {Function} acceptDeviceTimezone
 * @property {Array} reminders
 * @property {Function} login
 * @property {Function} logout
 * @property {Function} signup
 * @property {Function} updateUserProfile
 * @property {Function} deleteAccount
 * @property {Function} formatDateFromTimestamp
 */

const AuthContext = createContext(
  /** @type {AuthContextValue | undefined} */ (undefined)
);

// ============================================================================
// AUTH CONTEXT PROVIDER
// ============================================================================

export function AuthContextProvider({ children }) {
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------

  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [isAccountDeleting, setIsAccountDeleting] = useState(false);

  // Refs for preventing race conditions
  const isLoggingOutRef = useRef(false);

  // --------------------------------------------------------------------------
  // REMINDERS PIPELINE (centralized)
  // --------------------------------------------------------------------------
  // IMPORTANT: hooks must be called unconditionally; pass null safely when no user
  const {
    reminders,
    isLoadingReminders,
    remindersError,
    totalReminders,
    aiReminders,
    simpleReminders,
    aiCount,
    simpleCount,
    activeReminders,
    completedReminders,
    activeCount,
    completedCount,
    nextRun,
    isEmpty: remindersEmpty,
  } = useUserReminders(firebaseUser?.uid || null);

  const {
    detectedTimezone,
    isStable: isTimezoneStable,
    pendingDeviceTimezone,
    pendingOriginalTimezone,
    stageDeviceTimezone,
    declineDeviceTimezone,
    acceptDeviceTimezone,
    resetTimezoneState,
    markLogout,
  } = useTimezoneSync({
    firebaseUser,
    userProfile,
    totalReminders,
    hasLoadedProfile,
    loading,
    setUserProfile,
  });

  // --------------------------------------------------------------------------
  // UTILITY FUNCTIONS
  // --------------------------------------------------------------------------
  /**
   * Formats a timestamp/date value for display
   */
  const formatDateFromTimestamp = useCallback((dateValue) => {
    if (!dateValue) return "N/A";

    let date;
    if (dateValue instanceof Timestamp) {
      date = dateValue.toDate();
    } else if (typeof dateValue === "string") {
      try {
        date = new Date(dateValue);
      } catch (e) {
        return "N/A";
      }
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return "N/A";
    }

    if (isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  // --------------------------------------------------------------------------
  // USER PROFILE UPDATE FUNCTION
  // --------------------------------------------------------------------------

  const updateUserProfileInFirestore = useCallback(
    async (data) => {
      if (!firebaseUser || !firebaseUser.uid) {
        console.error(
          "❌ updateUserProfileInFirestore: No authenticated user to update."
        );
        return { success: false, error: "No authenticated user." };
      }

      try {
        const result = await updateFirestoreProfile(firebaseUser.uid, data);
        if (result.success) {
          console.log("✅ User profile updated successfully:", data);
        } else {
          console.error("❌ Error updating user profile:", result.error);
        }
        return result;
      } catch (error) {
        console.error("❌ Unexpected error updating profile:", error);
        return { success: false, error: error.message };
      }
    },
    [firebaseUser]
  );

  // --------------------------------------------------------------------------
  // ACCOUNT DELETION FUNCTION
  // --------------------------------------------------------------------------
  const deleteAccount = useCallback(async () => {
    if (!firebaseUser || !firebaseUser.uid) {
      console.error("❌ deleteAccount: No authenticated user to delete.");
      return { success: false, error: "No authenticated user." };
    }

    setIsAccountDeleting(true);
    console.log("🗑️  Account deletion initiated for user:", firebaseUser.uid);

    try {
      const userId = firebaseUser.uid;

      // Step 1: Delete user document from Firestore
      try {
        const userDocRef = doc(db, "users", userId);
        await deleteDoc(userDocRef);
        console.log("✅ User document deleted from Firestore");
      } catch (firestoreError) {
        console.error("⚠️ Error deleting Firestore document:", firestoreError);
      }

      // Step 2: Delete Firebase Auth user
      await deleteUser(firebaseUser);
      console.log("✅ Firebase Auth user deleted successfully");

      return { success: true };
    } catch (error) {
      console.error("❌ Error during account deletion:", error);
      setIsAccountDeleting(false);

      if (error.code === "auth/requires-recent-login") {
        return {
          success: false,
          error:
            "For security reasons, please log in again before deleting your account.",
          requiresRecentLogin: true,
        };
      }

      return { success: false, error: error.message };
    }
  }, [firebaseUser]);

  // --------------------------------------------------------------------------
  // LOGOUT FUNCTION - CRITICAL FIX: Clear declined marks for this user
  // --------------------------------------------------------------------------
  const logout = useCallback(async () => {
    isLoggingOutRef.current = true;
    markLogout(true);
    console.log("🚪 Logout initiated, setting isLoggingOutRef to true.");

    // CRITICAL FIX: Clear all declined timezone marks for this user (best-effort)
    if (firebaseUser?.uid) {
      try {
        clearAllDeclinedForUser(firebaseUser.uid);
      } catch (e) {
        console.warn("logout: failed to clear declined marks:", e);
      }
    }

    try {
      const result = await authServiceLogout();
      return result;
    } catch (error) {
      console.error("❌ Error during logout:", error);
      return { success: false, error: error.message };
    } finally {
      // ensure flag is reset so staging can resume if logout failed/interrupted
      isLoggingOutRef.current = false;
      markLogout(false);
      resetTimezoneState();
    }
  }, [firebaseUser?.uid, markLogout, resetTimezoneState]);

  // --------------------------------------------------------------------------
  // EFFECT: FIREBASE AUTH STATE LISTENER
  // --------------------------------------------------------------------------

  useEffect(() => {
    let unsubscribeAuth = () => {};
    let unsubscribeFirestore = () => {};

    unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log(
        "🔐 onAuthStateChanged triggered. User UID:",
        user?.uid || "null"
      );

      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = () => {};
      }

      setUserProfile(null);
      setLoading(true);
      setHasLoadedProfile(false);

      if (!user) {
        console.log(
          "🚫 No authenticated user. Clearing ALL state immediately."
        );

        setFirebaseUser(null);
        setUserProfile(null);
        setLoading(false);
        setHasLoadedProfile(true);
        isLoggingOutRef.current = false;
        setIsAccountDeleting(false);
        resetTimezoneState();

        console.log("✅ All state cleared");
        return;
      }

      // Reload user and refresh token (defensive, handles stale tokens)
      try {
        await user.reload();
        await user.getIdToken(true);
        user = auth.currentUser;

        if (!user) {
          console.log("⚠️ User became null after reload. Clearing state.");
          setFirebaseUser(null);
          setUserProfile(null);
          setLoading(false);
          setHasLoadedProfile(true);
          setIsAccountDeleting(false);
          resetTimezoneState();
          return;
        }

        console.log(
          "✅ User reloaded. DisplayName:",
          user.displayName,
          "| EmailVerified:",
          user.emailVerified
        );
      } catch (reloadError) {
        console.error("❌ Error reloading user:", reloadError);

        if (
          reloadError.code === "auth/user-token-expired" ||
          reloadError.code === "auth/user-not-found" ||
          reloadError.code === "auth/invalid-user-token"
        ) {
          console.log("⚠️ User token invalid. Clearing state.");
          setFirebaseUser(null);
          setUserProfile(null);
          setLoading(false);
          setHasLoadedProfile(true);
          setIsAccountDeleting(false);
          resetTimezoneState();
          return;
        }
      }

      setFirebaseUser(user);

      const userDocRef = doc(db, "users", user.uid);

      // Create initial profile if needed
      try {
        const docSnap = await getDoc(userDocRef);
        if (user.emailVerified && !docSnap.exists()) {
          console.log("📝 Creating initial profile for verified user...");
          const initialUserData = {
            email: user.email,
            fullName: user.displayName || user.email?.split("@")[0] || "",
            onboardingComplete: false,
            isFirstLoginSession: true,
            createdAt: serverTimestamp(),
            role: "user",
            preferences: { tone: "professional" },
          };
          await setDoc(userDocRef, initialUserData, { merge: true });
          console.log("✅ Initial user document created");
        }
      } catch (firestoreInitError) {
        console.error(
          "❌ Error creating initial Firestore doc:",
          firestoreInitError
        );
      }

      // Setup Firestore real-time listener for the user's profile document
      unsubscribeFirestore = onSnapshot(
        userDocRef,
        (latestDocSnap) => {
          const currentUser = auth.currentUser;
          if (!currentUser || currentUser.uid !== user.uid) {
            console.log("⚠️ User changed during snapshot. Ignoring.");
            return;
          }

          console.log("📡 Firestore snapshot received for user:", user.uid);
          const firestoreData = latestDocSnap.exists()
            ? latestDocSnap.data()
            : {};

          const profile = {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            fullName:
              firestoreData.fullName ||
              user.displayName ||
              user.email?.split("@")[0] ||
              "",
            onboardingComplete:
              typeof firestoreData.onboardingComplete === "boolean"
                ? firestoreData.onboardingComplete
                : false,
            isFirstLoginSession:
              typeof firestoreData.isFirstLoginSession === "boolean"
                ? firestoreData.isFirstLoginSession
                : true,
            createdAt:
              firestoreData.createdAt || user.metadata?.creationTime || null,
            lastSignInTime: user.metadata?.lastSignInTime || null,
            ...firestoreData,
          };

          console.log("✅ Setting userProfile:", {
            emailVerified: profile.emailVerified,
            onboardingComplete: profile.onboardingComplete,
            timezone: profile.timezone,
          });

          setUserProfile(profile);

          setLoading(false);
          setHasLoadedProfile(true);
        },
        (error) => {
          console.error("❌ Error listening to user document:", error);

          if (
            error.code === "permission-denied" ||
            error.code === "not-found"
          ) {
            console.log(
              "⚠️ Permission denied or doc not found. Clearing state."
            );
            setUserProfile(null);
            setFirebaseUser(null);
            setLoading(false);
            setHasLoadedProfile(true);
            setIsAccountDeleting(false);
            resetTimezoneState();
            return;
          }

          setUserProfile({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            fullName: user.displayName || user.email?.split("@")[0] || "",
            onboardingComplete: false,
            isFirstLoginSession: true,
            createdAt: user.metadata?.creationTime || null,
            lastSignInTime: user.metadata?.lastSignInTime || null,
          });
          setLoading(false);
          setHasLoadedProfile(true);
        }
      );
    });

    return () => {
      console.log("🧹 Cleaning up all listeners.");
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------------------------------
  // MEMOIZED CONTEXT VALUE
  // --------------------------------------------------------------------------

  const computedValues = useMemo(
    () => ({
      // User State
      firebaseUser,
      user: userProfile,
      currentUser: userProfile,

      // Loading States
      loading,
      hasLoadedProfile,
      isAccountDeleting,
      isUserLoggingOut: isLoggingOutRef.current,

      // User Properties
      onboardingComplete: userProfile?.onboardingComplete || false,
      emailVerified: userProfile?.emailVerified || false,
      isFirstLoginSession: userProfile?.isFirstLoginSession || false,

      // Timezone Detection (exposed for UI)
      detectedTimezone,
      isTimezoneStable,

      // Pending device timezone modal state & actions
      pendingDeviceTimezone,
      pendingOriginalTimezone,
      stageDeviceTimezone,
      declineDeviceTimezone,
      acceptDeviceTimezone,

      // Reminders pipeline (global)
      reminders,
      isLoadingReminders,
      remindersError,
      totalReminders,
      aiReminders,
      simpleReminders,
      aiCount,
      simpleCount,
      activeReminders,
      completedReminders,
      activeCount,
      completedCount,
      nextRun,
      remindersEmpty,

      // Auth Actions
      login: authServiceLogin,
      logout,
      signup: authServiceSignup,

      // Profile Actions
      updateUserProfile: updateUserProfileInFirestore,
      deleteAccount,

      // Utilities
      formatDateFromTimestamp,
    }),
    [
      firebaseUser,
      userProfile,
      loading,
      hasLoadedProfile,
      isAccountDeleting,
      detectedTimezone,
      isTimezoneStable,
      pendingDeviceTimezone,
      pendingOriginalTimezone,
      reminders,
      isLoadingReminders,
      remindersError,
      totalReminders,
      aiReminders,
      simpleReminders,
      aiCount,
      simpleCount,
      activeReminders,
      completedReminders,
      activeCount,
      completedCount,
      nextRun,
      remindersEmpty,
      logout,
      updateUserProfileInFirestore,
      deleteAccount,
      formatDateFromTimestamp,
      stageDeviceTimezone,
      declineDeviceTimezone,
      acceptDeviceTimezone,
    ]
  );

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <AuthContext.Provider value={computedValues}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOK TO USE AUTH CONTEXT
// ============================================================================

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuthContext must be used within an AuthContextProvider"
    );
  }
  return context;
}
