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
  collection,
  getDocs,
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
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [isAccountDeleting, setIsAccountDeleting] = useState(false);

  // Blocks the timezone modal from firing during logout
  const isLoggingOutRef = useRef(false);

  // useUserReminders must be called unconditionally — React rules.
  // We pass null when there's no user and let the hook handle it.
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

  const formatDateFromTimestamp = useCallback((dateValue) => {
    if (!dateValue) return "N/A";

    let date;
    if (dateValue instanceof Timestamp) {
      date = dateValue.toDate();
    } else if (typeof dateValue === "string") {
      try {
        date = new Date(dateValue);
      } catch {
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

  const updateUserProfileInFirestore = useCallback(
    async (data) => {
      if (!firebaseUser?.uid) {
        return { success: false, error: "No authenticated user." };
      }

      try {
        return await updateFirestoreProfile(firebaseUser.uid, data);
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [firebaseUser],
  );

  const deleteAccount = useCallback(async () => {
    if (!firebaseUser?.uid) {
      return { success: false, error: "No authenticated user." };
    }

    setIsAccountDeleting(true);
    const userId = firebaseUser.uid;

    // If you add new subcollections under /users/{uid} in the future, add them here.
    const subcollections = [
      "reminders",
      "drafts",
      "executions",
      "draftInteractions",
      "reminderIdempotency",
      "userPrefs",
    ];

    try {
      // Delete subcollections before the auth user — we need to still be authenticated
      // when these Firestore delete requests land, otherwise rules will reject them.
      for (const sub of subcollections) {
        try {
          const snap = await getDocs(collection(db, "users", userId, sub));
          if (!snap.empty) {
            await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
          }
        } catch (subErr) {
          // One subcollection failing shouldn't stop the rest from being cleaned up.
          console.warn(
            `Could not delete subcollection "${sub}":`,
            subErr.message,
          );
        }
      }

      try {
        await deleteDoc(doc(db, "users", userId));
      } catch (docErr) {
        console.warn("Could not delete parent user doc:", docErr.message);
      }

      await deleteUser(firebaseUser);

      // Firebase Auth deletion takes a moment to propagate. Without this pause,
      // signing up again immediately with the same email throws auth/email-already-in-use.
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return { success: true };
    } catch (error) {
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
    // We intentionally don't reset isAccountDeleting on success.
    // onAuthStateChanged fires right after and resets all state cleanly.
  }, [firebaseUser]);

  const logout = useCallback(async () => {
    isLoggingOutRef.current = true;
    markLogout(true);

    // Without clearing these, a user who declined the timezone modal once
    // will never see it again — even after logging out and back in.
    if (firebaseUser?.uid) {
      try {
        clearAllDeclinedForUser(firebaseUser.uid);
      } catch (e) {
        console.warn("Failed to clear declined timezone marks:", e);
      }
    }

    try {
      return await authServiceLogout();
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      isLoggingOutRef.current = false;
      markLogout(false);
      resetTimezoneState();
    }
  }, [firebaseUser?.uid, markLogout, resetTimezoneState]);

  useEffect(() => {
    let unsubscribeAuth = () => {};
    let unsubscribeFirestore = () => {};

    unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = () => {};
      }

      setUserProfile(null);
      setLoading(true);
      setHasLoadedProfile(false);

      if (!user) {
        setFirebaseUser(null);
        setUserProfile(null);
        setLoading(false);
        setHasLoadedProfile(true);
        isLoggingOutRef.current = false;
        setIsAccountDeleting(false);
        resetTimezoneState();
        return;
      }

      // Force-reload the user so we're working with the freshest token and
      // emailVerified status — stale tokens cause subtle bugs after password resets.
      try {
        await user.reload();
        await user.getIdToken(true);
        user = auth.currentUser;

        if (!user) {
          setFirebaseUser(null);
          setUserProfile(null);
          setLoading(false);
          setHasLoadedProfile(true);
          setIsAccountDeleting(false);
          resetTimezoneState();
          return;
        }
      } catch (reloadError) {
        if (
          reloadError.code === "auth/user-token-expired" ||
          reloadError.code === "auth/user-not-found" ||
          reloadError.code === "auth/invalid-user-token"
        ) {
          setFirebaseUser(null);
          setUserProfile(null);
          setLoading(false);
          setHasLoadedProfile(true);
          setIsAccountDeleting(false);
          resetTimezoneState();
          return;
        }
        // Other reload errors (network glitch etc.) — continue with what we have
      }

      setFirebaseUser(user);

      const userDocRef = doc(db, "users", user.uid);

      // First-time verified sign-in: Firestore doc won't exist yet, create it.
      try {
        const docSnap = await getDoc(userDocRef);
        if (user.emailVerified && !docSnap.exists()) {
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
        }
      } catch (firestoreInitError) {
        console.error("Failed to create initial profile:", firestoreInitError);
      }

      unsubscribeFirestore = onSnapshot(
        userDocRef,
        (latestDocSnap) => {
          // Guard against a race where auth changed while we were waiting for this snapshot
          const currentAuthUser = auth.currentUser;
          if (!currentAuthUser || currentAuthUser.uid !== user.uid) return;

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

          setUserProfile(profile);
          setLoading(false);
          setHasLoadedProfile(true);
        },
        (error) => {
          console.error("Firestore listener error:", error);

          if (
            error.code === "permission-denied" ||
            error.code === "not-found"
          ) {
            setUserProfile(null);
            setFirebaseUser(null);
            setLoading(false);
            setHasLoadedProfile(true);
            setIsAccountDeleting(false);
            resetTimezoneState();
            return;
          }

          // For non-permission errors, fall back to a minimal profile built from
          // auth data alone so the app doesn't completely break on a Firestore hiccup.
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
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty — this listener should only mount once

  const computedValues = useMemo(
    () => ({
      firebaseUser,
      user: userProfile,
      currentUser: userProfile,

      loading,
      hasLoadedProfile,
      isAccountDeleting,
      isUserLoggingOut: isLoggingOutRef.current,

      onboardingComplete: userProfile?.onboardingComplete || false,
      emailVerified: userProfile?.emailVerified || false,
      isFirstLoginSession: userProfile?.isFirstLoginSession || false,

      detectedTimezone,
      isTimezoneStable,
      pendingDeviceTimezone,
      pendingOriginalTimezone,
      stageDeviceTimezone,
      declineDeviceTimezone,
      acceptDeviceTimezone,

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

      login: authServiceLogin,
      logout,
      signup: authServiceSignup,

      updateUserProfile: updateUserProfileInFirestore,
      deleteAccount,

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
