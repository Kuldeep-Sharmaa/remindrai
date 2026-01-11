// src/components/auth/AuthWrapper.jsx

import React, { useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { motion, AnimatePresence } from "framer-motion";

import LoginForm from "./login/LoginForm";
import SignupForm from "./signup/SignupForm";
import DynamicWords from "./DynamicWords";

import loginanimation from "../../assets/Animation/Login.json";
import signupanimation from "../../assets/Animation/Agenda.json";

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const formVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

const AuthWrapper = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Function to toggle between login and signup forms
  const toggleForm = () => {
    setIsLogin((prevIsLogin) => !prevIsLogin);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex">
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-12 max-w-md mx-auto lg:max-w-none min-h-screen overflow-y-auto">
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md my-auto"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="inline-flex items-center justify-center  mb-6"
              >
                <img
                  src="/transparent_logo.svg"
                  alt="RemindrAI Logo"
                  className=" h-16 w-auto"
                  loading="eager"
                />
              </motion.div>

              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                {isLogin
                  ? "Welcome back to your AI-powered workspace"
                  : "Join thousands of professionals using AI"}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
              className=" p-8 shadow-2xl"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? "login" : "signup"}
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  {isLogin ? (
                    <LoginForm
                      // Pass the toggle function to LoginForm to switch to Signup
                      onSwitchToSignup={toggleForm}
                    />
                  ) : (
                    <SignupForm
                      // Pass the toggle function to SignupForm to switch to Login
                      onSwitchToLogin={toggleForm}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="relative my-6">
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-gray-100/40 dark:bg-gray-800/20 text-gray-500 dark:text-gray-300 rounded-full">
                    or
                  </span>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={toggleForm} // This button also uses the internal toggleForm
                  className="text-blue-500 hover:text-blue-400 dark:text-blue-300 dark:hover:text-blue-200 text-sm font-medium transition-colors duration-200 hover:underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-black rounded-sm px-1"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="hidden lg:block flex-1 relative">
          <div className="fixed top-0 right-0 w-1/2 h-screen flex flex-col justify-center items-center bg-gray-50/60 dark:bg-gray-900/10 backdrop-blur-sm border-l border-gray-300/40 dark:border-gray-700/30 px-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              className="max-w-lg w-full"
            >
              <div className="mb-8">
                <div className="relative ">
                  <Player
                    autoplay
                    loop
                    speed={0.8}
                    src={isLogin ? loginanimation : signupanimation}
                    style={{ height: "320px", width: "80%" }}
                    rendererSettings={{
                      preserveAspectRatio: "xMidYMid slice",
                      progressiveLoad: true,
                    }}
                  />
                </div>

                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4, ease: "easeOut" }}
                    className="mt-4 flex items-center justify-center space-x-2"
                  >
                    <DynamicWords />
                  </motion.div>
                )}
              </div>

              <div className="text-center">
                <h3 className="text-xl dark:text-white font-semibold mb-3">
                  {isLogin ? "Welcome Back" : "Transform Your Content Strategy"}
                </h3>
                <p className="text-sm dark:text-white leading-relaxed mb-6">
                  {isLogin
                    ? "Access your personalized dashboard and continue creating impactful content that drives results."
                    : "Creators and businesses who've revolutionized their social media presence with intelligent automation."}
                </p>

                <div className="flex flex-wrap justify-center gap-2">
                  <span className="bg-blue-500/20 text-blue-600 dark:text-blue-200 text-xs px-3 py-1.5 rounded-full border border-blue-500/20 dark:border-blue-500/30">
                    AI Content Creation
                  </span>
                  <span className="bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-200 text-xs px-3 py-1.5 rounded-full border border-purple-500/20 dark:border-purple-500/30">
                    Performance Analytics
                  </span>
                  <span className="bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-200 text-xs px-3 py-1.5 rounded-full border border-green-500/20 dark:border-green-500/30">
                    Smart Scheduling
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Animation */}
      <div className="lg:hidden px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          className=" max-w-sm mx-auto"
        >
          <Player
            autoplay
            loop
            speed={0.8}
            src={isLogin ? loginanimation : signupanimation}
            style={{ height: "160px", width: "50%" }}
            rendererSettings={{
              preserveAspectRatio: "xMidYMid slice",
              progressiveLoad: true,
            }}
          />

          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5, ease: "easeOut" }}
              className="mt-3 flex items-center justify-center space-x-2"
            >
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-400 dark:bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 dark:bg-blue-400 rounded-full animate-pulse [animation-delay:150ms]"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 dark:bg-blue-400 rounded-full animate-pulse [animation-delay:300ms]"></div>
              </div>
              <DynamicWords />
            </motion.div>
          )}

          <p className="text-center text-gray-600 dark:text-gray-300 mt-3 text-sm">
            {isLogin
              ? "Continue where you left off"
              : "Your AI-powered content journey starts here"}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthWrapper;
