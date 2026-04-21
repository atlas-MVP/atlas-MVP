"use client";
import React, { useState } from "react";
import { EText } from "./InlineEdit";

const PANEL: React.CSSProperties = {
  position: "absolute",
  top: 52, left: 20, bottom: 28,
  width: 488,
  zIndex: 20,
  display: "flex",
  flexDirection: "column",
  background: "rgba(4,6,18,0.62)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  backdropFilter: "blur(40px)",
  WebkitBackdropFilter: "blur(40px)",
  boxShadow: "0 24px 80px rgba(0,0,0,0.38), 0 1px 3px rgba(0,0,0,0.18)",
  overflow: "hidden",
  pointerEvents: "auto",
};

const INPUT: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box" as const,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 8,
  padding: "9px 11px",
  fontSize: 12,
  fontFamily: "monospace",
  color: "rgba(255,255,255,0.75)",
  outline: "none",
  resize: "none" as const,
};

function SLabel({ text }: { text: string }) {
  return (
    <div style={{ padding: "16px 18px 6px" }}>
      <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.2em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" as const, fontWeight: 500 }}>
        {text}
      </span>
    </div>
  );
}

const TEAM = [
  { initials: "WG", name: "William Graham", role: "Founder · Editorial & Product", color: "rgba(96,165,250,0.22)" },
  { initials: "IR", name: "Intelligence Research", role: "Conflict analysis · OSINT · Verification", color: "rgba(167,139,250,0.22)" },
  { initials: "DE", name: "Design & Engineering", role: "Interface · Maps · Data pipeline", color: "rgba(251,191,36,0.18)" },
];

interface Props { onClose: () => void; onBack: () => void; }

export default function UsPanel({ onClose, onBack }: Props) {
  const [mission, setMission] = useState("atlas brings global issues into view.");
  const [formName,    setFormName]    = useState("");
  const [formEmail,   setFormEmail]   = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [submitted,   setSubmitted]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    window.location.href = `mailto:founders@atlas.boston?subject=Message from ${encodeURIComponent(formName)}&body=${encodeURIComponent(formMessage)}%0A%0A${encodeURIComponent(formEmail)}`;
    setSubmitted(true);
  }

  return (
    <div style={PANEL}>
      <button onClick={onClose} style={{ position: "absolute", top: 10, right: 12, zIndex: 10, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 14, lineHeight: 1 }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>×</button>
      <button onClick={onBack} style={{ position: "absolute", top: 11, left: 14, zIndex: 10, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", padding: 0 }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>← back</button>

      <div style={{ flex: 1, overflowY: "auto", paddingTop: 38 }}>

        {/* Wordmark + pre-mvp note */}
        <div style={{ padding: "0 18px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 22, fontWeight: 300, letterSpacing: "0.3em", color: "rgba(255,255,255,0.92)", textTransform: "none" }}>ATLAS</span>
          <p style={{ margin: "10px 0 0", fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.42)", lineHeight: 1.7 }}>
            you accidentally found atlas. this site is under construction and is currently pre mvp. if you like what you see, send us an email.
          </p>
        </div>

        {/* Mission */}
        <SLabel text="mission" />
        <div style={{ margin: "0 14px", padding: "11px 13px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <EText value={mission} onChange={setMission} as="div" style={{ fontSize: 12, color: "rgba(255,255,255,0.58)", lineHeight: 1.7, fontFamily: "monospace" }} />
        </div>

        {/* Team */}
        <SLabel text="team" />
        <div style={{ margin: "0 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          {TEAM.map(m => (
            <div key={m.initials} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 13px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.color, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>{m.initials}</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontFamily: "monospace", color: "rgba(255,255,255,0.82)", fontWeight: 600, letterSpacing: "0.02em", textTransform: "none" }}>{m.name}</div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em", marginTop: 2 }}>{m.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <SLabel text="contact" />
        <div style={{ margin: "0 14px 24px" }}>
          {submitted ? (
            <div style={{ padding: "14px 13px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.45)" }}>
              message sent.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.32)", letterSpacing: "0.06em", marginBottom: 4 }}>name</div>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  style={INPUT}
                  placeholder=""
                />
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.32)", letterSpacing: "0.06em", marginBottom: 4 }}>email address</div>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  style={INPUT}
                  placeholder=""
                />
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.32)", letterSpacing: "0.06em", marginBottom: 4 }}>message</div>
                <textarea
                  value={formMessage}
                  onChange={e => setFormMessage(e.target.value)}
                  rows={4}
                  style={INPUT}
                  placeholder=""
                />
              </div>
              <button
                type="submit"
                style={{ alignSelf: "flex-start", padding: "8px 18px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "rgba(255,255,255,0.65)", cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
              >
                submit
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
