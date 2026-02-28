import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  LogOut,
  UserCircle,
  Crown,
  Palette,
  BarChart3,
  Shield,
  Lock,
  LifeBuoy,
  LayoutDashboard,
  Unlock,
  Rocket,
  FileText,
  Loader2,
} from "lucide-react";
import ThemeToggle from "./ThemeToggleButton";
import { useAuthContext } from "../context/AuthContext";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const authContext = useAuthContext();

  // Check if auth is still loading/initializing
  const isAuthLoading =
    authContext?.isLoading ||
    authContext?.loading ||
    authContext?.initializing ||
    authContext === undefined ||
    authContext === null;

  // Robust authentication checking with fallback options
  const isLoggedIn =
    !isAuthLoading &&
    (authContext?.isAuthenticated ||
      authContext?.authenticated ||
      authContext?.loggedIn ||
      !!authContext?.user ||
      !!authContext?.currentUser ||
      false);

  const user = authContext?.user || authContext?.currentUser;
  const logout = authContext?.logout || authContext?.signOut;

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const toggleUserDropdown = useCallback(() => {
    setShowUserDropdown((prev) => !prev);
  }, []);

  // Cleanup body overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-dropdown-container")) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showUserDropdown]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [window.location.pathname]);

  const closeMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const handleLogout = useCallback(() => {
    if (logout) {
      logout();
    }
    setShowUserDropdown(false);
    closeMenu();
  }, [logout, closeMenu]);

  // Navigation items for visitors (limited access)
  const visitorNavItems = [
    { to: "/features", label: "Features", icon: Rocket, isLocked: false },
    { to: "/about", label: "About", icon: Shield, isLocked: false },
    { to: "/contact", label: "Contact", icon: LifeBuoy, isLocked: false },
    { to: "/docs", label: "Resources", icon: FileText, isLocked: false },
  ];

  // Navigation items for logged-in users (full access)
  const userNavItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      isUnlocked: true,
    },
    {
      to: "/dashboard/insights",
      label: "Insights",
      icon: BarChart3,
      isUnlocked: true,
    },
    { to: "/about", label: "About", icon: Shield },
    { to: "/contact", label: "Support", icon: LifeBuoy },
    { to: "/docs", label: "Docs", icon: FileText },
  ];

  const currentNavItems = isLoggedIn ? userNavItems : visitorNavItems;

  // Show skeleton/loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/60 backdrop-blur-md border-b border-black/5 dark:border-white/5
"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <img
                src="/transparent_logo.svg"
                alt="RemindrAI Logo"
                className="h-8 sm:h-10 "
              />
            </div>
          </Link>

          {/* Loading Navigation Skeleton */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
              >
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </nav>

          {/* Loading Right Section */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="p-2 rounded-lg lg:hidden bg-gray-100 dark:bg-gray-800"
            disabled
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </header>
    );
  }

  return (
    <div key={`navbar-${isLoggedIn}-${user?.id || "guest"}`}>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/60 backdrop-blur-md border-b border-black/5 dark:border-white/5
"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Logo with Premium Status */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <img
                src="/transparent_logo.svg"
                alt="RemindrAI Logo"
                className="h-8 sm:h-10 "
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {currentNavItems.map((item) => (
              <div key={item.to} className="relative group">
                <Link
                  to={item.isLocked ? "#" : item.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium relative ${
                    item.isLocked
                      ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : item.isUnlocked
                        ? "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={
                    item.isLocked ? (e) => e.preventDefault() : undefined
                  }
                  aria-label={`Navigate to ${item.label}`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>

                  {item.isLocked && <Lock className="w-3 h-3 text-gray-400" />}
                </Link>
              </div>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />

            {!isLoggedIn ? (
              // Visitor CTA
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 text-white text-sm font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform relative overflow-hidden"
                  aria-label="Sign up for full access"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Unlock className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Unlock Full Access</span>
                  <Crown className="w-4 h-4 relative z-10" />
                </Link>
              </div>
            ) : (
              // User Account Dropdown
              <div className="relative user-dropdown-container">
                <button
                  onClick={toggleUserDropdown}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900/30 dark:hover:to-blue-900/30 text-sm font-medium transition-all duration-200 border border-green-200 dark:border-green-800 shadow-sm"
                  aria-label="User account menu"
                  aria-expanded={showUserDropdown}
                >
                  <div className="relative">
                    <div className="p-1 bg-gradient-to-r from-green-500 to-blue-600 rounded-full">
                      <UserCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-700 dark:text-green-300 font-bold">
                      ACTIVE
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full " />
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      showUserDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showUserDropdown && (
                  <>
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 py-3 animate-in slide-in-from-top-2 duration-200 overflow-hidden z-50">
                      {/* Premium Status Header */}
                      <div className="px-4 py-4 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="relative p-3 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 rounded-xl text-white">
                            <Crown className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 dark:text-gray-100">
                                {user?.name || "Premium User"}
                              </span>
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-bold rounded-full">
                                PRO
                              </span>
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                              <Unlock className="w-3 h-3" />
                              Full Access Unlocked
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Account Actions */}
                      <div className="py-2">
                        <Link
                          to="/dashboard/settings/accountinfo"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                        >
                          <User className="w-4 h-4 text-gray-500" />
                          Profile Settings
                        </Link>

                        <Link
                          to="/dashboard/settings"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                        >
                          <Palette className="w-4 h-4 text-gray-500" />
                          Settings
                        </Link>
                      </div>
                    </div>
                    {/* Backdrop for dropdown */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserDropdown(false)}
                      aria-hidden="true"
                    />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg lg:hidden bg-gray-100 dark:bg-black hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300 transform transition-transform duration-300 ease-in-out rotate-90 scale-110" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300 transform transition-transform duration-300 ease-in-out rotate-0 scale-100" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Slide-in Menu */}
      <div
        className={`fixed top-16 right-0 w-80 max-w-[85vw] h-[calc(100vh-4rem)] bg-white dark:bg-black shadow-2xl border-l border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out z-40 lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="navigation"
        aria-label="Mobile navigation menu"
      >
        <div className="flex flex-col h-full">
          {/* Status Section */}
          <div
            className={`px-6 py-4 border-b border-gray-200 dark:border-gray-800 ${
              isLoggedIn
                ? "bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20"
                : "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20"
            }`}
          >
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="relative p-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 rounded-xl text-white">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {user?.name || "Premium User"}
                    </p>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-bold rounded-full">
                      PRO
                    </span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    Full Access Active
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    Guest User
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Limited Access
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-1">
              {currentNavItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.isLocked ? "#" : item.to}
                  onClick={
                    item.isLocked ? (e) => e.preventDefault() : closeMenu
                  }
                  className={`flex items-center gap-2 px-4 py-4 rounded-xl transition-colors font-medium text-base relative ${
                    item.isLocked
                      ? "text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50"
                      : item.isUnlocked
                        ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  <span>{item.label}</span>

                  {item.isLocked && (
                    <div className="flex-1 flex justify-end">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </Link>
              ))}

              {/* Account Section (for logged-in users) */}
              {isLoggedIn && (
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                  <div className="px-4 pb-2">
                    <h3 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-2">
                      <Crown className="w-3 h-3" />
                      Premium Settings
                    </h3>
                  </div>
                  <Link
                    to="/dashboard/settings/accountinfo"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-500" />
                    Profile
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-500" />
                    Settings
                  </Link>
                </div>
              )}

              {/* Auth CTA (for visitors) */}
              {!isLoggedIn && (
                <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800 space-y-3">
                  <Link
                    to="/auth"
                    onClick={closeMenu}
                    className="group flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Unlock className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Unlock Full Access</span>
                    <Crown className="w-4 h-4 relative z-10" />
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Footer Section */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={closeMenu}
          style={{ top: "4rem" }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
