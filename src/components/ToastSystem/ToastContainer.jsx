// src/components/ToastSystem/ToastContainer.jsx
import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

const ToastContainer = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    let timer;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIsMobile(window.innerWidth < 768), 100);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <Toaster
      position={isMobile ? "top-center" : "top-right"}
      reverseOrder={false}
      gutter={isMobile ? 10 : 8}
      containerStyle={{
        top: isMobile ? 16 : 20,
        right: isMobile ? undefined : 20,
        zIndex: 9999,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          padding: "11px 14px",
          fontSize: "13.5px",
          lineHeight: "1.45",
          borderRadius: "10px",
          background: "#0f172a",
          color: "#e2e8f0",
          fontWeight: 450,
          letterSpacing: "0.01em",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.07)",
          width: isMobile ? "calc(100vw - 32px)" : "auto",
          maxWidth: isMobile ? "480px" : "400px",
          minWidth: isMobile ? "unset" : "300px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.16)",
          textAlign: "left",
          willChange: "transform, opacity",
        },

        success: {
          iconTheme: { primary: "#16a34a", secondary: "#fff" },
          style: {
            background: "#16a34a",
            color: "#fff",
            border: "none",
          },
        },

        error: {
          duration: 6000,
          iconTheme: { primary: "#dc2626", secondary: "#fff" },
          style: {
            background: "#dc2626",
            color: "#fff",
            border: "none",
          },
        },

        loading: {
          iconTheme: { primary: "#94a3b8", secondary: "#334155" },
          style: {
            background: "#0f172a",
            color: "#94a3b8",
            border: "1px solid rgba(255,255,255,0.07)",
          },
        },

        warning: {
          iconTheme: { primary: "#0f172a", secondary: "#fbbf24" },
          style: {
            background: "#1c1500",
            color: "#fef9c3",
            border: "1px solid #78350f",
          },
        },

        info: {
          iconTheme: { primary: "#0f172a", secondary: "#60a5fa" },
          style: {
            background: "#0a1628",
            color: "#dbeafe",
            border: "1px solid #1e3a5f",
          },
        },
      }}
    />
  );
};

export default ToastContainer;
