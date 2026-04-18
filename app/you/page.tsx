"use client";

// atlas.boston/you — dead-simple Reels feed.
//
// Rules (from scratch, no conflicts):
//   1. Autoplay every video (muted — browser policy requires it).
//   2. CSS scroll-snap locks each reel to the viewport; you can never get
//      stuck between two.
//   3. Each reel renders at its native size, centered on the page.
//   4. Per-video loop (never stops replaying).
//   5. No chrome — no borders, buttons, or overlays. Just the media.
//   6. Off-screen reels pause (saves CPU, stops audio bleed).

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Clock from "../components/Clock";

type Reel = {
  id:        string;
  type:      "video" | "youtube" | "tweet";
  embedUrl?: string;
  signedUrl?: string;
  renderMode?: "embed" | "mp4";
};

// Declare Twitter's widgets.js global so TS stops complaining.
declare global {
  interface Window { twttr?: { widgets?: { load?: (el?: Element | null) => void } } }
}

function youtubeId(url: string) {
  return url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? "";
}
function tweetId(url: string) {
  return url.match(/status\/(\d+)/)?.[1] ?? "";
}

// Shared <video> style — native size, but capped to roughly the size of a
// YouTube watch-page video (≈ 65vw × 75vh) so even a huge native-resolution
// clip doesn't fill the whole screen.
const MAX_W = "65vw";
const MAX_H = "75vh";
const mediaStyle: React.CSSProperties = {
  maxWidth:  MAX_W,
  maxHeight: MAX_H,
  width:     "auto",
  height:    "auto",
  display:   "block",
};

// ── Self-hosted video ──────────────────────────────────────────────────────
// autoPlay on the element tag handles first-paint playback. preload="auto"
// forces the browser to load metadata + buffer immediately (without it the
// video sits at 0:00 until user gesture). The effect below handles the
// scroll-in / scroll-out transitions.
function SelfHostedReel({ src, isActive }: { src: string; isActive: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (isActive) v.play().catch(e => console.error("[SelfHostedReel.play]", e));
    else if (!v.paused) v.pause();
  }, [isActive, src]);
  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      controls
      preload="auto"
      style={mediaStyle}
    />
  );
}

// ── YouTube iframe ─────────────────────────────────────────────────────────
function YouTubeReel({ id, isActive }: { id: string; isActive: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null);
  // Pause via YouTube's postMessage API when off-screen.
  useEffect(() => {
    const w = ref.current?.contentWindow;
    if (!w) return;
    try {
      w.postMessage(
        JSON.stringify({ event: "command", func: isActive ? "playVideo" : "pauseVideo", args: [] }),
        "*",
      );
    } catch {}
  }, [isActive]);
  // 16:9 container sized to viewport. YouTube iframes can't render at "native
  // pixel size" — they always fill the given box — so we give them the largest
  // 16:9 box that fits.
  return (
    <div style={{
      width:     `min(${MAX_W}, calc(${MAX_H} * 16 / 9))`,
      aspectRatio: "16 / 9",
      maxHeight: MAX_H,
    }}>
      <iframe
        ref={ref}
        src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
        allow="autoplay; encrypted-media; picture-in-picture"
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
      />
    </div>
  );
}

// ── Tweet video (MP4 extracted via /api/tweet-video) ───────────────────────
function TweetReel({ tweetId: tid, isActive }: { tweetId: string; isActive: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src,  setSrc]  = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/tweet-video?id=${tid}`)
      .then(r => r.json())
      .then((d: { videoUrl?: string | null; width?: number | null; height?: number | null }) => {
        if (cancelled) return;
        if (d.videoUrl) setSrc(d.videoUrl);
        if (d.width && d.height) setDims({ w: d.width, h: d.height });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [tid]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (isActive) v.play().catch(e => console.error("[TweetReel.play]", e));
    else if (!v.paused) v.pause();
  }, [isActive, src]);

  if (!src) return null; // no chrome, no fallback — invisible card if fetch fails
  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      width={dims?.w}
      height={dims?.h}
      controls
      preload="auto"
      style={mediaStyle}
    />
  );
}

// ── Tweet EMBED (full widget: author + text + media, via widgets.js) ──────
// Opt-in per entry via renderMode: "embed". No autoplay — Twitter's own
// iframe requires a click. Use this when the tweet's text/context matters
// more than silent background playback.
function TweetEmbedReel({ tweetId: tid }: { tweetId: string; isActive: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject widgets.js once per page load.
    if (!document.querySelector('script[data-twttr="1"]')) {
      const s = document.createElement("script");
      s.src   = "https://platform.twitter.com/widgets.js";
      s.async = true;
      s.dataset.twttr = "1";
      document.body.appendChild(s);
    }
    // Tell widgets.js to scan this container for <blockquote class="twitter-tweet">.
    // Poll briefly because widgets.js may still be loading on first mount.
    let attempts = 0;
    const tick = () => {
      const load = window.twttr?.widgets?.load;
      if (load) load(hostRef.current);
      else if (attempts++ < 40) setTimeout(tick, 100);
    };
    tick();
  }, [tid]);

  return (
    <div
      ref={hostRef}
      style={{
        width:     "min(90vw, 550px)",  // Twitter's iframe caps at ~550px wide
        maxHeight: "85vh",
        overflowY: "auto",
      }}
      // Minimal blockquote — widgets.js fills it in with the full rendered tweet.
      dangerouslySetInnerHTML={{
        __html:
          `<blockquote class="twitter-tweet" data-dnt="true" data-theme="dark">` +
          `<a href="https://twitter.com/i/status/${tid}"></a>` +
          `</blockquote>`,
      }}
    />
  );
}

// ── One reel card ──────────────────────────────────────────────────────────
function ReelCard({ reel, onDelete }: { reel: Reel; onDelete: (id: string) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Per-card observer — no global "pick the winner" logic that could deadlock
  // between cards. If THIS card is at least 50% visible, it's active.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setIsActive(entry.intersectionRatio >= 0.5),
      { threshold: [0, 0.5, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  async function handleDelete() {
    if (deleting) return;
    if (!confirm("Delete this reel?")) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/upload?id=${encodeURIComponent(reel.id)}`, { method: "DELETE" });
      if (!r.ok) throw new Error(`delete ${r.status}`);
      onDelete(reel.id);
    } catch (e) {
      console.error("[ReelCard.delete]", e);
      setDeleting(false);
    }
  }

  return (
    <div
      ref={cardRef}
      style={{
        height: "100vh",
        width:  "100%",
        scrollSnapAlign: "start",
        scrollSnapStop:  "always",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {reel.type === "video"   && reel.signedUrl && <SelfHostedReel src={reel.signedUrl} isActive={isActive} />}
      {reel.type === "youtube" && reel.embedUrl   && <YouTubeReel   id={youtubeId(reel.embedUrl)} isActive={isActive} />}
      {reel.type === "tweet"   && reel.embedUrl   && (
        reel.renderMode === "embed"
          ? <TweetEmbedReel tweetId={tweetId(reel.embedUrl)} isActive={isActive} />
          : <TweetReel      tweetId={tweetId(reel.embedUrl)} isActive={isActive} />
      )}

      {/* Delete button — subtle × in top-right of the card, 0.4 opacity until hover. */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        title="delete reel"
        style={{
          position: "absolute", top: 16, right: 24, zIndex: 20,
          background: "rgba(0,0,0,0.35)", color: "rgba(255,255,255,0.85)",
          border: "none", borderRadius: 999,
          width: 28, height: 28, lineHeight: "28px", padding: 0,
          fontSize: 16, cursor: deleting ? "wait" : "pointer",
          opacity: deleting ? 0.5 : 0.4,
          transition: "opacity 120ms",
        }}
        onMouseEnter={e => { if (!deleting) e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={e => { if (!deleting) e.currentTarget.style.opacity = "0.4"; }}
      >
        ×
      </button>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function YouPage() {
  const router = useRouter();
  const [reels, setReels] = useState<Reel[]>([]);

  useEffect(() => {
    fetch("/api/videos?scope=reels", { cache: "no-store" })
      .then(r => r.json())
      .then((data: Reel[]) => setReels(Array.isArray(data) ? data : []))
      .catch(() => setReels([]));
  }, []);

  return (
    <main style={{
      width:  "100vw",
      height: "100vh",
      overflowY: "scroll",
      scrollSnapType: "y mandatory",
      background: "#000",
      // Hide scrollbar — cosmetic only, snap still works.
      scrollbarWidth: "none",
    }}>
      <style>{`main::-webkit-scrollbar{display:none}`}</style>

      {/* ATLAS wordmark — top-left, click to return to the map. */}
      <button
        onClick={() => router.push("/")}
        title="back to Atlas"
        style={{
          position: "fixed", top: 16, left: 24, zIndex: 30,
          background: "none", border: "none", cursor: "pointer", padding: 0,
        }}
      >
        <span className="font-light tracking-[0.3em] text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
          ATLAS
        </span>
      </button>

      {/* Clock — bottom-right, matches the main map's placement. */}
      <div style={{ position: "fixed", bottom: 16, right: 28, zIndex: 30 }}>
        <Clock />
      </div>

      {reels.map(r => (
        <ReelCard
          key={r.id}
          reel={r}
          onDelete={id => setReels(rs => rs.filter(x => x.id !== id))}
        />
      ))}
    </main>
  );
}
