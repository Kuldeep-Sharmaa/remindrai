import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.defaults({ overwrite: "auto" });
gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    title: "Configure once.",
    text: "Set your role, tone, and platforms. The system uses this setup for every draft it prepares. You don’t repeat it.",
  },
  {
    title: "Choose the timing.",
    text: "Decide when drafts should be ready — once, daily, or on selected days. The system follows this timing automatically.",
  },
  {
    title: "Drafts are prepared.",
    text: "At the chosen time, a new draft is prepared using your setup. No tool to open. No prompt to write.",
  },
  {
    title: "Review when ready.",
    text: "A draft is waiting when you open the app. Edit it, use it as is, or build from it.",
  },
];
const Setup = () => {
  const sectionRef = useRef(null);
  const wrapperRef = useRef(null);
  const dotsRef = useRef([]);

  useLayoutEffect(() => {
    if (!wrapperRef.current || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const stepsEls = gsap.utils.toArray(".exp-step");
      const isMobile = window.innerWidth < 768;
      const isReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set(".fade-in", {
        opacity: 0,
        y: isReducedMotion ? 0 : 20,
        force3D: true,
      });

      let currentActiveDot = -1;
      const scrollDistance = window.innerWidth * (stepsEls.length - 1);

      const horizontalTween = gsap.to(stepsEls, {
        xPercent: -100 * (stepsEls.length - 1),
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 0.3,
          end: `+=${scrollDistance}`,
          anticipatePin: 1,
          refreshPriority: -1,
          onUpdate: (self) => {
            const currentIndex = Math.min(
              Math.floor(self.progress * stepsEls.length),
              stepsEls.length - 1,
            );

            if (currentIndex !== currentActiveDot) {
              currentActiveDot = currentIndex;
              dotsRef.current.forEach((dot, i) => {
                if (!dot) return;
                gsap.to(dot, {
                  backgroundColor: i === currentIndex ? "#2563eb" : "#1f2933",
                  scale: i === currentIndex ? 1.3 : 1,
                  duration: 0.3,
                  ease: "power2.out",
                  overwrite: "auto",
                });
              });
            }
          },
        },
      });

      stepsEls.forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: isMobile ? "left 70%" : "left 60%",
          containerAnimation: horizontalTween,
          onEnter: () => {
            gsap.to(step.querySelectorAll(".fade-in"), {
              opacity: 1,
              y: 0,
              duration: isReducedMotion ? 0.1 : isMobile ? 0.4 : 0.6,
              stagger: isReducedMotion ? 0 : isMobile ? 0.05 : 0.1,
              ease: "power2.out",
              force3D: true,
            });
          },
          onLeave: () => {
            gsap.to(step.querySelectorAll(".fade-in"), {
              opacity: 0.3,
              duration: 0.2,
            });
          },
          onEnterBack: () => {
            gsap.to(step.querySelectorAll(".fade-in"), {
              opacity: 1,
              duration: 0.3,
            });
          },
        });
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative ">
      <div ref={wrapperRef} className="flex flex-row">
        {steps.map((step, i) => (
          <div
            key={i}
            className="exp-step will-change-transform flex-shrink-0 w-screen min-h-screen flex flex-col items-center justify-center px-6 sm:px-8 text-center gap-6 sm:gap-8"
          >
            <span className="fade-in font-grotesk text-xs tracking-widest text-muted">
              {String(i + 1).padStart(2, "0")} /{" "}
              {String(steps.length).padStart(2, "0")}
            </span>

            <h2 className="fade-in font-grotesk text-3xl sm:text-4xl lg:text-6xl font-bold text-textLight dark:text-textDark tracking-tight leading-tight max-w-2xl">
              {step.title}
            </h2>

            <p className="fade-in font-inter text-base sm:text-lg text-muted max-w-sm sm:max-w-md leading-relaxed">
              {step.text}
            </p>

            <div className="fade-in flex items-center justify-center w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80">
              <img
                src={`/homepage/step-${i + 1}.svg`}
                alt={step.title}
                className="w-full h-full object-contain select-none"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 pointer-events-none">
        {steps.map((_, i) => (
          <div
            key={i}
            ref={(el) => (dotsRef.current[i] = el)}
            className="w-2 h-2 rounded-full bg-border"
          />
        ))}
      </div>
    </section>
  );
};

export default Setup;
