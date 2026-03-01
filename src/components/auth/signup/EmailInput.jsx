import React, { useState } from "react";

const EmailInput = ({ email, setEmail, isValid, setIsValid }) => {
  const [isTouched, setIsTouched] = useState(false);

  const validate = (value) => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setIsValid(valid);
    return valid;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validate(value); // always validate so setIsValid stays in sync
  };

  const handleBlur = () => {
    setIsTouched(true);
    validate(email);
  };

  // Only show error UI after user has interacted with the field
  const showError = isTouched && email.length > 0 && !isValid;

  return (
    <div>
      <label
        htmlFor="email"
        className="block text-[12.5px] font-medium font-inter text-textLight/70 dark:text-textDark/60 mb-1.5"
      >
        Email address
      </label>
      <input
        type="email"
        id="email"
        name="email"
        value={email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="you@example.com"
        required
        autoComplete="email"
        aria-invalid={showError}
        aria-describedby={showError ? "email-error" : undefined}
        className={[
          "w-full h-[44px] px-3.5 rounded-xl text-[13.5px] font-inter outline-none",
          "bg-gray-50 dark:bg-white/[0.04]",
          "text-textLight dark:text-textDark placeholder:text-muted/60",
          "transition-all duration-150",
          showError
            ? "border border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/10"
            : "border border-gray-200 dark:border-border focus:border-brand dark:focus:border-brand focus:ring-2 focus:ring-brand/10",
        ].join(" ")}
      />
      {showError && (
        <p
          id="email-error"
          className="mt-1.5 text-[11.5px] text-red-500 dark:text-red-400 font-inter"
        >
          Please enter a valid email address.
        </p>
      )}
    </div>
  );
};

export default EmailInput;
