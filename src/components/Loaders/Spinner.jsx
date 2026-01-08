// src/components/Loaders/Spinner.jsx - Professional SaaS Spinner Component

import React, { useMemo, forwardRef } from "react";

/**
 * Professional, high-performance spinner component optimized for SaaS applications.
 * Features multiple variants, sizes, and accessibility support.
 *
 * @param {Object} props - Component props
 * @param {string} props.variant - Spinner style variant ('default', 'dots', 'pulse', 'bars', 'ring', 'dual-ring')
 * @param {string} props.size - Size preset ('xs', 'sm', 'md', 'lg', 'xl', '2xl')
 * @param {string} props.speed - Animation speed ('slow', 'normal', 'fast')
 * @param {string} props.color - Color theme ('primary', 'secondary', 'success', 'warning', 'error', 'neutral')
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.srText - Screen reader text
 * @param {boolean} props.inline - Inline display mode
 * @param {string} props.testId - Test identifier
 */
const Spinner = forwardRef(
  (
    {
      variant = "default",
      size = "md",
      speed = "normal",
      color = "primary",
      className = "",
      srText = "Loading data...",
      inline = false,
      testId = "spinner",
      ...props
    },
    ref
  ) => {
    // Size configurations optimized for SaaS interfaces
    const sizeConfig = useMemo(
      () => ({
        xs: {
          container: "w-3 h-3",
          stroke: "1.5",
          dots: "w-1 h-1",
          bars: "w-0.5 h-2",
        },
        sm: {
          container: "w-4 h-4",
          stroke: "2",
          dots: "w-1.5 h-1.5",
          bars: "w-0.5 h-3",
        },
        md: {
          container: "w-6 h-6",
          stroke: "2",
          dots: "w-2 h-2",
          bars: "w-1 h-4",
        },
        lg: {
          container: "w-8 h-8",
          stroke: "2.5",
          dots: "w-2.5 h-2.5",
          bars: "w-1 h-5",
        },
        xl: {
          container: "w-10 h-10",
          stroke: "3",
          dots: "w-3 h-3",
          bars: "w-1.5 h-6",
        },
        "2xl": {
          container: "w-12 h-12",
          stroke: "3",
          dots: "w-4 h-4",
          bars: "w-2 h-8",
        },
      }),
      []
    );

    // Professional color themes for SaaS
    const colorConfig = useMemo(
      () => ({
        primary: "text-blue-600 dark:text-blue-400",
        secondary: "text-gray-600 dark:text-gray-400",
        success: "text-green-600 dark:text-green-400",
        warning: "text-amber-600 dark:text-amber-400",
        error: "text-red-600 dark:text-red-400",
        neutral: "text-gray-500 dark:text-gray-400",
      }),
      []
    );

    // Animation speed configurations
    const speedConfig = useMemo(
      () => ({
        slow: "duration-1000",
        normal: "duration-700",
        fast: "duration-500",
      }),
      []
    );

    const currentSize = sizeConfig[size] || sizeConfig.md;
    const currentColor = colorConfig[color] || colorConfig.primary;
    const currentSpeed = speedConfig[speed] || speedConfig.normal;

    // Base container classes
    const containerClasses = useMemo(() => {
      const baseClasses = [
        inline ? "inline-flex" : "flex",
        "items-center justify-center",
        currentSize.container,
        currentColor,
        className,
      ];

      return baseClasses.filter(Boolean).join(" ");
    }, [inline, currentSize.container, currentColor, className]);

    // Spinner variant renderers
    const renderSpinner = () => {
      switch (variant) {
        case "dots":
          return (
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`${currentSize.dots} bg-current rounded-full animate-pulse`}
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: "0.8s",
                  }}
                />
              ))}
            </div>
          );

        case "pulse":
          return (
            <div
              className={`${currentSize.container} bg-current rounded-full animate-ping opacity-75`}
            />
          );

        case "bars":
          return (
            <div className="flex items-end space-x-0.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`${currentSize.bars} bg-current animate-pulse`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "1s",
                  }}
                />
              ))}
            </div>
          );

        case "ring":
          return (
            <div className={`${currentSize.container} relative`}>
              <div className="absolute inset-0 rounded-full border-2 border-current opacity-20" />
              <div className="absolute inset-0 rounded-full border-2 border-current border-t-transparent animate-spin" />
            </div>
          );

        case "dual-ring":
          return (
            <div className={`${currentSize.container} relative`}>
              <div className="absolute inset-0 rounded-full border-2 border-current opacity-20" />
              <div
                className="absolute inset-1 rounded-full border-2 border-current border-b-transparent animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.2s",
                }}
              />
              <div className="absolute inset-0 rounded-full border-2 border-current border-t-transparent animate-spin" />
            </div>
          );

        default: // "default"
          return (
            <svg
              className={`${currentSize.container} animate-spin`}
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth={currentSize.stroke}
                className="opacity-25"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                className="opacity-75"
              />
            </svg>
          );
      }
    };

    return (
      <div
        ref={ref}
        className={containerClasses}
        role="status"
        aria-live="polite"
        aria-label={srText}
        data-testid={testId}
        {...props}
      >
        {renderSpinner()}

        {/* Screen reader only text */}
        <span className="sr-only">{srText}</span>
      </div>
    );
  }
);

Spinner.displayName = "Spinner";

// Export with additional utility components for common use cases
export default Spinner;

// Preset components for common SaaS scenarios
export const ButtonSpinner = (props) => (
  <Spinner size="sm" variant="default" inline {...props} />
);

export const PageSpinner = (props) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Spinner size="lg" variant="default" {...props} />
  </div>
);

export const InlineSpinner = (props) => (
  <Spinner size="xs" variant="dots" inline {...props} />
);

export const LoadingOverlay = ({ children, loading, ...props }) => (
  <div className="relative">
    {children}
    {loading && (
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        <Spinner size="lg" {...props} />
      </div>
    )}
  </div>
);
