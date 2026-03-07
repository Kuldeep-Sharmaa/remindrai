import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.defaults({ overwrite: "auto" });
gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "Configure once",
    text: "Set your role, tone, and platforms. The system uses this setup for every draft it prepares. You don’t repeat it.",
  },
  {
    number: "02",
    title: "Choose the timing",
    text: "Decide when drafts should be ready — once, daily, or on selected days. The system follows this timing automatically.",
  },
  {
    number: "03",
    title: "Drafts are prepared",
    text: "At the chosen time, a new draft is prepared using your setup. No tool to open. No prompt to write.",
  },
  {
    number: "04",
    title: "Review when ready",
    text: "A draft is waiting when you open the app. Edit it, use it as is, or build from it.",
  },
];

const PROGRESS_HEIGHT = 180;

const Setup = () => {
  const sectionRef = useRef(null);
  const pinnedRef = useRef(null);
  const textRefs = useRef([]);
  const imageRefs = useRef([]);
  const lineFillRef = useRef(null);
  const dotRefs = useRef([]);
  const activeStepRef = useRef(0);

  useLayoutEffect(() => {
    if (!sectionRef.current || !pinnedRef.current) return;

    const ctx = gsap.context(() => {
      const isReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      textRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: i === 0 ? 1 : 0, y: 0, force3D: true });
      });

      imageRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: i === 0 ? 1 : 0, force3D: true });
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

        imageRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.killTweensOf(el);
          if (i !== index) gsap.set(el, { opacity: 0, force3D: true });
        });

        if (textRefs.current[index]) {
          gsap.fromTo(
            textRefs.current[index],
            { opacity: 0, y: isReducedMotion ? 0 : 32 * dir },
            {
              opacity: 1,
              y: 0,
              duration: isReducedMotion ? 0.05 : 0.55,
              ease: "power3.out",
              force3D: true,
            },
          );
        }

        if (imageRefs.current[index]) {
          gsap.fromTo(
            imageRefs.current[index],
            { opacity: 0 },
            {
              opacity: 1,
              duration: isReducedMotion ? 0.05 : 0.45,
              ease: "power2.out",
              force3D: true,
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
        end: `+=${window.innerHeight * (steps.length - 1)}`,
        anticipatePin: 1,
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
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative">
      <div
        ref={pinnedRef}
        className="relative w-full h-screen overflow-hidden "
      >
        <div className="absolute top-8 left-0 right-0 flex justify-center z-10">
          <span className="inline-flex items-center font-grotesk text-xs tracking-widest text-muted border border-border rounded-full px-3 py-1">
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

        <div className="relative w-full h-full">
          {steps.map((step, i) => (
            <div
              key={i}
              className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-16 xl:gap-24 px-6 sm:px-10 lg:px-24  lg:pt-0 lg:pb-0"
            >
              <div
                ref={(el) => (imageRefs.current[i] = el)}
                className="flex items-center justify-center order-first lg:order-last lg:flex-1"
              >
                <img
                  src={`/homepage/step-${i + 1}.svg`}
                  alt={step.title}
                  className="w-auto h-64 lg:h-96 object-contain select-none"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div
                ref={(el) => (textRefs.current[i] = el)}
                className="flex flex-col gap-3 sm:gap-4 text-center lg:text-left lg:flex-1"
              >
                <span className="font-grotesk text-xs tracking-widest text-muted">
                  {step.number} / {String(steps.length).padStart(2, "0")}
                </span>
                <h2 className="font-grotesk text-3xl sm:text-4xl lg:text-7xl font-bold text-textLight dark:text-textDark tracking-tight leading-tight">
                  {step.title}
                </h2>
                <p className="font-inter text-base sm:text-lg text-muted max-w-sm sm:max-w-md leading-relaxed mx-auto lg:mx-0">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Setup;
