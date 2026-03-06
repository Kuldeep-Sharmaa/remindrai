import React, {
  useState,
  useEffect,
  useRef,
  lazy,
  Suspense,
  useCallback,
} from "react";
import HeroSection from "../components/Home/HeroSection";
import Background from "../components/Background";

const Problem = lazy(() => import("../components/Home/Problem"));
const Graph = lazy(() => import("../components/Home/Graph"));
const Setup = lazy(() => import("../components/Home/SetUp"));
const MiniFeature = lazy(() => import("../components/Home/MiniFeatures"));
const CallToAction = lazy(() => import("../components/Home/CallToAction"));
const WordMarquee = lazy(() => import("../components/Home/WordMarquee"));

const SectionSkeleton = () => (
  <div className="w-full py-16 px-4">
    <div className="max-w-6xl mx-auto animate-pulse space-y-4">
      <div className="h-5 bg-gray-100 dark:bg-white/[0.04] rounded w-1/3" />
      <div className="h-4 bg-gray-100 dark:bg-white/[0.04] rounded w-2/3" />
      <div className="h-32 bg-gray-100 dark:bg-white/[0.04] rounded w-full" />
    </div>
  </div>
);

const SECTIONS = [
  "problem",
  "graph",
  "wordMarquee",
  "setup",
  "miniFeature",
  "callToAction",
];

const Home = () => {
  const [visible, setVisible] = useState({ hero: true });
  const loadedRef = useRef(new Set(["hero"]));

  const markLoaded = useCallback((id) => {
    if (loadedRef.current.has(id)) return;
    loadedRef.current.add(id);
    setVisible((prev) => ({ ...prev, [id]: true }));
  }, []);

  // Intersection observer — loads sections as they approach viewport
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      SECTIONS.forEach(markLoaded);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.dataset.section;
          if (id) {
            markLoaded(id);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "300px", threshold: 0 },
    );

    const raf = requestAnimationFrame(() => {
      document
        .querySelectorAll("[data-section]")
        .forEach((el) => io.observe(el));
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [markLoaded]);

  // Prefetch high-priority chunks on first user interaction
  useEffect(() => {
    let done = false;
    const prefetch = () => {
      if (done) return;
      done = true;
      import("../components/Home/Problem").catch(() => {});
      import("../components/Home/Graph").catch(() => {});
    };
    const events = ["pointerdown", "touchstart", "keydown"];
    events.forEach((e) =>
      document.addEventListener(e, prefetch, { once: true, passive: true }),
    );
    return () =>
      events.forEach((e) => document.removeEventListener(e, prefetch));
  }, []);

  return (
    <div className="w-full">
      <Background />
      <HeroSection />

      <div data-section="problem">
        <Suspense fallback={<SectionSkeleton />}>
          {visible.problem && <Problem />}
        </Suspense>
      </div>

      <div data-section="graph">
        <Suspense fallback={<SectionSkeleton />}>
          {visible.graph && <Graph />}
        </Suspense>
      </div>

      <div data-section="wordMarquee">
        <Suspense fallback={<SectionSkeleton />}>
          {visible.wordMarquee && <WordMarquee />}
        </Suspense>
      </div>

      <div data-section="setup">
        <Suspense fallback={<SectionSkeleton />}>
          {visible.setup && <Setup />}
        </Suspense>
      </div>

      <div data-section="miniFeature">
        <Suspense fallback={<SectionSkeleton />}>
          {visible.miniFeature && <MiniFeature />}
        </Suspense>
      </div>

      <div data-section="callToAction">
        <Suspense fallback={<SectionSkeleton />}>
          {visible.callToAction && <CallToAction />}
        </Suspense>
      </div>
    </div>
  );
};

export default Home;
