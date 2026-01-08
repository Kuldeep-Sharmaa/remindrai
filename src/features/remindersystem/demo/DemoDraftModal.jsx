// src/demo/DemoDraftModal.jsx
import React from "react";
import toast from "react-hot-toast";

export default function DemoDraftModal() {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(null);

  React.useEffect(() => {
    function handler(e) {
      const payload = e?.detail || null;
      if (!payload) return;
      setDraft(payload.draft || null);
      // small micro-delay so modal anim feels natural when fired from toast
      setTimeout(() => setOpen(true), 80);
    }
    window.addEventListener("remindr:openDraft", handler);
    return () => window.removeEventListener("remindr:openDraft", handler);
  }, []);

  if (!draft) return null;

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="AI Draft Modal"
          tabIndex={-1}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 150000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(6px)",
            background: "rgba(2,6,23,0.45)",
            padding: 20,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(920px, calc(100% - 64px))",
              maxHeight: "86vh",
              overflow: "auto",
              borderRadius: 14,
              background: "linear-gradient(180deg,#071124,#06121a)",
              color: "#fff",
              boxShadow: "0 30px 80px rgba(2,6,23,0.7)",
              border: "1px solid rgba(255,255,255,0.04)",
              padding: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(90deg,#0ea5a4,#0891b2)",
                  }}
                >
                  <span style={{ fontSize: 20 }}>🤖</span>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>AI Draft</div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.7)",
                      marginTop: 4,
                    }}
                  >
                    {draft?.meta?.role} • {draft?.meta?.tone} •{" "}
                    {draft?.meta?.platform}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(draft.fullPost);
                      toast.success("Draft copied to clipboard");
                    } catch {
                      toast.error("Unable to copy");
                    }
                  }}
                  style={{
                    background: "linear-gradient(90deg,#0ea5a4,#0891b2)",
                    color: "#061123",
                    fontWeight: 800,
                    border: "none",
                    padding: "10px 14px",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  Copy Draft
                </button>

                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#fff",
                    padding: "10px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 15,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                color: "rgba(255,255,255,0.95)",
              }}
            >
              {draft.fullPost}
            </div>

            {draft.promptText ? (
              <div
                style={{
                  marginTop: 18,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                <strong style={{ fontWeight: 700 }}>Prompt:</strong>{" "}
                <span
                  style={{ fontWeight: 600 }}
                >{`"${draft.promptText}"`}</span>
              </div>
            ) : null}

            <div
              style={{
                marginTop: 14,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: "rgba(255,255,255,0.58)",
              }}
            >
              <div>
                {draft.meta.role} • {draft.meta.tone} • {draft.meta.platform}
              </div>
              <div>
                {draft.meta.freqLabel} • {draft.meta.scheduledAt}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
