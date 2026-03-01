// App.jsx
// Central router + provider tree.
//
// Key decisions made here:
// - Public pages (landing, /about, /features etc.) render IMMEDIATELY.
//   They never wait for Firebase auth to resolve — visitors shouldn't see a spinner.
// - Dashboard routes wait for auth via ProtectedRoute, which handles its own loading state.
// - AnimatePresence is removed from this level — it belongs inside DashboardLayout
//   around <Outlet /> so page transitions work without remounting the whole layout.
// - /login, /signup, /forgot-password redirect to /auth — no duplicate route registrations.

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth & routing
import { AuthContextProvider, useAuthContext } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/workspaceLayout";

// Theme
import { useTheme } from "./hooks/useTheme";

// Public pages — these render immediately, no auth needed
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import Features from "./pages/FeaturePgae";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DocsPage from "./pages/Docs/index";

// Legal pages
import Privacy from "./pages/Legal/Privacy";
import Terms from "./pages/Legal/Terms";
import GDPR from "./pages/Legal/Gdpr";

// Protected pages — only reachable after auth + onboarding
import Onboarding from "./pages/OnboardingSetup";
import DashboardHome from "./pages/workspace/Overview";
import Deliveries from "./pages/workspace/Content";
import Insights from "./pages/workspace/Insights";
import Studio from "./pages/workspace/Studio";
import SettingsIndex from "./pages/SettingsIndex";

// Settings sub-pages
import SettingsLayout from "./layouts/SettingsLayout";
import AccountInfo from "./pages/workspace/settings/AccountInfo";
import Notification from "./pages/workspace/settings/NotificationPreferences";
import Appearance from "./pages/workspace/settings/Appearance";
import DeleteAccountPage from "./pages/workspace/settings/DeleteAccount/DeleteAccountButton";
import Preferences from "./pages/workspace/settings/Preferences";
import Security from "./pages/workspace/settings/Security";
import Aboutremindrai from "./pages/workspace/settings/AboutRemindrPost";

// Reminder flow
import CreateReminderScreen from "./features/remindersystem/screens/CreateReminderScreen";

// Global UI
import ToastContainer from "./components/ToastSystem/ToastContainer";
import ScrollToTop from "./components/ScrollToTop";

// Timezone context — must sit inside AuthContextProvider since it reads auth state
import { TimezoneProvider } from "./context/TimezoneProvider";

function AppContent() {
  const { currentUser, isUserLoggingOut } = useAuthContext();

  // Theme hook initializes synchronously from localStorage in most setups.
  // We don't block rendering on it — the theme flicker (if any) is handled
  // by a class on <html> set before React hydrates, not by a spinner here.
  useTheme();

  return (
    <>
      {/* Keeps the window scrolled to top on every route change */}
      <ScrollToTop />

      <Routes>
        {/* ============================================================
            PUBLIC ROUTES
            Render immediately — no auth check, no spinner, no waiting.
            PublicRoute only redirects logged-in users away from auth pages.
        ============================================================ */}

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

        {/* Auth page — all auth flows live under /auth */}
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

        {/* Redirect legacy/alias auth paths to /auth instead of duplicating the route.
            This avoids registering the same component 4 times and keeps URLs canonical. */}
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/signup" element={<Navigate to="/auth" replace />} />
        <Route
          path="/forgot-password"
          element={<Navigate to="/auth" replace />}
        />

        {/* ============================================================
            PROTECTED ROUTES
            ProtectedRoute handles all auth state + loading internally.
            Nothing here blocks public pages from rendering.
        ============================================================ */}

        {/* Email verification — user is auth'd but not yet verified */}
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

        {/* Onboarding — verified but hasn't completed setup yet */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Dashboard — fully authenticated + verified + onboarded users only.
            DashboardLayout renders <Outlet /> for nested routes.
            AnimatePresence for page transitions belongs INSIDE DashboardLayout
            around <Outlet /> — not here — so the sidebar/topbar never remounts. */}
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

        {/* ============================================================
            CATCH-ALL
            Unknown routes — send user somewhere sensible based on auth state.
        ============================================================ */}
        <Route
          path="*"
          element={
            isUserLoggingOut ? (
              <Navigate to="/" replace /> // mid-logout — go home
            ) : currentUser ? (
              <Navigate to="/workspace" replace /> // logged in — go to dashboard
            ) : (
              <Navigate to="/" replace />
            ) // not logged in — go to landing page
          }
        />
      </Routes>

      {/* Toast notifications sit outside the route tree so they survive
          route transitions without unmounting mid-display */}
      <ToastContainer />
    </>
  );
}

// Memoized to prevent unnecessary re-renders when the provider tree above re-renders
const MemoizedAppContent = React.memo(AppContent);

export default function App() {
  return (
    // Provider order matters:
    // 1. AuthContextProvider — outermost, everything else reads from it
    // 2. TimezoneProvider — reads auth state so must be inside AuthContextProvider
    // 3. MemoizedAppContent — reads auth state so must be inside AuthContextProvider
    <AuthContextProvider>
      <TimezoneProvider saveProfileTz={false}>
        <MemoizedAppContent />
      </TimezoneProvider>
    </AuthContextProvider>
  );
}

