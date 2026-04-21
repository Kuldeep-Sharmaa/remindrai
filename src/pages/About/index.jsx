import React, { useLayoutEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SECTIONS = [
  {
    label: "What it does",
    content: [
      "You set your role, tone, platform, and timing once. From there the system prepares a new content when that moment arrives. There is nothing to trigger and no prompt to rewrite each time.",
      "When you open the app, the draft is already there. You read it, adjust it if needed, or use it as it is. That is the entire loop.",
    ],
  },

  {
    label: "Why it exists",
    content: [
      "Staying consistent with content is rarely a creativity problem. Most people already know what they want to say. The difficulty is finding the time to sit down and write it.",
      "Starting from a blank editor each time, figuring out what to post, and repeating the same setup again and again slowly makes the process heavier than it should be. RemindrAI came from trying to simplify that pattern. Set the direction once, and the system prepares the writing later.",
    ],
  },

  {
    label: "Who it is for",
    content: [
      "Founders, developers, and independent builders who want a steadier way to keep writing online. People who have something to say but don’t want the process of writing to depend on their time every day.",
    ],
  },
];
export default function About() {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".fade-up").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 86%" },
          },
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen w-full">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-24 flex flex-col gap-0">
        {/* Title */}
        <div className="fade-up flex flex-col gap-4 pb-16">
          <p className="font-grotesk text-sm tracking-widest uppercase text-brand font-medium">
            About
          </p>
          <h1 className="font-grotesk text-5xl sm:text-6xl lg:text-7xl font-bold text-textLight dark:text-textDark tracking-tight leading-tight">
            RemindrAI
          </h1>
          <p className="font-inter text-lg text-muted leading-relaxed max-w-2xl">
            A system that prepares content drafts based on the direction you
            set.
          </p>
        </div>

        <div className="h-px w-full bg-gray-100 dark:bg-white/[0.06]" />

        {/* Sections — two column on desktop */}
        {SECTIONS.map(({ label, content }, i) => (
          <React.Fragment key={i}>
            <div className="fade-up flex flex-col lg:flex-row gap-6 lg:gap-16 py-14">
              {/* Label col */}
              <div className="lg:w-48 flex-shrink-0">
                <p className="font-grotesk text-sm tracking-widest uppercase text-brand font-medium pt-1">
                  {label}
                </p>
              </div>
              {/* Text col */}
              <div className="flex-1 flex flex-col gap-5 max-w-2xl">
                {content.map((para, j) => (
                  <p
                    key={j}
                    className={`font-inter text-lg sm:text-xl leading-relaxed ${
                      j === 0
                        ? "text-textLight dark:text-textDark"
                        : "text-muted"
                    }`}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>
            <div className="h-px w-full bg-gray-100 dark:bg-white/[0.06]" />
          </React.Fragment>
        ))}
        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm font-inter text-muted">
            Built and maintained by{" "}
            <a
              href="https://github.com/kuldeep-sharmaa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-soft hover:text-brand transition-colors duration-200"
            >
              Kuldeep Sharma
              <ArrowUpRight className="inline-block ml-1" size={16} />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
