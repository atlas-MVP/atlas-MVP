"use client";

import { useEffect, useState } from "react";

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

  // x.xx format — month.day (no leading zero on month, zero-pad day)
  const month = now.getMonth() + 1;
  const day   = String(now.getDate()).padStart(2, "0");
  const year  = now.getFullYear();

  return (
    <div style={{
      textAlign: "right",
      pointerEvents: "none",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 3,
    }}>
      {/* Date — monospace, 2px smaller than year, right-aligned */}
      <div style={{
        color: "rgba(255,255,255,0.22)",
        fontSize: 12,
        fontFamily: "monospace",
        fontWeight: 400,
        letterSpacing: "0.14em",
        textTransform: "uppercase" as const,
        textShadow: "0 0 12px rgba(0,0,0,0.9)",
        textAlign: "right",
        width: "100%",
      }}>
        {month}.{day}
      </div>
      {/* Year — same font as ATLAS, 14px */}
      <div
        onClick={onYearClick}
        style={{
          color: "rgba(255,255,255,0.8)",
          fontSize: 14,
          fontWeight: 300,
          letterSpacing: "0.3em",
          fontFamily: "inherit",
          lineHeight: 1,
          textAlign: "right",
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
