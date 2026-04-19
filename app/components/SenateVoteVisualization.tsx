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

  // Calculate vote counts
  const republicanAye = senators.filter(s => s.party === "R" && s.vote === "Aye").length;
  const republicanNo = senators.filter(s => s.party === "R" && s.vote === "No").length;
  const democratAye = senators.filter(s => s.party === "D" && s.vote === "Aye").length;
  const democratNo = senators.filter(s => s.party === "D" && s.vote === "No").length;

  const totalAye = republicanAye + democratAye;
  const totalNo = republicanNo + democratNo;

  // Generate hemicycle positions for senators
  const generatePositions = () => {
    const positions: Array<{ senator: Senator; x: number; y: number }> = [];
    const centerX = 400;
    const centerY = 350;
    const rows = 7;
    const senatorsPerRow = Math.ceil(senators.length / rows);

    let index = 0;
    for (let row = 0; row < rows; row++) {
      const radius = 100 + row * 35;
      const senatorsInThisRow = Math.min(senatorsPerRow + row * 2, senators.length - index);
      const angleSpan = Math.PI; // 180 degrees for hemicycle
      const angleStep = angleSpan / (senatorsInThisRow + 1);

      for (let i = 0; i < senatorsInThisRow && index < senators.length; i++) {
        const angle = Math.PI + angleStep * (i + 1); // Start from left side
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        positions.push({ senator: senators[index], x, y });
        index++;
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
        width: 800,
        height: 500,
        background: "rgba(4,6,18,0.85)",
        backdropFilter: "blur(20px)",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        padding: 20,
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 18,
          fontWeight: 700,
          fontFamily: "monospace",
          letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.7)",
        }}
      >
        {title}
      </div>

      {/* Vote count */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: 48,
          fontWeight: 700,
          fontFamily: "monospace",
          color: "rgba(255,255,255,0.9)",
        }}
      >
        {totalAye}–{totalNo}
      </div>

      {/* Senate floor dots */}
      <svg width="800" height="500" style={{ position: "absolute", top: 0, left: 0 }}>
        {positions.map(({ senator, x, y }, i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={6}
            fill={getDotColor(senator)}
            stroke={getDotBorder(senator)}
            strokeWidth={1.5}
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
