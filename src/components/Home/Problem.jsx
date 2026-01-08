import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import agendaAnimation from "../../../public/assets/Animation/Agenda.json";
import Lottie from "lottie-react";

// Register GSAP plugins OUTSIDE the component to ensure they're available immediately
gsap.registerPlugin(ScrollTrigger);

const Problem = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subtextRef = useRef(null);
  const visualRef = useRef(null);
  const cardsRef = useRef([null, null, null]);

  // Use useLayoutEffect for GSAP animations that interact with the DOM
  useLayoutEffect(() => {
    // Ensure the main ref is available before creating the GSAP context
    if (!sectionRef.current) {
      return; // Exit if the ref is not yet attached to the DOM
    }

    // Create a single GSAP context, explicitly passing the scope.
    // This correctly ties all animations created inside this function to `sectionRef.current`
    const ctx = gsap.context(() => {
      const ease = "power3.out";

      // Animate each word
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current.querySelectorAll(".word"),
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease,
            stagger: 0.1,
            scrollTrigger: {
              trigger: sectionRef.current, // Use sectionRef as the primary trigger for this section
              start: "top 70%",
            },
          }
        );
      }

      // Animate subtext
      if (subtextRef.current) {
        gsap.from(subtextRef.current, {
          opacity: 0,
          y: 15,
          duration: 1,
          delay: 0.2,
          ease,
          scrollTrigger: {
            trigger: subtextRef.current,
            start: "top 75%",
          },
        });
      }
      gsap.from(cardsRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardsRef.current[0]?.parentNode,
          start: "top 80%", // animation starts when 80% of viewport reaches section
        },
      });
      // Animate Lottie visual
      if (visualRef.current) {
        gsap.from(visualRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 1,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: visualRef.current,
            start: "top 70%",
          },
        });
      }
    }, sectionRef.current); // <--- Crucial: Pass the actual DOM element here

    // Cleanup function for GSAP context
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[75vh] md:min-h-[80vh] lg:min-h-[85vh]
                  flex flex-col items-center justify-center
                  px-4 sm:px-6 md:px-8 lg:px-12
                  py-12 sm:py-16 md:py-20 lg:py-24"
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
        {/* Enhanced Heading with responsive word wrapping */}
        <h2
          ref={headingRef}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl
                     font-bold text-center mb-4 sm:mb-6 md:mb-8
                     leading-tight sm:leading-snug md:leading-snug
                     text-gray-900 dark:text-white
                     max-w-4xl mx-auto px-2"
        >
          <span className="word">The</span>{" "}
          <span className="word">Hardest</span>{" "}
          <span className="word">Part</span> <span className="word">of</span>{" "}
          <span className="word">Growth?</span>{" "}
          <span
            className="word bg-gradient-to-r from-red-500 via-orange-500 to-red-600
                            dark:from-red-400 dark:via-orange-400 dark:to-red-500
                            bg-clip-text text-transparent drop-shadow-sm"
          >
            Consistency.
          </span>
        </h2>

        {/* Enhanced Subtext */}
        <p
          ref={subtextRef}
          className="text-sm sm:text-base md:text-lg lg:text-xl
                     text-gray-600 dark:text-gray-300
                     max-w-2xl lg:max-w-3xl mx-auto text-center
                     mb-8 sm:mb-10 md:mb-12 lg:mb-16
                     leading-relaxed px-4 sm:px-6 md:px-2"
        >
          Most professionals struggle to post regularly. Deadlines pile up,
          creative ideas dry out, and stress builds — while growth momentum{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            slowly fades away
          </span>
          .
        </p>

        {/* Enhanced Lottie Animation Container */}
        <div
          ref={visualRef}
          className="w-full flex justify-center items-center"
        >
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl">
            {/* Main animation container */}
            <div className="relative">
              <Lottie
                animationData={agendaAnimation}
                loop
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  aspectRatio: "1/1",
                }}
                rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
              />
            </div>
          </div>
        </div>

        {/* Optional: Pain Points Indicators */}
        <div
          className="mt-8 sm:mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8
                 max-w-4xl mx-auto px-4"
        >
          {/* Card 1 */}
          <div
            ref={(el) => (cardsRef.current[0] = el)}
            className="text-center p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20
                   border border-red-100/50 dark:border-red-900/30"
          >
            <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 mb-1">
              73%
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Miss posting deadlines
            </div>
          </div>

          {/* Card 2 */}
          <div
            ref={(el) => (cardsRef.current[1] = el)}
            className="text-center p-4 rounded-xl bg-orange-50/50 dark:bg-orange-950/20
                   border border-orange-100/50 dark:border-orange-900/30"
          >
            <div className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              5hrs
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Wasted weekly planning
            </div>
          </div>

          {/* Card 3 */}
          <div
            ref={(el) => (cardsRef.current[2] = el)}
            className="text-center p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20
                   border border-red-100/50 dark:border-red-900/30"
          >
            <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 mb-1">
              -40%
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Growth rate drop
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
