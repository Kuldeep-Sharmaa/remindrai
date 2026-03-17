import React from "react";
import ContentIdentityCard from "./ContentIdentityCard";
import DraftDeliveryCard from "./DraftDeliveryCard";
import Button from "../Ui/GradientBtn";

function FlowConnector() {
  return (
    <svg
      width="800"
      height="50"
      viewBox="0 0 200 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      <line
        x1="0"
        y1="12"
        x2="84"
        y2="12"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <line
        x1="0"
        y1="12"
        x2="84"
        y2="12"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray="0.45 0.55"
        style={{ animation: "flow 1.6s linear infinite" }}
      />
      <circle
        cx="100"
        cy="12"
        r="8"
        stroke="#2563eb"
        strokeWidth="1"
        fill="rgba(99,168,252,0.05)"
      />
      <circle cx="100" cy="12" r="4" fill="rgba(99,168,252,0.45)" />
      <line
        x1="116"
        y1="12"
        x2="188"
        y2="12"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <line
        x1="116"
        y1="12"
        x2="188"
        y2="12"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray="0.45 0.55"
        style={{ animation: "flow 1.6s linear infinite" }}
      />
      <path
        d="M188 12 L200 6 M188 12 L200 18"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <style>{`
        @keyframes flow {
          0%   { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1; }
        }
      `}</style>
    </svg>
  );
}

function MobileConnector() {
  return (
    <svg
      width="24"
      height="100"
      viewBox="0 0 24 100"
      fill="none"
      style={{ overflow: "visible" }}
    >
      <line
        x1="12"
        y1="0"
        x2="12"
        y2="42"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="0"
        x2="12"
        y2="42"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray="0.25 0.75"
        style={{ animation: "flow 1.6s linear infinite" }}
      />
      <circle
        cx="12"
        cy="50"
        r="6"
        stroke="#2563eb"
        strokeWidth="1"
        fill="rgba(99,168,252,0.05)"
      />
      <circle cx="12" cy="50" r="6" fill="rgba(99,168,252,0.45)" />
      <line
        x1="12"
        y1="58"
        x2="12"
        y2="88"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="58"
        x2="12"
        y2="88"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray="0.25 0.75"
        style={{ animation: "flow 1.6s linear infinite" }}
      />
      <path
        d="M6 88 L12 100 M18 88 L12 100"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center items-center px-5 sm:px-8 lg:px-12 pt-28 sm:pt-32 pb-16 sm:pb-20">
      <div
        className="relative z-10 w-full max-w-4xl mx-auto mb-5 hi"
        style={{ "--d": "0.07s" }}
      >
        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5rem] font-bold font-grotesk text-textLight dark:text-white leading-[1.06] tracking-tight text-center">
          You set it once
          <br />
          <span className="text-brand dark:text-brand-soft">
            The system keeps it going
          </span>
        </h1>
      </div>

      <p
        className="relative z-10 text-sm sm:text-base lg:text-lg text-textLight dark:text-white/60 font-inter max-w-lg mx-auto text-center leading-relaxed mb-8 hi"
        style={{ "--d": "0.14s" }}
      >
        Choose your role, tone, platform, and timing once
        <br />
        Drafts are prepared and ready at the chosen time.
      </p>

      <div
        className="relative z-10 w-full max-w-6xl mx-auto card-fade"
        style={{ "--d": "0.18s" }}
      >
        <div className="hidden sm:flex items-center justify-center">
          <div className="flex-1 min-w-0">
            <ContentIdentityCard />
          </div>

          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{ width: "400px" }}
          >
            <FlowConnector />
          </div>

          <div className="flex-1 min-w-0">
            <DraftDeliveryCard />
          </div>
        </div>

        <div className="sm:hidden flex flex-col items-center">
          <ContentIdentityCard />

          <div className="flex items-center justify-center py-2">
            <MobileConnector />
          </div>

          <DraftDeliveryCard />
        </div>
      </div>

      <div
        className="relative z-10 mt-10 flex flex-col sm:flex-row items-center gap-3 hi"
        style={{ "--d": "0.26s" }}
      >
        <Button to="/auth" showArrow className="text-base sm:text-lg bg-brand">
          Get your first draft
        </Button>
      </div>

      <style>{`
        .hi {
          opacity: 0;
          transform: translateY(14px);
          animation: hup 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: var(--d, 0s);
        }
        @keyframes hup {
          to { opacity: 1; transform: translateY(0); }
        }
        .card-fade {
          opacity: 0;
          animation: cardIn 0.55s ease forwards;
          animation-delay: var(--d, 0s);
        }
        @keyframes cardIn {
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
