"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { VideoEntry } from "../lib/r2";

// ── Mock comments (replace with Neon later) ───────────────────────────────────
const MOCK_COMMENTS = [
  { handle: "ndamone",           text: "that is absolutely terrifying!", date: "8.30.24", likes: 0 },
  { handle: "elo_imi",           text: "are you good tho",               date: "8.28.24", likes: 5 },
  { handle: "jonathan.phillips9",text: "bro....im devastated",           date: "8.28.24", likes: 0 },
  { handle: "seamus.rooney",     text: "🙏🙏😢",                        date: "1.07.26",  likes: 2 },
  { handle: "micomica2023",      text: "😧😧😧",                        date: "9.23.24",  likes: 0 },
];

// ── Embed helpers ─────────────────────────────────────────────────────────────
function youtubeId(url: string) { return url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? ""; }
function tweetId(url: string)   { return url.match(/status\/(\d+)/)?.[1] ?? ""; }
function youtubeThumbnail(url: string) { const id = youtubeId(url); return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ""; }

// ── Sub-components ────────────────────────────────────────────────────────────

function AvatarCircle({ handle }: { handle: string }) {
  const colors = ["#1e40af","#065f46","#7e22ce","#9f1239","#92400e"];
  const color  = colors[handle.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
      background: color, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, color: "#fff", fontWeight: 600, fontFamily: "monospace",
      border: "1px solid rgba(255,255,255,0.2)",
    }}>
      {handle[0]?.toUpperCase()}
    </div>
  );
}

function ActionBtn({ icon, count, active, color, onClick }: {
  icon: string; count?: number; active?: boolean; color?: string; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
      background: "none", border: "none", cursor: "pointer", padding: 0,
    }}>
      <span style={{ fontSize: 22, color: active ? (color ?? "#ef4444") : "rgba(255,255,255,0.85)", lineHeight: 1, transition: "color 0.2s, transform 0.15s", transform: active ? "scale(1.15)" : "scale(1)" }}>
        {icon}
      </span>
      {count !== undefined && (
        <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em" }}>
          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </button>
  );
}

function ThoughtsOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "58%",
        background: "rgba(8,6,14,0.88)", backdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px 16px 0 0",
        display: "flex", flexDirection: "column",
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 8px", flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "rgba(255,255,255,0.75)", letterSpacing: "0.04em" }}>thoughts</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 16, cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
      </div>

      {/* Comments list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 14px 16px" }}>
        {MOCK_COMMENTS.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <AvatarCircle handle={c.handle} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>{c.handle}</span>
              <p style={{ margin: "3px 0 4px", fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.4 }}>{c.text}</p>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.28)" }}>{c.date}</span>
                <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.22)", cursor: "pointer" }}>reply</span>
              </div>
            </div>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0, alignSelf: "flex-start", paddingTop: 2 }}>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.28)" }}>♡</span>
              {c.likes > 0 && <span style={{ display: "block", fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.28)", textAlign: "center" }}>{c.likes}</span>}
            </button>
          </div>
        ))}
      </div>

      {/* Disabled input stub */}
      <div style={{ padding: "8px 14px 14px", flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ padding: "9px 14px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>add a thought…</span>
        </div>
      </div>
    </div>
  );
}

// ── Single reel card ──────────────────────────────────────────────────────────
function ReelCard({ entry, isActive }: { entry: VideoEntry; isActive: boolean }) {
  const videoRef             = useRef<HTMLVideoElement>(null);
  const [liked,   setLiked]  = useState(false);
  const [likes,   setLikes]  = useState(() => Math.floor(Math.random() * 2000) + 100);
  const [shares]             = useState(() => Math.floor(Math.random() * 500)  + 20);
  const [comments]           = useState(MOCK_COMMENTS.length);
  const [showComments, setShowComments] = useState(false);

  // Auto-play/pause based on visibility
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) { v.play().catch(() => {}); }
    else { v.pause(); }
  }, [isActive]);

  const handleLike = () => { setLiked(l => !l); setLikes(n => liked ? n - 1 : n + 1); };

  const handleShare = () => {
    const url = `${window.location.origin}/?reel=${entry.id}`;
    if (navigator.share) {
      navigator.share({ title: entry.title, text: entry.caption, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  // Build video/embed src
  const renderMedia = () => {
    if (entry.type === "youtube" && entry.embedUrl) {
      const id = youtubeId(entry.embedUrl);
      return (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=${isActive ? 1 : 0}&mute=0&controls=1&rel=0&modestbranding=1`}
          allow="autoplay; fullscreen"
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        />
      );
    }
    if (entry.type === "tweet" && entry.embedUrl) {
      const id = tweetId(entry.embedUrl);
      return (
        <iframe
          src={`https://platform.twitter.com/embed/Tweet.html?id=${id}&theme=dark&chrome=nofooter`}
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          scrolling="no"
        />
      );
    }
    // Uploaded video
    return (
      <video
        ref={videoRef}
        src={entry.signedUrl}
        loop playsInline muted={false}
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
      />
    );
  };

  return (
    <div style={{
      position: "relative",
      width: "100%", height: "100%",
      flexShrink: 0,
      background: "#000",
      scrollSnapAlign: "start",
      overflow: "hidden",
    }}>
      {/* Media */}
      <div style={{ position: "absolute", inset: 0 }}>
        {renderMedia()}
      </div>

      {/* Header overlay */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        padding: "10px 12px 12px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{entry.title}</p>
          <p style={{ margin: "2px 0 0", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.65)", letterSpacing: "0.04em" }}>{entry.date}</p>
        </div>
        {entry.location && (
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 10 }}>📍</span>
            <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.65)", letterSpacing: "0.04em" }}>{entry.location}</span>
          </div>
        )}
      </div>

      {/* Bottom overlay */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "48px 12px 14px",
        background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      }}>
        {/* Handle + caption */}
        <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <AvatarCircle handle={entry.handle} />
            <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{entry.handle}</span>
          </div>
          {entry.caption && (
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.72)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {entry.caption}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", flexShrink: 0 }}>
          <ActionBtn icon={liked ? "♥" : "♡"} count={likes}    active={liked}  onClick={handleLike} />
          <ActionBtn icon="💬"                  count={comments}               onClick={() => setShowComments(true)} />
          <ActionBtn icon="➤"                  count={shares}                 onClick={handleShare} />
          <ActionBtn icon="🔖"                                                  />
        </div>
      </div>

      {/* Comments overlay */}
      {showComments && <ThoughtsOverlay onClose={() => setShowComments(false)} />}
    </div>
  );
}

// ── Thumbnail (resting state in AtlasHQ slot) ─────────────────────────────────
export function ReelsThumbnail({ videos, onOpen }: { videos: VideoEntry[]; onOpen: () => void }) {
  const first = videos[0];
  if (!first) return null;

  const thumb = first.type === "youtube" && first.embedUrl ? youtubeThumbnail(first.embedUrl) : null;

  return (
    <div
      onClick={onOpen}
      style={{
        position: "relative", width: "100%", height: 140,
        background: "#000", cursor: "pointer", overflow: "hidden", flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {thumb ? (
        <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(0,0,0,0.8) 100%)" }} />
      )}
      {/* Gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
      {/* Play button */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)",
        }}>
          <span style={{ fontSize: 16, marginLeft: 3 }}>▶</span>
        </div>
      </div>
      {/* Title + count */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 12px" }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>{first.title}</p>
        <p style={{ margin: "2px 0 0", fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.45)" }}>
          {videos.length} video{videos.length !== 1 ? "s" : ""} · tap to watch
        </p>
      </div>
      {/* Reel pill */}
      <div style={{ position: "absolute", top: 10, right: 10, padding: "3px 8px", borderRadius: 10, background: "rgba(239,68,68,0.8)", border: "1px solid rgba(239,68,68,0.9)" }}>
        <span style={{ fontSize: 8, fontFamily: "monospace", letterSpacing: "0.12em", color: "#fff", textTransform: "uppercase" }}>● reels</span>
      </div>
    </div>
  );
}

// ── Full ReelsPlayer ──────────────────────────────────────────────────────────
interface ReelsPlayerProps {
  onClose: () => void;
}

export default function ReelsPlayer({ onClose }: ReelsPlayerProps) {
  const [videos,      setVideos]      = useState<VideoEntry[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/videos")
      .then(r => r.json())
      .then((data: VideoEntry[]) => { setVideos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    setActiveIndex(idx);
  }, []);

  return (
    <div style={{
      position: "absolute",
      top: 72, left: 20, bottom: 20,
      width: 428,
      zIndex: 20,
      display: "flex",
      flexDirection: "column",
      borderRadius: 16,
      overflow: "hidden",
      background: "#000",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
    }}>
      {/* Header bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", flexShrink: 0,
        background: "rgba(4,6,18,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        zIndex: 5,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(239,68,68,0.8)", display: "inline-block" }} className="dot-pulse" />
          <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>atlas reels</span>
          {videos.length > 0 && (
            <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.22)" }}>
              {activeIndex + 1} / {videos.length}
            </span>
          )}
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 18, padding: 0, lineHeight: 1 }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>×</button>
      </div>

      {/* Snap-scroll reel feed */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1, overflowY: "auto", minHeight: 0,
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
        }}
      >
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(239,68,68,0.8)" }} className="dot-pulse" />
            <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em" }}>loading feed…</span>
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>no videos yet</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>upload at atlas.boston/admin/upload</p>
          </div>
        )}

        {videos.map((v, i) => (
          <div key={v.id} style={{ height: "100%", scrollSnapAlign: "start", flexShrink: 0 }}>
            <ReelCard entry={v} isActive={i === activeIndex} />
          </div>
        ))}
      </div>

      {/* Dot progress indicator */}
      {videos.length > 1 && (
        <div style={{
          position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
          display: "flex", flexDirection: "column", gap: 4, zIndex: 6, pointerEvents: "none",
        }}>
          {videos.map((_, i) => (
            <div key={i} style={{
              width: 4, height: i === activeIndex ? 12 : 4, borderRadius: 2,
              background: i === activeIndex ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
