"use client";
import React from "react";

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

interface Props {
  onClose: () => void;
  onBack: () => void;
  spinEnabled: boolean;
  onSpinChange: (v: boolean) => void;
}

export default function SettingsSubPanel({ onClose, onBack, spinEnabled, onSpinChange }: Props) {
  return (
    <div style={PANEL}>
      <button onClick={onClose} style={{ position: "absolute", top: 10, right: 12, zIndex: 10, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 14, lineHeight: 1 }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>×</button>
      <button onClick={onBack} style={{ position: "absolute", top: 11, left: 14, zIndex: 10, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", padding: 0 }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>← back</button>

      <div style={{ flex: 1, overflowY: "auto", paddingTop: 38 }}>
        <div style={{ margin: "0 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px" }}>
            <div>
              <div style={{ fontSize: 13, fontFamily: "monospace", color: "rgba(255,255,255,0.78)" }}>spinning globe</div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.28)", marginTop: 2 }}>auto-rotate when no panel is open</div>
            </div>
            <button
              onClick={() => onSpinChange(!spinEnabled)}
              style={{
                width: 36, height: 20, borderRadius: 10,
                background: spinEnabled ? "rgba(96,165,250,0.6)" : "rgba(255,255,255,0.1)",
                border: spinEnabled ? "1px solid rgba(96,165,250,0.4)" : "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer", position: "relative", transition: "background 0.2s, border-color 0.2s", flexShrink: 0, padding: 0,
              }}
            >
              <div style={{
                width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,0.9)",
                position: "absolute", top: 2, left: spinEnabled ? 18 : 2,
                transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
              }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
