import { useState } from "react";

const COMPLEXITY_COLORS = { Low: "#10b981", Medium: "#f59e0b", High: "#ef4444" };

export default function OpportunityCard({ opp }) {
  const [expanded, setExpanded] = useState(false);
  const complexityColor = COMPLEXITY_COLORS[opp.complexity_level] || "#64748b";

  return (
    <div style={{
      background: "#111318", border: "1px solid #1e2330", borderRadius: 10,
      padding: 20, cursor: "pointer", transition: "border-color 0.2s"
    }} onClick={() => setExpanded(!expanded)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: "1rem" }}>{opp.process_name}</span>
            <span style={{
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)",
              color: "#c4b5fd", fontSize: "0.7rem", padding: "2px 8px", borderRadius: 4,
              fontFamily: "monospace"
            }}>
              {opp.validated_category || opp.use_case_category}
            </span>
            <span style={{
              background: `${complexityColor}15`, border: `1px solid ${complexityColor}40`,
              color: complexityColor, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 4
            }}>
              {opp.complexity_level || "—"} Complexity
            </span>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>{opp.ai_technique}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f59e0b" }}>
            {opp.impact_score?.toFixed(1)}
          </div>
          <div style={{ color: "#64748b", fontSize: "0.65rem", fontFamily: "monospace" }}>IMPACT</div>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1e2330" }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#64748b", fontSize: "0.7rem", fontFamily: "monospace", marginBottom: 4 }}>BUSINESS IMPACT</div>
            <p style={{ color: "#e2e8f0", fontSize: "0.85rem", margin: 0 }}>{opp.business_impact}</p>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#64748b", fontSize: "0.7rem", fontFamily: "monospace", marginBottom: 4 }}>RATIONALE</div>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>{opp.rationale}</p>
          </div>
          {opp.similarity_score && (
            <div style={{ display: "flex", gap: 16 }}>
              <div>
                <div style={{ color: "#64748b", fontSize: "0.7rem", fontFamily: "monospace", marginBottom: 2 }}>TITAN SIMILARITY</div>
                <div style={{ color: "#0ea5e9", fontFamily: "monospace", fontSize: "0.85rem" }}>
                  {(opp.similarity_score * 100).toFixed(1)}%
                </div>
              </div>
              {opp.complexity_total_score && (
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.7rem", fontFamily: "monospace", marginBottom: 2 }}>COMPLEXITY SCORE</div>
                  <div style={{ color: complexityColor, fontFamily: "monospace", fontSize: "0.85rem" }}>
                    {opp.complexity_total_score}/9
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div style={{ color: "#475569", fontSize: "0.7rem", marginTop: 8, textAlign: "right" }}>
        {expanded ? "▲ collapse" : "▼ expand"}
      </div>
    </div>
  );
}
