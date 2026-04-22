"use client";

import { useEffect, useState, useRef } from "react";
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
  voteOnThisBill: string;
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

// Gradient stops for the -100…+100 bar
// left = liberal (#3b82f6 blue), center = gray, right = conservative (#ef4444 red)
const BAR_GRADIENT = "linear-gradient(to right, #3b82f6 0%, #6b7280 50%, #ef4444 100%)";

function alignmentLabel(score: number): string {
  if (score <= -75) return "far left";
  if (score <= -45) return "left";
  if (score <= -15) return "center-left";
  if (score <=  15) return "center";
  if (score <=  45) return "center-right";
  if (score <=  75) return "right";
  return "far right";
}

function VoteRow({ vote }: { vote: VoteRecord }) {
  const aligned = vote.aligned;
  return (
    <div style={{
      padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.82)", lineHeight: 1.4, flex: 1 }}>
          {vote.url
            ? <a href={vote.url} target="_blank" rel="noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ color: "rgba(255,255,255,0.82)", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
              >{vote.billTitle}</a>
            : vote.billTitle
          }
        </div>
        <div style={{
          fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em",
          color: aligned ? "rgba(100,200,100,0.85)" : "rgba(239,68,68,0.85)",
          background: aligned ? "rgba(100,200,100,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${aligned ? "rgba(100,200,100,0.2)" : "rgba(239,68,68,0.2)"}`,
          borderRadius: 4, padding: "2px 6px", flexShrink: 0,
          textTransform: "uppercase",
        }}>
          {aligned ? "aligned" : "misaligned"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 11, color: "rgba(255,255,255,0.42)", fontFamily: "monospace" }}>
        <span>{vote.billId}</span>
        <span>·</span>
        <span>{vote.date}</span>
      </div>
      <div style={{ display: "flex", gap: 10, fontSize: 11, marginTop: 2 }}>
        <span style={{ color: vote.memberVote === "Yes" ? "rgba(100,200,100,0.85)" : "rgba(239,68,68,0.85)" }}>
          voted {vote.memberVote.toLowerCase()}
        </span>
        <span style={{ color: "rgba(255,255,255,0.28)" }}>·</span>
        <span style={{ color: "rgba(255,255,255,0.42)" }}>
          party {vote.partyMajority.toLowerCase()} ({vote.partyPct}%)
        </span>
      </div>
    </div>
  );
}

export default function SenatorProfileCard({
  bioguide, name, photo, party, state, age, yearsInOffice,
  nextElection, runningAgain, voteOnThisBill, onClose,
}: Props) {
  const [data, setData] = useState<SenatorAlignmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMisaligned, setShowMisaligned] = useState(false);
  const misalignedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/senator-alignment/${bioguide}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bioguide]);

  const partyLabel = party === "R" ? "Republican" : party === "D" ? "Democrat" : "Independent";
  const reelectionLabel = !runningAgain
    ? (nextElection < new Date().getFullYear() ? `Left office ${nextElection}` : `Retiring ${nextElection}`)
    : `Up for re-election ${nextElection}`;

  // Bar dot position: 0% = leftmost (-100), 100% = rightmost (+100)
  const score = data?.alignmentScore ?? 0;
  const dotPct = ((score + 100) / 200) * 100;
  const dotColor = score < -15 ? "#3b82f6" : score > 15 ? "#ef4444" : "#9ca3af";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 299,
          background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)",
        }}
      />

      {/* Card — 9:16, iPhone-sized, centered right */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed",
          right: 30,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 300,
          width: 390,
          height: 693,       // 390 × (16/9) ≈ 693
          background: "rgba(4,6,18,0.97)",
          backdropFilter: "blur(40px)",
          borderRadius: 20,
          border: `1px solid rgba(${party === "R" ? "239,68,68" : party === "D" ? "96,165,250" : "160,160,160"},0.35)`,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Close ── */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 14, zIndex: 10,
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.28)", fontSize: 18, lineHeight: 1, padding: 4,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
        >×</button>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 22px 20px" }}>

          {/* ── Header: photo + name + meta ── */}
          <div style={{ display: "flex", gap: 16, marginBottom: 22 }}>
            <div style={{
              width: 90, height: 90, borderRadius: 14, overflow: "hidden",
              background: "rgba(255,255,255,0.06)", flexShrink: 0,
            }}>
              <img src={photo} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1, paddingTop: 2 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.95)", lineHeight: 1.2, marginBottom: 6 }}>
                {name}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.52)", marginBottom: 5 }}>
                {partyLabel} · {STATE_NAMES[state] ?? state}
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 11, fontFamily: "monospace", letterSpacing: "0.06em",
                color: voteOnThisBill === "Aye" || voteOnThisBill === "Yes"
                  ? "rgba(100,200,100,0.9)" : "rgba(239,68,68,0.9)",
                background: voteOnThisBill === "Aye" || voteOnThisBill === "Yes"
                  ? "rgba(100,200,100,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${voteOnThisBill === "Aye" || voteOnThisBill === "Yes"
                  ? "rgba(100,200,100,0.2)" : "rgba(239,68,68,0.2)"}`,
                borderRadius: 5, padding: "3px 8px",
              }}>
                this bill: {voteOnThisBill}
              </div>
            </div>
          </div>

          {/* ── Alignment bar ── */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, padding: "18px 18px 16px", marginBottom: 16,
            position: "relative",
          }}>
            <div style={{
              fontSize: 9, fontFamily: "monospace", letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 14,
            }}>alignment</div>

            {loading ? (
              <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
                  loading…
                </div>
              </div>
            ) : (
              <>
                {/* Score number */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
                  <span style={{
                    fontSize: 42, fontWeight: 700, lineHeight: 1,
                    color: dotColor, letterSpacing: "-0.02em",
                  }}>
                    {score > 0 ? `+${score}` : score}
                  </span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", letterSpacing: "0.04em" }}>
                    {alignmentLabel(score)}
                  </span>
                </div>

                {/* Bar */}
                <div style={{ position: "relative", height: 8, borderRadius: 999, background: BAR_GRADIENT, marginBottom: 8 }}>
                  {/* Center tick */}
                  <div style={{
                    position: "absolute", left: "50%", top: -3, bottom: -3,
                    width: 1, background: "rgba(255,255,255,0.2)",
                  }} />
                  {/* Dot */}
                  <div style={{
                    position: "absolute",
                    left: `${dotPct}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 16, height: 16, borderRadius: "50%",
                    background: dotColor,
                    border: "2px solid rgba(255,255,255,0.9)",
                    boxShadow: `0 0 10px ${dotColor}`,
                    transition: "left 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                  }} />
                </div>

                {/* Bar labels */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.08em", color: "#3b82f6", opacity: 0.7 }}>
                    ← liberal
                  </span>
                  <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.08em", color: "#ef4444", opacity: 0.7 }}>
                    conservative →
                  </span>
                </div>

                {/* Misalignment count — hover to expand */}
                <div
                  ref={misalignedRef}
                  onMouseEnter={() => setShowMisaligned(true)}
                  onMouseLeave={() => setShowMisaligned(false)}
                  style={{ cursor: "default", position: "relative" }}
                >
                  <div style={{
                    fontSize: 11, color: "rgba(255,255,255,0.38)", fontFamily: "monospace",
                    letterSpacing: "0.06em", borderTop: "1px solid rgba(255,255,255,0.06)",
                    paddingTop: 10, display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "rgba(239,68,68,0.7)", display: "inline-block", flexShrink: 0,
                    }} />
                    {data?.misalignedCount ?? 0} misaligned votes
                    <span style={{ color: "rgba(255,255,255,0.18)" }}>· since {data?.termStart}</span>
                    <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.2)", fontSize: 10 }}>hover ↑</span>
                  </div>

                  {/* Misalignment hover panel */}
                  {showMisaligned && data && data.misalignedVotes.length > 0 && (
                    <div style={{
                      position: "absolute",
                      bottom: "calc(100% + 8px)",
                      left: 0, right: 0,
                      background: "rgba(4,6,18,0.98)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      zIndex: 10,
                      boxShadow: "0 -12px 40px rgba(0,0,0,0.6)",
                      maxHeight: 260,
                      overflowY: "auto",
                    }}>
                      <div style={{
                        fontSize: 9, fontFamily: "monospace", letterSpacing: "0.14em",
                        color: "rgba(239,68,68,0.6)", textTransform: "uppercase", marginBottom: 8,
                      }}>
                        voted against party (≥60% threshold)
                      </div>
                      {data.misalignedVotes.map((v, i) => (
                        <div key={i} style={{
                          padding: "8px 0",
                          borderBottom: i < data.misalignedVotes.length - 1
                            ? "1px solid rgba(255,255,255,0.05)" : "none",
                        }}>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 3, lineHeight: 1.35 }}>
                            {v.url
                              ? <a href={v.url} target="_blank" rel="noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}
                                  onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                                  onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                                >{v.billTitle}</a>
                              : v.billTitle}
                          </div>
                          <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", display: "flex", gap: 8 }}>
                            <span>{v.billId}</span>
                            <span>·</span>
                            <span style={{ color: "rgba(239,68,68,0.7)" }}>voted {v.memberVote.toLowerCase()}</span>
                            <span>·</span>
                            <span>party {v.partyMajority.toLowerCase()} ({v.partyPct}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", marginTop: 6, letterSpacing: "0.05em" }}>
                  {data?.totalQualifyingVotes} qualifying votes · algorithm pending live data
                </div>
              </>
            )}
          </div>

          {/* ── Recent votes ── */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, padding: "16px 18px", marginBottom: 16,
          }}>
            <div style={{
              fontSize: 9, fontFamily: "monospace", letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 10,
            }}>recent votes</div>
            {loading ? (
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.2)" }}>loading…</div>
            ) : data?.recentVotes.length ? (
              data.recentVotes.map((v, i) => <VoteRow key={i} vote={v} />)
            ) : (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>No vote data yet</div>
            )}
          </div>

          {/* ── Bio info ── */}
          <div style={{
            display: "flex", gap: 10, flexWrap: "wrap",
            fontSize: 12, color: "rgba(255,255,255,0.45)",
            fontFamily: "monospace", letterSpacing: "0.04em",
          }}>
            <span>age {age}</span>
            <span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
            <span>{yearsInOffice} yrs in office</span>
            <span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
            <span>{reelectionLabel}</span>
          </div>

        </div>
      </div>
    </>
  );
}
