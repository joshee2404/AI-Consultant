import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const COMPLEXITY_COLORS = { Low: "#10b981", Medium: "#f59e0b", High: "#ef4444" };

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  const color = COMPLEXITY_COLORS[payload.complexity_level] || "#8b5cf6";
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.5} />
      <text x={cx} y={cy - 15} textAnchor="middle" fill="#94a3b8" fontSize={10}>
        {payload.process_name?.split(" ")[0]}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "#111318", border: "1px solid #2a3145", borderRadius: 8, padding: "12px 16px" }}>
      <div style={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}>{d.process_name}</div>
      <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Impact: <span style={{ color: "#f59e0b" }}>{d.impact_score?.toFixed(1)}/10</span></div>
      <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Complexity: <span style={{ color: COMPLEXITY_COLORS[d.complexity_level] }}>{d.complexity_level}</span></div>
      <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Category: {d.use_case_category}</div>
    </div>
  );
};

export default function ImpactMatrix({ data = [] }) {
  return (
    <div style={{ background: "#111318", border: "1px solid #1e2330", borderRadius: 10, padding: 24 }}>
      <h3 style={{ color: "#fff", marginBottom: 8 }}>Impact / Complexity Matrix</h3>
      <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: 24 }}>
        Top-right quadrant = highest priority (High Impact, Low Complexity)
      </p>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {Object.entries(COMPLEXITY_COLORS).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: v }} />
            <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{k}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2330" />
          <XAxis
            type="number" dataKey="complexity_score" name="Complexity" domain={[0, 10]}
            label={{ value: "Complexity →", position: "insideBottom", offset: -10, fill: "#64748b", fontSize: 12 }}
            tick={{ fill: "#64748b", fontSize: 11 }} stroke="#1e2330"
          />
          <YAxis
            type="number" dataKey="impact_score" name="Impact" domain={[0, 10]}
            label={{ value: "Impact →", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 12 }}
            tick={{ fill: "#64748b", fontSize: 11 }} stroke="#1e2330"
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={5} stroke="#2a3145" strokeDasharray="4 4" />
          <ReferenceLine y={5} stroke="#2a3145" strokeDasharray="4 4" />
          <Scatter data={data} shape={<CustomDot />} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
