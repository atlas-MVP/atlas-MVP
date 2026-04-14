"use client";

import { useState, useEffect, useRef } from "react";

// Maps danger level 1–4 to deep blue → deep purple (danger 5 uses animated heat pulse class)
function dangerColor(d: number): string {
  if (d >= 4) return "#6d28d9";
  if (d >= 3) return "#4338ca";
  if (d >= 2) return "#1d4ed8";
  return "#1e3a8a";
}

const PRIORITY_COLORS: string[] = ["#ef4444", "#f87171", "#fbbf24", "#60a5fa"];

interface Conflict {
  rank: number;
  pulse: boolean;
  label: string;
  sub: string;
  code: string; // country code to open in CountryPanel
  flyTo: { center: [number,number]; zoom: number };
}

const TOP_CONFLICTS: Conflict[] = [
  {
    rank: 0, pulse: true,
    label: "Israel — Lebanon conflict",
    sub: "cross-border exchanges intensifying. IDF artillery active in southern Lebanon. Hezbollah rockets reported in Galilee.",
    code: "LBN",
    flyTo: { center: [35.2, 33.0] as [number,number], zoom: 7.2 },
  },
  {
    rank: 1, pulse: true,
    label: "US — Israel — Iran war",
    sub: "regional escalation ongoing. US 5th Fleet conducting operations in Persian Gulf. Iran nuclear program at center of diplomatic breakdown.",
    code: "ISR",
    flyTo: { center: [44.0, 30.0] as [number,number], zoom: 4.2 },
  },
];

const MORE_CONFLICTS = [
  { label: "Russia — Ukraine war",   sub: "Donetsk front active",              code: "UKR", flyTo: { center: [34.0, 49.0] as [number,number], zoom: 4.5 } },
  { label: "Gaza genocide",           sub: "aid blockade, 58,000+ killed",       code: "PSE", flyTo: { center: [34.4, 31.5] as [number,number], zoom: 7.0 } },
  { label: "Sudan civil war",         sub: "RSF advancing in Khartoum",          code: "SDN", flyTo: { center: [32.5, 15.6] as [number,number], zoom: 5.5 } },
  { label: "Myanmar civil war",       sub: "junta losing territorial control",   code: "MMR", flyTo: { center: [96.1, 19.7] as [number,number], zoom: 5.0 } },
];

const DISASTERS = [
  { label: "Myanmar earthquake",  sub: "Mandalay Region",      affected: "14.5M affected", casualties: "3,800+ dead · 5,000+ injured", flyTo: { center: [96.0, 21.9] as [number,number], zoom: 5.5 } },
  { label: "LA wildfires",         sub: "California, USA",      affected: "180K displaced",  casualties: "29 dead · 12,000 structures",  flyTo: { center: [-118.4, 34.1] as [number,number], zoom: 7.5 } },
];

interface FeedItem {
  time: string;
  danger: number; // 1=blue, 5=red
  code: string;
  text: string;
  flyTo: { center: [number,number]; zoom: number };
  sources: string[];
  confidence: number;
}

const LIVE_FEED: FeedItem[] = [
  { time: "NOW",    danger: 5, code: "LBN", text: "Israel-Lebanon border exchange — IDF artillery responds to Hezbollah rocket fire in Galilee",  flyTo: { center: [35.2, 33.1] as [number,number], zoom: 7   }, sources: ["AP", "Reuters", "ACLED"], confidence: 96 },
  { time: "12m",    danger: 5, code: "IRN", text: "US 5th Fleet announces heightened readiness posture in Persian Gulf",                           flyTo: { center: [50.5, 26.2] as [number,number], zoom: 5   }, sources: ["Reuters", "AP"],          confidence: 93 },
  { time: "28m",    danger: 4, code: "UKR", text: "Ukraine reports overnight drone barrage — Kyiv air defenses activated",                         flyTo: { center: [30.5, 50.4] as [number,number], zoom: 6   }, sources: ["NYT", "Reuters"],         confidence: 89 },
  { time: "55m",    danger: 4, code: "PSE", text: "Northern Gaza hospitals running on emergency reserves — collapse imminent",                      flyTo: { center: [34.4, 31.6] as [number,number], zoom: 8   }, sources: ["AP", "Al Jazeera"],       confidence: 94 },
  { time: "41m",    danger: 3, code: "SDN", text: "RSF forces reported inside Omdurman residential districts — civilian evacuation underway",      flyTo: { center: [32.5, 15.6] as [number,number], zoom: 6   }, sources: ["Al Jazeera", "ACLED"],    confidence: 82 },
  { time: "1h 10m", danger: 2, code: "TWN", text: "PLA carrier group Shandong approaches Taiwan median line — GDELT naval index elevated",          flyTo: { center: [121.5, 24.5] as [number,number], zoom: 6.5}, sources: ["ACLED", "GDELT"],         confidence: 79 },
];

// Typing animation for alert text
function TypingAlert({ text, color }: { text: string; color: string }) {
  const [displayed, setDisplayed] = useState("");
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = false;
    setDisplayed("");
    let i = 0;
    const total = text.length;
    const perChar = Math.max(8, Math.round(900 / total));
    const tick = () => {
      if (cancelRef.current) return;
      if (i <= total) {
        setDisplayed(text.slice(0, i));
        i++;
        setTimeout(tick, perChar);
      }
    };
    const t = setTimeout(tick, 120);
    return () => { cancelRef.current = true; clearTimeout(t); };
  }, [text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span style={{ opacity: 0.35, color }}>▌</span>
      )}
    </span>
  );
}

interface Props {
  onClose: () => void;
  onNavigate?: (code: string | null, center: [number, number], zoom: number, feedItem?: FeedItem) => void;
  onHeadlinesToggle?: () => void;
  headlinesOpen?: boolean;
  onSourceClick?: (source: string) => void;
}

export default function AtlasHQ({ onClose, onNavigate, onHeadlinesToggle, onSourceClick }: Props) {
  const [showMore, setShowMore] = useState(false);
  const [hoveredFeed, setHoveredFeed] = useState<number | null>(null);
  const [lockedFeed, setLockedFeed]   = useState<number | null>(null);
  const [hoverMidY, setHoverMidY]     = useState(0);
  const [openedSources, setOpenedSources] = useState<number | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeFeed = hoveredFeed ?? lockedFeed;
  const cancelLeave = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); };
  const scheduleLeave = () => {
    cancelLeave();
    leaveTimer.current = setTimeout(() => {
      setHoveredFeed(null);
      if (lockedFeed === null) setOpenedSources(null);
    }, 120);
  };

  const fmt12 = (d: Date) => {
    const h = d.getHours() % 12 || 12;
    const m = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    const ampm = d.getHours() < 12 ? "am" : "pm";
    return `${h}:${m}:${s} ${ampm}`;
  };

  const [clockTime, setClockTime] = useState(() => fmt12(new Date()));

  useEffect(() => {
    const id = setInterval(() => setClockTime(fmt12(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
    <div style={{
      position: "absolute",
      top: 72, left: 20, bottom: 20,
      width: 428,
      zIndex: 20,
      display: "flex",
      flexDirection: "column",
      background: "rgba(4,6,18,0.72)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      backdropFilter: "blur(40px)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
      overflow: "hidden",
      pointerEvents: "auto",
    }}>

      {/* Header */}
      <div style={{
        padding: "14px 18px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontFamily: "monospace", letterSpacing: "0.22em", color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>radar</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>{clockTime}</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
          >×</button>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>

        {/* War photo */}
        <div style={{
          margin: "14px 14px 0", height: 130, borderRadius: 10,
          overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0, position: "relative",
          background: "#000",
          cursor: "pointer",
        }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/GazaCity-Drone_airstrike.jpg/640px-GazaCity-Drone_airstrike.jpg"
            alt="Conflict"
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />

          {/* Play button — outline triangle only */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <polygon
                points="17,12 17,32 34,22"
                fill="none"
                stroke="rgba(255,255,255,0.32)"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div style={{ position: "absolute", bottom: 8, left: 10, fontFamily: "monospace", fontSize: 7, letterSpacing: "0.16em", color: "rgba(255,255,255,0.4)" }}>
            ACTIVE THEATRES — {new Date().toUTCString().slice(5,11).toUpperCase()}
          </div>
        </div>

        {/* VIOLENCE */}
        <SectionLabel label="geopolitics" />
        <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          {TOP_CONFLICTS.map((c) => (
            <div
              key={c.label}
              onClick={() => onNavigate?.(c.code, c.flyTo.center, c.flyTo.zoom)}
              style={{
                padding: "12px 13px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontFamily: "monospace", letterSpacing: "0.07em", color: "rgba(255,255,255,0.92)", fontWeight: 700 }}>{c.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", marginTop: 5, lineHeight: 1.55 }}>{c.sub}</div>
                </div>
              </div>
            </div>
          ))}

          {showMore && MORE_CONFLICTS.map((c, i) => (
            <div
              key={c.label}
              onClick={() => onNavigate?.(c.code, c.flyTo.center, c.flyTo.zoom)}
              style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "9px 12px", borderRadius: 8,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
            >
              <div>
                <div style={{ fontSize: 14, fontFamily: "monospace", letterSpacing: "0.06em", color: "rgba(255,255,255,0.80)", fontWeight: 700 }}>{c.label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{c.sub}</div>
              </div>
            </div>
          ))}

          {/* See more */}
          <button
            onClick={() => setShowMore(v => !v)}
            style={{
              background: "none", border: "none",
              padding: "2px 4px", cursor: "pointer",
              fontFamily: "monospace", fontSize: 8, letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", gap: 5,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
          >
            <span>{showMore ? "▲ show less" : `▼ ${MORE_CONFLICTS.length} more conflicts`}</span>
          </button>
        </div>

        {/* LIVE ALERTS */}
        <SectionLabel label="live alerts" />
        <div style={{ padding: "0 14px", display: "flex", flexDirection: "column" }}>
          {LIVE_FEED.map((item, i) => {
            const color = dangerColor(item.danger);
            const isHovered = hoveredFeed === i;
            return (
              <div
                key={i}
                onMouseEnter={e => { cancelLeave(); setLockedFeed(null); setOpenedSources(null); setHoveredFeed(i); setHoverMidY(e.currentTarget.getBoundingClientRect().top + e.currentTarget.getBoundingClientRect().height / 2); }}
                onMouseLeave={scheduleLeave}
                onClick={() => onNavigate?.(item.code, item.flyTo.center, item.flyTo.zoom, item)}
                style={{
                  display: "flex", gap: 10, alignItems: "center",
                  padding: "7px 8px", cursor: "pointer", borderRadius: 8,
                  borderBottom: i < LIVE_FEED.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  background: isHovered ? "rgba(255,255,255,0.03)" : "transparent",
                  transition: "background 0.12s",
                }}
              >
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.22)", flexShrink: 0, width: 40, textAlign: "right" }}>{item.time}</span>
                <div className={item.danger >= 5 ? "dot-heat" : ""} style={{ width: 7, height: 7, borderRadius: "50%", background: item.danger >= 5 ? "#3b82f6" : color, boxShadow: item.danger >= 5 ? "0 0 7px #3b82f6cc" : `0 0 5px ${color}88`, flexShrink: 0 }} />
                <span style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.68)", flex: 1 }}>{item.text}</span>
              </div>
            );
          })}
        </div>

        {/* DISASTERS */}
        <SectionLabel label="disasters" />
        <div style={{ padding: "0 14px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
          {DISASTERS.map((d) => (
            <div
              key={d.label}
              onClick={() => onNavigate?.(null, d.flyTo.center, d.flyTo.zoom)}
              style={{
                padding: "9px 12px", borderRadius: 10,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 14, fontFamily: "monospace", letterSpacing: "0.09em", color: "rgba(255,255,255,0.92)", fontWeight: 700 }}>{d.label}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>{d.sub}</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.40)" }}>{d.affected} — {d.casualties}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Confidence bar + sources — sibling to escape backdropFilter stacking context */}
    {activeFeed !== null && (() => {
      const item = LIVE_FEED[activeFeed];
      const confColor = item.confidence >= 90 ? "#22c55e" : item.confidence >= 80 ? "#86efac" : item.confidence >= 70 ? "#fbbf24" : "#f87171";
      const sourcesOpen = openedSources === activeFeed;
      return (
        <div
          onMouseEnter={cancelLeave}
          onMouseLeave={scheduleLeave}
          style={{ position: "fixed", left: 446, top: hoverMidY - 20, paddingLeft: 14, paddingTop: 12, paddingBottom: 16, paddingRight: 20, zIndex: 21, pointerEvents: "auto" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 7, fontFamily: "monospace", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>CONFIDENCE</span>
            <div
              onMouseEnter={() => setOpenedSources(activeFeed)}
              onClick={e => { e.stopPropagation(); setOpenedSources(sourcesOpen ? null : activeFeed); }}
              style={{ width: 100, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.10)", cursor: "pointer", overflow: "hidden" }}
            >
              <div style={{ width: `${item.confidence}%`, height: "100%", borderRadius: 99, background: confColor, transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: 8, fontFamily: "monospace", fontWeight: 700, color: confColor, flexShrink: 0 }}>{item.confidence}%</span>
          </div>
          {sourcesOpen && (
            <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center", padding: "6px 10px", borderRadius: 8, background: "rgba(4,6,18,0.95)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(20px)" }}>
              <span style={{ fontSize: 7, fontFamily: "monospace", letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)", marginRight: 2 }}>SOURCES</span>
              {item.sources.map(s => (
                <button key={s} onClick={e => { e.stopPropagation(); setLockedFeed(activeFeed); onSourceClick?.(s); }}
                  style={{ fontSize: 8, fontFamily: "monospace", letterSpacing: "0.08em", padding: "2px 8px", borderRadius: 99, cursor: "pointer", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.65)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
                >{s}</button>
              ))}
            </div>
          )}
        </div>
      );
    })()}
    </>
  );
}

function SectionLabel({ label, pulse }: { label: string; pulse?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 14px 8px" }}>
      {pulse && <div className="dot-pulse" style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 6px #ef4444", flexShrink: 0 }} />}
      <span style={{ fontSize: 12, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.75)", fontWeight: 800 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}
