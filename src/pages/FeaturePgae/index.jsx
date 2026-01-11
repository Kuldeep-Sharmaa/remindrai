import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Brain,
  Bot,
  BarChart3,
  Bell,
  RefreshCw,
  Shield,
  Sparkles,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

import DataAnalysisSVG from "../../assets/svg/feature/Data.svg";
import GradientButton from "../../components/Ui/GradientBtn";

// Simple intersection observer hook
const useInView = () => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
};

export default function FeaturesPage() {
  const [heroRef, heroInView] = useInView();

  return (
    <div className="mt10">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-24 lg:py-32">
          <div
            ref={heroRef}
            className={`text-center transition-all duration-1000 ${
              heroInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/50 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
              <Sparkles size={16} />
              Powered by AI
            </div>

            {/* Main heading */}
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Making your work <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                simpler and smarter
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              RemindrAI combines intelligent automation with seamless task
              management to help you focus on what matters most.
            </p>

            {/* Hero Visual */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className=" p-8 ">
                <img
                  src={DataAnalysisSVG}
                  alt="Data Analysis Illustration"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <GradientButton label="See It in Action" to="/Auth" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      {/* 🚀 Features Section (OpenAI/Perplexity Inspired) */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Everything you need to stay productive
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to automate tasks, create
              intelligently, and simplify your workflow.
            </p>
          </div>

          {/* Feature Blocks */}
          <div className="space-y-32">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Left - Icon Illustration */}
                <div className="flex-shrink-0 w-full lg:w-1/2 flex justify-center">
                  <div className="relative flex justify-center items-center w-64 h-64 rounded-3xl p-10 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/30 to-purple-200/30 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl backdrop-blur-xl"></div>
                    <feature.icon className="relative w-24 h-24 text-blue-600 dark:text-blue-400 mx-auto drop-shadow-lg" />
                  </div>
                </div>

                {/* Right - Text Content */}
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                  <h3 className="text-2xl lg:text-3xl font-semibold mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 ">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl lg:text-4xl font-bold mb-12">
            Why teams choose RemindrAI
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="space-y-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-xl flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-xl font-semibold">{benefit.title}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 lg:py-32 ">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who've revolutionized their
            productivity with RemindrAI.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <GradientButton label="Start Free Trial" to="/Auth" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Feature Block Component
const FeatureBlock = ({ feature, reverse = false }) => {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={`flex flex-col ${
        reverse ? "lg:flex-row-reverse" : "lg:flex-row"
      } items-center gap-16 transition-all duration-1000 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      {/* Content */}
      <div className="flex-1 space-y-6">
        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center">
          <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>

        <h3 className="text-3xl lg:text-4xl font-bold">{feature.title}</h3>

        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          {feature.description}
        </p>

        {feature.highlights && (
          <ul className="space-y-3">
            {feature.highlights.map((highlight, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
              >
                <Check
                  size={16}
                  className="text-blue-600 dark:text-blue-400 flex-shrink-0"
                />
                {highlight}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Visual */}
      <div className="flex-1">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-12 lg:p-16">
          <div className="w-full h-64 flex items-center justify-center">
            <feature.icon
              size={120}
              className="text-blue-600/20 dark:text-blue-400/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Features data
const features = [
  {
    icon: Brain,
    title: "AI-Powered Smart Reminders",
    description:
      "Never miss important tasks with intelligent reminders that understand context and priority. Our AI learns your patterns and suggests optimal timing for maximum productivity.",
    highlights: [
      "Context-aware notifications",
      "Priority-based scheduling",
      "Pattern recognition learning",
    ],
  },
  {
    icon: Bot,
    title: "Intelligent Content Generation",
    description:
      "Create engaging content in seconds with AI that understands your brand voice. Generate posts, emails, and documents that resonate with your audience.",
    highlights: [
      "Brand voice consistency",
      "Multi-platform optimization",
      "Instant content creation",
    ],
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics Dashboard",
    description:
      "Make data-driven decisions with comprehensive insights into your productivity patterns, content performance, and workflow optimization opportunities.",
    highlights: [
      "Real-time performance metrics",
      "Productivity trend analysis",
      "Actionable recommendations",
    ],
  },
  {
    icon: RefreshCw,
    title: "Seamless Cross-Platform Sync",
    description:
      "Access your work from anywhere with real-time synchronization across all devices. Your tasks, content, and insights are always up-to-date.",
    highlights: [
      "Instant cross-device sync",
      "Offline mode support",
      "Cloud-based storage",
    ],
  },
  {
    icon: Bell,
    title: "Smart Notification System",
    description:
      "Stay informed without being overwhelmed. Our intelligent notification system delivers the right information at the right time through your preferred channels.",
    highlights: [
      "Customizable notification preferences",
      "Multi-channel delivery",
      "Smart filtering algorithms",
    ],
  },
];

// Benefits data
const benefits = [
  {
    title: "Save 10+ hours per week",
    description:
      "Automate repetitive tasks and focus on high-impact work that drives results.",
  },
  {
    title: "Never miss deadlines",
    description:
      "Intelligent reminders and priority management keep you on track automatically.",
  },
  {
    title: "Scale your content",
    description:
      "Generate consistent, high-quality content across all your platforms effortlessly.",
  },
];
