import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./login/LoginForm";
import SignupForm from "./signup/SignupForm";

const AuthWrapper = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [dir, setDir] = useState(1);

  const toggleForm = () => {
    setDir(isLogin ? 1 : -1);
    setIsLogin((p) => !p);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark font-inter text-textLight dark:text-textDark">
      <header className="w-full flex items-center justify-between sm:py-6 lg:px-8 py-5 border-b border-gray-100 dark:border-border/50">
        <img
          src="/transparent_logo.svg"
          alt="RemindrAI"
          className="h-10 w-auto"
          loading="eager"
        />

        <div className="flex items-center gap-2 text-sm lg:text-base text-muted">
          <span>{isLogin ? "No account?" : "Have an account?"}</span>
          <button
            onClick={toggleForm}
            className="font-medium text-textLight dark:text-textDark border border-gray-200 dark:border-border hover:border-gray-400 dark:hover:border-muted/60 rounded-lg px-3.5 py-1.5 transition-colors duration-150 outline-none"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "h-in" : "h-up"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <h1 className="font-grotesk text-4xl font-semibold tracking-[-0.01em] leading-tight mb-2">
                  {isLogin ? "Welcome back" : "Create your account"}
                </h1>

                <p className="text-base text-muted leading-relaxed">
                  {isLogin
                    ? "Continue where you left off."
                    : "Set up your workspace to get started."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={isLogin ? "login" : "signup"}
              custom={dir}
              initial={{ opacity: 0, y: dir > 0 ? 12 : -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: dir > 0 ? -12 : 12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {isLogin ? (
                <LoginForm onSwitchToSignup={toggleForm} />
              ) : (
                <SignupForm onSwitchToLogin={toggleForm} />
              )}
            </motion.div>
          </AnimatePresence>

          {!isLogin && (
            <p className="mt-6 text-center text-[11px] text-muted/50 leading-relaxed">
              By continuing, you accept our{" "}
              <a
                href="/terms"
                className="underline underline-offset-2 hover:text-muted transition-colors duration-150"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="underline underline-offset-2 hover:text-muted transition-colors duration-150"
              >
                Privacy Policy
              </a>
              .
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthWrapper;
