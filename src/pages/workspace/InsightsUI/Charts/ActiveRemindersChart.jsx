import { Zap, Check } from "lucide-react";

export default function ActiveRemindersChart({ activeCount, totalReminders }) {
  // Calculate percentage
  const activePercentage =
    totalReminders > 0 ? Math.round((activeCount / totalReminders) * 100) : 0;

  const deliveredCount = totalReminders - activeCount;
  const deliveredPercentage =
    totalReminders > 0
      ? Math.round((deliveredCount / totalReminders) * 100)
      : 0;

  // SVG circle calculations for progress ring
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (activePercentage / 100) * circumference;
  const dashOffset = circumference - progress;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-semibold text-white">Active Status</h3>
          </div>
          <p className="text-xs text-gray-500">Running reminders</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{activeCount}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
      </div>

      {/* Progress Ring */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative inline-flex items-center justify-center mb-6">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#374151"
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#10b981"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-white">{activeCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              {activePercentage}% active
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3">
          {/* Active */}
          <div className="flex items-start gap-2 p-2.5 bg-green-500/10 border border-green-500/20 rounded">
            <Zap className="h-4 w-4 text-green-500 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-green-400 mb-0.5">Active</p>
              <p className="text-lg font-bold text-white">{activeCount}</p>
            </div>
          </div>

          {/* Delivered */}
          <div className="flex items-start gap-2 p-2.5 bg-gray-800/50 border border-gray-700/50 rounded">
            <Check className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">Delivered</p>
              <p className="text-lg font-bold text-white">{deliveredCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
