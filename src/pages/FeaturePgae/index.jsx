import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  SlidersHorizontal,
  FileText,
  Clock,
  Layers,
  Inbox,
  ArrowUpRight,
  UserCheck2,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: SlidersHorizontal,
    label: "Content setup",
    description:
      "Define your role, tone, and platform once. This configuration guides how content is prepared. The setup can be updated anytime to reflect changes in your voice, platform, or content direction.",
  },

  {
    icon: FileText,
    label: "Topic brief",
    description:
      "Each configuration includes a short brief describing what the content should focus on. A single sentence is enough to give the system a clear topic without writing a full prompt every time.",
  },

  {
    icon: Clock,
    label: "Preparation timing",
    description:
      "Choose when the system should prepare new content and how often. It can run once, daily, or weekly. At the selected time the system generates a new piece automatically.",
  },

  {
    icon: Inbox,
    label: "Content readiness",
    description:
      "At the selected time the system prepares the content in the background. No manual action is required. When you open the app, the piece is already available to review, edit, or publish.",
  },

  {
    icon: UserCheck2,
    label: "Learns your voice",
    description:
      "The system observes your past drafts to identify how you write - sentence structure, phrasing, and tone. Over time, new drafts follow these patterns, so the output stays consistent with your writing style.",
  },

  {
    icon: Layers,
    label: "Output formats",
    description:
      "The system can produce either an AI-generated piece or a Simple Note. AI output creates a complete draft based on your configuration and topic. Simple Notes store ideas so you can return and write them yourself.",
  },
];

export default function Features() {
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
        <div className="fade-up flex flex-col gap-4 pb-16 ">
          <p className="font-grotesk text-xs tracking-widest uppercase text-brand">
            Features
          </p>
          <h1 className="font-grotesk text-4xl sm:text-6xl lg:text-7xl max-w-2xl font-bold text-textLight dark:text-textDark tracking-tight leading-tight">
            How the system
            <br />
            is built
          </h1>
          <p className="font-inter text-lg text-muted leading-relaxed max-w-2xl">
            RemindrAI works through a small set of connected parts. You define
            the direction once. The system prepares drafts from there.
          </p>
        </div>

        <div className="h-px w-full bg-gray-100 dark:bg-white/[0.06]" />

        {/* Feature rows */}
        {FEATURES.map(({ icon: Icon, label, description }, i) => (
          <React.Fragment key={i}>
            <div className="fade-up flex flex-col lg:flex-row gap-6 lg:gap-16 py-14">
              {/* Label col */}
              <div className="lg:w-48 flex-shrink-0 flex items-center gap-2 pt-0 lg:pt-1">
                <Icon
                  className="w-5 h-5 text-brand flex-shrink-0"
                  strokeWidth={1.75}
                />
                <p className="font-grotesk text-sm tracking-widest uppercase text-brand font-medium">
                  {label}
                </p>
              </div>
              {/* Text col */}
              <div className="flex-1 max-w-2xl">
                <p className="font-inter text-lg sm:text-xl text-textLight dark:text-textDark leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
            <div className="h-px w-full bg-gray-100 dark:bg-white/[0.06]" />
          </React.Fragment>
        ))}

        {/* Bottom — link to docs */}
        <div className="fade-up flex flex-col lg:flex-row gap-6 lg:gap-16 pt-14">
          <div className="lg:w-48 flex-shrink-0" />
          <div className="flex-1 max-w-2xl flex flex-col gap-3">
            <p className="font-inter text-base text-muted leading-relaxed">
              For step-by-step instructions on using each part of the system,
              see the documentation.
            </p>
            <Link
              to="/docs"
              className="inline-flex items-center gap-1.5 font-inter text-sm text-muted hover:text-brand dark:hover:text-brand transition-colors duration-150 w-fit"
            >
              Read the docs
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
