import React from "react";

const EXAMPLES = [
  {
    label: "Startup lessons",
    value:
      "Practical startup lessons from building and working through real challenges",
  },
  {
    label: "React tips",
    value:
      "Simple and practical React tips for developers to improve daily workflow",
  },
  {
    label: "Founder insights",
    value: "Honest insights from a founder building and learning along the way",
  },
  {
    label: "Marketing experiments",
    value:
      "Real marketing experiments, what worked, what failed, and what changed",
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
