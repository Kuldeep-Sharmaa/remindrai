// AuthContext - Central auth state management
// - Listens to Firebase auth state changes
// - Loads user profile from Firestore and merges with auth data
// - Provides login, logout, signup, profile update, and account deletion functions
// - Integrates timezone detection and Draft data for comprehensive user context
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";

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

import {
  signup as authServiceSignup,
  login as authServiceLogin,
  logout as authServiceLogout,
  updateFirestoreProfile,
} from "../services/authService";

import useUserReminders from "../features/remindersystem/hooks/useUserReminders";
import useTimezoneSync from "../hooks/useTimezoneSync";
import { clearAllDeclinedForUser } from "./timezoneStorage";

const AuthContext = createContext(undefined);

export function AuthContextProvider({ children }) {
  // Core auth state - raw from Firebase
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Merged profile (Firebase auth + Firestore doc)
  const [userProfile, setUserProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [isAccountDeleting, setIsAccountDeleting] = useState(false);

  // Used to block timezone modal during logout
  const isLoggingOutRef = useRef(false);

  // Load all reminders for current user
  // Must be called unconditionally (React rules), so we pass null if no user
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

  // Timezone detection + modal state
  // Compares browser timezone to saved timezone, triggers modal if different
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

  // Format timestamps for display
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

    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  // Update user profile in Firestore
  const updateUserProfileInFirestore = useCallback(
    async (data) => {
      if (!firebaseUser?.uid) {
        console.error("❌ No authenticated user to update");
        return { success: false, error: "No authenticated user." };
      }

      try {
        const result = await updateFirestoreProfile(firebaseUser.uid, data);
        if (result.success) {
          console.log("✅ Profile updated:", data);
        } else {
          console.error("❌ Profile update failed:", result.error);
        }
        return result;
      } catch (error) {
        console.error("❌ Unexpected error updating profile:", error);
        return { success: false, error: error.message };
      }
    },
    [firebaseUser],
  );

  // Delete user account (Firestore doc + Firebase auth)
  const deleteAccount = useCallback(async () => {
    if (!firebaseUser?.uid) {
      console.error("❌ No user to delete");
      return { success: false, error: "No authenticated user." };
    }

    setIsAccountDeleting(true);
    console.log("  Deleting account:", firebaseUser.uid);

    try {
      const userId = firebaseUser.uid;

      // Try to delete Firestore doc first (best effort)
      try {
        await deleteDoc(doc(db, "users", userId));
        console.log("✅ Firestore doc deleted");
      } catch (firestoreError) {
        console.error("⚠️ Firestore delete failed:", firestoreError);
        // Continue anyway - auth deletion is more important
      }

      // Delete Firebase auth user (this logs them out)
      await deleteUser(firebaseUser);
      console.log("✅ Auth user deleted");

      return { success: true };
    } catch (error) {
      console.error("❌ Account deletion failed:", error);
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

  // Logout with cleanup
  // Important: clear declined timezone marks so modal shows again on next login
  const logout = useCallback(async () => {
    isLoggingOutRef.current = true;
    markLogout(true);
    console.log("🚪 Logging out");

    // Clear localStorage entries for declined timezones
    // Without this, user never sees timezone modal again after declining once
    if (firebaseUser?.uid) {
      try {
        clearAllDeclinedForUser(firebaseUser.uid);
      } catch (e) {
        console.warn("Failed to clear declined marks:", e);
      }
    }

    try {
      return await authServiceLogout();
    } catch (error) {
      console.error("❌ Logout failed:", error);
      return { success: false, error: error.message };
    } finally {
      isLoggingOutRef.current = false;
      markLogout(false);
      resetTimezoneState();
    }
  }, [firebaseUser?.uid, markLogout, resetTimezoneState]);

  // Main auth state listener
  // Handles: login, logout, token refresh, profile loading
  useEffect(() => {
    let unsubscribeAuth = () => {};
    let unsubscribeFirestore = () => {};

    unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log("🔐 Auth state changed. User:", user?.uid || "null");

      // Clean up old Firestore listener to avoid memory leaks
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = () => {};
      }

      setUserProfile(null);
      setLoading(true);
      setHasLoadedProfile(false);

      // No user - clear everything and bail
      if (!user) {
        console.log("🚫 No user, clearing state");
        setFirebaseUser(null);
        setUserProfile(null);
        setLoading(false);
        setHasLoadedProfile(true);
        isLoggingOutRef.current = false;
        setIsAccountDeleting(false);
        resetTimezoneState();
        console.log("✅ State cleared");
        return;
      }

      // User exists - reload to get fresh token
      // This catches cases where token expired or user was deleted server-side
      try {
        await user.reload();
        await user.getIdToken(true); // force refresh
        user = auth.currentUser;

        if (!user) {
          console.log("⚠️ User disappeared after reload");
          setFirebaseUser(null);
          setUserProfile(null);
          setLoading(false);
          setHasLoadedProfile(true);
          setIsAccountDeleting(false);
          resetTimezoneState();
          return;
        }

        console.log(
          "✅ User reloaded:",
          user.displayName,
          "verified:",
          user.emailVerified,
        );
      } catch (reloadError) {
        console.error("❌ Reload failed:", reloadError);

        // Token invalid - user needs to log in again
        if (
          reloadError.code === "auth/user-token-expired" ||
          reloadError.code === "auth/user-not-found" ||
          reloadError.code === "auth/invalid-user-token"
        ) {
          console.log("⚠️ Invalid token, clearing state");
          setFirebaseUser(null);
          setUserProfile(null);
          setLoading(false);
          setHasLoadedProfile(true);
          setIsAccountDeleting(false);
          resetTimezoneState();
          return;
        }
        // Other errors - might be temporary, continue
      }

      setFirebaseUser(user);

      const userDocRef = doc(db, "users", user.uid);

      // Create initial Firestore doc for new verified users
      try {
        const docSnap = await getDoc(userDocRef);
        if (user.emailVerified && !docSnap.exists()) {
          console.log("📝 Creating initial profile");
          await setDoc(
            userDocRef,
            {
              email: user.email,
              fullName: user.displayName || user.email?.split("@")[0] || "",
              onboardingComplete: false,
              isFirstLoginSession: true,
              createdAt: serverTimestamp(),
              role: "user",
              preferences: { tone: "professional" },
            },
            { merge: true },
          );
          console.log("✅ Initial profile created");
        }
      } catch (firestoreInitError) {
        console.error(
          "❌ Failed to create initial profile:",
          firestoreInitError,
        );
      }

      // Listen to Firestore doc for real-time updates
      unsubscribeFirestore = onSnapshot(
        userDocRef,
        (latestDocSnap) => {
          // Guard against race condition if user changed during snapshot
          const currentUser = auth.currentUser;
          if (!currentUser || currentUser.uid !== user.uid) {
            console.log("⚠️ User changed during snapshot, ignoring");
            return;
          }

          console.log("📡 Firestore snapshot for:", user.uid);
          const firestoreData = latestDocSnap.exists()
            ? latestDocSnap.data()
            : {};

          // Merge Firebase auth data with Firestore data
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

          console.log("✅ Profile loaded:", {
            verified: profile.emailVerified,
            onboarded: profile.onboardingComplete,
            timezone: profile.timezone,
          });

          setUserProfile(profile);
          setLoading(false);
          setHasLoadedProfile(true);
        },
        (error) => {
          console.error("❌ Firestore listener error:", error);

          // Permission denied - shouldn't happen, clear state
          if (
            error.code === "permission-denied" ||
            error.code === "not-found"
          ) {
            console.log("⚠️ Permission denied, clearing state");
            setUserProfile(null);
            setFirebaseUser(null);
            setLoading(false);
            setHasLoadedProfile(true);
            setIsAccountDeleting(false);
            resetTimezoneState();
            return;
          }

          // Other errors - create fallback profile from auth data only
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
        },
      );
    });

    return () => {
      console.log("🧹 Cleaning up listeners");
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps intentional - only run once

  // Memoize context value to prevent unnecessary re-renders
  const computedValues = useMemo(
    () => ({
      // User state
      firebaseUser,
      user: userProfile,
      currentUser: userProfile,

      // Loading flags
      loading,
      hasLoadedProfile,
      isAccountDeleting,
      isUserLoggingOut: isLoggingOutRef.current,

      // Convenience accessors
      onboardingComplete: userProfile?.onboardingComplete || false,
      emailVerified: userProfile?.emailVerified || false,
      isFirstLoginSession: userProfile?.isFirstLoginSession || false,

      // Timezone detection
      detectedTimezone,
      isTimezoneStable,
      pendingDeviceTimezone,
      pendingOriginalTimezone,
      stageDeviceTimezone,
      declineDeviceTimezone,
      acceptDeviceTimezone,

      // Reminders data
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

      // Auth actions
      login: authServiceLogin,
      logout,
      signup: authServiceSignup,

      // Profile actions
      updateUserProfile: updateUserProfileInFirestore,
      deleteAccount,

      // Utils
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
    ],
  );

  return (
    <AuthContext.Provider value={computedValues}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuthContext must be used within an AuthContextProvider",
    );
  }
  return context;
}
