import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Background from "../components/Background";

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
    location.pathname.startsWith(route),
  );

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent">
      {/* overflow-x-hidden moved here so it never creates a new scroll container on the root */}
      <div className="fixed inset-0 z-10 overflow-x-hidden">
        <Background />
      </div>

      {!shouldHideNavbar && (
        <div className="relative z-30">
          <Navbar />
        </div>
      )}

      <main className="relative z-20 flex-grow">{children}</main>

      {!shouldHideNavbar && (
        <footer className="relative z-20">
          <Footer />
        </footer>
      )}
    </div>
  );
};

export default PublicLayout;
