import { useEffect, useState } from "react";

const STAGES = [
  {
    num: "01",
    title: "Pattern Detection",
    sub: "Claude 3.5 Sonnet",
    desc: "Analyzing business processes — identifying repetitive, manual-decision, and data-heavy patterns",
    color: "#a3e635",
    duration: 12000,
  },
  {
    num: "02",
    title: "Semantic Validation",
    sub: "Amazon Titan Embeddings",
    desc: "Embedding process descriptions into 1536-dim vectors — cosine similarity against AI category corpus",
    color: "#c084fc",
    duration: 8000,
  },
  {
    num: "03",
    title: "Complexity Scoring",
    sub: "Deterministic Python Engine",
    desc: "Scoring each opportunity across 3 axes — data availability, integration dependency, real-time requirements",
    color: "#38bdf8",
    duration: 5000,
  },
  {
    num: "04",
    title: "Report Generation",
    sub: "Claude 3.5 Sonnet",
    desc: "Synthesizing executive summary, 3-phase roadmap, and per-opportunity AWS recommendations",
    color: "#fb923c",
    duration: 12000,
  },
];

export default function ProcessingScreen({ assessmentId }) {
  const [activeStage, setActiveStage] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const d = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 500);
    return () => clearInterval(d);
  }, []);

  useEffect(() => {
    let timeout;
    const advance = (idx) => {
      if (idx >= STAGES.length) return;
      timeout = setTimeout(() => {
        setCompletedStages(p => [...p, idx]);
        setActiveStage(idx + 1);
        advance(idx + 1);
      }, STAGES[idx].duration);
    };
    advance(0);
    return () => clearTimeout(timeout);
  }, []);

  const currentStage = STAGES[Math.min(activeStage, STAGES.length - 1)];

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "52px" }}>
        <div style={{ position: "relative", display: "inline-block", marginBottom: "24px" }}>
          {/* Pulsing rings */}
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: `${60 + i * 28}px`, height: `${60 + i * 28}px`,
              borderRadius: "50%",
              border: `1px solid rgba(163, 230, 53, ${0.15 - i * 0.04})`,
              animation: `pulse ${1.5 + i * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
          <div style={{
            width: "60px", height: "60px", borderRadius: "50%",
            background: "rgba(163,230,53,0.1)",
            border: "1.5px solid rgba(163,230,53,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px", position: "relative", zIndex: 1
          }}>
            ⚡
          </div>
        </div>

        <h2 style={{
          fontFamily: "'Syne'", fontSize: "24px", fontWeight: 800,
          color: "#fff", letterSpacing: "-0.02em", marginBottom: "8px"
        }}>
          Pipeline Running{dots}
        </h2>
        <div style={{ fontFamily: "'DM Mono'", fontSize: "10px", color: "#4b5563", letterSpacing: "0.1em" }}>
          {assessmentId?.slice(0, 8).toUpperCase()} · {elapsed}s elapsed
        </div>
      </div>

      {/* Stage list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
        {STAGES.map((stage, i) => {
          const isDone = completedStages.includes(i);
          const isActive = activeStage === i;
          const isPending = i > activeStage;

          return (
            <div key={i} style={{
              display: "flex", gap: "16px", alignItems: "flex-start",
              padding: "18px 20px",
              background: isActive ? "rgba(255,255,255,0.04)" : isDone ? "rgba(163,230,53,0.03)" : "transparent",
              border: `1px solid ${isActive ? "rgba(255,255,255,0.1)" : isDone ? "rgba(163,230,53,0.12)" : "rgba(255,255,255,0.04)"}`,
              borderRadius: "12px",
              transition: "all 0.4s ease",
              opacity: isPending ? 0.4 : 1,
            }}>
              {/* Stage number / check */}
              <div style={{
                width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
                background: isDone ? "rgba(163,230,53,0.15)" : isActive ? `rgba(${hexToRgb(stage.color)}, 0.12)` : "rgba(255,255,255,0.04)",
                border: `1px solid ${isDone ? "rgba(163,230,53,0.3)" : isActive ? `rgba(${hexToRgb(stage.color)}, 0.4)` : "rgba(255,255,255,0.08)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Mono'", fontSize: "11px",
                color: isDone ? "#a3e635" : isActive ? stage.color : "#374151",
                transition: "all 0.3s"
              }}>
                {isDone ? "✓" : stage.num}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <span style={{
                    fontFamily: "'Syne'", fontSize: "14px", fontWeight: 700,
                    color: isDone ? "#a3e635" : isActive ? "#fff" : "#374151",
                    transition: "color 0.3s"
                  }}>
                    {stage.title}
                  </span>
                  {isActive && (
                    <span style={{
                      fontFamily: "'DM Mono'", fontSize: "9px", letterSpacing: "0.1em",
                      color: stage.color, border: `1px solid ${stage.color}40`,
                      padding: "2px 8px", borderRadius: "100px",
                      animation: "blink 1.2s ease-in-out infinite"
                    }}>
                      RUNNING
                    </span>
                  )}
                </div>
                <div style={{
                  fontFamily: "'DM Mono'", fontSize: "10px",
                  color: isActive ? "#6b7280" : "#374151", marginBottom: isActive ? "8px" : 0
                }}>
                  {stage.sub}
                </div>
                {isActive && (
                  <div style={{
                    fontFamily: "'DM Mono'", fontSize: "10px", color: "#4b5563",
                    lineHeight: 1.6, animation: "fadeIn 0.4s ease"
                  }}>
                    {stage.desc}
                  </div>
                )}
              </div>

              {/* Progress bar for active stage */}
              {isActive && (
                <div style={{ width: "48px", flexShrink: 0 }}>
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="19" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                    <circle
                      cx="24" cy="24" r="19" fill="none"
                      stroke={stage.color} strokeWidth="2"
                      strokeDasharray={`${2 * Math.PI * 19}`}
                      strokeDashoffset={`${2 * Math.PI * 19 * 0.25}`}
                      strokeLinecap="round"
                      style={{ transform: "rotate(-90deg)", transformOrigin: "24px 24px", animation: `spin ${stage.duration}ms linear forwards` }}
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom message */}
      <div style={{
        textAlign: "center",
        fontFamily: "'Instrument Serif'", fontSize: "16px",
        color: "#374151", fontStyle: "italic",
        lineHeight: 1.7
      }}>
        "Analyzing your business intelligence profile<br/>and synthesizing your AI roadmap..."
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.6; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { stroke-dashoffset: ${2 * Math.PI * 19}; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
