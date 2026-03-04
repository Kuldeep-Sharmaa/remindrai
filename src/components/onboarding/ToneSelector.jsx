import React from "react";
import { motion } from "framer-motion";
import {
  Smile,
  Zap,
  Lightbulb,
  Heart,
  BookOpen,
  Handshake,
  Briefcase,
} from "lucide-react";

const tones = [
  {
    id: "friendly",
    name: "Friendly",
    icon: <Smile size={17} strokeWidth={1.75} />,
  },
  {
    id: "professional",
    name: "Professional",
    icon: <Briefcase size={17} strokeWidth={1.75} />,
  },
  {
    id: "witty",
    name: "Witty",
    icon: <Lightbulb size={17} strokeWidth={1.75} />,
  },
  {
    id: "empathetic",
    name: "Empathetic",
    icon: <Heart size={17} strokeWidth={1.75} />,
  },
  {
    id: "informative",
    name: "Informative",
    icon: <BookOpen size={17} strokeWidth={1.75} />,
  },
  {
    id: "persuasive",
    name: "Persuasive",
    icon: <Handshake size={17} strokeWidth={1.75} />,
  },
  {
    id: "energetic",
    name: "Energetic",
    icon: <Zap size={17} strokeWidth={1.75} />,
  },
];

const itemVariants = {
  hidden: { opacity: 0, scale: 0.93 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

const ToneButton = ({ tone, isSelected, onToggle }) => (
  <motion.button
    onClick={() => onToggle(tone.id)}
    variants={itemVariants}
    whileTap={{ scale: 0.97 }}
    className={`group flex flex-col items-center justify-center gap-2 py-3.5 px-2 rounded-xl text-center transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-bgDark
      ${
        isSelected
          ? "bg-bgImpact border-brand/60 shadow-[0_0_20px_rgba(37,99,235,0.12)]"
          : "bg-bgImpact border-border hover:border-brand/30"
      }`}
  >
    <span
      className={`transition-colors duration-200
      ${isSelected ? "text-brand-soft" : "text-muted group-hover:text-textDark"}`}
    >
      {tone.icon}
    </span>
    <span
      className={`text-[11px] font-grotesk font-semibold leading-none transition-colors duration-200
      ${isSelected ? "text-textDark" : "text-muted group-hover:text-textDark/80"}`}
    >
      {tone.name}
    </span>
  </motion.button>
);

export const ToneSelector = ({ selectedTone, setSelectedTone }) => {
  const handleToggle = (id) =>
    setSelectedTone((prev) => (prev === id ? null : id));

  return (
    <motion.div
      className="flex flex-col gap-3 w-full"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
      }}
    >
      {/* 4 + 3 split — keeps every row visually complete */}
      <div className="grid grid-cols-4 gap-2">
        {tones.slice(0, 4).map((t) => (
          <ToneButton
            key={t.id}
            tone={t}
            isSelected={selectedTone === t.id}
            onToggle={handleToggle}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {tones.slice(4).map((t) => (
          <ToneButton
            key={t.id}
            tone={t}
            isSelected={selectedTone === t.id}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {selectedTone && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-[11px] font-inter text-muted text-center pt-0.5"
        >
          Tone set to{" "}
          <span className="text-textDark font-medium">
            {tones.find((t) => t.id === selectedTone)?.name}
          </span>
        </motion.p>
      )}
    </motion.div>
  );
};

export default ToneSelector;
