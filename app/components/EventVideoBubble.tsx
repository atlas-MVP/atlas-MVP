"use client";

/**
 * EventVideoBubble — the compact video card that floats over the map when
 * a timeline event is focused. Shows:
 *   1. The hard-coded slide video from conflict data (if any), then
 *   2. Any user-uploaded videos attached to this specific timeline event
 *      (scope === "event" && eventId matches).
 * All videos live in a vertical snap-scroll list inside a single bubble —
 * so users can scroll below the default video to see uploads they added.
 */

import { useEffect, useRef, useState } from "react";
import VideoPlayer from "./VideoPlayer";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user-uploaded videos for this event whenever the event changes
  // or a new upload completes (refreshTick bumps from the upload chip).
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/videos?scope=event&eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" })
      .then(r => r.json())
      .then((data: UploadedVideo[]) => { if (!cancelled) setUploads(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setUploads([]); });
    return () => { cancelled = true; };
  }, [eventId, refreshTick]);

  const handleUploaded = () => setRefreshTick(t => t + 1);

  // Build a unified playlist: hardcoded slide first, then user uploads.
  const items: { kind: "slide" | "upload"; videoUrl: string; title: string; isYT: boolean; id: string }[] = [];
  if (baseSlide?.videoUrl) {
    items.push({
      kind: "slide",
      videoUrl: baseSlide.videoUrl,
      title: baseSlide.title,
      isYT: isYouTube(baseSlide.videoUrl),
      id: "base",
    });
  }
  for (const u of uploads) {
    const src = u.type === "youtube" && u.embedUrl ? youtubeEmbed(u.embedUrl) : (u.signedUrl ?? u.embedUrl ?? "");
    if (!src) continue;
    items.push({
      kind: "upload",
      videoUrl: src,
      title: u.title || u.caption || "uploaded clip",
      isYT: u.type === "youtube",
      id: u.id,
    });
  }

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
        width: "min(860px, 100%)",
        display: "flex", flexDirection: "column",
        gap: 10,
        pointerEvents: "auto",
      }}>
        <div
          ref={scrollRef}
          style={{
            display: "flex", flexDirection: "column",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 14,
            background: "rgba(4,6,18,0.32)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            overflow: "hidden",
            // Max height so the scroll-snap container has a bounded track
            maxHeight: "calc(100vh - 120px)",
            overflowY: items.length > 1 ? "auto" : "hidden",
            scrollSnapType: items.length > 1 ? "y mandatory" : "none",
            scrollBehavior: "smooth",
          }}
        >
          {items.map((it, idx) => (
            <div
              key={it.id}
              style={{
                flexShrink: 0,
                scrollSnapAlign: "start",
                display: "flex", flexDirection: "column",
              }}
            >
              {/* Video — fills full width, 16:9 */}
              <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", flexShrink: 0 }}>
                {it.isYT ? (
                  <iframe
                    src={it.videoUrl}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <VideoPlayer src={it.videoUrl} isActive={false} />
                )}
              </div>

              {/* Caption strip */}
              <div style={{
                padding: "10px 16px 12px",
                minHeight: 72,
                display: "flex", flexDirection: "column", gap: 4,
                borderBottom: idx < items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
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
                    uploaded
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Floating upload chip — targets the focused event */}
        <div style={{ display: "flex", justifyContent: "center" }} onClick={(e) => e.stopPropagation()}>
          <EventUploadButton eventId={eventId} onUploaded={handleUploaded} />
        </div>
      </div>
    </div>
  );
}
