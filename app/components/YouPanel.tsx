"use client";
import React, { useState } from "react";
import { EText } from "./InlineEdit";

// ── Shared panel shell (matches AtlasHQ dimensions / glass style) ─────────────
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
    <div style={{ padding: "14px 18px 6px" }}>
      <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.2em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" as const, fontWeight: 500 }}>
        {text}
      </span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.38)", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

interface Props { onClose: () => void; onBack: () => void; }

export default function YouPanel({ onClose, onBack }: Props) {
  const [name,  setName]  = useState("John Doe");
  const [email, setEmail] = useState("johndoe@gmail.com");
  const [role,  setRole]  = useState("Atlas Intelligence Contributor");
  const [bio,   setBio]   = useState("Researcher & editorial contributor. Focused on Middle East geopolitics, conflict verification, and open-source intelligence.");

  return (
    <div style={PANEL}>
      {/* Close */}
      <button onClick={onClose} style={{ position: "absolute", top: 10, right: 12, zIndex: 10, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 14, lineHeight: 1 }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>×</button>

      {/* Back */}
      <button onClick={onBack} style={{ position: "absolute", top: 11, left: 14, zIndex: 10, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", padding: 0 }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>← back</button>

      <div style={{ flex: 1, overflowY: "auto", paddingTop: 38 }}>

        {/* Avatar + name block */}
        <div style={{ padding: "0 18px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Avatar */}
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, rgba(96,165,250,0.25) 0%, rgba(167,139,250,0.25) 100%)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 20, fontFamily: "monospace", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>J</span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.92)", letterSpacing: "0.01em", marginBottom: 3 }}>
                <EText value={name} onChange={setName} style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.92)", textTransform: "none" }} />
              </div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.38)", marginBottom: 4 }}>
                <EText value={email} onChange={setEmail} style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.38)" }} />
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 4, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#60a5fa" }} />
                <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", color: "rgba(96,165,250,0.85)", textTransform: "uppercase" }}>Verified User</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, fontFamily: "monospace" }}>
            <EText value={bio} onChange={setBio} as="div" style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, fontFamily: "monospace" }} />
          </div>
        </div>

        {/* Role */}
        <SLabel text="role" />
        <div style={{ margin: "0 14px" }}>
          <div style={{ padding: "9px 13px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <EText value={role} onChange={setRole} style={{ fontSize: 13, fontFamily: "monospace", color: "rgba(255,255,255,0.75)" }} />
          </div>
        </div>

        {/* Account */}
        <SLabel text="account" />
        <div style={{ margin: "0 14px" }}>
          <div style={{ padding: "6px 13px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Row label="Joined" value="April 2026" />
            <Row label="Tier"   value="Verified User" />
          </div>
        </div>

        {/* Activity */}
        <SLabel text="activity" />
        <div style={{ margin: "0 14px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, paddingBottom: 20 }}>
          {[
            { value: "3",   label: "security level" },
            { value: "23",  label: "events tracked" },
            { value: "147", label: "events" },
          ].map(({ value, label }) => (
            <div key={label} style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", color: "rgba(255,255,255,0.88)" }}>{value}</div>
              <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", color: "rgba(255,255,255,0.32)", textTransform: "uppercase", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <div style={{ padding: "0 18px 24px" }}>
          <button style={{ width: "100%", padding: "9px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "rgba(255,255,255,0.35)", cursor: "pointer" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}>
            Sign out →
          </button>
        </div>

      </div>
    </div>
  );
}
