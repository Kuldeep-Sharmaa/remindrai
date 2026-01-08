import React from "react";
import { motion } from "framer-motion";
import { Linkedin, Twitter, Instagram } from "lucide-react";

const platforms = [
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: <Linkedin size={24} />,
    available: true,
  },
  {
    id: "twitter",
    name: "Twitter (X)",
    icon: <Twitter size={24} />,
    available: true,
  },
  {
    id: "threads",
    name: "Threads",
    icon: <Twitter size={24} />, // Using Twitter icon as placeholder for Threads
    available: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: <Instagram size={24} />,
    available: false,
  },
];

export const PlatformSelector = ({ selectedPlatform, setSelectedPlatform }) => {
  // Named export for immersive compatibility

  const handleToggle = (platformId) => {
    const platform = platforms.find((p) => p.id === platformId);
    if (!platform.available) return; // Don't allow selection of unavailable platforms

    // FIX: Change logic to set a single string or empty string
    setSelectedPlatform(
      (prevSelectedPlatform) =>
        prevSelectedPlatform === platformId ? "" : platformId // If already selected, deselect by setting to empty string. Otherwise, set the new ID.
    );
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  // FIX: Find the name of the currently selected platform (selectedPlatform is now a string)
  const selectedPlatformName =
    selectedPlatform !== ""
      ? platforms.find((p) => p.id === selectedPlatform)?.name
      : null;

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
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Currently supports one platform at a time
        </p>
      </div>

      {platforms.map((platform) => (
        <motion.button
          key={platform.id}
          onClick={() => handleToggle(platform.id)}
          disabled={!platform.available}
          className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 relative
            ${
              !platform.available
                ? "border-gray-200 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
                : selectedPlatform === platform.id // FIX: Check if selectedPlatform (string) matches platform.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 shadow-md transform scale-105" // Added scale for emphasis
                : "border-gray-200 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm" // Fixed dark:hover-border color
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
          variants={itemVariants}
          whileHover={platform.available ? { scale: 1.02 } : {}}
          whileTap={platform.available ? { scale: 0.98 } : {}}
        >
          <div
            className={`mr-4 ${
              platform.available
                ? "text-blue-500 dark:text-blue-300"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {platform.icon}
          </div>
          <span className="font-semibold text-lg">{platform.name}</span>

          {!platform.available && (
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 font-normal">
              Coming Soon
            </span>
          )}

          {platform.available &&
            selectedPlatform === platform.id && ( // FIX: Check if selectedPlatform (string) matches platform.id
              <svg
                className="w-6 h-6 text-blue-500 dark:text-blue-300 ml-auto"
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

      {/* FIX: Conditionally render if selectedPlatform is not an empty string */}
      {selectedPlatform !== "" && (
        <motion.div
          className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 rounded-lg text-sm text-center shadow-inner"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          We’ll tailor content for:{" "}
          <span className="font-bold">{selectedPlatformName}</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PlatformSelector;
