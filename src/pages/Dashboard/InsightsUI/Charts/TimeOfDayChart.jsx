// ============================================================================
// 📁 TimeOfDayChart.jsx
// ----------------------------------------------------------------------------
// 🔹 Purpose:
//   - Analyze when users usually schedule reminders (time-of-day patterns)
//   - Now fully timezone-aware using TimezoneProvider + Luxon
// ----------------------------------------------------------------------------
// ✅ Key Features:
//   - 8 three-hour blocks (24h coverage)
//   - Converts UTC → user's local time dynamically
//   - Handles missing or malformed data gracefully
//   - Returns actionable insights (peak, quiet, pattern)
// ============================================================================

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { DateTime } from "luxon";
import { useAppTimezone } from "../../../../context/TimezoneProvider";

// -----------------------------
// CONFIG / CONSTANTS
// -----------------------------
const TIME_BLOCKS = [
  { key: "0-3", start: 0, end: 3, displayLabel: "12–3 AM" },
  { key: "3-6", start: 3, end: 6, displayLabel: "3–6 AM" },
  { key: "6-9", start: 6, end: 9, displayLabel: "6–9 AM" },
  { key: "9-12", start: 9, end: 12, displayLabel: "9–12 AM" },
  { key: "12-15", start: 12, end: 15, displayLabel: "12–3 PM" },
  { key: "15-18", start: 15, end: 18, displayLabel: "3–6 PM" },
  { key: "18-21", start: 18, end: 21, displayLabel: "6–9 PM" },
  { key: "21-24", start: 21, end: 24, displayLabel: "9–12 PM" },
];
const SAMPLE_THRESHOLD = 6;

// -----------------------------
// Helpers
// -----------------------------
function normalizeReminders(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (raw.docs && Array.isArray(raw.docs)) {
    return raw.docs.map((d) => (typeof d.data === "function" ? d.data() : d));
  }
  if (typeof raw === "object") return Object.values(raw);
  return [];
}

function parseHourFromTimeOfDay(t) {
  if (!t || typeof t !== "string") return null;
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

// -----------------------------
// Component
// -----------------------------
export default function TimeOfDayChart({ reminders }) {
  const { timezone } = useAppTimezone(); // user's active timezone (from provider)

  const { chartData, insights, totalWithTime } = useMemo(() => {
    const arr = normalizeReminders(reminders);
    if (!arr || arr.length === 0)
      return { chartData: [], insights: null, totalWithTime: 0 };

    const buckets = {};
    TIME_BLOCKS.forEach((b) => {
      buckets[b.key] = { ...b, count: 0, percent: 0 };
    });

    let validCount = 0;

    for (let i = 0; i < arr.length; i++) {
      const r = arr[i];
      let hour = null;

      // 1️⃣ Prefer nextRunAtUTC for accuracy
      if (r?.nextRunAtUTC) {
        try {
          const dt = DateTime.fromISO(r.nextRunAtUTC, { zone: "utc" }).setZone(
            timezone || r?.schedule?.timezone || "UTC"
          );
          if (dt.isValid) hour = dt.hour;
        } catch {
          hour = null;
        }
      }

      // 2️⃣ Fallback to schedule.timeOfDay
      if (hour === null) {
        const parsed = parseHourFromTimeOfDay(r?.schedule?.timeOfDay);
        if (parsed) hour = parsed.hour;
      }

      if (hour === null) continue;
      validCount++;

      const idx = Math.floor(hour / 3);
      const block = TIME_BLOCKS[idx];
      if (block) buckets[block.key].count += 1;
    }

    if (validCount === 0)
      return { chartData: [], insights: null, totalWithTime: 0 };

    // Compute percentages and structure chart data
    const dataArr = TIME_BLOCKS.map((b) => {
      const item = buckets[b.key];
      const pct = Math.round((item.count / validCount) * 100);
      return { ...item, percent: pct };
    });

    // Max/Min blocks
    const maxBlock = dataArr.reduce(
      (acc, x) => (x.count > acc.count ? x : acc),
      dataArr[0]
    );
    const minBlock = dataArr.reduce(
      (acc, x) => (x.count < acc.count ? x : acc),
      dataArr[0]
    );

    // Morning (6–18) pattern check
    const morningCount = dataArr
      .filter((d) => d.start >= 6 && d.start < 18)
      .reduce((s, d) => s + d.count, 0);
    const morningPct = Math.round((morningCount / validCount) * 100);

    const insightsList = [];

    if (maxBlock.count > 0) {
      insightsList.push({
        type: "peak",
        icon: TrendingUp,
        text: `Peak time: ${maxBlock.displayLabel} — ${maxBlock.count} (${maxBlock.percent}%)`,
        value: maxBlock.count,
      });
    }

    if (
      validCount >= SAMPLE_THRESHOLD &&
      minBlock.count < maxBlock.count * 0.3
    ) {
      insightsList.push({
        type: "quiet",
        icon: TrendingDown,
        text: `Quiet hours: ${minBlock.displayLabel} — ${minBlock.count} (${minBlock.percent}%)`,
        value: minBlock.count,
      });
    }

    if (validCount >= SAMPLE_THRESHOLD) {
      if (morningPct >= 60) {
        insightsList.push({
          type: "pattern",
          icon: Clock,
          text: `Mostly daytime — ${morningPct}% between 6 AM–6 PM`,
          value: morningCount,
        });
      } else if (morningPct <= 40) {
        insightsList.push({
          type: "pattern",
          icon: Clock,
          text: `Mostly evening/night — ${100 - morningPct}% after 6 PM`,
          value: validCount - morningCount,
        });
      }
    }

    return {
      chartData: dataArr,
      insights: insightsList.slice(0, 3),
      totalWithTime: validCount,
    };
  }, [reminders, timezone]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md p-2 text-sm shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-300">
            {d.displayLabel}
          </div>
          <div className="font-semibold text-sm text-gray-900 dark:text-white">
            {d.count} reminder{d.count !== 1 ? "s" : ""}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {d.percent}% of scheduled
          </div>
        </div>
      );
    }
    return null;
  };

  // Empty states
  if (!reminders || (Array.isArray(reminders) && reminders.length === 0)) {
    return (
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Time-of-Day Performance
              </h3>
            </div>
            <p className="text-xs text-gray-500">Your scheduling patterns</p>
          </div>
        </div>
        <div className="text-center py-10">
          <p className="text-sm text-gray-500">No reminders created yet</p>
        </div>
      </div>
    );
  }

  if (totalWithTime === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Time-of-Day Performance
              </h3>
            </div>
            <p className="text-xs text-gray-500">Your scheduling patterns</p>
          </div>
        </div>
        <div className="text-center py-10">
          <p className="text-sm text-gray-500">
            No time data available for analysis
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Schedule reminders with specific times to see patterns
          </p>
        </div>
      </div>
    );
  }

  const localLabel = DateTime.now().setZone(timezone).toFormat("ZZZZ"); // e.g. IST, PST

  return (
    <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Time-of-Day Performance
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            When you usually schedule reminders ({localLabel} time)
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalWithTime}
          </div>
          <div className="text-xs text-gray-500">Scheduled</div>
        </div>
      </div>

      <div className="mb-4">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -16, bottom: 12 }}
          >
            <defs>
              <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.24} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
            <XAxis
              dataKey="displayLabel"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              height={48}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#7c3aed"
              strokeWidth={2}
              fill="url(#timeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {insights && insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((ins, idx) => {
            const Icon = ins.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800/40"
              >
                {Icon && (
                  <Icon className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">
                  {ins.text}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

TimeOfDayChart.propTypes = {
  reminders: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

TimeOfDayChart.defaultProps = {
  reminders: [],
};
