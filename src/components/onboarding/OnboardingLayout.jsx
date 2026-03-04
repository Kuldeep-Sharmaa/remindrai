import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import StaticTimezoneDetector from "./TimezoneSelector";

const OnboardingLayout = ({
  children,
  containerVariants,
  selectedTimezone,
  setSelectedTimezone,
  step,
  totalSteps,
}) => {
  const topRef = useRef(null);

  // Scroll user to top on every step change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  return (
    <motion.div
      className="relative flex-1 flex flex-col min-h-[calc(100dvh-4rem)] bg-bgDark dark:bg-bgDark mt-16 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[300px] rounded-full bg-brand/[0.07] blur-[110px] z-0" />

      <div ref={topRef} className="absolute top-0 left-0" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center w-full px-5 sm:px-8 pt-10 pb-12">
        <div className="w-full max-w-[440px] flex flex-col gap-7">
          {/* Progress */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-grotesk font-semibold tracking-[0.14em] uppercase text-muted">
                Setup
              </span>
              <span className="text-[11px] font-inter text-muted tabular-nums">
                {step} / {totalSteps}
              </span>
            </div>
            <div className="h-px w-full bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col gap-1.5"
            >
              <h1 className="text-[24px] font-grotesk font-bold text-textDark dark:text-textDark leading-tight tracking-tight">
                Let's set up your workspace.
              </h1>
              <p className="text-[13px] font-inter text-muted leading-relaxed max-w-[340px]">
                Choose how your drafts should be written. You can always adjust
                these later in settings.
              </p>
            </motion.div>
          )}

          {/* Step content */}
          <div className="w-full">{children}</div>

          {/* Timezone — passive system info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="flex flex-col gap-2"
          >
            <StaticTimezoneDetector
              selectedTimezone={selectedTimezone}
              setSelectedTimezone={setSelectedTimezone}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default OnboardingLayout;
