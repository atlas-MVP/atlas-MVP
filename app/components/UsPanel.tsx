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
  const [mission, setMission] = useState(
    "Atlas is a real-time intelligence platform built to make the most important news in the world legible. We track active conflicts, disasters, economic disruptions, and political crises — verifying every alert against multiple primary sources before it reaches you."
  );
  const [coverage, setCoverage] = useState(
    "We cover geopolitical conflicts, humanitarian crises, gun violence, natural disasters, and financial market disruptions. Our focus is accuracy over speed — every item is source-weighted and confidence-scored."
  );

  return (
    <div style={PANEL}>
      <button onClick={onClose} style={{ position: "absolute", top: 10, right: 12, zIndex: 10, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 14, lineHeight: 1 }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>×</button>
      <button onClick={onBack} style={{ position: "absolute", top: 11, left: 14, zIndex: 10, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", padding: 0 }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>← back</button>

      <div style={{ flex: 1, overflowY: "auto", paddingTop: 38 }}>

        {/* Wordmark + tagline */}
        <div style={{ padding: "0 18px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 300, letterSpacing: "0.3em", color: "rgba(255,255,255,0.92)" }}>ATLAS</span>
            <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", paddingTop: 2 }}>Intelligence</span>
          </div>
        </div>

        {/* Mission */}
        <SLabel text="mission" />
        <div style={{ margin: "0 14px", padding: "11px 13px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <EText value={mission} onChange={setMission} as="div" style={{ fontSize: 12, color: "rgba(255,255,255,0.58)", lineHeight: 1.7, fontFamily: "monospace" }} />
        </div>

        {/* What we cover */}
        <SLabel text="what we cover" />
        <div style={{ margin: "0 14px", padding: "11px 13px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <EText value={coverage} onChange={setCoverage} as="div" style={{ fontSize: 12, color: "rgba(255,255,255,0.58)", lineHeight: 1.7, fontFamily: "monospace" }} />
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
                <div style={{ fontSize: 13, fontFamily: "monospace", color: "rgba(255,255,255,0.82)", fontWeight: 600, letterSpacing: "0.02em" }}>{m.name}</div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em", marginTop: 2 }}>{m.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <SLabel text="contact" />
        <div style={{ margin: "0 14px 24px", padding: "11px 13px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(96,165,250,0.75)" }}>founders@atlas.boston</span>
        </div>

      </div>
    </div>
  );
}
