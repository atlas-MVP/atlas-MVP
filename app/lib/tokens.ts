/**
 * Design tokens — single source of truth for every repeated visual constant.
 *
 * Import from here instead of hardcoding inline. Changing one value here
 * updates every component that references it.
 *
 *   import { T, clr, conf } from "@/app/lib/tokens";
 */

// ── Color helpers ─────────────────────────────────────────────────────────────
// Call with an opacity 0–1. Returns a valid rgba() string.
// e.g. clr.red(0.7)  → "rgba(239,68,68,0.7)"
//      clr.white(0.04) → "rgba(255,255,255,0.04)"
export const clr = {
  red:    (o: number) => `rgba(239,68,68,${o})`,
  blue:   (o: number) => `rgba(96,165,250,${o})`,
  green:  (o: number) => `rgba(34,197,94,${o})`,
  amber:  (o: number) => `rgba(251,191,36,${o})`,
  white:  (o: number) => `rgba(255,255,255,${o})`,
  black:  (o: number) => `rgba(0,0,0,${o})`,
  // Dark panel backgrounds
  panel:  (o = 0.92) => `rgba(4,6,18,${o})`,
  modal:  (o = 0.98) => `rgba(10,13,26,${o})`,
};

// ── Confidence & danger color scales ─────────────────────────────────────────
// Used in LiveAlertRow, CountryPanel confidence bars, and AtlasHQ.
// Single definition — change the thresholds here to move them everywhere.
export function confColor(c: number): string {
  if (c >= 90) return clr.green(1);   // "#22c55e"
  if (c >= 80) return "#86efac";
  if (c >= 70) return clr.amber(1);   // "#fbbf24"
  return "#f87171";
}

export function dangerColor(d: number): string {
  if (d >= 4) return "#6d28d9";
  if (d >= 3) return "#4338ca";
  if (d >= 2) return "#1d4ed8";
  return "#1e3a8a";
}

// ── Tile chrome ───────────────────────────────────────────────────────────────
// Video tiles, article cards, and any "floating media frame."
// Change TILE_RADIUS here → all tiles update at once.
export const T = {
  // Tile / card
  TILE_RADIUS:  14,   // px — video tiles, article cards
  TILE_BORDER:  `1px solid ${clr.white(0.10)}`,
  TILE_SHADOW:  "0 8px 24px rgba(0,0,0,0.45)",

  // Modal / popup (EventUploadButton, source panels, etc.)
  MODAL_RADIUS: 14,
  MODAL_BORDER: `1px solid ${clr.white(0.10)}`,
  MODAL_SHADOW: "0 24px 80px rgba(0,0,0,0.6)",
  MODAL_BG:     clr.modal(),

  // Pill / tag (country pills, source pills, confidence sources)
  PILL_RADIUS:  99,
  PILL_BG:      clr.white(0.07),
  PILL_BORDER:  `1px solid ${clr.white(0.16)}`,

  // Typography — always monospace for data/labels
  MONO:         "monospace" as const,
  TRACK_TIGHT:  "0.08em",
  TRACK_MED:    "0.12em",
  TRACK_WIDE:   "0.14em",
  TRACK_XWIDE:  "0.18em",

  // Transitions
  FADE:         "background 0.12s",

  // Video column layout — EventVideoBubble geometry.
  //
  //  ┌── panel (460px) ──┬─ 96px ─┬────────── VIDEO ──────────┬─ 96px ─┐
  //  │   left-6 → 484px │  1 in  │  left:580 → right:96      │  1 in  │
  //  └───────────────────┴────────┴───────────────────────────┴────────┘
  //
  //  Top aligns with the first history tile (year separator) in CountryPanel:
  //    panel_top(72) + sticky_header(83) + history_header(41) = 196px
  //
  //  Height = exactly one 16:9 hero video tall at the column width:
  //    column_width = 100vw - 676px  (left:580 + right:96)
  //    height       = column_width × 9/16
  //
  VIDEO_INSET:         254,                              // legacy vertical formula
  VIDEO_SIDE_MARGIN:     0,                              // no inner padding
  VIDEO_COL_GAP:        96,                              // 1 inch panel→video gap
  VIDEO_CONTAINER_TOP: 196,                              // px — aligns with first history tile
  VIDEO_CONTAINER_H:   "calc((100vw - 676px) * 9 / 16)" as string, // one 16:9 frame tall
} as const;
