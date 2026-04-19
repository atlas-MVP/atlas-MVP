"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// Menu items surfaced when the user taps the Atlas logo. First item is the
// primary call-to-action — everything else is a quick link into the app.
const ITEMS: { text: string; href: string }[] = [
  { text: "upload videos", href: "/admin/upload" },
];

function TypeLine({ text, delay, href, onNavigate }: {
  text: string; delay: number; href: string; onNavigate: () => void;
}) {
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLit(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      style={{
        display: "block",
        fontSize: 14, fontFamily: "monospace", letterSpacing: "0.08em",
        color: lit ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0)",
        filter: lit ? "blur(0)" : "blur(4px)",
        transform: lit ? "translateY(0)" : "translateY(3px)",
        transition: "color 0.5s cubic-bezier(0.22,1,0.36,1), filter 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
        lineHeight: 2, whiteSpace: "pre",
        textDecoration: "none", cursor: "pointer",
        padding: "4px 0",
      }}
      onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,1)")}
      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.82)")}
    >
      {text} →
    </Link>
  );
}

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: "absolute",
      top: 72, left: 20,
      zIndex: 20,
      width: 360,
      background: "rgba(4,6,18,0.62)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16,
      backdropFilter: "blur(40px)",
      WebkitBackdropFilter: "blur(40px)",
      boxShadow: "0 24px 80px rgba(0,0,0,0.38), 0 1px 3px rgba(0,0,0,0.18)",
      padding: "18px 22px 16px",
      pointerEvents: "auto",
    }}>
      {ITEMS.map((item, i) => (
        <TypeLine key={i} text={item.text} delay={i * 90} href={item.href} onNavigate={onClose} />
      ))}
      <button
        onClick={onClose}
        style={{
          marginTop: 14,
          fontSize: 9, fontFamily: "monospace", letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.28)",
          background: "none", border: "none", cursor: "pointer", padding: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
      >close</button>
    </div>
  );
}
