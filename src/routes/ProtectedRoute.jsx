import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import FullScreenLoader from "../components/Loaders/FullScreenLoader";

const ProtectedRoute = ({ children, requiresSubscription = false }) => {
  const {
    firebaseUser,
    currentUser,
    loading,
    hasLoadedProfile,
    emailVerified,
    onboardingComplete,
    isUserLoggingOut,
    isAccountDeleting,
  } = useAuthContext();

  const location = useLocation();
  const path = location.pathname || "";

  // User intent always wins over system uncertainty.
  // If someone clicked "delete" or "sign out", that feedback must never be
  // swallowed by a neutral loader still waiting on Firestore.
  if (isAccountDeleting) {
    return <FullScreenLoader text="Deleting your account..." />;
  }

  if (isUserLoggingOut) {
    return <FullScreenLoader text="Signing out..." />;
  }

  // System uncertainty — we don't know who's here yet
  if (loading && !firebaseUser) {
    return <FullScreenLoader />;
  }

  // Firebase session restored but Firestore profile still loading.
  // Without this, currentUser is null on page refresh and we'd wrongly
  // redirect a logged-in user to the landing page.
  if (firebaseUser && !hasLoadedProfile) {
    return <FullScreenLoader />;
  }

  const isAuthenticated = !!firebaseUser && !!currentUser && hasLoadedProfile;

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Null-coalescing matters here: if accountStatus is ever missing due to a
  // schema change, we default to "active" rather than silently bypassing the check.
  const accountStatus = currentUser?.accountStatus ?? "active";

  if (accountStatus === "suspended") {
    return <Navigate to="/account-suspended" replace />;
  }

  if (accountStatus === "banned") {
    return <Navigate to="/account-banned" replace />;
  }

  const isVerifyEmailPage = path === "/verify-email";
  const isOnboardingPage = path === "/onboarding";
  const isBillingPage = path.startsWith("/billing");

  // Where the user originally wanted to go — we carry this through the funnel
  // so they land at their intended destination after setup, not always /workspace.
  const intendedDestination = location.state?.from?.pathname || "/workspace";

  if (!emailVerified) {
    if (!isVerifyEmailPage) {
      return <Navigate to="/verify-email" state={{ from: location }} replace />;
    }
    return children;
  }

  // Enforce the invariant explicitly: onboarding cannot be considered complete
  // unless email is also verified. This guards against early Firestore writes
  // that could set onboardingComplete=true before verification happened.
  const isOnboardingComplete = emailVerified && onboardingComplete;

  if (!isOnboardingComplete) {
    if (!isOnboardingPage) {
      return <Navigate to="/onboarding" state={{ from: location }} replace />;
    }
    return children;
  }

  // Fully set up user — block them from revisiting setup pages.
  // Return them to where they originally wanted to go, not blindly to /workspace.
  if (isVerifyEmailPage || isOnboardingPage) {
    return <Navigate to={intendedDestination} replace />;
  }

  // Subscription gate — no routes require this yet, but the hook is ready
  if (requiresSubscription && currentUser.subscriptionStatus !== "active") {
    if (!isBillingPage) {
      return (
        <Navigate
          to="/billing"
          state={{ reason: "subscription_required", from: location }}
          replace
        />
      );
    }
    return children;
  }

  return children;
};

export default ProtectedRoute;
