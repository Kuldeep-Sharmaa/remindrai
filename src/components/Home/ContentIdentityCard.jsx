import React from "react";
import { Settings } from "lucide-react";

export default function ContentIdentityCard() {
  return (
    <div className="w-full rounded-2xl border border-black/[0.10] dark:border-white/[0.06] bg-white dark:bg-bgImpact flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 sm:px-5 pt-3 sm:pt-5 pb-2.5 sm:pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
          <p className="text-[10px] sm:text-[11px] font-grotesk font-semibold tracking-[0.14em] uppercase text-textLight/40 dark:text-white/30">
            Identity
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-textLight/35 dark:text-white/25 hover:text-textLight/60 dark:hover:text-white/50 transition-all duration-150">
          <Settings className="w-3 h-3" />
          <span className="text-[10px] font-inter font-medium">Edit</span>
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3.5 sm:mx-5 h-px bg-black/[0.07] dark:bg-white/[0.04]" />

      {/* Fields */}
      <div className="px-3.5 sm:px-5 pt-2.5 sm:pt-4 pb-2.5 sm:pb-4 flex flex-row flex-wrap gap-x-3 sm:gap-x-5 gap-y-2">
        <Field label="Role" value="Founder" />
        <Field label="Tone" value="Direct" />
        <Field label="Platform" value="LinkedIn" highlight />
      </div>

      {/* Divider */}
      <div className="mx-3.5 sm:mx-5 h-px bg-black/[0.07] dark:bg-white/[0.04]" />

      {/* Active prompt */}
      <div className="px-3.5 sm:px-5 pt-2.5 sm:pt-4 pb-3 sm:pb-5 mt-auto">
        <div className="rounded-xl bg-black/[0.04] dark:bg-white/[0.03] border border-black/[0.07] dark:border-white/[0.04] px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] font-grotesk font-semibold tracking-[0.12em] uppercase text-textLight/30 dark:text-white/20">
              Active prompt
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-inter font-medium text-emerald-600 dark:text-emerald-400/80">
                running
              </span>
            </span>
          </div>
          <p className="text-[11px] sm:text-sm text-textLight/80 dark:text-textDark/70 font-inter leading-snug">
            Write about what consistency looks like in practice.
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 sm:mt-2">
            <span className="text-[9px] sm:text-[10px] font-inter text-textLight/30 dark:text-white/20 font-medium">
              Every week
            </span>
            <span className="text-textLight/20 dark:text-white/15">·</span>
            <span className="text-[9px] sm:text-[10px] font-inter text-textLight/30 dark:text-white/20 font-medium">
              Tue 9:00 AM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, highlight }) {
  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      <span className="text-[9px] sm:text-[10px] font-inter font-medium text-textLight/30 dark:text-white/20 w-10 sm:w-12 shrink-0">
        {label}
      </span>
      <span
        className={`
          text-[11px] sm:text-xs font-grotesk font-semibold
          px-2 sm:px-2.5 py-[4px] sm:py-[5px] rounded-lg border
          ${
            highlight
              ? "bg-brand/[0.08] dark:bg-brand/[0.12] text-brand dark:text-brand-soft border-brand/[0.15] dark:border-brand/[0.2]"
              : "bg-black/[0.05] dark:bg-white/[0.05] text-textLight/70 dark:text-textDark/60 border-black/[0.08] dark:border-white/[0.07]"
          }
        `}
      >
        {value}
      </span>
    </div>
  );
}
