// src/components/ToastSystem/ToastContainer.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Toaster } from "react-hot-toast";

// Professional ToastContainer component for consistent and responsive notifications
const ToastContainer = () => {
  // State to determine if the current viewport is mobile-sized
  const [isMobile, setIsMobile] = useState(false);

  // Effect hook to handle responsive behavior based on window width
  useEffect(() => {
    /**
     * Determines if the viewport is considered mobile.
     * @param {number} width - The current window width.
     * @returns {boolean} - True if mobile, false otherwise.
     */
    const checkIsMobile = (width) => width < 768; // Standard breakpoint for mobile devices

    /**
     * Handles window resize events to update the mobile state.
     */
    const handleResize = () => {
      setIsMobile(checkIsMobile(window.innerWidth));
    };

    // Set initial mobile state on component mount
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup function to remove event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Memoized function to determine toast position based on device type
  const getToastPosition = useCallback(() => {
    return isMobile ? "top-center" : "top-right";
  }, [isMobile]);

  // Memoized function to determine toast gutter (spacing between toasts)
  const getToastGutter = useCallback(() => {
    return isMobile ? 16 : 12; // More space on mobile for better touch targeting
  }, [isMobile]);

  // Memoized object for container-level styles
  const getContainerStyle = useCallback(() => {
    return {
      top: isMobile ? 72 : 20, // Adjust top spacing for mobile vs. desktop
      left: isMobile ? 12 : undefined, // Left margin for mobile full-width toasts
      right: isMobile ? 12 : 20, // Right margin for mobile full-width toasts
      zIndex: 9999, // Ensure toasts appear above other content
      paddingBottom: isMobile ? 16 : undefined, // Add padding at the bottom for mobile if toasts were bottom-anchored, kept for consistency
      // For top-center on mobile, we need to ensure it's truly centered if maxWidth applies
      // but Hot Toast handles `top-center` positioning well with these margin overrides.
    };
  }, [isMobile]);

  // Memoized object for default toast options (styles, duration, etc.)
  const getDefaultToastOptions = useCallback(() => {
    return {
      duration: 4000, // Default duration for all toasts
      style: {
        padding: "12px 16px",
        fontSize: "14px",
        borderRadius: isMobile ? "12px" : "10px", // Slightly larger radius on mobile
        background: "#1e293b", // Slate-800 for dark mode compatibility
        color: "#fff",
        fontWeight: 500,
        backdropFilter: "blur(8px)", // Frosted glass effect
        WebkitBackdropFilter: "blur(8px)", // Safari compatibility
        border: "1px solid rgba(255, 255, 255, 0.1)", // Subtle white border
        // *** CRITICAL CHANGE HERE FOR WIDTH ***
        width: isMobile ? "calc(100vw - 24px)" : "auto", // Mobile takes nearly full width
        maxWidth: "420px", // Desktop/Tablet toasts will not exceed 420px
        minWidth: isMobile ? "auto" : "320px", // Only enforce minWidth on desktop/tablet
        // *** END CRITICAL CHANGE ***
        boxShadow: isMobile
          ? "0 10px 20px rgba(0, 0, 0, 0.2)" // Lighter shadow on mobile for less distraction
          : "0 10px 25px rgba(0, 0, 0, 0.15)", // Standard shadow for desktop
        // Default text alignment
        textAlign: "left", // Ensure text aligns left by default
      },
      // Specific styles for success toasts
      success: {
        iconTheme: {
          primary: "#fff",
          secondary: "#10b981", // Emerald green
        },
        style: {
          background: "linear-gradient(135deg, #10b981, #059669)", // Gradient for vibrancy
        },
      },
      // Specific styles for error toasts
      error: {
        duration: 6000, // Longer duration for critical errors
        iconTheme: {
          primary: "#fff",
          secondary: "#ef4444", // Red
        },
        style: {
          background: "linear-gradient(135deg, #ef4444, #dc2626)", // Red gradient
        },
      },
      // Specific styles for loading toasts
      loading: {
        iconTheme: {
          primary: "#d1d5db", // Gray-300
          secondary: "#6b7280", // Gray-500
        },
        style: {
          background: "linear-gradient(135deg, #6b7280, #4b5563)", // Gray gradient
        },
      },
      // Add Warning and Info to ensure they also inherit desktop/mobile width correctly
      warning: {
        iconTheme: {
          primary: "#fff",
          secondary: "#f59e0b", // Amber/Yellow
        },
        style: {
          background: "linear-gradient(135deg, #f59e0b, #d97706)", // Amber gradient
        },
      },
      info: {
        iconTheme: {
          primary: "#fff",
          secondary: "#3b82f6", // Blue
        },
        style: {
          background: "linear-gradient(135deg, #3b82f6, #2563eb)", // Blue gradient
        },
      },
    };
  }, [isMobile]); // Re-memoize if isMobile changes

  return (
    <Toaster
      position={getToastPosition()}
      reverseOrder={false}
      gutter={getToastGutter()}
      containerStyle={getContainerStyle()}
      toastOptions={getDefaultToastOptions()}
    />
  );
};

export default ToastContainer;
