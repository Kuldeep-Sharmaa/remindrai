import React from "react";
import { useAppInfo } from "../../../hooks/useAppInfo";
import { Package, FileText, Shield, Info, ChevronRight } from "lucide-react";

const DOCS_LINKS = [
  { href: "/terms", label: "Terms of Service", icon: FileText },
  { href: "/privacy", label: "Privacy Policy", icon: Shield },
  { href: "/docs", label: "Documentation", icon: Info },
];

export default function Aboutremindrai() {
  const { name, version } = useAppInfo();

  return (
    <div className="py-4 max-w-2xl w-full mx-auto ">
      {/* Version */}
      <section className="rounded-xl border border-gray-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-bgDark">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <h2 className="text-xl font-semibold font-grotesk text-textLight dark:text-textDark">
            System Information
          </h2>
        </div>
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
            <Package className="w-4 h-4 text-muted" />
          </div>
          <div>
            <p className="text-sm text-muted font-inter">Version</p>
            <p className="text-sm font-medium font-grotesk text-textLight dark:text-textDark">
              {version}
            </p>
          </div>
        </div>
      </section>

      {/* Documentation links */}
      <section className="rounded-xl border border-gray-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-bgDark">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <h2 className="text-xl font-semibold font-grotesk text-textLight dark:text-textDark">
            Documentation
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
          {DOCS_LINKS.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors duration-150"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                <Icon className="w-4 h-4 text-muted" />
              </div>
              <span className="flex-1 text-sm font-medium font-inter text-textLight dark:text-textDark">
                {label}
              </span>
              <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <p className="text-center text-xs text-muted font-inter pt-2">
        © {new Date().getFullYear()} {name || "RemindrAI"}. All rights reserved.
      </p>
    </div>
  );
}
