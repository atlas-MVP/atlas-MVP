"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const ITEM_H = 40;
const VISIBLE = 5;

const ALL_YEARS = Array.from({ length: 131 }, (_, i) => 1900 + i);
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
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: ITEM_H * 2,
        background: "linear-gradient(to bottom, rgba(8,11,26,0.82) 0%, transparent 100%)",
        pointerEvents: "none", zIndex: 2 }} />
      <div style={{ position: "absolute", top: ITEM_H * 2, left: 4, right: 4, height: ITEM_H,
        background: "rgba(255,255,255,0.07)", borderRadius: 8,
        pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: ITEM_H * 2,
        background: "linear-gradient(to top, rgba(8,11,26,0.82) 0%, transparent 100%)",
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
                fontSize: active ? 15 : 12, fontWeight: active ? 600 : 400,
                color: active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.25)",
                fontFamily: "monospace", letterSpacing: "0.08em",
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
  const todayYearIdx  = ALL_YEARS.indexOf(now.getFullYear());
  const todayMonthIdx = now.getMonth();
  const todayDayIdx   = now.getDate() - 1;

  const [yearIdx,  setYearIdx]  = useState(() => {
    const i = ALL_YEARS.indexOf(currentYear ?? now.getFullYear());
    return i === -1 ? todayYearIdx : i;
  });
  const [monthIdx, setMonthIdx] = useState(todayMonthIdx);
  const [dayIdx,   setDayIdx]   = useState(todayDayIdx);
  const [typeMode, setTypeMode] = useState(false);
  const [typeVal,  setTypeVal]  = useState("");
  const inputRef     = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedYear = ALL_YEARS[yearIdx];
  const maxDays      = daysInMonth(selectedYear, monthIdx);
  const days         = Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, "0"));
  const safeDay      = Math.min(dayIdx, maxDays - 1);

  useEffect(() => { if (dayIdx >= maxDays) setDayIdx(maxDays - 1); }, [monthIdx, yearIdx, maxDays, dayIdx]);

  const isLive = yearIdx === todayYearIdx && monthIdx === todayMonthIdx && safeDay === todayDayIdx;

  useEffect(() => {
    if (!expanded) return;
    onYearChange(isLive ? null : selectedYear);
    onPreviewYear?.(selectedYear);
  }, [yearIdx, expanded]);

  const close = useCallback(() => {
    onPreviewYear?.(null);
    onClose();
  }, [onPreviewYear, onClose]);

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

  useEffect(() => { if (typeMode) inputRef.current?.focus(); }, [typeMode]);

  const goLive = () => {
    setYearIdx(todayYearIdx);
    setMonthIdx(todayMonthIdx);
    setDayIdx(todayDayIdx);
    onYearChange(null);
    onPreviewYear?.(null);
    onClose();
  };

  const handleTypeSubmit = () => {
    const parsed = new Date(typeVal);
    if (!isNaN(parsed.getTime())) {
      const yi = ALL_YEARS.indexOf(parsed.getFullYear());
      if (yi !== -1) { setYearIdx(yi); setMonthIdx(parsed.getMonth()); setDayIdx(parsed.getDate() - 1); }
    }
    setTypeMode(false);
    setTypeVal("");
  };

  if (!expanded) return null;

  return (
    <div ref={containerRef} style={{
      position: "absolute",
      bottom: 58, right: 28,
      zIndex: 30,
      width: 236,
      background: "rgba(8, 11, 28, 0.52)",
      backdropFilter: "blur(32px)",
      WebkitBackdropFilter: "blur(32px)",
      border: "1px solid rgba(255,255,255,0.11)",
      borderRadius: 20,
      boxShadow: "0 12px 56px rgba(0,0,0,0.72)",
      overflow: "hidden",
      userSelect: "none",
    }}>
      {/* header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px 8px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)" }}>
          {MONTH_LABELS[monthIdx]} {String(safeDay + 1).padStart(2, "0")} · {selectedYear}
        </span>
        <button onClick={goLive} style={{
          fontSize: 7, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase",
          padding: "2px 8px", borderRadius: 10, cursor: "pointer",
          background: isLive ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${isLive ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.10)"}`,
          color: isLive ? "#22c55e" : "rgba(255,255,255,0.35)",
        }}>live</button>
      </div>

      {/* column labels */}
      <div style={{ display: "flex", padding: "6px 8px 0" }}>
        {["year","month","day"].map(l => (
          <div key={l} style={{
            flex: 1, textAlign: "center",
            fontSize: 7, fontFamily: "monospace", letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.18)", textTransform: "uppercase",
          }}>{l}</div>
        ))}
      </div>

      {/* scroll columns */}
      <div style={{ display: "flex", padding: "0 4px" }}>
        <Column items={ALL_YEARS}    selectedIdx={yearIdx}  onSelect={setYearIdx}  />
        <Column items={MONTH_LABELS} selectedIdx={monthIdx} onSelect={setMonthIdx} />
        <Column items={days}         selectedIdx={safeDay}  onSelect={setDayIdx}   />
      </div>

      {/* type a date */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px 14px" }}>
        {typeMode ? (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              ref={inputRef}
              value={typeVal}
              onChange={e => setTypeVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleTypeSubmit(); if (e.key === "Escape") setTypeMode(false); }}
              placeholder="e.g. apr 14 2026"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "rgba(255,255,255,0.7)", fontSize: 10, fontFamily: "monospace",
                letterSpacing: "0.06em",
              }}
            />
            <button onClick={handleTypeSubmit}
              style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer" }}>
              go
            </button>
          </div>
        ) : (
          <button onClick={() => setTypeMode(true)} style={{
            width: "100%", background: "none", border: "none", cursor: "pointer",
            fontSize: 9, fontFamily: "monospace", letterSpacing: "0.10em",
            color: "rgba(255,255,255,0.2)", textAlign: "left",
          }}>type a date →</button>
        )}
      </div>
    </div>
  );
}
