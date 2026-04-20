"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import LiveAlertRow from "./LiveAlertRow";
import { setReelResume } from "../lib/reelResume";

import RadarEditor, {
  type RadarConfig,
  type LiveAlertItem as RadarAlertItem,
  type ConflictItem as RadarConflictItem,
  type ViolenceItem as RadarViolenceItem,
  type FinanceItem as RadarFinanceItem,
  type DisasterItem as RadarDisasterItem,
} from "./RadarEditor";
import { EditModeCtx, EText, EImg, useEditMode } from "./InlineEdit";

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
    label: "Israel / US in the Middle East",
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
  slug?: string;
  incidentId?: string;
}

const LIVE_FEED: FeedItem[] = [
  { time: "2026-04-19T12:14:00", danger: 5, code: "USA", slug: "gun-violence", incidentId: "shreveport-2026-04-19", pulse: true,
    text: "8 children killed in Shreveport mass shooting — gunman kills children ages 1 to 14 across two homes before fleeing",
    flyTo: { center: [-93.7502, 32.5252] as [number,number], zoom: 10 }, sources: ["AP", "Reuters", "CNN"], confidence: 98,
    description: "Eight children and juveniles ages 1–14 were killed in a mass shooting in Shreveport, Louisiana. The shooter, who appears to have been known to the victims, targeted two homes on the same block before fleeing. He subsequently carjacked a vehicle and was killed by police during pursuit. Mayor Tom Arceneaux called it 'maybe the worst tragic situation we've ever had in Shreveport.'" },
{ time: "2026-04-17T15:30:00", danger: 3, code: "ISR",
    text: "Senate vote fails 40-59 to block arms sales to Israel — Sanders resolution draws 85% of Democrats",
    flyTo: { center: [-77.0, 38.9] as [number,number], zoom: 11 }, sources: ["Senate", "AP", "Reuters"], confidence: 97,
    description: "The US Senate defeated a resolution introduced by Sen. Bernie Sanders to halt new arms transfers to Israel, 40 in favor to 59 opposed. Despite the failure, the tally marked the highest level of Democratic support to date: 85% of Senate Democrats voted yes. The resolution targeted a pending $8.1B package covering tank rounds, mortar shells, and guidance kits." },
];

// Violence section — card linking to GunViolencePanel
const VIOLENCE_ITEMS = [
  {
    slug: "violence",
    headline: "5 shot near University of Iowa campus",
    image: "",
    flyTo: { center: [-98.5, 39.5] as [number,number], zoom: 4 },
    incidentId: "iowa-city-2026-04-19",
  },
];

const FINANCE_ITEMS = [
  {
    slug: "oil-hormuz",
    headline: "Oil surges past $87 as Strait of Hormuz tensions escalate following US-Iran clashes",
    image: "/finance-card.avif",
    source: "Bloomberg",
  },
];

interface Props {
  onClose: () => void;
  onNavigate?: (code: string | null, center: [number, number], zoom: number, feedItem?: FeedItem, slug?: string) => void;
  onHeadlinesToggle?: () => void;
  onSourceClick?: (source: string) => void;
  onReelsTap?: () => void;
  onSenateVoteLocked?: (locked: boolean) => void;
  onFinanceTap?: (slug: string) => void;
  onViolenceTap?: (incidentId: string, center: [number, number], zoom: number) => void;
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

export default function AtlasHQ({ onClose, onNavigate, onHeadlinesToggle, onSourceClick, onReelsTap, onFinanceTap, onViolenceTap, onSenateVoteLocked }: Props) {
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);
  const [showAllDisasters, setShowAllDisasters] = useState(false);
  const [loadStage, setLoadStage] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [liveConfig, setLiveConfig] = useState<RadarConfig | null>(null);
  const [editMode,    setEditMode]    = useState(false);
  const [editDraft,   setEditDraft]   = useState<RadarConfig | null>(null);
  const [dragSection, setDragSection] = useState<number | null>(null);
  const [overSection, setOverSection] = useState<number | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STAGE_DELAYS.forEach((delay, i) => {
      if (i === 0) return; // stage 0 is immediate
      timers.push(setTimeout(() => setLoadStage(i), delay));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    fetch("/api/radar-config", { cache: "no-store" })
      .then(r => r.json())
      .then((data: RadarConfig) => setLiveConfig(data))
      .catch(() => {});
  }, []);

  // Only use R2 alerts if they carry a proper ISO timestamp (YYYY-MM-DD…)
  // "Apr 19" passes Date.parse in Chrome, so we check the format explicitly.
  const hasIsoTimes = (alerts: RadarAlertItem[]) =>
    alerts.length > 0 && /^\d{4}-\d{2}-\d{2}/.test(alerts[0].time);
  // Strip &nbsp; entities that browsers write into contentEditable on save
  const cleanStr = (s: string) => s.replace(/&nbsp;/g, " ").trimEnd();
  const activeFeed      = (liveConfig?.liveAlerts?.length && hasIsoTimes(liveConfig.liveAlerts)
    ? liveConfig.liveAlerts.map(a => ({ ...a, text: cleanStr(a.text), description: cleanStr(a.description) }))
    : LIVE_FEED) as FeedItem[];
  const activeViolence  = (liveConfig?.violenceItems?.length  ? liveConfig.violenceItems  : VIOLENCE_ITEMS) as RadarViolenceItem[];
  const activeFinance   = (liveConfig?.financeItems?.length   ? liveConfig.financeItems   : FINANCE_ITEMS) as RadarFinanceItem[];
  const activeDisasters = (liveConfig?.disasters?.length      ? liveConfig.disasters      : DISASTERS) as RadarDisasterItem[];

  const currentConfig: RadarConfig = {
    liveAlerts:   activeFeed as RadarAlertItem[],
    topConflicts: (liveConfig?.topConflicts?.length ? liveConfig.topConflicts : TOP_CONFLICTS) as RadarConflictItem[],
    moreConflicts: (liveConfig?.moreConflicts?.length ? liveConfig.moreConflicts : MORE_CONFLICTS) as RadarConflictItem[],
    violenceItems: activeViolence as RadarViolenceItem[],
    financeItems:  activeFinance as RadarFinanceItem[],
    disasters:     activeDisasters as RadarDisasterItem[],
    sectionOrder:   liveConfig?.sectionOrder,
    sectionLabels:  liveConfig?.sectionLabels,
  };

  const displayConfig = editMode && editDraft ? editDraft : currentConfig;

  const patchDraft = (updater: (d: RadarConfig) => RadarConfig) => {
    setEditDraft(prev => {
      const base = prev ?? currentConfig;
      const next = updater(base);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        await fetch("/api/radar-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config: next }),
        });
        setLiveConfig(next);
      }, 1500);
      return next;
    });
  };

  return (
    <>
    {/* Edit button — floats outside panel to the right */}
    <button
      onClick={() => {
        if (editMode) { setEditMode(false); }
        else { setEditDraft({ ...currentConfig }); setEditMode(true); }
      }}
      style={{
        position: "absolute", top: 56, left: 516, zIndex: 25,
        background: editMode ? "rgba(100,160,255,0.14)" : "rgba(255,255,255,0.07)",
        border: editMode ? "1px solid rgba(100,160,255,0.40)" : "1px solid rgba(255,255,255,0.14)",
        borderRadius: 6,
        color: editMode ? "rgba(140,185,255,0.95)" : "rgba(255,255,255,0.55)",
        fontFamily: "monospace", fontSize: 11, letterSpacing: "0.10em",
        padding: "3px 9px", cursor: "pointer", pointerEvents: "auto",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = editMode ? "rgba(100,160,255,0.22)" : "rgba(255,255,255,0.12)")}
      onMouseLeave={e => (e.currentTarget.style.background = editMode ? "rgba(100,160,255,0.14)" : "rgba(255,255,255,0.07)")}
    >{editMode ? "✓ done" : "✎"}</button>
    <div style={{
      position: "absolute",
      top: 56, left: 20, bottom: 20,
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
      <div className="radar-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative" }}>

        <EditModeCtx.Provider value={editMode}>
        {/* Sections rendered in saved drag order */}
        {(displayConfig.sectionOrder ?? ["geo", "alerts", "violence", "finance", "disasters"]).map((section, i) => {
          const DEFAULT_ORDER = ["geo", "alerts", "violence", "finance", "disasters"];
          const sectionDragHandle = editMode ? {
            onDragStart: (e: React.DragEvent<HTMLDivElement>) => {
              setDragSection(i);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", String(i));
            },
            onDragEnd: () => { setDragSection(null); setOverSection(null); },
          } : undefined;
          const isDropTarget = editMode && overSection === i && dragSection !== null && dragSection !== i;
          const dropHandlers = editMode ? {
            onDragOver: (e: React.DragEvent) => { e.preventDefault(); setOverSection(i); },
            onDrop: (e: React.DragEvent) => {
              e.preventDefault();
              if (dragSection !== null && dragSection !== i) {
                const base = displayConfig.sectionOrder ?? DEFAULT_ORDER;
                const next = [...base];
                const [moved] = next.splice(dragSection, 1);
                next.splice(i, 0, moved);
                patchDraft(d => ({ ...d, sectionOrder: next }));
              }
              setDragSection(null); setOverSection(null);
            },
          } : {};
          const wrapStyle: React.CSSProperties = editMode ? {
            outline: isDropTarget ? "2px solid rgba(100,160,255,0.45)" : "2px solid transparent",
            borderRadius: 12, opacity: dragSection === i ? 0.35 : 1, transition: "opacity 0.15s",
          } : {};

          if (section === "geo") return (
            <div key="geo" {...dropHandlers} style={wrapStyle}>
              <SectionLabel label={displayConfig.sectionLabels?.geo ?? "geopolitics"} onClick={editMode ? undefined : () => setShowMore(v => !v)} dragHandle={sectionDragHandle} onLabelChange={v => patchDraft(d => ({ ...d, sectionLabels: { ...d.sectionLabels, geo: v } }))} />
              <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                {displayConfig.topConflicts.map((c, idx) => (
                  <Reveal key={c.label} minStage={1 + idx} stage={loadStage}>
                    <div
                      onClick={editMode ? undefined : () => onNavigate?.(c.code, c.flyTo?.center ?? [0,0], c.flyTo?.zoom ?? 4, undefined, c.slug)}
                      style={{ height: 196, borderRadius: 14, overflow: "hidden", position: "relative", cursor: editMode ? "default" : "pointer", border: "1px solid rgba(255,255,255,0.09)", background: "#0a0c18" }}
                    >
                      {(c.imageUrl || c.image) && (
                        <EImg
                          src={c.imageUrl || c.image || ""}
                          alt={c.label}
                          style={{ width: "100%", height: "100%" }}
                          onUploaded={(key, url) => patchDraft(d => ({ ...d, topConflicts: d.topConflicts.map((x, j) => j === idx ? { ...x, imageKey: key, imageUrl: url } : x) }))}
                        />
                      )}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.88) 100%)", pointerEvents: "none" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px 10px" }}>
                        <EText
                          value={c.label}
                          onChange={v => patchDraft(d => ({ ...d, topConflicts: d.topConflicts.map((x, j) => j === idx ? { ...x, label: v } : x) }))}
                          style={{ fontSize: 12, fontFamily: "monospace", letterSpacing: "0.06em", color: "rgba(255,255,255,0.92)", fontWeight: 700, lineHeight: 1.3 }}
                        />
                      </div>
                    </div>
                  </Reveal>
                ))}
                {showMore && !editMode && (
                  <>
                    {displayConfig.moreConflicts.map((c) => (
                      <div key={c.label}
                        onClick={() => onNavigate?.(c.code, c.flyTo?.center ?? [0,0], c.flyTo?.zoom ?? 4, undefined, c.slug)}
                        style={{ padding: "12px 13px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.09)", cursor: "pointer" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}>
                        <div style={{ fontSize: 14, fontFamily: "monospace", letterSpacing: "0.07em", color: "rgba(255,255,255,0.92)", fontWeight: 700 }}>{c.label}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.52)", marginTop: 5, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.sub}</div>
                      </div>
                    ))}
                    <button onClick={() => setShowMore(false)}
                      style={{ background: "none", border: "none", padding: "2px 4px", cursor: "pointer", fontFamily: "monospace", fontSize: 9, letterSpacing: "0.12em", color: "rgba(255,255,255,0.38)", display: "flex", alignItems: "center", gap: 5 }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}>▲ show less</button>
                  </>
                )}
              </div>
            </div>
          );

          if (section === "alerts") return (
            <div key="alerts" {...dropHandlers} style={wrapStyle}>
              <SectionLabel label={displayConfig.sectionLabels?.alerts ?? "live alerts"} dragHandle={sectionDragHandle} onLabelChange={v => patchDraft(d => ({ ...d, sectionLabels: { ...d.sectionLabels, alerts: v } }))} />
              <Reveal minStage={3} stage={loadStage}>
                <div style={{ padding: "0 6px", position: "relative" }}>
                  {(displayConfig.liveAlerts as FeedItem[]).slice(0, 3).map((item, i, arr) => {
                    const isSenateVote = item.text.includes("Senate vote fails");
                    return (
                      <div key={`${item.code}-${item.time}`}
                        onClick={() => {
                          if (editMode) return;
                          if (item.slug === "gun-violence" && item.incidentId) {
                            onViolenceTap?.(item.incidentId, item.flyTo?.center ?? [0,0] as [number,number], item.flyTo?.zoom ?? 10);
                          } else if (isSenateVote) {
                            router.push('/senatebill/israel-arms-2026');
                          } else {
                            onNavigate?.(item.code, item.flyTo?.center ?? [0,0] as [number,number], item.flyTo?.zoom ?? 4, item, item.slug);
                          }
                        }}
                      >
                        {editMode ? (
                          <div
                            style={{ padding: "10px 12px 14px", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", cursor: "text" }}
                            onClick={e => {
                              e.stopPropagation();
                              const ce = (e.currentTarget as HTMLElement).querySelector('[contenteditable]') as HTMLElement | null;
                              ce?.focus();
                            }}
                          >
                            <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.14em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 6 }}>click to edit</div>
                            <EText
                              value={item.text}
                              onChange={v => patchDraft(d => ({ ...d, liveAlerts: (d.liveAlerts as RadarAlertItem[]).map((x, j) => j === i ? { ...x, text: v } : x) }))}
                              as="div"
                              style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.88)", marginBottom: 10 }}
                            />
                            <EText
                              value={item.description}
                              onChange={v => patchDraft(d => ({ ...d, liveAlerts: (d.liveAlerts as RadarAlertItem[]).map((x, j) => j === i ? { ...x, description: v } : x) }))}
                              as="div"
                              style={{ fontSize: 13, color: "rgba(255,255,255,0.52)", lineHeight: 1.55 }}
                            />
                          </div>
                        ) : (
                          <LiveAlertRow item={item} onSourceClick={onSourceClick}
                            isActive={false}
                            bottomBorder={i < arr.length - 1} showConfidenceInline={false} expandOnHover={true} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            </div>
          );

          if (section === "violence") return (
            <div key="violence" {...dropHandlers} style={wrapStyle}>
              <SectionLabel label={displayConfig.sectionLabels?.violence ?? "violence"} dragHandle={sectionDragHandle} onLabelChange={v => patchDraft(d => ({ ...d, sectionLabels: { ...d.sectionLabels, violence: v } }))} />
              <Reveal minStage={5} stage={loadStage}>
                <div style={{ padding: "0 14px 6px" }}>
                  {displayConfig.violenceItems.map((item, idx) => (
                    <div key={item.headline}
                      onClick={editMode ? undefined : () => onViolenceTap?.(item.incidentId ?? "", item.flyTo?.center ?? [0,0] as [number,number], item.flyTo?.zoom ?? 4)}
                      style={{ height: 196, borderRadius: 14, overflow: "hidden", position: "relative", cursor: editMode ? "default" : "pointer", border: "1px solid rgba(255,255,255,0.09)", background: "#0a0c18" }}>
                      <EImg
                          src={item.imageUrl || item.image || ""}
                          alt={item.headline}
                          style={{ width: "100%", height: "100%" }}
                          onUploaded={(key, url) => patchDraft(d => ({ ...d, violenceItems: d.violenceItems.map((x, j) => j === idx ? { ...x, imageKey: key, imageUrl: url } : x) }))}
                        />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.90) 100%)", pointerEvents: "none" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px 10px" }}>
                        <EText
                          value={item.headline}
                          onChange={v => patchDraft(d => ({ ...d, violenceItems: d.violenceItems.map((x, j) => j === idx ? { ...x, headline: v } : x) }))}
                          style={{ fontSize: 12, fontFamily: "monospace", letterSpacing: "0.03em", color: "rgba(255,255,255,0.88)", lineHeight: 1.4 }}
                        />
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.48)", marginTop: 4, letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.source}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          );

          if (section === "finance") return (
            <div key="finance" {...dropHandlers} style={wrapStyle}>
              <SectionLabel label={displayConfig.sectionLabels?.finance ?? "finance"} dragHandle={sectionDragHandle} onLabelChange={v => patchDraft(d => ({ ...d, sectionLabels: { ...d.sectionLabels, finance: v } }))} />
              <Reveal minStage={5} stage={loadStage}>
                <div style={{ padding: "0 14px 6px", display: "flex", gap: 8 }}>
                  {displayConfig.financeItems.map((item, idx) => (
                    <div key={item.headline}
                      onClick={editMode ? undefined : () => onFinanceTap?.(item.slug)}
                      style={{ flex: 1, height: 196, borderRadius: 14, overflow: "hidden", position: "relative", cursor: editMode ? "default" : "pointer", border: "1px solid rgba(255,255,255,0.09)", background: "#0a0c18", minWidth: 0 }}>
                      {(item.imageUrl || item.image) && (
                        <EImg
                          src={item.imageUrl || item.image || ""}
                          alt={item.headline}
                          style={{ width: "100%", height: "100%" }}
                          onUploaded={(key, url) => patchDraft(d => ({ ...d, financeItems: d.financeItems.map((x, j) => j === idx ? { ...x, imageKey: key, imageUrl: url } : x) }))}
                        />
                      )}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.88) 100%)", pointerEvents: "none" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px 14px" }}>
                        <EText
                          value={item.headline}
                          onChange={v => patchDraft(d => ({ ...d, financeItems: d.financeItems.map((x, j) => j === idx ? { ...x, headline: v } : x) }))}
                          style={{ fontSize: 12, fontFamily: "monospace", letterSpacing: "0.03em", color: "rgba(255,255,255,0.88)", lineHeight: 1.4 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          );

          if (section === "disasters") return (
            <div key="disasters" {...dropHandlers} style={wrapStyle}>
              <SectionLabel label={displayConfig.sectionLabels?.disasters ?? "disasters"} dragHandle={sectionDragHandle} onLabelChange={v => patchDraft(d => ({ ...d, sectionLabels: { ...d.sectionLabels, disasters: v } }))} />
              <Reveal minStage={5} stage={loadStage}>
                <div style={{ padding: "0 14px 20px" }}>
                  {displayConfig.disasters.map((dis, idx) => (
                    <div key={dis.label}
                      onClick={editMode ? undefined : () => onNavigate?.(null, dis.flyTo?.center ?? [0,0], dis.flyTo?.zoom ?? 4, undefined, dis.slug)}
                      style={{ height: 196, borderRadius: 14, overflow: "hidden", position: "relative", cursor: editMode ? "default" : "pointer", border: "1px solid rgba(255,255,255,0.09)", background: "#0a0c18" }}>
                      {(dis.imageUrl || dis.image) && (
                        <EImg
                          src={dis.imageUrl || dis.image || ""}
                          alt={dis.label}
                          style={{ width: "100%", height: "100%" }}
                          onUploaded={(key, url) => patchDraft(d => ({ ...d, disasters: d.disasters.map((x, j) => j === idx ? { ...x, imageKey: key, imageUrl: url } : x) }))}
                        />
                      )}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.88) 100%)", pointerEvents: "none" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px 10px" }}>
                        <EText
                          value={dis.label}
                          onChange={v => patchDraft(d => ({ ...d, disasters: d.disasters.map((x, j) => j === idx ? { ...x, label: v } : x) }))}
                          style={{ fontSize: 14, fontFamily: "monospace", letterSpacing: "0.06em", color: "rgba(255,255,255,0.92)", fontWeight: 700 }}
                        />
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.62)", marginTop: 4 }}>{dis.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          );

          return null;
        })}

        {/* + Add section — only visible in edit mode */}
        {editMode && (
          <div style={{ padding: "4px 18px 28px", display: "flex", justifyContent: "center" }}>
            <button
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px dashed rgba(255,255,255,0.16)",
                borderRadius: 10, color: "rgba(255,255,255,0.42)",
                fontFamily: "monospace", fontSize: 12, letterSpacing: "0.10em",
                padding: "10px 0", cursor: "pointer", width: "100%",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.72)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.42)"; }}
            >+ add section</button>
          </div>
        )}

        </EditModeCtx.Provider>
      </div>
    </div>

    {editorOpen && (
      <RadarEditor
        config={currentConfig}
        onSave={async (c) => {
          setLiveConfig(c);
          setEditorOpen(false);
          await fetch("/api/radar-config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ config: c }),
          });
        }}
        onClose={() => setEditorOpen(false)}
      />
    )}

    </>

  );
}

function SectionLabel({ label, onClick, dragHandle, onLabelChange }: {
  label: string;
  onClick?: () => void;
  onLabelChange?: (v: string) => void;
  dragHandle?: {
    onDragStart: React.DragEventHandler<HTMLDivElement>;
    onDragEnd: React.DragEventHandler<HTMLDivElement>;
  };
}) {
  const editMode = useEditMode();
  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontFamily: "monospace", letterSpacing: "0.18em",
    color: "rgba(255,255,255,0.42)", textTransform: "uppercase",
    fontWeight: 500, userSelect: "none",
  };
  return (
    <div
      draggable={!!dragHandle}
      onDragStart={dragHandle?.onDragStart}
      onDragEnd={dragHandle?.onDragEnd}
      style={{
        display: "flex", alignItems: "center", gap: 6, padding: "10px 18px 6px",
        cursor: dragHandle ? "grab" : "default", userSelect: "none",
      }}
    >
      {dragHandle && (
        <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 13, lineHeight: 1, flexShrink: 0 }}>⠿</span>
      )}
      {editMode && onLabelChange ? (
        <EText value={label} onChange={onLabelChange} as="span" style={labelStyle} />
      ) : (
        <span
          onClick={onClick}
          style={{ ...labelStyle, cursor: onClick ? "pointer" : "default" }}
          onMouseEnter={e => { if (onClick) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          onMouseLeave={e => { if (onClick) e.currentTarget.style.color = "rgba(255,255,255,0.42)"; }}
        >{label}</span>
      )}
    </div>
  );
}
