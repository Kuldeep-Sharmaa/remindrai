import React, { useEffect, useState, useMemo } from "react";

export default function Background() {
  // Read synchronously on init — no false-start to light mode
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const patternStyle = useMemo(() => {
    const dot = isDark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.045)";
    return {
      backgroundColor: isDark ? "#000000" : "#ffffff",
      backgroundImage: `radial-gradient(circle, ${dot} 1px, transparent 1px)`,
      backgroundSize: "32px 32px",
    };
  }, [isDark]);

  const blob1 = useMemo(
    () => ({
      background: isDark
        ? "radial-gradient(ellipse 65% 55% at 5% 0%, rgba(37,99,235,0.12) 0%, transparent 100%)"
        : "radial-gradient(ellipse 65% 55% at 5% 0%, rgba(37,99,235,0.06) 0%, transparent 100%)",
    }),
    [isDark],
  );

  const blob2 = useMemo(
    () => ({
      background: isDark
        ? "radial-gradient(ellipse 50% 45% at 100% 100%, rgba(37,99,235,0.09) 0%, transparent 100%)"
        : "radial-gradient(ellipse 50% 45% at 100% 100%, rgba(37,99,235,0.04) 0%, transparent 100%)",
    }),
    [isDark],
  );

  const fade = useMemo(
    () => ({
      background: isDark
        ? "radial-gradient(ellipse 75% 65% at 50% 45%, transparent 40%, rgba(0,0,0,0.7) 100%)"
        : "radial-gradient(ellipse 75% 65% at 50% 45%, transparent 40%, rgba(255,255,255,0.7) 100%)",
    }),
    [isDark],
  );

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" style={patternStyle} />
      <div className="absolute inset-0" style={blob1} />
      <div className="absolute inset-0" style={blob2} />
      <div className="absolute inset-0" style={fade} />
    </div>
  );
}
