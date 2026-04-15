"use client";
import { useState, useRef } from "react";

export interface AlertItem {
  time: string;
  text: string;
  description: string;
  danger: number;
  confidence: number;
  sources: string[];
  pulse?: boolean; // force heat-pulse dot regardless of danger level
}

function dangerDot(d: number) {
  if (d >= 4) return "#6d28d9";
  if (d >= 3) return "#4338ca";
  if (d >= 2) return "#1d4ed8";
  return "#1e3a8a";
}

function confColor(c: number) {
  if (c >= 90) return "#22c55e";
  if (c >= 80) return "#86efac";
  if (c >= 70) return "#fbbf24";
  return "#f87171";
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

  const dot   = dangerDot(item.danger);
  const cc    = confColor(item.confidence);
  const isHot = item.danger >= 5 || (item.pulse ?? false);

  // Content is visible if row is hovered OR parent says keep it open
  const expanded = hovered || (isActive ?? false);

  const enter = () => {
    setHovered(true);
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
        transition: "background 0.12s",
        // Width matches the full expanded alert so hover zone covers body text
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      {/* Row: time · dot · headline */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{
          fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.22)",
          flexShrink: 0, width: 42, textAlign: "right", paddingTop: 1,
        }}>{item.time}</span>

        <div
          style={{
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: 5,
            background: dot,
            boxShadow: `0 0 5px ${dot}88`,
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13, lineHeight: 1.4, color: "rgba(255,255,255,0.78)" }}>
            {item.text}
          </span>

          {/* Expanded details — shown when row OR confidence panel is hovered */}
          {expanded && expandOnHover && (
            <div>
              <p style={{
                margin: "8px 0 10px",
                fontSize: 12,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.5,
              }}>
                {item.description}
              </p>

              {/* Inline confidence (CountryPanel doesn't use this — it uses floating panel) */}
              {showConfidenceInline && (
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 7, fontFamily: "monospace", letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)", minWidth: 52 }}>confidence</span>
                  <div
                    onMouseEnter={() => setSourcesOpen(true)}
                    onMouseLeave={() => setSourcesOpen(false)}
                    style={{ width: 80, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.10)", overflow: "hidden", cursor: "pointer" }}
                  >
                    <div style={{ width: `${item.confidence}%`, height: "100%", borderRadius: 99, background: cc, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 8, fontFamily: "monospace", fontWeight: 700, color: cc, minWidth: 28 }}>{item.confidence}%</span>
                  {sourcesOpen && (
                    <div
                      onMouseEnter={() => setSourcesOpen(true)}
                      onMouseLeave={() => setSourcesOpen(false)}
                      style={{ display: "flex", gap: 4, marginLeft: 2 }}
                    >
                      {item.sources.map(s => (
                        <button key={s}
                          onClick={e => { e.stopPropagation(); onSourceClick?.(s); }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
                          style={{ fontSize: 8, fontFamily: "monospace", letterSpacing: "0.08em", padding: "2px 7px", borderRadius: 99, cursor: "pointer", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.65)" }}
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
