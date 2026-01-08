import { useAuthContext } from "../../context/AuthContext";
import useUserReminders from "../../features/remindersystem/hooks/useUserReminders";
import TimeOfDayChart from "../../pages/Dashboard/InsightsUI/Charts/TimeOfDayChart";
import PlatformFocusChart from "../../pages/Dashboard/InsightsUI/Charts/PlatformFocusChart";
import EngagementMixChart from "../../pages/Dashboard/InsightsUI/Charts/EngagementMixChart";
import ActiveRemindersChart from "../../pages/Dashboard/InsightsUI/Charts/ActiveRemindersChart";
import { Loader2, AlertCircle, BarChart3 } from "lucide-react";

export default function Insights() {
  const { user } = useAuthContext();

  const {
    reminders,
    isLoadingReminders,
    remindersError,
    aiCount,
    simpleCount,
    activeCount,
    totalReminders,
  } = useUserReminders(user?.uid);

  // Loading state
  if (isLoadingReminders) {
    return (
      <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto" />
          <p className="mt-4 text-gray-400 text-sm">Loading insights...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (remindersError) {
    return (
      <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Unable to load insights
          </h2>
          <p className="text-gray-400 text-sm">{remindersError}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!reminders || reminders.length === 0) {
    return (
      <div className="min-h-screen  p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No data yet</h2>
          <p className="text-gray-400 text-sm mb-6">
            Create your first reminder to start tracking your consistency and
            content performance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">Insights</h1>
        <p className="text-sm text-gray-400">
          Track your consistency and content performance
        </p>
      </div>

      {/* Charts Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Row */}
        <TimeOfDayChart reminders={reminders} />
        <PlatformFocusChart reminders={reminders} />

        {/* Bottom Row */}
        <EngagementMixChart
          aiCount={aiCount}
          simpleCount={simpleCount}
          totalReminders={totalReminders}
        />
        <ActiveRemindersChart
          activeCount={activeCount}
          totalReminders={totalReminders}
        />
      </div>
    </div>
  );
}
