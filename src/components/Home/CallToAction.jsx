import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../Ui/GradientBtn";

gsap.registerPlugin(ScrollTrigger);

const CallToAction = () => {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 82%" },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
    >
      <div
        ref={cardRef}
        className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden px-8 sm:px-16 py-16 sm:py-20 flex flex-col items-center text-center gap-6"
        style={{ background: "#2563eb" }}
      >
        {/* Noise overlay for texture */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          }}
        />

        <h2
          className="relative font-grotesk font-bold dark:text-bgLight text-bgDark tracking-tight leading-[1.05]"
          style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)" }}
        >
          Start your first draft
          <br />
          <span className="text-white/60">The system keeps it going.</span>
        </h2>

        <Button
          to="/auth"
          showArrow
          className="relative z-10 text-base sm:text-lg bg-textDark dark:bg-textLight "
        >
          Start setup
        </Button>

        <p className="relative text-xs font-inter dark:text-bgLight/40 text-bgDark/40 ">
          Set it once. That’s it.
        </p>
      </div>
    </section>
  );
};

export default CallToAction;
