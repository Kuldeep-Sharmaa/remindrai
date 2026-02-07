/**
 * DeliveryDropdown.jsx
 *
 * Dropdown selector for filtering by delivery.
 * Shows delivery type, cadence, and content preview.
 * Supports keyboard navigation and outside click to close.
 */

import React, { useState, useRef, useEffect } from "react";

function formatType(type) {
  if (type === "ai") return "AI Draft";
  if (type === "simple") return "Simple Note";
  return "Unknown";
}

function formatFrequency(freq) {
  if (freq === "one_time") return "One-time";
  if (freq === "daily") return "Daily";
  if (freq === "weekly") return "Weekly";
  return "—";
}

export default function DeliveryDropdown({
  reminders = [], // internal naming stays
  selectedId = "all",
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedItem = reminders.find((r) => r.id === selectedId) || null;

  const selectedLabel = selectedItem
    ? `${formatType(selectedItem.reminderType)} · ${formatFrequency(
        selectedItem.frequency,
      )} · ${
        selectedItem.content?.aiPrompt ||
        selectedItem.content?.message ||
        "Untitled"
      }`
    : "All deliveries";

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-3 w-[260px]
                   border border-border/60 rounded-lg px-3 py-2
                   text-sm bg-bgDark text-textDark
                   hover:border-border transition-colors"
      >
        <span className="truncate">{selectedLabel}</span>

        <svg
          className={`w-4 h-4 text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.7a.75.75 0 111.06 1.06l-4.24 4.23a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-[340px]
                     bg-bgDark border border-border/70
                     rounded-xl shadow-xl
                     overflow-hidden z-50"
        >
          {/* All deliveries option */}
          <button
            onClick={() => {
              onChange?.("all");
              setOpen(false);
            }}
            className={`w-full text-left px-4 py-3 text-sm
                        hover:bg-white/5 transition-colors
                        ${selectedId === "all" ? "bg-white/5" : ""}`}
          >
            All deliveries
          </button>

          <div className="h-px bg-border/60" />

          {/* Delivery list */}
          <div className="max-h-72 overflow-y-auto">
            {reminders.map((r) => {
              const type = formatType(r.reminderType);
              const freq = formatFrequency(r.frequency);
              const preview =
                r.content?.aiPrompt || r.content?.message || "Untitled";
              const isSelected = r.id === selectedId;

              return (
                <button
                  key={r.id}
                  onClick={() => {
                    onChange?.(r.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3
                              hover:bg-white/5 transition-colors
                              ${isSelected ? "bg-white/5" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-[10px] uppercase tracking-wide text-muted shrink-0 mt-0.5">
                      {type}
                    </span>

                    <span className="text-[11px] text-muted/70 shrink-0 mt-0.5">
                      {freq}
                    </span>

                    <span className="text-sm text-textDark leading-snug line-clamp-2">
                      {preview}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
