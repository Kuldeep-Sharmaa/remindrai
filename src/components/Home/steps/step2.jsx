const Step2Preview = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const activeDays = [1, 3]; // Tue, Thu

  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-bgImpact overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="text-xs font-semibold font-grotesk text-textDark">
          Draft Timing
        </p>
        <p className="text-xs text-muted font-inter mt-0.5">
          when drafts should be ready
        </p>
      </div>

      {/* Frequency */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="text-[10px] font-semibold tracking-widest text-muted font-grotesk uppercase mb-2.5">
          How often
        </p>
        <div className="flex gap-2">
          {["One time", "Every day", "Every week"].map((label, i) => (
            <button
              key={label}
              className={`flex-1 py-2 text-xs font-medium font-grotesk rounded-lg border transition-colors
                ${
                  i === 2
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-white/[0.08] text-muted bg-white/[0.02]"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Days */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="text-[10px] font-semibold tracking-widest text-muted font-grotesk uppercase mb-2.5">
          Days
        </p>
        <div className="flex gap-1.5">
          {days.map((day, i) => (
            <div
              key={day}
              className={`flex-1 py-2 text-[10px] font-medium font-grotesk rounded-lg border text-center
                ${
                  activeDays.includes(i)
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-white/[0.08] text-muted bg-white/[0.02]"
                }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Time + Next */}
      <div className="flex divide-x divide-white/[0.06]">
        <div className="flex-1 px-5 py-3">
          <p className="text-[10px] text-muted font-inter mb-1">
            Delivery time
          </p>
          <p className="text-sm font-semibold font-grotesk text-textDark">
            09:00 AM
          </p>
        </div>
        <div className="flex-1 px-5 py-3">
          <p className="text-[10px] text-brand font-inter mb-1">
            Next draft ready
          </p>
          <p className="text-sm font-semibold font-grotesk text-textDark">
            Tue, Mar 10
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step2Preview;
