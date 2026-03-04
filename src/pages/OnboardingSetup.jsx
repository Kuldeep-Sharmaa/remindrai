import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../services/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuthContext } from "../context/AuthContext";
import { Navbar } from "../components/onboarding/OnboardingNav";
import OnboardingLayout from "../components/onboarding/OnboardingLayout";
import OnboardingNavigation from "../components/onboarding/OnboardingNavigation";
import OnboardingStepsContent from "../components/onboarding/OnboardingStepsContent";
import RoleSelector from "../components/onboarding/RoleSelector";
import ToneSelector from "../components/onboarding/ToneSelector";
import PlatformSelector from "../components/onboarding/PlatformSelector";

const OnboardingSetup = () => {
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
    [step, totalSteps],
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
        setSaveError("Session expired. Please log in again.");
        setIsSaving(false);
        navigate("/auth");
        return;
      }

      if (!isStepValid()) {
        setSaveError("Please complete the current step before continuing.");
        setIsSaving(false);
        return;
      }

      if (!selectedTimezone) {
        setSaveError(
          "Timezone is still detecting. Wait a moment and try again.",
        );
        setIsSaving(false);
        return;
      }

      const preferences = {
        role: selectedRole,
        tone,
        platform,
        timezone: selectedTimezone,
        onboardingComplete: true,
        lastUpdated: serverTimestamp(),
        ...(currentUser?.userData?.fullName && {
          fullName: currentUser.userData.fullName,
        }),
      };

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, preferences, { merge: true });

        if (updateUserProfile) {
          updateUserProfile({ onboardingComplete: true });
        }

        // isFirstLoginSession stays true here — DashboardHome flips it on first render
        navigate("/workspace", { replace: true });
      } catch (error) {
        console.error("OnboardingSetup: failed to save preferences:", error);
        setSaveError(`Could not save preferences. Please try again.`);
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
    ],
  );

  const stepData = useMemo(
    () => [
      {
        title: "Your role",
        subtitle: "Select the role closest to your work.",
        component: (
          <RoleSelector
            selectedRole={selectedRole}
            onSelect={setSelectedRole}
          />
        ),
      },
      {
        title: "Content tone",
        subtitle: "Sets the default voice for generated drafts.",
        component: (
          <ToneSelector selectedTone={tone} setSelectedTone={setTone} />
        ),
      },
      {
        title: "Primary platform",
        subtitle: "Choose where your drafts are prepared for.",
        component: (
          <PlatformSelector
            selectedPlatform={platform}
            setSelectedPlatform={setPlatform}
          />
        ),
      },
    ],
    [selectedRole, tone, platform],
  );

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-bgDark">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-border border-t-brand rounded-full animate-spin" />
          <p className="text-sm font-inter text-muted">Setting up...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bgDark dark:bg-bgDark font-inter">
      <Navbar />
      <OnboardingLayout
        containerVariants={containerVariants}
        selectedTimezone={selectedTimezone}
        setSelectedTimezone={setSelectedTimezone}
        step={step}
        totalSteps={totalSteps}
      >
        {saveError && (
          <div className="mb-4 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-inter">
            {saveError}
          </div>
        )}

        <OnboardingStepsContent
          step={step}
          stepData={stepData}
          stepVariants={stepVariants}
        />

        <OnboardingNavigation
          step={step}
          totalSteps={totalSteps}
          changeStep={changeStep}
          isStepValid={isStepValid}
          handleSubmit={handleSubmit}
          selectedTimezone={selectedTimezone}
          isSaving={isSaving}
        />
      </OnboardingLayout>
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, staggerChildren: 0.05 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.22, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: 0.15 },
  },
};

export default OnboardingSetup;
