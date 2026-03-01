import React from "react";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";

const FREQUENCY_LABELS = {
  daily: "Every day",
  weekly: "Every week",
  one_time: "One time",
};

function formatLabels(isoString, timezone) {
  if (!isoString) return {};

  try {
    const date = new Date(isoString);
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: tz,
    });

    const nowInTz = new Date().toLocaleDateString("en-CA", { timeZone: tz });
    const runInTz = date.toLocaleDateString("en-CA", { timeZone: tz });

    const diffDays = Math.round(
      (new Date(runInTz) - new Date(nowInTz)) / 86400000,
    );

    let dayLabel = "";
    if (diffDays === 0) dayLabel = "Today";
    else if (diffDays === 1) dayLabel = "Tomorrow";
    else {
      dayLabel = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: tz,
      });
    }

    return { dayLabel, timeStr };
  } catch {
    return {};
  }
}

const NextDeliveryPanel = ({ next }) => {
  if (!next) {
    return (
      <section className="w-full border-t border-border pt-8 mt-6">
        <div className="space-y-6 max-w-md">
          <p className="text-base sm:text-lg font-medium text-textLight dark:text-textDark leading-relaxed">
            Tell it what to prepare
          </p>

          <Link
            to="/workspace/studio/create"
            className="flex items-center justify-center px-5 py-2.5 
                     text-sm font-medium rounded-md
                     bg-brand text-white hover:bg-brand-hover
                     transition-colors duration-200"
          >
            Create First Preparation
          </Link>
        </div>
      </section>
    );
  }

  // Get content based on reminder type
  let content = "Draft in preparation";

  if (next.content?.aiPrompt) {
    // AI reminder - show prompt
    content =
      next.content.aiPrompt.length > 100
        ? next.content.aiPrompt.slice(0, 100).trimEnd() + "…"
        : next.content.aiPrompt;
  } else if (next.content?.message) {
    // Simple reminder - show message
    content =
      next.content.message.length > 100
        ? next.content.message.slice(0, 100).trimEnd() + "…"
        : next.content.message;
  }

  const { dayLabel, timeStr } = formatLabels(
    next.nextRunAtUTC,
    next.schedule?.timezone,
  );

  const freqLabel = FREQUENCY_LABELS[next.frequency] ?? next.frequency;

  const platformLabel = next.content?.platform
    ? next.content.platform.charAt(0).toUpperCase() +
      next.content.platform.slice(1)
    : null;

  return (
    <>
      <section className="w-full border-t border-border pt-8 mt-6">
        <p className="text-xs uppercase tracking-wider text-textLight dark:text-textDark mb-4">
          In Preparation
        </p>
        <p className="text-sm text-muted mb-4">Up next</p>

        <p className="text-base sm:text-lg font-medium text-textLight dark:text-textDark leading-relaxed mb-6 max-w-xl">
          {content}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-muted" />
          <p className="text-xl font-semibold text-textLight dark:text-textDark tracking-tight">
            Ready {dayLabel.toLowerCase()} at {timeStr}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          {freqLabel && <span>{freqLabel}</span>}
          {platformLabel && (
            <>
              <span className="text-border">·</span>
              <span>{platformLabel}</span>
            </>
          )}
        </div>
      </section>
      <div>
        <Link
          to="/workspace/studio"
          className="text-xs text-muted hover:text-brand transition-colors"
        >
          View all preparations →
        </Link>
      </div>
    </>
  );
};

export default NextDeliveryPanel;
