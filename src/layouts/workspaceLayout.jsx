import React, { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import Sidebar from "./workspaceLayout/Sidebar";
import Topbar from "./workspaceLayout/Topbar";
import LogoutModal from "./workspaceLayout/LogoutModal";
import { useAuthContext } from "../context/AuthContext";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary";
import TimezoneChangeModal from "../components/TimezoneChangeModal";
import { useFCMToken } from "../hooks/useFCMToken";

const DashboardLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false,
  );

  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);

  // Registers this device for push notifications.
  useFCMToken();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let resizeTimer;

    const handleResize = () => {
      clearTimeout(resizeTimer);
      // Debounced so it doesn't thrash on every pixel during drag
      resizeTimer = setTimeout(() => {
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
        if (!mobile && sidebarExpanded) setSidebarExpanded(false);
      }, 200);
    };

    if (isMobile && sidebarExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
      document.body.style.overflow = "";
    };
  }, [sidebarExpanded, isMobile]);

  const handleLogoutConfirm = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const result = await logout();
      if (result?.success) {
        navigate("/");
      } else {
        setIsLoggingOut(false);
      }
    } catch (err) {
      console.error("[Logout]", err);
      setIsLoggingOut(false);
    } finally {
      setShowLogoutModal(false);
    }
  }, [logout, navigate]);

  const handleSidebarLinkClick = useCallback(() => {
    setSidebarExpanded(false);
  }, []);

  useEffect(() => {
    try {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      } else {
        window.scrollTo(0, 0);
      }
    } catch {}
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let raf;
    let observer;

    // Toast is rendered outside the sidebar — this keeps it visually centered
    // inside the main content area regardless of sidebar width
    const realignToaster = () => {
      const wrapper = document.querySelector(
        '#_rht_toaster > div[style*="justify-content: center"]',
      );
      const main = document.querySelector("#main-scroll-container");
      if (!wrapper || !main) return;

      const rect = main.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;

      wrapper.style.position = "fixed";
      wrapper.style.left = `${centerX}px`;
      wrapper.style.top = "70px";
      wrapper.style.transform = "translateX(-50%)";
      wrapper.style.pointerEvents = "none";
      wrapper.style.zIndex = "99999";
    };

    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(realignToaster);
    };

    realignToaster();
    window.addEventListener("resize", onResize);

    observer = new MutationObserver(realignToaster);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      window.removeEventListener("resize", onResize);
      if (observer) observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sidebarExpanded]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-screen w-full bg-bgLight dark:bg-bgDark flex justify-center overflow-hidden"
    >
      <div className="w-full max-w-screen-2xl flex overflow-hidden">
        <Sidebar
          expanded={sidebarExpanded}
          setExpanded={setSidebarExpanded}
          onLogoutClick={() => setShowLogoutModal(true)}
          onLinkClick={handleSidebarLinkClick}
        />

        <div
          className={`fixed inset-0 z-20 lg:hidden bg-black/50 transition-opacity ${
            sidebarExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSidebarExpanded(false)}
        />

        <div
          className={`flex flex-col flex-1 min-h-screen overflow-hidden transition-all ${
            sidebarExpanded ? "lg:ml-64" : "lg:ml-20"
          }`}
        >
          <Topbar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

          <main
            ref={scrollRef}
            id="main-scroll-container"
            className={`flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 transition-all ${
              sidebarExpanded && isMobile
                ? "scale-95 opacity-75 pointer-events-none"
                : ""
            }`}
          >
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>

        {showLogoutModal && (
          <LogoutModal
            isOpen
            onCancel={() => setShowLogoutModal(false)}
            onConfirm={handleLogoutConfirm}
            isLoggingOut={isLoggingOut}
          />
        )}
      </div>

      <TimezoneChangeModal />
    </motion.div>
  );
};

export default React.memo(DashboardLayout);
