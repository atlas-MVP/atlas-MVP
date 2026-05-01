"use client";

import { useState } from "react";
import type { IssueCategory, Subcategory, BillRecord } from "../api/senator-alignment/[bioguide]/route";

// ─── Score helpers ────────────────────────────────────────────────────────────

// Subcategory score: binary aligned average (0–100), used for display only.
function computeSubScore(sub: Subcategory): number {
  if (!sub.bills.length) return 0;
  return Math.round(sub.bills.reduce((s, b) => s + (b.aligned ? 100 : 0), 0) / sub.bills.length);
}

// Color uses normalized 0–100 percentage regardless of raw scale.
function scoreColor(score: number, max = 100): string {
  const pct = (score / max) * 100;
  if (pct >= 67) return "#22c55e";
  if (pct >= 40) return "#f59e0b";
  return "#ef4444";
}

// ─── Slider ───────────────────────────────────────────────────────────────────

function Slider({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  const color = scoreColor(score);
  return (
    <div style={{ position: "relative", height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", flex: 1, minWidth: 0 }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: `${pct}%`, borderRadius: 999,
        background: color, opacity: 0.7,
        transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)",
      }} />
      <div style={{
        position: "absolute",
        left: `${pct}%`, top: "50%",
        transform: "translate(-50%, -50%)",
        width: 13, height: 13, borderRadius: "50%",
        background: color,
        border: "2px solid rgba(4,6,18,0.95)",
        boxShadow: `0 0 6px ${color}70`,
        zIndex: 1,
      }} />
    </div>
  );
}

// ─── Bill row ─────────────────────────────────────────────────────────────────

function BillRow({ bill }: { bill: BillRecord }) {
  const [descVisible, setDescVisible] = useState(false);
  const [locked, setLocked] = useState(false);

  const show = locked || descVisible;

  return (
    <div
      onMouseEnter={() => { if (!locked) setDescVisible(true); }}
      onMouseLeave={() => { if (!locked) setDescVisible(false); }}
      onClick={() => setLocked(l => !l)}
      style={{ cursor: "pointer", paddingBottom: 2 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, paddingTop: 8, paddingBottom: 4 }}>
        {/* Aligned dot */}
        <div style={{
          width: 5, height: 5, borderRadius: "50%", flexShrink: 0, marginTop: 5,
          background: bill.aligned ? "#22c55e" : "#ef4444",
          boxShadow: `0 0 5px ${bill.aligned ? "#22c55e" : "#ef4444"}80`,
        }} />

        {/* Title */}
        <span style={{
          flex: 1, fontSize: 12,
          fontFamily: "'Times New Roman', Times, serif",
          fontWeight: 400, color: "rgba(255,255,255,0.82)",
          lineHeight: 1.4, textTransform: "none", letterSpacing: "0.01em",
        }}>
          {bill.title}
        </span>

        {/* see vote */}
        <a
          href={`/senatebill/${bill.id}`}
          target="_blank"
          rel="noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            flexShrink: 0, fontSize: 9, fontFamily: "monospace",
            letterSpacing: "0.08em", color: "rgba(96,165,250,0.6)",
            textDecoration: "none", whiteSpace: "nowrap", marginTop: 2,
            padding: "1px 5px",
            border: "1px solid rgba(96,165,250,0.2)", borderRadius: 3,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "rgba(96,165,250,0.95)"; e.currentTarget.style.borderColor = "rgba(96,165,250,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(96,165,250,0.6)"; e.currentTarget.style.borderColor = "rgba(96,165,250,0.2)"; }}
        >
          see vote ↗
        </a>
      </div>

      {/* Description */}
      <div style={{
        overflow: "hidden",
        maxHeight: show ? 80 : 0,
        opacity: show ? 1 : 0,
        transition: "max-height 0.2s ease, opacity 0.18s ease",
        paddingLeft: 11,
      }}>
        <p style={{
          margin: 0, fontSize: 11,
          fontFamily: "'Times New Roman', Times, serif",
          fontStyle: "italic", color: "rgba(255,255,255,0.38)",
          lineHeight: 1.5, textTransform: "none", letterSpacing: "0.01em", paddingBottom: 6,
        }}>
          {bill.description}
        </p>
      </div>
    </div>
  );
}

// ─── Subcategory row ──────────────────────────────────────────────────────────

function SubcategoryRow({ sub }: { sub: Subcategory }) {
  const [open, setOpen] = useState(false);
  const score = computeSubScore(sub);  // binary 0–100 display indicator
  const color = scoreColor(score);

  return (
    <div style={{ marginBottom: 2 }}>
      {/* Clickable header: label left, large score right */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px 8px 16px",
          cursor: "pointer",
          borderRadius: 8,
          background: open ? "rgba(255,255,255,0.04)" : "transparent",
          transition: "background 0.15s",
        }}
      >
        <span style={{
          fontSize: 9, fontFamily: "monospace", letterSpacing: "0.09em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
        }}>
          {sub.label}
        </span>

        <span style={{
          fontSize: 30, fontWeight: 700, lineHeight: 1,
          color, letterSpacing: "-0.03em",
          textShadow: `0 0 20px ${color}50`,
        }}>
          {score}
        </span>
      </div>

      {/* Bills */}
      <div style={{
        overflow: "hidden",
        maxHeight: open ? 800 : 0,
        transition: "max-height 0.25s ease",
        paddingLeft: 16, paddingRight: 8,
        borderLeft: open ? `2px solid ${color}30` : "2px solid transparent",
        marginLeft: 16,
      }}>
        {sub.bills.map(bill => (
          <BillRow key={bill.id} bill={bill} />
        ))}
        <div style={{ height: 6 }} />
      </div>
    </div>
  );
}

// ─── Category block ───────────────────────────────────────────────────────────

function CategoryBlock({ cat }: { cat: IssueCategory }) {
  const [open, setOpen] = useState(false);
  const score = cat.score;            // pre-computed weighted 0–67 from score engine
  const color = scoreColor(score, 67);

  return (
    <div style={{
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      paddingBottom: open ? 8 : 0,
    }}>
      {/* Always-visible header: label + slider + score */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: "12px 12px 10px",
          cursor: "pointer",
        }}
      >
        {/* Label row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 8,
        }}>
          <span style={{
            fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: open ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)",
            transition: "color 0.15s",
          }}>
            {cat.label}
          </span>
          <span style={{
            fontSize: 8, fontFamily: "monospace",
            color: "rgba(255,255,255,0.2)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            display: "inline-block",
          }}>▼</span>
        </div>

        {/* Score only — slider removed */}
        <span style={{
          fontSize: 16, fontWeight: 700,
          color, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums",
        }}>
          {score}
        </span>
      </div>

      {/* Subcategories */}
      <div style={{
        overflow: "hidden",
        maxHeight: open ? 2000 : 0,
        transition: "max-height 0.28s ease",
        paddingLeft: 4, paddingRight: 4,
      }}>
        {cat.subcategories.map(sub => (
          <SubcategoryRow key={sub.id} sub={sub} />
        ))}
      </div>
    </div>
  );
}

// ─── Section divider ──────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 12px 4px",
    }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
      <span style={{
        fontSize: 8, fontFamily: "monospace", letterSpacing: "0.22em",
        color: "rgba(255,255,255,0.2)", textTransform: "uppercase",
        whiteSpace: "nowrap", flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function IssueScoreSection({
  globalIssues,
  domesticIssues,
  overall,
}: {
  globalIssues: IssueCategory[];
  domesticIssues: IssueCategory[];
  overall: number;   // weighted 0–67 from score engine
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      {/* Single overall alignment slider */}
      <div style={{ padding: "16px 12px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
            Overall Alignment
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: scoreColor(overall, 67), letterSpacing: "-0.02em" }}>
            {Math.round(overall)}
          </span>
        </div>
        <Slider score={overall} max={67} />
      </div>

      <SectionDivider label="Global Issues" />
      {globalIssues.map(cat => <CategoryBlock key={cat.id} cat={cat} />)}

      <SectionDivider label="Domestic Issues" />
      {domesticIssues.map(cat => <CategoryBlock key={cat.id} cat={cat} />)}
    </div>
  );
}
