import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const ForgotPasswordLink = () => {
  return (
    <div className="text-sm">
      <Link
        to="/auth/forgot-password"
        className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
        aria-label="Forgot password link"
      >
        Forgot password?
      </Link>
    </div>
  );
};

export default ForgotPasswordLink;
