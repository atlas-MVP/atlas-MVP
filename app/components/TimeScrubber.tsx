"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  onYearChange: (year: number | null) => void;
  onPreviewYear?: (year: number | null) => void;
  currentYear?: number;
  expanded: boolean;
  onClose: () => void;
}

interface SnapPoint {
  year: number;
  label: string;
  position: number; // 0..1 fraction along track
  tier: "historical" | "annual";
}

interface EraDivider {
  position: number;
  label: string;
}

const HISTORICAL_EVENTS = [
  { year: 1916, label: "Sykes-Picot Agreement" },
  { year: 1920, label: "British Mandates" },
  { year: 1922, label: "USSR Founded" },
  { year: 1933, label: "Rise of Third Reich" },
  { year: 1939, label: "WWII Begins" },
  { year: 1945, label: "WWII Ends" },
  { year: 1947, label: "UN Partition Plan" },
  { year: 1948, label: "Israel Founded" },
  { year: 1949, label: "Armistice Lines" },
  { year: 1967, label: "Six-Day War" },
  { year: 1973, label: "Yom Kippur War" },
  { year: 1979, label: "Islamic Revolution + Peace Treaty" },
  { year: 1982, label: "Sinai Returned" },
  { year: 1989, label: "Berlin Wall Falls" },
  { year: 1991, label: "USSR Dissolved" },
  { year: 1993, label: "Oslo Accords" },
  { year: 1995, label: "Oslo II" },
  { year: 2000, label: "Camp David Fails" },
];

const ANNUAL_EVENTS = [
  { year: 2001, label: "9/11" },
  { year: 2002, label: "Operation Defensive Shield" },
  { year: 2003, label: "Iraq Invasion" },
  { year: 2004, label: "Abu Ghraib" },
  { year: 2005, label: "Gaza Disengagement" },
  { year: 2006, label: "Lebanon War" },
  { year: 2007, label: "Hamas Takes Gaza" },
  { year: 2008, label: "Operation Cast Lead" },
  { year: 2009, label: "" },
  { year: 2010, label: "Arab Spring Begins" },
  { year: 2011, label: "Arab Spring" },
  { year: 2012, label: "Operation Pillar of Defense" },
  { year: 2013, label: "" },
  { year: 2014, label: "ISIS Caliphate" },
  { year: 2015, label: "JCPOA Deal" },
  { year: 2016, label: "" },
  { year: 2017, label: "Jerusalem Recognized" },
  { year: 2018, label: "JCPOA Exit" },
  { year: 2019, label: "" },
  { year: 2020, label: "Abraham Accords" },
  { year: 2021, label: "Operation Guardian" },
  { year: 2022, label: "Russia Invades Ukraine" },
  { year: 2023, label: "Oct 7 Attack" },
  { year: 2024, label: "Gaza War + Lebanon War" },
  { year: 2025, label: "Twelve-Day War" },
  { year: 2026, label: "Operation Epic Fury" },
];

const HIST_START = 0;
const HIST_END   = 0.65;
const ANN_START  = 0.65;
const ANN_END    = 1.0;

function buildSnapPoints(): SnapPoint[] {
  const histCount = HISTORICAL_EVENTS.length;
  const annCount  = ANNUAL_EVENTS.length;
  const historical: SnapPoint[] = HISTORICAL_EVENTS.map((e, i) => ({
    year: e.year, label: e.label, tier: "historical" as const,
    position: HIST_START + (HIST_END - HIST_START) * (i / (histCount - 1)),
  }));
  const annual: SnapPoint[] = ANNUAL_EVENTS.map((e, i) => ({
    year: e.year, label: e.label, tier: "annual" as const,
    position: ANN_START + (ANN_END - ANN_START) * (i / (annCount - 1)),
  }));
  return [...historical, ...annual];
}

const SNAP_POINTS = buildSnapPoints();

const ERA_DIVIDERS: EraDivider[] = [
  { position: 0,    label: "ORIGINS" },
  { position: 0.22, label: "WWII" },
  { position: 0.35, label: "COLD WAR" },
  { position: 0.48, label: "ISRAEL" },
  { position: 0.65, label: "MODERN" },
];

function nearestSnap(position: number): SnapPoint {
  let best = SNAP_POINTS[0];
  let bestDist = Infinity;
  for (const sp of SNAP_POINTS) {
    const d = Math.abs(sp.position - position);
    if (d < bestDist) { bestDist = d; best = sp; }
  }
  return best;
}

export default function TimeScrubber({ onYearChange, onPreviewYear, currentYear, expanded, onClose }: Props) {
  const [handlePos, setHandlePos]     = useState(0);
  const [activeSnap, setActiveSnap]   = useState<SnapPoint | null>(null);
  const [previewSnap, setPreviewSnap] = useState<SnapPoint | null>(null);
  const [isDragging, setIsDragging]   = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync from external currentYear
  useEffect(() => {
    if (currentYear == null) return;
    const sp = SNAP_POINTS.find(p => p.year === currentYear);
    if (sp) { setActiveSnap(sp); setHandlePos(sp.position); }
  }, [currentYear]);

  const posFromX = useCallback((clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  // Snap exactly — no lerp, CSS transition on the handle does the animation
  const commitSnap = useCallback((pos: number) => {
    const sp = nearestSnap(pos);
    setHandlePos(sp.position);   // exact — CSS transition handles the visual snap
    setActiveSnap(sp);
    setPreviewSnap(null);
    onYearChange(sp.year);
  }, [onYearChange]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const onMove = (me: MouseEvent) => {
      const pos = posFromX(me.clientX);
      setHandlePos(pos);
      const snap = nearestSnap(pos);
      setPreviewSnap(snap);
      onPreviewYear?.(snap.year);
    };
    const onUp = (me: MouseEvent) => {
      setIsDragging(false);
      onPreviewYear?.(null);
      commitSnap(posFromX(me.clientX));
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [posFromX, commitSnap]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    const onMove = (te: TouchEvent) => {
      const pos = posFromX(te.touches[0].clientX);
      setHandlePos(pos);
      const snap = nearestSnap(pos);
      setPreviewSnap(snap);
      onPreviewYear?.(snap.year);
    };
    const onEnd = (te: TouchEvent) => {
      setIsDragging(false);
      onPreviewYear?.(null);
      const t = te.changedTouches[0] ?? te.touches[0];
      commitSnap(posFromX(t.clientX));
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);
  }, [posFromX, commitSnap]);

  // Keyboard navigation
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Escape") return;
      e.preventDefault();
      if (e.key === "Escape") {
        close();
        return;
      }
      const current = activeSnap ?? SNAP_POINTS[0];
      const idx = SNAP_POINTS.indexOf(current);
      const next = e.key === "ArrowLeft"
        ? SNAP_POINTS[Math.max(0, idx - 1)]
        : SNAP_POINTS[Math.min(SNAP_POINTS.length - 1, idx + 1)];
      if (!next) return;
      setHandlePos(next.position);
      setActiveSnap(next);
      onYearChange(next.year);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [expanded, activeSnap, onYearChange]);

  // Click-outside to close
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        close();
      }
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 150);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handler); };
  }, [expanded]);

  const close = () => {
    onClose();
    setActiveSnap(null);
    setPreviewSnap(null);
    setHandlePos(0);
    onYearChange(null);
  };

  const displaySnap = previewSnap ?? activeSnap;
  const SNAP_EASE = "left 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

  if (!expanded) return null;

  // ── Expanded — just the track ─────────────────────────────────────────────────
  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        width: "36vw",
        zIndex: 50,
        pointerEvents: "auto",
      }}
    >
      {/* Pill */}
      <div style={{
        background: "rgba(6,8,20,0.58)",
        border: "1px solid rgba(255,255,255,0.13)",
        borderRadius: 999,
        backdropFilter: "blur(32px)",
        padding: "14px 32px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}>
        {/* Track */}
        <div
          ref={trackRef}
          style={{ position: "relative", height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 99, cursor: "pointer" }}
          onClick={e => { if (!isDragging) commitSnap(posFromX(e.clientX)); }}
        >
          {/* Groove inset shadow */}
          <div style={{ position: "absolute", inset: 0, borderRadius: 99, boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)", pointerEvents: "none", zIndex: 1 }} />

          {/* Fill — blue→violet gradient */}
          <div style={{
            position: "absolute", left: 0, top: 0, height: "100%",
            width: `${handlePos * 100}%`,
            background: "linear-gradient(90deg, #3b82f6, #818cf8)",
            borderRadius: 99,
            opacity: 0.75,
            transition: isDragging ? "none" : "width 0.18s cubic-bezier(0.25,0.46,0.45,0.94)",
          }} />

          {/* Tick marks */}
          {SNAP_POINTS.map(sp => {
            const isActive = activeSnap?.year === sp.year;
            const isPrev   = previewSnap?.year === sp.year;
            return (
              <div
                key={sp.year}
                onClick={e => { e.stopPropagation(); setHandlePos(sp.position); setActiveSnap(sp); setPreviewSnap(null); onYearChange(sp.year); }}
                title={`${sp.year}${sp.label ? ` — ${sp.label}` : ""}`}
                style={{
                  position: "absolute",
                  left: `${sp.position * 100}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: sp.tier === "historical" ? 1.5 : 1,
                  height: sp.tier === "historical" ? 11 : 7,
                  background: isActive || isPrev
                    ? "#818cf8"
                    : sp.tier === "historical" ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.10)",
                  borderRadius: 2, cursor: "pointer",
                  transition: "background 0.15s, opacity 0.15s",
                  zIndex: 2,
                }}
              />
            );
          })}

          {/* Handle */}
          <div
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            style={{
              position: "absolute",
              left: `${handlePos * 100}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 16, height: 16, borderRadius: "50%",
              background: "linear-gradient(135deg, #ffffff, #dde8ff)",
              boxShadow: isDragging
                ? "0 0 0 3px rgba(129,140,248,0.6), 0 0 20px rgba(99,102,241,0.6), 0 2px 8px rgba(0,0,0,0.4)"
                : "0 0 0 2px rgba(129,140,248,0.45), 0 0 12px rgba(99,102,241,0.35), 0 2px 6px rgba(0,0,0,0.35)",
              cursor: isDragging ? "grabbing" : "grab",
              zIndex: 10,
              transition: isDragging ? "none" : SNAP_EASE,
              userSelect: "none", touchAction: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
