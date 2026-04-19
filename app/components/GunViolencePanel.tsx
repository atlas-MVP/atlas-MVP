"use client";
import React, { useState } from "react";
import { T, clr } from "../lib/tokens";
import EventUploadButton from "./EventUploadButton";
import LiveAlertRow from "./LiveAlertRow";

// ── Live Alert data (recent incidents) ────────────────────────────────────
interface LiveAlert {
  time: string;
  text: string;
  description: string;
  danger: number;
  confidence: number;
  sources: string[];
  pulse?: boolean;
  flyTo: { center: [number, number]; zoom: number };
  id: string;
}

const LIVE_ALERTS: LiveAlert[] = [
  {
    id: "shreveport-2026-04-19",
    time: "2026-04-19T12:14:00",
    text: "Shreveport, LA — 8 killed, 2 injured in domestic dispute across two homes",
    description: "Eight children and juveniles ages 1–14 killed across two homes in what authorities describe as a domestic dispute. Suspect fled, carjacked a vehicle, and was killed by police during pursuit. Mayor Tom Arceneaux: \"maybe the worst tragic situation we've ever had in Shreveport.\"",
    danger: 5,
    confidence: 97,
    sources: ["AP", "Reuters", "Local PD"],
    pulse: true,
    flyTo: { center: [-93.75, 32.52], zoom: 12 },
  },
  {
    id: "iowa-city-2026-04-19",
    time: "2026-04-19T01:46:00",
    text: "Iowa City, IA — 5 shot near University of Iowa campus",
    description: "Five shot, one critically, after a large fight on the pedestrian mall near University of Iowa. At least three victims are UI students. Police released surveillance photos of four persons of interest. No arrests made.",
    danger: 3,
    confidence: 95,
    sources: ["AP", "UI Police"],
    flyTo: { center: [-91.53, 41.66], zoom: 14 },
  },
  {
    id: "chicago-2026-04-12",
    time: "2026-04-12T00:00:00",
    text: "Chicago, IL — 3 killed, 7 injured in South Side drive-by shooting",
    description: "Drive-by shooting on Chicago's South Side injures seven and kills three during an outdoor gathering. CPD believes the attack was gang-related. Two persons of interest detained.",
    danger: 4,
    confidence: 96,
    sources: ["CPD", "Chicago Tribune"],
    flyTo: { center: [-87.63, 41.83], zoom: 12 },
  },
  {
    id: "houston-2026-04-08",
    time: "2026-04-08T00:00:00",
    text: "Houston, TX — 2 dead, 6 injured at concert venue shooting",
    description: "Shooting at a concert venue in north Houston leaves two dead and six injured. Suspect identified and at large. ATF and HPD jointly investigating.",
    danger: 3,
    confidence: 94,
    sources: ["ATF", "HPD"],
    flyTo: { center: [-95.37, 29.76], zoom: 12 },
  },
];

// ── 2026 YTD casualty data ─────────────────────────────────────────────
const CASUALTIES = {
  killed: "5,247",
  injured: "9,834",
  massShootings: "152",
};

function eventFolderId(incidentId: string): string {
  return `gun-violence-${incidentId}`;
}

interface Props {
  onClose: () => void;
  onFlyTo?: (center: [number, number], zoom: number) => void;
  highlightId?: string; // incident to scroll-highlight on open
}

export default function GunViolencePanel({ onClose, onFlyTo, highlightId }: Props) {
  const [activeIdx, setActiveIdx]       = useState<number>(() => {
    if (!highlightId) return -1;
    const i = LIVE_ALERTS.findIndex(inc => inc.id === highlightId);
    return i >= 0 ? i : -1;
  });
  const [uploadTick, setUploadTick]     = useState(0);
  const [editorOpen, setEditorOpen]     = useState(false);

  const activeIncident = activeIdx >= 0 ? LIVE_ALERTS[activeIdx] : null;
  const evId = activeIncident ? eventFolderId(activeIncident.id) : "";

  return (
    <>
      {/* ── Main panel ── */}
      <div
        className="absolute left-6 z-20 w-[520px]"
        style={{ top: 72, bottom: 24, display: "flex", flexDirection: "column" }}
      >
        <div
          style={{
            flex: 1, overflowY: "auto", scrollbarWidth: "none",
            background: clr.panel(),
            backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
            borderRadius: 20,
            border: `1px solid ${clr.white(0.07)}`,
            boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
            display: "flex", flexDirection: "column",
          }}
        >
          {/* ── Header ── */}
          <div style={{ padding: "18px 20px 16px", borderBottom: `1px solid ${clr.white(0.06)}`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{
                  fontSize: 20, fontWeight: 700, color: clr.white(0.92),
                  letterSpacing: "-0.01em", lineHeight: 1.15,
                }}>
                  Gun Violence in America
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: clr.white(0.3), fontSize: 18, padding: "2px 6px", lineHeight: 1, flexShrink: 0,
                }}
              >✕</button>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 28, marginTop: 18 }}>
              {([["Killed", CASUALTIES.killed], ["Injured", CASUALTIES.injured], ["Mass shootings", CASUALTIES.massShootings]] as [string, string][]).map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: clr.white(0.92), fontFamily: T.MONO }}>{value}</div>
                  <div style={{ fontSize: 9, color: clr.white(0.42), letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 3 }}>{label} · 2026 YTD</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Incident list ── */}
          <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "10px 0 16px" }}>
            <div style={{
              fontSize: 10, fontFamily: T.MONO, letterSpacing: T.TRACK_XWIDE,
              color: clr.white(0.42), textTransform: "uppercase",
              padding: "6px 20px 10px",
            }}>
              Recent Incidents
            </div>

            {LIVE_ALERTS.map((inc, i) => {
              const isActive = activeIdx === i;
              return (
                <div
                  key={inc.id}
                  onClick={() => {
                    setActiveIdx(isActive ? -1 : i);
                    if (!isActive) onFlyTo?.(inc.flyTo.center, inc.flyTo.zoom);
                  }}
                  style={{
                    margin: "2px 10px",
                    opacity: isActive || activeIdx < 0 ? 1 : 0.45,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  <LiveAlertRow
                    item={inc}
                    bottomBorder={i < LIVE_ALERTS.length - 1}
                    showConfidenceInline={false}
                    expandOnHover
                    defaultExpanded={isActive}
                  />
                </div>
              );
            })}
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: "10px 20px 14px", borderTop: `1px solid ${clr.white(0.05)}`, flexShrink: 0,
          }}>
            <p style={{
              margin: 0, fontSize: 9, fontFamily: T.MONO, letterSpacing: "0.16em",
              color: clr.white(0.22), textAlign: "center", textTransform: "uppercase",
            }}>
              Gun Violence Archive · Atlas Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* ── Upload + edit buttons (gap zone, right of panel) ── */}
      {activeIncident && (
        <>
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: "fixed", left: T.PANEL_W + 12, top: T.GAP_UPLOAD_TOP, zIndex: 25, pointerEvents: "auto" }}
          >
            <EventUploadButton
              eventId={`${evId}-${uploadTick}`}
              onUploaded={() => setUploadTick(t => t + 1)}
            />
          </div>
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: "fixed", left: T.PANEL_W + 12, top: T.GAP_EDIT_TOP, zIndex: 25, pointerEvents: "auto" }}
          >
            <button
              onClick={() => setEditorOpen(v => !v)}
              style={{
                fontSize: 9, fontFamily: T.MONO, letterSpacing: T.TRACK_MED,
                textTransform: "uppercase", color: clr.white(0.4),
                background: clr.white(0.06), border: `1px solid ${clr.white(0.12)}`,
                borderRadius: T.PILL_RADIUS, padding: "4px 10px",
                cursor: "pointer", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = clr.white(0.12); e.currentTarget.style.color = clr.white(0.8); }}
              onMouseLeave={e => { e.currentTarget.style.background = clr.white(0.06); e.currentTarget.style.color = clr.white(0.4); }}
            >edit</button>
          </div>
        </>
      )}
    </>
  );
}
