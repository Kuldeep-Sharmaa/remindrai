// src/components/onboarding/ToneSelector.jsx
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

// Defines the available content tones with their IDs, names, and associated icons.
const tones = [
  { id: "friendly", name: "Friendly", icon: <Smile size={20} /> },
  { id: "professional", name: "Professional", icon: <Briefcase size={20} /> },
  { id: "witty", name: "Witty", icon: <Lightbulb size={20} /> },
  { id: "empathetic", name: "Empathetic", icon: <Heart size={20} /> },
  { id: "informative", name: "Informative", icon: <BookOpen size={20} /> },
  { id: "persuasive", name: "Persuasive", icon: <Handshake size={20} /> },
  { id: "energetic", name: "Energetic", icon: <Zap size={20} /> },
];

/**
 * ToneSelector component allows users to select a single content tone.
 * Displays a grid of tone options and highlights the selected one.
 * Shows a confirmation message with the selected tone's name.
 *
 * @param {object} props - Component props.
 * @param {string | null} props.selectedTone - The ID of the currently selected tone, or null if none is selected.
 * @param {function(string | null): void} props.setSelectedTone - Callback to update the selected tone.
 */
export const ToneSelector = ({ selectedTone, setSelectedTone }) => {
  // Handles the selection logic: allows only one tone to be selected at a time.
  // Clicking an already selected tone will deselect it (set to null).
  const handleToggle = (toneId) => {
    setSelectedTone((prevSelectedToneId) =>
      prevSelectedToneId === toneId ? null : toneId
    );
  };

  // Defines animation variants for individual tone buttons.
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.07, // Staggers the animation of child elements.
          },
        },
      }}
      initial="hidden"
      animate="visible"
    >
      {/* Maps through the tones array to render each tone button */}
      {tones.map((tone) => (
        <motion.button
          key={tone.id}
          onClick={() => handleToggle(tone.id)}
          className={`
            flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 text-center
            ${
              selectedTone === tone.id // Checks if the current tone is selected
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 shadow-md transform scale-105" // Styles for selected tone
                : "border-gray-200 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm" // Styles for unselected tone
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
          `}
          variants={itemVariants} // Applies individual item animation variants
          whileHover={{ scale: selectedTone === tone.id ? 1.05 : 1.03 }} // Hover effect: slight scale increase
          whileTap={{ scale: 0.98 }} // Tap effect: slight scale decrease
        >
          {/* Tone icon */}
          <div className="mb-2 text-blue-500 dark:text-blue-300">
            {tone.icon}
          </div>
          {/* Tone name */}
          <span className="font-semibold text-sm sm:text-base">
            {tone.name}
          </span>
        </motion.button>
      ))}

      {/* Conditionally displays a confirmation message if a tone is selected */}
      {selectedTone && (
        <motion.div
          // Spans across all columns of the grid for prominent display
          className="col-span-2 sm:col-span-3 mt-6 p-4 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 rounded-lg text-base text-center shadow-inner"
          initial={{ opacity: 0, y: 10 }} // Initial animation state
          animate={{ opacity: 1, y: 0 }} // Animation to visible state
          transition={{ duration: 0.3, delay: 0.2 }} // Animation duration and delay
        >
          We’ll craft your posts with{" "}
          <span className="font-bold">
            {/* Finds and displays the name of the selected tone */}
            {tones.find((t) => t.id === selectedTone)?.name} tone
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ToneSelector;
