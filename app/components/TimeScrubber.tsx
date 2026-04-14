"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const ITEM_H = 34;
const VISIBLE = 5;

const ALL_YEARS  = Array.from({ length: 27 }, (_, i) => 2000 + i); // 2000–2026
const MONTH_LABELS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function Column({ items, selectedIdx, onSelect }: {
  items: (string | number)[];
  selectedIdx: number;
  onSelect: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const committed = useRef(selectedIdx);

  useEffect(() => {
    ref.current?.scrollTo({ top: selectedIdx * ITEM_H, behavior: "smooth" });
    committed.current = selectedIdx;
  }, [selectedIdx]);

  const snap = useCallback(() => {
    if (!ref.current) return;
    const idx = Math.max(0, Math.min(Math.round(ref.current.scrollTop / ITEM_H), items.length - 1));
    ref.current.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
    if (idx !== committed.current) { committed.current = idx; onSelect(idx); }
  }, [items.length, onSelect]);

  const handleScroll = () => {
    if (snapTimer.current) clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(snap, 130);
    if (!ref.current) return;
    const idx = Math.max(0, Math.min(Math.round(ref.current.scrollTop / ITEM_H), items.length - 1));
    if (idx !== committed.current) { committed.current = idx; onSelect(idx); }
  };

  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      {/* top fade */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: ITEM_H * 2,
        background: "linear-gradient(to bottom, rgba(8,11,26,0.85) 0%, transparent 100%)",
        pointerEvents: "none", zIndex: 2 }} />
      {/* selection bar */}
      <div style={{ position: "absolute", top: ITEM_H * 2, left: 3, right: 3, height: ITEM_H,
        background: "rgba(96,130,200,0.12)", borderRadius: 7,
        pointerEvents: "none", zIndex: 1 }} />
      {/* bottom fade */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: ITEM_H * 2,
        background: "linear-gradient(to top, rgba(8,11,26,0.85) 0%, transparent 100%)",
        pointerEvents: "none", zIndex: 2 }} />
      <div ref={ref} onScroll={handleScroll}
        style={{ height: ITEM_H * VISIBLE, overflowY: "scroll", scrollbarWidth: "none" }}>
        <div style={{ height: ITEM_H * 2 }} />
        {items.map((item, i) => {
          const active = i === selectedIdx;
          return (
            <div key={i}
              onClick={() => { ref.current?.scrollTo({ top: i * ITEM_H, behavior: "smooth" }); onSelect(i); }}
              style={{
                height: ITEM_H, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: active ? 14 : 11,
                fontWeight: active ? 700 : 300,
                letterSpacing: "0.3em",
                color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.22)",
                cursor: "pointer", userSelect: "none",
                transition: "color 0.1s, font-size 0.1s",
              }}
            >{item}</div>
          );
        })}
        <div style={{ height: ITEM_H * 2 }} />
      </div>
    </div>
  );
}

interface Props {
  expanded: boolean;
  onClose: () => void;
  onYearChange: (year: number | null) => void;
  onPreviewYear?: (year: number | null) => void;
  currentYear?: number;
}

export default function TimeScrubber({ expanded, onClose, onYearChange, onPreviewYear, currentYear }: Props) {
  const now = new Date();
  const todayYearIdx  = ALL_YEARS.indexOf(now.getFullYear()) === -1 ? ALL_YEARS.length - 1 : ALL_YEARS.indexOf(now.getFullYear());
  const todayMonthIdx = now.getMonth();
  const todayDayIdx   = now.getDate() - 1;

  const [yearIdx,  setYearIdx]  = useState(() => {
    const i = ALL_YEARS.indexOf(currentYear ?? now.getFullYear());
    return i === -1 ? todayYearIdx : i;
  });
  const [monthIdx, setMonthIdx] = useState(todayMonthIdx);
  const [dayIdx,   setDayIdx]   = useState(todayDayIdx);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedYear = ALL_YEARS[yearIdx];
  const maxDays      = daysInMonth(selectedYear, monthIdx);
  const days         = Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, "0"));
  const safeDay      = Math.min(dayIdx, maxDays - 1);

  useEffect(() => { if (dayIdx >= maxDays) setDayIdx(maxDays - 1); }, [monthIdx, yearIdx, maxDays, dayIdx]);

  useEffect(() => {
    if (!expanded) return;
    const isLive = yearIdx === todayYearIdx && monthIdx === todayMonthIdx && safeDay === todayDayIdx;
    onYearChange(isLive ? null : selectedYear);
    onPreviewYear?.(selectedYear);
  }, [yearIdx, expanded]);

  const close = useCallback(() => { onPreviewYear?.(null); onClose(); }, [onPreviewYear, onClose]);

  useEffect(() => {
    if (!expanded) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "Enter") close(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [expanded, close]);

  useEffect(() => {
    if (!expanded) return;
    const h = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    };
    const t = setTimeout(() => document.addEventListener("mousedown", h), 0);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", h); };
  }, [expanded, close]);

  if (!expanded) return null;

  return (
    <div ref={containerRef} style={{
      position: "absolute",
      bottom: 58, right: 28,
      zIndex: 30,
      width: 210,
      background: "rgba(8, 11, 28, 0.52)",
      backdropFilter: "blur(32px)",
      WebkitBackdropFilter: "blur(32px)",
      border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: 16,
      boxShadow: "0 12px 56px rgba(0,0,0,0.72)",
      overflow: "hidden",
      userSelect: "none",
    }}>
      <div style={{ display: "flex", padding: "4px 4px" }}>
        <Column items={ALL_YEARS}    selectedIdx={yearIdx}  onSelect={setYearIdx}  />
        <Column items={MONTH_LABELS} selectedIdx={monthIdx} onSelect={setMonthIdx} />
        <Column items={days}         selectedIdx={safeDay}  onSelect={setDayIdx}   />
      </div>
    </div>
  );
}
