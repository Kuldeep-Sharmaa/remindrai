// features/.../SidebarNav.jsx
import React, { useCallback } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { SidebarLinks } from "./SidebarLinks";
import { Globe } from "lucide-react";

/**
 * SidebarNav - defensive, memoized nav for dashboard sidebar
 *
 * - Home (/dashboard) is exact-match only
 * - Other parent links (e.g. /dashboard/reminders, /dashboard/settings)
 *   are considered active for their nested child routes (startsWith)
 */
function SidebarNav({
  expanded = false,
  onLinkClick = () => {},
  onLogoutClick = () => {},
}) {
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Enhanced active-path detection rules:
   * - If href === "/dashboard" (home), only match exact pathname === "/dashboard"
   * - Otherwise, match exact OR startsWith(href + "/") to include nested child routes
   * - Normalizes trailing slash in href for consistent startsWith checks
   */
  const isPathActive = useCallback(
    (href) => {
      try {
        if (!href) return false;

        // Normalize trailing slash (except root "/")
        const normalized =
          href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;

        // Special-case: dashboard (home) should be exact only
        if (normalized === "/dashboard") {
          return location.pathname === "/dashboard";
        }

        // General case: exact match OR any nested child path counts as active
        if (location.pathname === normalized) return true;
        return location.pathname.startsWith(normalized + "/");
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn("[SidebarNav] isPathActive error:", err, href);
        }
        return false;
      }
    },
    [location.pathname]
  );

  const handleLinkClick = useCallback(
    (e, href) => {
      try {
        if (
          typeof window !== "undefined" &&
          window.innerWidth < 1024 &&
          typeof onLinkClick === "function"
        ) {
          onLinkClick();
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn("[SidebarNav] handleLinkClick failed:", err, href);
        }
      }
    },
    [onLinkClick]
  );

  const handleLogout = useCallback(() => {
    try {
      if (typeof onLogoutClick === "function") onLogoutClick();
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn("[SidebarNav] onLogoutClick error:", err);
      }
    }
  }, [onLogoutClick]);

  const isMobileView =
    typeof window !== "undefined" && window.innerWidth < 1024;

  return (
    <nav className="mt-6 px-3" aria-label="Main navigation">
      <ul className="space-y-2">
        {SidebarLinks.map((link) => {
          if (link.label === "Logout") return null;

          const active = isPathActive(link.href);

          return (
            <li key={link.href}>
              <NavLink
                to={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-300 hover:bg-gray-700/50 hover:text-white hover:shadow-md"
                } before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/20 before:to-purple-500/20 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg animate-in slide-in-from-left-2 duration-300" />
                )}

                <span
                  className={`flex-shrink-0 transition-all duration-300 z-10 ${
                    active ? "scale-110" : "group-hover:scale-105"
                  }`}
                >
                  {link.icon}
                </span>

                <span
                  className={`text-sm font-medium transition-all duration-300 ease-out z-10 ${
                    expanded
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4"
                  } ${!expanded && isMobileView ? "hidden" : ""}`}
                >
                  {link.label}
                </span>

                {!expanded && (
                  <div
                    className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out whitespace-nowrap z-50 hidden lg:block shadow-xl border border-gray-700 after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:-translate-x-1 after:w-2 after:h-2 after:bg-gray-900 after:rotate-45 after:border-l after:border-b after:border-gray-700"
                    role="tooltip"
                    aria-hidden={!expanded}
                  >
                    {link.label}
                  </div>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="absolute bottom-6 left-0 right-0 px-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 px-3 py-3 mb-2 rounded-xl transition-all duration-300 group relative overflow-hidden text-gray-300 hover:bg-gray-700/50 hover:text-white hover:shadow-md w-full ${
            !expanded && isMobileView ? "hidden" : ""
          }`}
        >
          <span
            className={`flex-shrink-0 transition-all duration-300 z-10 ${
              expanded ? "" : "group-hover:scale-105"
            }`}
          >
            <Globe size={20} />
          </span>
          <span
            className={`text-sm font-medium transition-all duration-300 ease-out z-10 ${
              expanded
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
            }`}
          >
            Visit Website
          </span>

          {!expanded && (
            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out whitespace-nowrap z-50 hidden lg:block shadow-xl border border-gray-700">
              Visit Website
            </div>
          )}
        </a>

        <div className="border-t border-gray-700/50 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:shadow-md w-full"
          >
            <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              {SidebarLinks.find((l) => l.label === "Logout")?.icon}
            </span>
            <span
              className={`text-sm font-medium transition-all duration-300 ease-out ${
                expanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4"
              } ${!expanded && isMobileView ? "hidden" : ""}`}
            >
              Logout
            </span>

            {!expanded && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out whitespace-nowrap z-50 hidden lg:block shadow-xl border border-gray-700">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default React.memo(SidebarNav);
