import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ContentIdentityCard from "./ContentIdentityCard";
import DraftDeliveryCard from "./DraftDeliveryCard";
import Button from "../Ui/GradientBtn";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const cardLeftRef = useRef(null);
  const cardRightRef = useRef(null);
  const logoRef = useRef(null);
  const logoGlowRef = useRef(null);
  const mCardLeftRef = useRef(null);
  const mCardRightRef = useRef(null);
  const mLogoRef = useRef(null);

  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const onScroll = () => setShowHint(window.scrollY < 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 640px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=700",
          scrub: 1.8,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        headlineRef.current,
        { y: 0 },
        { y: -24, ease: "power1.inOut" },
        0,
      );
      tl.fromTo(
        cardLeftRef.current,
        { x: -580, opacity: 0, scale: 0.93 },
        { x: 0, opacity: 1, scale: 1, ease: "power2.out" },
        0,
      );
      tl.fromTo(
        cardRightRef.current,
        { x: 580, opacity: 0, scale: 0.93 },
        { x: 0, opacity: 1, scale: 1, ease: "power2.out" },
        0,
      );
      tl.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.55 },
        { opacity: 1, scale: 1, ease: "power2.out" },
        0,
      );
      tl.fromTo(
        logoGlowRef.current,
        { opacity: 0, scale: 0.4 },
        { opacity: 1, scale: 1, ease: "power2.out" },
        0.55,
      );
    });

    mm.add("(max-width: 639px)", () => {
      gsap.fromTo(
        mCardLeftRef.current,
        { y: 56, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: mCardLeftRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      );
      gsap.fromTo(
        mCardRightRef.current,
        { y: 56, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.85,
          ease: "power3.out",
          delay: 0.1,
          scrollTrigger: {
            trigger: mCardRightRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      );
      gsap.fromTo(
        mLogoRef.current,
        { scale: 0.4, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.45,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: mLogoRef.current,
            start: "top 92%",
            toggleActions: "play none none none",
          },
        },
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col justify-center items-center px-5 sm:px-8 lg:px-12 pt-36 sm:pt-44 pb-16 sm:pb-20"
    >
      <div
        ref={headlineRef}
        className="relative z-10 w-full max-w-4xl mx-auto mb-5"
      >
        <div className="hi text-center" style={{ "--d": "0.07s" }}>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5rem] font-bold font-grotesk text-textLight dark:text-white leading-[1.06] tracking-tight">
            Set it once
            <br />
            <span className="text-brand dark:text-brand-soft">
              The system keeps it going
            </span>
          </h1>
        </div>
      </div>

      <p
        className="relative z-10 text-sm sm:text-base lg:text-lg text-textLight dark:text-white/60 font-inter max-w-lg mx-auto text-center leading-relaxed mb-6 hi"
        style={{ "--d": "0.14s" }}
      >
        Set your role, tone, platform, and timing once
        <br />
        Drafts are prepared and ready at the chosen time.
      </p>

      <div
        className={`hidden sm:flex relative z-10 flex-col items-center mb-6 transition-opacity duration-500 hi ${
          showHint ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ "--d": "0.2s" }}
      >
        {/* Mouse body */}
        <div className="relative w-7 h-10 border-[3px] border-textLight/30 dark:border-white/30 border-solid rounded-[50px] box-border mb-4">
          {/* Dot inside mouse */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-textLight/40 dark:bg-white/40"
            style={{ animation: "mouse-scroll 2s infinite", bottom: "30px" }}
          />
        </div>
        {/* Chevrons */}
        <div className="flex flex-col items-center gap-0 -mt-1">
          {[0, 250].map((delay, i) => (
            <div
              key={i}
              className="w-[10px] h-[10px] border-r-[3px] border-b-[3px] border-textLight/40 dark:border-white/40 rotate-45 -mt-1.5"
              style={{
                animation: `chevron-pulse 500ms ease infinite alternate ${delay}ms`,
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes mouse-scroll {
            0%   { opacity: 0; height: 6px; }
            40%  { opacity: 1; height: 10px; }
            80%  { transform: translate(-50%, 20px); height: 10px; opacity: 0; }
            100% { height: 3px; opacity: 0; }
          }
          @keyframes chevron-pulse {
            from { opacity: 0; }
            to   { opacity: 0.5; }
          }
        `}</style>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="hidden sm:flex items-stretch justify-center">
          <div
            ref={cardLeftRef}
            className="flex-1 min-w-0"
            style={{ transform: "translateX(-580px)", opacity: 0 }}
          >
            <ContentIdentityCard />
          </div>
          <div className="flex-shrink-0 flex items-center justify-center px-6 z-10">
            <div
              ref={logoRef}
              className="relative flex items-center justify-center w-11 h-11 z-10"
              style={{ opacity: 0 }}
            >
              <img
                src="/brand_logo.svg"
                alt="brand logo"
                className="w-auto h-8 object-contain"
              />
            </div>
          </div>
          <div
            ref={cardRightRef}
            className="flex-1 min-w-0"
            style={{ transform: "translateX(580px)", opacity: 0 }}
          >
            <DraftDeliveryCard />
          </div>
        </div>

        <div className="sm:hidden flex flex-col gap-3">
          <div ref={mCardLeftRef} style={{ opacity: 0 }}>
            <ContentIdentityCard />
          </div>
          <div
            ref={mLogoRef}
            className="flex items-center justify-center gap-3"
            style={{ opacity: 0 }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <img
                src="/brand_logo.svg"
                alt="brand logo"
                className="w-auto h-6 object-contain"
              />
            </div>
          </div>
          <div ref={mCardRightRef} style={{ opacity: 0 }}>
            <DraftDeliveryCard />
          </div>
        </div>
      </div>

      <div
        className="relative z-10 mt-10 flex flex-col sm:flex-row items-center gap-3 hi"
        style={{ "--d": "0.22s" }}
      >
        <Button to="/auth" showArrow className="text-base sm:text-lg">
          See it in action
        </Button>
      </div>

      <style>{`
        .hi {
          opacity: 0;
          transform: translateY(16px);
          animation: hup 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: var(--d, 0s);
        }
        @keyframes hup {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
