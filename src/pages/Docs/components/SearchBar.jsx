import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ query, setQuery, resultsCount }) => {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search documentation..."
        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
      />
      {query && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            {resultsCount} result{resultsCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
