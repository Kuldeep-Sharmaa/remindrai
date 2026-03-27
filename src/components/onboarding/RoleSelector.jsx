import React from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  Briefcase,
  TrendingUp,
  PenTool,
  Code,
  HelpCircle,
} from "lucide-react";

const roles = [
  {
    id: "founder",
    name: "Founder",
    description: "Building and growing a startup while handling everything",
    icon: <Rocket size={18} strokeWidth={1.75} />,
  },
  {
    id: "solopreneur",
    name: "Solopreneur",
    description: "Running a business solo and staying visible online",
    icon: <Briefcase size={18} strokeWidth={1.75} />,
  },
  {
    id: "professional",
    name: "Professional",
    description: "Growing your career and sharing your journey",
    icon: <TrendingUp size={18} strokeWidth={1.75} />,
  },
  {
    id: "creator",
    name: "Creator",
    description: "Sharing ideas and building an audience consistently",
    icon: <PenTool size={18} strokeWidth={1.75} />,
  },
  {
    id: "developer",
    name: "Developer",
    description: "Building products and sharing technical or learning insights",
    icon: <Code size={18} strokeWidth={1.75} />,
  },
  {
    id: "other",
    name: "Other",
    description: "Something that doesn’t fit the options above",
    icon: <HelpCircle size={18} strokeWidth={1.75} />,
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

export const RoleSelector = ({ selectedRole, onSelect }) => {
  return (
    <motion.div
      className="flex flex-col gap-2.5 w-full"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
      }}
    >
      {roles.map((role) => {
        const isSelected = selectedRole === role.id;
        return (
          <motion.button
            key={role.id}
            onClick={() => onSelect(role.id)}
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
              {role.icon}
            </span>

            <div className="flex-1 min-w-0">
              <p
                className={`text-base font-grotesk font-semibold leading-none mb-1 transition-colors duration-200
                ${isSelected ? "text-textDark" : "text-textDark/70 group-hover:text-textDark"}`}
              >
                {role.name}
              </p>
              <p className="text-xs font-inter text-muted leading-relaxed">
                {role.description}
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

      {selectedRole && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-sm font-inter text-textLight/80 dark:text-textDark/80 text-center py-1"
        >
          Role set to{" "}
          <span className="text-brand font-medium">
            {roles.find((r) => r.id === selectedRole)?.name}
          </span>
        </motion.p>
      )}
    </motion.div>
  );
};

export default RoleSelector;
