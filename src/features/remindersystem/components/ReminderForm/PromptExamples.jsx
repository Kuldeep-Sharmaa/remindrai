import React from "react";

const EXAMPLES = [
  {
    label: "Startup lesson",
    value:
      "Building too many features early and realizing later that users only needed one core thing",
  },
  {
    label: "Founder mistake",
    value:
      "Hiring too quickly and realizing later it slowed down decision making and progress",
  },
  {
    label: "React workflow",
    value:
      "Spending too much time debugging state issues before adopting simpler patterns that saved time",
  },
  {
    label: "Debugging insight",
    value:
      "Getting stuck on a bug for hours and realizing the issue was a small overlooked detail",
  },
  {
    label: "Marketing reality",
    value:
      "Trying multiple marketing ideas and seeing most fail before finding one that actually worked",
  },
  {
    label: "Content struggle",
    value:
      "Overthinking what to post and ending up not posting consistently for weeks",
  },
  {
    label: "Career insight",
    value:
      "Focusing only on hard work and realizing later that visibility also matters for growth",
  },
  {
    label: "Build in public",
    value:
      "Sharing progress publicly and noticing how it improved consistency and accountability",
  },
];

export default function PromptExamples({ onSelect, inputRef }) {
  const handleClick = (value) => {
    onSelect(value);
    const el = inputRef?.current;
    if (!el) return;
    el.focus();
    if (el.setSelectionRange) el.setSelectionRange(value.length, value.length);
  };

  return (
    <div className="mt-3 overflow-x-auto sm:overflow-x-visible">
      <div className="flex gap-2 sm:flex-wrap w-max sm:w-auto pb-0.5">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => handleClick(ex.value)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-inter font-medium
              border border-black/[0.08] dark:border-white/[0.08]
              bg-black/[0.03] dark:bg-white/[0.04]
              text-textLight/60 dark:text-textDark/50
              hover:border-brand/40 hover:text-brand hover:bg-brand/[0.04]
              dark:hover:border-brand/40 dark:hover:text-brand-soft dark:hover:bg-brand/[0.06]
              transition-all duration-150 whitespace-nowrap"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
}
