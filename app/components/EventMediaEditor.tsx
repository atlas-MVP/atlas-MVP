"use client";

/**
 * EventMediaEditor — modal for managing uploaded media on a timeline event.
 *
 * Each row shows:
 *   • Thumbnail preview (video first-frame, YouTube thumb, article/tweet icon)
 *   • Display name (filename for uploads, domain for articles, title if set)
 *   • Size pills  1/1 · 1/2 · 1/4
 *   • ▲ ▼ reorder
 *   • × delete (manifest + Cloudflare R2)
 */

import { useEffect, useState } from "react";
import { T, clr } from "../lib/tokens";
import type { VideoSize } from "../lib/tokens";

interface MediaItem {
  id:         string;
  type:       "video" | "youtube" | "tweet" | "article";
  title:      string;
  embedUrl?:  string;
  signedUrl?: string;
  size?:      VideoSize;
  eventId?:   string;
}

interface Slide {
  videoUrl:   string;
  title:      string;
  subtitle?:  string;
}

interface Props {
  eventId:   string;
  slides?:   Slide[];  // hardcoded slides — shown read-only
  onClose:   () => void;
  onChanged: () => void;
}

const SIZE_OPTIONS: VideoSize[] = ["1/1", "1/2", "1/4"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function isYouTube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function ytId(url: string): string | null {
  return url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null;
}

function domain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

/** Human-readable name: prefer explicit title, then derive from URL/type. */
function displayName(item: MediaItem): string {
  if (item.title && item.title.trim()) return item.title.trim();
  if (item.type === "youtube" && item.embedUrl) {
    const id = ytId(item.embedUrl);
    return id ? `youtube · ${id}` : domain(item.embedUrl);
  }
  if (item.embedUrl) return domain(item.embedUrl);
  return "untitled";
}

// ── Thumbnail ─────────────────────────────────────────────────────────────────
function Thumbnail({ item }: { item: MediaItem }) {
  const box: React.CSSProperties = {
    width: 88, height: 54, flexShrink: 0,
    borderRadius: 6, overflow: "hidden",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative",
  };

  // YouTube — use YouTube's own thumbnail CDN
  if (item.type === "youtube" && item.embedUrl) {
    const id = ytId(item.embedUrl);
    if (id) return (
      <div style={box}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* Play badge */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            background: "rgba(0,0,0,0.65)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, color: "#fff", paddingLeft: 2,
          }}>▶</div>
        </div>
      </div>
    );
  }

  // Self-hosted video — #t=0.001 forces browser to decode & display first frame
  if (item.type === "video" && item.signedUrl) {
    return (
      <div style={box}>
        <video
          src={`${item.signedUrl}#t=0.001`}
          preload="metadata"
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  // Article — globe icon + domain
  if (item.type === "article") {
    return (
      <div style={box}>
        <div style={{ textAlign: "center", padding: "0 6px" }}>
          <div style={{ fontSize: 18, marginBottom: 2 }}>🌐</div>
          <div style={{
            fontSize: 7, fontFamily: T.MONO, color: "rgba(255,255,255,0.35)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            maxWidth: 76,
          }}>
            {item.embedUrl ? domain(item.embedUrl) : "article"}
          </div>
        </div>
      </div>
    );
  }

  // Tweet
  if (item.type === "tweet") {
    return (
      <div style={box}>
        <div style={{ fontSize: 22, opacity: 0.4 }}>𝕏</div>
      </div>
    );
  }

  // Fallback
  return (
    <div style={box}>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: T.MONO }}>
        {item.type}
      </span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function EventMediaEditor({ eventId, slides = [], onClose, onChanged }: Props) {
  const [items,  setItems]  = useState<MediaItem[]>([]);
  const [busy,   setBusy]   = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);

    (async () => {
      // 1. Fetch existing uploads for this event
      const res  = await fetch(`/api/videos?scope=event&eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" });
      const data: MediaItem[] = res.ok ? await res.json() : [];
      if (cancelled) return;

      const existingUrls = new Set(data.map(d => d.embedUrl).filter(Boolean));

      // 2. Auto-register any hardcoded slides not yet in the manifest.
      //    This converts them to real editable entries so they can be
      //    dragged, resized, and deleted alongside uploads.
      const toRegister = slides.filter(s => s.videoUrl && !existingUrls.has(s.videoUrl));
      const registered: MediaItem[] = [];

      for (const s of toRegister) {
        try {
          const r = await fetch("/api/upload", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              embedUrl: s.videoUrl,
              title:    s.title || "",
              scope:    "event",
              eventId,
              size:     "1/1",
            }),
          });
          if (r.ok) registered.push(await r.json());
        } catch { /* ignore */ }
      }

      if (!cancelled) {
        setItems([...data, ...registered]);
        setLoaded(true);
        if (registered.length > 0) onChanged(); // refresh bubble
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // ── Size update ──────────────────────────────────────────────────────────────
  const updateSize = async (id: string, size: VideoSize) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, size } : it));
    setBusy(id);
    await fetch("/api/upload", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id, size }),
    }).catch(console.error);
    setBusy(null);
    onChanged();
  };

  // ── Reorder ───────────────────────────────────────────────────────────────────
  const reorder = async (reordered: MediaItem[]) => {
    setItems(reordered);
    await fetch("/api/upload", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ eventId, order: reordered.map(it => it.id) }),
    }).catch(console.error);
    onChanged();
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= items.length) return;
    const r = [...items];
    [r[idx], r[next]] = [r[next], r[idx]];
    reorder(r);
  };

  // ── Drag-to-reorder handlers ─────────────────────────────────────────────
  // stopPropagation on every drag event so Mapbox never sees them.
  const onDragStart = (e: React.DragEvent, idx: number) => {
    e.stopPropagation(); setDragIdx(idx);
  };
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault(); e.stopPropagation(); setOverIdx(idx);
  };
  const onDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault(); e.stopPropagation();
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setOverIdx(null); return; }
    const r = [...items];
    const [moved] = r.splice(dragIdx, 1);
    r.splice(idx, 0, moved);
    setDragIdx(null); setOverIdx(null);
    reorder(r);
  };
  const onDragEnd = (e: React.DragEvent) => { e.stopPropagation(); setDragIdx(null); setOverIdx(null); };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const deleteItem = async (id: string) => {
    if (typeof window !== "undefined" &&
        !window.confirm("Delete this item from Atlas and Cloudflare?")) return;
    setBusy(id);
    await fetch(`/api/upload?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      .catch(console.error);
    setItems(prev => prev.filter(it => it.id !== id));
    setBusy(null);
    onChanged();
  };

  // ── Style helpers ────────────────────────────────────────────────────────────
  const sizeBtn = (active: boolean): React.CSSProperties => ({
    fontSize: 9, fontFamily: T.MONO, letterSpacing: T.TRACK_MED,
    padding: "3px 8px", borderRadius: T.PILL_RADIUS, cursor: "pointer",
    background: active ? clr.blue(0.2)  : clr.white(0.06),
    border:     active ? `1px solid ${clr.blue(0.5)}` : `1px solid ${clr.white(0.12)}`,
    color:      active ? clr.blue(1)    : clr.white(0.4),
    transition: "all 0.1s",
  });

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
        style={{
        position:     "fixed",
        top:          "50%",
        left:         "50%",
        transform:    "translate(-50%, -50%)",
        zIndex:       51,
        width:        540,
        maxHeight:    "80vh",
        overflowY:    "auto",
        scrollbarWidth: "none",
        background:   T.MODAL_BG,
        border:       T.MODAL_BORDER,
        borderRadius: T.MODAL_RADIUS + 2,
        boxShadow:    T.MODAL_SHADOW,
        padding:      "20px 22px 26px",
        boxSizing:    "border-box",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{
            fontSize: 10, fontFamily: T.MONO, letterSpacing: T.TRACK_XWIDE,
            textTransform: "uppercase", color: clr.white(0.4),
          }}>Edit media</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: clr.white(0.3), cursor: "pointer", fontSize: 20, lineHeight: 1 }}
            onMouseEnter={e => (e.currentTarget.style.color = clr.white(0.8))}
            onMouseLeave={e => (e.currentTarget.style.color = clr.white(0.3))}
          >×</button>
        </div>

        {/* Loading */}
        {!loaded && (
          <p style={{ color: clr.white(0.3), fontSize: 11, fontFamily: T.MONO, textAlign: "center", padding: "32px 0" }}>
            Loading…
          </p>
        )}

        {/* Empty */}
        {loaded && items.length === 0 && (
          <p style={{ color: clr.white(0.22), fontSize: 11, fontFamily: T.MONO, textAlign: "center", padding: "32px 0" }}>
            No media for this event.
          </p>
        )}

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map((item, i) => (
            <div
              key={item.id}
              draggable
              onDragStart={e => onDragStart(e, i)}
              onDragOver={e => onDragOver(e, i)}
              onDrop={e => onDrop(e, i)}
              onDragEnd={onDragEnd}
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        12,
                padding:    "10px 12px",
                borderRadius: T.TILE_RADIUS,
                background: overIdx === i && dragIdx !== i ? clr.blue(0.08) : clr.white(0.04),
                border:     overIdx === i && dragIdx !== i ? `1px solid ${clr.blue(0.35)}` : T.TILE_BORDER,
                opacity:    dragIdx === i ? 0.35 : busy === item.id ? 0.4 : 1,
                cursor:     "grab",
                transition: "opacity 0.15s, background 0.1s, border-color 0.1s",
              }}
            >
              {/* Drag handle */}
              <div style={{
                flexShrink: 0, color: clr.white(0.2),
                fontSize: 12, lineHeight: 1, userSelect: "none",
                letterSpacing: "0.05em",
              }}>⠿</div>

              {/* Thumbnail */}
              <Thumbnail item={item} />

              {/* Name + type */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 7, fontFamily: T.MONO, letterSpacing: T.TRACK_WIDE,
                    textTransform: "uppercase", padding: "2px 5px", borderRadius: 3,
                    background: clr.white(0.07), color: clr.white(0.3),
                  }}>{item.type}</span>
                  <span style={{ fontSize: 8, fontFamily: T.MONO, color: clr.white(0.18) }}>#{i + 1}</span>
                </div>
                <p style={{
                  margin: 0, fontSize: 12,
                  color: clr.white(0.7),
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {displayName(item)}
                </p>
              </div>

              {/* Size pills */}
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {SIZE_OPTIONS.map(sz => (
                  <button
                    key={sz}
                    onClick={() => updateSize(item.id, sz)}
                    style={sizeBtn((item.size ?? "1/1") === sz)}
                    onMouseEnter={e => {
                      if ((item.size ?? "1/1") !== sz) {
                        e.currentTarget.style.background = clr.white(0.1);
                        e.currentTarget.style.color = clr.white(0.7);
                      }
                    }}
                    onMouseLeave={e => {
                      if ((item.size ?? "1/1") !== sz) {
                        e.currentTarget.style.background = clr.white(0.06);
                        e.currentTarget.style.color = clr.white(0.4);
                      }
                    }}
                  >{sz}</button>
                ))}
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteItem(item.id)}
                disabled={!!busy}
                title="delete from Atlas + Cloudflare"
                style={{
                  flexShrink: 0, width: 24, height: 24, borderRadius: 12,
                  background: clr.black(0.5), border: `1px solid ${clr.red(0.3)}`,
                  color: clr.red(0.7), fontSize: 13, lineHeight: 1, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: T.MONO,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = clr.red(0.2); e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = clr.black(0.5); e.currentTarget.style.color = clr.red(0.7); }}
              >{busy === item.id ? "…" : "×"}</button>
            </div>
          ))}
        </div>

        {/* Done footer */}
        {loaded && items.length > 0 && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <button
              onClick={onClose}
              style={{
                fontSize: 10, fontFamily: T.MONO, letterSpacing: T.TRACK_WIDE,
                color: clr.white(0.3), background: "none", border: "none", cursor: "pointer", padding: "6px 20px",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = clr.white(0.7))}
              onMouseLeave={e => (e.currentTarget.style.color = clr.white(0.3))}
            >done</button>
          </div>
        )}
      </div>
    </>
  );
}
