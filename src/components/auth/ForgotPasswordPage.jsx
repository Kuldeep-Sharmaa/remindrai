import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { sendPasswordReset } from "../../services/authService";
import { showToast } from "../ToastSystem/toastUtils";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const redirectTimer = useRef(null);

  // Clear any pending redirect timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const validate = (value) => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setIsEmailValid(valid);
    return valid;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validate(value); // always validate so button activates as soon as pattern matches
  };

  const handleBlur = () => {
    setIsTouched(true);
    validate(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailValid) {
      showToast({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await sendPasswordReset(email);

      showToast({
        type: "success",
        message:
          "If an account exists for that email, a reset link has been sent. Please check your inbox or spam folder.",
      });

      // Redirect to auth after success only — gives user time to read the toast
      redirectTimer.current = setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);
      // Stay on page so user can retry
      showToast({
        type: "error",
        message:
          "Failed to send reset email. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showError = isTouched && email.length > 0 && !isEmailValid;

  return (
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark font-inter text-textLight dark:text-textDark">
      {/* Top nav bar — matches AuthWrapper */}
      <header className="w-full flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-border/50">
        <img
          src="/transparent_logo.svg"
          alt="RemindrAI"
          className="h-10 w-auto"
          loading="eager"
        />
      </header>

      <main className="flex-1 flex items-center text-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="mb-8"
          >
            <h1 className="font-grotesk text-4xl font-semibold tracking-[-0.01em] leading-tight mb-2">
              Reset your password
            </h1>
            <p className="text-base text-muted leading-relaxed">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut", delay: 0.05 }}
          >
            <div>
              <label
                htmlFor="reset-email"
                className="block text-[12.5px] font-medium font-inter text-textLight/70 dark:text-textDark/60 mb-1.5"
              >
                Email address
              </label>
              <input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                aria-invalid={showError}
                aria-describedby={showError ? "reset-email-error" : undefined}
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
                  id="reset-email-error"
                  className="mt-1.5 text-[11.5px] text-red-500 dark:text-red-400 font-inter"
                >
                  Please enter a valid email address.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isEmailValid || isSubmitting}
              className={[
                "w-full flex items-center justify-center gap-2",
                "h-[44px] rounded-xl text-base font-grotesk font-semibold text-white",
                "transition-all duration-200 outline-none select-none",
                isSubmitting
                  ? "bg-brand/70 cursor-not-allowed"
                  : !isEmailValid
                    ? "bg-brand/35 cursor-not-allowed"
                    : "bg-brand hover:bg-brand-hover cursor-pointer active:scale-[0.985]",
              ].join(" ")}
            >
              {isSubmitting ? "Sending…" : "Send Reset Link"}
            </button>
          </motion.form>

          {/* Back to login */}
          <p className="mt-6 text-center text-[12.5px] text-muted">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => navigate("/auth", { replace: true })}
              className="font-medium text-textLight dark:text-textDark underline underline-offset-2 hover:opacity-70 transition-opacity duration-150 outline-none"
            >
              Back to sign in
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
