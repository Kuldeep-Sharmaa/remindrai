// src/features/remindersystem/components/ReminderForm/PromptInput.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";

/**
 * PromptInput
 * - Controlled via prompt / setPrompt
 * - Calls onPromptTouched() on first blur OR first change (so validation can show)
 * - Accepts `error` prop (string | object) and renders inline error message
 * - Autosizes textarea
 */

export default function PromptInput({
  prompt,
  setPrompt,
  maxLength = 120,
  onPromptTouched,
  error = null,
}) {
  const textareaRef = useRef(null);
  const [localValue, setLocalValue] = useState(
    typeof prompt === "string" ? prompt : "",
  );

  // track whether we've already notified parent that the prompt was touched
  const [touchedNotified, setTouchedNotified] = useState(false);

  // sync incoming prop -> local state when needed
  useEffect(() => {
    if (typeof prompt === "string" && prompt !== localValue) {
      setLocalValue(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  // autosize textarea when value changes
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const resize = () => {
      try {
        el.style.height = "auto";
        el.style.overflowX = "hidden";
        const newHeight = el.scrollHeight;
        if (typeof newHeight === "number" && newHeight > 0) {
          el.style.height = `${newHeight}px`;
        }
      } catch (err) {
        // no-op
      }
    };

    let raf = requestAnimationFrame(resize);
    const fallback = setTimeout(resize, 60);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [localValue]);

  function extractValueFromEvent(e) {
    try {
      if (!e) return null;
      if (e.target && typeof e.target.value === "string") return e.target.value;
      if (e.currentTarget && typeof e.currentTarget.value === "string")
        return e.currentTarget.value;
      if (textareaRef.current && typeof textareaRef.current.value === "string")
        return textareaRef.current.value;
      return null;
    } catch (err) {
      return null;
    }
  }

  const handleChange = (e) => {
    const raw = extractValueFromEvent(e);
    if (typeof raw !== "string") return;
    const value = raw.slice(0, maxLength);
    setLocalValue(value);
    if (typeof setPrompt === "function") {
      try {
        setPrompt(value);
      } catch {
        // preserve local state if parent setter errors
      }
    }
    // notify parent that user started interacting (first time only)
    if (!touchedNotified && typeof onPromptTouched === "function") {
      try {
        onPromptTouched();
      } catch {}
      setTouchedNotified(true);
    }
  };

  const handleBlur = useCallback(() => {
    if (!touchedNotified && typeof onPromptTouched === "function") {
      try {
        onPromptTouched();
      } catch {}
      setTouchedNotified(true);
    }
  }, [onPromptTouched, touchedNotified]);

  // produce an accessible error string from error prop
  let errorString = null;
  if (error === null || typeof error === "undefined") {
    errorString = null;
  } else if (typeof error === "string") {
    errorString = error;
  } else if (typeof error === "object") {
    errorString =
      error?.message ||
      (error.errors && JSON.stringify(error.errors)) ||
      String(error);
  } else {
    errorString = String(error);
  }

  const ariaDescribedBy = errorString ? "remindr-prompt-error" : undefined;

  return (
    <div className="space-y-2">
      <label
        htmlFor="reminder-prompt"
        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        How should we prepare this?
      </label>

      <textarea
        id="reminder-prompt"
        ref={textareaRef}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="E.g. Write a short motivational post about consistency."
        className={`w-full resize-none rounded-md border p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
          ${
            errorString
              ? "border-yellow-400 dark:border-yellow-600"
              : "border-gray-300 dark:border-gray-700"
          }`}
        rows={2}
        spellCheck={true}
        aria-invalid={!!errorString}
        aria-describedby={ariaDescribedBy}
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
      />

      <div className="flex items-center justify-between text-xs">
        <div className="text-gray-500">
          Tip: short, focused prompts (a phrase or one-sentence brief) work
          best.
        </div>
        <div className="text-gray-500">
          {localValue.length}/{maxLength} characters
        </div>
      </div>

      {errorString && (
        <div
          id="remindr-prompt-error"
          role="alert"
          className="text-sm text-yellow-700 dark:text-yellow-300 p-2 rounded-md bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-400 mt-1"
        >
          {errorString}
        </div>
      )}
    </div>
  );
}

PromptInput.propTypes = {
  prompt: PropTypes.string,
  setPrompt: PropTypes.func,
  maxLength: PropTypes.number,
  onPromptTouched: PropTypes.func,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

PromptInput.defaultProps = {
  prompt: "",
  setPrompt: () => {},
  maxLength: 120,
  onPromptTouched: () => {},
  error: null,
};
