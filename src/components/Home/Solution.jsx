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
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Users, Calendar, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Enhanced realistic data with more detail
const data = [
  {
    week: "Week 1",
    ai: 85,
    manual: 23,
    aiPosts: 12,
    manualPosts: 8,
    engagement: 4.2,
  },
  {
    week: "Week 2",
    ai: 142,
    manual: 31,
    aiPosts: 15,
    manualPosts: 7,
    engagement: 6.8,
  },
  {
    week: "Week 3",
    ai: 238,
    manual: 45,
    aiPosts: 18,
    manualPosts: 9,
    engagement: 9.1,
  },
  {
    week: "Week 4",
    ai: 387,
    manual: 52,
    aiPosts: 22,
    manualPosts: 8,
    engagement: 12.3,
  },
  {
    week: "Week 5",
    ai: 512,
    manual: 68,
    aiPosts: 25,
    manualPosts: 10,
    engagement: 15.7,
  },
  {
    week: "Week 6",
    ai: 698,
    manual: 71,
    aiPosts: 28,
    manualPosts: 9,
    engagement: 19.2,
  },
];

const Solution = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const paragraphRef = useRef(null);
  const chartWrapperRef = useRef(null);
  const statsRef = useRef(null);
  const [animatedValues, setAnimatedValues] = useState({
    totalGrowth: 0,
    savedHours: 0,
    engagementRate: 0,
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const ease = "power3.out";

      // Animate each word (preserve gradients)
      gsap.fromTo(
        headingRef.current.querySelectorAll(".word"),
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease,
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
          },
        }
      );

      // Paragraph fade-in
      gsap.from(paragraphRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.9,
        delay: 0.3,
        ease,
        scrollTrigger: {
          trigger: paragraphRef.current,
          start: "top 70%",
        },
      });

      // Chart animation with enhanced effects
      gsap.from(chartWrapperRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 1.2,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: chartWrapperRef.current,
          start: "top 75%",
          onStart: () => {
            // Animate counter values
            gsap.to(animatedValues, {
              totalGrowth: 643,
              savedHours: 24,
              engagementRate: 92,
              duration: 2,
              ease: "power2.out",
              onUpdate: () => {
                setAnimatedValues({ ...animatedValues });
              },
            });
          },
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 border border-gray-700/50 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
          <p className="text-gray-300 text-sm mb-2 font-medium">{label}</p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-white font-semibold">
                  {entry.name === "ai" ? "AI-Assisted" : "Manual"}:{" "}
                  {entry.value} interactions
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700/50">
            <p className="text-blue-400 text-xs">
              Posts: {payload[0]?.payload?.aiPosts || 0} AI |{" "}
              {payload[0]?.payload?.manualPosts || 0} Manual
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[90vh] flex flex-col items-center justify-center 
                 text-center px-5 sm:px-6 py-14 sm:py-16 md:py-24 lg:py-28"
    >
      {/* Gradient Heading with GSAP words */}
      <h2
        ref={headingRef}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5 sm:mb-6 leading-snug 
                   text-gray-900 dark:text-white tracking-tight max-w-3xl"
      >
        <span className="word bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-transparent">
          Growth
        </span>{" "}
        <span className="word">You</span> <span className="word">Can</span>{" "}
        <span className="word bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">
          See
        </span>{" "}
        <span className="word">in</span> <span className="word">Real</span>{" "}
        <span className="word">Time</span>
      </h2>

      {/* Paragraph */}
      <p
        ref={paragraphRef}
        className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-8 sm:mb-10 leading-relaxed px-2"
      >
        With RemindrAI, every post counts. Watch your engagement climb as AI
        keeps you visible, consistent, and ahead — even on your busiest days.
      </p>

      {/* Enhanced Chart Container */}
      <div ref={chartWrapperRef} className="relative w-full max-w-5xl">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-green-500/5 rounded-3xl blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>

        {/* Main Chart Container */}
        <div
          className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-gray-50/5 to-gray-900/20 
                       dark:from-gray-800/20 dark:to-black/40 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
          {/* Chart Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <div className="text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Engagement Performance
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                6-week comparison: AI vs Manual posting
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  AI-Assisted
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-gray-400 to-gray-500"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Manual
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Chart with Dark Mode */}
          <div className="relative bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  {/* AI Gradient */}
                  <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  {/* Manual Gradient */}
                  <linearGradient id="colorManual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                  </linearGradient>
                </defs>

                {/* Grid - use lighter/darker stroke based on theme */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={
                    document.documentElement.classList.contains("dark")
                      ? "#4b5563"
                      : "#374151"
                  }
                  opacity={0.3}
                />

                {/* X-Axis */}
                <XAxis
                  dataKey="week"
                  stroke={
                    document.documentElement.classList.contains("dark")
                      ? "#d1d5db"
                      : "#9ca3af"
                  }
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />

                {/* Y-Axis */}
                <YAxis
                  stroke={
                    document.documentElement.classList.contains("dark")
                      ? "#d1d5db"
                      : "#9ca3af"
                  }
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "Interactions",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fill: document.documentElement.classList.contains("dark")
                        ? "#d1d5db"
                        : "#9ca3af",
                    },
                  }}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Manual Data */}
                <Area
                  type="monotone"
                  dataKey="manual"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  fill="url(#colorManual)"
                  dot={{
                    r: 4,
                    fill: "#9ca3af",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                />

                {/* AI Data */}
                <Area
                  type="monotone"
                  dataKey="ai"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorAI)"
                  dot={{
                    r: 5,
                    fill: "#3b82f6",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 8,
                    strokeWidth: 3,
                    stroke: "#fff",
                    fill: "#3b82f6",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
