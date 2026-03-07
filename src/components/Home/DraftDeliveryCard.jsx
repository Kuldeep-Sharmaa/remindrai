import React, { useState } from "react";
import { Copy, Clock, Check } from "lucide-react";

const LinkedInIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function DraftDeliveryCard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="w-full rounded-2xl border border-black/[0.10] dark:border-white/[0.06] bg-white dark:bg-bgImpact flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-none">
      {/* Header */}
      <div className="flex items-start justify-between px-3.5 sm:px-5 pt-3 sm:pt-5 pb-2.5 sm:pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] sm:text-[11px] font-grotesk font-semibold tracking-[0.14em] uppercase text-textLight/40 dark:text-white/30">
              Draft Ready
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-textLight/25 dark:text-white/20" />
            <span className="text-[10px] sm:text-[11px] font-inter text-textLight/35 dark:text-white/25">
              Prepared · Tue 9:00 AM
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 rounded-lg bg-[#0A66C2]/[0.08] dark:bg-[#0A66C2]/[0.12] border border-[#0A66C2]/[0.18] dark:border-[#0A66C2]/[0.2]">
          <LinkedInIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#0A66C2]" />
          <span className="text-[9px] sm:text-[10px] font-grotesk font-semibold text-[#0A66C2] dark:text-[#5b9bd5] tracking-wide">
            LinkedIn
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-3.5 sm:mx-5 h-px bg-black/[0.07] dark:bg-white/[0.04]" />

      {/* Draft body */}
      <div className="px-3.5 sm:px-5 pt-2.5 sm:pt-4 pb-2.5 sm:pb-4 flex-1 space-y-2 sm:space-y-2.5">
        <p className="text-[11px] sm:text-sm text-textLight dark:text-textDark font-inter leading-relaxed">
          Consistency isn't about doing more. It's about not stopping when it
          gets uncomfortable.
        </p>
        <p className="text-[11px] sm:text-sm text-textLight/70 dark:text-textDark/60 font-inter leading-relaxed">
          Most founders quit just before the work compounds. Show up the same
          way on hard days as easy ones. That's the whole system.
        </p>
      </div>

      {/* Divider */}
      <div className="mx-3.5 sm:mx-5 h-px bg-black/[0.07] dark:bg-white/[0.04]" />

      {/* Meta + action */}
      <div className="px-3.5 sm:px-5 pt-2.5 pb-3 sm:pb-5 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2 sm:gap-3">
          <MetaTag label="direct" />
          <MetaTag label="founder" />
          <span className="text-[9px] sm:text-[10px] font-inter text-textLight/25 dark:text-white/15">
            214 chars
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={`
            flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg
            text-[10px] sm:text-[11px] font-semibold font-grotesk
            transition-all duration-200
            ${
              copied
                ? "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-brand hover:bg-brand-hover text-white shadow-sm shadow-brand/20"
            }
          `}
        >
          {copied ? (
            <>
              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Copy draft
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function MetaTag({ label }) {
  return (
    <span className="text-[9px] sm:text-[10px] font-inter font-medium px-1.5 py-0.5 rounded-md bg-black/[0.05] dark:bg-white/[0.04] text-textLight/35 dark:text-white/20 border border-black/[0.07] dark:border-white/[0.05]">
      {label}
    </span>
  );
}
