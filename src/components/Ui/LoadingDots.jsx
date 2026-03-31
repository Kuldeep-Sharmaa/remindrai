export default function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 ml-2 -translate-y-px">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="rounded-full bg-current"
          style={{
            width: "5px",
            height: "5px",
            animation: "dotThink 2s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes dotThink {
          0%   { opacity: 0.08; transform: scale(0.6);  }
          10%  { opacity: 1;    transform: scale(1.3);  }
          35%  { opacity: 0.08; transform: scale(0.6);  }
          100% { opacity: 0.08; transform: scale(0.6);  }
        }
      `}</style>
    </span>
  );
}
