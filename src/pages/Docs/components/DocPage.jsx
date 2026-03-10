import React, { useLayoutEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
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

export default function DocPage({
  title,
  intro,
  steps,
  note,
  prev,
  next,
  onNavigate,
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
  }, [title]);

  return (
    <div ref={ref} className="flex flex-col gap-10">
      {/* Header */}
      <div>
        <h2 className="font-grotesk text-2xl sm:text-3xl font-bold text-textLight dark:text-textDark tracking-tight leading-snug mb-3">
          {title}
        </h2>
        <p className="font-inter text-base text-muted leading-relaxed">
          {intro}
        </p>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-7">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-5">
            <span className="font-grotesk text-xs text-brand font-medium w-6 flex-shrink-0 pt-1">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-grotesk text-sm font-semibold text-textLight dark:text-textDark">
                {step.label}
              </p>
              <p className="font-inter text-base text-muted leading-relaxed">
                <Bold text={step.body} />
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      {note && (
        <div className="border-l-2 border-brand/30 pl-4">
          <p className="font-inter text-sm text-muted leading-relaxed">
            {note}
          </p>
        </div>
      )}

      {/* Prev / Next */}
      <div className="h-px w-full bg-gray-100 dark:bg-white/[0.06]" />
      <div className="flex items-center justify-between">
        {prev ? (
          <button
            onClick={() => onNavigate(prev)}
            className="inline-flex items-center gap-2 font-inter text-sm text-muted hover:text-brand transition-colors duration-150"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </button>
        ) : (
          <span />
        )}

        {next ? (
          <button
            onClick={() => onNavigate(next)}
            className="inline-flex items-center gap-2 font-inter text-sm text-muted hover:text-brand transition-colors duration-150"
          >
            Next
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <a
            href="/features"
            className="inline-flex items-center gap-1.5 font-inter text-sm text-muted hover:text-brand transition-colors duration-150"
          >
            Features overview
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
