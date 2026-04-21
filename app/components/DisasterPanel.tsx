"use client";
import React, { useState } from "react";
import { EText } from "./InlineEdit";

const DISASTER_DATA: Record<string, {
  title: string;
  date: string;
  tag: string;
  stats: { label: string; value: string }[];
  intro: string;
  article: { headline: string; image: string; url: string; source: string };
}> = {
  "kenya-floods": {
    title: "Kenya Floods",
    date: "March–April 2026",
    tag: "active disaster",
    stats: [
      { label: "Confirmed dead", value: "110+" },
      { label: "Displaced",      value: "34,765+" },
      { label: "Counties hit",   value: "30" },
    ],
    intro:
      "Kenya's 2026 long rains arrived early and with exceptional force, submerging informal settlements across Nairobi and destroying over 1,200 hectares of cropland in Kisumu alone. The Kenya Meteorological Department identifies April as peak season, with death tolls and displacement expected to rise. IPC projects 3.7 million people in ASAL counties to face acute food insecurity through June, compounded by cholera and malaria risk from contaminated floodwater.",
    article: {
      headline:
        "Nairobi slums submerged as Kenya floods kill 110 and displace 35,000 across 30 counties — April 2026",
      image: "/kenya-floods-bus.webp",
      url: "https://www.aljazeera.com/news/2024/4/",
      source: "Al Jazeera",
    },
  },
};

interface Props {
  slug: string;
  onClose: () => void;
}

export default function DisasterPanel({ slug, onClose }: Props) {
  const data = DISASTER_DATA[slug];
  if (!data) return null;

  const [tag,   setTag]   = useState(data.tag);
  const [title, setTitle] = useState(data.title);
  const [date,  setDate]  = useState(data.date);
  const [stats, setStats] = useState(data.stats);
  const [intro, setIntro] = useState(data.intro);
  const [headline, setHeadline] = useState(data.article.headline);
  const [source,   setSource]   = useState(data.article.source);

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
                <EText value={tag} onChange={setTag} style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.48)" }} />
              </div>
              <div
                style={{
                  fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.92)",
                  letterSpacing: "-0.01em", lineHeight: 1.15,
                }}
              >
                <EText value={title} onChange={setTitle} style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.01em" }} />
              </div>
              <div
                style={{
                  fontSize: 11, color: "rgba(255,255,255,0.48)",
                  fontFamily: "monospace", marginTop: 4,
                }}
              >
                <EText value={date} onChange={setDate} style={{ fontSize: 11, color: "rgba(255,255,255,0.48)", fontFamily: "monospace" }} />
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

          {/* Stats */}
          <div style={{ display: "flex", gap: 28, marginTop: 18 }}>
            {stats.map((s, i) => (
              <div key={i}>
                <div
                  style={{
                    fontSize: 22, fontWeight: 700,
                    color: "rgba(255,255,255,0.92)", fontFamily: "monospace",
                  }}
                >
                  <EText value={s.value} onChange={v => setStats(prev => prev.map((st, j) => j === i ? { ...st, value: v } : st))} style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.92)", fontFamily: "monospace" }} />
                </div>
                <div
                  style={{
                    fontSize: 10, color: "rgba(255,255,255,0.48)",
                    letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 3,
                  }}
                >
                  <EText value={s.label} onChange={v => setStats(prev => prev.map((st, j) => j === i ? { ...st, label: v } : st))} style={{ fontSize: 10, color: "rgba(255,255,255,0.48)", letterSpacing: "0.12em", fontFamily: "monospace" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Intro ── */}
        <div
          style={{
            padding: "14px 20px 10px",
            fontSize: 12, color: "rgba(255,255,255,0.62)",
            lineHeight: 1.7, fontFamily: "monospace",
          }}
        >
          <EText value={intro} onChange={setIntro} as="div" style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", lineHeight: 1.7, fontFamily: "monospace" }} />
        </div>

        {/* ── Article card ── */}
        <div style={{ padding: "6px 16px 20px" }}>
          <a
            href={data.article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              height: 196, borderRadius: 14, overflow: "hidden",
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
                }}
              >
                <EText value={headline} onChange={setHeadline} as="div" style={{ fontSize: 12, fontFamily: "monospace", letterSpacing: "0.03em", color: "rgba(255,255,255,0.88)", lineHeight: 1.4 }} />
              </div>
              <div
                style={{
                  fontSize: 9, color: "rgba(255,255,255,0.48)",
                  marginTop: 4, letterSpacing: "0.12em", textTransform: "uppercase",
                }}
              >
                <EText value={source} onChange={setSource} style={{ fontSize: 9, color: "rgba(255,255,255,0.48)", letterSpacing: "0.12em", fontFamily: "monospace" }} />
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
