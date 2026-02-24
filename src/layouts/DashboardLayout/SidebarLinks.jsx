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
    href: "/dashboard",
  },
  {
    label: "Studio",
    icon: <CalendarCheck2 size={20} />,
    href: "/dashboard/studio",
  },
  {
    label: "Deliveries",
    icon: <FileText size={20} />,
    href: "/dashboard/deliveries",
  },

  {
    label: "Settings",
    icon: <Settings size={20} />,
    href: "/dashboard/settings",
  },
  {
    label: "Logout",
    icon: <LogOut size={20} />,
    href: "/logout",
  },
];
