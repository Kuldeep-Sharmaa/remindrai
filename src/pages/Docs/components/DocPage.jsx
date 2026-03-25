import React, { useLayoutEffect, useRef } from "react";
import { ArrowUpRight, Info } from "lucide-react";
import gsap from "gsap";

// Renders **bold** markdown inline
const Bold = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong
            key={i}
            className="text-textLight dark:text-textDark font-medium"
          >
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};

export default function DocPage({ title, intro, steps, note }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "power2.out" },
    );
  }, [title]);

  return (
    <div ref={ref} className="flex flex-col gap-8 sm:gap-10">
      {/* Header */}
      <div>
        <h2 className="font-grotesk text-xl sm:text-2xl lg:text-3xl font-bold text-textLight dark:text-textDark tracking-tight leading-snug mb-2 sm:mb-3">
          {title}
        </h2>
        <p className="font-inter text-sm sm:text-base text-textLight/80 dark:text-textDark/80  leading-relaxed">
          {intro}
        </p>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-6 sm:gap-7">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4 sm:gap-5">
            <span className="font-grotesk text-xs text-brand font-medium w-5 sm:w-6 flex-shrink-0 pt-0.5 sm:pt-1">
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="flex flex-col gap-2">
              {/* Label */}
              {step.label && (
                <h3 className="font-grotesk text-sm sm:text-base font-semibold text-textLight dark:text-textDark">
                  {step.label}
                </h3>
              )}

              {/* Body */}
              <p className="font-inter text-sm sm:text-base text-textLight/80 dark:text-textDark/80 leading-relaxed">
                <Bold text={step.body} />
              </p>

              {/* Optional label above points */}
              {step.pointsLabel && (
                <p className="font-inter text-sm sm:text-base text-textLight/80 dark:text-textDark/80 leading-relaxed">
                  {step.pointsLabel}
                </p>
              )}

              {/* Points */}
              {step.points && (
                <ul className="flex flex-col gap-1 pl-4">
                  {step.points.map((point, idx) => (
                    <li
                      key={idx}
                      className="text-sm sm:text-base text-textLight/80 dark:text-textDark/80 leading-relaxed"
                    >
                      • <span className="font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Footer */}
              {step.footer && (
                <p className="text-sm sm:text-base text-textLight/70 dark:text-textDark/70 leading-relaxed">
                  {step.footer}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      {note && (
        <div className="bg-bgImpact/10 dark:bg-bgImpact border border-border dark:border-white/[0.06] rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info
              className="w-4 h-4 text-brand flex-shrink-0 mt-0.5"
              strokeWidth={1.75}
            />
            <p className="font-inter text-sm text-brand leading-relaxed">
              {note}
            </p>
          </div>
        </div>
      )}

      {/* Bottom */}
      <div className="border-t border-gray-100 dark:border-white/[0.06] pt-6">
        <a
          href="/contact"
          className="inline-flex items-center gap-1.5 font-inter text-xs text-muted hover:text-brand transition-colors duration-150"
        >
          Something missing or unclear? Contact us.
          <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
