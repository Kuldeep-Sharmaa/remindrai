import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Set GSAP defaults for better tween handling and performance
gsap.defaults({
  overwrite: "auto",
});

gsap.registerPlugin(ScrollTrigger);
const steps = [
  {
    title: "Sign Up & Personalize",
    text: "Tell RemindrAI your role, tone, and platforms. This shapes the style of every draft you receive.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Choose When You Want Support",
    text: "Pick the moments you want help staying consistent — daily, weekly, or anytime your workflow needs a boost.",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "AI Prepares Your Content",
    text: "RemindrAI proactively creates fresh, on-brand ideas and drafts aligned with your preferences and posting style.",
    color: "from-green-500 to-emerald-400",
  },
  {
    title: "You Stay Consistent Effortlessly",
    text: "When it’s time to show up, you’ll already have a polished draft ready — edit it, post it, or spark new ideas from it.",
    color: "from-orange-500 to-red-400",
  },
];

const Experience = () => {
  const sectionRef = useRef(null);
  const wrapperRef = useRef(null);
  const progressRef = useRef(null);
  const fadeOverlayRef = useRef(null);

  useLayoutEffect(() => {
    if (!wrapperRef.current || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const stepsEls = gsap.utils.toArray(".exp-step");
      const progressDots = gsap.utils.toArray(".progress-dot");
      const isMobile = window.innerWidth < 768;
      const isReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Set initial states with force3D for hardware acceleration and will-change
      gsap.set(".fade-in", {
        opacity: 0,
        y: isReducedMotion ? 0 : 20,
        force3D: true,
      });

      // Initialize the overlay for the transition fade
      if (fadeOverlayRef.current) {
        gsap.set(fadeOverlayRef.current, {
          opacity: 0,
        });
      }

      // Store current active dot index to avoid conflicts
      let currentActiveDot = -1;

      const scrollDistance = isMobile
        ? window.innerWidth * (stepsEls.length - 1)
        : window.innerWidth * (stepsEls.length - 1);

      const horizontalTween = gsap.to(stepsEls, {
        xPercent: -100 * (stepsEls.length - 1),
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: wrapperRef.current,
          scrub: isMobile ? 0.3 : 0.3, // Smoother scrub value
          end: `+=${scrollDistance}`,
          anticipatePin: 1,
          refreshPriority: -1,
          onUpdate: (self) => {
            const currentIndex = Math.min(
              Math.floor(self.progress * stepsEls.length),
              stepsEls.length - 1
            );

            // Only update if the active dot has changed
            if (currentIndex !== currentActiveDot) {
              currentActiveDot = currentIndex;

              // Use regular GSAP tweens instead of quickTo to avoid conflicts
              progressDots.forEach((dot, i) => {
                gsap.to(dot, {
                  backgroundColor: i === currentIndex ? "#8B5CF6" : "#4B5563",
                  scale: i === currentIndex ? 1.3 : 1,
                  duration: 0.3,
                  ease: "power2.out",
                  overwrite: "auto",
                });
              });
            }
          },
          onLeave: () => {
            // Clean transition out - fade the section
            if (sectionRef.current) {
              gsap.to(sectionRef.current, {
                opacity: 0.8,
                duration: 0.5,
                ease: "power2.out",
              });
            }

            // Refresh ScrollTrigger after a brief delay
            setTimeout(() => ScrollTrigger.refresh(), 50);
          },
          onEnterBack: () => {
            // Restore section opacity when scrolling back
            if (sectionRef.current) {
              gsap.to(sectionRef.current, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
              });
            }

            setTimeout(() => ScrollTrigger.refresh(), 50);
          },
        },
      });

      stepsEls.forEach((step, i) => {
        const triggerStart = isMobile ? "left 70%" : "left 60%";

        ScrollTrigger.create({
          trigger: step,
          start: triggerStart,
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

            // Fade out the previous step's background color
            if (i > 0) {
              const prevStepBg = stepsEls[i - 1].querySelector(".blur-3xl");
              if (prevStepBg) {
                gsap.to(prevStepBg, {
                  opacity: 0,
                  duration: 0.4,
                  ease: "power1.out",
                });
              }
            }
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

            // Fade back in the previous step's background color
            if (i > 0) {
              const prevStepBg = stepsEls[i - 1].querySelector(".blur-3xl");
              if (prevStepBg) {
                gsap.to(prevStepBg, {
                  opacity: 0.2,
                  duration: 0.4,
                  ease: "power1.out",
                });
              }
            }
          },
        });
      });
    }, sectionRef.current);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="experience-section relative overflow-hidden"
    >
      {/* Optional fade overlay for transitions */}
      <div
        ref={fadeOverlayRef}
        className="absolute  pointer-events-none z-10"
      />

      <div
        ref={wrapperRef}
        className="experience-wrapper flex flex-row min-h-screen"
      >
        {steps.map((step, i) => (
          <div
            key={i}
            className="exp-step will-change-transform flex-shrink-0 w-screen h-screen flex flex-col items-center justify-center px-6 sm:px-8 text-center space-y-6 sm:space-y-8"
          >
            <div className="fade-in text-gray-500 dark:text-gray-400 font-mono text-xs sm:text-sm">
              {String(i + 1).padStart(2, "0")} /{" "}
              {String(steps.length).padStart(2, "0")}
            </div>
            <h2
              className="fade-in text-3xl sm:text-4xl lg:text-6xl font-extrabold 
             text-gray-900 dark:text-gray-100 tracking-tight leading-tight"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
            >
              {step.title}
            </h2>

            <p className="fade-in text-base sm:text-lg text-gray-800 dark:text-gray-200 max-w-sm sm:max-w-lg leading-relaxed px-4">
              {step.text}
            </p>

            <div className="fade-in relative flex items-center justify-center w-56 h-56 sm:w-72 sm:h-72 lg:w-96 lg:h-80">
              <img
                src={`/assets/svg/homepage/step-${i + 1}.svg`}
                alt={step.title}
                className="relative w-40 sm:w-80 lg:w-96 select-none"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Experience;
