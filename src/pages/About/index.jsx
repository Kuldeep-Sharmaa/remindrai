import React, { useLayoutEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SECTIONS = [
  {
    label: "What it does",
    content: [
      "You set your role, tone, platform, and timing once. When the time comes, the system generates a draft using that setup. No manual trigger. No tool to open. No prompt to write again.",
      "The draft waits for you. You review it, edit it, or use it as it is. That is the full loop.",
    ],
  },
  {
    label: "Why it exists",
    content: [
      "Staying consistent with content is rarely a creativity problem. Most people already know what they want to say. The difficulty is finding the time to sit down and write it.",
      "Opening a blank editor, deciding what to write, starting from scratch each time these small steps make consistency harder than it should be.You set your direction once. When the time arrives, the draft is already waiting.",
    ],
  },
  {
    label: "Who it is for",
    content: [
      "Founders, developers, and independent builders who want a consistent way to produce written content without making it a second job. People who have something to say but not the energy to start from scratch every time it is due.",
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
          <h1 className="font-grotesk text-5xl sm:text-6xl lg:text-7xl font-bold text-brand tracking-tight leading-tight">
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
                <p className="font-grotesk text-xs tracking-widest uppercase text-brand pt-1">
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

        {/* Built by */}
        <div className="fade-up flex flex-col lg:flex-row gap-6 lg:gap-16 py-14">
          <div className="lg:w-48 flex-shrink-0">
            <p className="font-grotesk text-xs tracking-widest uppercase text-brand pt-1">
              Built by
            </p>
          </div>
          <div className="flex-1 flex flex-col gap-4 max-w-2xl">
            <p className="font-inter text-lg sm:text-xl text-textLight dark:text-textDark leading-relaxed">
              Built and maintained by Kuldeep Sharma.
            </p>
            <a
              href="https://github.com/Kuldeep-Sharmaa/remindrai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-inter text-sm text-muted hover:text-brand dark:hover:text-brand transition-colors duration-150 w-fit"
            >
              github.com/Kuldeep-Sharmaa/remindrai
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
