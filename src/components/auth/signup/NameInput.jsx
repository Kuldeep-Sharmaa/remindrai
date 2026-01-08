import React from "react";
import { User, CheckCircle, XCircle } from "lucide-react";

const NameInput = ({ fullName, setFullName, isValid, setIsValid }) => {
  const validateName = (name) => {
    // Name must not be empty and should be at least 2 characters long
    // Ensure 'name' is treated as a string to prevent errors if it's null/undefined
    const valid = (name || "").trim().length >= 2; // Added (name || '') to ensure it's a string
    setIsValid(valid);
    return valid;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setFullName(value);
    validateName(value); // Validate on change
  };

  return (
    <div>
      <label
        htmlFor="fullName"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Full Name
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <User className="h-5 w-5 text-gray-400 dark:text-gray-400" />
        </div>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={fullName || ""} // Ensure value is always a string
          onChange={handleChange}
          onBlur={() => validateName(fullName)} // Validate on blur
          className={`w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200
            ${
              (fullName || "").length > 0 &&
              (isValid ? "border-green-500" : "border-red-500")
            }
          `}
          placeholder="Enter your full name"
          required
          aria-invalid={(fullName || "").length > 0 && !isValid}
          aria-describedby="name-error"
          autoComplete="name" // Added for full name
        />
        {(fullName || "").length > 0 && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isValid ? (
              <CheckCircle
                className="h-5 w-5 text-green-500"
                aria-label="Name is valid"
              />
            ) : (
              <XCircle
                className="h-5 w-5 text-red-500"
                aria-label="Name is invalid"
              />
            )}
          </div>
        )}
      </div>
      {(fullName || "").length > 0 && !isValid && (
        <p
          id="name-error"
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          Full name must be at least 2 characters.
        </p>
      )}
    </div>
  );
};

export default NameInput;
