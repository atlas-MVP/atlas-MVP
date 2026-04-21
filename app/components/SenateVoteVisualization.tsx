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
  // Both halves share the exact same 7-ring geometry so the Aye side and
  // No side line up perfectly row-for-row. Within a ring, seat count is
  // proportional to arc length (outer rings hold more dots than inner
  // rings), and seats are evenly spaced endpoint-to-endpoint. The two
  // halves are separated by a wide gap at top-center, pushing all dots
  // toward the horizontal baseline (west-3-o'clock and east-9-o'clock).
  const generatePositions = () => {
    const positions: Array<{ senator: Senator; x: number; y: number }> = [];
    const centerX    = 325;
    const centerY    = 258;
    const rings      = 7;
    const baseRadius = 91;
    const ringStep   = 25;
    // Gap at the top - reduced from 0.5π to 0.35π for tighter spread
    const gapAngle   = 0.35 * Math.PI;

    const ayeVoters     = senators.filter(s => s.vote === "Aye");
    const noVoters      = senators.filter(s => s.vote === "No");
    const crossoverDems = noVoters.filter(s => s.party === "D");
    const republicansNo = noVoters.filter(s => s.party !== "D");

    // Place voters on radial spokes (straight lines from center). Each spoke
    // is an exact angle, and dots are placed along that spoke at precise radii.
    const placeOnSpokes = (
      voters: Senator[],
      arcStart: number,
      arcEnd: number,
    ) => {
      if (!voters.length) return;

      // Calculate number of spokes needed (roughly voters / rings)
      const numSpokes = Math.max(1, Math.ceil(voters.length / rings));

      // Evenly distribute spoke angles across the arc
      const spokeAngles: number[] = [];
      for (let i = 0; i < numSpokes; i++) {
        const t = numSpokes === 1 ? 0.5 : i / (numSpokes - 1);
        spokeAngles.push(arcStart + t * (arcEnd - arcStart));
      }

      // Distribute voters across spokes
      let voterIdx = 0;
      for (let spokeIdx = 0; spokeIdx < numSpokes && voterIdx < voters.length; spokeIdx++) {
        const angle = spokeAngles[spokeIdx];
        // Place dots along this spoke at each ring radius
        for (let ring = 0; ring < rings && voterIdx < voters.length; ring++) {
          const radius = baseRadius + ring * ringStep;
          positions.push({
            senator: voters[voterIdx],
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          });
          voterIdx++;
        }
      }
    };

    // Place crossover Dems on a horizontal line at the baseline (y = centerY)
    // on the No (right) side, evenly spaced
    const placeCrossoverLine = (voters: Senator[]) => {
      if (!voters.length) return;
      const lineStartX = centerX + baseRadius; // Start at innermost radius on right
      const lineEndX = centerX + baseRadius + (rings - 1) * ringStep; // End at outermost
      const spacing = voters.length > 1 ? (lineEndX - lineStartX) / (voters.length - 1) : 0;

      for (let i = 0; i < voters.length; i++) {
        const x = voters.length === 1 ? (lineStartX + lineEndX) / 2 : lineStartX + i * spacing;
        positions.push({
          senator: voters[i],
          x,
          y: centerY, // Horizontal line at baseline
        });
      }
    };

    // Aye: from 270° compass (W, math π) rising to the top-center gap edge.
    placeOnSpokes(ayeVoters, Math.PI, Math.PI * 1.5 - gapAngle / 2);

    // No: Republicans only, crossover Dems get their own line
    placeOnSpokes(republicansNo, Math.PI * 1.5 + gapAngle / 2, Math.PI * 2);

    // Crossover Dems on horizontal line
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
