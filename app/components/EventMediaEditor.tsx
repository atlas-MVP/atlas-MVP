"use client";

/**
 * EventMediaEditor — modal for managing uploaded media on a timeline event.
 *
 * Features:
 *   • Resize — click a size pill (1/1 · 1/2 · 1/4) to update the display slot
 *   • Reorder — ▲ / ▼ arrows move an item up or down in the manifest
 *   • Delete — removes the entry from the manifest AND Cloudflare R2
 *
 * All changes persist immediately via PATCH / DELETE to /api/upload.
 * onChanged() is called after every mutation so the parent (EventVideoBubble)
 * can refresh its content.
 */

import { useEffect, useState } from "react";
import { T, clr } from "../lib/tokens";
import type { VideoSize } from "../lib/tokens";

interface MediaItem {
  id:        string;
  type:      "video" | "youtube" | "tweet" | "article";
  title:     string;
  embedUrl?: string;
  size?:     VideoSize;
  eventId?:  string;
}

interface Props {
  eventId:   string;
  onClose:   () => void;
  onChanged: () => void;
}

const SIZE_OPTIONS: VideoSize[] = ["1/1", "1/2", "1/4"];

const SIZE_LABELS: Record<VideoSize, string> = {
  "1/1": "Full",
  "1/2": "Half",
  "1/4": "Grid",
};

export default function EventMediaEditor({ eventId, onClose, onChanged }: Props) {
  const [items,  setItems]  = useState<MediaItem[]>([]);
  const [busy,   setBusy]   = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    fetch(`/api/videos?scope=event&eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [eventId]);

  // ── Size update ─────────────────────────────────────────────────────────────
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

  // ── Reorder ──────────────────────────────────────────────────────────────────
  const move = async (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= items.length) return;
    const reordered = [...items];
    [reordered[idx], reordered[next]] = [reordered[next], reordered[idx]];
    setItems(reordered);
    await fetch("/api/upload", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ eventId, order: reordered.map(it => it.id) }),
    }).catch(console.error);
    onChanged();
  };

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

  // ── Styles ───────────────────────────────────────────────────────────────────
  const arrowBtn = (disabled: boolean): React.CSSProperties => ({
    background: "none", border: "none",
    color:   disabled ? clr.white(0.12) : clr.white(0.4),
    cursor:  disabled ? "default" : "pointer",
    fontSize: 9, padding: "2px 4px", lineHeight: 1,
    fontFamily: T.MONO,
  });

  const sizeBtn = (active: boolean): React.CSSProperties => ({
    fontSize: 9, fontFamily: T.MONO, letterSpacing: T.TRACK_MED,
    padding: "3px 8px", borderRadius: T.PILL_RADIUS, cursor: "pointer",
    background: active ? clr.blue(0.2)    : clr.white(0.06),
    border:     active ? `1px solid ${clr.blue(0.5)}`  : `1px solid ${clr.white(0.12)}`,
    color:      active ? clr.blue(1)      : clr.white(0.45),
    transition: "all 0.12s",
  });

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
        }}
      />

      {/* Panel */}
      <div style={{
        position:   "fixed",
        top:        "50%",
        left:       "50%",
        transform:  "translate(-50%, -50%)",
        zIndex:     51,
        width:      500,
        maxHeight:  "78vh",
        overflowY:  "auto",
        scrollbarWidth: "none",
        background: T.MODAL_BG,
        border:     T.MODAL_BORDER,
        borderRadius: T.MODAL_RADIUS + 2,
        boxShadow:  T.MODAL_SHADOW,
        padding:    "18px 20px 24px",
        boxSizing:  "border-box",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <span style={{
            fontSize: 10, fontFamily: T.MONO, letterSpacing: T.TRACK_XWIDE,
            textTransform: "uppercase", color: clr.white(0.4),
          }}>
            Edit media
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none",
              color: clr.white(0.35), cursor: "pointer",
              fontSize: 18, lineHeight: 1, padding: "0 2px",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = clr.white(0.8))}
            onMouseLeave={e => (e.currentTarget.style.color = clr.white(0.35))}
          >×</button>
        </div>

        {/* Legend */}
        {loaded && items.length > 0 && (
          <div style={{
            display: "flex", justifyContent: "flex-end", gap: 6,
            marginBottom: 10, paddingRight: 2,
          }}>
            {SIZE_OPTIONS.map(sz => (
              <span key={sz} style={{
                fontSize: 8, fontFamily: T.MONO, color: clr.white(0.25),
                letterSpacing: T.TRACK_MED,
              }}>
                {sz} = {SIZE_LABELS[sz]}
              </span>
            ))}
          </div>
        )}

        {/* Loading */}
        {!loaded && (
          <p style={{ color: clr.white(0.3), fontSize: 11, fontFamily: T.MONO, textAlign: "center", padding: "28px 0" }}>
            Loading…
          </p>
        )}

        {/* Empty */}
        {loaded && items.length === 0 && (
          <p style={{ color: clr.white(0.25), fontSize: 11, fontFamily: T.MONO, textAlign: "center", padding: "28px 0" }}>
            No uploaded media for this event.
          </p>
        )}

        {/* Item list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map((item, i) => (
            <div
              key={item.id}
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        10,
                padding:    "10px 12px",
                borderRadius: T.TILE_RADIUS,
                background: clr.white(0.04),
                border:     T.TILE_BORDER,
                opacity:    busy === item.id ? 0.45 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {/* Order arrows */}
              <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  style={arrowBtn(i === 0)}
                >▲</button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  style={arrowBtn(i === items.length - 1)}
                >▼</button>
              </div>

              {/* Type + title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                  <span style={{
                    fontSize: 8, fontFamily: T.MONO, letterSpacing: T.TRACK_MED,
                    textTransform: "uppercase", padding: "2px 6px", borderRadius: 3,
                    background: clr.white(0.07), color: clr.white(0.35),
                  }}>{item.type}</span>
                  <span style={{ fontSize: 8, fontFamily: T.MONO, color: clr.white(0.2) }}>
                    #{i + 1}
                  </span>
                </div>
                <p style={{
                  margin: 0, fontSize: 11, fontFamily: T.MONO,
                  color: clr.white(0.65),
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {item.title || item.embedUrl || "untitled"}
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
                        e.currentTarget.style.color = clr.white(0.45);
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
                  flexShrink: 0, width: 22, height: 22,
                  borderRadius: 11,
                  background:  clr.black(0.5),
                  border:      `1px solid ${clr.red(0.3)}`,
                  color:       clr.red(0.7),
                  fontSize:    12, lineHeight: 1, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: T.MONO,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = clr.red(0.2); e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = clr.black(0.5); e.currentTarget.style.color = clr.red(0.7); }}
              >
                {busy === item.id ? "…" : "×"}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {loaded && items.length > 0 && (
          <div style={{ marginTop: 18, textAlign: "center" }}>
            <button
              onClick={onClose}
              style={{
                fontSize: 10, fontFamily: T.MONO, letterSpacing: T.TRACK_WIDE,
                color: clr.white(0.35), background: "none", border: "none",
                cursor: "pointer", padding: "6px 16px",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = clr.white(0.75))}
              onMouseLeave={e => (e.currentTarget.style.color = clr.white(0.35))}
            >done</button>
          </div>
        )}
      </div>
    </>
  );
}
