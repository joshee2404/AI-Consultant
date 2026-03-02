import { useState } from "react";
import FractalBackground from "./components/FractalBackground.jsx";
import ZebLogo from "./components/ZebLogo.jsx";
import AssessmentForm from "./components/AssessmentForm.jsx";
import ProcessingScreen from "./components/ProcessingScreen.jsx";
import ResultsDashboard from "./components/ResultsDashboard.jsx";
import { submitAssessment, pollResult } from "./services/api.js";

// Views: "home" | "processing" | "results"
export default function App() {
  const [view, setView] = useState("home");
  const [assessmentId, setAssessmentId] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await submitAssessment(formData);
      setAssessmentId(res.assessment_id);
      setView("processing");

      const finalReport = await pollResult(res.assessment_id, (status) => {
        console.log("[Poll] status:", status);
      });

      setReport({ ...finalReport, assessment_id: res.assessment_id });
      setView("results");
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Something went wrong");
      setView("home");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setView("home");
    setReport(null);
    setAssessmentId(null);
    setError(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#08090a", position: "relative" }}>
      <FractalBackground />

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 40px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(8,9,10,0.8)",
        backdropFilter: "blur(12px)",
      }}>
        <ZebLogo />
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "10px",
          color: "#374151", letterSpacing: "0.1em", textTransform: "uppercase"
        }}>
          AI Readiness Intelligence System
        </div>
        {view !== "home" && (
          <button onClick={handleReset} style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "6px", padding: "6px 14px",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "10px",
            color: "#4b5563", cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.target.style.color = "#a3e635"; e.target.style.borderColor = "rgba(163,230,53,0.3)"; }}
          onMouseLeave={e => { e.target.style.color = "#4b5563"; e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            ← New Assessment
          </button>
        )}
      </nav>

      {/* Main content */}
      <main style={{
        position: "relative", zIndex: 10,
        paddingTop: view === "results" ? "80px" : "0",
      }}>

        {/* HOME */}
        {view === "home" && (
          <div style={{
            minHeight: "100vh", display: "flex",
            flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "100px 24px 60px",
          }}>
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: "64px", maxWidth: "640px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "rgba(163,230,53,0.08)",
                border: "1px solid rgba(163,230,53,0.2)",
                borderRadius: "100px", padding: "6px 16px", marginBottom: "28px",
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a3e635", display: "inline-block", animation: "blink 2s infinite" }} />
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "10px", color: "#a3e635", letterSpacing: "0.1em" }}>
                  POWERED BY CLAUDE 3.5 SONNET + AMAZON TITAN
                </span>
              </div>

              <h1 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(36px, 6vw, 60px)",
                fontWeight: 800, color: "#ffffff",
                lineHeight: 1.08, letterSpacing: "-0.03em",
                marginBottom: "20px",
              }}>
                Your AI Roadmap<br />
                <span style={{
                  background: "linear-gradient(90deg, #a3e635, #84cc16)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  In 30 Seconds.
                </span>
              </h1>

              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px",
                color: "#6b7280", lineHeight: 1.8, marginBottom: "0",
              }}>
                Submit your business processes. Our 4-stage AI pipeline analyzes patterns,
                validates use cases, scores complexity, and delivers a McKinsey-grade AI
                opportunity report — automatically.
              </p>
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "8px", padding: "12px 20px",
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "11px",
                color: "#ef4444", marginBottom: "32px", maxWidth: "680px", width: "100%",
              }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ width: "100%", maxWidth: "680px" }}>
              <AssessmentForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        )}

        {/* PROCESSING */}
        {view === "processing" && (
          <div style={{
            minHeight: "100vh", display: "flex",
            flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "100px 24px 60px",
          }}>
            <ProcessingScreen assessmentId={assessmentId} />
          </div>
        )}

        {/* RESULTS */}
        {view === "results" && report && (
          <div style={{ padding: "20px 24px 80px" }}>
            <ResultsDashboard report={report} onReset={handleReset} />
          </div>
        )}
      </main>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}
