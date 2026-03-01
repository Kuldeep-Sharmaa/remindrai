import React from "react";

const Spinner = () => (
  <svg
    className="w-[16px] h-[16px] animate-spin flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      className="opacity-20"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
    />
    <path
      className="opacity-90"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

const SubmitButton = ({ isSubmitting, isFormValid }) => (
  <button
    type="submit"
    disabled={isSubmitting || !isFormValid}
    aria-label={isSubmitting ? "Creating account" : "Create account"}
    className={[
      "w-full flex items-center justify-center gap-2",
      "h-[44px] rounded-xl text-base font-grotesk font-semibold text-white",
      "transition-all duration-200 outline-none select-none",
      isSubmitting
        ? "bg-brand/70 cursor-not-allowed"
        : !isFormValid
          ? "bg-brand/35 cursor-not-allowed"
          : "bg-brand hover:bg-brand-hover cursor-pointer active:scale-[0.985]",
    ].join(" ")}
  >
    {isSubmitting ? (
      <>
        <Spinner />
        <span>Creating account…</span>
      </>
    ) : (
      "Create account"
    )}
  </button>
);

export default SubmitButton;
