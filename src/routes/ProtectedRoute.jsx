import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import FullScreenLoader from "../components/Loaders/FullScreenLoader";

// Guards all private routes.
//
// The core rule: only block the screen when we genuinely don't know who's here.
// Once Firebase has a session, we get out of the way — unnecessary loaders make
// the app feel unstable on refresh and break persistent layouts like sidebars.
//
// Check order: user intent → identity → access rules.
// That ordering matters. A user who clicked "sign out" shouldn't see a neutral
// loader swallow their action because Firestore is still catching up.

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

  // User-initiated actions win over everything else.
  // If someone clicked delete or sign out, show them that — don't bury it.
  if (isAccountDeleting) {
    return <FullScreenLoader text="Deleting your account..." />;
  }

  if (isUserLoggingOut) {
    return <FullScreenLoader text="Signing out..." />;
  }

  // Firebase hasn't resolved the session yet — we genuinely don't know who's here.
  if (loading && !firebaseUser) {
    return <FullScreenLoader />;
  }

  // Firebase knows the user but the Firestore profile is still loading.
  // Without this check, currentUser is null on page refresh and we'd wrongly
  // kick a logged-in user back to the landing page.
  if (firebaseUser && !hasLoadedProfile) {
    return <FullScreenLoader />;
  }

  const isAuthenticated = !!firebaseUser && !!currentUser && hasLoadedProfile;

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Null-coalescing here is intentional — if accountStatus is ever missing
  // due to a schema change, we default to "active" rather than silently
  // skipping a policy check.
  const accountStatus = currentUser?.accountStatus ?? "active";

  if (accountStatus === "suspended") {
    return <Navigate to="/account-suspended" replace />;
  }

  if (accountStatus === "banned") {
    return <Navigate to="/account-banned" replace />;
  }

  const isVerifyEmailPage = path === "/verify-email";
  const isOnboardingPage = path === "/onboarding";
  const isAuthPage = path.startsWith("/auth");
  const isBillingPage = path.startsWith("/billing");

  // Carry the user's original destination through the setup funnel so they
  // land where they actually wanted to go, not always at /workspace.
  const intendedDestination = location.state?.from?.pathname || "/workspace";

  if (!emailVerified) {
    if (!isVerifyEmailPage) {
      return (
        <Navigate
          to="/verify-email"
          state={{ from: location.state?.from || location }}
          replace
        />
      );
    }
    return children;
  }

  // Enforce the dependency explicitly: onboarding can't be complete if email
  // isn't verified. This guards against early Firestore writes that could
  // accidentally set onboardingComplete=true before verification happened.
  const isOnboardingComplete = emailVerified && onboardingComplete;

  if (!isOnboardingComplete) {
    if (!isOnboardingPage) {
      return (
        <Navigate
          to="/onboarding"
          state={{ from: location.state?.from || location }}
          replace
        />
      );
    }
    return children;
  }

  // Fully set up users have no reason to revisit setup pages.
  // Send them to their intended destination instead.
  if (isAuthPage || isVerifyEmailPage || isOnboardingPage) {
    return <Navigate to={intendedDestination} replace />;
  }

  // No routes require a subscription yet, but the gate is wired up and ready.
  const subscriptionStatus = currentUser?.subscriptionStatus ?? "free";

  if (requiresSubscription && subscriptionStatus !== "active") {
    if (!isBillingPage) {
      return (
        <Navigate
          to="/billing"
          state={{
            reason: "subscription_required",
            from: location.state?.from || location,
          }}
          replace
        />
      );
    }
    return children;
  }

  return children;
};

export default ProtectedRoute;
