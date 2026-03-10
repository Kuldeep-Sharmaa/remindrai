import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

// Section components
import CreateAccount from "./sections/CreateAccount";
import VerifyEmail from "./sections/VerifyEmail";
import Onboarding from "./sections/Onboarding";
import Workspace from "./sections/Workspace";
import ContentSetup from "./sections/Contentsetup";
import CreatePrompt from "./sections/Createprompt";
import ContentInbox from "./sections/Contentinbox";
import ManagePrompts from "./sections/Manageprompts";
import Timezone from "./sections/Timezone";
import Notifications from "./sections/Notifications";
import Preferences from "./sections/Preferences";
import Account from "./sections/Account";

// ─── Nav structure ─────────────────────────────────────────────────────────────

const NAV = [
  {
    group: "Getting started",
    items: [
      { id: "create-account", label: "Create account" },
      { id: "verify-email", label: "Verify email" },
      { id: "onboarding", label: "Onboarding" },
      { id: "workspace", label: "Workspace" },
    ],
  },
  {
    group: "Core workflow",
    items: [
      { id: "content-setup", label: "Content setup" },
      { id: "create-prompt", label: "Creating a prompt" },
      { id: "content-inbox", label: "Content inbox" },
      { id: "manage-prompts", label: "Managing prompts" },
    ],
  },
  {
    group: "Settings",
    items: [
      { id: "timezone", label: "Timezone" },
      { id: "notifications", label: "Notifications" },
      { id: "preferences", label: "Preferences" },
      { id: "account", label: "Account" },
    ],
  },
];

const SECTION_MAP = {
  "create-account": {
    component: CreateAccount,
    title: "How do I create an account?",
    intro: "Sign up takes less than a minute.",
  },
  "verify-email": {
    component: VerifyEmail,
    title: "How do I verify my email?",
    intro: "Required before accessing the Workspace.",
  },
  onboarding: {
    component: Onboarding,
    title: "What happens during onboarding?",
    intro: "Sets your Content Identity.",
  },
  workspace: {
    component: Workspace,
    title: "What is inside the Workspace?",
    intro: "Four sections: Overview, Studio, Deliveries, Settings.",
  },
  "content-setup": {
    component: ContentSetup,
    title: "How do I update my content setup?",
    intro: "Edit role, tone, and platform from Studio.",
  },
  "create-prompt": {
    component: CreatePrompt,
    title: "How do I create a prompt?",
    intro: "Prompts define what the system prepares and when.",
  },
  "content-inbox": {
    component: ContentInbox,
    title: "Where does generated content appear?",
    intro: "All drafts appear in Deliveries.",
  },
  "manage-prompts": {
    component: ManagePrompts,
    title: "How do I manage my prompts?",
    intro: "View, delete, and review prompts from Studio.",
  },
  timezone: {
    component: Timezone,
    title: "How do I change my timezone?",
    intro: "All delivery times use your timezone.",
  },
  notifications: {
    component: Notifications,
    title: "How do I manage notifications?",
    intro: "Control email and app notifications.",
  },
  preferences: {
    component: Preferences,
    title: "How do I change app preferences?",
    intro: "Theme and display settings.",
  },
  account: {
    component: Account,
    title: "How do I manage my account?",
    intro: "Password and account deletion.",
  },
};

// Flat list for search
const SEARCH_INDEX = Object.entries(SECTION_MAP).map(([id, s]) => ({
  id,
  label: NAV.flatMap((g) => g.items).find((i) => i.id === id)?.label || id,
  title: s.title,
  intro: s.intro,
}));

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function Docs() {
  const [active, setActive] = useState("create-account");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const ActiveSection = SECTION_MAP[active]?.component;

  // Search
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setResults(
      SEARCH_INDEX.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.intro.toLowerCase().includes(q) ||
          r.label.toLowerCase().includes(q),
      ).slice(0, 7),
    );
    setShowResults(true);
  }, [query]);

  // Close search dropdown on outside click
  useEffect(() => {
    const h = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowResults(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const navigate = (id) => {
    setActive(id);
    setShowResults(false);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-24">
        {/* Page header */}
        <div className="mb-10">
          <p className="font-grotesk text-sm tracking-widest uppercase text-brand font-medium mb-3">
            Documentation
          </p>
          <h1 className="font-grotesk text-4xl sm:text-5xl font-bold text-textLight dark:text-textDark tracking-tight leading-tight mb-6">
            How to use RemindrAI
          </h1>

          {/* Search */}
          <div ref={searchRef} className="relative max-w-md">
            <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-bgImpact border border-gray-200 dark:border-white/[0.08] rounded-lg">
              <Search
                className="w-4 h-4 text-muted flex-shrink-0"
                strokeWidth={1.75}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search docs…"
                className="flex-1 bg-transparent font-inter text-sm text-textLight dark:text-textDark placeholder:text-muted outline-none"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setShowResults(false);
                  }}
                >
                  <X className="w-3.5 h-3.5 text-muted hover:text-textLight dark:hover:text-textDark transition-colors" />
                </button>
              )}
            </div>

            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-bgImpact border border-gray-200 dark:border-white/[0.08] rounded-lg overflow-hidden z-50 shadow-lg">
                {results.length === 0 ? (
                  <p className="font-inter text-sm text-muted px-4 py-3">
                    No results for "{query}"
                  </p>
                ) : (
                  results.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(r.id)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.04] border-b border-gray-100 dark:border-white/[0.04] last:border-0 transition-colors"
                    >
                      <p className="font-inter text-sm text-textLight dark:text-textDark font-medium leading-snug">
                        {r.title}
                      </p>
                      <p className="font-inter text-xs text-muted mt-0.5">
                        {r.intro}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="h-px w-full bg-gray-100 dark:bg-white/[0.06] mb-10" />

        {/* Two-zone layout */}
        <div className="flex gap-12 lg:gap-16">
          {/* Sidebar */}
          <nav className="hidden lg:flex flex-col gap-6 w-44 flex-shrink-0 self-start sticky top-28">
            {NAV.map((group) => (
              <div key={group.group}>
                <p className="font-grotesk text-xs tracking-widest uppercase text-muted font-medium mb-2 px-3">
                  {group.group}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      className={`text-left font-inter text-sm py-1.5 px-3 rounded transition-colors duration-150 ${
                        active === item.id
                          ? "text-brand bg-brand/[0.06] font-medium"
                          : "text-muted hover:text-textLight dark:hover:text-textDark"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Content — active section */}
          <div className="flex-1 min-w-0">
            {ActiveSection && <ActiveSection onNavigate={navigate} />}
          </div>
        </div>
      </div>
    </div>
  );
}
