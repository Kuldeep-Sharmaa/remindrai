import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AuthContextProvider, useAuthContext } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/workspaceLayout";

import { useTheme } from "./hooks/useTheme";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import Features from "./pages/FeaturePgae";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DocsPage from "./pages/Docs/index";

import Privacy from "./pages/Legal/Privacy";
import Terms from "./pages/Legal/Terms";
import GDPR from "./pages/Legal/Gdpr";

import Onboarding from "./pages/OnboardingSetup";
import DashboardHome from "./pages/workspace/Overview";
import Deliveries from "./pages/workspace/Content";
import Insights from "./pages/workspace/Insights";
import Studio from "./pages/workspace/Studio";
import SettingsIndex from "./pages/SettingsIndex";

import SettingsLayout from "./layouts/SettingsLayout";
import AccountInfo from "./pages/workspace/settings/AccountInfo";
import Notification from "./pages/workspace/settings/NotificationPreferences";
import Appearance from "./pages/workspace/settings/Appearance";
import DeleteAccountPage from "./pages/workspace/settings/DeleteAccount/DeleteAccountButton";
import Preferences from "./pages/workspace/settings/Preferences";
import Security from "./pages/workspace/settings/Security";
import Aboutremindrai from "./pages/workspace/settings/AboutRemindrAi";

import CreateReminderScreen from "./features/remindersystem/screens/CreateReminderScreen";

import ToastContainer from "./components/ToastSystem/ToastContainer";
import ScrollToTop from "./components/ScrollToTop";

import { TimezoneProvider } from "./context/TimezoneProvider";

function AppContent() {
  const { currentUser, isUserLoggingOut } = useAuthContext();

  // useTheme reads from localStorage synchronously — no flicker, no spinner needed.
  // The <html> class is already set before React hydrates so the theme is instant.
  useTheme();

  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Public pages never wait for auth to resolve.
            A visitor hitting the landing page shouldn't see a loading state
            just because Firebase hasn't responded yet. */}

        <Route
          path="/"
          element={
            <PublicRoute>
              <PublicLayout>
                <Home />
              </PublicLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/features"
          element={
            <PublicRoute>
              <PublicLayout>
                <Features />
              </PublicLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/about"
          element={
            <PublicRoute>
              <PublicLayout>
                <About />
              </PublicLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/docs"
          element={
            <PublicRoute>
              <PublicLayout>
                <DocsPage />
              </PublicLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicRoute>
              <PublicLayout>
                <Contact />
              </PublicLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/privacy"
          element={
            <PublicRoute>
              <PublicLayout>
                <Privacy />
              </PublicLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/terms"
          element={
            <PublicRoute>
              <PublicLayout>
                <Terms />
              </PublicLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/gdpr"
          element={
            <PublicRoute>
              <PublicLayout>
                <GDPR />
              </PublicLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/auth/*"
          element={
            <PublicRoute>
              <PublicLayout>
                <Auth />
              </PublicLayout>
            </PublicRoute>
          }
        />

        {/* These used to be separate pages. Canonical URL is /auth now.
            Keeping redirects so old links don't 404. */}
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/signup" element={<Navigate to="/auth" replace />} />
        <Route
          path="/forgot-password"
          element={<Navigate to="/auth" replace />}
        />

        {/* Verified but hasn't finished onboarding yet */}
        <Route
          path="/verify-email"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <VerifyEmailPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* AnimatePresence for transitions lives inside DashboardLayout around <Outlet />.
            Putting it here would remount the sidebar on every route change. */}
        <Route
          path="/workspace/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="studio" element={<Studio />} />
          <Route path="studio/create" element={<CreateReminderScreen />} />
          <Route path="deliveries" element={<Deliveries />} />
          <Route path="insights" element={<Insights />} />

          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<SettingsIndex />} />
            <Route path="accountinfo" element={<AccountInfo />} />
            <Route path="notifications" element={<Notification />} />
            <Route path="security" element={<Security />} />
            <Route path="preferences" element={<Preferences />} />
            <Route path="appearance" element={<Appearance />} />
            <Route path="aboutremindrai" element={<Aboutremindrai />} />
            <Route path="deleteaccount" element={<DeleteAccountPage />} />
          </Route>
        </Route>

        {/* mid-logout gets sent home immediately so there's no flash of the dashboard */}
        <Route
          path="*"
          element={
            isUserLoggingOut ? (
              <Navigate to="/" replace />
            ) : currentUser ? (
              <Navigate to="/workspace" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>

      {/* Outside the route tree so toasts don't unmount mid-transition */}
      <ToastContainer />
    </>
  );
}

const MemoizedAppContent = React.memo(AppContent);

export default function App() {
  // TimezoneProvider needs auth state, so it has to live inside AuthContextProvider.
  // That's the only reason for this nesting order.
  return (
    <AuthContextProvider>
      <TimezoneProvider saveProfileTz={false}>
        <MemoizedAppContent />
      </TimezoneProvider>
    </AuthContextProvider>
  );
}
