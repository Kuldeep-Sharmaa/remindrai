import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  LayoutDashboard,
  Unlock,
  Lock,
} from "lucide-react";
import ThemeToggle from "./ThemeToggleButton";
import { useAuthContext } from "../context/AuthContext";

const VISITOR_NAV = [
  { to: "/features", label: "Product" },
  { to: "/#how-it-works", label: "How it works" },
  { to: "/docs", label: "Docs" },
  { to: "/about", label: "About" },
];

const USER_NAV = [
  { to: "/docs", label: "Docs" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Support" },
];

const getInitial = (u) =>
  (u?.fullName || u?.email || "U").charAt(0).toUpperCase();
const getFirstName = (u) =>
  u?.fullName?.split(" ")[0] || u?.email?.split("@")[0] || "there";

export default function Navbar() {
  const { currentUser, loading, hasLoadedProfile } = useAuthContext();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLoggedIn = !loading && hasLoadedProfile && !!currentUser;
  const navItems = isLoggedIn ? USER_NAV : VISITOR_NAV;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const fn = (e) => {
      if (!e.target.closest("[data-dropdown]")) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [dropdownOpen]);

  // Prevent background page from scrolling while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  // Show a matching skeleton while auth resolves so the layout doesn't jump
  if (loading && !hasLoadedProfile) {
    return (
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-5 h-full flex items-center justify-between">
          <div className="w-28 h-4 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
          <div className="hidden lg:flex items-center gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-16 h-3 bg-gray-100 dark:bg-white/5 rounded animate-pulse"
              />
            ))}
          </div>
          <div className="w-24 h-8 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-md transition-all duration-300 ${
          scrolled
            ? "border-b border-gray-200 dark:border-white/10 shadow-sm shadow-black/[0.04]"
            : "border-b border-gray-100/50 dark:border-white/[0.06]"
        }`}
      >
        {/*
          Three equal-width columns: logo | nav | actions.
          Giving the logo and actions the same fixed width (w-36) keeps
          the center nav optically centered without any JS measurements.
        */}
        <div className="max-w-6xl mx-auto px-5 h-full flex items-center">
          <div className="flex-shrink-0 w-36">
            <Link to="/" aria-label="RemindrAI home" className="inline-flex">
              <img
                src="/transparent_logo.svg"
                alt="RemindrAI"
                className="h-9 w-auto"
              />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center justify-center gap-0.5 flex-1">
            {isLoggedIn && (
              <Link
                to="/workspace"
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold font-grotesk transition-all duration-150 mr-2
                  ${
                    isActive("/workspace")
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
                      : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20"
                  }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Workspace
              </Link>
            )}

            {navItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`relative px-3.5 py-2 text-sm rounded-lg transition-colors duration-150 font-inter
                  ${
                    isActive(to)
                      ? "text-brand dark:text-brand-soft font-medium"
                      : "text-gray-500/90 dark:text-gray-400/90 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
              >
                {label}
                {isActive(to) && (
                  <span className="absolute bottom-0.5 left-3.5 right-3.5 h-0.5 rounded-full bg-brand" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center justify-end gap-2.5 flex-shrink-0 w-36">
            <ThemeToggle />

            {!isLoggedIn ? (
              // "Unlock" communicates access to something meaningful — not a feature, not a tool.
              // Icon sits after the word: action → result, the natural English reading direction.
              <Link
                to="/auth"
                className="
    group relative inline-flex items-center justify-center
    gap-3
    px-5 py-2.5
    rounded-xl
    bg-brand hover:bg-brand-hover
    text-white text-sm font-semibold font-grotesk
    whitespace-nowrap
    overflow-hidden
    transition-all duration-200 ease-out
    shadow-sm shadow-brand/20
  "
              >
                {/* Shimmer */}
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                {/* Label */}
                <span className="relative z-10 leading-none">Unlock</span>

                {/* Icon container */}
                <span className="relative z-10 flex items-center justify-center w-4 h-4">
                  {/* Locked */}
                  <Lock className="absolute w-4 h-4 transition-all duration-200 ease-out opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-75" />

                  {/* Unlock */}
                  <Unlock className="absolute w-4 h-4 transition-all duration-200 ease-out opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-6" />
                </span>
              </Link>
            ) : (
              <div className="relative" data-dropdown>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-expanded={dropdownOpen}
                  aria-label="Open your workspace"
                  className={`group flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full border transition-all duration-200
                    ${
                      dropdownOpen
                        ? "border-brand/40 bg-brand/8 dark:bg-brand/15 shadow-sm shadow-brand/10"
                        : "border-gray-200 dark:border-white/10 hover:border-brand/30 dark:hover:border-brand/30 bg-white dark:bg-white/5 hover:shadow-sm hover:shadow-brand/10"
                    }`}
                >
                  {/* Avatar — live green dot signals the system is still running */}
                  <div className="relative flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand to-blue-400 flex items-center justify-center text-white text-xs font-bold font-grotesk">
                      {getInitial(currentUser)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-[1.5px] border-white dark:border-black" />
                  </div>

                  <span className="text-sm font-medium font-inter max-w-[80px] truncate transition-colors duration-150 text-gray-600 dark:text-gray-400 group-hover:text-brand dark:group-hover:text-brand-soft">
                    {getFirstName(currentUser)}
                  </span>

                  <ChevronDown
                    className={`w-3 h-3 flex-shrink-0 transition-all duration-200 ${
                      dropdownOpen
                        ? "rotate-180 text-brand"
                        : "text-muted group-hover:text-brand"
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-bgImpact rounded-xl border border-gray-200 dark:border-white/10 shadow-xl shadow-black/10 py-1.5 z-50"
                    style={{ animation: "dropIn 0.14s ease forwards" }}
                  >
                    <div className="px-3.5 py-2.5 border-b border-gray-100 dark:border-white/5 mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-blue-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitial(currentUser)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate font-grotesk">
                            {currentUser?.fullName || "User"}
                          </p>
                          <p className="text-[11px] text-muted truncate font-inter">
                            {currentUser?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/workspace/settings/accountinfo"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-inter"
                    >
                      <User className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                      Profile
                    </Link>
                    <Link
                      to="/workspace/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-inter"
                    >
                      <Settings className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                      Settings
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ThemeToggle lives inside the mobile panel, not here */}
          <div className="lg:hidden ml-auto flex items-center">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-150"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden transition-opacity duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-64 bg-white dark:bg-black border-l border-gray-100 dark:border-white/5 lg:hidden flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Navigation"
      >
        {/* h-16 matches the navbar height so the close button aligns with the burger */}
        <div className="h-16 flex items-center justify-end px-4 border-b border-gray-100 dark:border-white/5 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-lg text-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pt-3 pb-6 flex flex-col gap-0.5">
          {isLoggedIn && (
            <Link
              to="/workspace"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold font-grotesk mb-1 transition-all duration-150
                ${
                  isActive("/workspace")
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                }`}
              style={{
                animation: mobileOpen
                  ? "slideIn 0.22s ease forwards 40ms"
                  : "none",
                opacity: 0,
              }}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              Workspace
            </Link>
          )}

          {navItems.map(({ to, label }, i) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150 font-inter
                ${
                  isActive(to)
                    ? "bg-brand/8 text-brand dark:text-brand-soft"
                    : "text-gray-500/90 dark:text-gray-400/90 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                }`}
              style={{
                animation: mobileOpen
                  ? `slideIn 0.22s ease forwards ${(i + (isLoggedIn ? 1 : 0)) * 45 + 60}ms`
                  : "none",
                opacity: 0,
              }}
            >
              {label}
              {isActive(to) && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
              )}
            </Link>
          ))}

          {isLoggedIn && (
            <>
              <div className="my-3 border-t border-gray-100 dark:border-white/5" />
              <Link
                to="/workspace/settings/accountinfo"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-500/90 dark:text-gray-400/90 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-inter"
              >
                <User className="w-4 h-4 text-muted flex-shrink-0" />
                Profile
              </Link>
              <Link
                to="/workspace/settings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-500/90 dark:text-gray-400/90 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-inter"
              >
                <Settings className="w-4 h-4 text-muted flex-shrink-0" />
                Settings
              </Link>
            </>
          )}

          {!isLoggedIn && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex flex-col gap-2">
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="group relative flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-semibold font-grotesk overflow-hidden transition-all duration-200"
              >
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <span className="relative z-10">Unlock</span>
                <span className="relative z-10 flex items-center justify-center w-3.5 h-3.5">
                  <Lock className="absolute inset-0 w-3.5 h-3.5 transition-all duration-200 ease-out opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-75" />
                  <Unlock className="absolute inset-0 w-3.5 h-3.5 transition-all duration-200 ease-out opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-6" />
                </span>
              </Link>
            </div>
          )}
        </nav>

        {/* ThemeToggle is pinned here so it's always reachable with one thumb on mobile */}
        <div className="px-4 py-4 border-t border-gray-100 dark:border-white/5 flex-shrink-0">
          <div className="flex items-center justify-between">
            {isLoggedIn ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-blue-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {getInitial(currentUser)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate font-grotesk">
                    {currentUser?.fullName || "User"}
                  </p>
                  <p className="text-[11px] text-muted truncate font-inter">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-xs text-muted font-inter">RemindrAI</span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
