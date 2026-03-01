import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Infinity } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

const NAV = {
  Explore: [
    { label: "Features", to: "/features" },
    { label: "About", to: "/about" },
    { label: "Docs", to: "/docs" },
    { label: "Sitemap", to: "/sitemap" },
  ],
  Legal: [
    { label: "Privacy", to: "/privacy" },
    { label: "Terms", to: "/terms" },
    { label: "GDPR", to: "/gdpr" },
    { label: "Contact", to: "/contact" },
  ],
};
const DrawLine = ({ className = "" }) => (
  <div className={`relative h-px w-full overflow-hidden ${className}`}>
    <div className="absolute inset-0 bg-gray-100 dark:bg-white/[0.06]" />
    <div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/30 to-transparent"
      style={{ animation: "shimmer 3.5s ease infinite" }}
    />
    <style>{`
      @keyframes shimmer {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
  </div>
);
const AnimatedWordmark = () => {
  const [hovered, setHovered] = useState(false);
  const [hoverX, setHoverX] = useState(50);
  const ref = useRef(null);
  const letters = "RemindrAI".split("");

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setHoverX(((e.clientX - rect.left) / rect.width) * 100);
  };

  return (
    <div
      ref={ref}
      className="relative cursor-default select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <h2
        className="font-grotesk font-black leading-none tracking-tight text-slate-900 dark:text-slate-100"
        style={{
          fontSize: "clamp(3.8rem, 15vw, 10.5rem)",
          transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
          transform: hovered ? "translateY(-3px)" : "translateY(0)",
          willChange: "transform",
        }}
      >
        <span
          aria-hidden="true"
          className="block"
          style={{
            opacity: hovered ? 0 : 1,
            transition: "opacity 0.32s ease",
            position: hovered ? "absolute" : "relative",
            pointerEvents: "none",
          }}
        >
          RemindrAI
        </span>

        <span
          className="flex flex-wrap"
          style={{
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
            visibility: hovered ? "visible" : "hidden",
            position: hovered ? "relative" : "absolute",
          }}
        >
          {letters.map((char, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                backgroundImage: `linear-gradient(135deg,
                  #1e3a8a ${Math.max(0, hoverX - 35)}%,
                  #2563eb ${hoverX}%,
                  #60a5fa ${Math.min(100, hoverX + 35)}%
                )`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                transform: hovered
                  ? `translateY(${Math.sin(i * 0.8) * 2}px)`
                  : "translateY(6px)",
                transition: `transform 0.45s cubic-bezier(0.16,1,0.3,1) ${i * 22}ms`,
              }}
            >
              {char}
            </span>
          ))}
        </span>
      </h2>

      <div
        className="pointer-events-none absolute -inset-4 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse 60% 40% at ${hoverX}% 60%, rgba(37,99,235,0.08) 0%, transparent 70%)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />
    </div>
  );
};
const CraftBadge = () => (
  <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02]">
    <Infinity
      className="w-3.5 h-3.5 text-muted"
      strokeWidth={1.75}
      aria-hidden="true"
    />

    <span className="text-xs text-muted font-inter">
      A system that keeps work moving - when you donâ€™t.
    </span>
  </div>
);

const Footer = () => {
  return (
    <footer className="relative bg-white dark:bg-black overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018] dark:opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #2563eb 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="pointer-events-none absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-gray-50/60 dark:from-white/[0.015] to-transparent" />

      <DrawLine />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <div className="pt-14 pb-10 md:pt-20 md:pb-14">
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.32em] uppercase text-muted mb-6 font-grotesk">
            Making time work for you
          </p>

          <div className="overflow-hidden">
            <AnimatedWordmark />
          </div>

          <p className="mt-5 text-sm sm:text-[15px] text-muted max-w-xs sm:max-w-sm leading-relaxed font-inter">
            Built for founders, creators, and focused people.
          </p>
        </div>

        <DrawLine />

        <div className="py-10 sm:py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10">
          {Object.entries(NAV).map(([section, links]) => (
            <div key={section}>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.28em] text-muted mb-4 sm:mb-5 font-grotesk">
                {section}
              </p>
              <ul className="space-y-2.5 sm:space-y-3">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="group inline-flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-brand dark:hover:text-brand transition-colors duration-150 font-inter"
                    >
                      {label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-0.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <DrawLine />

        <div
          className="
  py-5 sm:py-6
  flex flex-col sm:flex-row
  items-center sm:items-center
  justify-center sm:justify-between
  gap-3 sm:gap-4
  text-center sm:text-left
"
        >
          <div className="order-1 sm:order-2 flex justify-center sm:justify-end w-full sm:w-auto">
            <CraftBadge />
          </div>

          <p
            className="
    text-xs text-muted font-inter
    order-2 sm:order-1
    w-full sm:w-auto
  "
          >
            Â© {CURRENT_YEAR} RemindrAI â€” All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
