import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Step1Preview from "./steps/step1";
import Step2Preview from "./steps/step2";
import Step3Preview from "./steps/step3";
import Step4Preview from "./steps/step4";

gsap.defaults({ overwrite: "auto" });
gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "Define how you write",
    text: "Set your role, tone, and platform once. Everything follows this.",
  },
  {
    number: "02",
    title: "Choose when it runs",
    text: "Pick the timing. Daily, weekly, or one-time.",
  },
  {
    number: "03",
    title: "It keeps preparing",
    text: "Drafts are created automatically using your setup. Nothing to open or repeat.",
  },
  {
    number: "04",
    title: "A draft is ready",
    text: "When it’s time, the draft is ready. Review, edit, or use it.",
  },
];

const STEP_PREVIEWS = [Step1Preview, Step2Preview, Step3Preview, Step4Preview];
const PROGRESS_HEIGHT = 180;

const Setup = () => {
  const sectionRef = useRef(null);
  const pinnedRef = useRef(null);
  const textRefs = useRef([]);
  const previewRefs = useRef([]);
  const lineFillRef = useRef(null);
  const dotRefs = useRef([]);
  const activeStepRef = useRef(0);

  useEffect(() => {
    if (!sectionRef.current || !pinnedRef.current) return;

    const ctx = gsap.context(() => {
      const isReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      textRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: i === 0 ? 1 : 0, y: 0, force3D: true });
      });

      previewRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: i === 0 ? 1 : 0, y: 0, force3D: true });
      });

      dotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        gsap.set(dot, {
          backgroundColor: i === 0 ? "#2563eb" : "#1f2933",
          scale: i === 0 ? 1.2 : 1,
        });
      });

      if (lineFillRef.current) {
        gsap.set(lineFillRef.current, { scaleY: 0, transformOrigin: "top" });
      }

      function showStep(index) {
        const prev = activeStepRef.current;
        if (prev === index) return;
        const dir = index > prev ? 1 : -1;

        textRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.killTweensOf(el);
          if (i !== index) gsap.set(el, { opacity: 0, y: 0, force3D: true });
        });

        previewRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.killTweensOf(el);
          if (i !== index) gsap.set(el, { opacity: 0, y: 0, force3D: true });
        });

        if (textRefs.current[index]) {
          gsap.fromTo(
            textRefs.current[index],
            { opacity: 0, y: isReducedMotion ? 0 : 24 * dir },
            {
              opacity: 1,
              y: 0,
              duration: isReducedMotion ? 0.05 : 0.5,
              ease: "power3.out",
              force3D: true,
            },
          );
        }

        if (previewRefs.current[index]) {
          gsap.fromTo(
            previewRefs.current[index],
            { opacity: 0, y: isReducedMotion ? 0 : 16 * dir },
            {
              opacity: 1,
              y: 0,
              duration: isReducedMotion ? 0.05 : 0.55,
              ease: "power3.out",
              force3D: true,
              delay: 0.05,
            },
          );
        }

        dotRefs.current.forEach((dot, i) => {
          if (!dot) return;
          gsap.killTweensOf(dot);
          gsap.to(dot, {
            backgroundColor: i === index ? "#2563eb" : "#1f2933",
            scale: i === index ? 1.2 : 1,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        if (lineFillRef.current) {
          gsap.killTweensOf(lineFillRef.current);
          gsap.to(lineFillRef.current, {
            scaleY: index / (steps.length - 1),
            duration: 0.4,
            ease: "power2.out",
          });
        }

        activeStepRef.current = index;
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        pin: pinnedRef.current,
        start: "top top",
        end: () => `+=${window.innerHeight * (steps.length - 1)}`,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const index = Math.min(
            Math.floor(self.progress * steps.length),
            steps.length - 1,
          );
          showStep(index);
        },
        onLeaveBack: () => {
          activeStepRef.current = -1;
          showStep(0);
        },
      });

      const timer = setTimeout(() => ScrollTrigger.refresh(), 300);
      return () => clearTimeout(timer);
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      id="how-it-works"
    >
      <div ref={pinnedRef} className="relative w-full h-screen overflow-hidden">
        <div className="absolute top-20 left-0 right-0 flex justify-center z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5 bg-white dark:bg-black text-xs font-grotesk font-medium  tracking-widest uppercase text-brand">
            How it works
          </span>
        </div>

        <div
          className="hidden lg:flex absolute left-10 top-1/2 -translate-y-1/2 flex-col items-center justify-between z-10"
          style={{ height: `${PROGRESS_HEIGHT}px` }}
        >
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-border" />
          <div
            ref={lineFillRef}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-px bg-brand origin-top"
            style={{ height: "100%" }}
          />
          {steps.map((_, i) => (
            <div
              key={i}
              ref={(el) => (dotRefs.current[i] = el)}
              className="relative z-10 w-2 h-2 rounded-full"
            />
          ))}
        </div>

        {/* Steps */}
        <div className="relative w-full h-full">
          {steps.map((step, i) => {
            const StepPreview = STEP_PREVIEWS[i];
            return (
              <div
                key={i}
                className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 xl:gap-20 px-6 sm:px-10 lg:pl-28 lg:pr-16 xl:pl-32 xl:pr-20 pt-16 lg:pt-0"
              >
                {/* Left — text */}
                <div
                  ref={(el) => (textRefs.current[i] = el)}
                  className="flex flex-col gap-3 text-center lg:text-left lg:flex-none lg:w-[38%] xl:w-[36%]"
                >
                  <span className="font-grotesk text-xs tracking-widest text-muted">
                    {step.number} / {String(steps.length).padStart(2, "0")}
                  </span>
                  <h2 className="font-grotesk text-4xl sm:text-5xl lg:text-6xl xl:text-6xl font-bold text-textLight dark:text-textDark tracking-tight leading-[1.05]">
                    {step.title}
                  </h2>
                  <p className="font-inter text-sm sm:text-base text-textLight dark:text-textDark leading-relaxed max-w-sm mx-auto lg:mx-0">
                    {step.text}
                  </p>
                </div>

                {/* Right — preview panel */}
                <div
                  ref={(el) => (previewRefs.current[i] = el)}
                  className="w-full lg:flex-1 max-w-sm sm:max-w-md lg:max-w-lg"
                >
                  <StepPreview />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Setup;
