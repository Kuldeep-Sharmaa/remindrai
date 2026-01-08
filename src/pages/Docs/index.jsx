import React, { useState, useMemo } from "react";
import { Search, BookOpen, Zap, HelpCircle, ExternalLink } from "lucide-react";
import SearchBar from "./components/SearchBar";
import CollapsibleSection, {
  HighlightText,
} from "./components/CollapsibleSection";
import { quickstart } from "./data/quickstart";
import { features } from "./data/features";
import { faq } from "./data/faq";

const DocsPage = () => {
  const [query, setQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    quickstart: false,
    features: false,
    faq: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Advanced search functionality
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return {
        quickstart: { items: quickstart, hasMatch: false },
        features: { items: features, hasMatch: false },
        faq: { items: faq, hasMatch: false },
        totalResults: 0,
      };
    }

    const searchTerm = query.toLowerCase();

    const quickstartMatches = quickstart.filter(
      (item) =>
        item.step.toLowerCase().includes(searchTerm) ||
        item.detail.toLowerCase().includes(searchTerm)
    );

    const featureMatches = features.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        (item.category && item.category.toLowerCase().includes(searchTerm))
    );

    const faqMatches = faq.filter(
      (item) =>
        item.question.toLowerCase().includes(searchTerm) ||
        item.answer.toLowerCase().includes(searchTerm) ||
        (item.category && item.category.toLowerCase().includes(searchTerm))
    );

    const totalResults =
      quickstartMatches.length + featureMatches.length + faqMatches.length;

    // Auto-expand sections with matches
    if (totalResults > 0) {
      const newExpanded = {
        quickstart: quickstartMatches.length > 0,
        features: featureMatches.length > 0,
        faq: faqMatches.length > 0,
      };
      setExpandedSections(newExpanded);
    }

    return {
      quickstart: {
        items: quickstartMatches,
        hasMatch: quickstartMatches.length > 0,
      },
      features: { items: featureMatches, hasMatch: featureMatches.length > 0 },
      faq: { items: faqMatches, hasMatch: faqMatches.length > 0 },
      totalResults,
    };
  }, [query]);

  return (
    <div className="min-h-screen mt-16 bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              RemindrAI Documentation
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to know about using RemindrAI effectively.
              Search through our guides, features, and frequently asked
              questions.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <SearchBar
              query={query}
              setQuery={setQuery}
              resultsCount={searchResults.totalResults}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* No Results State */}
        {query && searchResults.totalResults === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try searching for something else or browse our sections below.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Quick Start Guide */}
          <CollapsibleSection
            title="Quick Start Guide"
            icon={BookOpen}
            isExpanded={expandedSections.quickstart}
            onToggle={() => toggleSection("quickstart")}
            hasMatches={searchResults.quickstart.hasMatch}
            query={query}
          >
            <div className="space-y-4">
              {searchResults.quickstart.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        <HighlightText text={item.step} query={query} />
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <HighlightText text={item.detail} query={query} />
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Features */}
          <CollapsibleSection
            title="Features"
            icon={Zap}
            isExpanded={expandedSections.features}
            onToggle={() => toggleSection("features")}
            hasMatches={searchResults.features.hasMatch}
            query={query}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {searchResults.features.items.map((feature) => (
                <div
                  key={feature.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      <HighlightText text={feature.title} query={query} />
                    </h4>
                    {feature.category && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                        <HighlightText text={feature.category} query={query} />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <HighlightText text={feature.description} query={query} />
                  </p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* FAQ */}
          <CollapsibleSection
            title="Frequently Asked Questions"
            icon={HelpCircle}
            isExpanded={expandedSections.faq}
            onToggle={() => toggleSection("faq")}
            hasMatches={searchResults.faq.hasMatch}
            query={query}
          >
            <div className="space-y-4">
              {searchResults.faq.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white flex-1">
                      <HighlightText text={item.question} query={query} />
                    </h4>
                    {item.category && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full ml-2">
                        <HighlightText text={item.category} query={query} />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <HighlightText text={item.answer} query={query} />
                  </p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Still need help? We're here to assist you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Contact Support
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
