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

const PasswordInput = ({ password, setPassword, setIsValid, shake }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const validate = (value) => {
    // Login password just needs to be non-empty and have no spaces
    const valid = value.length > 0 && !/\s/.test(value);
    setIsValid(valid);
    return valid;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validate(value);
  };

  const handleBlur = () => {
    setIsTouched(true);
    validate(password);
  };

  const hasSpace = /\s/.test(password);
  const isEmpty = isTouched && password.length === 0;
  const showSpaceError = isTouched && password.length > 0 && hasSpace;
  const showEmptyError = isEmpty;

  return (
    <motion.div variants={shakeVariants} animate={shake ? "shake" : "idle"}>
      <label
        htmlFor="login-password"
        className="block text-sm font-medium font-inter text-textLight/70 dark:text-textDark/60 mb-1.5"
      >
        Password
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id="login-password"
          name="password"
          value={password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          aria-invalid={showSpaceError || showEmptyError}
          aria-describedby="login-password-error"
          className={[
            "w-full h-[44px] px-3.5 pr-10 rounded-xl text-[13.5px] font-inter outline-none",
            "bg-gray-50 dark:bg-white/[0.04]",
            "text-textLight dark:text-textDark placeholder:text-muted/60",
            "transition-all duration-150",
            showSpaceError || showEmptyError
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

      {showEmptyError && (
        <p
          id="login-password-error"
          className="mt-1.5 text-[11.5px] text-red-500 dark:text-red-400 font-inter"
        >
          Password cannot be empty.
        </p>
      )}
      {showSpaceError && (
        <p
          id="login-password-error"
          className="mt-1.5 text-[11.5px] text-red-500 dark:text-red-400 font-inter"
        >
          Password cannot contain spaces.
        </p>
      )}
    </motion.div>
  );
};

export default PasswordInput;
