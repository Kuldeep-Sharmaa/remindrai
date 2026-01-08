import React from "react";
import { useAppInfo } from "../../../hooks/useAppInfo";
import {
  Package,
  CalendarDays,
  FileText,
  Shield,
  Info,
  Globe,
  Server,
} from "lucide-react";

export default function Aboutremindrai() {
  const { name, version } = useAppInfo();

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-2xl mb-6 shadow-md">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white mb-4 tracking-tight">
            {name}
          </h1>
          <div className="w-24 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto">
            Enterprise Social Media Management Platform
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* System Information */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-xl border border-gray-300/40 dark:border-white/10 shadow-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-300/40 dark:border-white/10">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                System Information
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Version */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700/40 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Version
                    </dt>
                    <dd className="mt-1 text-2xl font-light text-gray-900 dark:text-white">
                      {version}
                    </dd>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Status
                    </dt>
                    <dd className="mt-1 text-2xl font-light text-green-600 dark:text-green-400">
                      Operational
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-xl border border-gray-300/40 dark:border-white/10 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-300/40 dark:border-white/10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Documentation
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                { href: "/terms", label: "Terms of Service", icon: FileText },
                { href: "/privacy", label: "Privacy Policy", icon: Shield },
                { href: "/docs", label: "Documentation", icon: Info },
              ].map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  className="flex items-center justify-between p-4 border border-gray-300/40 dark:border-white/10 rounded-lg hover:bg-gray-100/60 dark:hover:bg-gray-700/40 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {label}
                    </span>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-300/40 dark:border-white/10">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} {name || "remindrai"}. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
