import React from "react";
import { Search, X, ArrowLeft } from "lucide-react";
import { NAV, SECTION_MAP, getActiveGroup } from "../docsConfig";

export default function SectionView({
  active,
  onNavigate,
  onHome,
  query,
  setQuery,
  searchRef,
  results,
  showResults,
}) {
  const ActiveSection = SECTION_MAP[active]?.component;
  const activeLabel =
    NAV.flatMap((g) => g.items).find((i) => i.id === active)?.label || "";
  const activeGroup = getActiveGroup(active);

  return (
    <div className="min-h-screen w-full">
      <div className="sticky top-16 z-40 bg-bgLight dark:bg-bgDark border-b border-gray-100 dark:border-white/[0.06] backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-bgBase/80">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-3">
          <div className="flex items-center gap-2 mb-2 lg:hidden">
            <button
              onClick={onHome}
              className="flex items-center gap-1.5 font-inter text-xs text-muted hover:text-textLight dark:hover:text-textDark transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Docs
            </button>
            <span className="text-muted text-xs">/</span>
            <p className="font-inter text-xs text-textLight dark:text-textDark truncate">
              {activeLabel}
            </p>
          </div>

          <div ref={searchRef} className="relative w-full max-w-md">
            <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-bgImpact border border-gray-200 dark:border-border rounded-lg">
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
                <button onClick={() => setQuery("")}>
                  <X className="w-3.5 h-3.5 text-muted hover:text-textLight dark:hover:text-textDark transition-colors" />
                </button>
              )}
            </div>
            {showResults && query && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-bgImpact border border-gray-200 dark:border-border rounded-lg overflow-hidden z-50 shadow-lg">
                {results.length === 0 ? (
                  <p className="font-inter text-sm text-muted px-4 py-3">
                    No results for "{query}"
                  </p>
                ) : (
                  results.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => onNavigate(r.id)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.04] border-b border-gray-100 dark:border-white/[0.04] last:border-0 transition-colors"
                    >
                      <p className="font-inter text-sm text-brand font-medium leading-snug">
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
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 pt-12 pb-24">
        <div className="h-px w-full bg-gray-100 dark:bg-white/[0.06] mb-8" />

        <div className="flex gap-12 lg:gap-16">
          <nav className="hidden lg:flex flex-col gap-4 w-44 flex-shrink-0 self-start sticky top-28">
            <button
              onClick={onHome}
              className="flex items-center gap-2 font-inter text-xs text-textLight/80 dark:text-textDark/80 hover:text-textLight dark:hover:text-textDark mb-1"
            >
              <ArrowLeft className="w-3 h-3" />
              All docs
            </button>

            <div className="h-px w-full bg-gray-100 dark:bg-white/[0.06]" />

            {activeGroup && (
              <div>
                <p className="font-grotesk text-base tracking-widest uppercase text-brand font-medium mb-2 px-3">
                  {activeGroup.group}
                </p>
                <div className="flex flex-col gap-0.5">
                  {activeGroup.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`text-left font-inter text-sm py-1.5 px-3 rounded ${
                        active === item.id
                          ? "text-brand bg-brand/[0.06] font-medium"
                          : "text-textLight/80 dark:text-textDark/80 hover:text-brand dark:hover:text-brand"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>

          <div className="flex-1 min-w-0">
            {ActiveSection && <ActiveSection onNavigate={onNavigate} />}
          </div>
        </div>
      </div>
    </div>
  );
}
