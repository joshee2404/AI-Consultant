import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function ChatWindow({ assessmentId }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I've read your full AI Readiness Report. Ask me anything — about your opportunities, the roadmap phases, AWS services recommended, or why a process scored the way it did.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat/${assessmentId}`, {
        message: text,
        // Send full history excluding the initial assistant greeting
        // so Claude has conversation context
        history: updatedMessages.slice(0, -1),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.content }]);
    } catch (err) {
      const detail = err?.response?.data?.detail || "Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠ ${detail}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Suggested questions shown before first user message
  const suggestions = [
    "What's my easiest quick win?",
    "Explain the Phase 1 roadmap",
    "Why was Invoice Processing scored Medium complexity?",
    "Which AWS services should I prioritise?",
  ];
  const showSuggestions = messages.length === 1;

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title={open ? "Close chat" : "Chat with your report"}
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          width: "54px",
          height: "54px",
          borderRadius: "50%",
          background: open
            ? "rgba(255,255,255,0.08)"
            : "linear-gradient(135deg, #a3e635, #84cc16)",
          border: open ? "1px solid rgba(255,255,255,0.15)" : "none",
          cursor: "pointer",
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          boxShadow: open ? "none" : "0 0 30px rgba(163,230,53,0.35)",
          transition: "all 0.25s ease",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}
      >
        {open ? (
          <span style={{ color: "#fff", fontSize: "18px", transform: "rotate(-45deg)", display: "inline-block" }}>✕</span>
        ) : (
          "💬"
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "94px",
            right: "28px",
            width: "380px",
            height: "520px",
            background: "#0f1115",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            overflow: "hidden",
            boxShadow: "0 32px 72px rgba(0,0,0,0.7)",
            animation: "slideUp 0.25s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(163,230,53,0.04)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#a3e635",
                animation: "blink 2s infinite",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                Report Assistant
              </div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "9px", color: "#4b5563", marginTop: "1px" }}>
                Claude 3.5 Sonnet · Knows your full report
              </div>
            </div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "9px",
                color: "#374151",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "4px",
                padding: "3px 8px",
              }}
            >
              {assessmentId?.slice(0, 8).toUpperCase()}
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  animation: "fadeIn 0.2s ease",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "10px 13px",
                    borderRadius:
                      msg.role === "user"
                        ? "12px 12px 3px 12px"
                        : "12px 12px 12px 3px",
                    background:
                      msg.role === "user"
                        ? "rgba(163,230,53,0.1)"
                        : "rgba(255,255,255,0.05)",
                    border:
                      msg.role === "user"
                        ? "1px solid rgba(163,230,53,0.22)"
                        : "1px solid rgba(255,255,255,0.07)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "11px",
                    color: msg.role === "user" ? "#d1fae5" : "#d1d5db",
                    lineHeight: 1.75,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px 12px 12px 3px",
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "#a3e635",
                        animation: `bounce 1s ease-in-out infinite`,
                        animationDelay: `${i * 0.18}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {showSuggestions && !loading && (
              <div style={{ marginTop: "6px" }}>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "9px",
                  color: "#374151", marginBottom: "8px", letterSpacing: "0.08em",
                }}>
                  SUGGESTED QUESTIONS
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "10px",
                        color: "#6b7280",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = "rgba(163,230,53,0.25)";
                        e.target.style.color = "#a3e635";
                        e.target.style.background = "rgba(163,230,53,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = "rgba(255,255,255,0.07)";
                        e.target.style.color = "#6b7280";
                        e.target.style.background = "rgba(255,255,255,0.03)";
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div
            style={{
              padding: "12px 14px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              gap: "8px",
              flexShrink: 0,
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your report... (Enter to send)"
              rows={1}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "9px 12px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "11px",
                color: "#fff",
                resize: "none",
                lineHeight: 1.5,
                maxHeight: "80px",
                overflow: "auto",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(163,230,53,0.3)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                padding: "9px 14px",
                background:
                  loading || !input.trim()
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(163,230,53,0.12)",
                border: `1px solid ${
                  loading || !input.trim()
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(163,230,53,0.3)"
                }`,
                borderRadius: "8px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "10px",
                color: loading || !input.trim() ? "#374151" : "#a3e635",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                flexShrink: 0,
                letterSpacing: "0.05em",
              }}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)}
        }
      `}</style>
    </>
  );
}
