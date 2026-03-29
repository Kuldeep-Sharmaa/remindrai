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
    <div
      className="w-full rounded-2xl border border-brand/25 bg-bgImpact flex flex-col shadow-none"
      style={{ minHeight: "var(--card-min-h, 220px)" }} // Set a custom min-height for this card
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div>
          <p className="text-[10px] font-grotesk font-semibold tracking-[0.14em] uppercase text-white/80 mb-1">
            Draft Ready
          </p>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-white/80" />
            <span className="text-[10px] font-inter text-white/80">
              Tue 9:00 AM
            </span>
          </div>
        </div>
        {/* LinkedIn badge */}
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#0A66C2]/[0.10] border border-[#0A66C2]/[0.18]">
          <LinkedInIcon className="w-3 h-3 text-[#0A66C2]" />
          <span className="text-[9px] font-grotesk font-semibold text-[#5b9bd5] tracking-wide">
            LinkedIn
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/[0.05]" />

      {/* Draft body — flex-1 so both cards stretch to the same height */}
      <div className="px-4 pt-3 pb-3 flex-1 flex flex-col gap-2">
        <p className="text-xs lg:text-sm text-white/80 font-inter leading-relaxed">
          Consistency isn't about doing more. It's about not stopping when it
          gets uncomfortable.
        </p>
        <p className="text-xs lg:text-sm text-white/80 font-inter leading-relaxed">
          Most founders quit just before the work compounds. Show up the same
          way on hard days as easy ones. That's the whole system.
        </p>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/[0.05]" />

      {/* Meta + action */}
      <div className="px-4 pt-2.5 pb-4 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <MetaTag label="professional" />
          <MetaTag label="founder" />
          <span className="text-[9px] font-inter text-white/60">214 chars</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold font-grotesk transition-all duration-200 ${
            copied
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-brand hover:bg-brand-hover text-white shadow-sm shadow-brand/20"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> Copy draft
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function MetaTag({ label }) {
  return (
    <span className="text-[9px] font-inter font-medium px-1.5 py-0.5 rounded-md bg-white/[0.04] text-white/80 border border-white/[0.05]">
      {label}
    </span>
  );
}
