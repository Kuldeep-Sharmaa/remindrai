// src/pages/Auth.jsx (FINAL, CONFIRMED VERSION)

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Make sure Navigate is imported
import AuthWrapper from "../components/auth/AuthWrapper";
import ForgotPasswordPage from "../components/auth/ForgotPasswordPage";

export default function Auth() {
  // Removed useLocation and isForgotPasswordPath check here.
  // The Routes component handles the matching.

  return (
    <Routes>
      {" "}
      {/* Use Routes for nested routing */}
      {/* This route will match the base /auth path */}
      <Route index element={<AuthWrapper />} />
      {/* This route will match /auth/forgot-password */}
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      {/* If AuthWrapper internally handles /login and /signup
          via state, you don't need explicit routes for them here
          unless you want direct URL access like /auth/login or /auth/signup.
          If you *do* want them, they would look like:
      <Route path="login" element={<AuthWrapper defaultMode="login" />} />
      <Route path="signup" element={<AuthWrapper defaultMode="signup" />} />
      */}
      {/* Fallback for any other /auth/* path that doesn't match specific routes,
          redirecting back to the base /auth view. */}
      <Route path="*" element={<Navigate to="" replace />} />{" "}
      {/* Redirects to /auth */}
    </Routes>
  );
}
