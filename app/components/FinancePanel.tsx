"use client";
import React from "react";

const FINANCE_DATA: Record<string, {
  title: string;
  tag: string;
  article: { headline: string; image: string; url: string; source: string };
}> = {
  "oil-hormuz": {
    title: "Oil Markets",
    tag: "MARKET ALERT",
    article: {
      headline:
        "Oil surges past $87 as Strait of Hormuz tensions escalate following US-Iran clashes",
      image: "/finance-oil.jpeg",
      url: "https://www.bloomberg.com/energy",
      source: "Bloomberg",
    },
  },
};

interface Props {
  slug: string;
  onClose: () => void;
}

export default function FinancePanel({ slug, onClose }: Props) {
  const data = FINANCE_DATA[slug];
  if (!data) return null;

  return (
    <div
      className="absolute left-6 z-20 w-[520px]"
      style={{ top: 72, bottom: 24, display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          scrollbarWidth: "none",
          background: "rgba(4,6,18,0.92)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "18px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div
                style={{
                  fontSize: 10, fontFamily: "monospace", letterSpacing: "0.18em",
                  color: "rgba(255,255,255,0.48)", textTransform: "uppercase", marginBottom: 6,
                }}
              >
                {data.tag}
              </div>
              <div
                style={{
                  fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.92)",
                  letterSpacing: "-0.01em", lineHeight: 1.15,
                }}
              >
                {data.title}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.3)", fontSize: 18,
                padding: "2px 6px", lineHeight: 1, flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Article card ── */}
        <div style={{ padding: "14px 16px 20px" }}>
          <a
            href={data.article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              height: 260, borderRadius: 14, overflow: "hidden",
              position: "relative", display: "block", textDecoration: "none",
              cursor: "pointer", border: "1px solid rgba(255,255,255,0.09)",
              background: "#0a0c18",
            }}
          >
            <img
              src={data.article.image}
              alt={data.article.headline}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div
              style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.88) 100%)",
              }}
            />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px 10px" }}>
              <div
                style={{
                  fontSize: 12, fontFamily: "monospace", letterSpacing: "0.03em",
                  color: "rgba(255,255,255,0.88)", lineHeight: 1.4,
                  display: "-webkit-box", WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}
              >
                {data.article.headline}
              </div>
              <div
                style={{
                  fontSize: 9, color: "rgba(255,255,255,0.48)",
                  marginTop: 4, letterSpacing: "0.12em", textTransform: "uppercase",
                }}
              >
                {data.article.source}
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
