import React from "react";
import { Clock } from "lucide-react";

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
        <p className="text-lg font-semibold text-textDark mb-2">
          Assistant inactive
        </p>
        <p className="text-sm text-muted">No active deliveries configured.</p>
      </section>
    );
  }

  const preview = next.content?.aiPrompt
    ? next.content.aiPrompt.length > 100
      ? next.content.aiPrompt.slice(0, 100).trimEnd() + "…"
      : next.content.aiPrompt
    : "Draft in preparation";

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
    <section className="w-full border-t border-border pt-8 mt-6">
      {/* Context Label */}
      <p className="text-xs uppercase tracking-wider text-muted mb-4">
        Upcoming draft
      </p>

      {/* Draft Preview (Primary Meaning) */}
      <p className="text-base sm:text-lg font-medium text-textDark leading-relaxed mb-6 max-w-xl">
        {preview}
      </p>

      {/* Time (Important but Balanced) */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-textDark" />
        <p className="text-xl font-semibold text-textDark tracking-tight">
          {dayLabel} · {timeStr}
        </p>
      </div>

      {/* Metadata */}
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
  );
};

export default NextDeliveryPanel;
