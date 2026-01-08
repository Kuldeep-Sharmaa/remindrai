// src/pages/OnboardingSetup.jsx - UPDATED VERSION

import React, { useState, useEffect, useCallback, useMemo } from "react";

import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

// Import Firebase db, doc, setDoc, and serverTimestamp

import { db } from "../services/firebase";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// Import useAuthContext - IMPORTANT: Ensure this path is correct!

import { useAuthContext } from "../context/AuthContext";

import { Navbar } from "../components/onboarding/OnboardingNav";

import Background from "../components/Background";

import OnboardingLayout from "../components/onboarding/OnboardingLayout";

import OnboardingNavigation from "../components/onboarding/OnboardingNavigation";

import OnboardingStepsContent from "../components/onboarding/OnboardingStepsContent";

import RoleSelector from "../components/onboarding/RoleSelector";

import ToneSelector from "../components/onboarding/ToneSelector";

import PlatformSelector from "../components/onboarding/PlatformSelector";

const OnboardingSetup = () => {
  // Destructure updateUserProfile from useAuthContext

  const navigate = useNavigate();

  const { currentUser, updateUserProfile } = useAuthContext();

  const [step, setStep] = useState(1);

  const [selectedRole, setSelectedRole] = useState("");

  const [tone, setTone] = useState(null);

  const [platform, setPlatform] = useState("");

  const [selectedTimezone, setSelectedTimezone] = useState("");

  const [isLoaded, setIsLoaded] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [saveError, setSaveError] = useState("");

  const totalSteps = 3;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);

    return () => clearTimeout(timer);
  }, []);

  const changeStep = useCallback(
    (newStep) => {
      if (newStep === step || newStep < 1 || newStep > totalSteps) return;

      setStep(newStep);
    },

    [step, totalSteps]
  );

  const isStepValid = useCallback(() => {
    switch (step) {
      case 1:
        return selectedRole !== "";

      case 2:
        return tone !== null;

      case 3:
        return platform !== "";

      default:
        return false;
    }
  }, [step, selectedRole, tone, platform]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      setSaveError("");

      setIsSaving(true);

      if (!currentUser?.uid) {
        setSaveError(
          "Authentication error: Invalid user session. Please log in again."
        );

        setIsSaving(false);

        navigate("/auth");

        return;
      }

      if (!isStepValid()) {
        setSaveError(
          "Please complete all required fields for the current step."
        );

        setIsSaving(false);

        return;
      }

      if (!selectedTimezone) {
        setSaveError("Please confirm your timezone from the left panel.");

        setIsSaving(false);

        return;
      }

      const preferences = {
        role: selectedRole,

        tone,

        platform,

        timezone: selectedTimezone,

        onboardingComplete: true, // This is key: it's set in Firestore

        lastUpdated: serverTimestamp(), // Only include fullName if it exists in currentUser.userData

        ...(currentUser?.userData?.fullName && {
          fullName: currentUser.userData.fullName,
        }),
      };

      try {
        const userDocRef = doc(db, "users", currentUser.uid); // 2. Merge Update to Firestore

        await setDoc(userDocRef, preferences, { merge: true }); // ✅ CRITICAL FIX: Update AuthContext to reflect the completed onboarding. // Do NOT set showInitialWelcome here. // isFirstLoginSession should already be true for a new user // coming through onboarding (as set by AuthContext on first verified login), // and DashboardHome will handle flipping it to false.

        if (updateUserProfile) {
          updateUserProfile({
            onboardingComplete: true, // REMOVED: showInitialWelcome: true, // THIS LINE HAS BEEN REMOVED
          });

          console.log(
            "OnboardingSetup: Manually updated AuthContext with onboardingComplete: true."
          );
        } // Immediately navigate directly to the dashboard page. // DashboardHome will now handle the initial welcome message logic upon its first render.

        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error(
          "OnboardingSetup: Failed to save preferences or mark onboarding complete:",

          error
        );

        setSaveError(
          `Failed to save your preferences: ${error.message}. Please try again.`
        );
      } finally {
        setIsSaving(false);
      }
    },

    [
      isStepValid,

      selectedTimezone,

      selectedRole,

      tone,

      platform,

      currentUser,

      navigate,

      updateUserProfile,
    ]
  );

  const stepData = useMemo(
    () => [
      {
        title: "What best describes you?",

        subtitle:
          "Select the role that fits your goals — we’ll adapt your experience.",

        component: (
          <RoleSelector
            selectedRole={selectedRole}
            onSelect={setSelectedRole}
          />
        ),
      },

      {
        title: "How should your content sound?",

        subtitle: "Select the tone that reflects your brand voice.",

        component: (
          <ToneSelector selectedTone={tone} setSelectedTone={setTone} />
        ),
      },

      {
        title: "Where will you publish?",

        subtitle: "Choose your platform so RemindrAI can tailor your posts.",

        component: (
          <PlatformSelector
            selectedPlatform={platform}
            setSelectedPlatform={setPlatform}
          />
        ),
      },
    ],

    [selectedRole, setSelectedRole, tone, setTone, platform, setPlatform]
  );

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center relative overflow-hidden">
                <Background />       {" "}
        <div className="relative z-10 flex flex-col items-center text-gray-700 dark:text-gray-300">
                   {" "}
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                   {" "}
          <p className="text-lg font-semibold">
            Loading your personalized setup...{" "}
          </p>
                 {" "}
        </div>
             {" "}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-inter relative">
            <Background />
            <Navbar />     {" "}
      <OnboardingLayout
        containerVariants={containerVariants}
        itemVariants={itemVariants}
        selectedTimezone={selectedTimezone}
        setSelectedTimezone={setSelectedTimezone}
      >
               {" "}
        <div className="flex flex-col h-full">
                   {" "}
          <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-4 min-h-0">
                       {" "}
            {saveError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4">
                                <strong className="font-bold">Error:</strong>{" "}
                {saveError}             {" "}
              </div>
            )}
                       {" "}
            <OnboardingStepsContent
              step={step}
              stepData={stepData}
              stepVariants={stepVariants}
            />
                     {" "}
          </div>
                   {" "}
          <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 border-t border-gray-200">
                       {" "}
            <OnboardingNavigation
              step={step}
              totalSteps={totalSteps}
              changeStep={changeStep}
              isStepValid={isStepValid}
              handleSubmit={handleSubmit}
              selectedTimezone={selectedTimezone}
              isSaving={isSaving}
            />
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </OnboardingLayout>
         {" "}
    </div>
  );
};

// --- Helper Constants ---

const containerVariants = {
  hidden: { opacity: 0 },

  visible: {
    opacity: 1,

    transition: {
      duration: 0.2,

      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },

  visible: {
    opacity: 1,

    y: 0,

    transition: {
      duration: 0.3,

      ease: "easeOut",
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, x: 20 },

  visible: {
    opacity: 1,

    x: 0,

    transition: {
      duration: 0.2,

      ease: "easeOut",
    },
  },

  exit: {
    opacity: 0,

    x: -20,

    transition: {
      duration: 0.15,
    },
  },
};

export default OnboardingSetup;
