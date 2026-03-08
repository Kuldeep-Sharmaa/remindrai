const Step3Preview = () => {
  const prompts = [
    {
      title: "Write about what consistency looks like in practice",
      schedule: "Every day · 09:00 AM",
      status: "preparing",
    },
    {
      title: "Share a lesson from your last product decision",
      schedule: "Tue / Thu · 09:00 AM",
      status: "scheduled",
    },
  ];

  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-bgImpact overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold font-grotesk text-textDark">
            Active Prompts
          </p>
          <p className="text-xs text-muted font-inter mt-0.5">
            Drafts are prepared automatically
          </p>
        </div>
        <span className="text-[10px] font-semibold font-grotesk text-muted border border-white/[0.08] px-2 py-1 rounded-md">
          2 active
        </span>
      </div>

      <div className="divide-y divide-white/[0.06]">
        {prompts.map(({ title, schedule, status }) => (
          <div key={title} className="px-5 py-4 flex items-start gap-3">
            {/* Icon */}
            <div
              className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
              ${status === "preparing" ? "bg-brand/10" : "bg-white/[0.04]"}`}
            >
              {status === "preparing" ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
                </span>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium font-grotesk text-textDark leading-relaxed line-clamp-2">
                {title}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={`text-[10px] font-inter ${status === "preparing" ? "text-brand" : "text-muted"}`}
                >
                  {status === "preparing" ? "Preparing draft..." : "Scheduled"}
                </span>
                <span className="text-[10px] text-muted font-inter">
                  · {schedule}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-white/[0.06] bg-white/[0.01]">
        <p className="text-[10px] text-muted font-inter">
          No tool to open. No prompt to write.
        </p>
      </div>
    </div>
  );
};

export default Step3Preview;
