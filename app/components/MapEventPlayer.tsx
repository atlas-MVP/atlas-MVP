"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { MapEvent, MapEventStep } from "../lib/mapEvents";

interface Props {
  event: MapEvent | null;
  onFlyTo: (center: [number, number], zoom: number, duration?: number) => void;
  onHighlight: (isoCodes: string[]) => void;
  onStrikes: (strikes: { lng: number; lat: number; side: "amber" | "crimson"; label?: string }[], center: [number, number], zoom: number) => void;
  onDone: () => void;
}

export default function MapEventPlayer({ event, onFlyTo, onHighlight, onStrikes, onDone }: Props) {
  const [stepIdx, setStepIdx] = useState(-1);
  const [narration, setNarration] = useState<string | null>(null);
  const [popup, setPopup] = useState<MapEventStep["popup"] | null>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pausedRef = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach(t => clearTimeout(t));
    timers.current = [];
  }, []);

  // Reset when event changes
  useEffect(() => {
    clearTimers();
    setStepIdx(-1);
    setNarration(null);
    setPopup(null);
    setPaused(false);
    pausedRef.current = false;
    if (event) {
      setPlaying(true);
      // Start first step after brief delay
      const t = setTimeout(() => setStepIdx(0), 300);
      timers.current.push(t);
    } else {
      setPlaying(false);
    }
    return clearTimers;
  }, [event, clearTimers]);

  // Execute current step
  useEffect(() => {
    if (!event || stepIdx < 0 || stepIdx >= event.steps.length) return;
    const step = event.steps[stepIdx];

    const execute = () => {
      // Camera
      if (step.flyTo) {
        onFlyTo(step.flyTo.center, step.flyTo.zoom, step.flyTo.duration ?? 1600);
      }

      // Highlights
      if (step.highlight) {
        onHighlight(step.highlight);
      }

      // Strikes
      if (step.strikes && step.flyTo) {
        onStrikes(step.strikes, step.flyTo.center, step.flyTo.zoom);
      } else if (step.strikes) {
        // Use first strike as center
        const s = step.strikes[0];
        onStrikes(step.strikes, [s.lng, s.lat], 6);
      }

      // Popup
      if (step.dismissPopup) {
        setPopup(null);
      }
      if (step.popup) {
        setPopup(step.popup);
      }

      // Narration
      if (step.narration) {
        setNarration(step.narration);
      }

      // Auto-advance after hold
      const hold = step.hold ?? 3000;
      const t = setTimeout(() => {
        if (pausedRef.current) return; // paused — don't advance
        if (stepIdx + 1 < event.steps.length) {
          setStepIdx(stepIdx + 1);
        } else {
          // Done
          setNarration(null);
          setPopup(null);
          setPlaying(false);
          onHighlight([]);
          onStrikes([], [0, 0], 2);
          onDone();
        }
      }, hold);
      timers.current.push(t);
    };

    // Delay before executing
    if (step.delay && step.delay > 0) {
      const t = setTimeout(execute, step.delay);
      timers.current.push(t);
    } else {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, event]);

  const handlePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(p => !p);
    // If unpausing, advance to next step
    if (!pausedRef.current && event && stepIdx + 1 < event.steps.length) {
      setStepIdx(s => s + 1);
    }
  };

  const handleStop = () => {
    clearTimers();
    setStepIdx(-1);
    setNarration(null);
    setPopup(null);
    setPlaying(false);
    setPaused(false);
    pausedRef.current = false;
    onHighlight([]);
    onStrikes([], [0, 0], 2);
    onDone();
  };

  if (!playing || !event) return null;

  const progress = event.steps.length > 0 ? (stepIdx + 1) / event.steps.length : 0;

  return (
    <>
      {/* Bottom narration bar */}
      {narration && (
        <div style={{
          position: "fixed", bottom: 48, left: "50%", transform: "translateX(-50%)",
          maxWidth: 600, width: "90%", zIndex: 50, pointerEvents: "none",
        }}>
          <div style={{
            background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
            padding: "12px 20px", textAlign: "center",
          }}>
            <p style={{
              margin: 0, fontSize: 13, fontFamily: "monospace", letterSpacing: "0.04em",
              color: "rgba(255,255,255,0.85)", lineHeight: 1.5,
            }}>
              {narration}
            </p>
          </div>
        </div>
      )}

      {/* Video/image popup */}
      {popup && (
        <div style={{
          position: "fixed", top: 80, right: 20, width: 340, zIndex: 50,
          background: "rgba(0,0,0,0.92)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
          overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}>
          {/* Video embed */}
          {popup.videoUrl && (
            <div style={{ width: "100%", aspectRatio: "16/9", background: "#000" }}>
              <iframe
                src={popup.videoUrl}
                style={{ width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {/* Image */}
          {!popup.videoUrl && popup.imageUrl && (
            <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={popup.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          {/* Text content */}
          <div style={{ padding: "12px 16px" }}>
            <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
              {popup.title}
            </p>
            {popup.body && (
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, fontStyle: "italic" }}>
                {popup.body}
              </p>
            )}
            {popup.sourceLabel && (
              <p style={{ margin: 0, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.08em", color: "rgba(255,255,255,0.25)" }}>
                {popup.sourceUrl ? (
                  <a href={popup.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
                    {popup.sourceLabel} ↗
                  </a>
                ) : popup.sourceLabel}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Playback controls — top center */}
      <div style={{
        position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
        zIndex: 55, display: "flex", alignItems: "center", gap: 10,
      }}>
        {/* Title pill */}
        <div style={{
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20,
          padding: "6px 16px", display: "flex", alignItems: "center", gap: 10,
        }}>
          {/* Live dot */}
          <span className="dot-pulse" style={{
            width: 6, height: 6, borderRadius: "50%", background: "#ef4444",
            display: "inline-block", flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
            {event.title}
          </span>
          {/* Progress */}
          <div style={{ width: 60, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", background: "rgba(239,68,68,0.6)", transition: "width 0.5s ease", borderRadius: 2 }} />
          </div>
          {/* Pause/Play */}
          <button
            onClick={handlePause}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "rgba(255,255,255,0.5)", fontSize: 12 }}
          >
            {paused ? "▶" : "⏸"}
          </button>
          {/* Stop */}
          <button
            onClick={handleStop}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}
