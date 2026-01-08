import React from "react";
import { Mail, CheckCircle, XCircle } from "lucide-react";

const EmailInput = ({ email, setEmail, isValid, setIsValid }) => {
  const validateEmail = (emailAddress) => {
    // Basic email regex for client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(emailAddress);
    setIsValid(valid);
    return valid;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value); // Validate on change
  };

  return (
    <div>
      <label
        htmlFor="email"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Email Address
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail className="h-5 w-5 text-gray-400 dark:text-gray-400" />
        </div>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={handleChange}
          onBlur={() => validateEmail(email)} // Validate on blur
          className={`w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200
            ${
              email.length > 0 &&
              (isValid ? "border-green-500" : "border-red-500")
            }
          `}
          placeholder="Enter your email"
          required
          aria-invalid={email.length > 0 && !isValid}
          aria-describedby="email-error"
        />
        {email.length > 0 && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isValid ? (
              <CheckCircle
                className="h-5 w-5 text-green-500"
                aria-label="Email is valid"
              />
            ) : (
              <XCircle
                className="h-5 w-5 text-red-500"
                aria-label="Email is invalid"
              />
            )}
          </div>
        )}
      </div>
      {email.length > 0 && !isValid && (
        <p
          id="email-error"
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          Please enter a valid email address.
        </p>
      )}
    </div>
  );
};

export default EmailInput;
