"use client";

/**
 * EventVideoBubble — floating media column over the map for a focused event.
 *
 * Content sources (in order):
 *   1. Hardcoded slide videos from the event (always size "1/1")
 *   2. Uploaded videos/embeds (size from manifest; default "1/1")
 *   3. Uploaded articles (always "1/4")
 *   4. Hardcoded article URLs (always "1/4")
 *
 * Page-layout algorithm (scroll-snap, one container-height per page):
 *   "1/1" → solo page (full container, landscape default)
 *   "1/2" → pair page (two 9:16 side-by-side; centered if only one)
 *   "1/4" → 2×2 grid page (up to 4 items; articles and quarter-videos mixed)
 *
 * Conditional rendering: returns null when there is no content for the event,
 * hiding the frosted glass box and upload button entirely.
 */

import { useEffect, useRef, useState } from "react";
import EventUploadButton from "./EventUploadButton";
import ArticleCard from "./ArticleCard";
import { T, clr } from "../lib/tokens";
import type { VideoSize } from "../lib/tokens";

export interface Slide {
  videoUrl:  string;
  title:     string;
  subtitle?: string;
  info?:     string;
}

interface UploadedVideo {
  id:         string;
  type:       "video" | "youtube" | "tweet" | "article";
  key:        string;
  embedUrl?:  string;
  signedUrl?: string;
  title:      string;
  caption:    string;
  handle:     string;
  date:       string;
  size?:      VideoSize;
}

interface Props {
  eventDate:  string;
  eventId:    string;
  slides?:    Slide[];
  articles?:  string[];
}

// ── Unified content item ──────────────────────────────────────────────────────
interface ContentItem {
  id:          string;
  size:        VideoSize;
  kind:        "slide" | "upload" | "article";
  videoUrl?:   string;
  isYT?:       boolean;
  canDelete:   boolean;
  articleUrl?: string;
}

// ── Page-layout types ─────────────────────────────────────────────────────────
type Page =
  | { layout: "solo"; items: [ContentItem] }
  | { layout: "pair"; items: ContentItem[] }  // 1–2 × "1/2"
  | { layout: "grid"; items: ContentItem[] }; // 1–4 × "1/4"

function buildPages(items: ContentItem[]): Page[] {
  const pages: Page[] = [];
  let i = 0;
  while (i < items.length) {
    const cur = items[i];
    if (cur.size === "1/1") {
      pages.push({ layout: "solo", items: [cur] });
      i++;
    } else if (cur.size === "1/2") {
      const pair: ContentItem[] = [cur];
      if (i + 1 < items.length && items[i + 1].size === "1/2") pair.push(items[i + 1]);
      i += pair.length;
      pages.push({ layout: "pair", items: pair });
    } else {
      // "1/4" — fill up to 4 consecutive quarter items
      const grid: ContentItem[] = [];
      while (grid.length < 4 && i + grid.length < items.length && items[i + grid.length].size === "1/4") {
        grid.push(items[i + grid.length]);
      }
      i += grid.length;
      pages.push({ layout: "grid", items: grid });
    }
  }
  return pages;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isYouTube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function youtubeEmbed(url: string): string {
  const idMatch = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  const id      = idMatch?.[1];
  if (!id) return url;
  const hasStart = url.match(/[?&]start=(\d+)/);
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1${hasStart ? `&start=${hasStart[1]}` : ""}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function EventVideoBubble({ eventDate: _eventDate, eventId, slides = [], articles = [] }: Props) {
  const [uploads,     setUploads]     = useState<UploadedVideo[]>([]);
  const [loaded,      setLoaded]      = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [busyId,      setBusyId]      = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    fetch(`/api/videos?scope=event&eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" })
      .then(r => r.json())
      .then((data: UploadedVideo[]) => {
        if (!cancelled) { setUploads(Array.isArray(data) ? data : []); setLoaded(true); }
      })
      .catch(() => { if (!cancelled) { setUploads([]); setLoaded(true); } });
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

  // ── Build unified content list ────────────────────────────────────────────
  const contentItems: ContentItem[] = [];

  // 1. Hardcoded slides → always 1/1
  slides.forEach((s, i) => {
    if (!s.videoUrl) return;
    const isYT = isYouTube(s.videoUrl);
    contentItems.push({
      id:        `slide-${i}`,
      size:      "1/1",
      kind:      "slide",
      videoUrl:  isYT ? youtubeEmbed(s.videoUrl) : s.videoUrl,
      isYT,
      canDelete: false,
    });
  });

  // 2. Uploads — articles go to 1/4; everything else uses size from manifest
  uploads.forEach(u => {
    if (u.type === "article") {
      if (u.embedUrl) contentItems.push({
        id:         u.id,
        size:       "1/4",
        kind:       "article",
        articleUrl: u.embedUrl,
        canDelete:  true,
      });
      return;
    }
    const src = u.type === "youtube" && u.embedUrl
      ? youtubeEmbed(u.embedUrl)
      : (u.signedUrl ?? u.embedUrl ?? "");
    if (!src) return;
    contentItems.push({
      id:        u.id,
      size:      u.size ?? "1/1",
      kind:      "upload",
      videoUrl:  src,
      isYT:      u.type === "youtube",
      canDelete: true,
    });
  });

  // 3. Hardcoded article URLs → always 1/4
  articles.forEach(url => contentItems.push({
    id:         `hc-${url}`,
    size:       "1/4",
    kind:       "article",
    articleUrl: url,
    canDelete:  false,
  }));

  // ── Conditional rendering ─────────────────────────────────────────────────
  // Hide everything (frosted glass + upload button) when there is no content.
  // Show immediately if hardcoded slides/articles exist; wait for fetch otherwise.
  const staticContent = slides.length > 0 || articles.length > 0;
  if (!staticContent && !loaded)         return null; // still fetching, nothing static
  if (loaded && contentItems.length === 0) return null; // loaded — nothing to show

  const pages = buildPages(contentItems);

  // ── Shared style helpers ──────────────────────────────────────────────────
  const tileChrome: React.CSSProperties = {
    position:     "absolute",
    inset:        0,
    borderRadius: T.TILE_RADIUS,
    border:       T.TILE_BORDER,
    overflow:     "hidden",
  };

  const delBtnStyle = (id: string): React.CSSProperties => ({
    position:       "absolute",
    top: -10, right: -10,
    zIndex:         20,
    width: 22, height: 22,
    borderRadius:   11,
    background:     clr.black(0.72),
    backdropFilter: "blur(6px)",
    border:         `1px solid ${clr.red(0.35)}`,
    color:          clr.red(0.85),
    fontSize:       12,
    lineHeight:     "1",
    cursor:         busyId === id ? "wait" : "pointer",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    fontFamily:     T.MONO,
  });

  // ── Render one content item ───────────────────────────────────────────────
  const renderItem = (item: ContentItem, wrapStyle: React.CSSProperties) => (
    <div key={item.id} style={{ position: "relative", ...wrapStyle }}>
      {item.canDelete && (
        <button
          onClick={() => handleDelete(item.id)}
          disabled={busyId === item.id}
          title="delete from Atlas + Cloudflare"
          style={delBtnStyle(item.id)}
          onMouseEnter={e => { e.currentTarget.style.background = clr.red(0.2);    e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = clr.black(0.72); e.currentTarget.style.color = clr.red(0.85); }}
        >{busyId === item.id ? "…" : "×"}</button>
      )}
      <div style={tileChrome}>
        {item.kind === "article" ? (
          <ArticleCard url={item.articleUrl!} width="100%" />
        ) : item.isYT ? (
          <iframe
            src={item.videoUrl!}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={item.videoUrl!}
            autoPlay loop muted controls playsInline
            style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000", display: "block" }}
          />
        )}
      </div>
    </div>
  );

  // ── Render one snap page ──────────────────────────────────────────────────
  const pageBase: React.CSSProperties = {
    width:           "100%",
    height:          T.VIDEO_CONTAINER_H,
    scrollSnapAlign: "start",
    flexShrink:      0,
  };

  const renderPage = (page: Page, key: number) => {
    if (page.layout === "solo") {
      return (
        <div key={key} style={pageBase}>
          {renderItem(page.items[0], { width: "100%", height: "100%" })}
        </div>
      );
    }

    if (page.layout === "pair") {
      const solo = page.items.length === 1;
      return (
        <div key={key} style={{ ...pageBase, display: "flex", gap: 4, justifyContent: solo ? "center" : "flex-start" }}>
          {page.items.map(item => renderItem(item, {
            width:    solo ? "50%" : undefined,
            flex:     solo ? undefined : "1 1 0",
            height:   "100%",
            minWidth: 0,
          }))}
        </div>
      );
    }

    // grid — 2×2, fills cells top-left → bottom-right in order
    return (
      <div key={key} style={{
        ...pageBase,
        display:             "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows:    "1fr 1fr",
        gap:                 4,
      }}>
        {page.items.map(item => renderItem(item, {}))}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    // Outer: left:PANEL_W (484) → right:0 as a flex row.
    //   [ 96px upload zone ][ frosted glass + video (flex:1) ]
    //   upload zone sits in the gap between CountryPanel and the video —
    //   the same 96px that was previously a dead-air breathing room.
    //   No right margin: video fills all the way to the screen edge.
    <div
      className="absolute z-20"
      style={{
        left: T.PANEL_W, right: T.VIDEO_RIGHT_GAP, top: T.VIDEO_CONTAINER_TOP,
        display: "flex", flexDirection: "row", alignItems: "flex-start",
        pointerEvents: "none",
      }}
    >
      {/* ── Gap zone — upload button only (edit button lives in CountryPanel gap zone) ── */}
      <div
        style={{
          width:         T.VIDEO_COL_GAP,
          flexShrink:    0,
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          paddingTop:    12,
          pointerEvents: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        <EventUploadButton eventId={eventId} onUploaded={handleUploaded} />
      </div>

      {/* ── Frosted glass backdrop — Apple-style: barely-there blur + tint ── */}
      <div style={{
        flex:                1,
        padding:             4,
        boxSizing:           "border-box",
        background:          "rgba(200,200,200,0.025)",
        backdropFilter:      "blur(8px)",
        WebkitBackdropFilter:"blur(8px)",
        borderRadius:        T.TILE_RADIUS + 4,
        pointerEvents:       "auto",
      }}>
        {/* Snap-scroll container — exactly one 16:9 frame tall */}
        <div
          ref={scrollRef}
          style={{
            width:          "100%",
            height:         T.VIDEO_CONTAINER_H,
            overflowY:      "scroll",
            scrollSnapType: "y mandatory",
            scrollbarWidth: "none",
            pointerEvents:  "auto",
          }}
        >
          {pages.map((page, i) => renderPage(page, i))}
        </div>
      </div>

    </div>
  );
}
