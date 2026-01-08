import React, { useEffect, useState, useMemo } from "react";

export default function Background() {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ✅ Detect dark mode
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    setIsDark(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  // ✅ Smooth fade-in
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 90);
    return () => clearTimeout(t);
  }, []);

  // ✅ Optimized styles: faint grid + gradient fade
  const backgroundStyles = useMemo(() => {
    const gridColor = isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.015)";
    const fadeTop = isDark
      ? "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0) 100%)"
      : "linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0) 100%)";

    return {
      backgroundColor: isDark ? "#000000" : "#ffffff",
      backgroundImage: `
        ${fadeTop},
        linear-gradient(90deg, ${gridColor} 10px, transparent 10px),
        linear-gradient(0deg, ${gridColor} 10px, transparent 10px)
      `,
      backgroundSize: "100% 100%, 120px 120px, 120px 120px",
      backgroundRepeat: "no-repeat, repeat, repeat",
    };
  }, [isDark]);

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={backgroundStyles}
      />
    </div>
  );
}
