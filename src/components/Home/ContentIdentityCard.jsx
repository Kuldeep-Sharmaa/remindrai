import React from "react";
import { Settings } from "lucide-react";

export default function ContentIdentityCard() {
  return (
    <div className="w-full rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-bgLight dark:bg-bgImpact flex flex-col">
      <div className="flex items-start justify-between px-4 sm:px-5 pt-3.5 sm:pt-4 pb-3 sm:pb-3.5 border-b border-black/[0.05] dark:border-white/[0.05]">
        <div>
          <p className="text-[10px] sm:text-[11px] font-grotesk font-semibold tracking-[0.13em] uppercase text-textLight/40 dark:text-muted/70">
            Identity
          </p>
          <p className="text-[11px] sm:text-xs text-textLight/30 dark:text-white/30 font-inter mt-0.5">
            how drafts are written for you
          </p>
        </div>
        <button className="flex items-center gap-1 text-textLight/20 dark:text-white/20 hover:text-textLight/50 dark:hover:text-white/50 transition-colors duration-150">
          <Settings className="w-3 h-3" />
          <span className="text-[10px] font-inter">Edit</span>
        </button>
      </div>

      <div className="px-4 sm:px-5 py-3 sm:py-4 flex flex-row flex-wrap gap-x-3 sm:gap-x-4 gap-y-2">
        <Field label="ROLE" value="Founder" />
        <Field label="TONE" value="Direct" />
        <Field label="PLATFORM" value="LinkedIn" highlight />
      </div>

      <div className="px-4 sm:px-5 pb-4 sm:pb-5 mt-auto">
        <div className="rounded-lg border border-black/[0.05] dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02] px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-grotesk font-semibold tracking-[0.12em] uppercase text-textLight/25 dark:text-white/20">
              Active prompt
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-inter text-emerald-600 dark:text-emerald-500/70">
                running
              </span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-textLight/80 dark:text-gray-300 font-inter leading-snug">
            Write about what consistency looks like in practice.
          </p>
          <p className="text-[10px] sm:text-[11px] text-textLight/25 dark:text-white/25 font-inter mt-1.5 sm:mt-2">
            Every week · Tue 9:00 AM
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, highlight }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] sm:text-[10px] font-grotesk font-semibold tracking-[0.12em] uppercase text-textLight/25 dark:text-white/25 w-12 sm:w-14 shrink-0">
        {label}
      </span>
      <span
        className={`text-[11px] sm:text-xs font-grotesk font-medium px-2 sm:px-2.5 py-1 sm:py-[5px] rounded-md border ${
          highlight
            ? "bg-brand/[0.08] text-brand dark:text-brand-soft border-brand/[0.15]"
            : "bg-black/[0.04] dark:bg-white/[0.04] text-textLight dark:text-gray-300 border-black/[0.06] dark:border-white/[0.06]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
