import React from "react";
import { Copy, Clock } from "lucide-react";

const LinkedInIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function DraftDeliveryCard() {
  return (
    <div className="w-full rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-bgLight dark:bg-bgImpact flex flex-col">
      <div className="flex items-start justify-between px-5 pt-4 pb-3.5 border-b border-black/[0.05] dark:border-white/[0.05]">
        <div>
          <p className="text-[11px] font-grotesk font-semibold tracking-[0.13em] uppercase text-textLight/40 dark:text-muted/70">
            Draft Ready
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className="w-3 h-3 text-textLight/20 dark:text-white/20" />
            <span className="text-[11px] font-inter text-textLight/30 dark:text-white/30">
              Prepared · Tue 9:00 AM
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#0A66C2]/10 border border-[#0A66C2]/20">
          <LinkedInIcon className="w-3 h-3 text-[#0A66C2]" />
          <span className="text-[10px] font-grotesk font-semibold text-[#5b9bd5] tracking-wide">
            LinkedIn
          </span>
        </div>
      </div>

      <div className="px-5 py-4 space-y-2.5 flex-1">
        <p className="text-sm text-textLight dark:text-gray-100 font-inter leading-relaxed">
          Consistency isn't about doing more. It's about not stopping when it
          gets uncomfortable.
        </p>
        <p className="text-sm text-textLight/40 dark:text-gray-500 font-inter leading-relaxed">
          Most founders quit just before the work compounds. Show up the same
          way on hard days as easy ones. That's the whole system.
        </p>
      </div>

      <div className="px-5 pb-5 flex items-center justify-between mt-auto">
        <span className="text-[11px] font-inter text-textLight/20 dark:text-white/20">
          214 characters
        </span>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-[11px] font-semibold font-grotesk transition-colors duration-150">
          <Copy className="w-3 h-3" />
          Copy draft
        </button>
      </div>
    </div>
  );
}
