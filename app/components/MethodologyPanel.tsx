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


function SourceBadge({ name }: { name: string }) {
  return (
    <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 4, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", textTransform: "none" }}>{name}</span>
  );
}

interface Props { onClose: () => void; onBack: () => void; }

export default function MethodologyPanel({ onClose, onBack }: Props) {
  const [confidenceText, setConfidenceText] = useState(
    "Each event is scored 0–100% using Claude AI against corroboration across independent feeds. User access to intelligence is tiered by security level (sectors 0–10) — higher sectors unlock deeper event data, raw source citations, and historical threat timelines."
  );
  const [verificationText, setVerificationText] = useState(
    "Every alert requires confirmation from a minimum of two independent sources before publication. Sources are weighted by historical accuracy, institutional authority, and proximity to the event."
  );
  const [dataText, setDataText] = useState(
    "Casualty figures are cross-referenced against government announcements, hospital records, and NGO field reports."
  );
  const [securityText, setSecurityText] = useState(
    "Atlas does not track user location, store browsing history, or sell personal data. Account information is encrypted at rest. Intelligence sources and internal editorial communications use end-to-end encryption."
  );

  return (
    <div style={PANEL}>
      <button onClick={onClose} style={{ position: "absolute", top: 10, right: 12, zIndex: 10, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 14, lineHeight: 1 }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>×</button>
      <button onClick={onBack} style={{ position: "absolute", top: 11, left: 14, zIndex: 10, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", padding: 0 }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>← back</button>

      <div style={{ flex: 1, overflowY: "auto", paddingTop: 38 }}>

        {/* Header */}
        <div style={{ padding: "0 18px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)", letterSpacing: "0.02em" }}>methodology</h2>
        </div>

        {/* ── CONFIDENCE SCORING ── */}
        <SLabel text="confidence scoring" />
        <div style={{ margin: "0 14px" }}>
          <div style={{ padding: "10px 13px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 6 }}>
            <EText value={confidenceText} onChange={setConfidenceText} as="div" style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, fontFamily: "monospace" }} />
          </div>

          {/* Confidence bar */}
          <div style={{ padding: "10px 13px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 7 }}>confidence scale</div>
            <div style={{ display: "flex", height: 6, borderRadius: 4, overflow: "hidden" }}>
              {(["#ef4444","#f97316","#eab308","#22d3ee","#4ade80"] as const).map(c => (
                <div key={c} style={{ flex: 1, background: c, opacity: 0.65 }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
              {["<50%","50–70%","70–85%","85–95%",">95%"].map(l => (
                <span key={l} style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(255,255,255,0.28)" }}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── VERIFICATION ── */}
        <SLabel text="verification" />
        <div style={{ margin: "0 14px", padding: "11px 13px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <EText value={verificationText} onChange={setVerificationText} as="div" style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, fontFamily: "monospace" }} />
        </div>

        {/* ── DATA ── */}
        <SLabel text="data sources" />
        <div style={{ margin: "0 14px", padding: "11px 13px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <EText value={dataText} onChange={setDataText} as="div" style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, fontFamily: "monospace" }} />
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const, marginTop: 10 }}>
            {["ACLED", "FIRMS", "GDELT", "RSS", "Telegram", "Google Trends", "AP", "Reuters", "Al Jazeera", "BBC"].map(s => (
              <SourceBadge key={s} name={s} />
            ))}
          </div>
        </div>

        {/* ── SECURITY ── */}
        <SLabel text="security & privacy" />
        <div style={{ margin: "0 14px 24px", padding: "11px 13px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <EText value={securityText} onChange={setSecurityText} as="div" style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, fontFamily: "monospace" }} />
        </div>

      </div>
    </div>
  );
}
