import React, { useRef, useEffect } from "react";
import Lottie from "lottie-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import aiAnimationData from "../../assets/Animation/ai.json";

import GradientButton from "../Ui/GradientBtn";

const Hero = () => {
  const sectionRef = useRef(null);
  const lottieRef = useRef(null);
  const taglineRef = useRef(null);
  const headingRef = useRef(null);
  const subtextRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(
        [
          lottieRef.current,
          taglineRef.current,
          subtextRef.current,
          buttonRef.current,
        ],
        {
          opacity: 0,
          y: 30,
        },
      );

      gsap.set(lottieRef.current, {
        scale: 0.8,
        rotation: -5,
      });

      // Main animation timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Tagline entrance
      tl.to(taglineRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      })

        // Heading words stagger
        .from(
          headingRef.current.querySelectorAll(".word"),
          {
            opacity: 0,
            y: 40,
            rotationX: 90,
            stagger: 0.08,
            duration: 0.8,
            ease: "back.out(1.7)",
          },
          "-=0.4",
        )

        // Lottie entrance with sophisticated animation
        .to(
          lottieRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 1.2,
            ease: "elastic.out(1, 0.8)",
          },
          "-=0.6",
        )

        // Subtext entrance
        .to(
          subtextRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
          },
          "-=0.4",
        )

        // Button entrance
        .to(
          buttonRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
          },
          "-=0.2",
        );

      // Scroll-triggered parallax effect
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.to(lottieRef.current, {
            y: progress * -50,
            scale: 1 - progress * 0.1,
            duration: 0.3,
            ease: "none",
          });

          gsap.to([headingRef.current, taglineRef.current], {
            y: progress * -30,
            duration: 0.3,
            ease: "none",
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col justify-center items-center px-4 py-16 mt-10 overflow-hidden"
    >
      <div className="relative z-10 text-center max-w-6xl mx-auto">
        {/* Main Heading */}
        <h1
          ref={headingRef}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold max-w-5xl mx-auto text-gray-900 dark:text-white leading-[1.1]"
        >
          <span className="word block sm:inline">You</span>{" "}
          <span className="word">remind</span> <span className="word">it</span>{" "}
          <span className="word">once.</span>
          <br />
          <span className="word">It</span>{" "}
          <span className="word bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            remembers
          </span>{" "}
          <span className="word">forever.</span>
        </h1>

        {/* Lottie Animation */}
        <div
          ref={lottieRef}
          className="w-[222px] sm:w-[280px] md:w-[320px] lg:w-[350px] mx-auto -mt-10 "
        >
          <Lottie
            animationData={aiAnimationData}
            loop
            style={{ width: "100%", height: "auto" }}
            className="drop-shadow-2xl"
          />
        </div>

        {/* Subtext */}
        <p
          ref={subtextRef}
          className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 -mt-10 leading-relaxed px-4"
        >
          Your proactive AI assistant remembers your voice, generates on-brand
          drafts, and delivers them exactly when you need them —{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold">
            effortlessly
          </span>
        </p>

        {/* CTA Button */}
        <div ref={buttonRef} className="flex justify-center">
          <GradientButton label="Get Started Free" to="/auth" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
