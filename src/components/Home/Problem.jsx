import React, { useEffect, useRef, useState } from "react";
import { RepeatIcon } from "lucide-react";

const WEEK = [
  { day: "Mon", label: "Started strong", state: "active" },
  { day: "Tue", label: "Busy", state: "active" },
  { day: "Wed", label: "Planned", state: "planned" },
  { day: "Thu", label: "Missed", state: "missed" },
  { day: "Fri", label: "Missed", state: "missed" },
  { day: "Sat", label: null, state: "empty" },
  { day: "Sun", label: null, state: "empty" },
];

const ROW_OPACITY = [1, 0.8, 0.52, 1, 0.9, 0.7, 0.7];

function useDark() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const mo = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark")),
    );
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => mo.disconnect();
  }, []);
  return dark;
}

function labelColor(i, isMissed, dark) {
  if (isMissed) return dark ? "rgba(239,68,68,0.88)" : "rgba(185,28,28,0.82)";
  const palette = dark
    ? [
        "rgba(255,255,255,0.92)",
        "rgba(255,255,255,0.75)",
        "rgba(255,255,255,0.45)",
      ]
    : ["rgba(15,23,42,0.92)", "rgba(15,23,42,0.72)", "rgba(15,23,42,0.42)"];
  return palette[Math.min(i, 2)];
}

function dayColor(item, dark) {
  if (item.state === "missed")
    return dark ? "rgba(239,68,68,0.55)" : "rgba(185,28,28,0.50)";
  if (item.state === "empty")
    return dark ? "rgba(255,255,255,0.16)" : "rgba(15,23,42,0.18)";
  return dark ? "#2563eb" : "#2563eb";
}

export default function Problem() {
  const [entered, setEntered] = useState(false);
  const [visibleRows, setVisibleRows] = useState(() =>
    Array(WEEK.length).fill(false),
  );
  const [done, setDone] = useState(false);
  const [breakAnim, setBreakAnim] = useState(false);

  const sectionRef = useRef(null);
  const rowRefs = useRef([]);
  const dark = useDark();

  // Section-level IO — only drives heading entrance
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setEntered(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const observers = rowRefs.current.map((el, i) => {
      if (!el) return null;
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setVisibleRows((prev) => {
              if (prev[i]) return prev;
              const next = [...prev];
              next[i] = true;
              return next;
            });
            if (i === 3) setBreakAnim(true);
            if (i === WEEK.length - 1) setDone(true);
            io.disconnect();
          }
        },
        { threshold: 0.5 },
      );
      io.observe(el);
      return io;
    });

    return () => observers.forEach((io) => io?.disconnect());
  }, []);

  const missedLineColor = dark
    ? "linear-gradient(to right, rgba(239,68,68,0.22), rgba(239,68,68,0.04) 55%, transparent)"
    : "linear-gradient(to right, rgba(185,28,28,0.18), rgba(185,28,28,0.02) 55%, transparent)";

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-8 lg:py-12 px-5 sm:px-8 lg:px-12"
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center lg:grid lg:grid-cols-2 lg:gap-24 lg:items-start">
        <div
          className="section-enter mb-14 sm:mb-16 lg:mb-0 lg:sticky lg:top-32 text-center lg:text-left"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5 bg-white dark:bg-black text-xs font-grotesk font-medium  tracking-widest uppercase text-brand">
            This week
          </span>

          <h2
            className="font-grotesk font-bold tracking-tight text-textLight dark:text-textDark"
            style={{ fontSize: "clamp(1.85rem, 4vw, 3rem)", lineHeight: 1.06 }}
          >
            You forget <br /> Consistency{" "}
            <span className={`breaks-shell${breakAnim ? " is-breaking" : ""}`}>
              <span className="breaks-measure" aria-hidden="true">
                breaks
              </span>
              <span className="breaks-top" aria-hidden="true">
                breaks
              </span>
              <span className="breaks-bot">breaks</span>
            </span>
          </h2>

          <p className="mt-5 font-inter text-sm lg:text-base text-bgDark/80 dark:text-bgLight/80 max-w-xs leading-relaxed mx-auto lg:mx-0">
            It breaks when you stop.
          </p>
        </div>

        <div
          className="section-enter momentum-log max-w-sm mx-auto w-full lg:max-w-none lg:mx-0 px-12 lg:px-2"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? "translateY(0)" : "translateY(16px)",
          }}
        >
          {WEEK.map((item, i) => {
            const visible = visibleRows[i];
            const isMissed = item.state === "missed";
            const isEmpty = item.state === "empty";
            const isFirst = i === 0;
            const showPreGap = isMissed && i === 3;

            return (
              <div key={item.day} ref={(el) => (rowRefs.current[i] = el)}>
                {showPreGap && <div className="h-4 sm:h-6" />}

                <div
                  className="row-slip flex items-baseline gap-5 sm:gap-7"
                  style={{
                    opacity: visible ? ROW_OPACITY[i] : 0,
                    transform: visible ? "translateY(0)" : "translateY(10px)",
                    paddingBottom: isEmpty ? "6px" : "14px",
                  }}
                >
                  <span
                    className="font-grotesk text-base uppercase tracking-widest flex-shrink-0 w-8"
                    style={{ color: dayColor(item, dark), fontWeight: 600 }}
                  >
                    {item.day}
                  </span>

                  {item.label ? (
                    <span
                      className="font-inter leading-snug"
                      style={{
                        fontSize: isMissed
                          ? "clamp(1rem, 2vw, 1.0625rem)"
                          : isFirst
                            ? "clamp(1rem, 2.2vw, 1.1875rem)"
                            : "clamp(1rem, 2vw, 1.0625rem)",
                        fontWeight: isFirst || isMissed ? 500 : 400,
                        color: labelColor(i, isMissed, dark),
                        fontStyle:
                          item.state === "planned" ? "italic" : "normal",
                      }}
                    >
                      {item.label}
                    </span>
                  ) : (
                    <span
                      className="font-inter text-xs tracking-widest"
                      style={{
                        color: dark
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(15,23,42,0.12)",
                      }}
                    >
                      —
                    </span>
                  )}
                </div>

                {isMissed && (
                  <div
                    style={{
                      height: "1px",
                      background: missedLineColor,
                      opacity: visible ? 1 : 0,
                      transition: "opacity 0.9s ease 0.4s",
                      marginBottom: "4px",
                    }}
                  />
                )}
              </div>
            );
          })}

          <p
            className="font-inter text-sm text-muted lg:text-base mt-8 text-center lg:text-left"
            style={{
              opacity: done ? 1 : 0,
              transform: done ? "translateY(0)" : "translateY(4px)",
              transition: "opacity 1.2s ease 0.3s, transform 1.2s ease 0.3s",
            }}
          >
            This cycle repeats <RepeatIcon className="inline-block w-3 h-3" />
          </p>
        </div>
      </div>
    </section>
  );
}
