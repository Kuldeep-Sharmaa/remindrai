import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import GradientButton from "../Ui/GradientBtn";

gsap.registerPlugin(ScrollTrigger);

const CallToAction = () => {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const subtextRef = useRef(null);
  const ctaRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const words = headlineRef.current.querySelectorAll(".word");

      // Animate each word individually
      gsap.from(words, {
        opacity: 0,
        y: 30,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      });

      // Animate subtext + button using refs (avoids global class collisions)
      gsap.from([subtextRef.current, ctaRef.current], {
        opacity: 0,
        y: 40,
        stagger: 0.18,
        duration: 0.9,
        delay: 0.28,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative pb-32 text-center overflow-hidden"
      aria-labelledby="cta-heading"
    >
      <div className="relative container mx-auto px-6 z-10">
        {/* Headline */}
        <h2
          id="cta-heading"
          ref={headlineRef}
          className="text-4xl md:text-6xl font-extrabold mb-6 dark:text-white tracking-tight leading-tight"
        >
          <span className="word">Fresh</span>{" "}
          <span className="word text-blue-400">Content</span>{" "}
          <span className="word">Exactly</span>{" "}
          <span className="word">When</span>{" "}
          <span className="word text-purple-400">You Need It</span>
        </h2>

        {/* Subtext */}
        <p
          ref={subtextRef}
          className="text-lg text-gray-400 max-w-xl mx-auto mb-6 leading-relaxed"
        >
          Not another scheduler — RemindrAI generates on‑brand, ready‑to‑use
          content drafts for you, so you skip drafting and stay consistent.
        </p>

        {/* Micro-note to reduce "reminder/scheduler" confusion */}
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
          No manual planning. No repetitive drafts. Just fresh ideas delivered
          when you need them.
        </p>

        {/* CTA Button */}
        <div ref={ctaRef} className="flex justify-center items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <GradientButton
              label="Get Free AI Drafts"
              to="/auth"
              aria-label="Get free AI-generated content drafts"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
