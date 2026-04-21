"use client";
import { useState, useRef } from "react";
import { T, clr, confColor, dangerColor } from "../lib/tokens";

function relativeTime(ts: string): string {
  // Require ISO format (YYYY-MM-DD…) — rejects "Apr 19" before it even hits Date.parse
  if (!/^\d{4}-\d{2}-\d{2}/.test(ts)) return "";

  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";

  const now           = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateMidnight  = new Date(d.getFullYear(),   d.getMonth(),  d.getDate());
  const daysDiff      = Math.round((todayMidnight.getTime() - dateMidnight.getTime()) / 86400000);

  if (daysDiff <= 0) {
    // Same day → show exact time of report
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }
  if (daysDiff === 1) return "yesterday";
  return `${daysDiff} days ago`;
}

export interface AlertItem {
  time: string;
  text: string;
  description: string;
  danger: number;
  confidence: number;
  sources: string[];
  pulse?: boolean; // force heat-pulse dot regardless of danger level
}

interface Props {
  item: AlertItem;
  onSourceClick?: (s: string) => void;
  onClick?: () => void;
  bottomBorder?: boolean;
  defaultExpanded?: boolean;
  showConfidenceInline?: boolean;
  expandOnHover?: boolean;
  isActive?: boolean; // externally held open (e.g. confidence panel hovered)
  onHoverChange?: (hovered: boolean, anchorY: number) => void;
}

export default function LiveAlertRow({
  item, onSourceClick, onClick, bottomBorder,
  defaultExpanded, showConfidenceInline = true,
  expandOnHover = true, isActive, onHoverChange,
}: Props) {
  const [hovered,     setHovered]     = useState(defaultExpanded ?? false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const dot   = dangerColor(item.danger);
  const cc    = confColor(item.confidence);
  const isHot = item.danger >= 5 || (item.pulse ?? false);

  // Content is visible if row is hovered OR parent says keep it open
  const expanded = hovered || (isActive ?? false);

  const enter = () => {
    setHovered(true);
    // Apply 3D hover effect
    if (rowRef.current) {
      rowRef.current.style.transform = "scale(1.025) translateY(-4px) rotateX(1deg)";
      rowRef.current.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3), 0 15px 30px rgba(0,0,0,0.2)";
      rowRef.current.style.zIndex = "5";
    }
    // Double rAF: wait for expansion render, then measure true vertical center
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (rowRef.current) {
          const rect = rowRef.current.getBoundingClientRect();
          onHoverChange?.(true, rect.top + rect.height / 2);
        }
      });
    });
  };

  const leave = () => {
    setHovered(false);
    // Remove 3D hover effect
    if (rowRef.current) {
      rowRef.current.style.transform = "scale(1) translateY(0) rotateX(0deg)";
      rowRef.current.style.boxShadow = "none";
      rowRef.current.style.zIndex = "1";
    }
    // Don't call onHoverChange(false) here — let parent's scheduleLeave handle
    // the delay so the confidence panel stays reachable
    onHoverChange?.(false, 0);
  };

  return (
    <div
      ref={rowRef}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onClick={onClick}
      style={{
        padding: "7px 8px",
        borderRadius: 8,
        cursor: onClick ? "pointer" : "default",
        background: expanded ? "rgba(255,255,255,0.04)" : "transparent",
        borderBottom: bottomBorder ? "1px solid rgba(255,255,255,0.04)" : "none",
        transition: "background 0.12s, transform 0.2s, box-shadow 0.2s",
        // Width matches the full expanded alert so hover zone covers body text
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      {/* Row: time · dot · headline */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{
          fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.32)",
          flexShrink: 0, width: 95, textAlign: "right", paddingTop: 1,
        }}>{relativeTime(item.time)}</span>

        <div
          style={{
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: 5,
            background: dot,
            boxShadow: `0 0 5px ${dot}88`,
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.86)" }}>
            {item.text}
          </span>

          {/* Expanded body — stays while row OR confidence panel hovered */}
          {expanded && expandOnHover && (
            <div>
              <p style={{
                margin: "8px 0 6px",
                fontSize: 13,
                color: "rgba(255,255,255,0.58)",
                lineHeight: 1.5,
              }}>
                {item.description}
              </p>
              {/* Provenance tag — alert bodies are summarized by the
                  model, kept visible so users see attribution. */}
              <div style={{
                marginBottom: 10,
                fontSize: 9, fontFamily: "monospace", letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.30)", textTransform: "uppercase",
              }}>Claude by Anthropic</div>

              {/* Inline confidence (CountryPanel doesn't use this — it uses floating panel) */}
              {showConfidenceInline && (
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 8, fontFamily: T.MONO, letterSpacing: T.TRACK_MED, color: clr.white(0.40), minWidth: 52 }}>confidence</span>
                  <div
                    onMouseEnter={() => setSourcesOpen(true)}
                    onMouseLeave={() => setSourcesOpen(false)}
                    style={{ width: 80, height: 4, borderRadius: T.PILL_RADIUS, background: clr.white(0.10), overflow: "hidden", cursor: "pointer" }}
                  >
                    <div style={{ width: `${item.confidence}%`, height: "100%", borderRadius: T.PILL_RADIUS, background: cc, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 9, fontFamily: T.MONO, fontWeight: 700, color: cc, minWidth: 28 }}>{item.confidence}%</span>
                  {sourcesOpen && (
                    <div
                      onMouseEnter={() => setSourcesOpen(true)}
                      onMouseLeave={() => setSourcesOpen(false)}
                      style={{ display: "flex", gap: 4, marginLeft: 2 }}
                    >
                      {item.sources.map(s => (
                        <button key={s}
                          onClick={e => { e.stopPropagation(); onSourceClick?.(s); }}
                          onMouseEnter={e => { e.currentTarget.style.background = clr.white(0.14); e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = T.PILL_BG; e.currentTarget.style.color = clr.white(0.65); }}
                          style={{ fontSize: 9, fontFamily: T.MONO, letterSpacing: T.TRACK_TIGHT, padding: "2px 7px", borderRadius: T.PILL_RADIUS, cursor: "pointer", background: T.PILL_BG, border: T.PILL_BORDER, color: clr.white(0.72) }}
                        >{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
