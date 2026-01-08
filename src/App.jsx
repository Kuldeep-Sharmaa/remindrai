// App.jsx
// Central app router + providers
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Auth & Layout
import { AuthContextProvider, useAuthContext } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Theme Hook
import { useTheme } from "./hooks/useTheme";

// Pages (public)
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import Features from "./pages/FeaturePgae";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DocsPage from "./pages/Docs/index";

// Legal
import Privacy from "./pages/Legal/Privacy";
import Terms from "./pages/Legal/Terms";
import GDPR from "./pages/Legal/Gdpr";

// Onboarding / Dashboard
import Onboarding from "./pages/OnboardingSetup";
import DashboardHome from "./pages/Dashboard/Overview";
import Deliveries from "./pages/Dashboard/Content";
import Insights from "./pages/Dashboard/Insights";
import Studio from "./pages/Dashboard/Reminders";
import SettingsPage from "./pages/SettingsPage";

// Settings sub-pages
import AccountInfo from "./pages/Dashboard/settings/AccountInfo";
import Notification from "./pages/Dashboard/settings/NotificationPreferences";
import Appearance from "./pages/Dashboard/settings/Appearance";
import DeleteAccount from "./pages/Dashboard/settings/DeleteAccountButton";
import Preferences from "./pages/Dashboard/settings/Preferences";
import Security from "./pages/Dashboard/settings/Security";
import Aboutremindrai from "./pages/Dashboard/settings/AboutRemindrPost";

// Reminder screens (new)
import CreateReminderScreen from "./features/remindersystem/screens/CreateReminderScreen";

// Components
import ToastContainer from "./components/ToastSystem/ToastContainer";
import ScrollToTop from "./components/ScrollToTop";
import Spinner from "./components/Ui/LoadingSpinner"; // small loading fallback

// Timezone Provider (global) - NEW import
import { TimezoneProvider } from "./context/TimezoneProvider";

/**
 * AppContent
 *
 * - Loads core systems (auth, profile, theme) before rendering app routes.
 * - Uses AnimatePresence + motion for entrance/exit animation but avoids remounting
 *   shared layout by NOT keying the top-level motion wrapper on location.pathname.
 *
 * ⚠️ Important: Removing the key here is the **primary fix** to stop full-dashboard remounts.
 *            If you want page-level transitions while keeping layout mounted, move the
 *            AnimatePresence + motion wrapper INSIDE DashboardLayout around <Outlet />.
 */
function AppContent() {
  const {
    currentUser,
    loading: authLoading,
    hasLoadedProfile,
    isUserLoggingOut,
  } = useAuthContext();

  const { isInitialized: themeInitialized } = useTheme();

  // Core systems must be ready before showing main routes.
  // This prevents a flash of broken UI while auth/profile/theme initialize.
  const coreSystemsReady = !authLoading && hasLoadedProfile && themeInitialized;

  // Short loading fallback while core systems initialize (prevents white-flash or broken UI)
  if (!coreSystemsReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {/* 
        AnimatePresence + motion provides smooth entrance/exit animations.
        NOTE: Do NOT key this motion.div with location.pathname — doing so forces React
        to remount everything under it when the key changes (sidebar/topbar/layout included).
        Keying by pathname is the cause of the "whole dashboard reloads" issue.
      */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          // 🔧 key intentionally omitted to avoid remounting shared layout
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="min-h-screen"
        >
          {/* ScrollToTop uses useLocation internally — keep it inside the app so it runs on route changes */}
          <ScrollToTop />

          {/* ----------------- ROUTES ----------------- */}
          <Routes>
            {/* ----------------- PUBLIC ROUTES ----------------- */}
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
              path="/contact"
              element={
                <PublicRoute>
                  <PublicLayout>
                    <Contact />
                  </PublicLayout>
                </PublicRoute>
              }
            />

            {/* Auth routes */}
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
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <PublicLayout>
                    <Auth />
                  </PublicLayout>
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <PublicLayout>
                    <Auth />
                  </PublicLayout>
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <PublicLayout>
                    <Auth />
                  </PublicLayout>
                </PublicRoute>
              }
            />

            {/* ----------------- PROTECTED / DASHBOARD ROUTES ----------------- */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* default dashboard page */}
              <Route index element={<DashboardHome />} />

              {/* Reminders list (route: /dashboard/studio) */}
              <Route path="studio" element={<Studio />} />

              {/* Create reminder (route: /dashboard/studio/create) */}
              <Route path="studio/create" element={<CreateReminderScreen />} />

              {/* Other dashboard routes */}
              <Route path="deliveries" element={<Deliveries />} />
              <Route path="insights" element={<Insights />} />

              {/* Settings & nested settings routes */}
              <Route path="settings" element={<SettingsPage />} />
              <Route path="settings/accountinfo" element={<AccountInfo />} />
              <Route path="settings/notifications" element={<Notification />} />
              <Route path="settings/security" element={<Security />} />
              <Route path="settings/preferences" element={<Preferences />} />
              <Route path="settings/appearance" element={<Appearance />} />
              <Route
                path="settings/aboutremindrai"
                element={<Aboutremindrai />}
              />
              <Route
                path="settings/deleteaccount"
                element={<DeleteAccount />}
              />
            </Route>

            {/* Email Verification (protected) */}
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

            {/* Onboarding (protected) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* Catch-all: smart redirect depending on auth state */}
            <Route
              path="*"
              element={
                isUserLoggingOut ? (
                  <Navigate to="/" replace />
                ) : currentUser ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {/* ToastContainer kept outside AnimatePresence so toasts persist across route transitions
          — otherwise toasts would unmount/remount as the animated subtree changes. */}
      <ToastContainer />
    </>
  );
}

// Memoize the app content so it doesn't re-render unnecessarily when parent uses provider re-renders
const MemoizedAppContent = React.memo(AppContent);

export default function App() {
  // 🔒 Core provider: keeps auth state and other app-level providers in the tree
  return (
    <AuthContextProvider>
      {/* 
        ✅ CORRECT PROVIDER ORDER:
        1. AuthContextProvider (outermost - provides useAuthContext)
        2. TimezoneProvider (calls useAuthContext - must be inside AuthContextProvider)
        3. MemoizedAppContent (calls useAuthContext - must be inside AuthContextProvider)
      */}
      <TimezoneProvider saveProfileTz={false}>
        <MemoizedAppContent />
      </TimezoneProvider>
    </AuthContextProvider>
  );
}
