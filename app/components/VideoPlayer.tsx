"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface VideoPlayerProps {
  src: string;
  /** When true, auto-plays. When false, pauses and resets. */
  isActive?: boolean;
}

function fmt(secs: number) {
  if (!isFinite(secs) || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({ src, isActive = false }: VideoPlayerProps) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying]           = useState(false);
  const [progress, setProgress]         = useState(0);       // 0-100
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);
  const [muted, setMuted]               = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // ── Auto-play / pause when slide becomes active/inactive ──
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      v.play().catch(() => {}); // blocked by browser autoplay policy → user taps ▶
    } else {
      v.pause();
      v.currentTime = 0;
      setProgress(0);
      setCurrentTime(0);
      setPlaying(false);
    }
  }, [isActive]);

  // ── Controls auto-hide ──
  const bumpControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 2500);
  }, []);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  // ── Handlers ──
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setCurrentTime(v.currentTime);
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
    bumpControls();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else v.requestFullscreen();
  };

  const controlsShown = controlsVisible || !playing;

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%", background: "#000", cursor: "pointer" }}
      onMouseMove={bumpControls}
      onMouseEnter={bumpControls}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setProgress(0); setCurrentTime(0); if (videoRef.current) videoRef.current.currentTime = 0; }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
      />

      {/* Gradient + controls bar */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "28px 10px 8px",
          background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 100%)",
          opacity: controlsShown ? 1 : 0,
          transition: "opacity 0.35s ease",
          pointerEvents: controlsShown ? "auto" : "none",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          onClick={handleSeek}
          style={{
            height: 3, background: "rgba(255,255,255,0.18)", borderRadius: 2,
            cursor: "pointer", marginBottom: 8, position: "relative",
          }}
        >
          <div style={{
            position: "absolute", left: 0, top: 0, height: "100%",
            width: `${progress}%`,
            background: "rgba(239,68,68,0.85)",
            borderRadius: 2,
          }} />
          {/* Scrubber thumb */}
          <div style={{
            position: "absolute", top: "50%", left: `${progress}%`,
            transform: "translate(-50%, -50%)",
            width: 9, height: 9, borderRadius: "50%",
            background: "#fff", boxShadow: "0 0 4px rgba(0,0,0,0.6)",
            opacity: controlsShown ? 1 : 0,
          }} />
        </div>

        {/* Button row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Play / pause */}
          <button
            onClick={togglePlay}
            style={{
              fontSize: 11, color: "rgba(255,255,255,0.85)", background: "none",
              border: "none", cursor: "pointer", padding: "2px 4px", lineHeight: 1,
            }}
          >{playing ? "⏸" : "▶"}</button>

          {/* Mute */}
          <button
            onClick={toggleMute}
            style={{
              fontSize: 11, color: "rgba(255,255,255,0.45)", background: "none",
              border: "none", cursor: "pointer", padding: "2px 4px", lineHeight: 1,
            }}
          >{muted ? "🔇" : "🔊"}</button>

          <span style={{ flex: 1 }} />

          {/* Time */}
          <span style={{
            fontSize: 9, fontFamily: "monospace", letterSpacing: "0.05em",
            color: "rgba(255,255,255,0.4)",
          }}>
            {fmt(currentTime)} / {fmt(duration)}
          </span>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            style={{
              fontSize: 12, color: "rgba(255,255,255,0.35)", background: "none",
              border: "none", cursor: "pointer", padding: "2px 6px", lineHeight: 1,
            }}
          >⛶</button>
        </div>
      </div>

      {/* Centre play button when paused */}
      {!playing && (
        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "rgba(255,255,255,0.10)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 18, color: "rgba(255,255,255,0.88)", marginLeft: 4 }}>▶</span>
          </div>
        </div>
      )}
    </div>
  );
}
