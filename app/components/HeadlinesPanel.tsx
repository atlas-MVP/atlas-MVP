"use client";

const SOURCE_ABBR: Record<string, string> = {
  "Reuters":       "R",
  "Al Jazeera":    "AJ",
  "AP":            "AP",
  "New York Times":"NYT",
  "BBC":           "BBC",
  "The Guardian":  "GRD",
  "France 24":     "F24",
};

const SOURCE_COLOR: Record<string, string> = {
  "Reuters":        "#e05a27",
  "Al Jazeera":     "#c8971a",
  "AP":             "#c41e3a",
  "New York Times": "rgba(255,255,255,0.7)",
  "BBC":            "#bb1919",
  "The Guardian":   "#005689",
  "France 24":      "#f00",
};

const ARTICLES = [
  {
    source: "Reuters",
    time: "2 hrs ago",
    headline: "Iran vows retaliation after Israeli strikes on air defense sites near Isfahan",
    excerpt: "Iran's Revolutionary Guard said it would respond 'at the time and place of its choosing' after Israeli F-35s struck radar installations south of Isfahan.",
    img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80",
  },
  {
    source: "AP",
    time: "3 hrs ago",
    headline: "Strait of Hormuz: Iran holds naval drills as tanker traffic falls 22%",
    excerpt: "Iranian naval forces conducted live-fire exercises in the strait through which 20% of the world's oil supply passes, raising alarm among Gulf states.",
    img: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=400&q=80",
  },
  {
    source: "Al Jazeera",
    time: "5 hrs ago",
    headline: "Iran nuclear enrichment reaches 60% purity as IAEA warns of 'critical' escalation",
    excerpt: "The IAEA confirmed Iran has enough enriched uranium for multiple nuclear devices if further processed, calling the situation unprecedented outside declared weapons states.",
    img: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=400&q=80",
  },
  {
    source: "BBC",
    time: "6 hrs ago",
    headline: "Iran's shadow war: How Tehran funds proxies across seven countries",
    excerpt: "A BBC investigation maps the supply routes, funding flows, and command structures linking Iran's IRGC to Hezbollah, the Houthis, and militias across Iraq and Syria.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    source: "The Guardian",
    time: "9 hrs ago",
    headline: "Iran's oil exports hit five-year high despite US sanctions",
    excerpt: "Chinese refineries purchased a record 1.8 million barrels per day of Iranian crude in March, effectively neutralising Western pressure on Tehran's energy revenues.",
    img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
  },
  {
    source: "New York Times",
    time: "11 hrs ago",
    headline: "Gaza death toll surpasses 58,000 as aid corridors remain blocked for third week",
    excerpt: "UN agencies warn of imminent famine across northern Gaza as all crossing points remain closed. The death toll now exceeds that of any single conflict in the region in 50 years.",
    img: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=400&q=80",
  },
  {
    source: "Reuters",
    time: "13 hrs ago",
    headline: "Russia launches largest drone barrage of 2026 targeting Kyiv and Odessa",
    excerpt: "Ukraine's air defense intercepted 61 of 78 Shahed drones overnight, with strikes reported on port infrastructure and a residential block in Odessa's Primorsky district.",
    img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=80",
  },
  {
    source: "Al Jazeera",
    time: "15 hrs ago",
    headline: "Hezbollah fires largest rocket salvo in months as Lebanon ceasefire talks collapse",
    excerpt: "More than 40 rockets were fired at northern Israel, with Hezbollah citing ongoing Israeli operations in southern Lebanon as the trigger. IDF responded with artillery and airstrikes.",
    img: "https://images.unsplash.com/photo-1580121441575-41bcb5c6b47c?w=400&q=80",
  },
];

interface Props {
  onClose: () => void;
}

export default function HeadlinesPanel({ onClose }: Props) {
  return (
    <div style={{
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      width: 444,
      zIndex: 25,
      display: "flex",
      flexDirection: "column",
      background: "rgba(4,6,14,0.94)",
      backdropFilter: "blur(32px)",
      borderLeft: "1px solid rgba(255,255,255,0.05)",
      boxShadow: "-20px 0 60px rgba(0,0,0,0.6)",
      pointerEvents: "auto",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 6px #ef4444" }} />
          <span style={{ fontSize: 12, fontFamily: "monospace", letterSpacing: "0.22em", color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>NEWS</span>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.12)", fontSize: 22, cursor: "pointer", lineHeight: 1, padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.12)")}
        >×</button>
      </div>

      {/* Articles */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {ARTICLES.map((a, i) => (
          <div
            key={i}
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              padding: "14px 20px",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            {/* Source row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, fontFamily: "monospace",
                padding: "2px 6px", borderRadius: 4,
                background: `${SOURCE_COLOR[a.source] ?? "#888"}18`,
                color: SOURCE_COLOR[a.source] ?? "#aaa",
                border: `1px solid ${SOURCE_COLOR[a.source] ?? "#888"}30`,
              }}>
                {SOURCE_ABBR[a.source] ?? a.source}
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{a.source}</span>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.15)", marginLeft: "auto" }}>{a.time}</span>
            </div>

            {/* Headline + thumbnail */}
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 6px", fontSize: 13, color: "rgba(255,255,255,0.82)", fontWeight: 600, lineHeight: 1.4 }}>{a.headline}</p>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.30)", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.excerpt}</p>
              </div>
              <div style={{ width: 56, height: 56, borderRadius: 6, overflow: "hidden", flexShrink: 0, marginTop: 2, background: "rgba(255,255,255,0.05)" }}>
                <img src={a.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <p style={{ margin: 0, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.2em", color: "rgba(255,255,255,0.1)", textAlign: "center" }}>ATLAS · INTELLIGENCE FEED</p>
      </div>
    </div>
  );
}
