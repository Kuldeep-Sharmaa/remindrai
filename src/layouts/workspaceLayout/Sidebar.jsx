import React from "react";
import SidebarNav from "./SidebarNav";

export default function Sidebar({ expanded, setExpanded, onLogoutClick }) {
  return (
    <aside
      className={`fixed top-0 left-0 h-[100dvh] flex flex-col dark:bg-black bg-white
                  border-r border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.3)]
                  transition-all duration-500 ease-in-out z-30
                  ${expanded ? "w-64" : "w-20"}
                  ${expanded ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      <div className="h-16 flex-shrink-0" />

      <div className="flex flex-col flex-1 overflow-hidden">
        <SidebarNav
          expanded={expanded}
          onLinkClick={() => setExpanded(false)}
          onLogoutClick={onLogoutClick}
        />
      </div>
    </aside>
  );
}
