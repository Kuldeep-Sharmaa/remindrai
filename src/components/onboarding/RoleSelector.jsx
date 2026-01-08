import React from "react";
import { motion } from "framer-motion";
import { Rocket, Briefcase, PenTool, User, HelpCircle } from "lucide-react";

const roles = [
  {
    id: "busy-founder",
    name: "Busy Founder",
    description:
      "I’m building a brand but don’t have time to post consistently",
    icon: <Rocket size={24} />,
  },

  {
    id: "solopreneur",
    name: "Solopreneur",
    description: "I want to stay visible, but often run out of ideas or forget",
    icon: <User size={24} />,
  },
  {
    id: "career-builder",
    name: "Career Builder",
    description:
      "I want to grow on Social Media but struggle to post regularly",
    icon: <User size={24} />,
  },
  {
    id: "content-creator",
    name: "Content Creator",
    description: "I post often, but I’m feeling burned out or stuck",
    icon: <PenTool size={24} />,
  },
  {
    id: "other",
    name: "Other",
    description: "I have a unique situation that doesn't fit these roles",
    icon: <HelpCircle size={24} />,
  },
];

export const RoleSelector = ({ selectedRole, onSelect }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="grid gap-4 w-full"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      animate="visible"
    >
      {roles.map((role) => (
        <motion.button
          key={role.id}
          onClick={() => onSelect(role.id)}
          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200
            ${
              selectedRole === role.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 shadow-md"
                : "border-gray-200 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:border-blue-300 dark:hover:border-600 hover:shadow-sm"
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center text-left">
            <div className="mr-4 text-blue-500 dark:text-blue-300">
              {role.icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{role.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {role.description}
              </p>
            </div>
          </div>
          {selectedRole === role.id && (
            <svg
              className="w-6 h-6 text-blue-500 dark:text-blue-300 ml-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </motion.button>
      ))}

      {selectedRole && (
        <motion.div
          className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 rounded-lg text-sm text-center shadow-inner"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          You’re building as a:{" "}
          <span className="font-bold">
            {roles.find((r) => r.id === selectedRole)?.name}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RoleSelector;
