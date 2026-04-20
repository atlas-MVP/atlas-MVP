"use client";

import { useEffect, useState } from "react";

interface Props {
  onYearClick?: () => void;
  displayYear?: number;
  /** Raw date string from an active history tile — e.g. "October 7, 2023" */
  historyDate?: string | null;
}

// Parse a timeline date string into { month, day, year } where available
function parseHistoryDate(raw: string): { month?: string; day?: string; year?: string } {
  // Try "Month Day, Year" — e.g. "October 7, 2023"
  const full = raw.match(/^(\w+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (full) return { month: full[1], day: full[2], year: full[3] };

  // Try "Month Year" — e.g. "September 2024"
  const monthYear = raw.match(/^(\w+)\s+(\d{4})/);
  if (monthYear) return { month: monthYear[1], year: monthYear[2] };

  // Try bare year — e.g. "2015 — JCPOA"
  const bareYear = raw.match(/^(\d{4})/);
  if (bareYear) return { year: bareYear[1] };

  // Try "Year – Present" — e.g. "2024 – Present"
  const rangeYear = raw.match(/(\d{4})\s*[–—-]/);
  if (rangeYear) return { year: rangeYear[1] };

  return {};
}

const MONTH_ABBREV: Record<string, string> = {
  January: "Jan", February: "Feb", March: "Mar", April: "Apr",
  May: "May", June: "Jun", July: "Jul", August: "Aug",
  September: "Sep", October: "Oct", November: "Nov", December: "Dec",
};

const MONTH_NUM: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

export default function Clock({ onYearClick, displayYear, historyDate }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Live date
  const liveMonth = now.getMonth() + 1;
  const liveDay   = String(now.getDate()).padStart(2, "0");
  const liveYear  = now.getFullYear();

  // Historical date from active tile
  const hist = historyDate ? parseHistoryDate(historyDate) : null;
  const isHistorical = hist && hist.year;

  // Format the date line
  let dateLine: string;
  let yearLine: string | number;

  if (isHistorical) {
    const m = hist.month ? MONTH_NUM[hist.month] : undefined;
    const d = hist.day ? String(hist.day).padStart(2, "0") : undefined;
    if (m && d) {
      dateLine = `${m}.${d}`;
    } else if (hist.month) {
      dateLine = MONTH_ABBREV[hist.month] ?? hist.month;
    } else {
      dateLine = "—";
    }
    yearLine = Number(hist.year);
  } else {
    dateLine = `${liveMonth}.${liveDay}`;
    yearLine = displayYear ?? liveYear;
  }

  return (
    <div style={{
      textAlign: "right",
      pointerEvents: "none",
    }}>
      {/* Year only */}
      <div
        onClick={onYearClick}
        style={{
          color: isHistorical ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.8)",
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
          transition: "color 0.3s ease",
        }}
        onMouseEnter={e => { if (onYearClick) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,1)"; }}
        onMouseLeave={e => { if (onYearClick) (e.currentTarget as HTMLElement).style.color = isHistorical ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.8)"; }}
      >
        {yearLine}
      </div>
    </div>
  );
}
