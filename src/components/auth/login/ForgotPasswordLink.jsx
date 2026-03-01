import React from "react";
import { Link } from "react-router-dom";

const ForgotPasswordLink = () => (
  <Link
    to="/auth/forgot-password"
    className="text-sm font-inter font-medium text-brand hover:opacity-75 transition-opacity duration-150 outline-none"
    aria-label="Go to forgot password page"
  >
    Forgot password?
  </Link>
);

export default ForgotPasswordLink;
