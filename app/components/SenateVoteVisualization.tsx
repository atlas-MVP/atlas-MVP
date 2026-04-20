"use client";

import { useState } from "react";

interface Senator {
  name: string;
  party: "R" | "D" | "I";
  state: string;
  vote: "Aye" | "No" | "Present" | "Not Voting";
}

interface SenateVoteVisualizationProps {
  title?: string;
  senators: Senator[];
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
}: SenateVoteVisualizationProps) {
  const [hoveredSenator, setHoveredSenator] = useState<Senator | null>(null);
  const [lockedSenator,  setLockedSenator]  = useState<Senator | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number; isLeft: boolean } | null>(null);

  const totalAye = senators.filter(s => s.vote === "Aye").length;
  const totalNo  = senators.filter(s => s.vote === "No").length;

  // ── Hemicycle layout ─────────────────────────────────────────────────────
  // Perfect 180° arc (π → 2π). Bottom seats at both ends sit on the same
  // horizontal line (y = centerY), forming a straight flush base.
  // A gapAngle splits the two halves at the top so there is visible air.
  const generatePositions = () => {
    const positions: Array<{ senator: Senator; x: number; y: number }> = [];
    const centerX       = 286;
    const centerY       = 258;
    const rows          = 7;
    const baseRadius    = 65;
    const radiusStep    = 18;  // rows closer together
    const gapAngle      = 0.22 * Math.PI; // ~40° gap between halves at the top

    const ayeVoters = senators.filter(s => s.vote === "Aye");
    const noVoters  = senators.filter(s => s.vote === "No");

    const placeGroup = (
      voters: Senator[],
      arcStart: number,
      arcEnd: number,
    ) => {
      if (!voters.length) return;

      // Calculate number of radial spokes needed
      const spokes = Math.ceil(voters.length / rows);

      // Create angular positions (spokes from center)
      const angles: number[] = [];
      for (let i = 0; i < spokes; i++) {
        const t = spokes === 1 ? 0.5 : i / (spokes - 1);
        angles.push(arcStart + t * (arcEnd - arcStart));
      }

      // Place senators along radial lines (spokes)
      for (let idx = 0; idx < voters.length; idx++) {
        const spokeIdx = idx % spokes;
        const row = Math.floor(idx / spokes);
        const angle = angles[spokeIdx];
        const r = baseRadius + row * radiusStep;

        positions.push({
          senator: voters[idx],
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle),
        });
      }
    };

    // Aye: π (bottom-left, flush) → just-left-of-top-center
    // No:  just-right-of-top-center → 2π (bottom-right, flush)
    placeGroup(ayeVoters, Math.PI,       Math.PI * 1.5 - gapAngle / 2);
    placeGroup(noVoters,  Math.PI * 1.5 + gapAngle / 2, Math.PI * 2);

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
    <div
      style={{
        position: "relative",
        width: 571,
        height: 325,
        background: "rgba(4,6,18,0.75)",
        backdropFilter: "blur(20px)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute",
        top: 14, left: 0, right: 0,
        textAlign: "center",
        fontSize: 14, fontWeight: 700, fontFamily: "monospace",
        letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)",
      }}>
        {title}
      </div>

      {/* ── YES label — flush with bottom-left end of arc ─────────────────── */}
      <div style={{
        position: "absolute", left: 16, bottom: 58,
        fontSize: 12, fontFamily: "monospace", letterSpacing: "0.1em",
        color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
      }}>
        Yes
      </div>

      {/* ── NO label — flush with bottom-right end of arc ─────────────────── */}
      <div style={{
        position: "absolute", right: 16, bottom: 58,
        fontSize: 12, fontFamily: "monospace", letterSpacing: "0.1em",
        color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
      }}>
        No
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
      <svg width="571" height="325" style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <radialGradient id="crossoverPulse">
            <stop offset="0%" stopColor="rgba(96,165,250,0.6)">
              <animate attributeName="stop-color"
                values="rgba(96,165,250,0.6);rgba(239,68,68,0.6);rgba(96,165,250,0.6)"
                dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="rgba(96,165,250,0.2)">
              <animate attributeName="stop-color"
                values="rgba(96,165,250,0.2);rgba(239,68,68,0.2);rgba(96,165,250,0.2)"
                dur="2s" repeatCount="indefinite" />
            </stop>
          </radialGradient>
        </defs>

        {positions.map(({ senator, x, y }, i) => (
          <circle
            key={i}
            cx={x} cy={y} r={6}
            fill={isCrossover(senator) ? "url(#crossoverPulse)" : dotFill(senator)}
            stroke={dotStroke(senator)}
            strokeWidth={1}
            style={{ cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={() => {
              if (!lockedSenator) {
                setHoveredSenator(senator);
                setTooltipPos({ x, y, isLeft: senator.vote === "Aye" });
              }
            }}
            onMouseLeave={() => {
              if (!lockedSenator) { setHoveredSenator(null); setTooltipPos(null); }
            }}
            onClick={e => {
              e.stopPropagation();
              if (lockedSenator?.name === senator.name) {
                setLockedSenator(null); setTooltipPos(null);
              } else {
                setLockedSenator(senator);
                setTooltipPos({ x, y, isLeft: senator.vote === "Aye" });
              }
            }}
          />
        ))}
      </svg>

      {/* ── Senator tooltip ───────────────────────────────────────────────── */}
      {displayed && tooltipPos && (
        <div
          onClick={e => { e.stopPropagation(); if (lockedSenator) { setLockedSenator(null); setTooltipPos(null); } }}
          style={{
            position: "absolute",
            [tooltipPos.isLeft ? "left" : "right"]: 12,
            top: 12,
            background: "rgba(10,13,26,0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(100,100,100,0.4)",
            borderRadius: 8, padding: "8px 12px",
            fontSize: 12, fontFamily: "monospace",
            color: "rgba(255,255,255,0.9)",
            pointerEvents: lockedSenator ? "auto" : "none",
            zIndex: 100,
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            minWidth: 160,
            cursor: lockedSenator ? "pointer" : "default",
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
  );
}
