import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Lock, Unlock, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ContentIdentityCard from "./ContentIdentityCard";
import DraftDeliveryCard from "./DraftDeliveryCard";

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
  const cardsRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 640px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 95%", // animation begins the moment cards enter viewport
          end: "top -20%", // completes only after cards are well past viewport top
          scrub: 2, // heavier lag = cards feel weighted
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        headlineRef.current,
        { y: 0 },
        { y: -28, ease: "power1.inOut" },
        0,
      );
      tl.fromTo(
        cardLeftRef.current,
        { x: -600, opacity: 0, scale: 0.94 },
        { x: 0, opacity: 1, scale: 1, ease: "power2.out" },
        0,
      );
      tl.fromTo(
        cardRightRef.current,
        { x: 600, opacity: 0, scale: 0.94 },
        { x: 0, opacity: 1, scale: 1, ease: "power2.out" },
        0,
      );
      tl.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, ease: "power2.out" },
        0,
      );
      tl.fromTo(
        logoGlowRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, ease: "power2.out" },
        0.6,
      );
    });

    mm.add("(max-width: 639px)", () => {
      gsap.fromTo(
        mCardLeftRef.current,
        { y: 60, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: mCardLeftRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        },
      );
      gsap.fromTo(
        mCardRightRef.current,
        { y: 60, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: mCardRightRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        },
      );
      gsap.fromTo(
        mLogoRef.current,
        { scale: 0.5, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: mLogoRef.current,
            start: "top 90%",
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
            Set the direction once.
            <br />
            <span className="text-brand dark:text-brand-soft">
              Content keeps moving.
            </span>
          </h1>
        </div>
      </div>

      <p
        className="relative z-10 text-sm sm:text-base lg:text-lg text-textLight/40 dark:text-white/35 font-inter max-w-lg mx-auto text-center leading-relaxed mb-14 hi"
        style={{ "--d": "0.14s" }}
      >
        Define your role, tone, platform, and timing once.
        <br />
        RemindrAI prepares drafts and delivers them when scheduled.
      </p>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div
          ref={cardsRef}
          className="hidden sm:flex items-stretch justify-center"
        >
          <div
            ref={cardLeftRef}
            className="flex-1 min-w-0"
            style={{ transform: "translateX(-600px)", opacity: 0 }}
          >
            <ContentIdentityCard />
          </div>

          <div className="flex-shrink-0 flex items-center justify-center px-6 z-10">
            <div className="relative flex items-center justify-center">
              <div
                ref={logoGlowRef}
                className="absolute w-16 h-16 rounded-full"
                style={{
                  opacity: 0,
                  background:
                    "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)",
                  filter: "blur(6px)",
                }}
              />
              <div
                ref={logoRef}
                className="relative flex items-center justify-center w-11 h-11 z-10"
                style={{ opacity: 0 }}
              >
                <img
                  src="/brand_logo.svg"
                  alt=""
                  className="w-auto h-8 object-contain"
                />
              </div>
            </div>
          </div>

          <div
            ref={cardRightRef}
            className="flex-1 min-w-0"
            style={{ transform: "translateX(600px)", opacity: 0 }}
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
            <div className="h-px flex-1 bg-black/[0.05] dark:bg-white/[0.05]" />
            <div className="w-8 h-8 rounded-full bg-bgLight dark:bg-[#0d1117] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center">
              <img
                src="/brand_logo.svg"
                alt=""
                className="w-auto h-4 object-contain"
              />
            </div>
            <div className="h-px flex-1 bg-black/[0.05] dark:bg-white/[0.05]" />
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
        <Link
          to="/auth"
          className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-semibold font-grotesk whitespace-nowrap overflow-hidden transition-all duration-200 ease-out shadow-[0_0_0_1px_rgba(37,99,235,0.45),0_2px_10px_rgba(37,99,235,0.25)] hover:shadow-[0_0_0_1px_rgba(37,99,235,0.65),0_4px_16px_rgba(37,99,235,0.35)]"
        >
          <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="relative z-10 leading-none">Get access</span>
          <span className="relative z-10 flex items-center justify-center w-3.5 h-3.5">
            <Lock className="absolute w-3.5 h-3.5 transition-all duration-200 ease-out opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-75" />
            <Unlock className="absolute w-3.5 h-3.5 transition-all duration-200 ease-out opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100" />
          </span>
        </Link>
        <Link
          to="/#how-it-works"
          className="inline-flex items-center gap-1.5 text-sm font-inter text-textLight/30 dark:text-white/25 hover:text-textLight dark:hover:text-white/60 transition-colors duration-150"
        >
          See how it works
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
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
