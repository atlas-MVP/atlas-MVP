"use client";
import React, { useState, useEffect } from "react";

type SubPanel = "you" | "us" | "methodology" | "settings";

interface NavItem {
  id: SubPanel;
  label: string;
  hint: string;
}

const ITEMS: NavItem[] = [
  { id: "you",         label: "You",         hint: "Profile & account" },
  { id: "us",          label: "Us",          hint: "About Atlas & team" },
  { id: "methodology", label: "Methodology", hint: "Scoring · Verification · Data · Security" },
  { id: "settings",    label: "Settings",    hint: "Preferences & display" },
];

function NavRow({ item, delay, onOpen }: { item: NavItem; delay: number; onOpen: (id: SubPanel) => void }) {
  const [lit, setLit] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLit(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <button
      onClick={() => onOpen(item.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        background: hovered ? "rgba(255,255,255,0.04)" : "transparent",
        border: "none",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        cursor: "pointer",
        padding: "11px 14px",
        borderRadius: hovered ? 8 : 0,
        transition: "background 0.15s",
        opacity: lit ? 1 : 0,
        transform: lit ? "translateX(0)" : "translateX(-6px)",
        // transition handled separately
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{
          fontSize: 14,
          fontFamily: "monospace",
          letterSpacing: "0.06em",
          color: hovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.82)",
          fontWeight: 500,
          transition: "color 0.12s",
        }}>
          {item.label}
        </span>
        <span style={{
          fontSize: 10,
          fontFamily: "monospace",
          letterSpacing: "0.06em",
          color: "rgba(255,255,255,0.28)",
        }}>
          {item.hint}
        </span>
      </div>
      <span style={{
        fontSize: 11,
        fontFamily: "monospace",
        color: hovered ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)",
        transition: "color 0.12s, transform 0.12s",
        transform: hovered ? "translateX(2px)" : "translateX(0)",
        display: "inline-block",
      }}>→</span>
    </button>
  );
}

interface Props {
  onClose: () => void;
  onOpen: (panel: SubPanel) => void;
}

export default function SettingsPanel({ onClose, onOpen }: Props) {
  return (
    <div style={{
      position: "absolute",
      top: 52, left: 20,
      zIndex: 20,
      width: 360,
      background: "rgba(4,6,18,0.62)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16,
      backdropFilter: "blur(40px)",
      WebkitBackdropFilter: "blur(40px)",
      boxShadow: "0 24px 80px rgba(0,0,0,0.38), 0 1px 3px rgba(0,0,0,0.18)",
      overflow: "hidden",
      pointerEvents: "auto",
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.22em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
          ATLAS
        </span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", fontSize: 14, lineHeight: 1, padding: "0 2px" }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
        >×</button>
      </div>

      {/* Nav items */}
      <div style={{ padding: "4px 6px 6px" }}>
        {ITEMS.map((item, i) => (
          <NavRow key={item.id} item={item} delay={i * 60} onOpen={onOpen} />
        ))}
      </div>

    </div>
  );
}
