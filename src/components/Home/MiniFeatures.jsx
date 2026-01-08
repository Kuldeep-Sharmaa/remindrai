import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Clock, Lightbulb, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Clock,
    title: "Intelligent Scheduling",
    desc: "AI analyzes your audience patterns and suggests optimal posting times across all platforms automatically.",
    number: "01",
  },
  {
    icon: Lightbulb,
    title: "Content Generation",
    desc: "Generate platform-specific content that matches your brand voice using advanced language models.",
    number: "02",
  },
  {
    icon: Zap,
    title: "Automated Workflows",
    desc: "Set up once and let AI handle content creation, scheduling, and engagement optimization seamlessly.",
    number: "03",
  },
];

const MiniFeatures = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const featuresRef = useRef([]);
  const ctaRef = useRef(null);
  const lineRef = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const ease = "power3.out";

      // ✅ Animate heading words - logic now relies on pre-split JSX
      if (headingRef.current) {
        const words = headingRef.current.querySelectorAll(".word");
        gsap.fromTo(
          words,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: ease,
            stagger: 0.1,
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 80%",
            },
          }
        );
      }

      // Divider line animation
      gsap.from(lineRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.8,
        ease,
        scrollTrigger: {
          trigger: lineRef.current,
          start: "top 85%",
        },
      });

      // Features stagger animation
      gsap.from(featuresRef.current, {
        opacity: 0,
        x: -30,
        y: 10,
        duration: 0.6,
        stagger: 0.15,
        ease,
        scrollTrigger: {
          trigger: featuresRef.current[0],
          start: "top 80%",
        },
      });

      // CTA fade-in
      gsap.from(ctaRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.5,
        ease,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 85%",
        },
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl lg:max-w-5xl mx-auto">
        <div className="mb-12 sm:mb-16 text-center">
          {" "}
          {/* ✅ CORRECTED: Manually split heading into words in the JSX */}
          <h2
            ref={headingRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 
                       font-bold text-center mb-4 sm:mb-6 
                       leading-snug text-gray-900 dark:text-white 
                       max-w-3xl mx-auto px-2"
          >
            <span className="word inline-block">Built</span>{" "}
            <span className="word inline-block">for</span>{" "}
            <span
              className="word bg-gradient-to-r from-blue-500 via-green-400 to-blue-600 
                         dark:from-blue-400 dark:via-green-300 dark:to-blue-500
                         bg-clip-text text-transparent drop-shadow-sm animate-shimmer"
            >
              Modern
            </span>{" "}
            <span className="word inline-block">Creators</span>
          </h2>
          <div
            ref={lineRef}
            className="h-px bg-gradient-to-r from-blue-500 via-purple-500 to-transparent 
                         w-20 sm:w-24 mb-6 sm:mb-8 mx-auto"
          ></div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl lg:max-w-2xl mx-auto">
            Everything you need to maintain a consistent social media presence
            without the manual work.
          </p>
        </div>

        <div className="space-y-8 lg:space-y-12 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                ref={(el) => (featuresRef.current[index] = el)}
                className="flex items-start gap-3 sm:gap-6 lg:gap-8 group max-w-4xl mx-auto text-left"
              >
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 w-16 sm:w-28 lg:w-32">
                  <span className="text-xs sm:text-sm font-mono text-gray-400 dark:text-gray-500 w-4 sm:w-6">
                    {feature.number}
                  </span>
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all duration-300">
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                  </div>
                </div>

                <div className="flex-1 border-l border-gray-200 dark:border-gray-800 pl-3 sm:pl-6 lg:pl-8">
                  <h3 className="text-base sm:text-xl lg:text-2xl font-medium text-gray-900 dark:text-white mb-1 sm:mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div ref={ctaRef} className=" pt-6 sm:pt-8 text-center">
          <a
            href="/features"
            className="inline-flex items-center text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium group transition-colors duration-200 text-sm sm:text-base"
          >
            <span>Explore all features</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default MiniFeatures;
