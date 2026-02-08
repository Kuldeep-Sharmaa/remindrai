/**
 * ReminderForm.jsx
 *
 * Main form for creating reminders and AI drafts.
 * Handles validation, scheduling, and user preferences.
 */

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

  const [promptTouched, setPromptTouched] = useState(false);
  const [attemptedSave, setAttemptedSave] = useState(false);

  const closeBtnRef = useRef(null);

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

  const [reminderType, setReminderType] = useState("ai");

  useEffect(() => {
    if (form?.reminderType && form.reminderType !== reminderType) {
      setReminderType(form.reminderType);
    }
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
            ? "Your AI draft is ready to begin."
            : "Your content note is set.",
        );

        if (typeof onSuccess === "function") return onSuccess();
        navigate("/dashboard/studio");
      } catch (err) {
        console.error("Save error:", err);
        toast.error(err?.message || "Failed to save.");
      }
    },
    [save, reminderType, prompt, onSuccess, navigate],
  );

  const handleCancel = useCallback(
    () => navigate("/dashboard/studio"),
    [navigate],
  );

  const shouldShowValidationError =
    !isValid && (promptTouched || attemptedSave || scheduleFieldError);

  // Show next run after user touches prompt or if editing existing reminder
  const showNextRun =
    promptTouched || (typeof prompt === "string" && prompt.trim().length > 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto w-full">
        <form
          onSubmit={handleSave}
          className="space-y-8 bg-bgLight/80 dark:bg-bgDark/50 backdrop-blur-lg rounded-2xl border border-border/40 shadow-xl p-5 sm:p-8 transition-all"
          aria-labelledby="remindr-form-title"
        >
          {/* Header */}
          <div className="text-center sm:text-left">
            <h1
              id="remindr-form-title"
              className="text-2xl sm:text-3xl font-grotesk font-bold text-textLight dark:text-textDark tracking-tight"
            >
              Let <span className="text-brand">RemindrAI</span> create for you
            </h1>
            <p className="text-sm sm:text-base text-muted mt-2">
              Consistency powered by AI — It prepares and delivers what you
              need, right on time.
            </p>
          </div>

          {/* User preferences for AI mode */}
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

          <div className="mt-4">
            <PromptInput
              prompt={prompt}
              setPrompt={setPrompt}
              onPromptTouched={handlePromptTouch}
              error={shouldShowValidationError ? promptFieldError : null}
            />
          </div>

          {/* Frequency and time selection */}
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

          {/* Validation errors */}
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

          {/* Form actions */}
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-textLight dark:text-textDark bg-bgLight dark:bg-bgDark border border-border rounded-md hover:brightness-95 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || saving}
              className={`w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-semibold text-white rounded-md transition-colors duration-150 ${
                !isValid || saving
                  ? "bg-brand/40 cursor-not-allowed"
                  : "bg-brand hover:brightness-110"
              }`}
            >
              {saving
                ? reminderType === "ai"
                  ? "Preparing draft…"
                  : "Keeping note ready…"
                : reminderType === "ai"
                  ? "Create draft"
                  : "Save note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
