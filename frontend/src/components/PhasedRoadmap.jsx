const PHASE_COLORS = {
  1: { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", accent: "#10b981", label: "Quick Wins" },
  2: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", accent: "#f59e0b", label: "Core Transformation" },
  3: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", accent: "#ef4444", label: "Advanced Capabilities" },
};

export default function PhasedRoadmap({ phases = [] }) {
  return (
    <div>
      <div style={{ display: "grid", gap: 16 }}>
        {phases.map((phase) => {
          const colors = PHASE_COLORS[phase.phase] || PHASE_COLORS[1];
          return (
            <div key={phase.phase} style={{
              background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 24
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{
                      background: colors.accent, color: "#000", borderRadius: 4,
                      padding: "2px 8px", fontFamily: "monospace", fontSize: "0.7rem", fontWeight: 700
                    }}>
                      PHASE {phase.phase}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{colors.label}</span>
                  </div>
                  <h3 style={{ color: "#fff", margin: 0, fontSize: "1.1rem" }}>{phase.title}</h3>
                </div>
                <div style={{
                  background: "#0a0c10", border: "1px solid #1e2330", borderRadius: 6,
                  padding: "6px 12px", color: colors.accent, fontFamily: "monospace", fontSize: "0.8rem"
                }}>
                  {phase.duration}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.7rem", fontFamily: "monospace", marginBottom: 8, textTransform: "uppercase" }}>Processes</div>
                  {phase.opportunities?.map((opp) => (
                    <div key={opp} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.accent, flexShrink: 0 }} />
                      <span style={{ color: "#e2e8f0", fontSize: "0.85rem" }}>{opp}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.7rem", fontFamily: "monospace", marginBottom: 8, textTransform: "uppercase" }}>Milestones</div>
                  {phase.milestones?.map((m, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: colors.accent, fontSize: "0.75rem", flexShrink: 0, marginTop: 2 }}>✓</span>
                      <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {phase.aws_services?.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "#64748b", fontSize: "0.7rem", fontFamily: "monospace", marginBottom: 8, textTransform: "uppercase" }}>AWS Services</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {phase.aws_services.map((svc) => (
                      <span key={svc} style={{
                        background: "#0a0c10", border: "1px solid #1e2330", borderRadius: 4,
                        padding: "4px 10px", color: "#94a3b8", fontSize: "0.75rem", fontFamily: "monospace"
                      }}>
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
