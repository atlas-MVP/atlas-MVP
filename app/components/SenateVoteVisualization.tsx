"use client";

import { useState } from "react";

export interface Senator {
  name: string;
  party: "R" | "D" | "I";
  state: string;
  vote: "Aye" | "No" | "Present" | "Not Voting";
}

interface SenateVoteVisualizationProps {
  title?: string;
  senators: Senator[];
  onSenatorHover?: (senator: Senator | null) => void;
  onSenatorClick?: (senator: Senator) => void;
  hideTooltip?: boolean;
}

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming",
};

export default function SenateVoteVisualization({
  title = "SENATE",
  senators,
  onSenatorHover,
  onSenatorClick,
  hideTooltip = false,
}: SenateVoteVisualizationProps) {
  const [hoveredSenator, setHoveredSenator] = useState<Senator | null>(null);
  const [lockedSenator,  setLockedSenator]  = useState<Senator | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number; isLeft: boolean } | null>(null);

  const totalAye = senators.filter(s => s.vote === "Aye").length;
  const totalNo  = senators.filter(s => s.vote === "No").length;

  // ── Hemicycle layout ─────────────────────────────────────────────────────
  // Arc-row approach: each ring is an arc, dots spaced ≥ dotDiam apart along
  // the arc so no two dots on the same row ever overlap. Rings are 25px apart
  // radially (> dot diameter) so adjacent rows never overlap either.
  const generatePositions = () => {
    const positions: Array<{ senator: Senator; x: number; y: number }> = [];
    const centerX    = 325;
    const centerY    = 258;
    const rings      = 7;
    const baseRadius = 91;
    const ringStep   = 25;
    const dotDiam    = 16; // dot r=7 (14px) + 2px gap
    const gapAngle   = 0.35 * Math.PI;

    const ayeVoters     = senators.filter(s => s.vote === "Aye");
    const noVoters      = senators.filter(s => s.vote === "No");
    const crossoverDems = noVoters.filter(s => s.party === "D");
    const republicansNo = noVoters.filter(s => s.party !== "D");

    // Fill arc rows from innermost ring outward. Each row holds as many dots as
    // its arc length allows at dotDiam spacing — guaranteeing no overlap.
    const fillArcRows = (voters: Senator[], arcStart: number, arcEnd: number) => {
      if (!voters.length) return;
      let idx = 0;
      for (let ring = 0; ring < rings && idx < voters.length; ring++) {
        const r        = baseRadius + ring * ringStep;
        const arcLen   = Math.abs(arcEnd - arcStart) * r;
        const capacity = Math.max(1, Math.floor(arcLen / dotDiam));
        const count    = Math.min(capacity, voters.length - idx);
        for (let i = 0; i < count; i++) {
          const t     = count === 1 ? 0.5 : i / (count - 1);
          const angle = arcStart + t * (arcEnd - arcStart);
          positions.push({
            senator: voters[idx + i],
            x: centerX + r * Math.cos(angle),
            y: centerY + r * Math.sin(angle),
          });
        }
        idx += count;
      }
    };

    // Crossover Dems: evenly spaced horizontal line at baseline on the No side
    const placeCrossoverLine = (voters: Senator[]) => {
      if (!voters.length) return;
      const lineStartX = centerX + baseRadius;
      const lineEndX   = centerX + baseRadius + (rings - 1) * ringStep;
      const spacing    = voters.length > 1 ? (lineEndX - lineStartX) / (voters.length - 1) : 0;
      voters.forEach((s, i) => {
        const x = voters.length === 1 ? (lineStartX + lineEndX) / 2 : lineStartX + i * spacing;
        positions.push({ senator: s, x, y: centerY });
      });
    };

    fillArcRows(ayeVoters,    Math.PI,                        Math.PI * 1.5 - gapAngle / 2);
    fillArcRows(republicansNo, Math.PI * 1.5 + gapAngle / 2, Math.PI * 2);
    placeCrossoverLine(crossoverDems);

    return positions;
  };

  const positions = generatePositions();

  const isCrossover = (s: Senator) => s.party === "D" && s.vote === "No";

  const dotFill = (s: Senator) => {
    // Independents are grey
    if (s.party === "I") return s.vote === "Aye" ? "rgba(150,150,150,0.5)" : "rgba(150,150,150,0.3)";
    // Republicans are red, Democrats are blue
    if (s.vote === "Aye") return s.party === "R" ? "rgba(239,68,68,0.5)"  : "rgba(96,165,250,0.5)";
    if (s.vote === "No")  return s.party === "R" ? "rgba(239,68,68,0.3)"  : "rgba(96,165,250,0.3)";
    return "rgba(150,150,150,0.3)";
  };

  const dotStroke = (s: Senator) => {
    // Independents are grey
    if (s.party === "I") return s.vote === "Aye" ? "rgba(150,150,150,0.8)" : "rgba(150,150,150,0.5)";
    // Republicans are red, Democrats are blue
    if (s.vote === "Aye") return s.party === "R" ? "rgba(239,68,68,0.8)"  : "rgba(96,165,250,0.8)";
    if (s.vote === "No")  return s.party === "R" ? "rgba(239,68,68,0.5)"  : "rgba(96,165,250,0.5)";
    return "rgba(150,150,150,0.5)";
  };

  const displayed = lockedSenator || hoveredSenator;

  return (
    <>
      <style>{`
        @keyframes pulseBorder {
          0%, 100% { border-color: rgba(96,165,250,0.8); }
          50% { border-color: rgba(239,68,68,0.8); }
        }
      `}</style>
      <div
        onClick={() => {
          // Click anywhere on visualization to lock/unlock the hovered senator
          if (lockedSenator) {
            setLockedSenator(null);
            setTooltipPos(null);
          } else if (hoveredSenator) {
            setLockedSenator(hoveredSenator);
          }
        }}
        style={{
          position: "relative",
          width: 650,
          height: 325,
          background: "transparent",
          borderRadius: 12,
          cursor: hoveredSenator || lockedSenator ? "pointer" : "default",
        }}
      >
      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute",
        top: 8, left: 0, right: 0,
        textAlign: "center",
        fontSize: 14, fontWeight: 700, fontFamily: "monospace",
        letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)",
      }}>
        {title}
      </div>

      {/* ── yes label — on left-right axis ─────────────────────────────────── */}
      <div style={{
        position: "absolute", left: 16, top: 258,
        fontSize: 15, fontFamily: "monospace", letterSpacing: "0.1em",
        color: "rgba(100,200,100,0.7)",
      }}>
        yes
      </div>

      {/* ── no label — on left-right axis ──────────────────────────────────── */}
      <div style={{
        position: "absolute", right: 16, top: 258,
        fontSize: 15, fontFamily: "monospace", letterSpacing: "0.1em",
        color: "rgba(239,68,68,0.7)",
      }}>
        no
      </div>

      {/* ── Vote count ────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", bottom: 34, left: "50%",
        transform: "translateX(-50%)",
        fontSize: 16, fontWeight: 700, fontFamily: "inherit",
        letterSpacing: "0.3em", color: "rgba(255,255,255,0.9)",
        whiteSpace: "nowrap",
      }}>
        {totalAye}–{totalNo}
      </div>

      {/* ── BLOCKED badge ─────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", bottom: 3, left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(239,68,68,0.15)",
        border: "1px solid rgba(239,68,68,0.4)",
        borderRadius: 6, padding: "4px 12px",
        fontSize: 10, fontWeight: 700, fontFamily: "monospace",
        letterSpacing: "0.12em", color: "rgba(239,68,68,0.9)",
        textTransform: "uppercase", whiteSpace: "nowrap",
      }}>
        Blocked
      </div>

      {/* ── Senate dots (SVG) ─────────────────────────────────────────────── */}
      <svg width="650" height="325" style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <radialGradient id="crossoverPulse">
            <stop offset="0%" stopColor="rgba(96,165,250,0.9)">
              <animate attributeName="stop-color"
                values="rgba(96,165,250,0.9);rgba(239,68,68,0.9);rgba(96,165,250,0.9)"
                dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="rgba(96,165,250,0.3)">
              <animate attributeName="stop-color"
                values="rgba(96,165,250,0.3);rgba(239,68,68,0.3);rgba(96,165,250,0.3)"
                dur="2s" repeatCount="indefinite" />
            </stop>
          </radialGradient>
        </defs>

        {positions.map(({ senator, x, y }, i) => (
          <circle
            key={i}
            cx={x} cy={y} r={7}
            fill={isCrossover(senator) ? "url(#crossoverPulse)" : dotFill(senator)}
            stroke={isCrossover(senator) ? "rgba(96,165,250,0.8)" : dotStroke(senator)}
            strokeWidth={1}
            style={{ cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={() => {
              if (!lockedSenator) {
                setHoveredSenator(senator);
                setTooltipPos({ x, y, isLeft: senator.vote === "Aye" });
                onSenatorHover?.(senator);
              }
            }}
            onMouseLeave={() => {
              if (!lockedSenator) {
                setHoveredSenator(null);
                setTooltipPos(null);
                onSenatorHover?.(null);
              }
            }}
            onClick={e => {
              e.stopPropagation();
              if (onSenatorClick) {
                onSenatorClick(senator);
              } else {
                if (lockedSenator?.name === senator.name) {
                  setLockedSenator(null); setTooltipPos(null);
                } else {
                  setLockedSenator(senator);
                  setTooltipPos({ x, y, isLeft: senator.vote === "Aye" });
                }
              }
            }}
          >
            {isCrossover(senator) && (
              <animate
                attributeName="stroke"
                values="rgba(96,165,250,0.8);rgba(239,68,68,0.8);rgba(96,165,250,0.8)"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        ))}
      </svg>

      {/* ── Senator tooltip ───────────────────────────────────────────────── */}
      {!hideTooltip && displayed && tooltipPos && (
        <div
          onClick={e => { e.stopPropagation(); if (lockedSenator) { setLockedSenator(null); setTooltipPos(null); } }}
          style={{
            position: "absolute",
            [tooltipPos.isLeft ? "left" : "right"]: 12,
            top: 12,
            background: "rgba(10,13,26,0.95)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${
              displayed.party === "D" ? "rgba(96,165,250,0.8)" :
              displayed.party === "R" ? "rgba(239,68,68,0.8)" :
              "rgba(150,150,150,0.8)"
            }`,
            borderRadius: 8, padding: "8px 12px",
            fontSize: 12, fontFamily: "monospace",
            color: "rgba(255,255,255,0.9)",
            pointerEvents: lockedSenator ? "auto" : "none",
            zIndex: 100,
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            minWidth: 160,
            cursor: lockedSenator ? "pointer" : "default",
            animation: isCrossover(displayed) ? "pulseBorder 2s infinite" : "none",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{displayed.name}</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
            {displayed.party === "R" ? "Republican" : displayed.party === "D" ? "Democrat" : "Independent"}
            {" · "}
            {STATE_NAMES[displayed.state] ?? displayed.state}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
