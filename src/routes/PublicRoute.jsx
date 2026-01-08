import React, { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import FullScreenLoader from "../components/Loaders/FullScreenLoader";

const PublicRoute = ({ children }) => {
  const { currentUser, hasLoadedProfile, isUserLoggingOut } = useAuthContext();
  const location = useLocation();

  // ✅ Define public & auth routes
  const publicPaths = useMemo(
    () => [
      "/",
      "/about",
      "/features",
      "/docs",
      "/contact",
      "/privacy",
      "/terms",
      "/gdpr",
    ],
    []
  );

  const authPaths = useMemo(
    () => ["/auth", "/login", "/signup", "/forgot-password"],
    []
  );

  const isPublicPage = publicPaths.some((path) =>
    new RegExp(`^${path}(/|$)`).test(location.pathname)
  );
  const isAuthPage = authPaths.some((path) =>
    new RegExp(`^${path}(/|$)`).test(location.pathname)
  );

  if (!hasLoadedProfile) {
    return isAuthPage ? <FullScreenLoader /> : children;
  }

  // ✅ Redirect logged-in users away from auth/public pages
  if (currentUser && !isPublicPage && !isUserLoggingOut) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return children;
};

export default PublicRoute;
