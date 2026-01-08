// src/components/WordMarquee.jsx
import React from "react";
import Marquee from "react-fast-marquee";
import { Calendar, Zap, Clock, Brain, Rocket } from "lucide-react";

const words = [
  {
    text: "Plan Smarter",

    icon: Calendar,
  },
  {
    text: "Automate Effortlessly",

    icon: Zap,
  },
  {
    text: "Never Miss Deadlines",

    icon: Clock,
  },
  {
    text: "AI-Powered Reminders",

    icon: Brain,
  },
  { text: "Stay Ahead", gradient: "from-yellow-400 to-red-500", icon: Rocket },
];

export default function WordMarquee() {
  return (
    <div className="w-full py-6 overflow-hidden">
      <Marquee gradient={false} speed={50} pauseOnHover>
        {words.map((item, index) => (
          <div key={index} className="flex items-center gap-3 mx-10 group">
            <item.icon className="w-7 h-7  text-gray-300 dark:text-gray-600 transition-colors duration-300" />
            <span
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none
                         text-gray-300 dark:text-gray-600
                         opacity-50 ${item.gradient}`}
            >
              {item.text}
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
