import React from "react";
import Marquee from "react-fast-marquee";
import {
  FileText,
  CheckCircle,
  Repeat,
  Play,
  Send,
  Layers,
  Clock,
} from "lucide-react";
const ITEMS = [
  { text: "Drafts ready", icon: FileText },
  { text: "Always prepared", icon: Layers },
  { text: "Keeps running", icon: Repeat },
  { text: "Shows up on time", icon: Clock },
  { text: "No blank start", icon: FileText },
  { text: "Work continues", icon: Play },
  { text: "Already there", icon: CheckCircle },
];

export default function WordMarquee() {
  return (
    <div className="w-full pt-10 overflow-hidden">
      <Marquee gradient={false} speed={50} pauseOnHover>
        {ITEMS.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 mx-8 group cursor-default"
          >
            <item.icon className="w-auto h-6 text-textLight/20 dark:text-white/15 flex-shrink-0 group-hover:text-brand dark:group-hover:text-brand-soft transition-colors duration-300" />

            <span className="lg:text-3xl text-2xl font-fontFamily-grotesk font-medium tracking-wide text-textLight/30 dark:text-white/20 group-hover:text-textLight/60 dark:group-hover:text-white/45 transition-colors duration-300 whitespace-nowrap">
              {item.text}
            </span>

            <span className="ml-8 text-textLight/15 dark:text-white/10 font-inter select-none">
              •
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
