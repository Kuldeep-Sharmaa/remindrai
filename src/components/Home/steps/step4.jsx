const Step4Preview = () => (
  <div className="w-full rounded-2xl border border-white/[0.08] bg-bgImpact overflow-hidden">
    {/* Header */}
    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold font-grotesk text-textDark">
          Drafts
        </p>
        <p className="text-xs text-muted font-inter mt-0.5">
          1 total · 1 unread
        </p>
      </div>
      <div className="flex gap-1.5">
        {["All", "Unread", "Today"].map((tab, i) => (
          <span
            key={tab}
            className={`text-[10px] font-medium font-grotesk px-2.5 py-1 rounded-md border
            ${i === 1 ? "border-brand bg-brand/10 text-brand" : "border-white/[0.08] text-muted"}`}
          >
            {tab}
          </span>
        ))}
      </div>
    </div>

    {/* Draft row */}
    <div className="px-5 py-4 border-b border-white/[0.06] flex items-start gap-3">
      <div className="mt-0.5 w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6M9 13h4" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
          </span>
          <p className="text-xs font-semibold font-grotesk text-textDark line-clamp-1">
            Write about what consistency looks like...
          </p>
        </div>
        <p className="text-[10px] text-muted font-inter mt-1">
          twitter · professional · Sat, Mar 7
        </p>
      </div>
    </div>

    {/* Draft open state */}
    <div className="px-5 py-4 border-b border-white/[0.06]">
      <p className="text-[10px] font-semibold tracking-widest text-muted font-grotesk uppercase mb-2">
        Prompt
      </p>
      <p className="text-xs font-medium font-grotesk text-textDark mb-3">
        Write about what consistency looks like in practice
      </p>
      <p className="text-xs text-textDark/70 font-inter leading-relaxed line-clamp-3">
        Consistency isn't about doing something perfectly every day — it's about
        showing up even when conditions aren't ideal. In practice, it means
        building systems that work without motivation...
      </p>
    </div>

    {/* Actions */}
    <div className="px-5 py-3 flex items-center justify-between">
      <span className="text-[10px] text-muted font-inter">199 characters</span>
      <button className="flex items-center gap-1.5 text-xs font-semibold font-grotesk text-white bg-brand hover:bg-brand-hover px-3.5 py-2 rounded-lg transition-colors">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        Copy draft
      </button>
    </div>
  </div>
);

export default Step4Preview;
