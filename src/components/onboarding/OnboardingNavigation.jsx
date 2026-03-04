import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const OnboardingNavigation = ({
  step,
  totalSteps,
  changeStep,
  isStepValid,
  handleSubmit,
  selectedTimezone,
  isSaving,
}) => {
  const isLastStep = step === totalSteps;
  const stepValid = isStepValid();
  const canFinish = stepValid && !!selectedTimezone;

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-5">
      {/* Only surfaces when timezone is the actual blocker — not before */}
      {isLastStep && stepValid && !selectedTimezone && (
        <p className="text-[11px] font-inter text-muted text-center pb-1">
          Detecting timezone — just a moment.
        </p>
      )}

      {isLastStep ? (
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={!canFinish || isSaving}
          whileTap={{ scale: canFinish ? 0.98 : 1 }}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-grotesk font-semibold tracking-tight transition-all duration-200
            ${
              canFinish && !isSaving
                ? "bg-brand text-white hover:bg-brand-hover shadow-[0_0_28px_rgba(37,99,235,0.22)]"
                : "bg-bgImpact text-muted cursor-not-allowed border border-border"
            }`}
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving
            </>
          ) : (
            <>
              Finish setup
              <Check className="w-4 h-4" strokeWidth={2.5} />
            </>
          )}
        </motion.button>
      ) : (
        <motion.button
          type="button"
          onClick={() => changeStep(step + 1)}
          disabled={!stepValid || isSaving}
          whileTap={{ scale: stepValid ? 0.98 : 1 }}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-grotesk font-semibold tracking-tight transition-all duration-200
            ${
              stepValid && !isSaving
                ? "bg-brand text-white hover:bg-brand-hover shadow-[0_0_28px_rgba(37,99,235,0.22)]"
                : "bg-bgImpact text-muted cursor-not-allowed border border-border"
            }`}
        >
          Continue
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </motion.button>
      )}

      {/* Back is secondary — ghost weight keeps visual hierarchy clear */}
      {step > 1 && (
        <motion.button
          type="button"
          onClick={() => changeStep(step - 1)}
          disabled={isSaving}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-inter text-muted hover:text-textDark transition-colors duration-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Back
        </motion.button>
      )}
    </div>
  );
};

export default OnboardingNavigation;
