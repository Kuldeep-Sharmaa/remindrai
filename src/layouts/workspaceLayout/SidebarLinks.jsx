// ============================================================================
// 📁 src/constants/SidebarLinks.js
// ----------------------------------------------------------------------------
// Sidebar Navigation for RemindrAI Dashboard
// Tone: calm, confident, and professional
// ----------------------------------------------------------------------------

import {
  CalendarCheck2,
  FileText,
  BarChart3,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings,
} from "lucide-react";

export const SidebarLinks = [
  {
    label: "Overview",
    icon: <LayoutDashboard size={20} />,
    href: "/workspace",
  },
  {
    label: "Studio",
    icon: <CalendarCheck2 size={20} />,
    href: "/workspace/studio",
  },
  {
    label: "Drafts",
    icon: <FileText size={20} />,
    href: "/workspace/drafts",
  },

  {
    label: "Settings",
    icon: <Settings size={20} />,
    href: "/workspace/settings",
  },
  {
    label: "Logout",
    icon: <LogOut size={20} />,
    href: "/logout",
  },
];
