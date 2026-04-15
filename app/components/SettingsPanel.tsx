"use client";
import { useState, useEffect } from "react";

const LINES = [
  { text: "ATLAS  —  intelligence map", dim: false },
  { text: "", dim: false },
  { text: "version  0.1.0", dim: true },
  { text: "data     Reuters · AP · ACLED · UN OCHA", dim: true },
  { text: "feed     real-time aggregation", dim: true },
  { text: "tracked  14 active conflicts", dim: true },
  { text: "coverage global", dim: true },
  { text: "", dim: false },
  { text: "© 2026  Atlas  all rights reserved", dim: true },
];

function TypeLine({ text, delay, dim }: { text: string; delay: number; dim: boolean }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!text) { const t = setTimeout(() => setDone(true), delay); return () => clearTimeout(t); }
    let i = 0;
    const start = setTimeout(() => {
      const tick = () => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i < text.length) setTimeout(tick, 22);
        else setDone(true);
      };
      tick();
    }, delay);
    return () => clearTimeout(start);
  }, [text, delay]);

  if (!text) return <div style={{ height: 10 }} />;

  return (
    <div style={{
      fontSize: 10, fontFamily: "monospace", letterSpacing: "0.12em",
      color: dim ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.72)",
      lineHeight: 2, whiteSpace: "pre",
    }}>
      {displayed}
      {!done && <span style={{ opacity: 0.45 }}>▌</span>}
    </div>
  );
}

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: "absolute",
      top: 72, left: 20,
      zIndex: 20,
      width: 340,
      background: "rgba(4,6,18,0.62)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16,
      backdropFilter: "blur(40px)",
      WebkitBackdropFilter: "blur(40px)",
      boxShadow: "0 24px 80px rgba(0,0,0,0.38), 0 1px 3px rgba(0,0,0,0.18)",
      padding: "22px 24px 20px",
      pointerEvents: "auto",
    }}>
      {LINES.map((line, i) => (
        <TypeLine key={i} text={line.text} delay={i * 180} dim={line.dim} />
      ))}
      <button
        onClick={onClose}
        style={{
          marginTop: 18,
          fontSize: 9, fontFamily: "monospace", letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.28)",
          background: "none", border: "none", cursor: "pointer", padding: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
      >ok</button>
    </div>
  );
}
