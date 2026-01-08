import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import HeroSection from "../components/Home/HeroSection";
import Background from "../components/Background";

// Lazy load components
const Problem = lazy(() => import("../components/Home/Problem"));
const Solution = lazy(() => import("../components/Home/Solution"));
const Experience = lazy(() => import("../components/Home/Experience"));
const MiniFeature = lazy(() => import("../components/Home/MiniFeatures"));
const CallToAction = lazy(() => import("../components/Home/CallToAction"));
const WordMarquee = lazy(() => import("../components/Home/WordMarquee"));

// Lightweight skeleton used as fallback
const SectionSkeleton = ({ height = 120 }) => (
  <div className="w-full py-12 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
        <div
          className={`h-${Math.min(
            Math.round(height / 4),
            48
          )} bg-gray-200 dark:bg-gray-700 rounded w-full`}
        />
      </div>
    </div>
  </div>
);

const SECTION_IDS = [
  "problem",
  "solution",
  "wordMarquee",
  "experience",
  "miniFeature",
  "demo",
  "callToAction",
];

const Home = () => {
  // React-visible loaded map (to trigger Suspense rendering)
  const [visibleSections, setVisibleSections] = useState(() => ({
    hero: true,
  }));

  // useRef-backed Set to avoid frequent re-renders while tracking loads
  const loadedRef = useRef(new Set(["hero"]));
  const observerRef = useRef(null);
  const didPrefetchRef = useRef(false);

  // Utility: mark section loaded (updates ref + visible state ONCE)
  const markLoaded = (id) => {
    if (loadedRef.current.has(id)) return;
    loadedRef.current.add(id);
    setVisibleSections((prev) => ({ ...prev, [id]: true }));
  };

  // IntersectionObserver setup (runs once)
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      // fallback: make everything visible if no IO
      SECTION_IDS.forEach((id) => markLoaded(id));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const sectionId = entry.target.getAttribute("data-section");
          if (!sectionId) return;
          // mark loaded and unobserve — we only need to load once
          markLoaded(sectionId);
          io.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "250px", threshold: 0.12 }
    );

    observerRef.current = io;

    // Observe all placeholders (they exist on first paint)
    // Use requestAnimationFrame to ensure DOM is mounted
    const raf = requestAnimationFrame(() => {
      document.querySelectorAll("[data-section]").forEach((el) => {
        io.observe(el);
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      observerRef.current = null;
    };
    // intentionally no deps so this runs only once
  }, []);

  // Prefetch higher priority chunks on first meaningful interaction (but don't mount)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onFirstInteraction = () => {
      if (didPrefetchRef.current) return;
      didPrefetchRef.current = true;

      // Prefetch Problem and Solution bundles only (these are high priority)
      // dynamic import triggers Vite to fetch those chunks
      import("../components/Home/Problem").catch(() => {});
      import("../components/Home/Solution").catch(() => {});

      // Do NOT set visibleSections for everything; allow IO to load others on scroll
      // If you want to progressively prefetch more, add timed imports here.
    };

    const events = ["pointerdown", "touchstart", "keydown"];
    events.forEach((ev) =>
      document.addEventListener(ev, onFirstInteraction, {
        once: true,
        passive: true,
      })
    );

    return () =>
      events.forEach((ev) =>
        document.removeEventListener(ev, onFirstInteraction)
      );
  }, []);

  // Optional: small debug guard removed in production; keep minimal logs if needed
  // useEffect(() => { console.info("Home mounted"); }, []);

  return (
    <div className="w-full">
      <Background />

      <HeroSection />

      {/* Problem Section */}
      <div data-section="problem">
        {visibleSections.problem ? (
          <Suspense fallback={<SectionSkeleton height={160} />}>
            <Problem />
          </Suspense>
        ) : (
          <SectionSkeleton height={160} />
        )}
      </div>

      {/* Solution Section */}
      <div data-section="solution">
        {visibleSections.solution ? (
          <Suspense fallback={<SectionSkeleton height={200} />}>
            <Solution />
          </Suspense>
        ) : (
          <SectionSkeleton height={200} />
        )}
      </div>

      {/* Word Marquee Section */}
      <div data-section="wordMarquee">
        {visibleSections.wordMarquee ? (
          <Suspense fallback={<SectionSkeleton height={120} />}>
            <WordMarquee />
          </Suspense>
        ) : (
          <SectionSkeleton height={120} />
        )}
      </div>

      {/* Experience Section */}
      <div data-section="experience">
        {visibleSections.experience ? (
          <Suspense fallback={<SectionSkeleton height={200} />}>
            <Experience />
          </Suspense>
        ) : (
          <SectionSkeleton height={200} />
        )}
      </div>

      {/* Mini Feature Section */}
      <div data-section="miniFeature">
        {visibleSections.miniFeature ? (
          <Suspense fallback={<SectionSkeleton height={160} />}>
            <MiniFeature />
          </Suspense>
        ) : (
          <SectionSkeleton height={160} />
        )}
      </div>

      {/* Call to Action Section */}
      <div data-section="callToAction">
        {visibleSections.callToAction ? (
          <Suspense fallback={<SectionSkeleton height={140} />}>
            <CallToAction />
          </Suspense>
        ) : (
          <SectionSkeleton height={140} />
        )}
      </div>
    </div>
  );
};

export default Home;
