import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Smile, Brain, Lightbulb } from "lucide-react";

const tones = [
  {
    id: "professional",
    name: "Professional",
    description: "Clear, structured, and straight to the point",
    icon: <Briefcase size={18} strokeWidth={1.75} />,
  },
  {
    id: "friendly",
    name: "Friendly",
    description: "Warm, simple, and easy to connect with",
    icon: <Smile size={18} strokeWidth={1.75} />,
  },
  {
    id: "thoughtful",
    name: "Thoughtful",
    description: "Reflective and focused on meaningful insights",
    icon: <Brain size={18} strokeWidth={1.75} />,
  },
  {
    id: "witty",
    name: "Witty",
    description: "Smart, sharp, and slightly playful",
    icon: <Lightbulb size={18} strokeWidth={1.75} />,
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

export const ToneSelector = ({ selectedTone, setSelectedTone }) => {
  const handleToggle = (id) =>
    setSelectedTone((prev) => (prev === id ? null : id));

  return (
    <motion.div
      className="flex flex-col gap-2.5 w-full"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
      }}
    >
      {tones.map((tone) => {
        const isSelected = selectedTone === tone.id;
        return (
          <motion.button
            key={tone.id}
            onClick={() => handleToggle(tone.id)}
            variants={itemVariants}
            whileTap={{ scale: 0.99 }}
            className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-bgDark
              ${
                isSelected
                  ? "bg-bgImpact border-brand/60 shadow-[0_0_20px_rgba(37,99,235,0.12)]"
                  : "bg-bgImpact border-border hover:border-brand/30"
              }`}
          >
            <span
              className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                ${
                  isSelected
                    ? "bg-brand/15 text-brand-soft"
                    : "bg-border/60 text-muted group-hover:text-textDark"
                }`}
            >
              {tone.icon}
            </span>

            <div className="flex-1 min-w-0">
              <p
                className={`text-base font-grotesk font-semibold leading-none mb-1 transition-colors duration-200
                  ${isSelected ? "text-textDark" : "text-textDark/70 group-hover:text-textDark"}`}
              >
                {tone.name}
              </p>
              <p className="text-xs font-inter text-muted leading-relaxed">
                {tone.description}
              </p>
            </div>

            <motion.span
              animate={{
                opacity: isSelected ? 1 : 0,
                scale: isSelected ? 1 : 0.5,
              }}
              transition={{ duration: 0.18 }}
              className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand"
            />
          </motion.button>
        );
      })}

      {selectedTone && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-sm font-inter text-textLight/80 dark:text-textDark/80 text-center py-1"
        >
          Tone set to{" "}
          <span className="text-brand font-medium">
            {tones.find((t) => t.id === selectedTone)?.name}
          </span>
        </motion.p>
      )}
    </motion.div>
  );
};

export default ToneSelector;
