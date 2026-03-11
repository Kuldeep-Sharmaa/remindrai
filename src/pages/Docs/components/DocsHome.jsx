import React, { useRef, useEffect } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { NAV } from "../docsConfig";

export default function DocsHome({
  onNavigate,
  query,
  setQuery,
  setShowResults,
  searchRef,
  results,
  showResults,
}) {
  const linksRef = useRef(null);

  useEffect(() => {
    setShowResults(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!linksRef.current) return;
    const groups = linksRef.current.querySelectorAll(".doc-group");
    gsap.fromTo(
      groups,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.07,
        ease: "power3.out",
        delay: 0.1,
      },
    );
  }, []);

  return (
    <div className="min-h-screen w-full">
      <div className="relative w-full bg-bgImpact">
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 pt-36 pb-16">
          <p className="font-grotesk text-xs tracking-widest uppercase text-brand font-medium mb-3">
            Documentation
          </p>
          <h1 className="font-grotesk text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-2">
            How it works
          </h1>
          <p className="font-inter text-sm text-white/60 mb-8">
            Guides for getting started and understanding how system work.
          </p>

          <div ref={searchRef} className="relative w-full max-w-md">
            <div className="flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
              <Search
                className="w-4 h-4 text-white/50 flex-shrink-0"
                strokeWidth={1.75}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search docs…"
                className="flex-1 bg-transparent font-inter text-sm text-white placeholder:text-white/40 outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")}>
                  <X className="w-3.5 h-3.5 text-white/50 hover:text-white transition-colors" />
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
      </div>

      {/* Links */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-16">
        <div
          ref={linksRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {NAV.map((group) => (
            <div
              key={group.group}
              className="doc-group opacity-0 flex flex-col gap-3"
            >
              <p className="font-grotesk text-base tracking-widest uppercase text-brand font-medium pb-2 border-b border-gray-100 dark:border-white/[0.06]">
                {group.group}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="group flex items-center justify-between text-left py-2 "
                  >
                    <span className="font-inter text-sm text-bgDark/80 dark:text-bgLight/80 group-hover:text-brand ">
                      {item.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 group-hover:text-brand  flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
