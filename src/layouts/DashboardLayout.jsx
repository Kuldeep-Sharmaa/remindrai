// ============================================================================
// 📁 src/layouts/DashboardLayout.jsx
// ----------------------------------------------------------------------------
// 🧠 Clean, OpenAI-inspired minimal layout
// 🌗 Fully responsive with dark/light theme harmony
// 💡 Global proactive AI notification hook integrated (for YC demo)
// 💡 Now includes TimezoneChangeModal for smart timezone sync
// ----------------------------------------------------------------------------

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import Sidebar from "./DashboardLayout/Sidebar";
import Topbar from "./DashboardLayout/Topbar";
import LogoutModal from "./DashboardLayout/LogoutModal";
import { useAuthContext } from "../context/AuthContext";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary";

// 🔔 Global proactive AI demo (YC)
import useDemoTriggerGlobal from "../features/remindersystem/demo/useDemoTriggerGlobal.jsx";
import DemoDraftModal from "../features/remindersystem/demo/DemoDraftModal";

// 🕐 NEW: Smart timezone modal
import TimezoneChangeModal from "../components/TimezoneChangeModal";

const DashboardLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);

  // 🔔 Global proactive AI demo notifications
  useDemoTriggerGlobal();

  // --------------------------------------------------------------------------
  // 🧩 Responsive resize + scroll lock
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const mobileNow = window.innerWidth < 1024;
        setIsMobile(mobileNow);
        if (!mobileNow && sidebarExpanded) setSidebarExpanded(false);
      }, 200);
    };

    const applyScrollLock = () => {
      if (isMobile && sidebarExpanded) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };

    applyScrollLock();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
      document.body.style.overflow = "";
    };
  }, [sidebarExpanded, isMobile]);

  // --------------------------------------------------------------------------
  // 🚪 Logout flow
  // --------------------------------------------------------------------------
  const handleLogoutConfirm = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const result = await logout();
      if (result?.success) navigate("/");
      else setIsLoggingOut(false);
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    } finally {
      setShowLogoutModal(false);
    }
  }, [logout, navigate]);

  const handleSidebarLinkClick = useCallback(() => {
    setSidebarExpanded(false);
  }, []);

  const handleOpenLogout = useCallback(() => setShowLogoutModal(true), []);
  const handleCloseLogout = useCallback(() => setShowLogoutModal(false), []);

  // --------------------------------------------------------------------------
  // ⬆️ Scroll reset on route change
  // --------------------------------------------------------------------------
  useEffect(() => {
    try {
      if (scrollRef?.current) scrollRef.current.scrollTop = 0;
      else if (typeof window !== "undefined") window.scrollTo(0, 0);
    } catch (err) {
      console.warn("[DashboardLayout] scroll restore failed", err);
    }
  }, [location.pathname]);

  // --------------------------------------------------------------------------
  // 🔧 Toast alignment logic (keep your existing)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = null;
    let observer = null;

    const realignToaster = () => {
      const wrapper = document.querySelector(
        '#_rht_toaster > div[style*="justify-content: center"]'
      );
      const main = document.querySelector("#main-scroll-container");

      if (!wrapper || !main) return;

      const rect = main.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;

      wrapper.style.position = "fixed";
      wrapper.style.left = `${centerX}px`;
      wrapper.style.top = `${Math.max(64, 70)}px`;
      wrapper.style.right = "auto";
      wrapper.style.transform = "translateX(-50%)";
      wrapper.style.pointerEvents = "none";
      wrapper.style.display = "flex";
      wrapper.style.justifyContent = "center";
      wrapper.style.zIndex = "99999";
    };

    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(realignToaster);
    };

    realignToaster();
    window.addEventListener("resize", onResize);

    observer = new MutationObserver(() => realignToaster());
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

  // --------------------------------------------------------------------------
  // ✅ Layout Render
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-black flex justify-center overflow-hidden">
      <div className="w-full max-w-screen-2xl flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          expanded={sidebarExpanded}
          setExpanded={setSidebarExpanded}
          onLogoutClick={handleOpenLogout}
          onLinkClick={handleSidebarLinkClick}
        />

        {/* Mobile Overlay */}
        <div
          className={`fixed inset-0 z-20 lg:hidden transition-opacity duration-300 ease-in-out ${
            sidebarExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
          } bg-black/50 backdrop-blur-sm`}
          onClick={() => setSidebarExpanded(false)}
        />

        {/* Main Section */}
        <div
          className={`flex flex-col flex-1 min-h-screen overflow-hidden transition-all duration-500 ease-in-out ${
            sidebarExpanded ? "lg:ml-64" : "lg:ml-20"
          }`}
        >
          {/* Topbar */}
          <Topbar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

          {/* Main Scroll Area */}
          <main
            ref={scrollRef}
            id="main-scroll-container"
            className={`flex-1 overflow-y-auto scroll-smooth px-4 sm:px-6 lg:px-8 pb-10 pt-20 transition-all duration-500 ease-in-out ${
              sidebarExpanded && isMobile
                ? "transform scale-95 opacity-75 pointer-events-none"
                : "transform scale-100 opacity-100"
            }`}
          >
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>

        {/* Logout Modal */}
        {showLogoutModal && (
          <LogoutModal
            isOpen={showLogoutModal}
            onCancel={handleCloseLogout}
            onConfirm={handleLogoutConfirm}
            isLoggingOut={isLoggingOut}
          />
        )}
      </div>

      {/* 🌐 Timezone Sync Modal (smart auto-detect) */}
      <TimezoneChangeModal />

      {/* 🧪 DEV-ONLY: Demo Draft Modal */}
      {process.env.NODE_ENV !== "production" && <DemoDraftModal />}
    </div>
  );
};

export default React.memo(DashboardLayout);
