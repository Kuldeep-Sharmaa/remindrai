// ============================================================================
// 📁 ReminderForm.jsx (UPDATED - hide Learn More modal; NextRun shows after prompt touch/type)
// ----------------------------------------------------------------------------

import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useReminderForm from "../../hooks/useReminderForm";
import PromptInput from "../ReminderForm/PromptInput";
import FrequencySelector from "../ReminderForm/FrequencySelector";
import TimeSelector from "../ReminderForm/TimeSelector";
import NextRunDisplay from "../ReminderForm/NextRunDisplay";
import ReminderType from "../ReminderForm/ReminderType";
import UserPreferencesCard from "../UserPreferencesCard";

export default function ReminderForm({ onSuccess, onOpenPreferences } = {}) {
  const navigate = useNavigate();

  // Local UI state
  const [promptTouched, setPromptTouched] = useState(false);
  const [attemptedSave, setAttemptedSave] = useState(false);

  const closeBtnRef = useRef(null);

  // Hooks: single source of truth
  const form = useReminderForm();
  const {
    prompt = "",
    setPrompt = () => {},
    frequency = "one_time",
    setFrequency = () => {},
    schedule = {},
    setSchedule = () => {},
    nextRunIso = null,
    nextRunHuman = null,
    saving = false,
    save = async () => {},
    lastError = null,
    validation: formValidation,
    openPreferences,
    isNextRunValid,
  } = form || {};

  // Reminder Type (local control UI) — keep synced with save calls
  const [reminderType, setReminderType] = useState("ai");

  useEffect(() => {
    if (form?.reminderType && form.reminderType !== reminderType) {
      setReminderType(form.reminderType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.reminderType]);

  const validation = useMemo(() => {
    if (formValidation) return formValidation;
    return { ok: false, errorMessage: null, errors: {} };
  }, [formValidation]);

  const isValid = !!validation?.ok;

  const promptFieldError =
    (validation?.errors &&
      (validation.errors.aiPrompt ||
        validation.errors.message ||
        validation.errors.prompt)) ||
    (validation?.errorCode === "PROMPT_TOO_SHORT" &&
      validation?.errors &&
      (validation.errors.aiPrompt || validation.errors.message)) ||
    null;

  const scheduleFieldError =
    validation?.errorCode === "TIME_IN_PAST" ||
    validation?.errorCode === "TIME_FORMAT_INVALID" ||
    validation?.errorCode === "DATE_MISSING" ||
    validation?.errorCode === "TIME_VALUE_INVALID" ||
    validation?.errorCode === "NEXT_RUN_FAILED";

  const scheduleInlineMessage =
    (validation?.errors &&
      (validation.errors.date ||
        validation.errors.time ||
        validation.errors.timeOfDay ||
        validation.errors.weekDays)) ||
    validation?.errorMessage ||
    null;

  // Handlers
  const handlePromptTouch = useCallback(() => setPromptTouched(true), []);

  const handleOpenPreferences = useCallback(() => {
    if (typeof onOpenPreferences === "function") return onOpenPreferences();
    if (typeof openPreferences === "function") return openPreferences();
    navigate("/dashboard/settings/preferences");
  }, [onOpenPreferences, openPreferences, navigate]);

  const handleSave = useCallback(
    async (e) => {
      e?.preventDefault?.();
      setAttemptedSave(true);

      const overrides =
        reminderType === "ai"
          ? { reminderType: "ai", aiPrompt: prompt }
          : { reminderType: "simple", message: prompt };

      try {
        await save(overrides);

        toast.success(
          reminderType === "ai"
            ? "Your AI content flow is ready "
            : "Your content plan is set"
        );

        if (typeof onSuccess === "function") return onSuccess();
        navigate("/dashboard/studio");
      } catch (err) {
        console.error("⛔ Save error:", err);
        toast.error(err?.message || "Failed to save reminder.");
      }
    },
    [save, reminderType, prompt, onSuccess, navigate]
  );

  const handleCancel = useCallback(
    () => navigate("/dashboard/studio"),
    [navigate]
  );

  const shouldShowValidationError =
    !isValid && (promptTouched || attemptedSave || scheduleFieldError);

  // When to show NextRunDisplay:
  // - Only after user touched/typed OR when prompt is non-empty (so user can edit an existing reminder)
  const showNextRun =
    promptTouched || (typeof prompt === "string" && prompt.trim().length > 0);

  return (
    <div className="min-h-screen py-6 sm:py-10 ">
      <div className="max-w-5xl mx-auto w-full">
        <form
          onSubmit={handleSave}
          className="space-y-8 bg-white/80 dark:bg-black/50 backdrop-blur-lg rounded-2xl border border-gray-300/40 dark:border-white/10 shadow-xl p-5 sm:p-8 transition-all"
          aria-labelledby="remindr-form-title"
        >
          {/* Header */}
          <div className="text-center sm:text-left">
            <h1
              id="remindr-form-title"
              className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight"
            >
              Let <span className="text-indigo-600">RemindrAI</span> create for
              you
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
              Consistency powered by AI — it creates, reminds, and delivers
              right on time
            </p>
          </div>

          {/* User Preferences (only for AI mode) */}
          {reminderType === "ai" && (
            <div className="mt-4">
              <UserPreferencesCard
                handleSettingsClick={handleOpenPreferences}
              />
            </div>
          )}

          <ReminderType
            value={reminderType}
            onChange={setReminderType}
            onOpenLearnMore={() => {}}
          />

          {/* Prompt Input */}
          <div className="mt-4">
            <PromptInput
              prompt={prompt}
              setPrompt={setPrompt}
              onPromptTouched={handlePromptTouch}
              error={shouldShowValidationError ? promptFieldError : null}
            />
          </div>

          {/* Frequency + Time */}
          <div className="mt-4 space-y-3">
            <FrequencySelector value={frequency} onChange={setFrequency} />
            <TimeSelector
              frequency={frequency}
              schedule={schedule}
              onChange={setSchedule}
              error={scheduleInlineMessage}
            />

            {showNextRun && (
              <NextRunDisplay
                nextRunHuman={nextRunHuman}
                isFormValid={isValid}
                isNextRunValid={isNextRunValid}
                reminderMode={reminderType}
                schedule={schedule}
              />
            )}
          </div>

          {/* Validation & Errors */}
          {shouldShowValidationError &&
            validation?.errorCode &&
            !(
              validation.errorCode === "TIME_IN_PAST" ||
              validation.errorCode === "TIME_FORMAT_INVALID" ||
              validation.errorCode === "DATE_MISSING" ||
              validation.errorCode === "TIME_VALUE_INVALID" ||
              validation.errorCode === "NEXT_RUN_FAILED"
            ) &&
            validation?.errorMessage && (
              <div
                className="text-sm text-yellow-700 dark:text-yellow-300 p-3 rounded-lg border border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30"
                role="alert"
              >
                {validation.errorMessage}
              </div>
            )}

          {lastError && (
            <div
              className="text-sm text-red-500 p-3 rounded-lg border border-red-500 bg-red-50 dark:bg-red-950/30"
              role="alert"
            >
              {lastError}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isValid || saving}
              className={`w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-semibold text-white rounded-md transition duration-150 ease-in-out ${
                !isValid || saving
                  ? "bg-indigo-300 dark:bg-indigo-600/50 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-lg"
              }`}
            >
              {saving
                ? "Saving..."
                : reminderType === "ai"
                ? "Create with RemindrAI"
                : "Save Reminder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
