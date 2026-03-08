const Step1Preview = () => {
  const roles = [
    "Busy Founder",
    "Solopreneur",
    "Career Builder",
    "Content Creator",
  ];
  const tones = ["Professional", "Casual", "Witty", "Informative", "Energetic"];
  const platforms = ["LinkedIn", "Twitter / X", "Threads"];

  const Row = ({ label, options, activeIndex }) => (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-semibold tracking-widest text-muted font-grotesk uppercase px-1">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt, i) => (
          <span
            key={opt}
            className={`text-xs font-medium font-grotesk px-3 py-1.5 rounded-lg border transition-colors
              ${
                i === activeIndex
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-white/[0.08] text-muted bg-white/[0.02]"
              }`}
          >
            {opt}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-bgImpact overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="text-xs font-semibold font-grotesk text-textDark">
          Draft Setup
        </p>
        <p className="text-xs text-muted font-inter mt-0.5">
          Set this once. Every draft follows it.
        </p>
      </div>
      <div className="px-5 py-4 flex flex-col gap-4">
        <Row label="Role" options={roles} activeIndex={1} />
        <Row label="Tone" options={tones} activeIndex={0} />
        <Row label="Platform" options={platforms} activeIndex={1} />
      </div>
      <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-[11px] text-muted font-inter">
          All settings ready
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-brand/20 flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path
                d="M1.5 4L3 5.5L6.5 2"
                stroke="#2563eb"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-[11px] text-brand font-inter font-medium">
            Setup complete
          </span>
        </div>
      </div>
    </div>
  );
};

export default Step1Preview;
