"use client";

/**
 * EventVideoBubble — the floating media column that appears over the map
 * when a timeline event is focused. Always-on-for-every-event layout:
 *
 *   1. All hardcoded slide videos from the event (16:9 YouTube, in order)
 *   2. Any user-uploaded videos attached to this event (landscape → vertical)
 *   3. Any linked articles for this event (square preview cards with
 *      og:image on top, headline overlaid on bottom)
 *   4. The upload chip so the user can add more at any time
 *
 * No captions anywhere — the timeline tile in the country panel is the
 * source of truth for event context. Captions were redundant and crowded
 * the bubble.
 *
 * One inch (~96 px) of breathing room on all four sides so the column
 * never hugs the country panel or the viewport wall.
 */

import { useEffect, useRef, useState } from "react";
import EventUploadButton from "./EventUploadButton";
import ArticleCard from "./ArticleCard";
import { T, clr } from "../lib/tokens";

export interface Slide {
  videoUrl:  string;
  title:     string;
  subtitle?: string;
  info?:     string;
}

interface UploadedVideo {
  id:        string;
  type:      "video" | "youtube" | "tweet" | "article";
  key:       string;
  embedUrl?: string;
  signedUrl?: string;
  title:     string;
  caption:   string;
  handle:    string;
  date:      string;
}

interface Props {
  eventDate:  string;
  eventId:    string;           // slug for R2 folder
  slides?:    Slide[];          // every hardcoded video for this event
  articles?:  string[];         // URLs to render as square preview cards
}

type Orientation = "landscape" | "vertical";

interface VideoItem {
  kind:        "slide" | "upload";
  videoUrl:    string;
  isYT:        boolean;
  id:          string;
  orientation: Orientation;
  canDelete:   boolean;
}

function isYouTube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function youtubeEmbed(url: string): string {
  // Accept full youtu.be / watch?v= / embed/ URLs and normalize to /embed/<id>.
  // Preserve any start=/ end= params that were already on the URL.
  const idMatch  = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  const id       = idMatch?.[1];
  if (!id) return url;
  const hasStart = url.match(/[?&]start=(\d+)/);
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1${hasStart ? `&start=${hasStart[1]}` : ""}`;
}

export default function EventVideoBubble({ eventDate: _eventDate, eventId, slides = [], articles = [] }: Props) {
  const [uploads,        setUploads]        = useState<UploadedVideo[]>([]);
  const [refreshTick,    setRefreshTick]    = useState(0);
  // Self-hosted uploads flip orientation once loadedmetadata reports real
  // videoWidth/Height. Until then assume vertical (phone reels are the
  // common case on /api/upload).
  const [orientationOverride, setOrientationOverride] = useState<Record<string, Orientation>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/videos?scope=event&eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" })
      .then(r => r.json())
      .then((data: UploadedVideo[]) => { if (!cancelled) setUploads(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setUploads([]); });
    return () => { cancelled = true; };
  }, [eventId, refreshTick]);

  const handleUploaded = () => setRefreshTick(t => t + 1);

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

  // ── Build video items: all slides, then uploads (landscape → vertical) ──
  const rawItems: VideoItem[] = [];
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    if (!s.videoUrl) continue;
    const isYT = isYouTube(s.videoUrl);
    rawItems.push({
      kind: "slide",
      videoUrl:    isYT ? youtubeEmbed(s.videoUrl) : s.videoUrl,
      isYT,
      id:          `slide-${i}`,
      orientation: "landscape",   // hardcoded slides are always landscape YouTube
      canDelete:   false,
    });
  }
  // Article uploads are collected separately — they render as ArticleCard
  // (square preview, og:image on top, headline overlaid at the bottom),
  // not in the video column. Each entry carries its own id so the delete
  // button still removes it from R2 + manifest.
  const uploadedArticles: { id: string; url: string }[] = [];
  for (const u of uploads) {
    if (u.type === "article") {
      if (u.embedUrl) uploadedArticles.push({ id: u.id, url: u.embedUrl });
      continue;
    }
    const src = u.type === "youtube" && u.embedUrl ? youtubeEmbed(u.embedUrl) : (u.signedUrl ?? u.embedUrl ?? "");
    if (!src) continue;
    const defaultOrientation: Orientation = u.type === "youtube" ? "landscape" : "vertical";
    rawItems.push({
      kind: "upload",
      videoUrl:    src,
      isYT:        u.type === "youtube",
      id:          u.id,
      orientation: orientationOverride[u.id] ?? defaultOrientation,
      canDelete:   true,
    });
  }
  const videoItems: VideoItem[] = [
    ...rawItems.filter(i => i.orientation === "landscape"),
    ...rawItems.filter(i => i.orientation === "vertical"),
  ];

  // Merge hardcoded article URLs (from the timeline data) with uploaded
  // ones (from the upload popup). Hardcoded ones have no id → no delete.
  const allArticles: { id: string | null; url: string }[] = [
    ...articles.map(url => ({ id: null, url })),
    ...uploadedArticles,
  ];

  const noteOrientation = (id: string, w: number, h: number) => {
    if (!w || !h) return;
    const o: Orientation = w >= h ? "landscape" : "vertical";
    setOrientationOverride(prev => (prev[id] === o ? prev : { ...prev, [id]: o }));
  };

  // ── Collage layout ────────────────────────────────────────────────────
  //
  //   Column: 100% wide, padding: 0 96px → hero has exactly 1 inch on each side
  //
  //   ┌──────────────────────────────────────────────────────┐
  //   │ 96px │         Hero video (100% of padded col)│ 96px │
  //   └──────────────────────────────────────────────────────┘
  //          │  secondary L (flex:1) │ secondary R  │
  //          │  article L   (flex:1) │ article R    │
  //
  // Smalls use flex:1 so they always span exactly half the hero width.
  // 1 item in a row → full width. 2 items → each = half. 3 → third. etc.
  // Articles are 16:9 rectangles (same size as secondary videos).
  // og:image displayed letterboxed (contain) with black bars on the sides.
  //
  // Change T.VIDEO_SIDE_MARGIN in tokens.ts to adjust the 96px margin.

  const heroVideo       = videoItems[0];
  const secondaryVideos = videoItems.slice(1);
  const hasContent      = videoItems.length > 0 || allArticles.length > 0;

  // Visual chrome for every tile — no flex/sizing here (the wrapper handles that).
  const tileChromeStyle: React.CSSProperties = {
    position:     "absolute",
    inset:        0,
    borderRadius: T.TILE_RADIUS,
    border:       T.TILE_BORDER,
    overflow:     "hidden",
  };

  // Shared delete-button style.
  const deleteBtn = (id: string): React.CSSProperties => ({
    position: "absolute", top: -10, right: -10, zIndex: 20,
    width: 22, height: 22, borderRadius: 11,
    background: clr.black(0.72), backdropFilter: "blur(6px)",
    border: `1px solid ${clr.red(0.35)}`, color: clr.red(0.85),
    fontSize: 12, lineHeight: 1,
    cursor: busyId === id ? "wait" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: T.MONO,
  });

  // Render one <video>/<iframe> tile.
  // Wrapper is NOT overflow:hidden so the X button sits outside the tile edge.
  const renderVideo = (it: VideoItem, aspect: string) => (
    <div key={it.id} style={{ position: "relative", flex: "1 1 0", minWidth: 0, aspectRatio: aspect }}>
      {it.canDelete && (
        <button
          onClick={() => handleDelete(it.id)}
          disabled={busyId === it.id}
          title="delete from Atlas + Cloudflare"
          style={deleteBtn(it.id)}
          onMouseEnter={e => { e.currentTarget.style.background = clr.red(0.2); e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = clr.black(0.72); e.currentTarget.style.color = clr.red(0.85); }}
        >{busyId === it.id ? "…" : "×"}</button>
      )}
      <div style={tileChromeStyle}>
        {it.isYT ? (
          <iframe
            src={it.videoUrl}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={it.videoUrl}
            autoPlay loop muted controls playsInline
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (it.kind === "upload") noteOrientation(it.id, v.videoWidth, v.videoHeight);
            }}
            style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000", display: "block" }}
          />
        )}
      </div>
    </div>
  );

  // Shared tile chrome for article wrappers (keeps border+radius, used inline).
  const tileStyle: React.CSSProperties = {
    position:     "relative",
    flex:         "1 1 0",
    minWidth:     0,
    borderRadius: T.TILE_RADIUS,
    border:       T.TILE_BORDER,
    overflow:     "hidden",
  };

  return (
    // Outer spans left:580 → right:0 (full to screen edge) as a flex row:
    //   [ video column (flex:1, same width as before) ][ 96px controls ]
    // This gives equal 96px breathing room on both sides of the video:
    //   left  = 580 - panel_right(484) = 96px
    //   right = the 96px controls column (upload + X when applicable)
    <div
      className="absolute z-20"
      style={{
        left: 580, right: 0, top: T.VIDEO_CONTAINER_TOP,
        display: "flex", flexDirection: "row", alignItems: "flex-start",
        pointerEvents: "none",
      }}
    >
      {/* ── Frosted glass backdrop — extends ~10px beyond video edges ──────
          Apple-style: barely-there translucent grey + blur, tight radius. */}
      <div style={{
        width:              "calc(100% - 96px)",
        padding:            4,
        boxSizing:          "border-box",
        background:         "rgba(200,200,200,0.025)",
        backdropFilter:     "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderRadius:       T.TILE_RADIUS + 4,
        pointerEvents:      "auto",
      }}>

      {/* ── Visibility scroll container ───────────────────────────────────
          Width = 100% (fills the frosted wrapper).
          Exactly one 16:9 frame tall. Snap-scrolls in pages.            */}
      <div
        ref={scrollRef}
        style={{
          width: "100%",
          height: T.VIDEO_CONTAINER_H,
          overflowY: "auto",
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          pointerEvents: "auto",
        }}
      >
        {/* Page 1 — Hero */}
        {heroVideo && (
          <div style={{ position: "relative", width: "100%", height: T.VIDEO_CONTAINER_H, scrollSnapAlign: "start" }}>
            <div style={tileChromeStyle}>
              {heroVideo.isYT ? (
                <iframe
                  src={heroVideo.videoUrl}
                  style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={heroVideo.videoUrl}
                  autoPlay loop muted controls playsInline
                  style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000", display: "block" }}
                />
              )}
            </div>
          </div>
        )}

        {/* Page 2 — secondary videos + articles grouped.
            marginTop (not paddingTop) keeps the inter-page gap outside this
            group's own height, so the rows fit exactly within T.VIDEO_CONTAINER_H. */}
        {(secondaryVideos.length > 0 || allArticles.length > 0) && (
          <div style={{
            scrollSnapAlign: "start",
            display: "flex", flexDirection: "column", gap: 4,
            marginTop: 10,
          }}>
            {secondaryVideos.length > 0 && (
              <div style={{ display: "flex", gap: 4, width: "100%" }}>
                {secondaryVideos.map(it => renderVideo(
                  it,
                  it.orientation === "landscape" ? "16 / 9" : "9 / 16",
                ))}
              </div>
            )}

            {allArticles.length > 0 && (
              <div style={{ display: "flex", gap: 4, width: "100%" }}>
                {allArticles.map((a) => (
                  <div key={a.id ?? a.url} style={{ ...tileStyle, aspectRatio: "16 / 9" }}>
                    {a.id && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(a.id!); }}
                        disabled={busyId === a.id}
                        title="delete from Atlas + Cloudflare"
                        style={{
                          position: "absolute", top: 6, right: 6, zIndex: 5,
                          width: 22, height: 22, borderRadius: 11,
                          background: clr.black(0.55), backdropFilter: "blur(4px)",
                          border: `1px solid ${clr.red(0.3)}`, color: clr.red(0.85),
                          fontSize: 11, lineHeight: 1,
                          cursor: busyId === a.id ? "wait" : "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: T.MONO,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = clr.red(0.2); e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = clr.black(0.55); e.currentTarget.style.color = clr.red(0.85); }}
                      >{busyId === a.id ? "…" : "×"}</button>
                    )}
                    <ArticleCard url={a.url} width="100%" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </div>{/* end frosted glass backdrop */}

      {/* ── Controls column — 96px wide, sits in the right margin.
          Floats outside the video so it never covers it.
          X appears only when the hero is a user upload (canDelete).    */}
      <div
        style={{
          width: 96, flexShrink: 0,
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 10, paddingTop: 12,
          pointerEvents: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {heroVideo?.canDelete && (
          <button
            onClick={() => handleDelete(heroVideo.id)}
            disabled={busyId === heroVideo.id}
            title="delete from Atlas + Cloudflare"
            style={{
              width: 26, height: 26, borderRadius: 13,
              background: clr.black(0.72), backdropFilter: "blur(6px)",
              border: `1px solid ${clr.red(0.35)}`, color: clr.red(0.85),
              fontSize: 13, lineHeight: 1,
              cursor: busyId === heroVideo.id ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: T.MONO,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = clr.red(0.2); e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = clr.black(0.72); e.currentTarget.style.color = clr.red(0.85); }}
          >{busyId === heroVideo.id ? "…" : "×"}</button>
        )}
        <EventUploadButton eventId={eventId} onUploaded={handleUploaded} />
      </div>
    </div>
  );
}
