import React, { useEffect, useState, useMemo } from "react";

export default function Background() {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

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

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 90);
    return () => clearTimeout(t);
  }, []);

  const backgroundStyles = useMemo(() => {
    const dotColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    return {
      backgroundColor: isDark ? "#080808" : "#ffffff",
      backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
      backgroundSize: "26px 26px",
      backgroundRepeat: "repeat",
    };
  }, [isDark]);

  const vignetteStyle = useMemo(
    () => ({
      background: isDark
        ? "radial-gradient(ellipse at center, transparent 40%, #080808 100%)"
        : "radial-gradient(ellipse at center, transparent 40%, #ffffff 100%)",
    }),
    [isDark],
  );

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={backgroundStyles}
      />
      <div className="absolute inset-0" style={vignetteStyle} />
    </div>
  );
}
