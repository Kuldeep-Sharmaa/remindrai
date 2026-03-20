import React from "react";
import { motion } from "framer-motion";
import { Linkedin, Twitter } from "lucide-react";

// Instagram stays hidden until it's actually available
const platforms = [
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Professional long-form and thought leadership",
    icon: <Linkedin size={18} strokeWidth={1.75} />,
  },
  {
    id: "twitter",
    name: "Twitter / X",
    description: "Short, sharp, and focused ideas",
    icon: <Twitter size={18} strokeWidth={1.75} />,
  },
  {
    id: "threads",
    name: "Threads",
    description: "Conversational, community-driven posts",
    icon: <Twitter size={18} strokeWidth={1.75} />,
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

export const PlatformSelector = ({ selectedPlatform, setSelectedPlatform }) => {
  const handleToggle = (id) =>
    setSelectedPlatform((prev) => (prev === id ? "" : id));

  return (
    <motion.div
      className="flex flex-col gap-2.5 w-full"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
      }}
    >
      {platforms.map((platform) => {
        const isSelected = selectedPlatform === platform.id;
        return (
          <motion.button
            key={platform.id}
            onClick={() => handleToggle(platform.id)}
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
              {platform.icon}
            </span>

            <div className="flex-1 min-w-0">
              <p
                className={`text-[13px] font-grotesk font-semibold leading-none mb-1 transition-colors duration-200
                ${isSelected ? "text-textDark" : "text-textDark/70 group-hover:text-textDark"}`}
              >
                {platform.name}
              </p>
              <p className="text-[11.5px] font-inter text-muted leading-relaxed">
                {platform.description}
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

      {selectedPlatform && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-[11px] font-inter text-textLight/80 dark:text-textDark/80 text-center pt-0.5"
        >
          Platform set to{" "}
          <span className="text-textLight/80 dark:text-textDark/80 font-medium">
            {platforms.find((p) => p.id === selectedPlatform)?.name}
          </span>
        </motion.p>
      )}
    </motion.div>
  );
};

export default PlatformSelector;
