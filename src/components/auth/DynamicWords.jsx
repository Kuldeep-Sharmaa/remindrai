import React, { useEffect, useState } from "react";

const words = [
  "Analyzing trends...",
  "Generating content ideas...",
  "Learning your audience...",
  "Optimizing reach...",
  "Scheduling intelligently...",
  "Personalizing posts...",
];

const DynamicWords = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-center text-blue-400 text-sm font-medium transition-all duration-500 ease-in-out">
      {words[index]}
    </p>
  );
};

export default DynamicWords;
