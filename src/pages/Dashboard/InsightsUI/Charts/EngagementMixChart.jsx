import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Sparkles, FileText } from "lucide-react";

export default function EngagementMixChart({
  aiCount,
  simpleCount,
  totalReminders,
}) {
  // Prepare chart data
  const data = [
    { name: "AI", value: aiCount, color: "#a855f7" },
    { name: "Manual", value: simpleCount, color: "#6b7280" },
  ];

  // Calculate percentages
  const aiPercentage =
    totalReminders > 0 ? Math.round((aiCount / totalReminders) * 100) : 0;
  const manualPercentage =
    totalReminders > 0 ? Math.round((simpleCount / totalReminders) * 100) : 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-gray-300 text-xs font-medium">{data.name}</p>
          <p className="text-white font-bold text-sm">{data.value}</p>
        </div>
      );
    }
    return null;
  };

  if (totalReminders === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-white">
                Engagement Mix
              </h3>
            </div>
            <p className="text-xs text-gray-500">AI vs Manual</p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">No reminders created yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-semibold text-white">Engagement Mix</h3>
          </div>
          <p className="text-xs text-gray-500">AI vs Manual</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{totalReminders}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="relative mb-6">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{totalReminders}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        {/* AI */}
        <div className="flex items-start gap-2 p-2.5 bg-gray-800/50 rounded">
          <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">AI</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-lg font-bold text-white">{aiCount}</p>
              <p className="text-xs text-gray-500">{aiPercentage}%</p>
            </div>
          </div>
        </div>

        {/* Manual */}
        <div className="flex items-start gap-2 p-2.5 bg-gray-800/50 rounded">
          <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">Manual</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-lg font-bold text-white">{simpleCount}</p>
              <p className="text-xs text-gray-500">{manualPercentage}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
