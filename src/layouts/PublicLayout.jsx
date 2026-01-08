import React, { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Background = lazy(() => import("../components/Background"));

const PublicLayout = ({ children }) => {
  const location = useLocation();

  const hideNavbarRoutes = [
    "/auth",
    "/Auth",
    "/verify-email",
    "/auth/forgot-password",
    "login",
    "signup",
  ];

  const shouldHideNavbar = hideNavbarRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-transparent">
      {/* Background loads without blocking content */}
      <div className="fixed inset-0 z-10">
        <Suspense fallback={null}>
          <Background />
        </Suspense>
      </div>

      {/*  Navbar */}
      {!shouldHideNavbar && (
        <div className="relative z-30">
          <Navbar />
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-20 flex-grow">{children}</main>

      {/* Footer */}
      {!shouldHideNavbar && (
        <footer className="relative z-20">
          <Footer />
        </footer>
      )}
    </div>
  );
};

export default PublicLayout;
