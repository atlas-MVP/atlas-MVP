"use client";

import { useState } from "react";
import type { IssueCategoryScore, SubcategoryScore, BillRecord } from "../api/senator-alignment/[bioguide]/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 67) return "#22c55e";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

// ─── Slider ───────────────────────────────────────────────────────────────────

function Slider({ score, size = "normal" }: { score: number; size?: "normal" | "mini" }) {
  const pct = Math.max(0, Math.min(100, score));
  const color = scoreColor(score);
  const trackH = size === "normal" ? 7 : 4;
  const thumbD = size === "normal" ? 14 : 10;

  return (
    <div style={{
      position: "relative",
      height: trackH,
      borderRadius: 999,
      background: "rgba(255,255,255,0.08)",
      flex: 1,
      minWidth: 0,
    }}>
      {/* Fill */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: `${pct}%`, borderRadius: 999,
        background: color,
        opacity: 0.75,
        transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)",
      }} />
      {/* Thumb */}
      <div style={{
        position: "absolute",
        left: `${pct}%`, top: "50%",
        transform: "translate(-50%, -50%)",
        width: thumbD, height: thumbD, borderRadius: "50%",
        background: color,
        border: "2px solid rgba(4,6,18,0.95)",
        boxShadow: `0 0 7px ${color}70, 0 0 0 1.5px ${color}40`,
        transition: "left 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        zIndex: 1,
        flexShrink: 0,
      }} />
    </div>
  );
}

// ─── Bill row ─────────────────────────────────────────────────────────────────

function BillRow({
  bill,
  isDescriptionVisible,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  bill: BillRecord;
  isDescriptionVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}) {
  const aligned = bill.aligned;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{ cursor: "pointer", paddingBottom: 2 }}
    >
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, paddingTop: 8, paddingBottom: 4 }}>
        {/* Aligned dot */}
        <div style={{
          width: 5, height: 5, borderRadius: "50%", flexShrink: 0, marginTop: 5,
          background: aligned ? "#22c55e" : "#ef4444",
          boxShadow: `0 0 5px ${aligned ? "#22c55e" : "#ef4444"}80`,
        }} />

        {/* Title */}
        <span style={{
          flex: 1,
          fontSize: 12,
          fontFamily: "'Times New Roman', Times, serif",
          fontWeight: 400,
          color: "rgba(255,255,255,0.82)",
          lineHeight: 1.4,
          textTransform: "none",
          letterSpacing: "0.01em",
        }}>
          {bill.title}
        </span>

        {/* "see vote" link */}
        <a
          href={`/senatebill/${bill.id}`}
          target="_blank"
          rel="noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            flexShrink: 0,
            fontSize: 9,
            fontFamily: "monospace",
            letterSpacing: "0.08em",
            color: "rgba(96,165,250,0.6)",
            textDecoration: "none",
            whiteSpace: "nowrap",
            marginTop: 2,
            padding: "1px 5px",
            border: "1px solid rgba(96,165,250,0.2)",
            borderRadius: 3,
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = "rgba(96,165,250,0.95)";
            e.currentTarget.style.borderColor = "rgba(96,165,250,0.5)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "rgba(96,165,250,0.6)";
            e.currentTarget.style.borderColor = "rgba(96,165,250,0.2)";
          }}
        >
          see vote ↗
        </a>
      </div>

      {/* Hover description */}
      <div style={{
        overflow: "hidden",
        maxHeight: isDescriptionVisible ? 80 : 0,
        opacity: isDescriptionVisible ? 1 : 0,
        transition: "max-height 0.2s ease, opacity 0.2s ease",
        paddingLeft: 11,
      }}>
        <p style={{
          margin: 0,
          fontSize: 11,
          fontFamily: "'Times New Roman', Times, serif",
          fontStyle: "italic",
          color: "rgba(255,255,255,0.38)",
          lineHeight: 1.5,
          textTransform: "none",
          letterSpacing: "0.01em",
          paddingBottom: 6,
        }}>
          {bill.description}
        </p>
      </div>
    </div>
  );
}

// ─── Subcategory row ──────────────────────────────────────────────────────────

function SubcategoryRow({
  sub,
  isExpanded,
  onToggle,
}: {
  sub: SubcategoryScore;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [hoveredBillId, setHoveredBillId] = useState<string | null>(null);
  const [lockedBillId, setLockedBillId] = useState<string | null>(null);
  const color = scoreColor(sub.score);

  const handleBillClick = (id: string) => {
    setLockedBillId(prev => prev === id ? null : id);
    setHoveredBillId(null);
  };

  return (
    <div style={{ paddingLeft: 12 }}>
      {/* Sub row header */}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 0",
          cursor: "pointer",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {/* Expand indicator */}
        <span style={{
          fontSize: 8, fontFamily: "monospace",
          color: "rgba(255,255,255,0.25)",
          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.15s",
          display: "inline-block", flexShrink: 0,
          width: 8,
        }}>▶</span>

        {/* Label */}
        <span style={{
          width: 128,
          fontSize: 9,
          fontFamily: "monospace",
          letterSpacing: "0.07em",
          color: isExpanded ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.38)",
          textTransform: "uppercase",
          lineHeight: 1.3,
          flexShrink: 0,
          transition: "color 0.15s",
        }}>
          {sub.label}
        </span>

        {/* Mini slider */}
        <Slider score={sub.score} size="mini" />

        {/* Score */}
        <span style={{
          width: 26, fontSize: 11, fontWeight: 700,
          color, textAlign: "right", flexShrink: 0,
          fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em",
        }}>
          {sub.score}
        </span>
      </div>

      {/* Bills (expanded) */}
      <div style={{
        overflow: "hidden",
        maxHeight: isExpanded ? 800 : 0,
        transition: "max-height 0.25s ease",
        paddingLeft: 8,
        paddingRight: 4,
        borderLeft: isExpanded ? `1px solid rgba(255,255,255,0.06)` : "1px solid transparent",
      }}>
        {sub.bills.map(bill => (
          <BillRow
            key={bill.id}
            bill={bill}
            isDescriptionVisible={lockedBillId === bill.id || hoveredBillId === bill.id}
            onMouseEnter={() => { if (!lockedBillId) setHoveredBillId(bill.id); }}
            onMouseLeave={() => { if (!lockedBillId) setHoveredBillId(null); }}
            onClick={() => handleBillClick(bill.id)}
          />
        ))}
        <div style={{ height: 4 }} />
      </div>
    </div>
  );
}

// ─── Category block ───────────────────────────────────────────────────────────

function CategoryBlock({
  cat,
  isActive,
  isLocked,
  expandedSubId,
  onCategoryEnter,
  onCategoryLeave,
  onCategoryClick,
  onSubcategoryToggle,
}: {
  cat: IssueCategoryScore;
  isActive: boolean;
  isLocked: boolean;
  expandedSubId: string | null;
  onCategoryEnter: () => void;
  onCategoryLeave: () => void;
  onCategoryClick: () => void;
  onSubcategoryToggle: (id: string) => void;
}) {
  const color = scoreColor(cat.score);

  return (
    <div
      onMouseEnter={onCategoryEnter}
      onMouseLeave={onCategoryLeave}
      style={{
        borderRadius: 8,
        background: isActive ? "rgba(255,255,255,0.025)" : "transparent",
        transition: "background 0.15s",
        marginBottom: 1,
      }}
    >
      {/* Category header row */}
      <div
        onClick={onCategoryClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 8px",
          cursor: "pointer",
        }}
      >
        {/* Lock dot */}
        <div style={{ width: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isLocked && (
            <div style={{
              width: 4, height: 4, borderRadius: "50%",
              background: color, boxShadow: `0 0 4px ${color}`,
            }} />
          )}
        </div>

        {/* Label */}
        <span style={{
          width: 138,
          fontSize: 10,
          fontFamily: "monospace",
          letterSpacing: "0.07em",
          color: isActive ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.42)",
          textTransform: "uppercase",
          lineHeight: 1.3,
          flexShrink: 0,
          transition: "color 0.15s",
          userSelect: "none",
        }}>
          {cat.label}
        </span>

        {/* Slider */}
        <Slider score={cat.score} />

        {/* Score */}
        <span style={{
          width: 30, fontSize: 16, fontWeight: 700,
          color, textAlign: "right", flexShrink: 0,
          fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em",
        }}>
          {cat.score}
        </span>
      </div>

      {/* Subcategories */}
      <div style={{
        overflow: "hidden",
        maxHeight: isActive ? 1200 : 0,
        opacity: isActive ? 1 : 0,
        transition: "max-height 0.22s ease, opacity 0.18s ease",
        paddingLeft: 4,
        paddingRight: 8,
        paddingBottom: isActive ? 6 : 0,
      }}>
        {cat.subcategories.map(sub => (
          <SubcategoryRow
            key={sub.id}
            sub={sub}
            isExpanded={expandedSubId === sub.id}
            onToggle={() => onSubcategoryToggle(sub.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 2,
      marginTop: 14,
      paddingLeft: 14,
    }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
      <span style={{
        fontSize: 8,
        fontFamily: "monospace",
        letterSpacing: "0.22em",
        color: "rgba(255,255,255,0.2)",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  globalIssues: IssueCategoryScore[];
  domesticIssues: IssueCategoryScore[];
}

export default function IssueScoreSection({ globalIssues, domesticIssues }: Props) {
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);
  const [lockedCatId, setLockedCatId] = useState<string | null>(null);
  // Map of categoryId → expanded subcategoryId
  const [expandedSubs, setExpandedSubs] = useState<Record<string, string | null>>({});

  const activeCatId = lockedCatId ?? hoveredCatId;

  const handleCatEnter = (id: string) => {
    if (!lockedCatId) setHoveredCatId(id);
  };

  const handleCatLeave = () => {
    if (!lockedCatId) setHoveredCatId(null);
  };

  const handleCatClick = (id: string) => {
    if (lockedCatId === id) {
      setLockedCatId(null);
      setHoveredCatId(null);
    } else {
      setLockedCatId(id);
      setHoveredCatId(null);
    }
  };

  const handleSubToggle = (catId: string, subId: string) => {
    setExpandedSubs(prev => ({
      ...prev,
      [catId]: prev[catId] === subId ? null : subId,
    }));
  };

  const allCategories = [
    { group: "global" as const, cats: globalIssues },
    { group: "domestic" as const, cats: domesticIssues },
  ];

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12,
      padding: "10px 4px 8px",
    }}>
      {/* Global section */}
      <SectionHeader label="Global Issues" />
      {globalIssues.map(cat => (
        <CategoryBlock
          key={cat.id}
          cat={cat}
          isActive={activeCatId === cat.id}
          isLocked={lockedCatId === cat.id}
          expandedSubId={expandedSubs[cat.id] ?? null}
          onCategoryEnter={() => handleCatEnter(cat.id)}
          onCategoryLeave={handleCatLeave}
          onCategoryClick={() => handleCatClick(cat.id)}
          onSubcategoryToggle={(subId) => handleSubToggle(cat.id, subId)}
        />
      ))}

      {/* Domestic section */}
      <SectionHeader label="Domestic Issues" />
      {domesticIssues.map(cat => (
        <CategoryBlock
          key={cat.id}
          cat={cat}
          isActive={activeCatId === cat.id}
          isLocked={lockedCatId === cat.id}
          expandedSubId={expandedSubs[cat.id] ?? null}
          onCategoryEnter={() => handleCatEnter(cat.id)}
          onCategoryLeave={handleCatLeave}
          onCategoryClick={() => handleCatClick(cat.id)}
          onSubcategoryToggle={(subId) => handleSubToggle(cat.id, subId)}
        />
      ))}

      {/* Legend */}
      <div style={{
        display: "flex",
        gap: 12,
        paddingLeft: 14,
        paddingTop: 10,
        marginTop: 6,
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}>
        <span style={{ fontSize: 8, fontFamily: "monospace", color: "#22c55e", opacity: 0.6, letterSpacing: "0.06em" }}>● aligned</span>
        <span style={{ fontSize: 8, fontFamily: "monospace", color: "#f59e0b", opacity: 0.6, letterSpacing: "0.06em" }}>● partial</span>
        <span style={{ fontSize: 8, fontFamily: "monospace", color: "#ef4444", opacity: 0.6, letterSpacing: "0.06em" }}>● misaligned</span>
        <span style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(255,255,255,0.2)", marginLeft: "auto", letterSpacing: "0.04em" }}>vs. 67% public</span>
      </div>
    </div>
  );
}
