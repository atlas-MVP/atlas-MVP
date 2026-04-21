"use client";

import { useState, useRef, useEffect } from "react";

interface SearchItem {
  label: string;
  subLabel: string;
  code: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  { label: "Israel", subLabel: "Middle East", code: "ISR" },
  { label: "Iran", subLabel: "Middle East", code: "IRN" },
  { label: "Lebanon", subLabel: "Middle East", code: "LBN" },
  { label: "Gaza / Palestine", subLabel: "Middle East", code: "PSE" },
  { label: "Israel–US–Iran War", subLabel: "Active Conflict", code: "IRN" },
  { label: "Operation Epic Fury", subLabel: "Active Conflict", code: "IRN" },
  { label: "Gaza Genocide", subLabel: "Active Conflict", code: "PSE" },
  { label: "Ukraine", subLabel: "Europe", code: "UKR" },
  { label: "Russia", subLabel: "Europe", code: "RUS" },
  { label: "Russia–Ukraine War", subLabel: "Active Conflict", code: "UKR" },
  { label: "Sudan", subLabel: "Africa", code: "SDN" },
  { label: "Sudan Civil War", subLabel: "Active Conflict", code: "SDN" },
  { label: "Myanmar", subLabel: "Asia", code: "MMR" },
  { label: "Myanmar Civil War", subLabel: "Active Conflict", code: "MMR" },
  { label: "Yemen", subLabel: "Middle East", code: "YEM" },
  { label: "Houthi Attacks", subLabel: "Active Conflict", code: "YEM" },
  { label: "DR Congo", subLabel: "Africa", code: "COD" },
  { label: "Congo War", subLabel: "Active Conflict", code: "COD" },
  { label: "Haiti", subLabel: "Caribbean", code: "HTI" },
  { label: "Haiti Gang Crisis", subLabel: "Active Conflict", code: "HTI" },
  { label: "Mexico", subLabel: "North America", code: "MEX" },
  { label: "Mexico Cartel War", subLabel: "Active Conflict", code: "MEX" },
  { label: "Sinaloa Cartel", subLabel: "Active Conflict", code: "MEX" },
  { label: "China", subLabel: "Asia", code: "CHN" },
  { label: "Taiwan", subLabel: "Asia", code: "TWN" },
  { label: "Taiwan Strait Crisis", subLabel: "Active Conflict", code: "CHN" },
  { label: "Hezbollah", subLabel: "Active Conflict", code: "LBN" },
  { label: "Hamas", subLabel: "Active Conflict", code: "PSE" },
  { label: "IRGC", subLabel: "Active Conflict", code: "IRN" },
  // Nature randomiser — each tap drops a new beautiful spot on the globe.
  // `code` uses a NATURE_ prefix so page.tsx can branch on it instead of
  // treating it as an ISO country code.
  { label: "Forest",    subLabel: "Nature — random site",        code: "NATURE_FOREST" },
  { label: "Beach",     subLabel: "Nature — random site",        code: "NATURE_BEACH" },
  { label: "Mountains", subLabel: "Nature — random site",        code: "NATURE_MOUNTAINS" },
  { label: "Natural Wonders", subLabel: "Nature — random site",  code: "NATURE_OTHERS" },
  { label: "Nature",    subLabel: "Random beautiful spot",       code: "NATURE_ANY" },
];

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function scoreItem(query: string, item: SearchItem): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const label = item.label.toLowerCase();

  if (label === q) return 10;
  if (label.startsWith(q)) return 8;
  if (label.includes(q)) return 6;

  // word-level
  const words = q.split(" ");
  if (words.every(w => label.includes(w))) return 4;
  if (words.some(w => w.length > 2 && label.includes(w))) return 3;

  // fuzzy (did you mean)
  const dist = levenshtein(q, label.substring(0, Math.min(label.length, q.length + 3)));
  if (dist <= 2) return 1;
  if (dist <= 3 && q.length > 4) return 0.5;

  return 0;
}

interface Props {
  onSelect: (code: string) => void;
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const scored = SEARCH_ITEMS
    .map(item => ({ item, score: scoreItem(query, item) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const direct = scored.filter(x => x.score >= 3).slice(0, 5);
  const suggestions = scored.filter(x => x.score < 3 && x.score > 0).slice(0, 3);
  const showDropdown = open && query.length >= 1 && (direct.length > 0 || suggestions.length > 0);

  const handleSelect = (code: string) => {
    onSelect(code);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", width: 280 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(0,0,0,0.55)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20,
        padding: "7px 14px",
        backdropFilter: "blur(12px)",
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              const top = direct[0] ?? suggestions[0];
              if (top) handleSelect(top.item.code);
            }
            if (e.key === "Escape") { setQuery(""); setOpen(false); }
          }}
          placeholder="search country or event..."
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "rgba(255,255,255,0.7)",
            fontSize: 12,
            letterSpacing: "0.04em",
            width: "100%",
          }}
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }}
            style={{ color: "rgba(255,255,255,0.2)", fontSize: 16, background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>
            ×
          </button>
        )}
      </div>

      {showDropdown && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          right: 0,
          background: "rgba(4, 6, 18, 0.97)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          overflow: "hidden",
          backdropFilter: "blur(24px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          zIndex: 50,
        }}>
          {direct.length > 0 && (
            <>
              {direct.map(({ item }) => (
                <button key={item.label + item.code}
                  onClick={() => handleSelect(item.code)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "9px 14px",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{item.label}</span>
                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.06em" }}>
                    {item.subLabel}
                  </span>
                </button>
              ))}
            </>
          )}

          {suggestions.length > 0 && (
            <>
              <div style={{ padding: "6px 14px 4px", color: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em" }}>
                DID YOU MEAN
              </div>
              {suggestions.map(({ item }) => (
                <button key={item.label + item.code + "s"}
                  onClick={() => handleSelect(item.code)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "8px 14px",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontStyle: "italic" }}>{item.label}</span>
                  <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, fontFamily: "monospace" }}>{item.subLabel}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
