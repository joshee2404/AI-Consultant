import { useState } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import ChatWindow from "./ChatWindow.jsx";

const TABS = [
  { id: "opportunities", label: "Opportunities", icon: "◈" },
  { id: "matrix", label: "Impact Matrix", icon: "◎" },
  { id: "roadmap", label: "Roadmap", icon: "◷" },
  { id: "techstack", label: "Tech Stack", icon: "⬡" },
  { id: "summary", label: "Executive Summary", icon: "◻" },
];

const COMPLEXITY_COLORS = {
  Low: "#a3e635",
  Medium: "#fb923c",
  High: "#ef4444",
};

export default function ResultsDashboard({ report, onReset }) {
  const [activeTab, setActiveTab] = useState("opportunities");
  const [expandedCard, setExpandedCard] = useState(null);

  const opps = report.opportunity_list || [];
  const matrix = report.impact_matrix || [];
  const roadmap = report.phased_roadmap || [];
  const techStack = report.tech_stack_recommendations || [];

  const quickWins = opps.filter(o => o.complexity_level === "Low").length;
  const highImpact = opps.filter(o => o.impact_score >= 7).length;
  const avgImpact = opps.length ? (opps.reduce((s, o) => s + o.impact_score, 0) / opps.length).toFixed(1) : 0;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>
      {/* Report header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: "36px", flexWrap: "wrap", gap: "16px"
      }}>
        <div>
          <div style={{
            fontFamily: "'DM Mono'", fontSize: "10px", letterSpacing: "0.12em",
            color: "#a3e635", textTransform: "uppercase", marginBottom: "8px",
            display: "flex", alignItems: "center", gap: "8px"
          }}>
            <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#a3e635", animation: "blink 2s infinite" }} />
            Report Complete
          </div>
          <h2 style={{
            fontFamily: "'Syne'", fontSize: "28px", fontWeight: 800,
            color: "#fff", letterSpacing: "-0.02em", marginBottom: "4px"
          }}>
            {report.company_name}
          </h2>
          <p style={{ fontFamily: "'DM Mono'", fontSize: "11px", color: "#4b5563" }}>
            {report.industry} · {opps.length} AI opportunities identified
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <ActionButton onClick={() => exportJSON(report)}>Export JSON</ActionButton>
          <ActionButton onClick={onReset} accent>New Assessment</ActionButton>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px", marginBottom: "32px"
      }}>
        {[
          { label: "Opportunities", value: opps.length, color: "#c084fc" },
          { label: "Quick Wins", value: quickWins, color: "#a3e635" },
          { label: "High Impact", value: highImpact, color: "#fb923c" },
          { label: "Avg Impact", value: `${avgImpact}/10`, color: "#38bdf8" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px", padding: "18px 20px",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "2px",
              background: stat.color
            }} />
            <div style={{
              fontFamily: "'Syne'", fontSize: "26px", fontWeight: 800,
              color: stat.color, marginBottom: "4px"
            }}>{stat.value}</div>
            <div style={{
              fontFamily: "'DM Mono'", fontSize: "9px", color: "#4b5563",
              textTransform: "uppercase", letterSpacing: "0.1em"
            }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: "0", marginBottom: "28px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        overflowX: "auto"
      }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "10px 20px",
            background: "none", border: "none",
            borderBottom: `2px solid ${activeTab === tab.id ? "#a3e635" : "transparent"}`,
            color: activeTab === tab.id ? "#a3e635" : "#4b5563",
            fontFamily: "'DM Mono'", fontSize: "10px",
            letterSpacing: "0.08em", textTransform: "uppercase",
            cursor: "pointer", whiteSpace: "nowrap",
            transition: "all 0.2s", marginBottom: "-1px",
            display: "flex", alignItems: "center", gap: "6px"
          }}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ animation: "fadeIn 0.3s ease" }}>

        {/* OPPORTUNITIES */}
        {activeTab === "opportunities" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {opps.map((opp, i) => {
              const isExpanded = expandedCard === i;
              const complexColor = COMPLEXITY_COLORS[opp.complexity_level] || "#6b7280";
              return (
                <div key={i} onClick={() => setExpandedCard(isExpanded ? null : i)} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${isExpanded ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
                  borderRadius: "12px", padding: "18px 20px", cursor: "pointer",
                  transition: "all 0.25s"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, marginRight: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                        <span style={{
                          fontFamily: "'Syne'", fontSize: "15px",
                          fontWeight: 700, color: "#fff"
                        }}>{opp.process_name}</span>
                        <Pill color={complexColor}>{opp.complexity_level}</Pill>
                        <Pill color="#c084fc">{opp.validated_category || opp.use_case_category}</Pill>
                      </div>
                      <div style={{
                        fontFamily: "'DM Mono'", fontSize: "11px", color: "#6b7280"
                      }}>{opp.ai_technique}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{
                        fontFamily: "'Syne'", fontSize: "22px", fontWeight: 800,
                        color: "#fb923c"
                      }}>{opp.impact_score?.toFixed(1)}</div>
                      <div style={{ fontFamily: "'DM Mono'", fontSize: "8px", color: "#374151" }}>IMPACT</div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", animation: "fadeIn 0.25s ease" }}>
                      <Section title="Business Impact" content={opp.business_impact} />
                      <Section title="Rationale" content={opp.rationale} />
                      <div style={{ display: "flex", gap: "24px", marginTop: "12px" }}>
                        {opp.similarity_score && (
                          <Metric label="Titan Similarity" value={`${(opp.similarity_score * 100).toFixed(1)}%`} color="#38bdf8" />
                        )}
                        {opp.complexity_total_score && (
                          <Metric label="Complexity Score" value={`${opp.complexity_total_score}/9`} color={complexColor} />
                        )}
                      </div>
                    </div>
                  )}
                  <div style={{
                    fontFamily: "'DM Mono'", fontSize: "9px",
                    color: "#2d3748", marginTop: "8px", textAlign: "right"
                  }}>
                    {isExpanded ? "▲ collapse" : "▼ expand"}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* IMPACT MATRIX */}
        {activeTab === "matrix" && (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px", padding: "28px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <div>
                <h3 style={{ fontFamily: "'Syne'", fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
                  Impact vs Complexity Matrix
                </h3>
                <p style={{ fontFamily: "'DM Mono'", fontSize: "10px", color: "#4b5563" }}>
                  Top-left quadrant = Quick Wins — High Impact, Low Complexity
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                {Object.entries(COMPLEXITY_COLORS).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: v }} />
                    <span style={{ fontFamily: "'DM Mono'", fontSize: "9px", color: "#6b7280" }}>{k}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  type="number" dataKey="complexity_score" domain={[0, 10]}
                  label={{ value: "Complexity →", position: "insideBottom", offset: -10, fill: "#374151", fontSize: 10, fontFamily: "DM Mono" }}
                  tick={{ fill: "#374151", fontSize: 9, fontFamily: "DM Mono" }}
                  stroke="rgba(255,255,255,0.06)"
                />
                <YAxis
                  type="number" dataKey="impact_score" domain={[0, 10]}
                  label={{ value: "Impact →", angle: -90, position: "insideLeft", fill: "#374151", fontSize: 10, fontFamily: "DM Mono" }}
                  tick={{ fill: "#374151", fontSize: 9, fontFamily: "DM Mono" }}
                  stroke="rgba(255,255,255,0.06)"
                />
                <Tooltip content={<MatrixTooltip />} />
                <ReferenceLine x={5} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <ReferenceLine y={5} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <Scatter
                  data={matrix}
                  shape={(props) => {
                    const { cx, cy, payload } = props;
                    const color = COMPLEXITY_COLORS[payload.complexity_level] || "#6b7280";
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={14} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={1.5} />
                        <text x={cx} y={cy - 18} textAnchor="middle" fill={color} fontSize={9} fontFamily="DM Mono">
                          {payload.process_name?.split(" ")[0]}
                        </text>
                        <circle cx={cx} cy={cy} r={4} fill={color} />
                      </g>
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ROADMAP */}
        {activeTab === "roadmap" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {roadmap.map((phase) => {
              const colors = [
                { bg: "rgba(163,230,53,0.06)", border: "rgba(163,230,53,0.2)", accent: "#a3e635", label: "QUICK WINS" },
                { bg: "rgba(251,146,60,0.06)", border: "rgba(251,146,60,0.2)", accent: "#fb923c", label: "CORE TRANSFORMATION" },
                { bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.2)", accent: "#ef4444", label: "ADVANCED CAPABILITIES" },
              ][phase.phase - 1] || { bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.08)", accent: "#6b7280", label: "PHASE" };

              return (
                <div key={phase.phase} style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "12px", padding: "24px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <span style={{
                          background: colors.accent, color: "#08090a",
                          fontFamily: "'DM Mono'", fontSize: "8px", fontWeight: 600,
                          padding: "3px 10px", borderRadius: "100px", letterSpacing: "0.1em"
                        }}>
                          {colors.label}
                        </span>
                        <span style={{ fontFamily: "'DM Mono'", fontSize: "9px", color: "#4b5563" }}>
                          Phase {phase.phase}
                        </span>
                      </div>
                      <h3 style={{
                        fontFamily: "'Syne'", fontSize: "17px", fontWeight: 700,
                        color: "#fff", margin: 0
                      }}>{phase.title}</h3>
                    </div>
                    <div style={{
                      background: "rgba(0,0,0,0.3)",
                      border: `1px solid ${colors.border}`,
                      borderRadius: "8px", padding: "6px 14px",
                      fontFamily: "'DM Mono'", fontSize: "10px", color: colors.accent
                    }}>
                      {phase.duration}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      <div style={{ fontFamily: "'DM Mono'", fontSize: "9px", color: "#4b5563", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>Processes</div>
                      {phase.opportunities?.map((o, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: colors.accent, flexShrink: 0 }} />
                          <span style={{ fontFamily: "'DM Mono'", fontSize: "11px", color: "#d1d5db" }}>{o}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'DM Mono'", fontSize: "9px", color: "#4b5563", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>Milestones</div>
                      {phase.milestones?.map((m, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                          <span style={{ color: colors.accent, fontSize: "10px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                          <span style={{ fontFamily: "'DM Mono'", fontSize: "10px", color: "#9ca3af", lineHeight: 1.5 }}>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {phase.aws_services?.length > 0 && (
                    <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${colors.border}` }}>
                      <div style={{ fontFamily: "'DM Mono'", fontSize: "9px", color: "#4b5563", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>AWS Services</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {phase.aws_services.map((svc, i) => (
                          <span key={i} style={{
                            background: "rgba(0,0,0,0.3)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "6px", padding: "4px 10px",
                            fontFamily: "'DM Mono'", fontSize: "10px", color: "#6b7280"
                          }}>{svc}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TECH STACK */}
        {activeTab === "techstack" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {techStack.map((rec, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "12px", padding: "22px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                  <h3 style={{ fontFamily: "'Syne'", fontSize: "15px", fontWeight: 700, color: "#fff" }}>
                    {rec.process_name}
                  </h3>
                  <span style={{
                    fontFamily: "'DM Mono'", fontSize: "9px", color: "#fb923c",
                    border: "1px solid rgba(251,146,60,0.3)", padding: "3px 10px", borderRadius: "100px"
                  }}>
                    {rec.estimated_effort}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                  {rec.recommended_services?.map((svc, j) => (
                    <span key={j} style={{
                      background: "rgba(56,189,248,0.08)",
                      border: "1px solid rgba(56,189,248,0.2)",
                      borderRadius: "6px", padding: "5px 12px",
                      fontFamily: "'DM Mono'", fontSize: "10px", color: "#38bdf8"
                    }}>{svc}</span>
                  ))}
                </div>
                <p style={{ fontFamily: "'DM Mono'", fontSize: "11px", color: "#6b7280", lineHeight: 1.7, margin: 0 }}>
                  {rec.rationale}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* EXECUTIVE SUMMARY */}
        {activeTab === "summary" && (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px", padding: "32px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <h3 style={{ fontFamily: "'Syne'", fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                Executive Summary
              </h3>
              <ActionButton onClick={() => navigator.clipboard.writeText(report.executive_summary)}>
                Copy to Clipboard
              </ActionButton>
            </div>
            <div style={{
              fontFamily: "'Instrument Serif'", fontSize: "16px",
              color: "#d1d5db", lineHeight: 2,
              whiteSpace: "pre-wrap",
            }}>
              {report.executive_summary}
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      {/* Floating chat — available after report is ready */}
      <ChatWindow assessmentId={report.assessment_id} />
    </div>
  );
}

function Pill({ children, color }) {
  return (
    <span style={{
      background: `${color}15`, border: `1px solid ${color}30`,
      color, borderRadius: "100px", padding: "2px 10px",
      fontFamily: "'DM Mono'", fontSize: "9px", letterSpacing: "0.05em"
    }}>
      {children}
    </span>
  );
}

function Section({ title, content }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ fontFamily: "'DM Mono'", fontSize: "9px", color: "#4b5563", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
        {title}
      </div>
      <p style={{ fontFamily: "'DM Mono'", fontSize: "11px", color: "#9ca3af", lineHeight: 1.7, margin: 0 }}>
        {content}
      </p>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div>
      <div style={{ fontFamily: "'DM Mono'", fontSize: "9px", color: "#4b5563", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontFamily: "'Syne'", fontSize: "16px", fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function ActionButton({ children, onClick, accent }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "8px 16px",
        background: accent
          ? hov ? "rgba(163,230,53,0.15)" : "rgba(163,230,53,0.08)"
          : hov ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: accent ? "1px solid rgba(163,230,53,0.3)" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "6px",
        fontFamily: "'DM Mono'", fontSize: "10px", letterSpacing: "0.06em",
        color: accent ? "#a3e635" : "#6b7280",
        cursor: "pointer", transition: "all 0.15s"
      }}>
      {children}
    </button>
  );
}

function MatrixTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: "#111318", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "8px", padding: "12px 16px"
    }}>
      <div style={{ fontFamily: "'Syne'", fontSize: "13px", color: "#fff", fontWeight: 700, marginBottom: "6px" }}>{d.process_name}</div>
      <div style={{ fontFamily: "'DM Mono'", fontSize: "10px", color: "#6b7280" }}>Impact: <span style={{ color: "#fb923c" }}>{d.impact_score?.toFixed(1)}</span></div>
      <div style={{ fontFamily: "'DM Mono'", fontSize: "10px", color: "#6b7280" }}>Complexity: <span style={{ color: COMPLEXITY_COLORS[d.complexity_level] }}>{d.complexity_level}</span></div>
      <div style={{ fontFamily: "'DM Mono'", fontSize: "10px", color: "#6b7280" }}>{d.use_case_category}</div>
    </div>
  );
}

function exportJSON(report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ai-readiness-${report.company_name?.replace(/\s+/g, "-").toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
