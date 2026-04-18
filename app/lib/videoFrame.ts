// ── Sitewide video frame sizes ──────────────────────────────────────────────
// One source of truth for how big a media frame is on the Reels page and
// any other surface that embeds a video.
//
// Mechanism: the CONTAINER sizes itself to the VIDEO's native aspect ratio.
// No forced 16:9 or 9:16 — whatever the source is, the frame matches it
// exactly. That means zero letterbox bars inside the frame and zero grey
// "edges" around the playing video.
//
// Orientation still matters for picking the max width: clearly-landscape
// clips get a wider cap (LANDSCAPE_MAX_VW) than clearly-portrait ones
// (VERTICAL_MAX_VW). Both share HEIGHT_BUDGET_VH so the overall page feels
// consistent regardless of which container a given video ended up in.
//
// Width-cap per orientation. The actual container width will be the SMALLER
// of this cap and the width needed to hit the height budget at the video's
// native aspect — see mediaFrameStyle().
//
// Tuned so timeline videos sit ~3/4in (~72px on most screens) off the
// country-panel edge, the viewport's right wall, and the top/bottom of the
// caption bubble. About an inch smaller than the Reels slide sizes.
export const LANDSCAPE_MAX_VW = 54;
export const VERTICAL_MAX_VW  = 30;

// Shared vertical budget for BOTH orientations. Height = width / aspect
// never exceeds this.
export const HEIGHT_BUDGET_VH = 58;

// Default aspect used before the video reports its real one (on loadedmetadata).
export const DEFAULT_LANDSCAPE_ASPECT = 16 / 9;
export const DEFAULT_VERTICAL_ASPECT  = 9 / 16;

export type VideoOrientation = "landscape" | "vertical";

// Size a media frame so the CONTAINER matches the video's native aspect
// ratio exactly — no letterboxing, no forced 16:9 or 9:16 box. Width is
// capped per orientation; height is capped via HEIGHT_BUDGET_VH. Whichever
// constraint bites first wins, and the other dimension derives from aspect.
export function mediaFrameStyle(aspect: number, orientation: VideoOrientation): {
  width: string;
  aspectRatio: string;
} {
  const maxVw = orientation === "landscape" ? LANDSCAPE_MAX_VW : VERTICAL_MAX_VW;
  // width = min(maxVw vw, HEIGHT_BUDGET_VH * aspect vh)
  return {
    width: `min(${maxVw}vw, calc(${HEIGHT_BUDGET_VH}vh * ${aspect}))`,
    aspectRatio: `${aspect}`,
  };
}

// Threshold used to decide which container a media source belongs in. A
// source with ratio >= this threshold is considered "landscape-ish" and put
// in the landscape container. Anything portrait — including mildly-portrait
// Instagram-style 4:5 clips — goes in the vertical container. Ratio =
// width / height. Threshold of 1.0 means exactly-square (1:1) stays
// landscape, anything taller than wide goes vertical.
export const PORTRAIT_RATIO_THRESHOLD = 1.0;

export function classifyOrientation(width: number, height: number): VideoOrientation {
  if (!width || !height) return "landscape";
  return (width / height) >= PORTRAIT_RATIO_THRESHOLD ? "landscape" : "vertical";
}
