import React, { useState } from "react";

const NameInput = ({ fullName, setFullName, isValid, setIsValid }) => {
  const [isTouched, setIsTouched] = useState(false);

  const validate = (value) => {
    const valid = (value || "").trim().length >= 2;
    setIsValid(valid);
    return valid;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setFullName(value);
    validate(value); // always validate so setIsValid stays in sync
  };

  const handleBlur = () => {
    setIsTouched(true);
    validate(fullName);
  };

  // Only show error UI after user has interacted with the field
  const showError = isTouched && (fullName || "").length > 0 && !isValid;

  return (
    <div>
      <label
        htmlFor="fullName"
        className="block text-[12.5px] font-medium font-inter text-textLight/70 dark:text-textDark/60 mb-1.5"
      >
        Full name
      </label>
      <input
        type="text"
        id="fullName"
        name="fullName"
        value={fullName || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Alex Johnson"
        required
        autoComplete="name"
        aria-invalid={showError}
        aria-describedby={showError ? "name-error" : undefined}
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
          id="name-error"
          className="mt-1.5 text-[11.5px] text-red-500 dark:text-red-400 font-inter"
        >
          Name must be at least 2 characters.
        </p>
      )}
    </div>
  );
};

export default NameInput;
