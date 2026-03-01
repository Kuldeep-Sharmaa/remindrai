import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const shakeVariants = {
  shake: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.4, ease: "easeInOut" },
  },
  idle: { x: 0 },
};

const ConfirmPasswordInput = ({
  password,
  confirmPassword,
  setConfirmPassword,
  setIsValid,
  shake,
}) => {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const validate = (value) => {
    const valid = value.length > 0 && password.length > 0 && password === value;
    setIsValid(valid);
    return valid;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setIsTouched(true);
    validate(value);
  };

  const handleBlur = () => {
    setIsTouched(true);
    validate(confirmPassword);
  };

  const showMismatchError =
    isTouched && confirmPassword.length > 0 && password !== confirmPassword;

  const borderClass =
    confirmPassword.length === 0
      ? "border border-gray-200 dark:border-border focus:border-brand dark:focus:border-brand focus:ring-2 focus:ring-brand/10"
      : showMismatchError
        ? "border border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/10"
        : isTouched && password === confirmPassword
          ? "border border-green-500 dark:border-green-500 focus:ring-2 focus:ring-green-400/10"
          : "border border-gray-200 dark:border-border focus:border-brand dark:focus:border-brand focus:ring-2 focus:ring-brand/10";

  return (
    <motion.div variants={shakeVariants} animate={shake ? "shake" : "idle"}>
      <label
        htmlFor="confirm-password"
        className="block text-[12.5px] font-medium font-inter text-textLight/70 dark:text-textDark/60 mb-1.5"
      >
        Confirm Password
      </label>
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          id="confirm-password"
          name="confirm-password"
          value={confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Re-enter your password"
          required
          aria-invalid={showMismatchError}
          aria-describedby="confirm-password-error"
          className={[
            "w-full h-[44px] px-3.5 pr-10 rounded-xl text-[13.5px] font-inter outline-none",
            "bg-gray-50 dark:bg-white/[0.04]",
            "text-textLight dark:text-textDark placeholder:text-muted/60",
            "transition-all duration-150",
            borderClass,
          ].join(" ")}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowConfirmPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-textLight dark:hover:text-textDark transition-colors outline-none"
          aria-label={
            showConfirmPassword
              ? "Hide confirm password"
              : "Show confirm password"
          }
        >
          {showConfirmPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {showMismatchError && (
        <p
          id="confirm-password-error"
          className="mt-1.5 text-[11.5px] text-red-500 dark:text-red-400 font-inter"
        >
          Passwords do not match.
        </p>
      )}
    </motion.div>
  );
};

export default ConfirmPasswordInput;
