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
    // Big gap at the top so rows stay close to 90°/270° (E/W) and well
    // clear of 0° (N). 0.5π ≈ 90° total → 45° wedge on each side of top-center.
    const gapAngle   = 0.5 * Math.PI;

    const ayeVoters     = senators.filter(s => s.vote === "Aye");
    const noVoters      = senators.filter(s => s.vote === "No");
    const crossoverDems = noVoters.filter(s => s.party === "D");
    const republicansNo = noVoters.filter(s => s.party !== "D");

    // Split N voters across a list of ring radii, weighted by radius (arc
    // length ≈ r·θ, and θ is constant, so weight == radius). Uses the
    // largest-remainder method so the total always matches exactly.
    const splitByArcLength = (total: number, ringRadii: number[]): number[] => {
      if (!total) return ringRadii.map(() => 0);
      const sumW = ringRadii.reduce((a, b) => a + b, 0);
      const raw  = ringRadii.map(w => (w / sumW) * total);
      const sizes = raw.map(Math.floor);
      let remainder = total - sizes.reduce((a, b) => a + b, 0);
      const fracs = raw
        .map((r, i) => ({ i, frac: r - sizes[i] }))
        .sort((a, b) => b.frac - a.frac);
      for (let k = 0; k < remainder; k++) sizes[fracs[k].i]++;
      return sizes;
    };

    // Place `voters` on a single ring at `radius`, spanning [arcStart, arcEnd].
    // Dots are evenly spaced, including both endpoints (so rings align on the
    // inner and outer edges of the fan).
    const placeRing = (
      voters: Senator[],
      radius: number,
      arcStart: number,
      arcEnd: number,
    ) => {
      const n = voters.length;
      if (!n) return;
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0.5 : i / (n - 1);
        const angle = arcStart + t * (arcEnd - arcStart);
        positions.push({
          senator: voters[i],
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        });
      }
    };

    // Place a block of voters across every ring of a hemicycle half. If
    // `innerOverride` is set, that ring is filled with its override voters
    // and the block fills only the outer rings 1..rings-1.
    const placeHalf = (
      voters: Senator[],
      arcStart: number,
      arcEnd: number,
      innerOverride?: Senator[],
    ) => {
      const ringRadii = Array.from({ length: rings }, (_, r) => baseRadius + r * ringStep);

      // Inner ring: either the override (crossover Dems) or part of the main block.
      let firstRingForBlock = 0;
      if (innerOverride) {
        placeRing(innerOverride, ringRadii[0], arcStart, arcEnd);
        firstRingForBlock = 1;
      }

      const outerRadii = ringRadii.slice(firstRingForBlock);
      const sizes = splitByArcLength(voters.length, outerRadii);
      let cursor = 0;
      for (let i = 0; i < sizes.length; i++) {
        const chunk = voters.slice(cursor, cursor + sizes[i]);
        placeRing(chunk, outerRadii[i], arcStart, arcEnd);
        cursor += sizes[i];
      }
    };

    // Aye: from 270° compass (W, math π) rising to the top-center gap edge.
    placeHalf(ayeVoters, Math.PI, Math.PI * 1.5 - gapAngle / 2);

    // No: from top-center gap edge down to 90° compass (E, math 2π).
    // Crossover Dems claim the innermost ring as a visual pulse band.
    placeHalf(republicansNo, Math.PI * 1.5 + gapAngle / 2, Math.PI * 2, crossoverDems);

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
        style={{
          position: "relative",
          width: 650,
          height: 325,
          background: "transparent",
          borderRadius: 12,
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

      {/* ── yes label — flush with bottom-left end of arc ─────────────────── */}
      <div style={{
        position: "absolute", left: 16, bottom: 58,
        fontSize: 15, fontFamily: "monospace", letterSpacing: "0.1em",
        color: "rgba(100,200,100,0.7)",
      }}>
        yes
      </div>

      {/* ── no label — flush with bottom-right end of arc ─────────────────── */}
      <div style={{
        position: "absolute", right: 16, bottom: 58,
        fontSize: 15, fontFamily: "monospace", letterSpacing: "0.1em",
        color: "rgba(239,68,68,0.7)",
      }}>
        no
      </div>

      {/* ── Vote count ────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", bottom: 34, left: "50%",
        transform: "translateX(-50%)",
        fontSize: 16, fontWeight: 300, fontFamily: "inherit",
        letterSpacing: "0.3em", color: "rgba(255,255,255,0.9)",
        whiteSpace: "nowrap",
      }}>
        {totalAye}–{totalNo}
      </div>

      {/* ── BLOCKED badge ─────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", bottom: 10, left: "50%",
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
            stroke={dotStroke(senator)}
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
          />
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
