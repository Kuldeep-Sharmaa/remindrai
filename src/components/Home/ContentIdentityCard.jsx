import React from "react";
import { Settings } from "lucide-react";

export default function ContentIdentityCard() {
  return (
    <div
      className="w-full rounded-2xl border border-brand/25 bg-bgImpact flex flex-col shadow-none"
      style={{ minHeight: "var(--card-min-h, 240px)" }}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-grotesk font-semibold tracking-[0.14em] uppercase text-white/80">
            Identity
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/5 text-white hover:text-white/50 transition-all duration-150">
          <Settings className="w-3 h-3" />
          <span className="text-[10px] font-inter font-medium">Edit</span>
        </button>
      </div>

      <div className="mx-4 h-px bg-white/[0.05]" />

      <div className="px-4 pt-3 pb-3 flex flex-row flex-wrap gap-x-4 gap-y-2">
        <Field label="Role" value="Founder" highlight />
        <Field label="Tone" value="Direct" highlight />
        <Field label="Platform" value="LinkedIn" highlight />
      </div>

      <div className="mx-4 h-px bg-white/[0.05]" />

      <div className="px-4 pt-3 pb-4 flex-1 flex flex-col">
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.05] px-3 py-3 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-grotesk font-semibold tracking-[0.14em] uppercase text-emerald-400">
              Active prompt
            </span>
          </div>
          <p className="text-xs lg:text-sm text-white/80 font-inter leading-snug flex-1">
            Write about what consistency looks like in practice.
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-inter text-white/80 font-medium">
              Every week
            </span>
            <span className="text-white/15">·</span>
            <span className="text-[10px] font-inter text-white/80 font-medium">
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
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-inter font-medium text-white/80 w-9 shrink-0">
        {label}
      </span>
      <span
        className={`text-[10px] font-grotesk font-semibold px-2 py-1 rounded-lg border ${
          highlight
            ? "bg-brand/10 text-brand-soft border-brand/20"
            : "bg-white/[0.05] text-white/80 border-white/[0.08]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
