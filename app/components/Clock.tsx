"use client";

import { useEffect, useState } from "react";

const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];

interface Props {
  onYearClick?: () => void;
  displayYear?: number;
}

export default function Clock({ onYearClick, displayYear }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const month = MONTHS[now.getMonth()];
  const day = now.getDate();
  const year = now.getFullYear();

  return (
    <div style={{
      position: "absolute",
      bottom: 16,
      right: 28,
      zIndex: 10,
      textAlign: "right",
      pointerEvents: "none",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 3,
    }}>
      {/* Month + Day — above year */}
      <div style={{
        color: "rgba(255,255,255,0.8)",
        fontSize: 13,
        fontWeight: 300,
        letterSpacing: "0.3em",
        textShadow: "0 0 12px rgba(0,0,0,0.9)",
      }}>
        {month} {day}
      </div>
      {/* Year — tappable timeline trigger */}
      <div
        onClick={onYearClick}
        style={{
          color: "rgba(255,255,255,0.8)",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.3em",
          lineHeight: 1,
          textShadow: "0 0 24px rgba(0,0,0,0.95)",
          pointerEvents: onYearClick ? "auto" : "none",
          cursor: onYearClick ? "pointer" : "default",
          userSelect: "none",
          transition: "color 0.15s",
        }}
        onMouseEnter={e => { if (onYearClick) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,1)"; }}
        onMouseLeave={e => { if (onYearClick) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; }}
      >
        {displayYear ?? year}
      </div>
    </div>
  );
}
