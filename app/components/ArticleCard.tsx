"use client";

// Square article preview card — image fills the top, source + headline sit
// over a gradient at the bottom third. Clicks open the article in a new tab.
// Metadata comes from /api/og so any URL works with zero manual curation.

import { useEffect, useState } from "react";
import { T } from "../lib/tokens";

interface OgData {
  title:       string;
  image:       string | null;
  description: string;
  source:      string;
  url:         string;
}

interface Props {
  url:   string;
  width: string;     // passed from EventVideoBubble so the card matches the
                     // video column width exactly
}

export default function ArticleCard({ url, width }: Props) {
  const [data, setData] = useState<OgData | null>(null);
  const [err,  setErr]  = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/og?url=${encodeURIComponent(url)}`)
      .then(r => r.ok ? r.json() as Promise<OgData> : Promise.reject(new Error(`${r.status}`)))
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) { console.error("[ArticleCard]", e); setErr(true); } });
    return () => { cancelled = true; };
  }, [url]);

  // Hide until fetch resolves. Better to render nothing than a blank skeleton
  // since the scroll column already has real content above and below.
  if (err || !data) return null;

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display:        "block",
        width,
        aspectRatio:    "16 / 9",
        borderRadius:   T.TILE_RADIUS,
        overflow:       "hidden",
        background:     "#000",
        border:         T.TILE_BORDER,
        boxShadow:      T.TILE_SHADOW,
        position:       "relative",
        textDecoration: "none",
        color:          "inherit",
        cursor:         "pointer",
        flexShrink:     0,
      }}
    >
      {data.image && (
        <div style={{
          position:   "absolute",
          inset:      0,
          background: `#000 url(${data.image}) center / contain no-repeat`,
        }} />
      )}
      {/* Bottom-half gradient so the headline always reads against any image. */}
      <div style={{
        position:   "absolute",
        inset:      "45% 0 0 0",
        background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.92) 100%)",
      }} />
      <div style={{
        position:       "absolute",
        left:           0,
        right:          0,
        bottom:         0,
        padding:        "24px 26px 28px",
        display:        "flex",
        flexDirection:  "column",
        gap:            10,
      }}>
        <span style={{
          fontSize:      10,
          fontFamily:    "monospace",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color:         "rgba(255,255,255,0.65)",
        }}>
          {data.source}
        </span>
        <span style={{
          fontSize:   22,
          fontWeight: 600,
          color:      "rgba(255,255,255,0.97)",
          lineHeight: 1.25,
          // Clamp to 4 lines so very long headlines don't blow out the card.
          display:            "-webkit-box",
          WebkitLineClamp:    4,
          WebkitBoxOrient:    "vertical",
          overflow:           "hidden",
        }}>
          {data.title}
        </span>
      </div>
    </a>
  );
}
