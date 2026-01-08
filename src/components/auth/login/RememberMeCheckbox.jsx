import React from "react";

const RememberMeCheckbox = ({ rememberMe, setRememberMe }) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id="remember-me"
        checked={rememberMe}
        onChange={(e) => setRememberMe(e.target.checked)}
        className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded"
        aria-label="Remember me"
      />
      <label
        htmlFor="remember-me"
        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
      >
        Remember me
      </label>
    </div>
  );
};

export default RememberMeCheckbox;
