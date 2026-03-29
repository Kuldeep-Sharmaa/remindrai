import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

gsap.registerPlugin(ScrollTrigger);

const DATA = [
  { week: "Wk 1", system: 4, manual: 3 },
  { week: "Wk 2", system: 8, manual: 3 },
  { week: "Wk 3", system: 12, manual: 7 },
  { week: "Wk 4", system: 16, manual: 7 },
  { week: "Wk 5", system: 20, manual: 7 },
  { week: "Wk 6", system: 24, manual: 11 },
  { week: "Wk 7", system: 28, manual: 11 },
  { week: "Wk 8", system: 32, manual: 11 },
  { week: "Wk 9", system: 36, manual: 14 },
  { week: "Wk 10", system: 40, manual: 14 },
  { week: "Wk 11", system: 44, manual: 17 },
  { week: "Wk 12", system: 48, manual: 21 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const system = payload.find((p) => p.dataKey === "system");
  const manual = payload.find((p) => p.dataKey === "manual");
  const gap = system && manual ? system.value - manual.value : 0;
  return (
    <div className="px-4 py-3 rounded-xl border border-black/5 dark:border-white/10 bg-bgLight dark:bg-bgImpact shadow-xl min-w-48">
      <p className="text-[10px] font-grotesk font-semibold uppercase tracking-widest text-muted mb-3">
        {label}
      </p>
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand flex-shrink-0" />
            <span className="text-xs font-inter text-textLight dark:text-textDark">
              RemindrAI
            </span>
          </div>
          <span className="text-sm font-grotesk font-bold text-brand dark:text-brand-soft">
            {system?.value} drafts
          </span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />
            <span className="text-xs font-inter text-textLight dark:text-textDark">
              Manual
            </span>
          </div>
          <span className="text-sm font-grotesk font-bold text-muted">
            {manual?.value} drafts
          </span>
        </div>
      </div>
      {gap > 0 && (
        <div className="pt-2.5 border-t border-black/5 dark:border-white/5">
          <p className="text-xs font-inter font-medium text-brand dark:text-brand-soft">
            +{gap} drafts
          </p>
        </div>
      )}
    </div>
  );
};

const Graph = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subtextRef = useRef(null);
  const chartRef = useRef(null);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const ease = "power3.out";
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current.querySelectorAll(".w"),
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease,
            stagger: 0.07,
            scrollTrigger: { trigger: headingRef.current, start: "top 80%" },
          },
        );
      }
      if (subtextRef.current) {
        gsap.fromTo(
          subtextRef.current,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease,
            scrollTrigger: { trigger: subtextRef.current, start: "top 82%" },
          },
        );
      }
      if (chartRef.current) {
        gsap.fromTo(
          chartRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: chartRef.current,
              start: "top 82%",
              onEnter: () => setShowChart(true),
            },
          },
        );
      }
    }, sectionRef.current);
    return () => ctx.revert();
  }, []);

  const isDark = document.documentElement.classList.contains("dark");
  const gridColor = isDark ? "#ffffff06" : "#00000007";
  const tickColor = isDark ? "#6b7280" : "#9ca3af";

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-6 lg:py-12 px-5 sm:px-8 lg:px-12"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5 bg-white dark:bg-black text-xs font-grotesk font-medium tracking-widest uppercase dark:text-bgLight text-bgDark">
            <span className="text-brand">System</span>vs{" "}
            <span className="text-red-600">Manual</span>
          </span>
        </div>

        <h2
          ref={headingRef}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold font-grotesk text-textLight dark:text-textDark leading-tight tracking-tight text-center max-w-2xl mx-auto mb-5"
        >
          <span className="w">A system</span>{" "}
          <span className="w text-brand t">doesn't forget</span>
        </h2>

        <p
          ref={subtextRef}
          className="text-sm sm:text-base text-textLight dark:text-textDark font-inter leading-relaxed text-center max-w-lg mx-auto mb-12"
        >
          Manual effort depends on your time. Systems continue working. Over
          time, consistent systems produce more output.
        </p>

        <div
          ref={chartRef}
          className="rounded-2xl border border-black/5 dark:border-white/10 bg-bgLight dark:bg-bgImpact p-5 sm:p-8"
          style={{ opacity: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-grotesk font-bold text-textLight dark:text-textDark mb-1">
                Drafts over time
              </p>
              <p className="text-xs font-inter text-muted">
                What happens over time
              </p>
            </div>
            <div className="flex items-center gap-5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-5 h-1 rounded-full bg-brand" />
                <span className="text-xs font-inter text-textLight/60 dark:text-white/50 font-medium">
                  RemindrAI
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="20" height="2" viewBox="0 0 20 2" fill="none">
                  <line
                    x1="0"
                    y1="1"
                    x2="20"
                    y2="1"
                    stroke="#FF0000"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                </svg>
                <span className="text-xs font-inter text-textLight/60 dark:text-white/50 font-medium">
                  Manual
                </span>
              </div>
            </div>
          </div>

          <div className="w-full h-64 sm:h-72">
            {showChart && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={DATA}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="systemGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="manualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#FF0000"
                        stopOpacity={0.07}
                      />
                      <stop offset="100%" stopColor="#FF0000" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridColor}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="week"
                    tick={{
                      fontSize: 11,
                      fontFamily: "Inter",
                      fill: tickColor,
                    }}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                    interval={1}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                      fontFamily: "Inter",
                      fill: tickColor,
                    }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 52]}
                    ticks={[0, 12, 24, 36, 48]}
                    tickFormatter={(v) => `${v}`}
                    width={32}
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: "#2563eb",
                      strokeOpacity: 0.1,
                      strokeWidth: 1,
                    }}
                  />

                  <Area
                    type="stepAfter"
                    dataKey="manual"
                    stroke="#FF0000"
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    fill="url(#manualGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#FF0000", stroke: "none" }}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />

                  <Area
                    type="monotone"
                    dataKey="system"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="url(#systemGrad)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#2563eb",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    animationDuration={1600}
                    animationEasing="ease-out"
                    style={{
                      filter: "drop-shadow(0 0 6px rgba(37,99,235,0.3))",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-xs font-inter text-textLight/80 dark:text-white/80">
                Based on a consistent weekly setup
              </p>
            </div>
            <p className="text-xs font-inter text-textLight/80 dark:text-white/80 hidden sm:block">
              Hover to explore
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Graph;
