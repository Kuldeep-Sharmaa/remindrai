import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lottie from "lottie-react";
import agendaAnimation from "../../assets/Animation/Agenda.json";

gsap.registerPlugin(ScrollTrigger);

const PAIN_POINTS = [
  {
    label: "No memory",
    body: "AI tools forget everything between sessions. Your role, your voice, your context — gone. You explain yourself from scratch, every time.",
  },
  {
    label: "It's all on you",
    body: "There's no system running in the background. Content only happens when you make time for it. Miss a week and the momentum is gone.",
  },
  {
    label: "Effort doesn't scale",
    body: "You can't manually sustain what a system should be doing for you. The more you grow, the more it demands.",
  },
];

const Problem = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subtextRef = useRef(null);
  const visualRef = useRef(null);
  const painRef = useRef([]);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const ease = "power3.out";

      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current.querySelectorAll(".word"),
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease,
            stagger: 0.07,
            scrollTrigger: { trigger: headingRef.current, start: "top 80%" },
          },
        );
      }

      if (subtextRef.current) {
        gsap.fromTo(
          subtextRef.current,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease,
            scrollTrigger: { trigger: subtextRef.current, start: "top 82%" },
          },
        );
      }

      const validPains = painRef.current.filter(Boolean);
      if (validPains.length) {
        gsap.fromTo(
          validPains,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease,
            stagger: 0.12,
            scrollTrigger: {
              trigger: validPains[0].parentNode,
              start: "top 82%",
            },
          },
        );
      }

      if (visualRef.current) {
        gsap.fromTo(
          visualRef.current,
          { opacity: 0, x: 28 },
          {
            opacity: 1,
            x: 0,
            duration: 1.1,
            ease: "power2.out",
            scrollTrigger: { trigger: visualRef.current, start: "top 78%" },
          },
        );
      }
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full py-4 lg:py-10 ">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
          <div className="flex flex-col">
            <h2
              ref={headingRef}
              className="text-3xl sm:text-4xl text-center lg:text-start lg:text-5xl font-bold font-grotesk text-textLight dark:text-textDark leading-tight tracking-tight mb-5"
            >
              <span className="word">Growth</span>{" "}
              <span className="word">slows</span>{" "}
              <span className="word">when</span>{" "}
              <span className="word">consistency</span>{" "}
              <span className="word bg-red-700 bg-clip-text text-transparent">
                breaks.
              </span>
            </h2>

            <p
              ref={subtextRef}
              className="text-sm sm:text-base text-center lg:text-start  text-textLight dark:text-textDark font-inter leading-relaxed mb-10 max-w-sm"
            >
              Without a system, consistency depends on your schedule, your
              energy, and your availability. That's difficult to sustain.
            </p>

            <div className="flex flex-col  divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {PAIN_POINTS.map((point, i) => (
                <div
                  key={i}
                  ref={(el) => (painRef.current[i] = el)}
                  className="flex gap-4 lg:px-1 px-4 items-start py-4 first:pt-0 last:pb-0"
                >
                  <div className="w-5 h-5 rounded-md bg-red-500/10 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
                  </div>
                  <div>
                    <p className="text-xs font-grotesk font-semibold tracking-widest uppercase text-textLight dark:text-textDark mb-1.5">
                      {point.label}
                    </p>
                    <p className="text-sm text-textLight/50 dark:text-textDark/50 font-inter leading-relaxed">
                      {point.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            ref={visualRef}
            className="flex items-center justify-center lg:justify-end"
          >
            <Lottie
              animationData={agendaAnimation}
              loop
              style={{ width: "100%", maxWidth: "500px", height: "auto" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
