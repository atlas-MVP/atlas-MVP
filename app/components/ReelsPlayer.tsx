"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { VideoEntry } from "../lib/r2";
import { readReelResume } from "../lib/reelResume";

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

// Stroke-based SVG glyphs. All drawn on a square 24×24 canvas so the rail
// lines up no matter which shape is shown. Active state just toggles the
// stroke opacity — we don't fill, the icons stay line-art.
const Glyph = {
  heart: (
    <path d="M12 20s-6.5-4.2-6.5-9A3.8 3.8 0 0 1 12 8.4 3.8 3.8 0 0 1 18.5 11c0 4.8-6.5 9-6.5 9Z"
      fill="none" strokeLinejoin="round" strokeLinecap="round" />
  ),
  comment: (
    <path d="M5 6h14v9H9l-4 3.5V6Z"
      fill="none" strokeLinejoin="round" strokeLinecap="round" />
  ),
  share: (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <path d="M4 12 20 5l-4 15-4-6-8-2Z" />
    </g>
  ),
  save: (
    <path d="M7 4h10v16l-5-3.2L7 20Z"
      fill="none" strokeLinejoin="round" strokeLinecap="round" />
  ),
};

function ActionBtn({ glyph, count, active, onClick }: {
  glyph: keyof typeof Glyph;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}) {
  const stroke = active ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.72)";
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
      background: "none", border: "none", cursor: "pointer", padding: 0,
      width: 32,
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "transparent",
        border: `1px solid ${active ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.14)"}`,
        transition: "border-color 0.2s",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" stroke={stroke} strokeWidth={1.5}>
          {Glyph[glyph]}
        </svg>
      </span>
      {count !== undefined && (
        <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.42)", letterSpacing: "0.04em" }}>
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
// Three render modes, all living in the same 428-wide reel container:
//   • type "video"   → full-bleed video + Atlas chrome (header/handle/caption/actions overlay)
//   • type "youtube" → YouTube player fitted 16:9 on black, NO Atlas chrome on the media
//                      (YouTube already shows its own title + channel + date). Action rail only.
//   • type "tweet"   → Twitter embed centered on dark bg, scrolls internally if tall.
//                      (Tweet already shows its own handle + avatar + text + date.) Action rail only.
// The action rail (like/comment/share/save) is Atlas-native so it sits on every reel type.
function ReelCard({ entry, isActive }: { entry: VideoEntry; isActive: boolean }) {
  const videoRef             = useRef<HTMLVideoElement>(null);
  const [liked,   setLiked]  = useState(false);
  const [likes,   setLikes]  = useState(() => Math.floor(Math.random() * 2000) + 100);
  const [shares]             = useState(() => Math.floor(Math.random() * 500)  + 20);
  const [comments]           = useState(MOCK_COMMENTS.length);
  const [saved,   setSaved]  = useState(false);
  const [showComments, setShowComments] = useState(false);

  const isVideo   = entry.type === "video";
  const isYoutube = entry.type === "youtube" && !!entry.embedUrl;
  const isTweet   = entry.type === "tweet"   && !!entry.embedUrl;

  // Atlas chrome rules:
  //   • self-hosted videos always get Atlas chrome (they have no built-in caption/handle)
  //   • embeds (YouTube / tweet / direct URL) get Atlas chrome ONLY if the admin
  //     filled in at least one metadata field — otherwise let the embed breathe
  //     with its own native chrome.
  const hasAtlasMeta  = !!(entry.title || entry.caption || entry.handle || entry.location || entry.date);
  const showAtlasChrome = isVideo || hasAtlasMeta;

  // Auto-play/pause the self-hosted video element based on visibility.
  // On first play, seek to the handoff timestamp from the AtlasHQ preview
  // (set via setReelResume) so the video continues from the exact same frame.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      const resumeAt = readReelResume(entry.id);
      if (resumeAt !== null) {
        const seek = () => { try { v.currentTime = resumeAt; } catch {} };
        if (v.readyState >= 1) seek();
        else v.addEventListener("loadedmetadata", seek, { once: true });
      }
      // The preview played muted; tapping is a user gesture so we can now unmute.
      v.muted = false;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isActive, entry.id]);

  const handleLike  = () => { setLiked(l => !l); setLikes(n => liked ? n - 1 : n + 1); };
  const handleShare = () => {
    const url = `${window.location.origin}/?reel=${entry.id}`;
    if (navigator.share) navigator.share({ title: entry.title, text: entry.caption, url }).catch(() => {});
    else navigator.clipboard.writeText(url);
  };

  // ── Media: each type fits the container differently, visuals are their own ──
  const renderMedia = () => {
    if (isYoutube) {
      // 16:9 fitted center, black letterbox. Let YouTube show its native title/channel/controls.
      const id = youtubeId(entry.embedUrl!);
      return (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
          <div style={{ width: "100%", aspectRatio: "16 / 9", maxHeight: "100%" }}>
            <iframe
              src={`https://www.youtube.com/embed/${id}?autoplay=${isActive ? 1 : 0}&mute=${isActive ? 1 : 0}&controls=1&rel=0&modestbranding=1&playsinline=1`}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            />
          </div>
        </div>
      );
    }
    if (isTweet) {
      // Twitter's embed carries its own avatar/handle/text/date. We just host it on a dark
      // backdrop, centered, with internal scroll if the tweet is tall.
      const id = tweetId(entry.embedUrl!);
      return (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at top, #0e1524 0%, #000 70%)",
          overflowY: "auto",
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          padding: "32px 14px 90px",
        }}>
          <iframe
            src={`https://platform.twitter.com/embed/Tweet.html?id=${id}&theme=dark&dnt=true&hideCard=false&hideThread=true&chrome=nofooter`}
            style={{
              width: "100%", maxWidth: 380, minHeight: 560,
              border: "none", display: "block",
              background: "transparent",
              borderRadius: 14,
            }}
            scrolling="no"
            allow="clipboard-write"
          />
        </div>
      );
    }
    // Self-hosted video
    return (
      <video
        ref={videoRef}
        src={entry.signedUrl}
        loop playsInline muted={false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000", display: "block" }}
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
      {/* Media layer */}
      {renderMedia()}

      {/* ── Atlas chrome — self-hosted videos always; embeds only if metadata was supplied ── */}
      {showAtlasChrome && (
        <>
          {/* Header overlay — only renders if title/date/location present */}
          {(entry.title || entry.date || entry.location) && (
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              padding: "10px 12px 12px",
              background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)",
              display: "flex", alignItems: "flex-start", justifyContent: "space-between",
              pointerEvents: "none",
            }}>
              <div>
                {entry.title && <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{entry.title}</p>}
                {entry.date  && <p style={{ margin: "2px 0 0", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.65)", letterSpacing: "0.04em" }}>{entry.date}</p>}
              </div>
              {entry.location && (
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ fontSize: 10 }}>📍</span>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.65)", letterSpacing: "0.04em" }}>{entry.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Bottom handle + caption — only renders if handle or caption present */}
          {(entry.handle || entry.caption) && (
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: "48px 72px 14px 12px", // right padding leaves room for the action rail
              background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
              pointerEvents: "none",
            }}>
              {entry.handle && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <AvatarCircle handle={entry.handle} />
                  <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{entry.handle}</span>
                </div>
              )}
              {entry.caption && (
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.72)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {entry.caption}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Action rail — universal, floats over all three reel types ────────── */}
      <div style={{
        position: "absolute", right: 10, bottom: 14,
        display: "flex", flexDirection: "column", gap: 16, alignItems: "center",
        zIndex: 5,
        // Subtle scrim behind icons on embed types so they stay readable
        ...((!isVideo) ? {
          padding: "10px 6px",
          borderRadius: 24,
          background: "rgba(0,0,0,0.28)",
          backdropFilter: "blur(6px)",
        } : {}),
      }}>
        <ActionBtn glyph="heart"   count={likes}    active={liked} onClick={handleLike} />
        <ActionBtn glyph="comment" count={comments}                onClick={() => setShowComments(true)} />
        <ActionBtn glyph="share"   count={shares}                  onClick={handleShare} />
        <ActionBtn glyph="save"                                    active={saved} onClick={() => setSaved(s => !s)} />
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
    </div>
  );
}

// ── Full ReelsPlayer ──────────────────────────────────────────────────────────
interface ReelsPlayerProps {
  onClose: () => void;
  /** If set, scroll directly to this reel on mount and start playing. Used
   *  by the /?reel=<id> deep link from the share action. */
  initialReelId?: string | null;
}

export default function ReelsPlayer({ onClose, initialReelId }: ReelsPlayerProps) {
  const [videos,      setVideos]      = useState<VideoEntry[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/videos?scope=reels")
      .then(r => r.json())
      .then((data: VideoEntry[]) => { setVideos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Jump to the shared reel once videos are loaded.
  useEffect(() => {
    if (!initialReelId || videos.length === 0) return;
    const idx = videos.findIndex(v => v.id === initialReelId);
    if (idx < 0) return;
    const el = scrollRef.current;
    if (!el) return;
    // setTimeout 0 so layout settles before scrolling.
    const t = setTimeout(() => {
      el.scrollTo({ top: idx * el.clientHeight, behavior: "auto" });
      setActiveIndex(idx);
    }, 0);
    return () => clearTimeout(t);
  }, [initialReelId, videos]);

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
      {/* Minimal close affordance — no branding text. Sits as a floating
          button so the reel media can go edge-to-edge behind it. */}
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 10, right: 10, zIndex: 12,
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1,
          cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(0,0,0,0.55)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(0,0,0,0.4)"; }}
      >×</button>

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
