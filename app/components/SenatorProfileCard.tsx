"use client";

import { useEffect, useState } from "react";
import type { SenatorScorecard } from "../api/senator-alignment/[bioguide]/route";
import IssueScoreSection from "./IssueScoreSection";

interface Props {
  bioguide: string;
  name: string;
  photo: string;
  party: "R" | "D" | "I";
  state: string;
  age: number;
  yearsInOffice: number;
  nextElection: number;
  runningAgain: boolean;
  officialUrl: string;
  onClose: () => void;
}

const STATE_NAMES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",
  CO:"Colorado",CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",
  HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",
  KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",
  MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",
  NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",
  NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",
  OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",
  SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",
  VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
};

export default function SenatorProfileCard({
  bioguide, name, photo, party, state, age, yearsInOffice,
  nextElection, runningAgain, officialUrl, onClose,
}: Props) {
  const [data, setData] = useState<SenatorScorecard | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoEnlarged, setPhotoEnlarged] = useState(false);

  useEffect(() => {
    fetch(`/api/senator-alignment/${bioguide}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bioguide]);

  const partyLabel = party === "R" ? "Republican" : party === "D" ? "Democrat" : "Independent";
  const contactUrl = officialUrl.replace(/\/$/, "") + "/contact";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 299,
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)",
        }}
      />

      {/* Card — 488px, right-anchored, vertically centered */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 300,
          width: 488,
          height: "calc(100vh - 56px)",
          background: "rgba(4,6,18,0.97)",
          backdropFilter: "blur(40px)",
          borderRadius: 16,
          border: `1px solid rgba(${party === "R" ? "239,68,68" : party === "D" ? "96,165,250" : "160,160,160"},0.3)`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 10, right: 12, zIndex: 10,
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.25)", fontSize: 18, lineHeight: 1, padding: 4,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
        >×</button>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 28px" }}>

          {/* ── Header: photo + name + contact + party/state ── */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
            <div
              style={{
                width: 120, height: 120, borderRadius: 14,
                background: "rgba(255,255,255,0.06)", flexShrink: 0,
                position: "relative",
                overflow: "visible",   // allow shadow to bleed outside the box
              }}>
              <img src={photo} alt={name}
                style={{
                  width: 120, height: 120, objectFit: "cover",
                  borderRadius: 14, display: "block",
                  transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease",
                  position: "relative", zIndex: 2,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "scale(1.13) translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 22px 55px rgba(0,0,0,0.9), 0 0 0 1.5px rgba(255,255,255,0.12)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>
            <div style={{ flex: 1, paddingTop: 6 }}>
              {/* Name + inline contact pill */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                <span style={{
                  fontSize: 21, fontWeight: 700, color: "rgba(255,255,255,0.95)", lineHeight: 1.2,
                  fontFamily: bioguide === "S000148" ? "'PT Serif', serif" : "inherit",
                }}>
                  {name}
                </span>
                <a
                  href={contactUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{
                    padding: "2px 8px",
                    background: "rgba(96,165,250,0.08)",
                    border: "1px solid rgba(96,165,250,0.28)",
                    borderRadius: 5,
                    color: "rgba(96,165,250,0.85)",
                    fontSize: 11, fontFamily: "monospace", letterSpacing: "0.06em",
                    textDecoration: "none", whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(96,165,250,0.16)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(96,165,250,0.08)")}
                >
                  contact
                </a>
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                {partyLabel} · {STATE_NAMES[state] ?? state}
              </div>
            </div>
          </div>

          {/* ── Info block: age, years, reelection ── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "11px 16px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            marginBottom: 14,
            flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
              <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{age}</span> yrs old
            </span>
            <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
              <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{yearsInOffice} yrs</span> in office
            </span>
            {runningAgain && (
              <>
                <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
                <span style={{
                  fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em",
                  color: "rgba(251,146,60,0.95)", fontWeight: 700,
                  background: "rgba(251,146,60,0.1)",
                  border: "1px solid rgba(251,146,60,0.35)",
                  borderRadius: 5, padding: "2px 7px",
                }}>
                  Reelection {nextElection}
                </span>
              </>
            )}
          </div>

          {/* ── Issue score section (8 categories) ── */}
          {loading ? (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: "24px 16px",
              display: "flex",
              alignItems: "center",
            }}>
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
                loading…
              </span>
            </div>
          ) : data?.categories ? (
            <IssueScoreSection
              categories={data.categories}
              overall={data.overall ?? 0}
            />
          ) : (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: "24px 16px",
            }}>
              <span style={{ fontSize: 13, fontFamily: "'Times New Roman', Times, serif", color: "rgba(255,255,255,0.3)" }}>
                Score data unavailable.
              </span>
            </div>
          )}

        </div>
      </div>

      {photoEnlarged && (
        <div
          onClick={() => setPhotoEnlarged(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 400,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <div style={{
            width: 520, height: 520, borderRadius: 16,
            overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          }}>
            <img src={photo} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      )}
    </>
  );
}
