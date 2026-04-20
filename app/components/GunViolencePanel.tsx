"use client";
import React, { useState } from "react";
import { T, clr } from "../lib/tokens";
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
    text: "8 killed, 2 injured in domestic dispute across two homes in Louisiana",
    description: "Eight children and juveniles ages 1–14 killed across two homes in what authorities describe as a domestic dispute. Suspect fled, carjacked a vehicle, and was killed by police during pursuit. Mayor Tom Arceneaux: \"maybe the worst tragic situation we've ever had in Shreveport.\"",
    danger: 5,
    confidence: 97,
    sources: ["AP", "Reuters", "Local PD"],
    pulse: true,
    flyTo: { center: [-93.7502, 32.5252], zoom: 10 },
  },
  {
    id: "iowa-city-2026-04-19",
    time: "2026-04-19T01:46:00",
    text: "5 shot near University of Iowa campus in Iowa City",
    description: "Five shot, one critically, after a large fight on the pedestrian mall near University of Iowa. At least three victims are UI students. Police released surveillance photos of four persons of interest. No arrests made.",
    danger: 3,
    confidence: 95,
    sources: ["AP", "UI Police"],
    flyTo: { center: [-91.53, 41.66], zoom: 14 },
  },
  {
    id: "chicago-2026-04-12",
    time: "2026-04-12T00:00:00",
    text: "3 killed, 7 injured in South Side drive-by shooting in Chicago",
    description: "Drive-by shooting on Chicago's South Side injures seven and kills three during an outdoor gathering. CPD believes the attack was gang-related. Two persons of interest detained.",
    danger: 4,
    confidence: 96,
    sources: ["CPD", "Chicago Tribune"],
    flyTo: { center: [-87.63, 41.83], zoom: 12 },
  },
  {
    id: "houston-2026-04-08",
    time: "2026-04-08T00:00:00",
    text: "2 killed, 6 injured at concert venue shooting in Houston",
    description: "Shooting at a concert venue in north Houston leaves two dead and six injured. Suspect identified and at large. ATF and HPD jointly investigating.",
    danger: 3,
    confidence: 94,
    sources: ["ATF", "HPD"],
    flyTo: { center: [-95.37, 29.76], zoom: 12 },
  },
];

// ── 2026 YTD casualty data (Gun Violence Archive, as of April 19) ─────
const CASUALTIES = {
  killed: "13,798",
  injured: "26,416",
  massShootings: "332",
};

interface Props {
  onClose: () => void;
  onFlyTo?: (center: [number, number], zoom: number) => void;
  highlightId?: string;
}

export default function GunViolencePanel({ onClose, onFlyTo, highlightId }: Props) {
  const [lockedAlertIdx, setLockedAlertIdx] = useState<number | null>(null);
  const [hoveredAlert, setHoveredAlert] = useState<number | null>(null);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  return (
    <div
      className="absolute left-6 z-20 w-[520px]"
      style={{ top: 72, bottom: 24, display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          scrollbarWidth: "none",
          background: clr.panel(),
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderRadius: 20,
          border: `1px solid ${clr.white(0.07)}`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: "18px 20px 16px", borderBottom: `1px solid ${clr.white(0.06)}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{
                fontSize: 20,
                fontWeight: 700,
                color: clr.white(0.92),
                letterSpacing: "-0.01em",
                lineHeight: 1.15,
              }}>
                Gun Violence in America
              </div>
              <div style={{
                fontSize: 11,
                color: clr.white(0.42),
                marginTop: 4,
                fontFamily: T.MONO,
              }}>
                2026
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: clr.white(0.3),
                fontSize: 18,
                padding: "2px 6px",
                lineHeight: 1,
                flexShrink: 0,
              }}
            >✕</button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, display: "flex", flexDirection: "column" }}>

          {/* ── Casualties ── */}
          <div style={{ padding: "8px 14px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", fontWeight: "normal", paddingBottom: 4, letterSpacing: "0.08em" }}>2026 YTD</th>
                  <th style={{ textAlign: "right", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", fontWeight: "normal", paddingBottom: 4, letterSpacing: "0.08em", paddingRight: 8 }}>Injured</th>
                  <th style={{ textAlign: "right", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", fontWeight: "normal", paddingBottom: 4, letterSpacing: "0.08em", paddingRight: 8 }}>Killed</th>
                  <th style={{ textAlign: "right", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", fontWeight: "normal", paddingBottom: 4, letterSpacing: "0.08em" }}>Incidents</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.72)", paddingTop: 2, paddingBottom: 6 }}>USA</td>
                  <td style={{ textAlign: "right", fontSize: 14, fontFamily: "monospace", fontWeight: 700, color: "rgba(255,255,255,0.88)", paddingTop: 2, paddingBottom: 6, paddingRight: 8 }}>{CASUALTIES.injured}</td>
                  <td style={{ textAlign: "right", fontSize: 14, fontFamily: "monospace", fontWeight: 700, color: "rgba(255,255,255,0.88)", paddingTop: 2, paddingBottom: 6, paddingRight: 8 }}>{CASUALTIES.killed}</td>
                  <td style={{ textAlign: "right", fontSize: 14, fontFamily: "monospace", fontWeight: 700, color: "rgba(255,255,255,0.88)", paddingTop: 2, paddingBottom: 6 }}>{CASUALTIES.massShootings}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Live alerts ── */}
          <div style={{ padding: "14px 6px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <p
              onClick={() => LIVE_ALERTS.length > 4 && setShowAllAlerts(v => !v)}
              style={{
                margin: "0 0 6px 12px",
                fontSize: 11,
                fontFamily: "monospace",
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.42)",
                textTransform: "uppercase",
                fontWeight: 500,
                cursor: LIVE_ALERTS.length > 4 ? "pointer" : "default",
              }}
              onMouseEnter={e => LIVE_ALERTS.length > 4 && (e.currentTarget.style.color = "rgba(255,255,255,0.58)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.42)")}
            >
              live alerts
            </p>
            {(showAllAlerts ? LIVE_ALERTS : LIVE_ALERTS.slice(0, 4)).map((alert, i, arr) => {
              const isLocked = lockedAlertIdx === i;
              return (
                <div key={alert.id}>
                  <LiveAlertRow
                    item={alert}
                    bottomBorder={i < arr.length - 1}
                    showConfidenceInline={false}
                    expandOnHover={true}
                    defaultExpanded={highlightId === alert.id}
                    isActive={isLocked || hoveredAlert === i}
                    onClick={() => {
                      setLockedAlertIdx(prev => prev === i ? null : i);
                      onFlyTo?.(alert.flyTo.center, alert.flyTo.zoom);
                    }}
                    onHoverChange={(active) => {
                      if (active) setHoveredAlert(i);
                      else setHoveredAlert(null);
                    }}
                  />
                </div>
              );
            })}
            {showAllAlerts && LIVE_ALERTS.length > 4 && (
              <div style={{ padding: "8px 12px", textAlign: "center" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAllAlerts(false); }}
                  style={{
                    fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em",
                    color: "rgba(255,255,255,0.35)", background: "none", border: "none",
                    cursor: "pointer", padding: "2px 0", textTransform: "uppercase",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.58)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                >
                  see less
                </button>
              </div>
            )}
          </div>

          {/* ── Timeline ── */}
          <div style={{ padding: "0 16px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.42)", textTransform: "uppercase", margin: 0, fontWeight: 500 }}>
                timeline
              </p>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 1, background: "rgba(255,255,255,0.05)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", gap: 12, paddingLeft: 4 }}>
                  <div style={{ flexShrink: 0, marginTop: 4 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.3)", boxShadow: "0 0 6px rgba(255,255,255,0.25)" }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 5px" }}>
                      <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: "rgba(255,255,255,0.92)", letterSpacing: "0.03em" }}>
                        April 19
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.5 }}>
                      Two mass shootings in Louisiana and Iowa mark one of the deadliest days of 2026, bringing the year's total to 152 incidents.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: "10px 20px 14px", borderTop: `1px solid ${clr.white(0.05)}`, flexShrink: 0 }}>
          <p style={{
            margin: 0,
            fontSize: 9,
            fontFamily: T.MONO,
            letterSpacing: "0.16em",
            color: clr.white(0.22),
            textAlign: "center",
            textTransform: "uppercase",
          }}>
            Gun Violence Archive · Atlas Intelligence
          </p>
        </div>
      </div>
    </div>
  );
}
