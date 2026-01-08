// ============================================================================
// src/features/remindersystem/demo/useDemoTriggerGlobal.jsx
// ----------------------------------------------------------------------------
// Compact notification + demo polish for RemindrAI
// - Demo-safe: no backend writes (localStorage only)
// - Natural jitter, short generation latency, typing reveal for preview
// - Compact "assistant-style" notification (View Draft / Copy Text)
// - Emits window CustomEvent("remindr:openDraft", { detail: { draft, reminderId } })
// ----------------------------------------------------------------------------

import React from "react";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { DateTime } from "luxon";
import { FiMessageSquare, FiCopy, FiExternalLink } from "react-icons/fi";
import { useAuthContext } from "../../../context/AuthContext";
import { buildDemoAiDraft } from "./demoAiGenerator";

const POLL_MS = 4000;
const TRIGGER_WINDOW_SEC = 30;
// Narrow card so the toast reads like a notification rather than a panel
const MAX_CARD_WIDTH = 520;

/* Safe localStorage helpers */
const lsGet = (k) => {
  try {
    return localStorage.getItem(k);
  } catch (e) {
    return null;
  }
};
const lsSet = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch (e) {
    // ignore
  }
};

function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Default export hook
 * Use as: import useDemoTriggerGlobal from '.../useDemoTriggerGlobal'
 */
export default function useDemoTriggerGlobal() {
  const { user, reminders } = useAuthContext();
  const triggeredRef = useRef(new Set());
  const pollingRef = useRef(null);
  const lastCheckRef = useRef(0);

  useEffect(() => {
    // Only run when user is signed in and we have reminders loaded
    if (!user?.uid || !Array.isArray(reminders) || reminders.length === 0)
      return;

    // Initialize in-memory triggered set from localStorage to avoid repeat triggers across reload
    try {
      for (const r of reminders) {
        const key = `demoTriggered_${user.uid}_${r.id}`;
        if (lsGet(key)) triggeredRef.current.add(r.id);
      }
    } catch (e) {
      // ignore localStorage errors
    }

    const checkAndTriggerOnce = async () => {
      // throttle checks to avoid excessive runs if component re-renders rapidly
      const nowTs = Date.now();
      if (nowTs - lastCheckRef.current < POLL_MS - 500) return;
      lastCheckRef.current = nowTs;

      let now;
      try {
        now = DateTime.utc();
      } catch (e) {
        return;
      }

      try {
        for (const r of reminders) {
          if (!r || !r.id) continue;
          if (r.enabled === false) continue;
          if (triggeredRef.current.has(r.id)) continue;

          const nextIso =
            r.nextRunAtUTC_iso ||
            (r.nextRunAtUTC instanceof Date
              ? r.nextRunAtUTC.toISOString()
              : r.nextRunAtUTC) ||
            r.nextRunUtc ||
            r.nextRun ||
            null;
          if (!nextIso) continue;

          const nextRun = DateTime.fromISO(nextIso, { zone: "utc" });
          if (!nextRun.isValid) continue;

          const diffSec = now.diff(nextRun, "seconds").seconds;
          if (Math.abs(diffSec) <= TRIGGER_WINDOW_SEC) {
            // mark as triggered to avoid duplicates
            triggeredRef.current.add(r.id);
            lsSet(
              `demoTriggered_${user.uid}_${r.id}`,
              new Date().toISOString()
            );

            const draft = buildDemoAiDraft(r);

            // natural jitter before showing the notification
            const jitter = randBetween(300, 1200);

            setTimeout(() => {
              // DraftToast uses r and draft captured from loop
              function DraftToast({ t }) {
                const [loading, setLoading] = React.useState(true);
                const [visiblePreview, setVisiblePreview] = React.useState("");
                const mountedRef = React.useRef(true);

                React.useEffect(() => {
                  mountedRef.current = true;

                  // Shorter reveal for a one-line preview so it feels snappy
                  const genLatency = randBetween(600, 1100);

                  // Show a warm assistant-line immediately --- then replace with reveal
                  setVisiblePreview("RemindrAI is preparing your post...");

                  const firstLine =
                    (draft.fullPost || "").split("\n")[0] ||
                    draft.fullPost ||
                    "";
                  const previewText =
                    firstLine.length > 200
                      ? firstLine.slice(0, 200) + "…"
                      : firstLine;

                  const revealTimer = setTimeout(() => {
                    if (!mountedRef.current) return;
                    setLoading(false);

                    let idx = 0;
                    const perChar = Math.max(
                      4,
                      Math.floor(420 / Math.max(1, previewText.length))
                    ); // quick reveal
                    const int = setInterval(() => {
                      if (!mountedRef.current) return;
                      idx++;
                      setVisiblePreview(previewText.slice(0, idx));
                      if (idx >= previewText.length) clearInterval(int);
                    }, perChar);
                  }, genLatency);

                  return () => {
                    mountedRef.current = false;
                    clearTimeout(revealTimer);
                  };
                }, [draft.fullPost]);

                const copyFn = async () => {
                  try {
                    await navigator.clipboard.writeText(draft.fullPost);
                    toast.success("Draft copied");
                  } catch {
                    toast.error("Copy failed");
                  }
                };

                const openFn = () => {
                  // dispatch event to open modal with draft (DemoDraftModal listens for this)
                  try {
                    window.dispatchEvent(
                      new CustomEvent("remindr:openDraft", {
                        detail: { draft, reminderId: r.id },
                      })
                    );
                  } catch {
                    // fallback global
                    // eslint-disable-next-line no-underscore-dangle
                    if (window.__remindr_demo_openDraft)
                      window.__remindr_demo_openDraft(draft);
                  }
                  toast.dismiss(t.id);
                };

                const firstLine =
                  (draft.fullPost || "").split("\n")[0] || draft.fullPost || "";
                const fallbackPreview =
                  firstLine.length > 140
                    ? firstLine.slice(0, 137) + "…"
                    : firstLine;

                return (
                  <div
                    role="status"
                    aria-live="polite"
                    aria-label="RemindrAI draft notification"
                    tabIndex={-1}
                    className="demo-toast-root demo-toast-enter"
                    style={{
                      width: "100%",
                      maxWidth: MAX_CARD_WIDTH,
                      boxSizing: "border-box",
                      padding: 0,
                      margin: "8px",
                      outline: "none",
                      borderRadius: 12,
                      background: "linear-gradient(180deg,#071124,#06121a)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.04)",
                      boxShadow:
                        "0 20px 40px rgba(2,6,23,0.6), 0 2px 8px rgba(14,165,164,0.06)",
                      fontFamily:
                        "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto",
                      pointerEvents: "auto",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* compact header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        borderBottom: "1px solid rgba(255,255,255,0.02)",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          display: "grid",
                          placeItems: "center",
                          background: "linear-gradient(90deg,#0ea5a4,#0891b2)",
                          boxShadow: "0 8px 20px rgba(14,165,164,0.06)",
                        }}
                        aria-hidden
                      >
                        <FiMessageSquare size={17} color="#061123" />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>
                          Your draft is ready
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.72)",
                            marginTop: 3,
                          }}
                        >
                          Crafted by your AI content assistant
                        </div>
                      </div>

                      <button
                        onClick={() => toast.dismiss(t.id)}
                        aria-label="Close"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "rgba(255,255,255,0.6)",
                          fontSize: 16,
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* one-line preview + actions */}
                    <div
                      style={{
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          fontSize: 14,
                          color: "rgba(255,255,255,0.95)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {loading
                          ? visiblePreview
                          : visiblePreview || fallbackPreview}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={copyFn}
                          aria-label="Copy draft text"
                          style={{
                            background:
                              "linear-gradient(90deg,#0ea5a4,#0891b2)",
                            color: "#061123",
                            fontWeight: 700,
                            border: "none",
                            padding: "8px 10px",
                            borderRadius: 8,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <FiCopy size={14} />
                          <span style={{ fontSize: 13 }}>Copy Text</span>
                        </button>

                        <button
                          onClick={openFn}
                          aria-label="Open draft modal"
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.04)",
                            color: "rgba(255,255,255,0.92)",
                            padding: "8px 10px",
                            borderRadius: 8,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <FiExternalLink size={14} />
                          <span style={{ fontSize: 13 }}>View Draft</span>
                        </button>
                      </div>
                    </div>

                    {/* small footer */}
                    <div
                      style={{
                        padding: "8px 14px",
                        borderTop: "1px solid rgba(255,255,255,0.02)",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.56)",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        {draft.meta.role} • {draft.meta.tone} •{" "}
                        {draft.meta.platform}
                      </div>
                      <div>
                        {draft.meta.freqLabel} • {draft.meta.scheduledAt}
                      </div>
                    </div>
                  </div>
                );
              }

              // show centered toast (id prevents duplicates)
              toast.custom((t) => <DraftToast t={t} />, {
                id: `demo-ai-draft-${r.id}`,
                // default duration reads like a notification; bump for recording if needed
                duration: 9000,
                position: "top-center",
              });
            }, jitter);
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          // log internal errors once, avoid console spam
          // eslint-disable-next-line no-console
          console.error("Demo trigger internal error:", err);
        }
      }
    };

    // initial run + polling
    checkAndTriggerOnce();
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(checkAndTriggerOnce, POLL_MS);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      triggeredRef.current.clear();
    };
  }, [user?.uid, reminders]);
}
