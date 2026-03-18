import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Problem = () => {
  const headingRef = useRef(null);
  const bodyRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current.querySelectorAll(".word"),
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.07,
            scrollTrigger: { trigger: headingRef.current, start: "top 80%" },
          },
        );
      }

      if (bodyRef.current) {
        gsap.fromTo(
          bodyRef.current,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: bodyRef.current, start: "top 82%" },
          },
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative w-full py-14 lg:py-24">
      <div className="max-w-4xl text-center mx-auto px-5 sm:px-8 lg:px-10">
        <h2
          ref={headingRef}
          className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-grotesk text-textLight dark:text-textDark leading-[1.1] tracking-tight mb-5"
        >
          <span className="word">Running</span>{" "}
          <span className="word">out</span> <span className="word">of</span>{" "}
          <span className="word">ideas</span>{" "}
          <span className="word">isn't</span> <span className="word">the</span>{" "}
          <span className="word">problem.</span>
          <br />
          <span className="word text-red-600">Consistency</span>{" "}
          <span className="word">is.</span>
        </h2>
        <p
          ref={bodyRef}
          className="text-sm sm:text-base lg:text-base font-inter text-textLight/60 dark:text-textDark/50 leading-relaxed max-w-md mx-auto"
        >
          When it depends on your time and energy, it breaks. Not all at once —
          just enough to lose momentum.
        </p>
      </div>
    </section>
  );
};

export default Problem;
