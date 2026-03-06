import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Lock, Unlock, ArrowRight } from "lucide-react";
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

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 640px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          // "top top" = scrollY 0. "+=700" = after 700px of scroll.
          // This is pure scroll-distance based — not element-position based.
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
      className="relative w-full min-h-screen flex flex-col justify-center items-center px-5 sm:px-8 lg:px-12 pt-28 pb-20"
    >
      <div className="relative z-10 mb-6 hi" style={{ "--d": "0s" }}>
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02] text-[11px] font-grotesk font-medium text-textLight/40 dark:text-white/30 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-brand opacity-80" />
          Content drafts, prepared automatically
        </span>
      </div>

      <div
        ref={headlineRef}
        className="relative z-10 w-full max-w-4xl mx-auto mb-5"
      >
        <div className="hi text-center" style={{ "--d": "0.07s" }}>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5rem] font-bold font-grotesk text-textLight dark:text-white leading-[1.06] tracking-tight">
            Set the direction.
            <br />
            <span className="text-brand dark:text-brand-soft">
              Content keeps moving.
            </span>
          </h1>
        </div>
      </div>

      <p
        className="relative z-10 text-sm sm:text-base lg:text-lg text-textLight dark:text-white/60 font-inter max-w-lg mx-auto text-center leading-relaxed mb-14 hi"
        style={{ "--d": "0.14s" }}
      >
        Define your role, tone, platform, and timing once.
        <br />
        RemindrAI prepares drafts and delivers them when scheduled.
      </p>

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
            <div className="relative flex items-center justify-center">
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
        <Button to="/auth" showArrow>
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
