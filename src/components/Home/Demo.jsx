import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import GradientButton from "../Ui/GradientBtn";

export default function Demo() {
  // Enhanced words array with more dynamic options
  const words = ["Post", "Content", "Ideas", "Story", "Moment", "Brand"];

  // Refs for GSAP targeting
  const wordRef = useRef();
  const taglineRef = useRef();
  const titleStaticRef = useRef();
  const subtitleRef = useRef();
  const buttonsRef = useRef();
  const containerRef = useRef();

  // Ref to track if animations have been initialized
  const animationsInitialized = useRef(false);

  useLayoutEffect(() => {
    // Prevent re-initialization of animations
    if (animationsInitialized.current) return;

    const ctx = gsap.context(() => {
      // Check if all refs are available before proceeding
      if (
        !wordRef.current ||
        !taglineRef.current ||
        !titleStaticRef.current ||
        !subtitleRef.current ||
        !buttonsRef.current
      ) {
        return;
      }

      let currentWordIndex = 0;

      // Enhanced infinite loop animation with smoother transitions
      const wordTimeline = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.5, // Shorter delay for more dynamic feel
      });

      // Create smooth cycling animation for each word
      words.forEach((word, index) => {
        wordTimeline
          // Exit animation - smooth upward slide with blur
          .to(wordRef.current, {
            yPercent: -50,
            opacity: 0,
            scale: 0.95,
            filter: "blur(4px)",
            rotationX: -15,
            duration: 0.5,
            ease: "power2.in",
            transformOrigin: "50% 50%",
            onComplete: () => {
              currentWordIndex = (currentWordIndex + 1) % words.length;
              if (wordRef.current) {
                wordRef.current.textContent = words[currentWordIndex];
              }
            },
          })
          // Reset position for entrance
          .set(wordRef.current, {
            yPercent: 50,
            opacity: 0,
            scale: 1.05,
            filter: "blur(4px)",
            rotationX: 15,
            transformOrigin: "50% 50%",
          })
          // Entrance animation - smooth downward slide with unblur
          .to(
            wordRef.current,
            {
              yPercent: 0,
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              rotationX: 0,
              duration: 0.7,
              ease: "back.out(1.2)",
              transformOrigin: "50% 50%",
            },
            "<0.1"
          )
          // Hold the word visible
          .to({}, { duration: 2.2 });
      });

      // Add floating animation for the word container
      gsap.to(wordRef.current, {
        y: -5,
        duration: 2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 3, // Start after initial entrance
      });

      // Mark animations as initialized
      animationsInitialized.current = true;
    }, containerRef);

    return () => {
      ctx.revert();
      animationsInitialized.current = false;
    };
  }, []); // Remove words dependency

  // Enhanced page load animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Check if all refs are available before proceeding
      if (
        !taglineRef.current ||
        !titleStaticRef.current ||
        !wordRef.current ||
        !subtitleRef.current ||
        !buttonsRef.current
      ) {
        return;
      }

      // Set initial states with more dramatic starting positions
      gsap.set(
        [
          taglineRef.current,
          titleStaticRef.current,
          wordRef.current,
          subtitleRef.current,
        ],
        { y: 60, opacity: 0, scale: 0.9 }
      );

      // Check if buttonsRef has children before accessing them
      if (buttonsRef.current && buttonsRef.current.children) {
        gsap.set(buttonsRef.current.children, {
          y: 40,
          opacity: 0,
          scale: 0.8,
        });
      }

      // Create master entrance timeline
      const masterTimeline = gsap.timeline({ delay: 0.3 });

      // Tagline entrance with bounce
      masterTimeline
        .to(taglineRef.current, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "back.out(1.4)",
        })
        // Title elements with stagger and spring effect
        .to(
          [titleStaticRef.current, wordRef.current],
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "back.out(1.2)",
            stagger: 0.15,
          },
          "-=0.5"
        )
        // Subtitle with smooth slide
        .to(
          subtitleRef.current,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.4"
        );

      // Buttons with elastic bounce (only if they exist)
      if (
        buttonsRef.current &&
        buttonsRef.current.children &&
        buttonsRef.current.children.length > 0
      ) {
        masterTimeline.to(
          buttonsRef.current.children,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)",
            stagger: 0.2,
          },
          "-=0.3"
        );
      }

      // Add ambient animations after load
      masterTimeline.call(() => {
        // Subtle breathing animation for tagline
        if (taglineRef.current) {
          gsap.to(taglineRef.current, {
            scale: 1.02,
            duration: 3,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center pt-20 pb-8 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto text-center relative z-10 px-4 sm:px-6">
        {/* Enhanced Title */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1] px-2">
            <span ref={titleStaticRef} className="inline-block">
              Never Miss a
            </span>
          </h1>

          <div className="relative mt-2 sm:mt-4">
            <div className="relative h-[4.3em] overflow-hidden flex justify-center items-center">
              <span
                ref={wordRef}
                className="animated-word text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl
                           bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 
                           dark:from-blue-400 dark:via-indigo-400 dark:to-blue-300 
                           bg-clip-text text-transparent font-bold"
              >
                {words[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Subtitle */}
        <p
          ref={subtitleRef}
          className="text-xl sm:text-2xl lg:text-2xl text-gray-600 dark:text-gray-300 
                     max-w-4xl mx-auto mb-16 leading-relaxed font-medium
                     drop-shadow-sm"
        >
          RemindrAI intelligently schedules and reminds you to post at optimal
          times, keeping your social media presence consistent and powerful —{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold">
            effortlessly
          </span>
          .
        </p>

        {/* Enhanced CTA Buttons */}
        <div ref={buttonsRef} className="flex justify-center items-center">
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <GradientButton label="See in Action" to="/auth" />
          </motion.div>
        </div>
      </div>

      <style>{`
        .animated-word {
          will-change: transform, opacity, filter;
          display: inline-block;
          perspective: 1000px;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </section>
  );
}
