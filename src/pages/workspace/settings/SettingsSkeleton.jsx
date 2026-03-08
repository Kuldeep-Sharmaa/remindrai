const SettingsSkeleton = () => (
  <div className="space-y-4 py-4 animate-pulse">
    {/* Section 1 */}
    <div className="rounded-xl border border-gray-200 dark:border-white/[0.08] overflow-hidden">
      {/* Section header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.06] space-y-2">
        <div className="h-3.5 w-28 bg-gray-100 dark:bg-white/[0.06] rounded" />
        <div className="h-3 w-48 bg-gray-100 dark:bg-white/[0.06] rounded" />
      </div>
      {/* Rows */}
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-white/[0.06] last:border-0"
        >
          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 bg-gray-100 dark:bg-white/[0.06] rounded" />
            <div className="h-3 w-48 bg-gray-100 dark:bg-white/[0.06] rounded" />
          </div>
        </div>
      ))}
    </div>

    {/* Section 2 */}
    <div className="rounded-xl border border-gray-200 dark:border-white/[0.08] overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.06] space-y-2">
        <div className="h-3.5 w-36 bg-gray-100 dark:bg-white/[0.06] rounded" />
        <div className="h-3 w-52 bg-gray-100 dark:bg-white/[0.06] rounded" />
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-white/[0.06] last:border-0"
        >
          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-40 bg-gray-100 dark:bg-white/[0.06] rounded" />
            <div className="h-3 w-56 bg-gray-100 dark:bg-white/[0.06] rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SettingsSkeleton;
