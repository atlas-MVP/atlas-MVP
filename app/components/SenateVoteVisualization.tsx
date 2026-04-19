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

export default function SenateVoteVisualization({
  title = "SENATE",
  senators,
}: SenateVoteVisualizationProps) {
  const [hoveredSenator, setHoveredSenator] = useState<Senator | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
    const baseRadius = 67;
    const radiusIncrement = 23;

    // Place Aye voters on left side (π to 3π/2)
    let ayeIndex = 0;
    for (let row = 0; row < rows; row++) {
      const radius = baseRadius + row * radiusIncrement;
      const senatorsInRow = Math.min(Math.ceil(ayeVoters.length / rows) + Math.floor(row * 0.5), ayeVoters.length - ayeIndex);
      const angleStart = Math.PI;
      const angleEnd = Math.PI * 1.5;
      const angleStep = (angleEnd - angleStart) / (senatorsInRow + 1);

      for (let i = 0; i < senatorsInRow && ayeIndex < ayeVoters.length; i++) {
        const angle = angleStart + angleStep * (i + 1);
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
      const angleStep = (angleEnd - angleStart) / (senatorsInRow + 1);

      for (let i = 0; i < senatorsInRow && noIndex < noVoters.length; i++) {
        const angle = angleStart + angleStep * (i + 1);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        positions.push({ senator: noVoters[noIndex], x, y });
        noIndex++;
      }
    }

    return positions;
  };

  const positions = generatePositions();

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

  return (
    <div
      style={{
        position: "relative",
        width: 533,
        height: 300,
        background: "rgba(4,6,18,0.75)",
        backdropFilter: "blur(20px)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "12px 8px 8px",
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "monospace",
          letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.7)",
        }}
      >
        {title}
      </div>

      {/* Vote count - below floor */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
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

      {/* Senate floor dots */}
      <svg width="533" height="333" style={{ position: "absolute", top: 0, left: 0 }}>
        {positions.map(({ senator, x, y }, i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={4}
            fill={getDotColor(senator)}
            stroke={getDotBorder(senator)}
            strokeWidth={1}
            style={{ cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={(e) => {
              setHoveredSenator(senator);
              setMousePos({ x: e.clientX, y: e.clientY });
            }}
            onMouseMove={(e) => {
              setMousePos({ x: e.clientX, y: e.clientY });
            }}
            onMouseLeave={() => setHoveredSenator(null)}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredSenator && (
        <div
          style={{
            position: "fixed",
            left: mousePos.x + 12,
            top: mousePos.y + 12,
            background: "rgba(10,13,26,0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(100,100,100,0.4)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            fontFamily: "monospace",
            color: "rgba(255,255,255,0.9)",
            pointerEvents: "none",
            zIndex: 10000,
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            minWidth: 180,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{hoveredSenator.name}</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
            {hoveredSenator.party === "R" ? "Republican" : hoveredSenator.party === "D" ? "Democrat" : "Independent"} • {hoveredSenator.state}
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
            Vote: {hoveredSenator.vote}
          </div>
        </div>
      )}
    </div>
  );
}
