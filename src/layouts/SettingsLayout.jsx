import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SETTINGS_META = {
  accountinfo: {
    title: "Profile & Account",
    desc: " View your personal details and account registration information.",
  },
  security: {
    title: "Security & Privacy",
    desc: "Manage your password, view sign-in activity, and protect your account with 2FA.",
  },
  notifications: {
    title: "Notifications",
    desc: "Configure alerts, emails, and notification preferences.",
  },
  preferences: {
    title: "AI & Content Preferences",
    desc: "Update your role, tone, and content platform preferences.",
  },
  appearance: {
    title: "Appearance & Display",
    desc: "Customize theme, layout, and visual display settings.",
  },
  aboutremindrai: {
    title: "About RemindrAI",
    desc: "View version information, legal documents, and app details.",
  },
  deleteaccount: {
    title: "Delete Account",
    desc: "Permanently remove your account and all associated data.",
  },
};

const SettingsLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isRoot = location.pathname === "/workspace/settings";
  const key = location.pathname.split("/").pop();
  const meta = SETTINGS_META[key];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      {!isRoot && meta && (
        <div className="px-5 pt-6 pb-4">
          <button
            onClick={() => navigate("/workspace/settings")}
            className="flex items-center gap-2 text-sm text-gray-500
                       hover:text-gray-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Settings
          </button>

          <h1 className="mt-4 text-4xl font-semibold lg:text-center text-gray-900 dark:text-white">
            {meta.title}
          </h1>

          <p className="mt-1 text-sm text-gray-600 lg:text-center dark:text-gray-400">
            {meta.desc}
          </p>
        </div>
      )}

      {/* Content */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsLayout;
