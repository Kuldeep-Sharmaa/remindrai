import React from "react";
import { Link } from "react-router-dom";

const SECTIONS = [
  {
    group: "System",
    links: [
      { title: "Workspace", path: "/workspace", desc: "where it runs" },
      { title: "Drafts", path: "/workspace/drafts", desc: "prepared drafts" },
      { title: "Studio", path: "/workspace/studio", desc: "set direction" },
      {
        title: "Preferences",
        path: "/workspace/settings/preferences",
        desc: "tone and setup",
      },
      {
        title: "Settings",
        path: "/workspace/settings",
        desc: "account settings",
      },
    ],
  },
  {
    group: "Access",
    links: [{ title: "Sign up", path: "/auth", desc: "get started" }],
  },
  {
    group: "Info",
    links: [
      { title: "Home", path: "/", desc: "what it is" },
      { title: "About", path: "/about", desc: "why it exists" },
      { title: "Features", path: "/features", desc: "what it does" },
    ],
  },
  {
    group: "Legal",
    links: [
      { title: "Privacy", path: "/privacy", desc: "data handling" },
      { title: "Terms", path: "/terms", desc: "terms of use" },
    ],
  },
];

export default function Sitemap() {
  return (
    <div className="min-h-screen w-full px-6 sm:px-8 lg:px-12 pt-32 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-16">
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-textLight dark:text-textDark">
            Index
          </h1>
        </div>

        <div className="flex flex-col gap-10">
          {SECTIONS.map((section) => (
            <div
              key={section.group}
              className="grid grid-cols-[80px_1fr] gap-x-8"
            >
              <div className="pt-[3px]">
                <span className="text-sm lg:text-base font-mono uppercase tracking-widest text-brand">
                  {section.group}
                </span>
              </div>

              <div className="flex flex-col border-t border-black/[0.05] dark:border-white/[0.05]">
                {section.links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="group flex items-center justify-between py-4 border-b border-black/[0.05] dark:border-white/[0.05] hover:border-brand/20 transition-colors duration-150 last:border-0"
                  >
                    <span className="text-lg sm:text-xl font-medium font-inter text-textLight dark:text-textDark group-hover:text-brand transition-colors duration-150">
                      {link.title}
                    </span>
                    <span className="text-xs font-inter text-muted/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {link.desc}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
