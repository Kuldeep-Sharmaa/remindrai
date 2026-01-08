// src/components/ThemeToggleButton.jsx - Production-ready theme toggle with bulletproof reliability
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useTheme } from "../hooks/useTheme";

// Enhanced component configuration
const TOGGLE_CONFIG = {
  DEBOUNCE_DELAY_MS: 50,
  INTERACTION_RESET_DELAY_MS: 1000,
  ANIMATION_DURATION_MS: 300,
  ACCESSIBILITY_DELAY_MS: 100,
  KEYBOARD_REPEAT_DELAY_MS: 200,
  FOCUS_VISIBLE_TIMEOUT_MS: 150,
  HAPTIC_FEEDBACK_DURATION: 10,
};

// Available sizes and variants for better customization
const COMPONENT_VARIANTS = {
  sizes: {
    xs: { width: "32px", height: "18px", thumb: "14px" },
    sm: { width: "40px", height: "22px", thumb: "18px" },
    default: { width: "48px", height: "26px", thumb: "22px" },
    lg: { width: "56px", height: "30px", thumb: "26px" },
    xl: { width: "64px", height: "34px", thumb: "30px" },
  },
  variants: {
    default: "rounded-full",
    square: "rounded-md",
    pill: "rounded-full",
    minimal: "rounded-sm",
  },
};

const ThemeToggleButton = forwardRef(
  (
    {
      size = "default",
      variant = "default",
      showLabel = false,
      showIcon = true,
      showAutoIndicator = true,
      disabled = false,
      className = "",
      style = {},
      onThemeChange = null,
      onToggle = null,
      onError = null,
      ariaLabel = null,
      ariaLabelledBy = null,
      ariaDescribedBy = null,
      tabIndex = 0,
      autoFocus = false,
      testId = "theme-toggle",
      trackAnalytics = true,
      enableHaptics = true,
      enableSounds = false,
      customIcons = null,
      ...props
    },
    ref
  ) => {
    const {
      theme,
      currentEffectiveTheme,
      systemTheme,
      isDarkMode,
      isAutoMode,
      isInitialized,
      isTransitioning,
      toggleTheme,
      initializationError,
      browserInfo,
    } = useTheme();

    // Enhanced component state
    const [isToggling, setIsToggling] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [focusVisible, setFocusVisible] = useState(false);
    const [keyboardActive, setKeyboardActive] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [rippleEffect, setRippleEffect] = useState(null);

    // Enhanced refs for precise control
    const toggleRef = useRef(null);
    const lastToggleTime = useRef(0);
    const toggleTimeoutRef = useRef(null);
    const interactionTimeoutRef = useRef(null);
    const focusTimeoutRef = useRef(null);
    const keyboardInteraction = useRef(false);
    const rippleTimeoutRef = useRef(null);
    const performanceObserver = useRef(null);

    // Expose component methods via ref
    useImperativeHandle(
      ref,
      () => ({
        focus: () => toggleRef.current?.focus(),
        blur: () => toggleRef.current?.blur(),
        toggle: handleToggle,
        getState: () => ({
          theme,
          effectiveTheme: currentEffectiveTheme,
          isToggling,
          isInitialized,
          hasInteracted,
        }),
      }),
      [theme, currentEffectiveTheme, isToggling, isInitialized, hasInteracted]
    );

    // Performance monitoring
    useEffect(() => {
      if (typeof window !== "undefined" && window.PerformanceObserver) {
        try {
          performanceObserver.current = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (entry.name.includes("theme-toggle") && entry.duration > 16) {
                console.warn(
                  `Theme toggle performance issue: ${entry.duration}ms`
                );
              }
            });
          });

          performanceObserver.current.observe({ entryTypes: ["measure"] });
        } catch (error) {
          console.warn("Performance monitoring setup failed:", error);
        }
      }

      return () => {
        if (performanceObserver.current) {
          performanceObserver.current.disconnect();
        }
      };
    }, []);

    // Cleanup timeouts on unmount
    useEffect(() => {
      return () => {
        [
          toggleTimeoutRef,
          interactionTimeoutRef,
          focusTimeoutRef,
          rippleTimeoutRef,
        ].forEach((ref) => {
          if (ref.current) clearTimeout(ref.current);
        });
      };
    }, []);

    // Enhanced checked state with proper system theme integration
    const isChecked = useMemo(() => {
      if (!isInitialized) return false;
      return isDarkMode;
    }, [isDarkMode, isInitialized]);

    // Dynamic sizing based on component variant
    const componentSize = useMemo(() => {
      return COMPONENT_VARIANTS.sizes[size] || COMPONENT_VARIANTS.sizes.default;
    }, [size]);

    // Comprehensive accessibility label with context
    const getAriaLabel = useCallback(() => {
      if (ariaLabel) return ariaLabel;

      if (!isInitialized) return "Theme toggle loading...";
      if (isToggling || isTransitioning) return "Switching theme...";
      if (initializationError) return "Theme toggle error, click to retry";

      const currentMode = isDarkMode ? "dark" : "light";
      const nextMode = isDarkMode ? "light" : "dark";
      const modeSource = isAutoMode ? " (following system)" : "";

      return `Current theme: ${currentMode}${modeSource}. Click to switch to ${nextMode} theme.`;
    }, [
      ariaLabel,
      isDarkMode,
      isAutoMode,
      isInitialized,
      isToggling,
      isTransitioning,
      initializationError,
    ]);

    // Enhanced haptic feedback with device detection
    const triggerHapticFeedback = useCallback(() => {
      if (!enableHaptics) return;

      try {
        // Modern Vibration API
        if (navigator.vibrate) {
          navigator.vibrate(TOGGLE_CONFIG.HAPTIC_FEEDBACK_DURATION);
        }

        // iOS Haptic Feedback (if available)
        if (
          window.DeviceMotionEvent &&
          typeof window.DeviceMotionEvent.requestPermission === "function"
        ) {
          // iOS 13+ haptic feedback would go here
          // This is a placeholder for actual iOS haptic implementation
        }
      } catch (error) {
        console.warn("Haptic feedback failed:", error);
      }
    }, [enableHaptics]);

    // Enhanced sound feedback
    const triggerSoundFeedback = useCallback(() => {
      if (!enableSounds) return;

      try {
        // Create subtle click sound using Web Audio API
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          400,
          audioContext.currentTime + 0.1
        );

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.1
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (error) {
        console.warn("Sound feedback failed:", error);
      }
    }, [enableSounds]);

    // Production-grade toggle function with comprehensive error handling
    const handleToggle = useCallback(async () => {
      const startTime = performance.now();
      performance.mark("theme-toggle-start");

      const now = Date.now();

      // Prevent rapid-fire interactions
      if (now - lastToggleTime.current < TOGGLE_CONFIG.DEBOUNCE_DELAY_MS) {
        return false;
      }

      // Prevent multiple simultaneous toggles
      if (isToggling || isTransitioning || disabled || !isInitialized) {
        if (onError) {
          onError({
            type: "toggle_blocked",
            reason: isToggling
              ? "already_toggling"
              : isTransitioning
              ? "transitioning"
              : disabled
              ? "disabled"
              : "not_initialized",
            timestamp: now,
          });
        }
        return false;
      }

      // Clear any pending operations
      if (toggleTimeoutRef.current) {
        clearTimeout(toggleTimeoutRef.current);
      }

      try {
        lastToggleTime.current = now;
        setIsToggling(true);
        setHasInteracted(true);

        // Trigger feedback before theme change for immediate response
        triggerHapticFeedback();
        triggerSoundFeedback();

        // Track analytics if enabled
        if (trackAnalytics && typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "theme_toggle_attempt", {
            current_theme: theme,
            effective_theme: currentEffectiveTheme,
            is_auto_mode: isAutoMode,
            interaction_type: keyboardInteraction.current
              ? "keyboard"
              : "mouse",
          });
        }

        // Attempt theme toggle
        const success = toggleTheme();

        if (success) {
          const newEffectiveTheme = isAutoMode
            ? currentEffectiveTheme === "dark"
              ? "light"
              : "dark"
            : theme === "dark"
            ? "light"
            : "dark";

          // Notify parent components
          const changeDetails = {
            previousTheme: theme,
            newTheme: newEffectiveTheme,
            effectiveTheme: newEffectiveTheme,
            isAutoMode,
            timestamp: now,
            interactionType: keyboardInteraction.current ? "keyboard" : "mouse",
          };

          if (onThemeChange) {
            onThemeChange(changeDetails);
          }

          if (onToggle) {
            onToggle(changeDetails);
          }

          // Track successful analytics
          if (trackAnalytics && typeof window !== "undefined" && window.gtag) {
            window.gtag("event", "theme_toggle_success", {
              ...changeDetails,
              duration_ms: performance.now() - startTime,
            });
          }

          // Reset toggling state after animation
          toggleTimeoutRef.current = setTimeout(() => {
            setIsToggling(false);
            performance.mark("theme-toggle-end");
            performance.measure(
              "theme-toggle-duration",
              "theme-toggle-start",
              "theme-toggle-end"
            );
          }, TOGGLE_CONFIG.ANIMATION_DURATION_MS);

          return true;
        } else {
          setIsToggling(false);
          if (onError) {
            onError({
              type: "toggle_failed",
              reason: "theme_hook_returned_false",
              timestamp: now,
            });
          }
          return false;
        }
      } catch (error) {
        console.error("Theme toggle failed:", error);
        setIsToggling(false);

        if (onError) {
          onError({
            type: "toggle_error",
            error: error.message,
            timestamp: now,
          });
        }

        // Track error analytics
        if (trackAnalytics && typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "theme_toggle_error", {
            error_message: error.message,
            current_theme: theme,
          });
        }

        return false;
      }
    }, [
      theme,
      currentEffectiveTheme,
      isAutoMode,
      toggleTheme,
      isToggling,
      isTransitioning,
      disabled,
      isInitialized,
      onThemeChange,
      onToggle,
      onError,
      trackAnalytics,
      triggerHapticFeedback,
      triggerSoundFeedback,
    ]);

    // Enhanced keyboard interaction handler
    const handleKeyDown = useCallback(
      (event) => {
        if (!isInitialized || disabled) return;

        // Track that this is a keyboard interaction
        keyboardInteraction.current = true;
        setKeyboardActive(true);

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          setFocusVisible(true);

          // Add a small delay to prevent double-triggers from keyboard repeat
          setTimeout(() => {
            handleToggle();
          }, TOGGLE_CONFIG.KEYBOARD_REPEAT_DELAY_MS);
        } else if (event.key === "Escape") {
          event.currentTarget.blur();
          setFocusVisible(false);
          setKeyboardActive(false);
        }
      },
      [handleToggle, isInitialized, disabled]
    );

    // Enhanced mouse interaction handler with ripple effect
    const handleClick = useCallback(
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        // Track mouse position for ripple effect
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setMousePosition({ x, y });

        // Create ripple effect
        const rippleId = Date.now();
        setRippleEffect(rippleId);

        if (rippleTimeoutRef.current) {
          clearTimeout(rippleTimeoutRef.current);
        }

        rippleTimeoutRef.current = setTimeout(() => {
          setRippleEffect(null);
        }, TOGGLE_CONFIG.ANIMATION_DURATION_MS);

        // Track that this is a mouse interaction
        keyboardInteraction.current = false;
        setFocusVisible(false);
        setKeyboardActive(false);

        if (isInitialized && !disabled) {
          handleToggle();
        }
      },
      [handleToggle, isInitialized, disabled]
    );

    // Enhanced focus management for accessibility
    const handleFocus = useCallback(() => {
      if (keyboardInteraction.current || keyboardActive) {
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current);
        }

        focusTimeoutRef.current = setTimeout(() => {
          setFocusVisible(true);
        }, TOGGLE_CONFIG.FOCUS_VISIBLE_TIMEOUT_MS);
      }
    }, [keyboardActive]);

    const handleBlur = useCallback(() => {
      setFocusVisible(false);
      setKeyboardActive(false);
      keyboardInteraction.current = false;

      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    }, []);

    // Auto-focus handling
    useEffect(() => {
      if (autoFocus && isInitialized && toggleRef.current) {
        toggleRef.current.focus();
      }
    }, [autoFocus, isInitialized]);

    // Reset interaction state after delay
    useEffect(() => {
      if (hasInteracted && !isToggling) {
        if (interactionTimeoutRef.current) {
          clearTimeout(interactionTimeoutRef.current);
        }

        interactionTimeoutRef.current = setTimeout(() => {
          setHasInteracted(false);
        }, TOGGLE_CONFIG.INTERACTION_RESET_DELAY_MS);
      }
    }, [hasInteracted, isToggling]);

    // Dynamic class generation with enhanced states
    const containerClasses = useMemo(() => {
      const classes = [
        "theme-toggle-container",
        `theme-toggle-${size}`,
        `theme-toggle-${variant}`,
        COMPONENT_VARIANTS.variants[variant] ||
          COMPONENT_VARIANTS.variants.default,
      ];

      if (className) classes.push(className);
      if (!isInitialized) classes.push("theme-toggle-loading");
      if (isToggling) classes.push("theme-toggle-active");
      if (isTransitioning) classes.push("theme-toggle-transitioning");
      if (hasInteracted) classes.push("theme-toggle-interacted");
      if (disabled) classes.push("theme-toggle-disabled");
      if (focusVisible) classes.push("theme-toggle-focus-visible");
      if (keyboardActive) classes.push("theme-toggle-keyboard-active");
      if (isAutoMode) classes.push("theme-toggle-auto-mode");
      if (initializationError) classes.push("theme-toggle-error");
      if (browserInfo.isEdge) classes.push("theme-toggle-edge");

      return classes.join(" ");
    }, [
      size,
      variant,
      className,
      isInitialized,
      isToggling,
      isTransitioning,
      hasInteracted,
      disabled,
      focusVisible,
      keyboardActive,
      isAutoMode,
      initializationError,
      browserInfo.isEdge,
    ]);

    const switchClasses = useMemo(() => {
      const classes = ["theme-switch"];

      if (isChecked) classes.push("theme-switch-checked");
      if (!isInitialized) classes.push("theme-switch-disabled");
      if (isToggling || isTransitioning)
        classes.push("theme-switch-transitioning");
      if (rippleEffect) classes.push("theme-switch-ripple");

      return classes.join(" ");
    }, [isChecked, isInitialized, isToggling, isTransitioning, rippleEffect]);

    // Theme indicator text with enhanced information
    const getThemeIndicator = useCallback(() => {
      if (!showLabel) return null;

      if (!isInitialized) return "Loading...";
      if (initializationError) return "Error";

      const mode = isDarkMode ? "Dark" : "Light";
      const source = isAutoMode ? " (Auto)" : "";

      return `${mode}${source}`;
    }, [showLabel, isInitialized, isDarkMode, isAutoMode, initializationError]);

    // Custom icon support
    const getThemeIcons = useCallback(() => {
      if (customIcons) {
        return {
          light: customIcons.light || "☀️",
          dark: customIcons.dark || "🌙",
        };
      }

      return {
        light: "☀️",
        dark: "🌙",
      };
    }, [customIcons]);

    const icons = getThemeIcons();

    // Render loading state with enhanced skeleton
    if (!isInitialized) {
      return (
        <div
          className={containerClasses}
          style={{ ...style, ...componentSize }}
          data-testid={`${testId}-loading`}
        >
          <div
            className="theme-toggle-skeleton"
            aria-label="Loading theme toggle"
            role="status"
          >
            <div className="skeleton-switch">
              <div className="skeleton-slider">
                <div className="skeleton-circle"></div>
              </div>
            </div>
            {showLabel && (
              <div className="skeleton-label">
                <div className="skeleton-text"></div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Render error state
    if (initializationError) {
      return (
        <div
          className={`${containerClasses} theme-toggle-error-state`}
          style={{ ...style, ...componentSize }}
          data-testid={`${testId}-error`}
        >
          <button
            ref={toggleRef}
            type="button"
            className="theme-switch theme-switch-error"
            aria-label="Theme toggle error, click to retry"
            onClick={handleToggle}
            disabled={disabled}
            {...props}
          >
            <div className="theme-switch-track error">
              <div className="theme-switch-thumb">
                <span className="theme-icon error" aria-hidden="true">
                  ⚠️
                </span>
              </div>
            </div>
          </button>
          {showLabel && (
            <span className="theme-toggle-label error" aria-hidden="true">
              Error
            </span>
          )}
        </div>
      );
    }

    return (
      <div
        className={containerClasses}
        style={{ ...style, ...componentSize }}
        data-testid={testId}
      >
        <button
          ref={toggleRef}
          type="button"
          role="switch"
          className={switchClasses}
          style={{ width: componentSize.width, height: componentSize.height }}
          aria-checked={isChecked}
          aria-label={getAriaLabel()}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-disabled={disabled || isToggling || isTransitioning}
          disabled={disabled}
          tabIndex={tabIndex}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          data-theme-current={currentEffectiveTheme}
          data-theme-preference={theme}
          data-system-theme={systemTheme}
          data-testid={`${testId}-button`}
          {...props}
        >
          {/* Hidden input for form compatibility */}
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => {}} // Controlled by button click
            className="theme-toggle-input"
            tabIndex={-1}
            aria-hidden="true"
            data-testid={`${testId}-input`}
          />

          {/* Switch visual elements */}
          <div className="theme-switch-track">
            <div
              className="theme-switch-thumb"
              style={{
                width: componentSize.thumb,
                height: componentSize.thumb,
                transform: isChecked
                  ? `translateX(${
                      parseInt(componentSize.width) -
                      parseInt(componentSize.thumb) -
                      4
                    }px)`
                  : "translateX(2px)",
              }}
            >
              {/* Theme icons */}
              {showIcon && (
                <>
                  <div
                    className={`theme-icon theme-icon-light ${
                      !isDarkMode ? "active" : ""
                    }`}
                    aria-hidden="true"
                  >
                    {icons.light}
                  </div>
                  <div
                    className={`theme-icon theme-icon-dark ${
                      isDarkMode ? "active" : ""
                    }`}
                    aria-hidden="true"
                  >
                    {icons.dark}
                  </div>
                </>
              )}
            </div>

            {/* Ripple effect */}
            {rippleEffect && (
              <div
                className="theme-switch-ripple"
                style={{
                  left: mousePosition.x - 10,
                  top: mousePosition.y - 10,
                }}
              />
            )}
          </div>

          {/* Auto mode indicator */}
          {isAutoMode && showAutoIndicator && (
            <div
              className="theme-auto-indicator"
              aria-hidden="true"
              title="Following system theme"
              data-testid={`${testId}-auto-indicator`}
            >
              <span className="auto-badge">{icons.auto}</span>
            </div>
          )}

          {/* Loading overlay for transitions */}
          {(isToggling || isTransitioning) && (
            <div className="theme-switch-loading-overlay" aria-hidden="true">
              <div className="loading-spinner"></div>
            </div>
          )}
        </button>

        {/* Optional label */}
        {showLabel && (
          <span
            className="theme-toggle-label"
            aria-hidden="true"
            data-testid={`${testId}-label`}
          >
            {getThemeIndicator()}
          </span>
        )}
      </div>
    );
  }
);

// Set display name for debugging
ThemeToggleButton.displayName = "ThemeToggleButton";

// Production-grade memoization with comprehensive prop comparison
export default React.memo(ThemeToggleButton, (prevProps, nextProps) => {
  const compareKeys = [
    "size",
    "variant",
    "showLabel",
    "showIcon",
    "showAutoIndicator",
    "disabled",
    "className",
    "style",
    "ariaLabel",
    "ariaLabelledBy",
    "ariaDescribedBy",
    "tabIndex",
    "autoFocus",
    "testId",
    "trackAnalytics",
    "enableHaptics",
    "enableSounds",
  ];

  // Compare primitive props
  for (const key of compareKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  // Compare callback functions by reference
  const callbackKeys = ["onThemeChange", "onToggle", "onError"];
  for (const key of callbackKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  // Deep compare custom icons
  if (
    JSON.stringify(prevProps.customIcons) !==
    JSON.stringify(nextProps.customIcons)
  ) {
    return false;
  }

  return true;
});
