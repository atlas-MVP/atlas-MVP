"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const ITEM_H = 34;
const VISIBLE = 5;

const ALL_YEARS    = Array.from({ length: 27 }, (_, i) => 2000 + i); // 2000–2026
const MONTH_LABELS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function Column({ items, selectedIdx, onSelect, limit }: {
  items: (string | number)[];
  selectedIdx: number;
  onSelect: (i: number) => void;
  limit: number; // max selectable index (inclusive)
}) {
  const ref               = useRef<HTMLDivElement>(null);
  const snapTimer         = useRef<ReturnType<typeof setTimeout> | null>(null);
  const committed         = useRef(selectedIdx);
  const isProgrammatic    = useRef(false);

  const isFirstRender = useRef(true);

  // Programmatic scroll — instant on mount, smooth on change, suppress onSelect during animation
  useEffect(() => {
    isProgrammatic.current = true;
    committed.current = selectedIdx;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (ref.current) ref.current.scrollTop = selectedIdx * ITEM_H;
      isProgrammatic.current = false;
    } else {
      ref.current?.scrollTo({ top: selectedIdx * ITEM_H, behavior: "smooth" });
      const t = setTimeout(() => { isProgrammatic.current = false; }, 400);
      return () => clearTimeout(t);
    }
  }, [selectedIdx]);

  const snap = useCallback(() => {
    if (!ref.current) return;
    const idx = Math.max(0, Math.min(Math.round(ref.current.scrollTop / ITEM_H), limit));
    isProgrammatic.current = true;
    ref.current.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
    setTimeout(() => { isProgrammatic.current = false; }, 400);
    if (idx !== committed.current) { committed.current = idx; onSelect(idx); }
  }, [limit, onSelect]);

  const handleScroll = () => {
    if (isProgrammatic.current) return;
    if (snapTimer.current) clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(snap, 160); // only snap/select after user stops
  };

  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: ITEM_H * 2,
        background: "linear-gradient(to bottom, rgba(2,4,14,0.88) 0%, transparent 100%)",
        pointerEvents: "none", zIndex: 2 }} />
      <div style={{ position: "absolute", top: ITEM_H * 2, left: 3, right: 3, height: ITEM_H,
        background: "rgba(96,130,200,0.12)", borderRadius: 7,
        pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: ITEM_H * 2,
        background: "linear-gradient(to top, rgba(2,4,14,0.88) 0%, transparent 100%)",
        pointerEvents: "none", zIndex: 2 }} />
      <div ref={ref} onScroll={handleScroll}
        onWheel={e => { e.preventDefault(); ref.current!.scrollTop -= e.deltaY; }}
        style={{ height: ITEM_H * VISIBLE, overflowY: "scroll", scrollbarWidth: "none" }}>
        <div style={{ height: ITEM_H * 2 }} />
        {items.map((item, i) => {
          const active   = i === selectedIdx;
          const disabled = i > limit;
          return (
            <div key={i}
              onClick={() => {
                if (disabled) return;
                committed.current = i;
                ref.current?.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
                onSelect(i);
              }}
              style={{
                height: ITEM_H, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: active ? 14 : 11,
                fontWeight: active ? 700 : 300,
                letterSpacing: "0.3em",
                color: disabled
                  ? "rgba(255,255,255,0.07)"
                  : active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.22)",
                cursor: disabled ? "default" : "pointer",
                userSelect: "none",
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
  resetSignal?: number;
}

export default function TimeScrubber({
  expanded, onClose, onYearChange, onPreviewYear, currentYear, resetSignal,
}: Props) {
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

  const selectedYear   = ALL_YEARS[yearIdx];
  const isCurrentYear  = yearIdx === todayYearIdx;
  const isCurrentMonth = isCurrentYear && monthIdx === todayMonthIdx;
  const totalDays      = daysInMonth(selectedYear, monthIdx);
  const days           = Array.from({ length: totalDays }, (_, i) => String(i + 1).padStart(2, "0"));

  const monthLimit = isCurrentYear  ? todayMonthIdx : 11;
  const dayLimit   = isCurrentMonth ? todayDayIdx   : totalDays - 1;

  // Clamp month/day when year changes — use handler-level clamping only
  const handleYearSelect = useCallback((idx: number) => {
    setYearIdx(idx);
    const newIsCurrentYear = ALL_YEARS[idx] === now.getFullYear();
    if (newIsCurrentYear) {
      setMonthIdx(m => Math.min(m, todayMonthIdx));
      setDayIdx(d => Math.min(d, todayDayIdx));
    }
  }, [todayMonthIdx, todayDayIdx]);

  const handleMonthSelect = useCallback((idx: number) => {
    setMonthIdx(idx);
    if (isCurrentYear && idx === todayMonthIdx) {
      setDayIdx(d => Math.min(d, todayDayIdx));
    }
  }, [isCurrentYear, todayMonthIdx, todayDayIdx]);

  // Notify parent on year change only
  useEffect(() => {
    if (!expanded) return;
    const isLive = yearIdx === todayYearIdx && monthIdx === todayMonthIdx && dayIdx === todayDayIdx;
    onYearChange(isLive ? null : selectedYear);
    onPreviewYear?.(selectedYear);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearIdx, expanded]);

  // Reset to today when live button tapped
  useEffect(() => {
    if (!resetSignal) return;
    setYearIdx(todayYearIdx);
    setMonthIdx(todayMonthIdx);
    setDayIdx(todayDayIdx);
    onYearChange(null);
    onPreviewYear?.(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

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
      borderRadius: 18,
      overflow: "hidden",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
      userSelect: "none",
    }}>
      <div style={{ display: "flex" }}>
        <Column items={ALL_YEARS}    selectedIdx={yearIdx}  onSelect={handleYearSelect}  limit={todayYearIdx} />
        <Column items={MONTH_LABELS} selectedIdx={monthIdx} onSelect={handleMonthSelect} limit={monthLimit} />
        <Column items={days}         selectedIdx={dayIdx}   onSelect={setDayIdx}          limit={dayLimit} />
      </div>
    </div>
  );
}
