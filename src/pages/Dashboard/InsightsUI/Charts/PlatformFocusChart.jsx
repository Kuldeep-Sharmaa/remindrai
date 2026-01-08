import { useMemo } from "react";
import {
  Target,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
} from "lucide-react";

export default function PlatformFocusChart({ reminders }) {
  // Extract platform distribution from AI reminders
  const platformData = useMemo(() => {
    if (!reminders || reminders.length === 0) return [];

    // Filter AI reminders only
    const aiReminders = reminders.filter(
      (r) => r.reminderType?.toLowerCase() === "ai"
    );

    if (aiReminders.length === 0) return [];

    // Count by platform
    const platformCounts = {};

    aiReminders.forEach((reminder) => {
      // Platform can be in content.platform or directly in reminder.platform
      const platform = reminder.content?.platform || reminder.platform;

      if (platform) {
        const normalizedPlatform = String(platform).toLowerCase().trim();
        platformCounts[normalizedPlatform] =
          (platformCounts[normalizedPlatform] || 0) + 1;
      }
    });

    // Convert to array and sort by count
    const platforms = Object.entries(platformCounts)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
        count,
        percentage: Math.round((count / aiReminders.length) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return platforms;
  }, [reminders]);

  // Platform icon mapping
  const getPlatformIcon = (platformName) => {
    const name = platformName.toLowerCase();
    const iconProps = { className: "h-4 w-4", strokeWidth: 2 };

    const iconMap = {
      twitter: <Twitter {...iconProps} />,
      x: <Twitter {...iconProps} />,
      linkedin: <Linkedin {...iconProps} />,
      instagram: <Instagram {...iconProps} />,
      facebook: <Facebook {...iconProps} />,
      youtube: <Youtube {...iconProps} />,
      threads: <MessageCircle {...iconProps} />,
    };
    return iconMap[name] || <Target {...iconProps} />;
  };

  // Platform color mapping
  const getPlatformColor = (platformName) => {
    const name = platformName.toLowerCase();
    const colorMap = {
      twitter: "bg-blue-500",
      x: "bg-gray-100",
      linkedin: "bg-blue-600",
      instagram: "bg-purple-500",
      facebook: "bg-blue-700",
      youtube: "bg-red-600",
      threads: "bg-gray-900",
    };
    return colorMap[name] || "bg-purple-500";
  };

  if (platformData.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-white">
                Platform Focus
              </h3>
            </div>
            <p className="text-xs text-gray-500">Content distribution</p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">No platform data available</p>
          <p className="text-xs text-gray-600 mt-1">
            Set platform when creating AI reminders
          </p>
        </div>
      </div>
    );
  }

  const totalCount = platformData.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-semibold text-white">Platform Focus</h3>
          </div>
          <p className="text-xs text-gray-500">Content distribution</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{totalCount}</p>
          <p className="text-xs text-gray-500">Platform</p>
        </div>
      </div>

      {/* Platform Bars */}
      <div className="space-y-3">
        {platformData.map((platform, index) => (
          <div key={platform.name}>
            {/* Platform Name and Count */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="text-gray-400">
                  {getPlatformIcon(platform.name)}
                </div>
                <span className="text-xs font-medium text-gray-300">
                  {platform.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {platform.percentage}%
                </span>
                <span className="text-xs font-semibold text-white">
                  {platform.count}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${getPlatformColor(
                  platform.name
                )} transition-all duration-700 ease-out`}
                style={{
                  width: `${platform.percentage}%`,
                  animationDelay: `${index * 100}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
