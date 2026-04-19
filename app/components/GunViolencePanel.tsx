"use client";
import React, { useState } from "react";
import { T, clr } from "../lib/tokens";
import EventUploadButton from "./EventUploadButton";

// ── Incident data ─────────────────────────────────────────────────────────────
export interface GunIncident {
  id: string;
  date: string;
  time?: string;
  location: string;
  state: string;
  killed: number;
  injured: number;
  description: string;
  mapView: { center: [number, number]; zoom: number };
  highlight?: boolean;
}

const INCIDENTS: GunIncident[] = [
  {
    id: "shreveport-2026-04-19",
    date: "April 19, 2026",
    time: "12:14 PM",
    location: "Shreveport, LA",
    state: "Louisiana",
    killed: 8,
    injured: 2,
    highlight: true,
    description: "Eight children and juveniles ages 1–14 killed across two homes in what authorities describe as a domestic dispute. Suspect fled, carjacked a vehicle, and was killed by police during pursuit. Mayor Tom Arceneaux: \"maybe the worst tragic situation we've ever had in Shreveport.\"",
    mapView: { center: [-93.75, 32.52], zoom: 12 },
  },
  {
    id: "iowa-city-2026-04-19",
    date: "April 19, 2026",
    time: "1:46 AM",
    location: "Iowa City, IA",
    state: "Iowa",
    killed: 0,
    injured: 5,
    description: "Five shot, one critically, after a large fight on the pedestrian mall near University of Iowa. At least three victims are UI students. Police released surveillance photos of four persons of interest. No arrests made.",
    mapView: { center: [-91.53, 41.66], zoom: 14 },
  },
  {
    id: "chicago-2026-04-12",
    date: "April 12, 2026",
    location: "Chicago, IL",
    state: "Illinois",
    killed: 3,
    injured: 7,
    description: "Drive-by shooting on Chicago's South Side injures seven and kills three during an outdoor gathering. CPD believes the attack was gang-related. Two persons of interest detained.",
    mapView: { center: [-87.63, 41.83], zoom: 12 },
  },
  {
    id: "houston-2026-04-08",
    date: "April 8, 2026",
    location: "Houston, TX",
    state: "Texas",
    killed: 2,
    injured: 6,
    description: "Shooting at a concert venue in north Houston leaves two dead and six injured. Suspect identified and at large. ATF and HPD jointly investigating.",
    mapView: { center: [-95.37, 29.76], zoom: 12 },
  },
  {
    id: "memphis-2026-03-31",
    date: "March 31, 2026",
    location: "Memphis, TN",
    state: "Tennessee",
    killed: 4,
    injured: 3,
    description: "Shooting at a nightclub in downtown Memphis kills four and injures three. Witnesses describe an altercation that escalated into gunfire. Investigation ongoing.",
    mapView: { center: [-90.05, 35.15], zoom: 12 },
  },
  {
    id: "atlanta-2026-03-22",
    date: "March 22, 2026",
    location: "Atlanta, GA",
    state: "Georgia",
    killed: 1,
    injured: 9,
    description: "Gunfire erupts at a St. Patrick's Day weekend block party in southwest Atlanta, wounding nine and killing one. GBI assisting Atlanta PD. No suspects in custody.",
    mapView: { center: [-84.39, 33.75], zoom: 12 },
  },
];

// ── 2026 YTD stats (sourced from Gun Violence Archive) ─────────────────────
const STATS = [
  { label: "Killed", value: "5,247" },
  { label: "Injured", value: "9,834" },
  { label: "Mass shootings", value: "152" },
];

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
    const i = INCIDENTS.findIndex(inc => inc.id === highlightId);
    return i >= 0 ? i : -1;
  });
  const [uploadTick, setUploadTick]     = useState(0);
  const [editorOpen, setEditorOpen]     = useState(false);

  const activeIncident = activeIdx >= 0 ? INCIDENTS[activeIdx] : null;
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
              {STATS.map(s => (
                <div key={s.label}>
                  <div style={{
                    fontSize: 22, fontWeight: 700, color: clr.white(0.92), fontFamily: T.MONO,
                  }}>{s.value}</div>
                  <div style={{
                    fontSize: 9, color: clr.white(0.42), letterSpacing: "0.12em",
                    textTransform: "uppercase", marginTop: 3,
                  }}>{s.label} · 2026 YTD</div>
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

            {INCIDENTS.map((inc, i) => {
              const isActive = activeIdx === i;
              return (
                <div
                  key={inc.id}
                  onClick={() => {
                    setActiveIdx(isActive ? -1 : i);
                    if (!isActive) onFlyTo?.(inc.mapView.center, inc.mapView.zoom);
                  }}
                  style={{
                    padding: "14px 16px 16px 14px",
                    margin: "2px 10px",
                    borderRadius: 14,
                    border: `1px solid ${clr.white(0.06)}`,
                    background: isActive ? clr.white(0.03) : clr.white(0.012),
                    cursor: "pointer",
                    opacity: isActive || activeIdx < 0 ? 1 : 0.45,
                    transition: "opacity 0.3s ease, background 0.2s ease",
                  }}
                >
                  {/* Date + location row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{
                      fontSize: 10, fontFamily: T.MONO, fontWeight: 600,
                      color: clr.white(0.55), letterSpacing: "0.04em",
                    }}>
                      {inc.date}{inc.time ? ` · ${inc.time}` : ""}
                    </span>
                    {inc.highlight && (
                      <span style={{
                        fontSize: 8, fontFamily: T.MONO, letterSpacing: T.TRACK_WIDE,
                        textTransform: "uppercase", padding: "1px 6px", borderRadius: 3,
                        background: clr.white(0.08), color: clr.white(0.6),
                        border: `1px solid ${clr.white(0.12)}`,
                      }}>breaking</span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Location */}
                      <div style={{
                        fontSize: 14, fontWeight: 700, color: clr.white(0.88),
                        letterSpacing: "0.01em", marginBottom: 4,
                      }}>
                        {inc.location}
                      </div>

                      {/* Killed / injured - styled like conflict stats */}
                      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                        <span style={{
                          fontSize: 12, fontFamily: T.MONO, fontWeight: 700,
                          color: clr.white(0.88),
                        }}>{inc.killed} killed</span>
                        <span style={{
                          fontSize: 12, fontFamily: T.MONO,
                          color: clr.white(0.35),
                        }}>{inc.injured} injured</span>
                      </div>

                      {/* Description */}
                      <p style={{
                        margin: 0, fontSize: 12, color: clr.white(0.55),
                        lineHeight: 1.6, fontFamily: T.MONO,
                      }}>
                        {inc.description}
                      </p>
                    </div>
                  </div>
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
