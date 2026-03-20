import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const OnboardingStepsContent = ({ step, stepData, stepVariants }) => {
  const current = stepData[step - 1];

  return (
    <div className="w-full flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full flex flex-col gap-6"
        >
          {/* Heading block */}
          <div className="flex flex-col gap-1.5">
            {/* Numeral + title on the same row — keeps them as a unit, not competing layers */}
            <div className="flex items-baseline gap-3">
              <h2 className="text-[28px] sm:text-[32px] font-grotesk font-bold text-textLight dark:text-textDark leading-tight tracking-tight">
                {current.title}
              </h2>
            </div>

            <p className="text-[12.5px] font-inter text-textLight/80 dark:text-textDark/80 leading-relaxed pl-[2px]">
              {current.subtitle}
            </p>
          </div>

          {/* Selector component */}
          <div className="w-full">{current.component}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingStepsContent;
