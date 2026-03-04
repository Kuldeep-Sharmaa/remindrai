import React, { useCallback } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { SidebarLinks } from "./SidebarLinks";

function SidebarNav({
  expanded = false,
  onLinkClick = () => {},
  onLogoutClick = () => {},
}) {
  const location = useLocation();

  const isPathActive = useCallback(
    (href) => {
      try {
        if (!href) return false;
        const normalized =
          href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;
        if (normalized === "/workspace") {
          return location.pathname === "/workspace";
        }
        if (location.pathname === normalized) return true;
        return location.pathname.startsWith(normalized + "/");
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[SidebarNav] isPathActive error:", err, href);
        }
        return false;
      }
    },
    [location.pathname],
  );

  const handleLinkClick = useCallback(() => {
    try {
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        onLinkClick();
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[SidebarNav] handleLinkClick failed:", err);
      }
    }
  }, [onLinkClick]);

  const handleLogout = useCallback(() => {
    try {
      if (typeof onLogoutClick === "function") onLogoutClick();
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[SidebarNav] onLogoutClick error:", err);
      }
    }
  }, [onLogoutClick]);

  const isMobileView =
    typeof window !== "undefined" && window.innerWidth < 1024;

  const logoutLink = SidebarLinks.find((l) => l.label === "Logout");

  return (
    <nav
      className="flex flex-col flex-1 px-3 text-black dark:text-white overflow-hidden"
      aria-label="Main navigation"
    >
      <ul className="flex-1 overflow-y-auto space-y-2 scrollbar-none pt-6">
        {SidebarLinks.map((link) => {
          if (link.label === "Logout") return null;

          const active = isPathActive(link.href);

          return (
            <li key={link.href}>
              <NavLink
                to={link.href}
                onClick={handleLinkClick}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                  ${
                    active
                      ? "bg-black dark:bg-white text-white dark:text-black shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/50 hover:text-black dark:hover:text-white hover:shadow-md"
                  }`}
              >
                <span
                  className={`flex-shrink-0 transition-all duration-300 z-10 ${active ? "scale-110" : "group-hover:scale-105"}`}
                >
                  {link.icon}
                </span>

                <span
                  className={`text-sm font-medium transition-all duration-300 ease-out z-10
                  ${expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
                  ${!expanded && isMobileView ? "hidden" : ""}`}
                >
                  {link.label}
                </span>

                {!expanded && (
                  <div
                    className="absolute left-full ml-3 px-3 py-2 bg-white dark:bg-gray-900 text-black dark:text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out whitespace-nowrap z-50 hidden lg:block shadow-xl border border-gray-200 dark:border-gray-700"
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

      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700/50 pt-4 pb-6 px-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden w-full text-gray-600 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-500"
        >
          <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
            {logoutLink?.icon}
          </span>

          <span
            className={`text-sm font-medium transition-all duration-300 ease-out
            ${expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
            ${!expanded && isMobileView ? "hidden" : ""}`}
          >
            Logout
          </span>

          {!expanded && (
            <div className="absolute left-full ml-3 px-3 py-2 bg-white dark:bg-gray-900 text-black dark:text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out whitespace-nowrap z-50 hidden lg:block shadow-xl border border-gray-200 dark:border-gray-700">
              Logout
            </div>
          )}
        </button>
      </div>
    </nav>
  );
}

export default React.memo(SidebarNav);
