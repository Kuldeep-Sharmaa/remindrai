import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Palette,
  Trash2,
  Settings,
  ChevronRight,
  SlidersHorizontal,
  Info,
  Key,
} from "lucide-react";

const SettingsPage = () => {
  const navigate = useNavigate();

  const settingsItems = [
    {
      icon: User,
      title: "Profile & Account",
      description:
        "Your personal details and account registration information.",
      path: "/workspace/settings/accountinfo",
    },
    {
      icon: Key,
      title: "Security & Privacy",
      description:
        "Manage your password and enhance your account protection with 2FA.",
      path: "/workspace/settings/security",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure alerts, emails, and notification preferences.",
      path: "/workspace/settings/notifications",
    },
    {
      icon: SlidersHorizontal,
      title: "AI & Content Preferences",
      description:
        "Update your role, tone, and content platform preferences for AI.",
      path: "/workspace/settings/preferences",
    },
    {
      icon: Palette,
      title: "Appearance & Display",
      description: "Customize theme, layout, and visual display settings.",
      path: "/workspace/settings/appearance",
    },
    {
      icon: Info,
      title: "About RemindrAI",
      description:
        "View version information, terms of service, and privacy policy.",
      path: "/workspace/settings/aboutremindrai",
    },
    {
      icon: Trash2,
      title: "Delete Account",
      description: "Permanently remove your account and all associated data.",
      path: "/workspace/settings/deleteaccount",
      variant: "destructive",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-3xl mx-auto lg:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-10 md:mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <Settings className="h-9 w-9 text-gray-700 dark:text-gray-300" />
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-gray-900 dark:text-white">
              Settings
            </h1>
          </div>
          <p className="text-gray-700 dark:text-gray-400 text-base sm:text-lg leading-relaxed">
            Manage your RemindrAI account preferences and personalize your
            experience.
          </p>
        </div>

        {/* Settings List */}
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-xl shadow-lg border border-gray-300/40 dark:border-white/10 overflow-hidden">
          {settingsItems.map((item, index) => {
            const Icon = item.icon;
            const isDestructive = item.variant === "destructive";

            return (
              <button
                key={item.path}
                aria-label={item.title}
                onClick={() => navigate(item.path)}
                className={`group flex items-center justify-between w-full text-left p-5 transition-colors duration-200 ease-in-out
                  ${
                    isDestructive
                      ? "bg-red-50/70 dark:bg-red-900/20 hover:bg-red-100/80 dark:hover:bg-red-800/40"
                      : "hover:bg-gray-100/60 dark:hover:bg-gray-700/40"
                  }
                  ${
                    index < settingsItems.length - 1
                      ? "border-b border-gray-300/40 dark:border-white/10"
                      : ""
                  }
                `}
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`flex-shrink-0 rounded-lg p-3 transition-colors duration-200
                      ${
                        isDestructive
                          ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 group-hover:bg-red-200 dark:group-hover:bg-red-800"
                          : "bg-gray-100 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-lg font-medium mb-0.5
                        ${
                          isDestructive
                            ? "text-red-700 dark:text-red-300"
                            : "text-gray-900 dark:text-white"
                        }
                      `}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`text-sm leading-snug 
                        ${
                          isDestructive
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      `}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`h-5 w-5 ml-4 transition-transform group-hover:translate-x-1
                    ${
                      isDestructive
                        ? "text-red-400 dark:text-red-500"
                        : "text-gray-400 dark:text-gray-500"
                    }
                  `}
                />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-300/40 dark:border-white/10 text-center">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>
              Need assistance? Explore our documentation or reach out to
              support.
            </p>
            <div className="flex gap-6">
              <a
                href="/docs"
                className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Documentation
              </a>
              <a
                href="/contact"
                className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Support
              </a>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} RemindrAI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
