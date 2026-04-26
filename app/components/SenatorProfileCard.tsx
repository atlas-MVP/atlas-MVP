"use client";

import { useEffect, useState } from "react";
import type { SenatorAlignmentResponse, VoteRecord } from "../api/senator-alignment/[bioguide]/route";

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

const BAR_GRADIENT = "linear-gradient(to right, #3b82f6 0%, #6b7280 50%, #ef4444 100%)";

function alignmentLabel(score: number): string {
  if (score <= -75) return "Far Left";
  if (score <= -45) return "Left";
  if (score <= -15) return "Center-Left";
  if (score <=  15) return "Center";
  if (score <=  45) return "Center-Right";
  if (score <=  75) return "Right";
  return "Far Right";
}

function VoteRow({ vote }: { vote: VoteRecord }) {
  const aligned = vote.aligned;
  // Derive a clean capitalized vote label
  const voteLabel = vote.memberVote === "Yes" ? "Voted Yes" : vote.memberVote === "No" ? "Voted No" : "Not Voting";

  return (
    <div style={{
      padding: "12px 0",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Bill title — Times New Roman, properly capitalized */}
      <div style={{
        fontSize: 15,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: 400,
        color: "rgba(255,255,255,0.92)",
        lineHeight: 1.45,
        marginBottom: 8,
        textTransform: "none",
        letterSpacing: "0.01em",
      }}>
        {vote.url
          ? <a href={vote.url} target="_blank" rel="noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color: "rgba(255,255,255,0.92)", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
            >{vote.billTitle}</a>
          : vote.billTitle
        }
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* How they voted */}
        <span style={{
          fontSize: 12,
          fontFamily: "'Times New Roman', Times, serif",
          textTransform: "none",
          color: aligned ? "rgba(100,200,100,0.9)" : "rgba(239,68,68,0.9)",
          fontStyle: "italic",
        }}>
          {voteLabel}
        </span>

        {/* Aligned / misaligned badge */}
        <span style={{
          fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em",
          color: aligned ? "rgba(100,200,100,0.75)" : "rgba(239,68,68,0.75)",
          background: aligned ? "rgba(100,200,100,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${aligned ? "rgba(100,200,100,0.18)" : "rgba(239,68,68,0.18)"}`,
          borderRadius: 4, padding: "2px 6px",
          textTransform: "uppercase",
        }}>
          {aligned ? "aligned" : "misaligned"}
        </span>
      </div>
    </div>
  );
}

export default function SenatorProfileCard({
  bioguide, name, photo, party, state, age, yearsInOffice,
  nextElection, runningAgain, officialUrl, onClose,
}: Props) {
  const [data, setData] = useState<SenatorAlignmentResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/senator-alignment/${bioguide}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bioguide]);

  const partyLabel = party === "R" ? "Republican" : party === "D" ? "Democrat" : "Independent";
  const score = data?.alignmentScore ?? 0;
  const dotPct = ((score + 100) / 200) * 100;
  const dotColor = score < -15 ? "#3b82f6" : score > 15 ? "#ef4444" : "#9ca3af";

  // Contact URL: append /contact to official site
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

      {/* Card — 488px wide (AtlasHQ width), centered right */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 300,
          width: 488,
          maxHeight: "calc(100vh - 56px)",
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
        {/* ── Close ── */}
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

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 24px" }}>

          {/* ── Header: photo + name + contact + party/state ── */}
          <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
            <div style={{
              width: 86, height: 86, borderRadius: 12, overflow: "hidden",
              background: "rgba(255,255,255,0.06)", flexShrink: 0,
            }}>
              <img src={photo} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1, paddingTop: 4 }}>
              {/* Name + inline contact button */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                <span style={{ fontSize: 21, fontWeight: 700, color: "rgba(255,255,255,0.95)", lineHeight: 1.2 }}>
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

          {/* ── Senator info: age, years, reelection ── */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 8,
            padding: "14px 16px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, marginBottom: 14,
          }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
              <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>{age} Years Old</span>
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
              <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>{yearsInOffice} Years</span> in Office
            </div>
            {runningAgain && (
              <div style={{ marginTop: 2 }}>
                <span style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  background: "rgba(251,146,60,0.12)",
                  border: "1px solid rgba(251,146,60,0.45)",
                  borderRadius: 6,
                  fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em",
                  color: "rgba(251,146,60,0.95)", fontWeight: 700,
                  textTransform: "none",
                }}>
                  Reelection {nextElection}
                </span>
              </div>
            )}
          </div>

          {/* ── Alignment bar ── */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "16px 16px 14px", marginBottom: 14,
          }}>
            <div style={{
              fontSize: 9, fontFamily: "monospace", letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.32)", textTransform: "uppercase", marginBottom: 12,
            }}>Alignment</div>

            {loading ? (
              <div style={{ height: 52, display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>loading…</span>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, color: dotColor, letterSpacing: "-0.02em" }}>
                    {score > 0 ? `+${score}` : score}
                  </span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                    {alignmentLabel(score)}
                  </span>
                </div>

                <div style={{ position: "relative", height: 8, borderRadius: 999, background: BAR_GRADIENT, marginBottom: 8 }}>
                  <div style={{ position: "absolute", left: "50%", top: -3, bottom: -3, width: 1, background: "rgba(255,255,255,0.18)" }} />
                  <div style={{
                    position: "absolute", left: `${dotPct}%`, top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 16, height: 16, borderRadius: "50%",
                    background: dotColor, border: "2px solid rgba(255,255,255,0.9)",
                    boxShadow: `0 0 10px ${dotColor}`,
                    transition: "left 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                  }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 9, fontFamily: "monospace", color: "#3b82f6", opacity: 0.7 }}>← liberal</span>
                  <span style={{ fontSize: 9, fontFamily: "monospace", color: "#ef4444", opacity: 0.7 }}>conservative →</span>
                </div>
              </>
            )}
          </div>

          {/* ── Recent votes ── */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "16px 16px 4px",
          }}>
            <div style={{
              fontSize: 9, fontFamily: "monospace", letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.32)", textTransform: "uppercase", marginBottom: 4,
            }}>Recent Votes</div>

            {loading ? (
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.2)", padding: "12px 0" }}>loading…</div>
            ) : data?.recentVotes.length ? (
              data.recentVotes.map((v, i) => <VoteRow key={i} vote={v} />)
            ) : (
              <div style={{ fontSize: 14, fontFamily: "'Times New Roman', Times, serif", color: "rgba(255,255,255,0.35)", padding: "12px 0" }}>
                No vote data available.
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
