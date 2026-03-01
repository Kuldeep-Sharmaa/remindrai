import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import zxcvbn from "zxcvbn";
import PasswordStrengthBar from "./PasswordStrengthBar";

const shakeVariants = {
  shake: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.4, ease: "easeInOut" },
  },
  idle: { x: 0 },
};

const PasswordInput = ({
  password,
  setPassword,
  passwordStrengthResult,
  setPasswordStrengthResult,
  setIsValid,
  shake,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (value.length > 0) {
      const result = zxcvbn(value);
      setPasswordStrengthResult(result);
      setIsValid(value.length >= 6);
    } else {
      setPasswordStrengthResult(null);
      setIsValid(false);
    }
  };

  const showError = isTouched && password.length > 0 && password.length < 6;

  return (
    <motion.div variants={shakeVariants} animate={shake ? "shake" : "idle"}>
      <label
        htmlFor="password"
        className="block text-[12.5px] font-medium font-inter text-textLight/70 dark:text-textDark/60 mb-1.5"
      >
        Password
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          value={password}
          onChange={handleChange}
          onBlur={() => setIsTouched(true)}
          placeholder="At least 6 characters"
          required
          autoComplete="new-password"
          aria-invalid={showError}
          aria-describedby="password-strength"
          className={[
            "w-full h-[44px] px-3.5 pr-10 rounded-xl text-[13.5px] font-inter outline-none",
            "bg-gray-50 dark:bg-white/[0.04]",
            "text-textLight dark:text-textDark placeholder:text-muted/60",
            "transition-all duration-150",
            showError
              ? "border border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/10"
              : "border border-gray-200 dark:border-border focus:border-brand dark:focus:border-brand focus:ring-2 focus:ring-brand/10",
          ].join(" ")}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-textLight dark:hover:text-textDark transition-colors outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {showError && (
        <p className="mt-1.5 text-[11.5px] text-red-500 dark:text-red-400 font-inter">
          Password must be at least 6 characters.
        </p>
      )}

      {password.length > 0 && passwordStrengthResult && (
        <PasswordStrengthBar
          score={passwordStrengthResult.score}
          feedback={passwordStrengthResult.feedback}
        />
      )}
    </motion.div>
  );
};

export default PasswordInput;
