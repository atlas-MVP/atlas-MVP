"use client";

import { useState, useRef } from "react";

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

export default function SenateVoteVisualization({
  title = "SENATE",
  senators,
}: SenateVoteVisualizationProps) {
  const [hoveredSenator, setHoveredSenator] = useState<Senator | null>(null);
  const [lockedSenator, setLockedSenator] = useState<Senator | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number; isLeft: boolean } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate vote counts (including all parties)
  const totalAye = senators.filter(s => s.vote === "Aye").length;
  const totalNo = senators.filter(s => s.vote === "No").length;

  // Generate hemicycle positions - organized by vote (Aye left, No right)
  const generatePositions = () => {
    const positions: Array<{ senator: Senator; x: number; y: number }> = [];
    const centerX = 266;
    const centerY = 233;

    // Separate senators by vote
    const ayeVoters = senators.filter(s => s.vote === "Aye");
    const noVoters = senators.filter(s => s.vote === "No");

    const rows = 7;
    const baseRadius = 70; // Increased from 67 for more spacing
    const radiusIncrement = 26; // Increased from 23 for more spacing

    // Place Aye voters on left side (π to 3π/2)
    let ayeIndex = 0;
    for (let row = 0; row < rows; row++) {
      const radius = baseRadius + row * radiusIncrement;
      const senatorsInRow = Math.min(Math.ceil(ayeVoters.length / rows) + Math.floor(row * 0.5), ayeVoters.length - ayeIndex);
      const angleStart = Math.PI;
      const angleEnd = Math.PI * 1.5;
      const angleStep = (angleEnd - angleStart) / (senatorsInRow + 1.2); // Increased divisor for more spacing

      for (let i = 0; i < senatorsInRow && ayeIndex < ayeVoters.length; i++) {
        const angle = angleStart + angleStep * (i + 1.2);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        positions.push({ senator: ayeVoters[ayeIndex], x, y });
        ayeIndex++;
      }
    }

    // Place No voters on right side (3π/2 to 2π)
    let noIndex = 0;
    for (let row = 0; row < rows; row++) {
      const radius = baseRadius + row * radiusIncrement;
      const senatorsInRow = Math.min(Math.ceil(noVoters.length / rows) + Math.floor(row * 0.5), noVoters.length - noIndex);
      const angleStart = Math.PI * 1.5;
      const angleEnd = Math.PI * 2;
      const angleStep = (angleEnd - angleStart) / (senatorsInRow + 1.2); // Increased divisor for more spacing

      for (let i = 0; i < senatorsInRow && noIndex < noVoters.length; i++) {
        const angle = angleStart + angleStep * (i + 1.2);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        positions.push({ senator: noVoters[noIndex], x, y });
        noIndex++;
      }
    }

    return positions;
  };

  const positions = generatePositions();

  // Check if senator is a Democrat who voted No (crossover vote)
  const isCrossoverVote = (senator: Senator) => {
    return senator.party === "D" && senator.vote === "No";
  };

  const getDotColor = (senator: Senator) => {
    if (senator.vote === "Aye") {
      return senator.party === "R" ? "rgba(239,68,68,0.5)" : "rgba(96,165,250,0.5)";
    } else if (senator.vote === "No") {
      return senator.party === "R" ? "rgba(239,68,68,0.3)" : "rgba(96,165,250,0.3)";
    }
    return "rgba(150,150,150,0.3)";
  };

  const getDotBorder = (senator: Senator) => {
    if (senator.vote === "Aye") {
      return senator.party === "R" ? "rgba(239,68,68,0.8)" : "rgba(96,165,250,0.8)";
    } else if (senator.vote === "No") {
      return senator.party === "R" ? "rgba(239,68,68,0.5)" : "rgba(96,165,250,0.5)";
    }
    return "rgba(150,150,150,0.5)";
  };

  const displayedSenator = lockedSenator || hoveredSenator;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: 533,
        height: 333,
        background: "rgba(4,6,18,0.75)",
        backdropFilter: "blur(20px)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "20px 16px 16px",
      }}
    >
      {/* Title - moved down */}
      <div
        style={{
          position: "absolute",
          top: 20, // Moved down from 0
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "monospace",
          letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.7)",
        }}
      >
        {title}
      </div>

      {/* YEA label - left side */}
      <div
        style={{
          position: "absolute",
          left: 12,
          bottom: 85,
          fontSize: 9,
          fontFamily: "monospace",
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.25)",
          textTransform: "uppercase",
        }}
      >
        Yea
      </div>

      {/* NAY label - right side */}
      <div
        style={{
          position: "absolute",
          right: 12,
          bottom: 85,
          fontSize: 9,
          fontFamily: "monospace",
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.25)",
          textTransform: "uppercase",
        }}
      >
        Nay
      </div>

      {/* Vote count - moved up into semicircle */}
      <div
        style={{
          position: "absolute",
          bottom: 60, // Moved up from 10
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "monospace",
          letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.9)",
        }}
      >
        {totalAye}–{totalNo}
      </div>

      {/* BLOCKED button */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.4)",
          borderRadius: 6,
          padding: "4px 12px",
          fontSize: 10,
          fontWeight: 700,
          fontFamily: "monospace",
          letterSpacing: "0.12em",
          color: "rgba(239,68,68,0.9)",
          textTransform: "uppercase",
        }}
      >
        Blocked
      </div>

      {/* Senate floor dots */}
      <svg width="533" height="333" style={{ position: "absolute", top: 0, left: 0 }}>
        {/* Pulsing animation for crossover Democrats */}
        <defs>
          <radialGradient id="crossoverPulse">
            <stop offset="0%" stopColor="rgba(96,165,250,0.6)">
              <animate
                attributeName="stop-color"
                values="rgba(96,165,250,0.6);rgba(239,68,68,0.6);rgba(96,165,250,0.6)"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="rgba(96,165,250,0.2)">
              <animate
                attributeName="stop-color"
                values="rgba(96,165,250,0.2);rgba(239,68,68,0.2);rgba(96,165,250,0.2)"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
          </radialGradient>
        </defs>

        {positions.map(({ senator, x, y }, i) => {
          const isLeft = x < 266; // Left side of center
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={4}
              fill={isCrossoverVote(senator) ? "url(#crossoverPulse)" : getDotColor(senator)}
              stroke={getDotBorder(senator)}
              strokeWidth={1}
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => {
                if (!lockedSenator) {
                  setHoveredSenator(senator);
                  setTooltipPos({ x, y, isLeft });
                }
              }}
              onMouseLeave={() => {
                if (!lockedSenator) {
                  setHoveredSenator(null);
                  setTooltipPos(null);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (lockedSenator?.name === senator.name) {
                  setLockedSenator(null);
                  setTooltipPos(null);
                } else {
                  setLockedSenator(senator);
                  setTooltipPos({ x, y, isLeft });
                }
              }}
            />
          );
        })}
      </svg>

      {/* Tooltip - positioned in top-left or top-right of box */}
      {displayedSenator && tooltipPos && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (lockedSenator) {
              setLockedSenator(null);
              setTooltipPos(null);
            }
          }}
          style={{
            position: "absolute",
            [tooltipPos.isLeft ? "left" : "right"]: 12,
            top: 12,
            background: "rgba(10,13,26,0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(100,100,100,0.4)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            fontFamily: "monospace",
            color: "rgba(255,255,255,0.9)",
            pointerEvents: lockedSenator ? "auto" : "none",
            zIndex: 100,
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            minWidth: 160,
            cursor: lockedSenator ? "pointer" : "default",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{displayedSenator.name}</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
            {displayedSenator.party === "R" ? "Republican" : displayedSenator.party === "D" ? "Democrat" : "Independent"} • {displayedSenator.state}
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
            Vote: {displayedSenator.vote}
          </div>
        </div>
      )}
    </div>
  );
}
