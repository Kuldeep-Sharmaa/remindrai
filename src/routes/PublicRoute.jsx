import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import FullScreenLoader from "../components/Loaders/FullScreenLoader";

const AUTH_PAGES = ["/auth", "/login", "/signup", "/forgot-password"];

const PublicRoute = ({ children }) => {
  const { firebaseUser, currentUser, hasLoadedProfile, isAccountDeleting } =
    useAuthContext();

  const location = useLocation();
  const path = location.pathname;

  const isAuthPage = AUTH_PAGES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  const isAuthenticated = !!firebaseUser && !!currentUser && hasLoadedProfile;

  if (isAccountDeleting) {
    return <FullScreenLoader text="Deleting your account..." />;
  }

  // Public pages render immediately — no identity check needed.
  // A loader here would make the site feel gated before the user has done anything.
  // Auth pages are the only exception: we must know if a session already exists
  // before showing a login form, or a logged-in user flashes the form before redirect.
  if (isAuthPage && !hasLoadedProfile) {
    return <FullScreenLoader />;
  }

  if (isAuthenticated && isAuthPage) {
    return <Navigate to="/workspace" replace />;
  }

  return children;
};

export default PublicRoute;
