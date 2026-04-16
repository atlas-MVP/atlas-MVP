"use client";

/**
 * EventVideoBubble — the compact video card that floats over the map when
 * a timeline event is focused. Shows:
 *   1. The hard-coded slide video from conflict data (if any), then
 *   2. Any user-uploaded videos attached to this specific timeline event
 *      (scope === "event" && eventId matches).
 *
 * Atlas has exactly three video-display sizes app-wide:
 *   • Atlas Reels slide (smallest, portrait 9:16)         → ReelsPlayer
 *   • Timeline bubble  (this component — two shapes)      → landscape 16:9 OR vertical 9:16
 *   • Full-screen      (fullscreen API on the media)      → native browser fullscreen
 *
 * In this bubble landscape videos render first; vertical uploads (phone reels)
 * render below them. Each card's frame matches the video's natural orientation
 * so there's no pillarbox/letterbox blank space.
 */

import { useEffect, useRef, useState } from "react";
import EventUploadButton from "./EventUploadButton";

interface Slide {
  videoUrl: string;
  title:    string;
  subtitle?: string;
  info?:    string;
}

interface UploadedVideo {
  id:        string;
  type:      "video" | "youtube" | "tweet";
  key:       string;
  embedUrl?: string;
  signedUrl?: string;
  title:     string;
  caption:   string;
  handle:    string;
  date:      string;
}

interface Props {
  eventDate:   string;
  eventId:     string;                         // slug for R2 folder
  baseSlide?:  Slide | null;                   // hardcoded first video
  infoTrimmed: string;                         // short blurb
}

type Orientation = "landscape" | "vertical";

interface Item {
  kind:        "slide" | "upload";
  videoUrl:    string;
  title:       string;
  isYT:        boolean;
  id:          string;
  orientation: Orientation;
  canDelete:   boolean;
}

// Per-orientation default frame widths in the timeline bubble.
// Landscape fills the comfortable map gap; vertical matches the Atlas Reels
// player width (428px) so the same clip looks the same size everywhere.
const LANDSCAPE_MAX_W = 860;
const VERTICAL_MAX_W  = 428;

function isYouTube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function youtubeEmbed(url: string): string {
  // Accept full youtu.be / watch?v= / embed/ URLs and normalize to /embed/<id>
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  const id = m?.[1];
  if (!id) return url;
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
}

export default function EventVideoBubble({ eventDate, eventId, baseSlide, infoTrimmed }: Props) {
  const [uploads, setUploads] = useState<UploadedVideo[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);
  // Self-hosted videos start with a sensible default (vertical — phone reels are
  // the common case) and then flip to landscape once loadedmetadata reports
  // videoWidth > videoHeight. This key is by id.
  const [orientationOverride, setOrientationOverride] = useState<Record<string, Orientation>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user-uploaded videos for this event whenever the event changes
  // or a new upload/delete completes.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/videos?scope=event&eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" })
      .then(r => r.json())
      .then((data: UploadedVideo[]) => { if (!cancelled) setUploads(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setUploads([]); });
    return () => { cancelled = true; };
  }, [eventId, refreshTick]);

  const handleUploaded = () => setRefreshTick(t => t + 1);

  // Delete from Atlas manifest AND the underlying R2 object (the DELETE route
  // handles both sides). After the round-trip succeeds we refetch.
  const handleDelete = async (id: string) => {
    if (typeof window !== "undefined" &&
        !window.confirm("Delete this video? This removes it from Atlas and Cloudflare.")) return;
    setBusyId(id);
    try {
      const r = await fetch(`/api/upload?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!r.ok) {
        const { error } = await r.json().catch(() => ({ error: "delete failed" }));
        window.alert(error || "delete failed");
      }
      setRefreshTick(t => t + 1);
    } finally {
      setBusyId(null);
    }
  };

  // ── Classify + sort: landscape first, vertical at the bottom ────────────────
  const rawItems: Item[] = [];
  if (baseSlide?.videoUrl) {
    rawItems.push({
      kind: "slide",
      videoUrl: baseSlide.videoUrl,
      title: baseSlide.title,
      isYT: isYouTube(baseSlide.videoUrl),
      id: "base",
      orientation: "landscape", // conflict-data slides are YouTube landscape
      canDelete: false,         // baked into the app, can't delete
    });
  }
  for (const u of uploads) {
    const src = u.type === "youtube" && u.embedUrl ? youtubeEmbed(u.embedUrl) : (u.signedUrl ?? u.embedUrl ?? "");
    if (!src) continue;
    const defaultOrientation: Orientation = u.type === "youtube" ? "landscape" : "vertical";
    rawItems.push({
      kind: "upload",
      videoUrl: src,
      title: u.title || u.caption || "uploaded clip",
      isYT: u.type === "youtube",
      id: u.id,
      orientation: orientationOverride[u.id] ?? defaultOrientation,
      canDelete: true,
    });
  }
  const items: Item[] = [
    ...rawItems.filter(i => i.orientation === "landscape"),
    ...rawItems.filter(i => i.orientation === "vertical"),
  ];

  const noteOrientation = (id: string, w: number, h: number) => {
    if (!w || !h) return;
    const o: Orientation = w >= h ? "landscape" : "vertical";
    setOrientationOverride(prev => (prev[id] === o ? prev : { ...prev, [id]: o }));
  };

  if (items.length === 0) {
    // Nothing to show at all — still render the upload chip underneath.
    return (
      <div
        className="absolute z-20"
        style={{
          left: 504, right: 24, top: 0, bottom: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto" }}>
          <EventUploadButton eventId={eventId} onUploaded={handleUploaded} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute z-20"
      style={{
        left: 504, right: 24, top: 0, bottom: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 10,
        maxWidth: "100%",
        pointerEvents: "auto",
      }}>
        <div
          ref={scrollRef}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            // Max height so the scroll-snap container has a bounded track
            maxHeight: "calc(100vh - 120px)",
            overflowY: items.length > 1 ? "auto" : "visible",
            scrollSnapType: items.length > 1 ? "y mandatory" : "none",
            scrollBehavior: "smooth",
            padding: 4,
          }}
        >
          {items.map((it) => {
            const isLandscape = it.orientation === "landscape";
            const cardWidth   = isLandscape ? LANDSCAPE_MAX_W : VERTICAL_MAX_W;
            const aspect      = isLandscape ? "16 / 9" : "9 / 16";
            return (
              <div
                key={it.id}
                style={{
                  flexShrink: 0,
                  scrollSnapAlign: "start",
                  width: `min(${cardWidth}px, 100%)`,
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 14,
                  background: "rgba(4,6,18,0.38)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  overflow: "hidden",
                  display: "flex", flexDirection: "column",
                  position: "relative",
                }}
              >
                {/* Delete (uploads only). Wipes Atlas manifest + R2 object. */}
                {it.canDelete && (
                  <button
                    onClick={() => handleDelete(it.id)}
                    disabled={busyId === it.id}
                    title="delete from Atlas + Cloudflare"
                    style={{
                      position: "absolute", top: 8, right: 8, zIndex: 5,
                      width: 26, height: 26, borderRadius: 13,
                      background: "rgba(0,0,0,0.55)",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "rgba(239,68,68,0.85)",
                      fontSize: 12, lineHeight: 1,
                      cursor: busyId === it.id ? "wait" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "monospace",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.55)"; e.currentTarget.style.color = "rgba(239,68,68,0.85)"; }}
                  >{busyId === it.id ? "…" : "×"}</button>
                )}

                {/* Video frame — strictly matches orientation so no pillar/letterbox */}
                <div style={{ width: "100%", aspectRatio: aspect, background: "#000", flexShrink: 0 }}>
                  {it.isYT ? (
                    <iframe
                      src={it.videoUrl}
                      style={{ width: "100%", height: "100%", border: "none" }}
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={it.videoUrl}
                      controls
                      playsInline
                      onLoadedMetadata={(e) => {
                        const v = e.currentTarget;
                        if (it.kind === "upload") noteOrientation(it.id, v.videoWidth, v.videoHeight);
                      }}
                      style={{
                        width: "100%", height: "100%",
                        // cover for vertical (fills the phone-shape frame exactly),
                        // contain for landscape (respects black bars if source isn't 16:9)
                        objectFit: isLandscape ? "contain" : "cover",
                        background: "#000", display: "block",
                      }}
                    />
                  )}
                </div>

                {/* Caption strip */}
                <div style={{
                  padding: "10px 16px 12px",
                  minHeight: 64,
                  display: "flex", flexDirection: "column", gap: 4,
                }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.92)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
                      {it.title}
                    </p>
                    <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                      {eventDate}
                    </span>
                  </div>
                  {/* Only the base slide gets the conflict-data blurb; uploads stay sparse */}
                  {it.kind === "slide" && infoTrimmed && (
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, overflow: "hidden" }}>
                      {infoTrimmed}
                    </p>
                  )}
                  {it.kind === "upload" && (
                    <p style={{ margin: 0, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
                      uploaded · {it.orientation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating upload chip — targets the focused event */}
        <div style={{ display: "flex", justifyContent: "center" }} onClick={(e) => e.stopPropagation()}>
          <EventUploadButton eventId={eventId} onUploaded={handleUploaded} />
        </div>
      </div>
    </div>
  );
}
