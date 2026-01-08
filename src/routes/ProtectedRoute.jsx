// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import FullScreenLoader from "../components/Loaders/FullScreenLoader";

/**
 * ProtectedRoute - robust route guard:
 * - waits for auth/profile to load (shows loader)
 * - handles email verification & onboarding flows (without loops)
 * - blocks suspended/banned accounts
 * - supports future subscription gating
 * - always returns a valid React element (never `null`)
 *
 * Usage:
 * <ProtectedRoute requiresSubscription>
 *   <DashboardLayout />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children, requiresSubscription = false }) => {
  const {
    currentUser,
    loading,
    hasLoadedProfile,
    emailVerified,
    onboardingComplete,
    isUserLoggingOut,
    isAccountDeleting,
  } = useAuthContext();

  const location = useLocation();

  // DEV: helpful debugging info when developing
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[ProtectedRoute] state:", {
      pathname: location.pathname,
      loading,
      hasLoadedProfile,
      currentUserId: currentUser?.uid,
      emailVerified,
      onboardingComplete,
      isUserLoggingOut,
      isAccountDeleting,
    });
  }

  // 1) Wait for core auth/profile state to settle before rendering any child routes
  // This prevents flashes and ensures children receive correct context data.
  if (loading || !hasLoadedProfile) {
    return <FullScreenLoader text="Authenticating your session..." />;
  }

  // 2) Account deletion flow - show dedicated loader while deletion is processing
  if (isAccountDeleting) {
    return <FullScreenLoader text="Processing account changes..." />;
  }

  // 3) No authenticated user -> if logging out show loader, else redirect to auth
  if (!currentUser) {
    if (isUserLoggingOut) {
      return <FullScreenLoader text="Signing out..." />;
    }
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 4) Sanity: ensure UID present; otherwise treat as unauthenticated
  if (!currentUser?.uid) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 5) Account status checks (suspended/banned)
  if (currentUser.accountStatus === "suspended") {
    // Optional: you could show a helpful page instead of redirect
    return <Navigate to="/account-suspended" replace />;
  }
  if (currentUser.accountStatus === "banned") {
    return <Navigate to="/account-banned" replace />;
  }

  // 6) Route identity helpers
  const path = location.pathname || "";
  const isAuthPage = path.startsWith("/auth");
  const isVerifyEmailPage = path === "/verify-email";
  const isOnboardingPage = path === "/onboarding";
  const isBillingPage = path.startsWith("/billing");

  // 7) Email verification flow:
  // - If user is NOT verified, allow access to /verify-email only; otherwise redirect them there.
  // - If user IS verified, allow normal navigation.
  if (!emailVerified) {
    if (!isVerifyEmailPage) {
      return <Navigate to="/verify-email" state={{ from: location }} replace />;
    }
    // if isVerifyEmailPage and not verified -> allow (user needs to verify)
    return children;
  }

  // 8) Onboarding flow:
  // - If onboarding not complete, allow /onboarding page only; otherwise redirect there.
  if (!onboardingComplete) {
    if (!isOnboardingPage) {
      return <Navigate to="/onboarding" state={{ from: location }} replace />;
    }
    // if isOnboardingPage and onboarding not complete -> allow
    return children;
  }

  // 9) Prevent verified & onboarded users from visiting auth/setup pages:
  // Only redirect to dashboard if the user is fully set up (verified + onboarded)
  if (
    (isAuthPage || isVerifyEmailPage || isOnboardingPage) &&
    emailVerified &&
    onboardingComplete
  ) {
    // don't redirect if they're already at /dashboard or / (avoid unnecessary nav)
    if (!path.startsWith("/dashboard")) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 10) Subscription gate (future): allow /billing if user needs to pay (avoid redirect loop)
  if (requiresSubscription && currentUser.subscriptionStatus !== "active") {
    // If user already on billing page, let them stay; otherwise, send them to billing.
    if (!isBillingPage) {
      return (
        <Navigate
          to="/billing"
          state={{ reason: "subscription_required" }}
          replace
        />
      );
    }
    return children;
  }

  // 11) All checks passed — render children (safe)
  return children;
};

export default ProtectedRoute;
