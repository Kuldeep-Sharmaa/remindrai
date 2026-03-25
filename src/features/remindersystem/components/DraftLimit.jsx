import React from "react";
import useDraftLimit from "../hooks/useDraftLimit";
import useActiveReminderLimit from "../hooks/useActiveReminderLimit";
import { ArrowRight } from "lucide-react";

const LIMIT = 3;

// bars represent active prompt slots — heading gives enough context, no label needed
function PromptBars({ filled, limited }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: LIMIT }).map((_, i) => (
        <div
          key={i}
          className={`h-3 w-8 rounded-sm transition-colors duration-200 ${
            i < filled ? (limited ? "bg-yellow-400" : "bg-brand") : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

export default function DraftLimit({ uid }) {
  const { limited: draftLimited, resetsAt } = useDraftLimit(uid);
  const { atActiveLimit, activeCount } = useActiveReminderLimit(uid);

  if (!uid) return null;

  const resetTime = resetsAt?.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isAnyLimitHit = draftLimited || atActiveLimit;

  return (
    <div className="mb-4">
      {/* heading */}
      <h2 className="text-2xl font-grotesk font-semibold text-textLight dark:text-textDark mb-3">
        Active Prompts
      </h2>

      {/* bars — visual slot indicator, silent when under limit */}

      <PromptBars filled={activeCount} limited={draftLimited} />

      {/* status block — only speaks when something needs attention */}
      <div className="mt-3 flex flex-col gap-1">
        {atActiveLimit && !draftLimited && (
          <p className="text-xs font-medium text-yellow-500 dark:text-yellow-400">
            Active prompts limit reached.
          </p>
        )}

        {draftLimited && !atActiveLimit && (
          <p className="text-xs font-medium text-yellow-500 dark:text-yellow-400">
            Daily draft limit is used. Resumes {resetTime}.
          </p>
        )}

        {draftLimited && atActiveLimit && (
          <p className="text-xs font-medium text-yellow-500 dark:text-yellow-400">
            Active prompts limit reached. Resume {resetTime}.
          </p>
        )}

        {/* shown only when a limit is hit — quiet footnote, not a cta */}
        {isAnyLimitHit && (
          <a
            href="/docs/usage-limits"
            className="text-[11px] text-muted hover:text-yellow-400 transition-colors duration-150 hover:underline "
          >
            How limits work <ArrowRight className="w-3 h-3 inline-block" />
          </a>
        )}
      </div>
    </div>
  );
}
