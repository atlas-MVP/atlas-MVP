"use client";

import { useState } from "react";
import type { IssueCategory, Subcategory, BillRecord } from "../api/senator-alignment/[bioguide]/route";

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
          background: bill.aligned ? "#22c55e" : "#ef4444",
          boxShadow: `0 0 5px ${bill.aligned ? "#22c55e" : "#ef4444"}80`,
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
  sub: Subcategory;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [hoveredBillId, setHoveredBillId] = useState<string | null>(null);
  const [lockedBillId, setLockedBillId] = useState<string | null>(null);

  const handleBillClick = (id: string) => {
    setLockedBillId(prev => prev === id ? null : id);
    setHoveredBillId(null);
  };

  return (
    <div style={{ paddingLeft: 12 }}>
      {/* Subcategory header */}
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
        <span style={{
          fontSize: 8, fontFamily: "monospace",
          color: "rgba(255,255,255,0.25)",
          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.15s",
          display: "inline-block", flexShrink: 0,
        }}>▶</span>

        <span style={{
          fontSize: 9,
          fontFamily: "monospace",
          letterSpacing: "0.07em",
          color: isExpanded ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.38)",
          textTransform: "uppercase",
          transition: "color 0.15s",
        }}>
          {sub.label}
        </span>
      </div>

      {/* Bills (expanded) */}
      <div style={{
        overflow: "hidden",
        maxHeight: isExpanded ? 800 : 0,
        transition: "max-height 0.25s ease",
        paddingLeft: 8,
        paddingRight: 4,
        borderLeft: isExpanded ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
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
  cat: IssueCategory;
  isActive: boolean;
  isLocked: boolean;
  expandedSubId: string | null;
  onCategoryEnter: () => void;
  onCategoryLeave: () => void;
  onCategoryClick: () => void;
  onSubcategoryToggle: (id: string) => void;
}) {
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
      {/* Category header */}
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
              background: "rgba(255,255,255,0.4)",
            }} />
          )}
        </div>

        <span style={{
          fontSize: 10,
          fontFamily: "monospace",
          letterSpacing: "0.07em",
          color: isActive ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.42)",
          textTransform: "uppercase",
          lineHeight: 1.3,
          transition: "color 0.15s",
          userSelect: "none",
        }}>
          {cat.label}
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

// ─── Section divider ──────────────────────────────────────────────────────────

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
  globalIssues: IssueCategory[];
  domesticIssues: IssueCategory[];
}

export default function IssueScoreSection({ globalIssues, domesticIssues }: Props) {
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);
  const [lockedCatId, setLockedCatId] = useState<string | null>(null);
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

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12,
      padding: "10px 4px 12px",
    }}>
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
    </div>
  );
}
