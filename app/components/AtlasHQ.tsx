"use client";

import React, { useState, useEffect, useRef } from "react";
import LiveAlertRow from "./LiveAlertRow";

// Maps danger level 1–4 to deep blue → deep purple (danger 5 uses animated heat pulse class)
function dangerColor(d: number): string {
  if (d >= 4) return "#6d28d9";
  if (d >= 3) return "#4338ca";
  if (d >= 2) return "#1d4ed8";
  return "#1e3a8a";
}

interface Conflict {
  label: string;
  sub: string;
  code: string; // country code to open in CountryPanel
  flyTo: { center: [number,number]; zoom: number };
  pulse?: boolean;
}

const TOP_CONFLICTS: Conflict[] = [
  {
    label: "Israel — Lebanon conflict",
    sub: "cross-border exchanges intensifying. IDF artillery active in southern Lebanon. Hezbollah rockets reported in Galilee.",
    code: "LBN",
    flyTo: { center: [35.2, 33.0] as [number,number], zoom: 7.2 },
  },
  {
    label: "US — Israel — Iran war",
    sub: "regional escalation ongoing. US 5th Fleet conducting operations in Persian Gulf. Iran nuclear program at center of diplomatic breakdown.",
    code: "ISR",
    flyTo: { center: [44.0, 30.0] as [number,number], zoom: 4.2 },
  },
];

const MORE_CONFLICTS: Conflict[] = [
  { label: "Russia — Ukraine war",        sub: "Russian forces continue grinding advances in Donetsk. Ukraine launches drone strikes deep into Russian territory. Front lines largely static with heavy casualties on both sides.",                                                                           code: "UKR", flyTo: { center: [34.0, 49.0] as [number,number], zoom: 4.5 } },
  { label: "Gaza genocide",               sub: "Israel's military campaign has killed 58,000+ Palestinians. Aid blockade continues. ICJ and ICC proceedings ongoing. No ceasefire in effect.",                                                                                                           code: "PSE", flyTo: { center: [34.4, 31.5] as [number,number], zoom: 7.0 } },
  { label: "Sudan civil war + genocide",  sub: "SAF and RSF forces fight for control of Khartoum and Darfur. 10M+ displaced — world's largest displacement crisis. Mass atrocities documented. 20,000+ killed.",                                                                                       code: "SDN", flyTo: { center: [32.5, 15.6] as [number,number], zoom: 5.5 } },
  { label: "Myanmar civil war",           sub: "Military junta losing territorial control to ethnic armed groups and the People's Defence Force. 2.6M+ displaced. Junta airstrikes on civilian areas continue.",                                                                                        code: "MMR", flyTo: { center: [96.1, 19.7] as [number,number], zoom: 5.0 } },
];

const DISASTERS = [
  { label: "Myanmar earthquake",  sub: "Mandalay Region",      affected: "14.5M affected", casualties: "3,800+ dead · 5,000+ injured", flyTo: { center: [96.0, 21.9] as [number,number], zoom: 5.5 } },
  { label: "LA wildfires",         sub: "California, USA",      affected: "180K displaced",  casualties: "29 dead · 12,000 structures",  flyTo: { center: [-118.4, 34.1] as [number,number], zoom: 7.5 } },
];

// ─── News cards ───────────────────────────────────────────────────────────────
// Edit items here to swap stories. image = cover photo URL. url = free article.
const NEWS_ITEMS = [
  {
    headline: "US 5th Fleet raises combat readiness as Iran conducts naval drills near Hormuz",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Natanz_nuclear_facility.jpg/640px-Natanz_nuclear_facility.jpg",
    url: "https://www.reuters.com/world/middle-east/",
    source: "Reuters",
  },
  {
    headline: "ICC prosecutor requests arrest warrants for commanders over northern Gaza strikes",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/International_Criminal_Court_building%2C_the_Hague_%28Netherlands%29.jpg/640px-International_Criminal_Court_building%2C_the_Hague_%28Netherlands%29.jpg",
    url: "https://apnews.com/hub/israel-hamas-war",
    source: "AP",
  },
];

interface FeedItem {
  time: string;
  danger: number;
  code: string;
  text: string;
  description: string;
  flyTo: { center: [number,number]; zoom: number };
  sources: string[];
  confidence: number;
  pulse?: boolean;
}

const LIVE_FEED: FeedItem[] = [
  { time: "NOW",    danger: 5, code: "LBN", text: "Israel-Lebanon border exchange — IDF artillery responds to Hezbollah rocket fire in Galilee",  flyTo: { center: [35.2, 33.1] as [number,number], zoom: 7   }, sources: ["AP", "Reuters", "ACLED"], confidence: 96,
    description: "IDF artillery units opened fire on southern Lebanese villages after Hezbollah launched a salvo of 40+ rockets targeting communities in the Galilee region. Evacuation orders are in effect for several northern Israeli towns. Lebanese civil defense reports casualties in the Bint Jbeil district." },
  { time: "12m",    danger: 5, code: "IRN", text: "US 5th Fleet announces heightened readiness posture in Persian Gulf",                           flyTo: { center: [50.5, 26.2] as [number,number], zoom: 5   }, sources: ["Reuters", "AP"],          confidence: 93,
    description: "The US Navy's 5th Fleet, headquartered in Bahrain, has raised its alert status following intelligence reports of Iranian naval mobilization near the Strait of Hormuz. Two additional destroyers are being repositioned." },
  { time: "28m",    danger: 4, code: "UKR", text: "Ukraine reports overnight drone barrage — Kyiv air defenses activated",                         flyTo: { center: [30.5, 50.4] as [number,number], zoom: 6   }, sources: ["NYT", "Reuters"],         confidence: 89,
    description: "Russia launched 78 Shahed-136 drones in an overnight wave targeting Kyiv, Odessa, and Kharkiv. Ukrainian air defense intercepted 61 drones. Three civilians were killed and 14 injured." },
  { time: "55m",    danger: 4, code: "PSE", text: "Northern Gaza hospitals running on emergency reserves — collapse imminent",                      flyTo: { center: [34.4, 31.6] as [number,number], zoom: 8   }, sources: ["AP", "Al Jazeera"],       confidence: 94,
    description: "Al-Ahli Arab Hospital and Kamal Adwan Hospital in northern Gaza have issued emergency declarations after fuel stocks dropped below 24-hour reserves. UNRWA reports 14 aid trucks held at the Kerem Shalom crossing for 11 days." },
  { time: "41m",    danger: 5, code: "SDN", text: "SAF drone strike kills 40+ at wedding celebration in North Darfur — RSF-held town targeted", flyTo: { center: [32.5, 15.6] as [number,number], zoom: 6   }, sources: ["UN", "Sudan Tribune"],   confidence: 82,
    description: "Sudan's armed forces killed at least forty and burned dozens more homes in a drone strike on a wedding celebration in an RSF-held town in North Darfur state. A recent survey describes widespread hunger, separation, and social disruption as families reckon with a lack of access to basic services amid the continued risk of violence." },
  { time: "1h 10m", danger: 2, code: "TWN", text: "PLA carrier group Shandong approaches Taiwan median line — GDELT naval index elevated",          flyTo: { center: [121.5, 24.5] as [number,number], zoom: 6.5}, sources: ["ACLED", "GDELT"],         confidence: 79,
    description: "The PLA Navy carrier strike group led by the Shandong has approached within 40 nautical miles of the Taiwan Strait median line. Taiwan's MND has scrambled F-16 and Mirage 2000 fighters. The GDELT conflict index for the Taiwan Strait has risen to its highest level since August 2022." },
];

// Typing animation for alert text (no blinking cursor — just smooth reveal)
function TypingAlert({ text }: { text: string; color?: string }) {
  const [displayed, setDisplayed] = useState("");
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = false;
    setDisplayed("");
    let i = 0;
    const total = text.length;
    const perChar = Math.max(6, Math.round(500 / total));
    const tick = () => {
      if (cancelRef.current) return;
      if (i <= total) {
        setDisplayed(text.slice(0, i));
        i++;
        setTimeout(tick, perChar);
      }
    };
    const t = setTimeout(tick, 60);
    return () => { cancelRef.current = true; clearTimeout(t); };
  }, [text]);

  return <span>{displayed}</span>;
}

interface Props {
  onClose: () => void;
  onNavigate?: (code: string | null, center: [number, number], zoom: number, feedItem?: FeedItem) => void;
  onHeadlinesToggle?: () => void;
  onSourceClick?: (source: string) => void;
}

// ─── Sequential load stages ──────────────────────────────────────────────────
// Edit STAGE_DELAYS to tune timing, or add new stages here.
// Items with minStage > current loadStage are invisible (opacity 0).
const STAGE_DELAYS = [
  0,   // stage 0 – video (instant)
  120, // stage 1 – geopolitics label
  240, // stage 2 – Israel-Lebanon card
  360, // stage 3 – US-Iran card
  500, // stage 4 – live alerts label + rows
  640, // stage 5 – news label + photo cards
  780, // stage 6 – disasters label + cards
];

function Reveal({ minStage, stage, children }: { minStage: number; stage: number; children: React.ReactNode }) {
  const visible = stage >= minStage;
  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(4px)", transition: "opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)", pointerEvents: visible ? "auto" : "none", willChange: "opacity, transform" }}>
      {children}
    </div>
  );
}

export default function AtlasHQ({ onClose, onNavigate, onHeadlinesToggle, onSourceClick }: Props) {
  const [showMore, setShowMore] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [showAllDisasters, setShowAllDisasters] = useState(false);
  const [loadStage, setLoadStage] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STAGE_DELAYS.forEach((delay, i) => {
      if (i === 0) return; // stage 0 is immediate
      timers.push(setTimeout(() => setLoadStage(i), delay));
    });
    return () => timers.forEach(clearTimeout);
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
      background: "rgba(4,6,18,0.62)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16,
      backdropFilter: "blur(40px)",
      boxShadow: "0 24px 80px rgba(0,0,0,0.38), 0 1px 3px rgba(0,0,0,0.18)",
      overflow: "hidden",
      pointerEvents: "auto",
    }}>

      {/* War photo — pinned at top */}
      <div style={{ height: 140, flexShrink: 0, position: "relative", background: "#000", cursor: "pointer" }}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/GazaCity-Drone_airstrike.jpg/640px-GazaCity-Drone_airstrike.jpg"
          alt="Conflict"
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <polygon points="17,12 17,32 34,22" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>

        {/* GEOPOLITICS — stage 1: label, stage 2: card 1, stage 3: card 2 */}
        <Reveal minStage={1} stage={loadStage}>
          <SectionLabel label="geopolitics" onClick={() => setShowMore(v => !v)} expanded={showMore} />
        </Reveal>
        <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          {TOP_CONFLICTS.map((c, idx) => (
            <Reveal key={c.label} minStage={2 + idx} stage={loadStage}>
              <div
                onClick={() => onNavigate?.(c.code, c.flyTo.center, c.flyTo.zoom)}
                style={{
                  padding: "12px 13px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  marginBottom: 2,
                  cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                  {c.pulse && (
                    <div className="dot-heat" style={{
                      width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                      background: "#1e3a8a", boxShadow: "0 0 7px #1e3a8acc",
                    }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontFamily: "monospace", letterSpacing: "0.07em", color: "rgba(255,255,255,0.92)", fontWeight: 700 }}>{c.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", marginTop: 5, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.sub}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}

          {showMore && (
            <>
              {MORE_CONFLICTS.map((c) => (
                <div
                  key={c.label}
                  onClick={() => onNavigate?.(c.code, c.flyTo.center, c.flyTo.zoom)}
                  style={{
                    padding: "12px 13px", borderRadius: 10,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                >
                  <div style={{ fontSize: 15, fontFamily: "monospace", letterSpacing: "0.07em", color: "rgba(255,255,255,0.92)", fontWeight: 700 }}>{c.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", marginTop: 5, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.sub}</div>
                </div>
              ))}
              <button
                onClick={() => setShowMore(false)}
                style={{
                  background: "none", border: "none", padding: "2px 4px", cursor: "pointer",
                  fontFamily: "monospace", fontSize: 8, letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", gap: 5,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
              >▲ show less</button>
            </>
          )}
        </div>

        {/* LIVE ALERTS — stage 4: label + top 2 rows, no expand */}
        <Reveal minStage={4} stage={loadStage}>
          <SectionLabel label="live alerts" />
          <div style={{ padding: "0 6px" }}>
            {LIVE_FEED.slice(0, 2).map((item, i) => (
              <LiveAlertRow
                key={`${item.code}-${item.time}`}
                item={item}
                onSourceClick={onSourceClick}
                onClick={() => onNavigate?.(item.code, item.flyTo.center, item.flyTo.zoom, item)}
                bottomBorder={i < 1}
                showConfidenceInline={false}
                expandOnHover={false}
              />
            ))}
          </div>
        </Reveal>

        {/* NEWS — stage 5: two square photo cards side by side */}
        <Reveal minStage={5} stage={loadStage}>
          <SectionLabel label="news" />
          <div style={{ padding: "0 14px 6px", display: "flex", gap: 8 }}>
            {NEWS_ITEMS.map((item) => (
              <a
                key={item.headline}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  height: 196,
                  borderRadius: 14,
                  overflow: "hidden",
                  position: "relative",
                  display: "block",
                  textDecoration: "none",
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.09)",
                  background: "#0a0c18",
                  minWidth: 0,
                }}
              >
                <img
                  src={item.image}
                  alt={item.headline}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.88) 100%)",
                }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px 10px" }}>
                  <div style={{
                    fontSize: 10, fontFamily: "monospace", letterSpacing: "0.03em",
                    color: "rgba(255,255,255,0.88)", lineHeight: 1.4,
                    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>{item.headline}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 4, letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.source}</div>
                </div>
              </a>
            ))}
          </div>
        </Reveal>

        {/* DISASTERS — stage 6: label + cards together */}
        <Reveal minStage={6} stage={loadStage}>
          <SectionLabel label="disasters" onClick={() => setShowAllDisasters(v => !v)} expanded={showAllDisasters} />
          <div style={{ padding: "0 14px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
            {(showAllDisasters ? DISASTERS : DISASTERS.slice(0, 2)).map((d) => (
              <div
                key={d.label}
                onClick={() => onNavigate?.(null, d.flyTo.center, d.flyTo.zoom)}
                style={{
                  padding: "9px 12px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  marginBottom: 2,
                  cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              >
                <div style={{ marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontFamily: "monospace", letterSpacing: "0.09em", color: "rgba(255,255,255,0.92)", fontWeight: 700 }}>{d.label}</span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.40)" }}>{d.affected} — {d.casualties}</div>
              </div>
            ))}
            {showAllDisasters && (
              <button
                onClick={() => setShowAllDisasters(false)}
                style={{
                  background: "none", border: "none", padding: "2px 4px", cursor: "pointer",
                  fontFamily: "monospace", fontSize: 8, letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
              >▲ show less</button>
            )}
          </div>
        </Reveal>
      </div>
    </div>

    </>

  );
}

function SectionLabel({ label, onClick }: { label: string; onClick?: () => void; expanded?: boolean; small?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "20px 18px 6px" }}>
      <span
        onClick={onClick}
        style={{
          fontSize: 11, fontFamily: "monospace", letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.28)", textTransform: "uppercase",
          fontWeight: 500, cursor: onClick ? "pointer" : "default", userSelect: "none",
        }}
        onMouseEnter={e => { if (onClick) e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
        onMouseLeave={e => { if (onClick) e.currentTarget.style.color = "rgba(255,255,255,0.28)"; }}
      >{label}</span>
    </div>
  );
}
