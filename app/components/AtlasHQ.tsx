"use client";

import React, { useState, useEffect, useRef } from "react";
import LiveAlertRow from "./LiveAlertRow";
import { setReelResume } from "../lib/reelResume";
import SenateVoteVisualization from "./SenateVoteVisualization";

// ── Reels preview ─────────────────────────────────────────────────────────────
// Autoplays the most recent "Atlas You" reel (muted, since browsers block
// autoplay with audio). When the user taps the card, we hand the current
// playback timestamp off to the full-screen player via reelResume, so the
// video continues from exactly the same frame with sound enabled.
type PreviewReel = { id: string; title: string; type: string; embedUrl?: string; signedUrl?: string };

function ReelsPreview({ onTap }: { onTap?: () => void }) {
  const [latest, setLatest] = useState<PreviewReel | null>(null);
  const videoRef            = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch("/api/videos?scope=reels", { cache: "no-store" })
      .then(r => r.json())
      .then((data: PreviewReel[]) => {
        if (data?.length) setLatest(data[0]);
      })
      .catch(() => {});
  }, []);

  // Kick autoplay for self-hosted video as soon as it mounts/updates.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || latest?.type !== "video") return;
    v.play().catch(() => { /* browsers that block even muted autoplay — ignore */ });
  }, [latest]);

  const handleTap = () => {
    // Stash current playback time so the full player can resume seamlessly.
    if (latest && videoRef.current) {
      setReelResume(latest.id, videoRef.current.currentTime);
    }
    onTap?.();
  };

  // ── Media layer: autoplaying video / muted YouTube iframe / tweet thumb ──
  const renderMedia = () => {
    if (!latest) {
      return <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(0,0,0,0.9) 100%)" }} />;
    }
    if (latest.type === "video" && latest.signedUrl) {
      return (
        <video
          ref={videoRef}
          src={latest.signedUrl}
          autoPlay muted loop playsInline
          // `muted` attribute is required for autoplay; the full player unmutes on open.
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      );
    }
    if (latest.type === "youtube" && latest.embedUrl) {
      const id = latest.embedUrl.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? "";
      // YouTube autoplay requires mute=1; playlist=<id> makes loop work.
      return (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${id}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          style={{ width: "100%", height: "100%", border: "none", display: "block", pointerEvents: "none" }}
        />
      );
    }
    // Tweet preview — no video, soft gradient backdrop
    return <div style={{ width: "100%", height: "100%", background: "radial-gradient(ellipse at top, #0e1524 0%, #000 80%)" }} />;
  };

  return (
    <div
      onClick={handleTap}
      style={{
        height: 140, flexShrink: 0, position: "relative",
        background: "#000", cursor: "pointer", overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {renderMedia()}
      {/* Soft bottom fade so any future metadata remains readable; no text shown. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 40%)", pointerEvents: "none" }} />
    </div>
  );
}

interface Conflict {
  label: string;
  sub: string;
  code: string; // country code to open in CountryPanel
  slug: string; // URL slug — e.g. "israel-us-iran-war"
  flyTo: { center: [number,number]; zoom: number };
  pulse?: boolean;
  image?: string;
}

const TOP_CONFLICTS: Conflict[] = [
  {
    label: "Israel and US in the Middle East",
    sub: "",
    code: "ISR",
    slug: "israel-and-us-in-the-middle-east",
    flyTo: { center: [42.0, 30.0] as [number,number], zoom: 4.2 },
    image: "/geopolitics-conflict.webp",
  },
];

const MORE_CONFLICTS: Conflict[] = [
  { label: "Russia — Ukraine war",        sub: "Russian forces continue grinding advances in Donetsk. Ukraine launches drone strikes deep into Russian territory. Front lines largely static with heavy casualties on both sides.",                                                                           code: "UKR", slug: "russia-ukraine-war", flyTo: { center: [32.0, 49.0] as [number,number], zoom: 4.5 } },
  { label: "Israel–Palestine Conflict",   sub: "Israel's military campaign has killed 58,000+ Palestinians. Aid blockade continues. ICJ and ICC proceedings ongoing. No ceasefire in effect.",                                                                                                           code: "PSE", slug: "israel-palestine-conflict", flyTo: { center: [34.1, 31.5] as [number,number], zoom: 7.0 } },
  { label: "Sudan civil war + genocide",  sub: "SAF and RSF forces fight for control of Khartoum and Darfur. 10M+ displaced — world's largest displacement crisis. Mass atrocities documented. 20,000+ killed.",                                                                                       code: "SDN", slug: "sudan-civil-war",    flyTo: { center: [31.5, 15.6] as [number,number], zoom: 5.5 } },
  { label: "Myanmar civil war",           sub: "Military junta losing territorial control to ethnic armed groups and the People's Defence Force. 2.6M+ displaced. Junta airstrikes on civilian areas continue.",                                                                                        code: "MMR", slug: "myanmar-civil-war",  flyTo: { center: [95.1, 19.7] as [number,number], zoom: 5.0 } },
];

const DISASTERS = [
  { label: "Kenya floods", slug: "kenya-floods", sub: "110+ dead · 34,765+ displaced · 30 counties affected", flyTo: { center: [36.9, 0.0] as [number,number], zoom: 5.5 }, image: "/kenya-floods-debris.webp" },
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
  { time: "1d",  danger: 3, code: "ISR", text: "Senate vote fails 40-59 to block arms sales to Israel — Sanders resolution draws 85% of Democrats", flyTo: { center: [-77.0, 38.9] as [number,number], zoom: 11 }, sources: ["Senate", "AP", "Reuters"], confidence: 97,
    description: "The US Senate defeated a resolution introduced by Sen. Bernie Sanders to halt new arms transfers to Israel, 40 in favor to 59 opposed. Despite the failure, the tally marked the highest level of Democratic support to date: 85% of Senate Democrats voted yes. The resolution targeted a pending $8.1B package covering tank rounds, mortar shells, and guidance kits." },
  { time: "12m", danger: 5, code: "IRN", text: "US 5th Fleet announces heightened readiness posture in Persian Gulf",                           flyTo: { center: [50.5, 26.2] as [number,number], zoom: 5   }, sources: ["Reuters", "AP"],          confidence: 93,
    description: "The US Navy's 5th Fleet, headquartered in Bahrain, has raised its alert status following intelligence reports of Iranian naval mobilization near the Strait of Hormuz. Two additional destroyers are being repositioned." },
  { time: "3h",  danger: 4, code: "ISR", text: "Israel strikes Hezbollah command infrastructure in southern Beirut for second consecutive night",  flyTo: { center: [35.5, 33.87] as [number,number], zoom: 10  }, sources: ["Reuters", "IDF"],          confidence: 89,
    description: "Israeli Air Force struck multiple Hezbollah command and weapons storage sites in the Dahieh suburb of Beirut for the second night running. The IDF cited intelligence indicating imminent rocket launches targeting northern Israel. Lebanese health officials report at least 11 casualties." },
];

const FINANCE_ITEMS = [
  {
    headline: "Oil surges past $87 as Strait of Hormuz tensions escalate following US-Iran clashes",
    image: "/finance-oil.jpeg",
    url: "https://www.bloomberg.com/energy",
    source: "Bloomberg",
  },
];

interface Props {
  onClose: () => void;
  onNavigate?: (code: string | null, center: [number, number], zoom: number, feedItem?: FeedItem, slug?: string) => void;
  onHeadlinesToggle?: () => void;
  onSourceClick?: (source: string) => void;
  onReelsTap?: () => void;
}

// ─── Sequential load stages ──────────────────────────────────────────────────
// Edit STAGE_DELAYS to tune timing, or add new stages here.
// Items with minStage > current loadStage are invisible (opacity 0).
// Stages spaced ~600ms apart — each settles meaningfully before the next begins, but flow stays continuous
const STAGE_DELAYS = [
  0,    // stage 0 – instant (video + all labels)
  360,  // stage 1 – conflict card 1
  620,  // stage 2 – conflict card 2
  980,  // stage 3 – live alert rows
  1290, // stage 4 – news cards
  1600, // stage 5 – disaster cards
];

function Reveal({ minStage, stage, children }: { minStage: number; stage: number; children: React.ReactNode }) {
  const visible = stage >= minStage;
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      filter: visible ? "blur(0)" : "blur(5px)",
      transform: visible ? "translateY(0)" : "translateY(5px)",
      transition: "opacity 0.75s cubic-bezier(0.22,1,0.36,1), filter 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1)",
      pointerEvents: visible ? "auto" : "none",
      willChange: "opacity, filter, transform",
    }}>
      {children}
    </div>
  );
}

export default function AtlasHQ({ onClose, onNavigate, onHeadlinesToggle, onSourceClick, onReelsTap }: Props) {
  const [showMore, setShowMore] = useState(false);
  const [showAllDisasters, setShowAllDisasters] = useState(false);
  const [loadStage, setLoadStage] = useState(0);
  const [senateVoteVisible, setSenateVoteVisible] = useState<'hover' | 'locked' | null>(null);
  const senateAlertRef = useRef<HTMLDivElement>(null);

  // Senate arms sale vote data: 40-59 (40 Aye, 59 No)
  const senatorsVoteData = [
    // Democrats who voted Aye (34 of 40 total Ayes)
    { name: "Bernie Sanders", party: "I" as const, state: "VT", vote: "Aye" as const },
    { name: "Elizabeth Warren", party: "D" as const, state: "MA", vote: "Aye" as const },
    { name: "Jeff Merkley", party: "D" as const, state: "OR", vote: "Aye" as const },
    { name: "Chris Van Hollen", party: "D" as const, state: "MD", vote: "Aye" as const },
    { name: "Peter Welch", party: "D" as const, state: "VT", vote: "Aye" as const },
    { name: "Ed Markey", party: "D" as const, state: "MA", vote: "Aye" as const },
    { name: "Dick Durbin", party: "D" as const, state: "IL", vote: "Aye" as const },
    { name: "Mazie Hirono", party: "D" as const, state: "HI", vote: "Aye" as const },
    { name: "Tammy Baldwin", party: "D" as const, state: "WI", vote: "Aye" as const },
    { name: "Cory Booker", party: "D" as const, state: "NJ", vote: "Aye" as const },
    { name: "Sherrod Brown", party: "D" as const, state: "OH", vote: "Aye" as const },
    { name: "Ben Ray Luján", party: "D" as const, state: "NM", vote: "Aye" as const },
    { name: "Alex Padilla", party: "D" as const, state: "CA", vote: "Aye" as const },
    { name: "Tina Smith", party: "D" as const, state: "MN", vote: "Aye" as const },
    { name: "Brian Schatz", party: "D" as const, state: "HI", vote: "Aye" as const },
    { name: "Ron Wyden", party: "D" as const, state: "OR", vote: "Aye" as const },
    { name: "Raphael Warnock", party: "D" as const, state: "GA", vote: "Aye" as const },
    { name: "Jon Ossoff", party: "D" as const, state: "GA", vote: "Aye" as const },
    { name: "Amy Klobuchar", party: "D" as const, state: "MN", vote: "Aye" as const },
    { name: "Kirsten Gillibrand", party: "D" as const, state: "NY", vote: "Aye" as const },
    { name: "Martin Heinrich", party: "D" as const, state: "NM", vote: "Aye" as const },
    { name: "Debbie Stabenow", party: "D" as const, state: "MI", vote: "Aye" as const },
    { name: "Gary Peters", party: "D" as const, state: "MI", vote: "Aye" as const },
    { name: "Tammy Duckworth", party: "D" as const, state: "IL", vote: "Aye" as const },
    { name: "Patty Murray", party: "D" as const, state: "WA", vote: "Aye" as const },
    { name: "Maria Cantwell", party: "D" as const, state: "WA", vote: "Aye" as const },
    { name: "Mark Warner", party: "D" as const, state: "VA", vote: "Aye" as const },
    { name: "Tim Kaine", party: "D" as const, state: "VA", vote: "Aye" as const },
    { name: "Bob Casey", party: "D" as const, state: "PA", vote: "Aye" as const },
    { name: "John Fetterman", party: "D" as const, state: "PA", vote: "No" as const }, // Fetterman voted No
    { name: "Jacky Rosen", party: "D" as const, state: "NV", vote: "Aye" as const },
    { name: "Catherine Cortez Masto", party: "D" as const, state: "NV", vote: "Aye" as const },
    { name: "Mark Kelly", party: "D" as const, state: "AZ", vote: "Aye" as const },
    { name: "Ruben Gallego", party: "D" as const, state: "AZ", vote: "Aye" as const },
    { name: "Adam Schiff", party: "D" as const, state: "CA", vote: "Aye" as const },
    { name: "Laphonza Butler", party: "D" as const, state: "CA", vote: "Aye" as const },
    // Republicans who voted No (all 49)
    ...Array.from({ length: 49 }, (_, i) => ({
      name: `Republican Senator ${i + 1}`,
      party: "R" as const,
      state: ["TX", "FL", "OH", "NC", "GA", "TN", "IN", "MO", "AL", "LA"][i % 10],
      vote: "No" as const,
    })),
    // Democrats who voted No (10)
    ...Array.from({ length: 10 }, (_, i) => ({
      name: `Democrat Senator ${i + 1}`,
      party: "D" as const,
      state: ["DE", "CT", "MD", "NJ", "NY"][i % 5],
      vote: "No" as const,
    })),
  ];

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
      width: 488,
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

      {/* Scrollable body */}
      <div className="radar-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>

        {/* GEOPOLITICS — label instant, cards staggered */}
        <SectionLabel label="geopolitics" onClick={() => setShowMore(v => !v)} />
        <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          {TOP_CONFLICTS.map((c, idx) => (
            <Reveal key={c.label} minStage={1 + idx} stage={loadStage}>
              <div
                onClick={() => onNavigate?.(c.code, c.flyTo.center, c.flyTo.zoom, undefined, c.slug)}
                style={{
                  height: 196, borderRadius: 14, overflow: "hidden",
                  position: "relative", cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.09)",
                  background: "#0a0c18",
                }}
              >
                {c.image && <img src={c.image} alt={c.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.88) 100%)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px 10px" }}>
                  <div style={{ fontSize: 12, fontFamily: "monospace", letterSpacing: "0.06em", color: "rgba(255,255,255,0.92)", fontWeight: 700, lineHeight: 1.3 }}>{c.label}</div>
                </div>
              </div>
            </Reveal>
          ))}

          {showMore && (
            <>
              {MORE_CONFLICTS.map((c) => (
                <div
                  key={c.label}
                  onClick={() => onNavigate?.(c.code, c.flyTo.center, c.flyTo.zoom, undefined, c.slug)}
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

        {/* LIVE ALERTS — label instant, rows fade in */}
        <SectionLabel label="live alerts" />
        <Reveal minStage={3} stage={loadStage}>
          <div style={{ padding: "0 6px", position: "relative" }}>
            {LIVE_FEED.slice(0, 3).map((item, i) => {
              const isSenateVote = item.text.includes("Senate vote fails");
              return (
                <div
                  key={`${item.code}-${item.time}`}
                  ref={isSenateVote ? senateAlertRef : null}
                  onMouseEnter={() => {
                    if (isSenateVote && senateVoteVisible !== 'locked') {
                      setSenateVoteVisible('hover');
                    }
                  }}
                  onMouseLeave={() => {
                    if (isSenateVote && senateVoteVisible === 'hover') {
                      setSenateVoteVisible(null);
                    }
                  }}
                  onClick={() => {
                    if (isSenateVote) {
                      if (senateVoteVisible === 'locked') {
                        setSenateVoteVisible(null);
                      } else {
                        setSenateVoteVisible('locked');
                      }
                    } else {
                      onNavigate?.(item.code, item.flyTo.center, item.flyTo.zoom, item);
                    }
                  }}
                >
                  <LiveAlertRow
                    item={item}
                    onSourceClick={onSourceClick}
                    onClick={() => !isSenateVote && onNavigate?.(item.code, item.flyTo.center, item.flyTo.zoom, item)}
                    bottomBorder={i < 2}
                    showConfidenceInline={false}
                    expandOnHover={false}
                  />
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* FINANCE */}
        <SectionLabel label="finance" />
        <Reveal minStage={5} stage={loadStage}>
          <div style={{ padding: "0 14px 6px", display: "flex", gap: 8 }}>
            {FINANCE_ITEMS.map((item) => (
              <a
                key={item.headline}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1, height: 196, borderRadius: 14, overflow: "hidden",
                  position: "relative", display: "block", textDecoration: "none",
                  cursor: "pointer", border: "1px solid rgba(255,255,255,0.09)",
                  background: "#0a0c18", minWidth: 0,
                }}
              >
                <img
                  src={item.image}
                  alt={item.headline}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.88) 100%)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px 10px" }}>
                  <div style={{ fontSize: 12, fontFamily: "monospace", letterSpacing: "0.03em", color: "rgba(255,255,255,0.88)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.headline}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 4, letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.source}</div>
                </div>
              </a>
            ))}
          </div>
        </Reveal>

        {/* DISASTERS */}
        <SectionLabel label="disasters" />
        <Reveal minStage={5} stage={loadStage}>
          <div style={{ padding: "0 14px 20px" }}>
            {DISASTERS.map((d) => (
              <div
                key={d.label}
                onClick={() => onNavigate?.(null, d.flyTo.center, d.flyTo.zoom, undefined, d.slug)}
                style={{
                  height: 196, borderRadius: 14, overflow: "hidden",
                  position: "relative", cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.09)",
                  background: "#0a0c18",
                }}
              >
                {d.image && <img src={d.image} alt={d.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.88) 100%)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px 10px" }}>
                  <div style={{ fontSize: 12, fontFamily: "monospace", letterSpacing: "0.06em", color: "rgba(255,255,255,0.92)", fontWeight: 700 }}>{d.label}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.50)", marginTop: 4 }}>{d.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>

    </>

  );
}

function SectionLabel({ label, onClick }: { label: string; onClick?: () => void }) {
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
