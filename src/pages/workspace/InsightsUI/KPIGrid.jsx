// src/components/Dashboard/InsightsUI/KPIGrid.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";

/**
 * KPICard - Individual animated card for metrics
 * Shows real counts from your database with smooth hover effects
 */
const KPICard = ({ title, value, subtitle, icon, gradient, isLoading }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
      </div>
    );
  }

  return (
    <div
      className={`
        bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800
        transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02]
        ${
          isHovered
            ? "ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-950"
            : ""
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </span>
        {icon && (
          <div
            className={`text-2xl transition-transform duration-300 ${
              isHovered ? "scale-110 rotate-6" : ""
            }`}
          >
            {icon}
          </div>
        )}
      </div>
      <div
        className={`text-4xl font-bold mb-2 bg-gradient-to-r ${gradient} bg-clip-text text-transparent transition-all duration-300 ${
          isHovered ? "scale-105" : ""
        }`}
      >
        {typeof value === "number" ? value.toLocaleString() : value || 0}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {subtitle}
        </div>
      )}
    </div>
  );
};

KPICard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number,
  subtitle: PropTypes.string,
  icon: PropTypes.string,
  gradient: PropTypes.string,
  isLoading: PropTypes.bool,
};

/**
 * KPIGrid - Main component displaying all KPI cards
 * Uses REAL data from your AuthContext and useUserReminders
 */
export default function KPIGrid({
  aiCount = 0,
  simpleCount = 0,
  activeCount = 0,
  completedCount = 0,
  totalReminders = 0,
  isLoading = false,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* AI Drafts - Auto-generated content */}
      <KPICard
        title="AI Drafts"
        value={aiCount}
        subtitle="Auto-generated"
        icon="🤖"
        gradient="from-indigo-600 to-purple-600"
        isLoading={isLoading}
      />

      {/* Manual Notes - User-created */}
      <KPICard
        title="Manual Notes"
        value={simpleCount}
        subtitle="User-created"
        icon="✍️"
        gradient="from-purple-600 to-pink-600"
        isLoading={isLoading}
      />

      {/* Active Reminders */}
      <KPICard
        title="Active"
        value={activeCount}
        subtitle="Currently running"
        icon="⚡"
        gradient="from-amber-500 to-orange-600"
        isLoading={isLoading}
      />

      {/* Completed/Delivered */}
      <KPICard
        title="Completed"
        value={completedCount}
        subtitle="Delivered"
        icon="✅"
        gradient="from-green-500 to-emerald-600"
        isLoading={isLoading}
      />

      {/* Total Reminders */}
      <KPICard
        title="Total"
        value={totalReminders}
        subtitle="All reminders"
        icon="📊"
        gradient="from-blue-600 to-cyan-600"
        isLoading={isLoading}
      />
    </div>
  );
}

KPIGrid.propTypes = {
  aiCount: PropTypes.number,
  simpleCount: PropTypes.number,
  activeCount: PropTypes.number,
  completedCount: PropTypes.number,
  totalReminders: PropTypes.number,
  isLoading: PropTypes.bool,
};
