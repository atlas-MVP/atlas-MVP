"use client";
import React, { useState } from "react";
import { EText, useEditMode, useSetEditMode } from "./InlineEdit";

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

function Toggle({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 13px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div>
        <div style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.75)", letterSpacing: "0.02em" }}>{label}</div>
        {hint && <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.28)", marginTop: 2 }}>{hint}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 36, height: 20, borderRadius: 10,
          background: value ? "rgba(96,165,250,0.6)" : "rgba(255,255,255,0.1)",
          border: value ? "1px solid rgba(96,165,250,0.4)" : "1px solid rgba(255,255,255,0.12)",
          cursor: "pointer", position: "relative", transition: "background 0.2s, border-color 0.2s", flexShrink: 0,
          padding: 0,
        }}
      >
        <div style={{
          width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,0.9)",
          position: "absolute", top: 2,
          left: value ? 18 : 2,
          transition: "left 0.2s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }} />
      </button>
    </div>
  );
}

interface Props { onClose: () => void; onBack: () => void; }

export default function SettingsSubPanel({ onClose, onBack }: Props) {
  const editMode    = useEditMode();
  const setEditMode = useSetEditMode();

  const [liveAlerts,  setLiveAlerts]  = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [darkMode,    setDarkMode]    = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [spinGlobe,   setSpinGlobe]   = useState(true);
  const [showBorders, setShowBorders] = useState(true);

  return (
    <div style={PANEL}>
      <button onClick={onClose} style={{ position: "absolute", top: 10, right: 12, zIndex: 10, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 14, lineHeight: 1 }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>×</button>
      <button onClick={onBack} style={{ position: "absolute", top: 11, left: 14, zIndex: 10, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", padding: 0 }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>← back</button>

      <div style={{ flex: 1, overflowY: "auto", paddingTop: 38 }}>

        {/* Header */}
        <div style={{ padding: "0 18px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)", letterSpacing: "0.02em" }}>settings</h2>
          <p style={{ margin: "4px 0 0", fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.32)", letterSpacing: "0.04em" }}>preferences · display · editing</p>
        </div>

        {/* Edit mode */}
        <SLabel text="editing" />
        <div style={{ margin: "0 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 13px" }}>
            <div>
              <div style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.75)" }}>Edit mode</div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.28)", marginTop: 2 }}>Click any text on screen to edit font, size, color &amp; content</div>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                width: 36, height: 20, borderRadius: 10,
                background: editMode ? "rgba(96,165,250,0.6)" : "rgba(255,255,255,0.1)",
                border: editMode ? "1px solid rgba(96,165,250,0.4)" : "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0, padding: 0,
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,0.9)", position: "absolute", top: 2, left: editMode ? 18 : 2, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} />
            </button>
          </div>
        </div>

        {/* Alerts */}
        <SLabel text="alerts" />
        <div style={{ margin: "0 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <Toggle label="Live alerts"  hint="Real-time conflict & event updates"  value={liveAlerts}  onChange={setLiveAlerts} />
          <Toggle label="Sound alerts" hint="Audio ping on Danger 5 events"       value={soundAlerts} onChange={setSoundAlerts} />
        </div>

        {/* Display */}
        <SLabel text="display" />
        <div style={{ margin: "0 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <Toggle label="Dark mode"    hint="High-contrast dark interface"       value={darkMode}    onChange={setDarkMode} />
          <Toggle label="Compact view" hint="Reduce panel padding and font size" value={compactView} onChange={setCompactView} />
        </div>

        {/* Map */}
        <SLabel text="map" />
        <div style={{ margin: "0 14px 24px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <Toggle label="Spinning globe"  hint="Auto-rotate when no panel is open" value={spinGlobe}   onChange={setSpinGlobe} />
          <Toggle label="Country borders" hint="Show political borders on idle globe" value={showBorders} onChange={setShowBorders} />
        </div>

      </div>
    </div>
  );
}
