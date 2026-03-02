import { useState } from "react";

const S = {
  // Inputs
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#ffffff",
    fontSize: "14px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: "border-color 0.2s, background 0.2s",
  },
  label: {
    display: "block",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "10px",
    fontWeight: 400,
    color: "#a3e635",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  fieldWrap: { marginBottom: "20px" },
};

const focusStyle = {
  border: "1px solid rgba(163, 230, 53, 0.5)",
  background: "rgba(163, 230, 53, 0.04)",
};

function Field({ label, children, hint }) {
  return (
    <div style={S.fieldWrap}>
      <label style={S.label}>{label}</label>
      {children}
      {hint && <p style={{ fontFamily: "'DM Mono'", fontSize: "10px", color: "#4b5563", marginTop: "6px" }}>{hint}</p>}
    </div>
  );
}

function FInput({ value, onChange, placeholder, type = "text" }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...S.input, ...(focused ? focusStyle : {}) }}
    />
  );
}

function FSelect({ value, onChange, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...S.input,
        ...(focused ? focusStyle : {}),
        cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23a3e635' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
      }}
    >
      {children}
    </select>
  );
}

function FTextarea({ value, onChange, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...S.input, ...(focused ? focusStyle : {}), resize: "vertical", lineHeight: 1.6 }}
    />
  );
}

const DATA_TYPES = [
  { value: "structured", label: "Structured Data" },
  { value: "documents", label: "Documents" },
  { value: "logs", label: "Logs & Events" },
  { value: "images", label: "Images / Video" },
  { value: "none", label: "No Data Yet" },
];

const emptyProcess = () => ({
  name: "", description: "", pain_points: "",
  data_types: [], frequency: "", team_size: "",
});

export default function AssessmentForm({ onSubmit, loading }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    company_name: "", industry: "", company_size: "",
    tech_stack: "", cloud_provider: "AWS",
    budget_range: "", timeline_months: "12",
    compliance_requirements: "",
    processes: [emptyProcess()],
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const updateProcess = (i, k, v) =>
    setForm(f => {
      const p = [...f.processes];
      p[i] = { ...p[i], [k]: v };
      return { ...f, processes: p };
    });

  const toggleDataType = (i, type) =>
    setForm(f => {
      const p = [...f.processes];
      const dt = p[i].data_types;
      p[i] = { ...p[i], data_types: dt.includes(type) ? dt.filter(t => t !== type) : [...dt, type] };
      return { ...f, processes: p };
    });

  const addProcess = () =>
    form.processes.length < 10 && setForm(f => ({ ...f, processes: [...f.processes, emptyProcess()] }));

  const removeProcess = (i) =>
    form.processes.length > 1 && setForm(f => ({ ...f, processes: f.processes.filter((_, idx) => idx !== i) }));

  const handleSubmit = () => {
    const payload = {
      ...form,
      tech_stack: form.tech_stack ? form.tech_stack.split(",").map(s => s.trim()).filter(Boolean) : [],
      timeline_months: parseInt(form.timeline_months) || 12,
      processes: form.processes.map(p => ({
        ...p,
        team_size: p.team_size ? parseInt(p.team_size) : undefined,
      })),
    };
    onSubmit(payload);
  };

  const steps = ["Company", "Processes", "Launch"];
  const canNext0 = form.company_name && form.industry;
  const canNext1 = form.processes.every(p => p.name && p.description && p.pain_points);

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px" }}>
      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "48px" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              opacity: i > step ? 0.35 : 1, transition: "opacity 0.3s"
            }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                border: `1.5px solid ${i <= step ? "#a3e635" : "rgba(255,255,255,0.15)"}`,
                background: i < step ? "#a3e635" : i === step ? "rgba(163,230,53,0.1)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Mono'", fontSize: "11px",
                color: i < step ? "#08090a" : i === step ? "#a3e635" : "#4b5563",
                fontWeight: i < step ? 600 : 400, transition: "all 0.3s"
              }}>
                {i < step ? "✓" : i + 1}
              </div>
              <span style={{
                fontFamily: "'DM Mono'", fontSize: "10px",
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: i === step ? "#a3e635" : "#4b5563"
              }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: "1px", margin: "0 16px",
                background: i < step ? "#a3e635" : "rgba(255,255,255,0.08)",
                transition: "background 0.5s"
              }} />
            )}
          </div>
        ))}
      </div>

      {/* STEP 0 — Company */}
      {step === 0 && (
        <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
          <h2 style={{
            fontFamily: "'Syne'", fontSize: "28px", fontWeight: 800,
            color: "#fff", marginBottom: "8px", letterSpacing: "-0.02em"
          }}>
            Tell us about your company
          </h2>
          <p style={{ fontFamily: "'DM Mono'", fontSize: "12px", color: "#6b7280", marginBottom: "36px" }}>
            We'll use this to calibrate your AI readiness context
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Company Name">
                <FInput value={form.company_name} onChange={e => update("company_name", e.target.value)} placeholder="Acme Corporation" />
              </Field>
            </div>
            <Field label="Industry">
              <FSelect value={form.industry} onChange={e => update("industry", e.target.value)}>
                <option value="">Select industry...</option>
                {["Financial Services","Healthcare","Retail & E-Commerce","Manufacturing","Logistics & Supply Chain","Technology","Media & Entertainment","Insurance","Telecommunications","Real Estate","Other"].map(i => <option key={i}>{i}</option>)}
              </FSelect>
            </Field>
            <Field label="Company Size">
              <FSelect value={form.company_size} onChange={e => update("company_size", e.target.value)}>
                <option value="">Select size...</option>
                <option>1-50 employees</option>
                <option>51-200 employees</option>
                <option>201-1000 employees</option>
                <option>1000+ employees</option>
              </FSelect>
            </Field>
            <Field label="Cloud Provider">
              <FSelect value={form.cloud_provider} onChange={e => update("cloud_provider", e.target.value)}>
                {["AWS","Azure","GCP","Multi-Cloud","On-Premises","None"].map(c => <option key={c}>{c}</option>)}
              </FSelect>
            </Field>
            <Field label="Budget Range">
              <FSelect value={form.budget_range} onChange={e => update("budget_range", e.target.value)}>
                <option value="">Select...</option>
                <option>Under $50K</option>
                <option>$50K - $200K</option>
                <option>$200K - $1M</option>
                <option>$1M+</option>
              </FSelect>
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Current Tech Stack" hint="Comma separated — e.g. SAP ERP, AWS S3, PostgreSQL, Salesforce">
                <FInput value={form.tech_stack} onChange={e => update("tech_stack", e.target.value)} placeholder="SAP ERP, AWS S3, PostgreSQL..." />
              </Field>
            </div>
            <Field label="Timeline (months)">
              <FInput type="number" value={form.timeline_months} onChange={e => update("timeline_months", e.target.value)} placeholder="12" />
            </Field>
            <Field label="Compliance Requirements">
              <FInput value={form.compliance_requirements} onChange={e => update("compliance_requirements", e.target.value)} placeholder="HIPAA, GDPR, SOC2, None" />
            </Field>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
            <NavButton onClick={() => setStep(1)} disabled={!canNext0}>
              Define Processes →
            </NavButton>
          </div>
        </div>
      )}

      {/* STEP 1 — Processes */}
      {step === 1 && (
        <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
          <h2 style={{
            fontFamily: "'Syne'", fontSize: "28px", fontWeight: 800,
            color: "#fff", marginBottom: "8px", letterSpacing: "-0.02em"
          }}>
            Your business processes
          </h2>
          <p style={{ fontFamily: "'DM Mono'", fontSize: "12px", color: "#6b7280", marginBottom: "36px" }}>
            Be specific — the AI's output quality depends directly on this input
          </p>

          {form.processes.map((proc, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px", padding: "24px", marginBottom: "16px",
              position: "relative"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <span style={{
                  fontFamily: "'DM Mono'", fontSize: "10px", letterSpacing: "0.15em",
                  color: "#a3e635", textTransform: "uppercase"
                }}>
                  Process {String(i + 1).padStart(2, "0")}
                </span>
                {form.processes.length > 1 && (
                  <button onClick={() => removeProcess(i)} style={{
                    background: "none", border: "none", color: "#ef4444",
                    cursor: "pointer", fontSize: "11px", fontFamily: "'DM Mono'"
                  }}>
                    Remove
                  </button>
                )}
              </div>

              <Field label="Process Name">
                <FInput value={proc.name} onChange={e => updateProcess(i, "name", e.target.value)} placeholder="Invoice Processing" />
              </Field>
              <Field label="Description">
                <FTextarea value={proc.description} onChange={e => updateProcess(i, "description", e.target.value)} placeholder="Describe how this process works today..." rows={3} />
              </Field>
              <Field label="Pain Points">
                <FTextarea value={proc.pain_points} onChange={e => updateProcess(i, "pain_points", e.target.value)} placeholder="What's slow, costly, or error-prone?" rows={2} />
              </Field>

              <Field label="Data Available">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {DATA_TYPES.map(dt => {
                    const active = proc.data_types?.includes(dt.value);
                    return (
                      <button key={dt.value} onClick={() => toggleDataType(i, dt.value)} style={{
                        padding: "6px 14px",
                        borderRadius: "100px",
                        border: `1px solid ${active ? "#a3e635" : "rgba(255,255,255,0.1)"}`,
                        background: active ? "rgba(163,230,53,0.1)" : "transparent",
                        color: active ? "#a3e635" : "#6b7280",
                        fontFamily: "'DM Mono'", fontSize: "11px",
                        cursor: "pointer", transition: "all 0.15s"
                      }}>
                        {dt.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <Field label="Frequency">
                  <FSelect value={proc.frequency} onChange={e => updateProcess(i, "frequency", e.target.value)}>
                    <option value="">Select...</option>
                    <option>Real-time / Continuous</option>
                    <option>Hourly</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </FSelect>
                </Field>
                <Field label="Team Size">
                  <FInput type="number" value={proc.team_size} onChange={e => updateProcess(i, "team_size", e.target.value)} placeholder="e.g. 8" />
                </Field>
              </div>
            </div>
          ))}

          {form.processes.length < 10 && (
            <button onClick={addProcess} style={{
              width: "100%", padding: "14px",
              background: "none",
              border: "1px dashed rgba(163,230,53,0.25)",
              borderRadius: "12px",
              color: "#a3e635", fontFamily: "'DM Mono'", fontSize: "11px",
              cursor: "pointer", letterSpacing: "0.08em",
              transition: "border-color 0.2s, background 0.2s",
              marginBottom: "24px",
            }}
            onMouseEnter={e => { e.target.style.borderColor = "rgba(163,230,53,0.5)"; e.target.style.background = "rgba(163,230,53,0.04)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(163,230,53,0.25)"; e.target.style.background = "none"; }}
            >
              + ADD ANOTHER PROCESS
            </button>
          )}

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <NavButton secondary onClick={() => setStep(0)}>← Back</NavButton>
            <NavButton onClick={() => setStep(2)} disabled={!canNext1}>Review & Launch →</NavButton>
          </div>
        </div>
      )}

      {/* STEP 2 — Launch */}
      {step === 2 && (
        <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
          <h2 style={{
            fontFamily: "'Syne'", fontSize: "28px", fontWeight: 800,
            color: "#fff", marginBottom: "8px", letterSpacing: "-0.02em"
          }}>
            Ready to launch
          </h2>
          <p style={{ fontFamily: "'DM Mono'", fontSize: "12px", color: "#6b7280", marginBottom: "36px" }}>
            Confirm your submission — the AI pipeline will run in ~30 seconds
          </p>

          {/* Summary card */}
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px", padding: "24px", marginBottom: "20px"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                ["Company", form.company_name],
                ["Industry", form.industry],
                ["Cloud", form.cloud_provider],
                ["Timeline", `${form.timeline_months} months`],
                ["Budget", form.budget_range || "Not specified"],
                ["Processes", `${form.processes.length} defined`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontFamily: "'DM Mono'", fontSize: "9px", color: "#4b5563", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>{k}</div>
                  <div style={{ fontFamily: "'Syne'", fontSize: "14px", color: "#e5e7eb", fontWeight: 600 }}>{v || "—"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Process pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
            {form.processes.map((p, i) => (
              <div key={i} style={{
                padding: "6px 14px", borderRadius: "100px",
                background: "rgba(163,230,53,0.08)",
                border: "1px solid rgba(163,230,53,0.2)",
                fontFamily: "'DM Mono'", fontSize: "11px", color: "#a3e635"
              }}>
                {p.name || `Process ${i + 1}`}
              </div>
            ))}
          </div>

          {/* AI info banner */}
          <div style={{
            background: "linear-gradient(135deg, rgba(163,230,53,0.06), rgba(192,132,252,0.06))",
            border: "1px solid rgba(163,230,53,0.15)",
            borderRadius: "12px", padding: "20px", marginBottom: "32px",
            display: "flex", gap: "16px", alignItems: "flex-start"
          }}>
            <div style={{ fontSize: "20px", flexShrink: 0 }}>⚡</div>
            <div>
              <div style={{ fontFamily: "'Syne'", fontSize: "13px", color: "#e5e7eb", fontWeight: 600, marginBottom: "4px" }}>
                4-Stage AI Pipeline
              </div>
              <div style={{ fontFamily: "'DM Mono'", fontSize: "11px", color: "#6b7280", lineHeight: 1.7 }}>
                Claude 3.5 Sonnet analyzes patterns → Titan Embeddings validates → Python scores complexity → Claude generates your roadmap
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <NavButton secondary onClick={() => setStep(1)}>← Back</NavButton>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: "14px 36px",
                background: loading ? "rgba(163,230,53,0.3)" : "linear-gradient(135deg, #a3e635, #84cc16)",
                border: "none", borderRadius: "8px",
                fontFamily: "'Syne'", fontSize: "14px", fontWeight: 700,
                color: "#08090a", cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.02em", transition: "all 0.2s",
                boxShadow: loading ? "none" : "0 0 30px rgba(163,230,53,0.3)",
              }}
            >
              {loading ? "Initializing Pipeline..." : "Generate AI Roadmap →"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        select option { background: #1a1d23; color: #fff; }
      `}</style>
    </div>
  );
}

function NavButton({ children, onClick, disabled, secondary }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "11px 24px",
        background: secondary ? "transparent" : disabled ? "rgba(255,255,255,0.05)" : hov ? "rgba(163,230,53,0.12)" : "rgba(163,230,53,0.08)",
        border: secondary ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${disabled ? "rgba(255,255,255,0.05)" : "rgba(163,230,53,0.3)"}`,
        borderRadius: "8px",
        fontFamily: "'DM Mono'", fontSize: "11px", letterSpacing: "0.08em",
        color: secondary ? "#6b7280" : disabled ? "#374151" : "#a3e635",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s"
      }}
    >
      {children}
    </button>
  );
}
