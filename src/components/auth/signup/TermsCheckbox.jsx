import React from "react";

const TermsCheckbox = ({
  termsAccepted,
  setTermsAccepted,
  setIsValid,
  showValidationError,
}) => {
  const handleChange = (e) => {
    const checked = e.target.checked;
    setTermsAccepted(checked);
    setIsValid(checked); // Set validity based on checked state
  };

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={handleChange}
          className={`h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded
            ${
              showValidationError && !termsAccepted
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }
          `}
          required
          aria-invalid={showValidationError && !termsAccepted}
          aria-describedby="terms-error"
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor="terms" className="text-gray-700 dark:text-gray-300">
          I agree to the{" "}
          <a
            href="/terms"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          >
            Privacy Policy
          </a>
        </label>
      </div>
      {showValidationError && !termsAccepted && (
        <p
          id="terms-error"
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          You must accept the terms to continue.
        </p>
      )}
    </div>
  );
};

export default TermsCheckbox;
