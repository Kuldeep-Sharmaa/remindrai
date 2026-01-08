import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const HighlightText = ({ text, query }) => {
  if (!query) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-900 rounded px-1">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const CollapsibleSection = ({
  title,
  children,
  icon: Icon,
  isExpanded,
  onToggle,
  hasMatches,
  query,
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-xl border transition-all duration-200 ${
        hasMatches
          ? "border-blue-200 dark:border-blue-800 shadow-md"
          : "border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md"
      }`}
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-6 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
      >
        <div className="flex items-center gap-3">
          <Icon
            className={`h-5 w-5 ${
              hasMatches ? "text-blue-600" : "text-gray-600 dark:text-gray-400"
            }`}
          />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            <HighlightText text={title} query={query} />
          </h3>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-gray-400 transition-transform" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-400 transition-transform" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
};

export { HighlightText };
export default CollapsibleSection;
