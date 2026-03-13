import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { HiOutlineCpuChip, HiOutlineBookmark } from "react-icons/hi2";

function TypeIcon({ type, active }) {
  const base = "w-4 h-4 transition-colors";
  const color = active ? "text-brand" : "text-muted";

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

  useEffect(() => {
    function handleClick(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedItem = useMemo(
    () => reminders.find((r) => r.id === selectedId) || null,
    [reminders, selectedId],
  );

  const selectedTitle =
    selectedItem?.content?.aiPrompt ||
    selectedItem?.content?.message ||
    "All drafts";

  const selectedFreq = selectedItem
    ? formatFrequency(selectedItem.frequency)
    : null;

  return (
    <div className="relative w-full sm:w-auto" ref={containerRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 w-full sm:w-auto sm:min-w-[200px]
                   px-3 py-2 rounded-lg border border-border/20
                   bg-white dark:bg-bgDark
                   hover:border-brand/40 hover:bg-brand/5
                   transition-colors duration-150 text-left"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedItem && (
            <TypeIcon
              type={selectedItem.reminderType}
              active={!!selectedItem}
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-textLight dark:text-textDark truncate font-medium">
              {selectedTitle}
            </p>
            {selectedFreq && (
              <p className="text-xs text-muted">{selectedFreq}</p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted flex-shrink-0 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 sm:hidden"
            onClick={() => setOpen(false)}
          />

          <div
            className="absolute left-0 mt-2 w-full sm:w-80
                       bg-white dark:bg-bgDark
                       border border-border/30 rounded-xl shadow-2xl
                       overflow-hidden z-50
                       animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {/* All drafts option */}
            <button
              onClick={() => {
                onChange?.("all");
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm font-medium
                          transition-colors duration-150 border-b border-border/10
                          ${
                            selectedId === "all"
                              ? "bg-brand/10 text-brand"
                              : "text-textLight dark:text-textDark hover:bg-brand/5"
                          }`}
            >
              All drafts
            </button>

            {/* Prompt list */}
            <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
              {reminders.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted">
                  No drafts yet
                </p>
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
                      className={`w-full text-left px-4 py-3 transition-colors duration-150
                                  ${isSelected ? "bg-brand/10" : "hover:bg-brand/5"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <TypeIcon type={r.reminderType} active={isSelected} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium line-clamp-2 ${
                              isSelected
                                ? "text-brand"
                                : "text-textLight dark:text-textDark"
                            }`}
                          >
                            {title}
                          </p>
                          <p className="text-xs text-muted mt-0.5">{freq}</p>
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
