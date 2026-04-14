"use client";

import { useEffect, useState } from "react";

const MONTHS = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];

interface Props {
  onYearClick?: () => void;
  displayYear?: number | null;
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
  const hh = String(now.getHours()); // no leading zero
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

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
      {/* Year — tappable timeline trigger */}
      <div
        onClick={onYearClick}
        style={{
          color: "rgba(255,255,255,0.82)",
          fontSize: 20,
          fontFamily: "var(--font-exo2), sans-serif",
          fontWeight: 800,
          letterSpacing: "0.08em",
          lineHeight: 1,
          textShadow: "0 0 24px rgba(0,0,0,0.95)",
          pointerEvents: onYearClick ? "auto" : "none",
          cursor: onYearClick ? "pointer" : "default",
          userSelect: "none",
          transition: "color 0.15s",
        }}
        onMouseEnter={e => { if (onYearClick) (e.currentTarget as HTMLElement).style.color = "rgba(147,197,253,0.95)"; }}
        onMouseLeave={e => { if (onYearClick) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.82)"; }}
      >
        {displayYear ?? year}
      </div>
      <div style={{
        color: "rgba(255,255,255,0.45)",
        fontSize: 10,
        fontFamily: "monospace",
        letterSpacing: "0.20em",
        fontWeight: 600,
        textShadow: "0 0 12px rgba(0,0,0,0.9)",
      }}>
        {month} {day}
      </div>
    </div>
  );
}
