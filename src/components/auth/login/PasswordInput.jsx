import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "framer-motion";

const PasswordInput = ({ password, setPassword, setIsValid, shake }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [hasSpace, setHasSpace] = useState(false);
  const [isPasswordLocalValid, setIsPasswordLocalValid] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const checkPasswordValidity = (pwd) => {
    const containsSpace = /\s/.test(pwd);
    setHasSpace(containsSpace);

    const valid = pwd.length > 0 && !containsSpace;
    setIsPasswordLocalValid(valid);
    setIsValid(valid);
    return valid;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    checkPasswordValidity(value);
  };

  const handleBlur = () => {
    checkPasswordValidity(password);
  };

  const shakeVariants = {
    shake: {
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    noShake: {
      x: 0,
    },
  };

  return (
    <motion.div variants={shakeVariants} animate={shake ? "shake" : "noShake"}>
      <label
        htmlFor="password"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Password
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400 dark:text-gray-400" />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          value={password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200
            ${
              password.length > 0 &&
              (isPasswordLocalValid ? "border-green-500" : "border-red-500")
            }
          `}
          placeholder="Enter your password"
          required
          aria-invalid={password.length > 0 && !isPasswordLocalValid}
          aria-describedby="password-error"
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
      {password.length > 0 && hasSpace && (
        <p
          id="password-error"
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          Password cannot contain spaces.
        </p>
      )}
      {password.length > 0 && !hasSpace && !isPasswordLocalValid && (
        <p
          id="password-error"
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          Password cannot be empty.
        </p>
      )}
    </motion.div>
  );
};

export default PasswordInput;
