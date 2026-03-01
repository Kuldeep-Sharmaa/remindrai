/**
 * DeliveryDropdown.jsx
 *
 * Dropdown for filtering deliveries by reminder.
 * Mobile-first design with clean hierarchy and smooth interactions.
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { HiOutlineCpuChip, HiOutlineBookmark } from "react-icons/hi2";

// Type icon component
function TypeIcon({ type, active }) {
  const base = "w-4 h-4 transition-colors";
  const color = active ? "text-[#2563eb]" : "text-[#9ca3af]";

  if (type === "ai") return <HiOutlineCpuChip className={`${base} ${color}`} />;
  if (type === "simple")
    return <HiOutlineBookmark className={`${base} ${color}`} />;

  return null;
}

function formatFrequency(freq) {
  if (freq === "one_time") return "Once";
  if (freq === "daily") return "Daily";
  if (freq === "weekly") return "Weekly";
  return "—";
}

export default function DeliveryDropdown({
  reminders = [],
  selectedId = "all",
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Get selected reminder details
  const selectedItem = useMemo(
    () => reminders.find((r) => r.id === selectedId) || null,
    [reminders, selectedId],
  );

  const selectedTitle =
    selectedItem?.content?.aiPrompt ||
    selectedItem?.content?.message ||
    "All deliveries";

  const selectedFreq = selectedItem
    ? formatFrequency(selectedItem.frequency)
    : null;

  return (
    <div className="relative w-full sm:w-auto" ref={containerRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 w-full sm:w-auto sm:min-w-[200px]
                   px-3 py-2 rounded-lg border border-[#1f2933]/20
                   bg-white dark:bg-black
                   hover:border-[#2563eb]/40 hover:bg-[#2563eb]/5
                   transition-all text-left"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedItem && (
            <TypeIcon
              type={selectedItem.reminderType}
              active={!!selectedItem}
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="text-sm text-[#0f172a] dark:text-[#e5e7eb] truncate font-medium">
              {selectedTitle}
            </div>
            {selectedFreq && (
              <div className="text-xs text-[#9ca3af]">{selectedFreq}</div>
            )}
          </div>
        </div>

        {/* Chevron */}
        <svg
          className={`w-3.5 h-3.5 text-[#9ca3af] flex-shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 sm:hidden"
            onClick={() => setOpen(false)}
          />

          <div
            className="absolute right-0 mt-2 w-full sm:w-80
                       bg-white dark:bg-black
                       border border-[#1f2933]/30 rounded-xl shadow-2xl
                       overflow-hidden z-50
                       animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {/* All deliveries option */}
            <button
              onClick={() => {
                onChange?.("all");
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm font-medium
                          transition-colors border-b border-[#1f2933]/10
                          ${
                            selectedId === "all"
                              ? "bg-[#2563eb]/10 text-[#2563eb]"
                              : "text-[#0f172a] dark:text-[#e5e7eb] hover:bg-[#2563eb]/5"
                          }`}
            >
              All deliveries
            </button>

            {/* Reminders list */}
            <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
              {reminders.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[#9ca3af]">
                  No reminders yet
                </div>
              ) : (
                reminders.map((r) => {
                  const title =
                    r.content?.aiPrompt || r.content?.message || "Untitled";
                  const freq = formatFrequency(r.frequency);
                  const isSelected = r.id === selectedId;

                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        onChange?.(r.id);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3
                                  transition-colors
                                  ${
                                    isSelected
                                      ? "bg-[#2563eb]/10"
                                      : "hover:bg-[#2563eb]/5"
                                  }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="mt-0.5">
                          <TypeIcon type={r.reminderType} active={isSelected} />
                        </div>

                        {/* Text content */}
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-sm font-medium line-clamp-2 ${
                              isSelected
                                ? "text-[#2563eb]"
                                : "text-[#0f172a] dark:text-[#e5e7eb]"
                            }`}
                          >
                            {title}
                          </div>
                          <div className="text-xs text-[#9ca3af] mt-0.5">
                            {freq}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
