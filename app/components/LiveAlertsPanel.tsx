"use client";

import { useState, useRef } from "react";

export interface LiveAlert {
  time: string;
  text: string;
  description: string;
  danger: number;
  confidence: number;
  sources: string[];
  flyTo: { center: [number, number]; zoom: number };
}

export const CONFLICT_ALERTS: Record<string, LiveAlert[]> = {
  "israel-iran": [
    {
      time: "NOW", danger: 5, confidence: 96, sources: ["AP", "Reuters", "ACLED"],
      text: "Israel-Lebanon border exchange — IDF artillery responds to Hezbollah rocket fire in Galilee",
      description: "IDF artillery units opened fire on southern Lebanese villages after Hezbollah launched a salvo of 40+ rockets targeting Galilee communities. Evacuation orders in effect for several northern Israeli towns. Lebanese civil defense reports casualties in Bint Jbeil district.",
      flyTo: { center: [35.2, 33.1] as [number, number], zoom: 7 },
    },
    {
      time: "12m", danger: 5, confidence: 93, sources: ["Reuters", "AP"],
      text: "US 5th Fleet announces heightened readiness posture in Persian Gulf",
      description: "The US Navy's 5th Fleet, headquartered in Bahrain, has raised its alert status following intelligence reports of Iranian naval mobilization near the Strait of Hormuz. Two additional destroyers are being repositioned.",
      flyTo: { center: [50.5, 26.2] as [number, number], zoom: 5 },
    },
  ],
  "israel-gaza": [
    {
      time: "55m", danger: 4, confidence: 94, sources: ["AP", "Al Jazeera"],
      text: "Northern Gaza hospitals running on emergency reserves — collapse imminent",
      description: "Al-Ahli Arab Hospital and Kamal Adwan Hospital in northern Gaza have issued emergency declarations after fuel stocks dropped below 24-hour reserves. UNRWA reports 14 aid trucks held at Kerem Shalom crossing for 11 days.",
      flyTo: { center: [34.4, 31.6] as [number, number], zoom: 8 },
    },
  ],
  "russia-ukraine": [
    {
      time: "28m", danger: 4, confidence: 89, sources: ["NYT", "Reuters"],
      text: "Ukraine reports overnight drone barrage — Kyiv air defenses activated",
      description: "Russia launched 78 Shahed-136 drones in an overnight wave targeting Kyiv, Odessa, and Kharkiv. Ukrainian air defense intercepted 61 drones. Three civilians killed, 14 injured.",
      flyTo: { center: [30.5, 50.4] as [number, number], zoom: 6 },
    },
  ],
  "taiwan-strait": [
    {
      time: "1h 10m", danger: 2, confidence: 79, sources: ["ACLED", "GDELT"],
      text: "PLA carrier group Shandong approaches Taiwan median line — GDELT naval index elevated",
      description: "The PLA Navy carrier strike group led by the Shandong has approached within 40 nautical miles of the Taiwan Strait median line. Taiwan's MND has scrambled F-16 and Mirage 2000 fighters.",
      flyTo: { center: [121.5, 24.5] as [number, number], zoom: 6.5 },
    },
  ],
};

function dangerColor(d: number): string {
  if (d >= 5) return "#ef4444";
  if (d >= 4) return "#c026d3";
  if (d >= 3) return "#a855f7";
  if (d >= 2) return "#818cf8";
  return "#60a5fa";
}

const PANEL_W = 360;
const PANEL_RIGHT = 20;

interface Props {
  conflictId: string | null;
  pinnedAlertText?: string;
  onFocusPosition?: (center: [number, number], zoom: number) => void;
  onSourceClick?: (source: string) => void;
}

export default function LiveAlertsPanel({ conflictId, pinnedAlertText, onFocusPosition, onSourceClick }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [hoveredAlert, setHoveredAlert] = useState<number | null>(null);
  const [lockedAlert, setLockedAlert] = useState<number | null>(null);
  const [hoverMidY, setHoverMidY] = useState(0);
  const [openedSources, setOpenedSources] = useState<number | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelLeave = () => {
    if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
  };
  const scheduleLeave = () => {
    cancelLeave();
    leaveTimer.current = setTimeout(() => {
      if (lockedAlert === null) { setHoveredAlert(null); setOpenedSources(null); }
    }, 120);
  };

  const activeAlert = hoveredAlert ?? lockedAlert;

  // Global mode (radar view): flatten all conflicts sorted by danger desc
  // Conflict mode: show alerts for that specific conflict
  const allAlerts = conflictId
    ? (CONFLICT_ALERTS[conflictId] ?? [])
    : Object.values(CONFLICT_ALERTS).flat().sort((a, b) => b.danger - a.danger);
  if (allAlerts.length === 0) return null;

  const pinned = pinnedAlertText
    ? (allAlerts.find(a => a.text === pinnedAlertText) ?? allAlerts[0])
    : allAlerts[0];
  const rest = allAlerts.filter(a => a !== pinned);
  const pinnedIdx = allAlerts.indexOf(pinned);

  return (
    <>
      {/* Panel */}
      <div style={{
        position: "absolute",
        top: 72, right: PANEL_RIGHT, bottom: 20,
        width: PANEL_W,
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        background: "rgba(4,6,18,0.72)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        backdropFilter: "blur(40px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
        overflow: "hidden",
        pointerEvents: "auto",
      }}>
        {/* Header */}
        <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.75)", fontWeight: 800 }}>live alerts</span>
        </div>

        {/* Alert list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px 16px", display: "flex", flexDirection: "column", gap: 5 }}>

          {/* Pinned alert — always shown expanded */}
          <div
            onMouseEnter={e => {
              cancelLeave();
              setLockedAlert(null);
              setOpenedSources(null);
              setHoveredAlert(pinnedIdx);
              setHoverMidY(e.currentTarget.getBoundingClientRect().top + e.currentTarget.getBoundingClientRect().height / 2);
            }}
            onMouseLeave={scheduleLeave}
            onClick={() => onFocusPosition?.(pinned.flyTo.center, pinned.flyTo.zoom)}
            style={{
              padding: "10px 11px", borderRadius: 10, cursor: "pointer",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: dangerColor(pinned.danger), boxShadow: `0 0 5px ${dangerColor(pinned.danger)}`, flexShrink: 0, marginTop: 4 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5, fontWeight: 600 }}>{pinned.text}</span>
                <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.22)", marginLeft: 7 }}>{pinned.time}</span>
              </div>
            </div>
            <p style={{ margin: "8px 0 0 14px", fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{pinned.description}</p>
          </div>

          {/* Expanded rest */}
          {expanded && rest.map((a, ri) => {
            const idx = allAlerts.indexOf(a);
            const isExpanded = expandedIdx === ri;
            return (
              <div
                key={ri}
                onMouseEnter={e => {
                  cancelLeave();
                  setLockedAlert(null);
                  setOpenedSources(null);
                  setHoveredAlert(idx);
                  setHoverMidY(e.currentTarget.getBoundingClientRect().top + e.currentTarget.getBoundingClientRect().height / 2);
                }}
                onMouseLeave={scheduleLeave}
                onClick={() => { setExpandedIdx(isExpanded ? null : ri); onFocusPosition?.(a.flyTo.center, a.flyTo.zoom); }}
                style={{
                  padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: dangerColor(a.danger), boxShadow: `0 0 5px ${dangerColor(a.danger)}`, flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{a.text}</span>
                    <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.22)", marginLeft: 7 }}>{a.time}</span>
                  </div>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", flexShrink: 0, marginTop: 2 }}>{isExpanded ? "▲" : "▼"}</span>
                </div>
                {isExpanded && (
                  <p style={{ margin: "8px 0 0 14px", fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{a.description}</p>
                )}
              </div>
            );
          })}

          {/* See more / less */}
          {rest.length > 0 && (
            <button
              onClick={() => setExpanded(v => !v)}
              style={{
                background: "none", border: "none", padding: "2px 0", cursor: "pointer",
                fontFamily: "monospace", fontSize: 9, letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.28)", textAlign: "left",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
            >
              {expanded ? "▲ show less" : `▼ +${rest.length} more alerts`}
            </button>
          )}
        </div>
      </div>

      {/* Confidence popup — sibling outside panel, extends LEFT */}
      {activeAlert !== null && (() => {
        const item = allAlerts[activeAlert];
        if (!item) return null;
        const confColor = item.confidence >= 90 ? "#22c55e" : item.confidence >= 80 ? "#86efac" : item.confidence >= 70 ? "#fbbf24" : "#f87171";
        const sourcesOpen = openedSources === activeAlert;
        return (
          <div
            onMouseEnter={cancelLeave}
            onMouseLeave={scheduleLeave}
            style={{
              position: "fixed",
              right: PANEL_RIGHT + PANEL_W - 14,
              top: hoverMidY - 20,
              paddingRight: 14,
              paddingTop: 12,
              paddingBottom: 16,
              paddingLeft: 20,
              zIndex: 21,
              pointerEvents: "auto",
            }}
          >
            <div
              onClick={() => {
                setLockedAlert(activeAlert);
                setOpenedSources(sourcesOpen ? null : activeAlert);
              }}
              style={{
                height: 4, width: 90, borderRadius: 99,
                background: `${confColor}22`,
                border: `1px solid ${confColor}44`,
                cursor: "pointer", overflow: "hidden",
              }}
            >
              <div style={{ height: "100%", width: `${item.confidence}%`, background: confColor, borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 8, fontFamily: "monospace", color: confColor, letterSpacing: "0.1em", marginTop: 3, opacity: 0.7 }}>
              {item.confidence}% confidence
            </div>
            {sourcesOpen && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                {item.sources.map(s => (
                  <button
                    key={s}
                    onClick={e => { e.stopPropagation(); onSourceClick?.(s); }}
                    style={{
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 6, padding: "5px 10px", cursor: "pointer",
                      fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em",
                      color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  >{s}</button>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </>
  );
}
