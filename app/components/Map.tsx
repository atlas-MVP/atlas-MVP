"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { SIDE_COLORS, COUNTRY_SIDE } from "../lib/sides";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYXRsYXNib3N0b24iLCJhIjoiY21qejY1c211Nmt2azNlcHMwcnljOGR1dCJ9.Pnq-qa_giDk0LN95OpFvMg";

// Top-4 conflict countries — always blue base + red idle pulse.
// SDN removed: Sudan only highlights when explicitly tapped (matches user
// request — constant pulse was noisy when Sudan isn't the active topic).
const HIGHLIGHTED = ["LBN", "IRN", "UKR", "RUS", "PSE", "ISR"];

// Per-country zoom fade ranges [fadeStart, fadeEnd] — proportional to country area
// Smaller countries keep their highlight visible until much higher zoom levels
const COUNTRY_FADE_RANGES: Record<string, [number, number]> = {
  PSE: [9.5, 11.5], // Gaza — stay visible deep into zoom so Gaza stays red
  LBN: [7.0, 9.0],  // Lebanon ~10k km² — small
  ISR: [6.8, 8.8],  // Israel ~22k km²  — small
  UKR: [4.5, 6.5],  // Ukraine ~600k km²
  IRN: [3.8, 5.8],  // Iran ~1.65M km²
  SDN: [3.5, 5.5],  // Sudan ~1.86M km²
  RUS: [3.0, 5.0],  // Russia ~17M km²  — huge
};

const GLOBAL_CONFLICTS = [
  "UKR", "RUS", "SDN", "MMR", "ETH",
  "MLI", "NER", "BFA", "SOM", "COD",
  "HTI", "AFG", "PAK", "NGA", "CMR",
  "LBY", "YEM", "SYR", "IRQ", "PSE",
  "MEX", "COL", "MOZ", "CAF", "TCD",
  "TUR", "VEN", "CHN", "TWN",
  "USA",
];

const ALL_HOVERABLE = [...HIGHLIGHTED, ...GLOBAL_CONFLICTS];

// Country centers for flyTo — zoom chosen so the country + neighbors are visible
// Zoom proportional to country area. Reference: USA = 2.3, Lebanon = 7.0 (cities + neighbor edges visible)
const COUNTRY_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  // ~10M km² — widest
  USA: { center: [-98.5, 39.5], zoom: 2.3 },
  RUS: { center: [60.0,  60.0], zoom: 2.2 },
  CHN: { center: [104.2, 35.9], zoom: 2.8 },
  // ~2M km²
  COD: { center: [23.5, -3.0],  zoom: 3.6 },
  SDN: { center: [30.2, 15.6],  zoom: 3.6 },
  MEX: { center: [-99.1, 23.6], zoom: 3.6 },
  LBY: { center: [17.2, 26.3],  zoom: 3.6 },
  // ~1–1.6M km²
  IRN: { center: [53.7, 32.4],  zoom: 3.9 },
  ETH: { center: [40.5,  9.1],  zoom: 4.0 },
  NGA: { center: [8.7,   9.1],  zoom: 4.0 },
  // ~500–700K km²
  MMR: { center: [96.1, 19.7],  zoom: 4.4 },
  AFG: { center: [67.7, 33.9],  zoom: 4.4 },
  UKR: { center: [31.2, 48.4],  zoom: 4.5 },
  FRA: { center: [2.3,  46.2],  zoom: 4.5 },
  // ~400–530K km²
  YEM: { center: [44.2, 15.5],  zoom: 4.8 },
  IRQ: { center: [44.4, 33.3],  zoom: 5.0 },
  // ~200–250K km²
  GBR: { center: [-2.0, 54.0],  zoom: 5.2 },
  SYR: { center: [38.3, 34.8],  zoom: 5.4 },
  // ~60–100K km²
  ARE: { center: [54.4, 23.4],  zoom: 5.9 },
  JOR: { center: [36.2, 30.6],  zoom: 5.9 },
  LKA: { center: [80.7,  7.8],  zoom: 6.0 },
  // ~25–40K km²
  TWN: { center: [120.9, 23.7], zoom: 6.4 },
  HTI: { center: [-72.3, 18.9], zoom: 6.4 },
  // ~10–22K km²
  ISR: { center: [35.0, 31.5],  zoom: 6.8 },
  KWT: { center: [47.5, 29.3],  zoom: 6.8 },
  QAT: { center: [51.2, 25.3],  zoom: 6.8 },
  // ~10K km² — tightest standard
  LBN: { center: [35.5, 33.9],  zoom: 7.0 },
  // ~6K km² — tightest
  PSE: { center: [34.4, 31.9],  zoom: 7.5 },
};

const MOCK_EVENTS = [
  { id: 2,  lng: 35.5,  lat: 33.9,  title: "Lebanon — Active Conflict", type: "war" },
  { id: 3,  lng: 53.6,  lat: 32.4,  title: "Iran — Active Conflict",    type: "war" },
  { id: 4,  lng: 30.5,  lat: 50.4,  title: "Kyiv — Ongoing War",        type: "war" },
  { id: 5,  lng: 32.5,  lat: 15.5,  title: "Sudan Civil War + Genocide",type: "genocide" },
  { id: 6,  lng: 96.1,  lat: 19.7,  title: "Myanmar Civil War",         type: "war" },
  { id: 7,  lng: 44.2,  lat: 15.5,  title: "Yemen Civil War",           type: "war" },
  { id: 8,  lng: 2.3,   lat: 12.3,  title: "Sahel Insurgency",          type: "war" },
  { id: 9,  lng: 23.5,  lat: -3.0,  title: "DR Congo Conflict",         type: "war" },
  { id: 10, lng: -72.3, lat: 18.9,  title: "Haiti Crisis",              type: "war" },
  { id: 11, lng: -99.1, lat: 19.4,  title: "Mexico Cartel War",         type: "war" },
  { id: 12, lng: 120.9, lat: 23.7,  title: "Taiwan Strait Crisis",      type: "war" },
  { id: 13, lng: 96.0,  lat: 21.9,  title: "Myanmar Earthquake",        type: "disaster" },
  { id: 14, lng: -118.4,lat: 34.1,  title: "LA Wildfires",              type: "disaster" },
];

const TYPE_COLORS: Record<string, string> = {
  war:       "#d01228",  // deep crimson red
  genocide:  "#e05a00",  // deep burnt orange
  disaster:  "#4422dd",  // deep electric purple-blue
  conflict:  "#d01228",  // fallback = war
  political: "#4422dd",  // fallback = disaster color
  humanitarian: "#e05a00",
};

interface StrikeMarker {
  lng: number;
  lat: number;
  side: "amber" | "crimson";
  label?: string;
  confidence?: number;
  sources?: { label: string; url?: string }[];
}
interface ActiveStrikesData {
  strikes: StrikeMarker[];
  center: [number, number];
  zoom: number;
}

interface Props {
  onCountryClick?: (code: string) => void;
  flyToCode?: string | null;
  flyToPosition?: { center: [number, number]; zoom: number; key?: string } | null;
  selectedCountry?: string | null;
  secondaryCountries?: string[];
  activeStrikes?: ActiveStrikesData | null;
  casualtyCountries?: string[]; // ISOs to pulse blue+red when "+more" casualties is tapped
  focusCountries?: string[]; // when set, ONLY these countries are active — everything else dims
  homeView?: boolean; // radar is open, no country selected — suppress auto-highlight
  onReady?: () => void; // fires once when first idle event lands (all tiles rendered)
  spinKey?: number;       // increment to resume spin after a permanent stop
  isIdle?: boolean;       // true when nothing is selected — enables slow globe spin
  spinDisabled?: boolean; // user explicitly turned off globe rotation in settings
}

// Zoom fade range — used for global layers (hover, secondary); per-country uses COUNTRY_FADE_RANGES
const FADE_START = 3.5;
const FADE_END = 5.5;

// Every custom overlay layer that must vanish on the naked-earth idle screen.
const OVERLAY_LAYER_IDS = [
  ...["LBN","IRN","UKR","RUS","PSE","ISR"].map(iso => `highlighted-fill-${iso}`),
  "casualty-fill-blue", "casualty-fill-red",
  "idle-pulse-blue", "idle-pulse-red",
  "world-hit", "hover-fill", "hover-border", "secondary-border",
  "oslo-fill-isr-country",
  "oslo-fill-israeli", "oslo-fill-joint", "oslo-fill-palestinian", "oslo-fill-nomansland", "oslo-border",
  "events-halo", "events-glow", "events-dot",
  "strike-outer-halo", "strike-halo", "strike-glow", "strike-core", "strike-dot",
];

// Earth rotates 360° in 86 400 seconds → 0.004167 °/s
const EARTH_DEG_PER_SEC = 360 / 86400;
// Globe stops rotating when zoomed in past this level — tiles still load
// freely beyond it, spin just pauses until you zoom back out.
const SPIN_STOP_ZOOM = 13;

export default function Map({ onCountryClick, flyToCode, flyToPosition, selectedCountry, secondaryCountries = [], activeStrikes, casualtyCountries = [], focusCountries, homeView = false, onReady, spinKey = 0, isIdle = false, spinDisabled = false }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const hoveredId = useRef<string | number | null>(null);
  const pulseStart = useRef<number | null>(null);
  // Strike animation
  const strikeTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastStrikeTs = useRef<number>(0);
  const currentStrikes = useRef<StrikeMarker[]>([]);
  const idlePulseFrame = useRef<number | null>(null);
  const panelOpenRef = useRef(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; isHighlighted: boolean } | null>(null);
  const [osloTooltip, setOsloTooltip] = useState<{ label: string; x: number; y: number } | null>(null);
  const osloLocked = useRef(false);
  // Globe spin state
  const spinFrameRef = useRef<number | null>(null);
  const spinLastTs = useRef<number | null>(null);
  const userInteracting = useRef(false);
  // hasInteracted: set on any mousedown/touchstart; cleared only by spinKey change
  // or when isIdle transitions false→true (panel X button closes last widget).
  const hasInteracted = useRef(false);
  const prevIsIdle = useRef(isIdle);
  // Reveal animation: layer IDs per phase, populated in the load callback
  const revealLayersRef = useRef<{
    borders: Array<{ id: string; targetOpacity: number }>;
    ocean: string[];
    countries: string[];
    cities: string[];
  } | null>(null);
  const revealDoneRef = useRef(false);
  // Country label reveal on first click
  const labelsRevealedRef = useRef(false);
  const labelRevealTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Focus mode: when a conflict is active, only involved countries are visible.
  // When no conflict, all highlighted countries show normally.
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;
    if (!m.getLayer("hover-fill")) return;
    const panelOpen = !!selectedCountry;
    panelOpenRef.current = panelOpen;
    const wf = ["any", ["==", ["get", "worldview"], "all"], ["==", ["get", "worldview"], "US"]];
    const focus = focusCountries && focusCountries.length > 0 ? focusCountries : null;

    // Per-country highlighted fills
    for (const iso of HIGHLIGHTED) {
      if (!m.getLayer(`highlighted-fill-${iso}`)) continue;
      const [fs, fe] = COUNTRY_FADE_RANGES[iso] ?? [FADE_START, FADE_END];
      const inFocus = !focus || focus.includes(iso);
      m.setPaintProperty(`highlighted-fill-${iso}`, "fill-opacity",
        inFocus ? ["interpolate", ["linear"], ["zoom"], fs, 0.48, fe, 0] as never : 0
      );
    }

    // Pulse layers — only pulse focused countries
    if (focus) {
      const focusBlue = focus.filter(c => COUNTRY_SIDE[c] === "blue");
      const focusRed  = focus.filter(c => COUNTRY_SIDE[c] === "red");
      const focusNeut = focus.filter(c => !COUNTRY_SIDE[c]);
      m.setFilter("idle-pulse-blue", ["all", wf, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", [...focusBlue, ...focusNeut]]]]);
      m.setFilter("idle-pulse-red",  ["all", wf, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", focusRed.length ? focusRed : [""]]]] );
    } else {
      const blueH = HIGHLIGHTED.filter(c => COUNTRY_SIDE[c] === "blue");
      const redH  = HIGHLIGHTED.filter(c => COUNTRY_SIDE[c] === "red");
      const neutH = HIGHLIGHTED.filter(c => !COUNTRY_SIDE[c]);
      m.setFilter("idle-pulse-blue", ["all", wf, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", [...blueH, ...neutH]]]]);
      m.setFilter("idle-pulse-red",  ["all", wf, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", redH.length ? redH : [""]]]] );
    }

    // Event dots — hide all when focused, or show all when no focus
    const dotLayers = ["events-halo", "events-glow", "events-dot"];
    dotLayers.forEach(id => {
      if (!m.getLayer(id)) return;
      m.setPaintProperty(id, `circle-opacity`, focus ? 0 : (m.getPaintProperty(id, "circle-opacity") || 0));
    });
    // Restore dot opacities when unfocused
    if (!focus) {
      if (m.getLayer("events-halo")) m.setPaintProperty("events-halo", "circle-opacity", 0.07);
      if (m.getLayer("events-glow")) m.setPaintProperty("events-glow", "circle-opacity", 0.20);
      if (m.getLayer("events-dot"))  m.setPaintProperty("events-dot",  "circle-opacity", 0.50);
    }

    // Hover fill — only on focused countries, or normal behavior
    m.setPaintProperty("hover-fill", "fill-opacity",
      focus ? 0 : ["case", ["boolean", ["feature-state", "hover"], false],
        ["interpolate", ["linear"], ["zoom"], FADE_START, 0.5, FADE_END, 0], 0
      ] as never
    );

    // Border: selected country border when panel open, or all hoverable when no panel
    if (m.getLayer("hover-border")) {
      if (panelOpen && selectedCountry) {
        m.setFilter("hover-border", ["all", wf, ["==", ["get", "iso_3166_1_alpha_3"], selectedCountry]]);
        m.setPaintProperty("hover-border", "line-opacity",
          ["interpolate", ["linear"], ["zoom"], FADE_START, 0.55, FADE_END, 0] as never
        );
      } else {
        m.setFilter("hover-border", ["all", wf, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", ALL_HOVERABLE]]]);
        m.setPaintProperty("hover-border", "line-opacity", 0);
      }
    }
  }, [selectedCountry, focusCountries]);

  // Oslo Agreement layers — only for Israel–Palestine conflict (focusCountries includes PSE)
  useEffect(() => {
    const m = map.current;
    if (!m || !mapReady) return;
    const show = !!(focusCountries?.includes("PSE") || selectedCountry === "PSE");
    if (!show) { osloLocked.current = false; setOsloTooltip(null); }
    try {
      // PSE fill covers Gaza correctly via Mapbox built-in tile. Oslo layers sit on top
      // for the West Bank zones. High opacity on Israeli/joint layers overrides PSE red.
      if (m.getLayer("highlighted-fill-PSE")) {
        const [fs, fe] = COUNTRY_FADE_RANGES["PSE"] ?? [FADE_START, FADE_END];
        m.setPaintProperty("highlighted-fill-PSE", "fill-opacity",
          show ? 0.65 : ["interpolate", ["linear"], ["zoom"], fs, 0.48, fe, 0] as never
        );
      }
      if (m.getLayer("highlighted-fill-ISR")) {
        const [fs, fe] = COUNTRY_FADE_RANGES["ISR"] ?? [FADE_START, FADE_END];
        m.setPaintProperty("highlighted-fill-ISR", "fill-opacity",
          show ? 0 : ["interpolate", ["linear"], ["zoom"], fs, 0.48, fe, 0] as never
        );
      }
      const sp = (id: string, prop: string, val: number) => {
        if (m.getLayer(id)) m.setPaintProperty(id, prop as never, val as never);
      };
      // Israel proper (outside West Bank) → same blue, matches Area C
      sp("oslo-fill-isr-country", "fill-opacity", show ? 0.88 : 0);
      // Area A / H1 — Palestinian cities (red). PSE red is underneath; this adds depth.
      sp("oslo-fill-palestinian", "fill-opacity", show ? 0.65 : 0);
      // Area B + Nature Reserve — joint control (purple). High enough to override PSE red.
      sp("oslo-fill-joint",       "fill-opacity", show ? 0.82 : 0);
      // Area C + H2 + East Jerusalem + No Man's Land — Israeli (blue). Overrides PSE red.
      sp("oslo-fill-israeli",     "fill-opacity", show ? 0.88 : 0);
      sp("oslo-border",           "line-opacity", show ? 0.5  : 0);
    } catch {}
  }, [selectedCountry, focusCountries, mapReady]);

  // Oslo zone hover tooltip — follows cursor, tap locks, show=false clears
  useEffect(() => {
    const m = map.current;
    if (!m || !mapReady) return;
    const show = !!(focusCountries?.includes("PSE") || selectedCountry === "PSE");
    if (!show) return;

    const LABEL: Record<string, string> = {
      A: "Palestinian Control", H1: "Palestinian Control",
      B: "Israeli–Palestinian Control", "Nature Reserve": "Israeli–Palestinian Control",
      C: "Israeli Control", H2: "Israeli Control",
      "Israeli Declared East Jerusalem": "Israeli Control",
      "No Man's Land": "Israeli Control",
    };

    const onMove = (e: mapboxgl.MapMouseEvent) => {
      if (osloLocked.current) return;
      const osloFeats = m.queryRenderedFeatures(e.point, {
        layers: ["oslo-fill-israeli", "oslo-fill-joint", "oslo-fill-palestinian"],
      });
      if (osloFeats.length > 0) {
        const cls = (osloFeats[0].properties?.CLASS ?? "") as string;
        setOsloTooltip({ label: LABEL[cls] ?? "Israeli Control", x: e.point.x, y: e.point.y });
        return;
      }
      // Gaza: PSE fill visible but no oslo layer on top
      const pseFeats = m.queryRenderedFeatures(e.point, { layers: ["highlighted-fill-PSE"] });
      if (pseFeats.length > 0) {
        setOsloTooltip({ label: "Palestinian Control", x: e.point.x, y: e.point.y });
      } else {
        setOsloTooltip(null);
      }
    };

    const onLeave = () => { if (!osloLocked.current) setOsloTooltip(null); };

    const onClick = (e: mapboxgl.MapMouseEvent) => {
      const feats = m.queryRenderedFeatures(e.point, {
        layers: ["oslo-fill-israeli", "oslo-fill-joint", "oslo-fill-palestinian", "highlighted-fill-PSE"],
      });
      if (feats.length > 0) {
        osloLocked.current = !osloLocked.current;
        if (!osloLocked.current) setOsloTooltip(null);
      }
    };

    m.on("mousemove", onMove);
    m.on("mouseleave", onLeave);
    m.on("click", onClick);
    return () => { m.off("mousemove", onMove); m.off("mouseleave", onLeave); m.off("click", onClick); };
  }, [selectedCountry, focusCountries, mapReady]);

  // FlyTo when flyToCode changes from outside (search)
  useEffect(() => {
    if (!flyToCode || !map.current) return;
    const entry = COUNTRY_CENTERS[flyToCode];
    if (entry) {
      map.current.flyTo({ center: entry.center, zoom: entry.zoom, duration: 1600, curve: 1.2, essential: true });
    }
  }, [flyToCode]);

  // Fly to explicit position (conflict-specific view)
  useEffect(() => {
    if (!flyToPosition || !map.current) return;
    map.current.flyTo({ center: flyToPosition.center, zoom: flyToPosition.zoom, duration: 1600, curve: 1.2, essential: true });
  }, [flyToPosition]);

  // ── Slow globe spin at Earth's real rotation rate ─────────────────────────
  // Spins whenever isIdle=true. Only a mousedown/touchstart pauses it;
  // releasing (mouseup/touchend) resumes immediately. Zoom level is irrelevant.
  useEffect(() => {
    const m = map.current;
    if (!m || !mapReady) return;

    const onDown = () => { hasInteracted.current = true; userInteracting.current = true; spinLastTs.current = null; };
    const onUp   = () => { userInteracting.current = false; };
    m.getCanvas().addEventListener("mousedown",  onDown);
    m.getCanvas().addEventListener("mouseup",    onUp);
    m.getCanvas().addEventListener("touchstart", onDown, { passive: true });
    m.getCanvas().addEventListener("touchend",   onUp);

    return () => {
      m.getCanvas().removeEventListener("mousedown",  onDown);
      m.getCanvas().removeEventListener("mouseup",    onUp);
      m.getCanvas().removeEventListener("touchstart", onDown);
      m.getCanvas().removeEventListener("touchend",   onUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  // ATLAS tap / X button reset: increment spinKey from the parent to resume spin.
  useEffect(() => {
    hasInteracted.current = false;
    spinLastTs.current = null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinKey]);

  // Panel close: when isIdle flips false → true (last widget closed), resume spin.
  useEffect(() => {
    if (isIdle && !prevIsIdle.current) {
      hasInteracted.current = false;
      spinLastTs.current = null;
    }
    prevIsIdle.current = isIdle;
  }, [isIdle]);

  useEffect(() => {
    const m = map.current;
    if (!m || !mapReady) return;

    const tick = (ts: number) => {
      spinFrameRef.current = requestAnimationFrame(tick);
      // Stop permanently once the user clicks/drags (hasInteracted).
      // Also pause (not permanently) when zoomed in past SPIN_STOP_ZOOM —
      // resumes automatically when the user zooms back out.
      if (!isIdle || hasInteracted.current || m.getZoom() > SPIN_STOP_ZOOM || spinDisabled) {
        spinLastTs.current = null;
        return;
      }
      if (spinLastTs.current === null) { spinLastTs.current = ts; return; }
      const dtSec = (ts - spinLastTs.current) / 1000;
      spinLastTs.current = ts;
      const c = m.getCenter();
      const newLng = c.lng - EARTH_DEG_PER_SEC * dtSec;
      // Write directly to Mapbox's internal transform instead of setCenter().
      // setCenter → jumpTo → camera.stop() which cancels scroll-zoom animations.
      // Direct transform write + triggerRepaint() advances the globe without
      // interrupting any concurrent zoom/flyTo animation.
      const tr = (m as any).transform;
      if (tr?.center !== undefined) {
        tr.center = new mapboxgl.LngLat(newLng, c.lat);
        m.triggerRepaint();
      } else {
        m.setCenter([newLng, c.lat]);
      }
    };

    spinFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (spinFrameRef.current !== null) cancelAnimationFrame(spinFrameRef.current);
      spinFrameRef.current = null;
      spinLastTs.current = null;
    };
  }, [isIdle, mapReady]);

  // ── Naked earth: hide all overlays when idle, restore when active ──────────
  // Uses paint opacity throughout — more reliable than layout visibility because
  // it survives Mapbox style reloads and doesn't undo permanent load-time hides
  // (road layers etc. that were set to visibility="none" at init stay hidden).
  const isIdleRef = useRef(isIdle);
  isIdleRef.current = isIdle;

  useEffect(() => {
    const m = map.current;
    if (!m || !mapReady) return;

    const apply = (idle: boolean) => {
      // Passing `undefined` to setPaintProperty on runtime (addLayer) layers falls
      // back to the Mapbox SPEC default (1.0), not the addLayer value — solid fills.
      // Every layer that isn't idle uses an explicit value or its correct expression.
      if (idle) {
        // ── Hide everything when idle ──────────────────────────────────────────
        if (m.getLayer("world-hit")) try { m.setPaintProperty("world-hit", "fill-opacity", 0); } catch {}
        for (const iso of HIGHLIGHTED) {
          if (m.getLayer(`highlighted-fill-${iso}`)) try { m.setPaintProperty(`highlighted-fill-${iso}`, "fill-opacity", 0); } catch {}
        }
        ["casualty-fill-blue","casualty-fill-red","idle-pulse-blue","idle-pulse-red","hover-fill",
        ].forEach(id => { if (m.getLayer(id)) try { m.setPaintProperty(id, "fill-opacity", 0); } catch {} });
        ["hover-border","secondary-border"].forEach(id => {
          if (m.getLayer(id)) try { m.setPaintProperty(id, "line-opacity", 0); } catch {}
        });
        ["events-halo","events-glow","events-dot",
         "strike-outer-halo","strike-halo","strike-glow","strike-core","strike-dot",
        ].forEach(id => { if (m.getLayer(id)) try { m.setPaintProperty(id, "circle-opacity", 0); } catch {} });
      } else {
        // ── Restore when active — explicit values only, never undefined ────────
        // world-hit: near-invisible hit target
        if (m.getLayer("world-hit")) try { m.setPaintProperty("world-hit", "fill-opacity", 0.001); } catch {}
        // Highlighted fills: restore zoom-interpolated translucent expressions
        for (const iso of HIGHLIGHTED) {
          if (!m.getLayer(`highlighted-fill-${iso}`)) continue;
          const [fs, fe] = COUNTRY_FADE_RANGES[iso] ?? [FADE_START, FADE_END];
          try { m.setPaintProperty(`highlighted-fill-${iso}`, "fill-opacity",
            ["interpolate", ["linear"], ["zoom"], fs, 0.48, fe, 0] as never); } catch {}
        }
        // Casualty / pulse: 0 — their own effects (casualtyCountries, animateIdle) drive them
        ["casualty-fill-blue","casualty-fill-red","idle-pulse-blue","idle-pulse-red",
        ].forEach(id => { if (m.getLayer(id)) try { m.setPaintProperty(id, "fill-opacity", 0); } catch {} });
        // hover-fill: restore feature-state expression
        if (m.getLayer("hover-fill")) try { m.setPaintProperty("hover-fill", "fill-opacity", [
          "case", ["boolean", ["feature-state", "hover"], false],
          ["interpolate", ["linear"], ["zoom"], FADE_START, 0.5, FADE_END, 0], 0
        ] as never); } catch {}
        // Borders: 0 — selectedCountry / secondaryCountries effects set them when needed
        ["hover-border","secondary-border"].forEach(id => {
          if (m.getLayer(id)) try { m.setPaintProperty(id, "line-opacity", 0); } catch {}
        });
        // Events: restore their defined opacities
        if (m.getLayer("events-halo")) try { m.setPaintProperty("events-halo", "circle-opacity", 0.07); } catch {}
        if (m.getLayer("events-glow")) try { m.setPaintProperty("events-glow", "circle-opacity", 0.20); } catch {}
        if (m.getLayer("events-dot"))  try { m.setPaintProperty("events-dot",  "circle-opacity", 0.50); } catch {}
        // Strike layers: 0 — activeStrikes effect manages them
        ["strike-outer-halo","strike-halo","strike-glow","strike-core","strike-dot",
        ].forEach(id => { if (m.getLayer(id)) try { m.setPaintProperty(id, "circle-opacity", 0); } catch {} });
      }
      // Mapbox style symbol / admin layers are handled by the 8-second reveal
      // animation on load — they stay at their revealed opacity permanently.
    };

    apply(isIdle);
  }, [isIdle, mapReady]);

  // ── 8-second sequential reveal: naked → borders → ocean → countries → cities ──
  useEffect(() => {
    const m = map.current;
    if (!m || !mapReady) return;
    const phases = revealLayersRef.current;
    if (!phases) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const frames: number[] = [];

    // Animate a set of layers from 0 → target opacity over 2 000 ms (smoothstep)
    const animateIn = (
      ids: string[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prop: any,
      getTarget: (id: string) => number,
      delay: number,
      onDone?: () => void,
    ) => {
      timers.push(setTimeout(() => {
        const start = performance.now();
        const step = () => {
          const cur = map.current;
          if (!cur) return;
          const t = Math.min(1, (performance.now() - start) / 2000);
          const ease = t * t * (3 - 2 * t); // smoothstep
          ids.forEach(id => {
            try { cur.setPaintProperty(id, prop, getTarget(id) * ease); } catch {}
          });
          if (t < 1) frames.push(requestAnimationFrame(step));
          else onDone?.();
        };
        frames.push(requestAnimationFrame(step));
      }, delay));
    };

    const borderMap: Record<string, number> = {};
    phases.borders.forEach(b => { borderMap[b.id] = b.targetOpacity; });

    // Phase 1 (0–2 s): admin borders
    animateIn(phases.borders.map(b => b.id), "line-opacity", id => borderMap[id] ?? 0, 0);
    // Phase 2 (2–4 s): water / ocean / natural feature labels
    animateIn(phases.ocean, "text-opacity", () => 1, 2000);
    animateIn(phases.ocean, "icon-opacity", () => 1, 2000);
    // Phase 3: country labels — deferred to first click (staggered closest→farthest)
    // phases.countries stays at opacity 0 until user taps the globe

    // Phase 4 (4–6 s): city / settlement labels — mark done when complete
    animateIn(phases.cities, "text-opacity", () => 1, 4000, () => { revealDoneRef.current = true; });
    animateIn(phases.cities, "icon-opacity", () => 1, 4000);

    // After reveal completes, re-apply full opacity if Mapbox reloads style data
    const onStyleData = () => {
      if (!revealDoneRef.current || !map.current) return;
      const cur = map.current;
      phases.borders.forEach(({ id, targetOpacity }) => {
        try { cur.setPaintProperty(id, "line-opacity", targetOpacity); } catch {}
      });
      [...phases.ocean, ...(labelsRevealedRef.current ? phases.countries : []), ...phases.cities].forEach(id => {
        try { cur.setPaintProperty(id, "text-opacity", 1); } catch {}
        try { cur.setPaintProperty(id, "icon-opacity", 1); } catch {}
      });
    };
    m.on("styledata", onStyleData);

    return () => {
      timers.forEach(clearTimeout);
      frames.forEach(cancelAnimationFrame);
      m.off("styledata", onStyleData);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  // Secondary (conflict partner) border — turquoise
  useEffect(() => {
    const m = map.current;
    if (!m || !m.getLayer("secondary-border")) return;
    const worldviewFilter = ["any", ["==", ["get", "worldview"], "all"], ["==", ["get", "worldview"], "US"]];
    if (secondaryCountries.length > 0) {
      m.setFilter("secondary-border", [
        "all", worldviewFilter,
        ["in", ["get", "iso_3166_1_alpha_3"], ["literal", secondaryCountries]],
      ]);
      m.setPaintProperty("secondary-border", "line-opacity",
        ["interpolate", ["linear"], ["zoom"], FADE_START, 0.6, FADE_END, 0] as never
      );
    } else {
      m.setFilter("secondary-border", ["all", worldviewFilter, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", [""]]]]);
      m.setPaintProperty("secondary-border", "line-opacity", 0);
    }
  }, [secondaryCountries]);

  // Casualty country highlight — side-colored fills + pulse when "+more" is tapped
  useEffect(() => {
    const m = map.current;
    if (!m || !m.getLayer("casualty-fill-blue")) return;
    const wf = ["any", ["==", ["get", "worldview"], "all"], ["==", ["get", "worldview"], "US"]];
    const extra = casualtyCountries.filter(c => !HIGHLIGHTED.includes(c));
    const extraBlue = extra.filter(c => COUNTRY_SIDE[c] === "blue");
    const extraRed  = extra.filter(c => COUNTRY_SIDE[c] === "red");
    const extraNeutral = extra.filter(c => !COUNTRY_SIDE[c]);

    const effectiveH = (focusCountries && focusCountries.length > 0)
      ? HIGHLIGHTED.filter(c => focusCountries.includes(c))
      : HIGHLIGHTED;
    const blueH = effectiveH.filter(c => COUNTRY_SIDE[c] === "blue");
    const redH  = effectiveH.filter(c => COUNTRY_SIDE[c] === "red");
    const neutH = effectiveH.filter(c => !COUNTRY_SIDE[c]);

    const empty = ["all", wf, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", [""]]]];

    m.setFilter("casualty-fill-blue", extraBlue.length || extraNeutral.length
      ? ["all", wf, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", [...extraBlue, ...extraNeutral]]]]
      : empty);
    m.setFilter("casualty-fill-red", extraRed.length
      ? ["all", wf, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", extraRed]]]
      : empty);
    m.setFilter("idle-pulse-blue", ["all", wf, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", [...blueH, ...neutH, ...extraBlue, ...extraNeutral]]]]);
    m.setFilter("idle-pulse-red",  ["all", wf, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", [...redH, ...extraRed]]]]);
  }, [casualtyCountries, focusCountries]);


  // Strike marker animation — fast scroll: instant, pause: sequential reveal
  useEffect(() => {
    const m = map.current;
    if (!m || !m.getSource("strikes")) return;

    const setData = (strikes: StrikeMarker[]) => {
      (m.getSource("strikes") as mapboxgl.GeoJSONSource).setData({
        type: "FeatureCollection",
        features: strikes.map((s, idx) => ({
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: [s.lng, s.lat] },
          properties: {
            color: s.side === "amber" ? "#3b82f6" : "#e11d48",
            label: s.label ?? "",
            idx,
            confidence: s.confidence ?? 0,
            sources: JSON.stringify(s.sources ?? []),
          },
        })),
      });
    };

    // Clear pending timers
    strikeTimers.current.forEach(t => clearTimeout(t));
    strikeTimers.current = [];

    if (!activeStrikes || activeStrikes.strikes.length === 0) {
      currentStrikes.current = [];
      setData([]);
      return;
    }

    const now = Date.now();
    const timeSinceLast = now - lastStrikeTs.current;
    lastStrikeTs.current = now;
    const isFastScroll = timeSinceLast < 500;

    if (isFastScroll) {
      // Fast scroll: show all strikes at once, no fly
      currentStrikes.current = activeStrikes.strikes;
      setData(currentStrikes.current);
    } else {
      // Paused on this event: fly to center, then reveal strikes one by one
      m.flyTo({ center: activeStrikes.center, zoom: activeStrikes.zoom, duration: 1600, curve: 1.3, essential: true });
      currentStrikes.current = [];
      setData([]);
      activeStrikes.strikes.forEach((strike, i) => {
        const t = setTimeout(() => {
          currentStrikes.current = [...currentStrikes.current, strike];
          setData(currentStrikes.current);
        }, 400 + i * 380);
        strikeTimers.current.push(t);
      });
    }

    return () => {
      strikeTimers.current.forEach(t => clearTimeout(t));
    };
  }, [activeStrikes]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      projection: "globe" as never,
      center: [-98.5, 39.5],
      zoom: 1.8,
      antialias: true,
      fadeDuration: 0,
      pitchWithRotate: false,
      dragRotate: false,
      touchPitch: false,
      doubleClickZoom: false,
      minPitch: 0,
      maxPitch: 0,
    });

    // Lock bearing and pitch — prevent any rotation or tilt
    map.current.setBearing(0);
    map.current.setPitch(0);
    map.current.touchZoomRotate.disableRotation();

    // Inverted scroll zoom: intercept before Mapbox, re-dispatch with negated deltaY
    // Keeps all native Mapbox behavior: cursor-centered, smooth inertia, trackpad support
    map.current.scrollZoom.setWheelZoomRate(1 / 36); // ~4.9x faster than default
    const _processed = new WeakSet<Event>();
    const _wheelHandler = (e: WheelEvent) => {
      if (_processed.has(e)) return; // our re-dispatched event — let Mapbox handle it
      if (e.ctrlKey) return; // pinch gesture — let Mapbox handle natively (ctrlKey=true on Mac trackpad)
      e.preventDefault();
      e.stopPropagation();
      const inverted = new WheelEvent("wheel", {
        deltaX: e.deltaX, deltaY: -e.deltaY, deltaZ: e.deltaZ, deltaMode: e.deltaMode,
        clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY,
        ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey,
        bubbles: true, cancelable: true, composed: true,
      });
      _processed.add(inverted);
      map.current!.getCanvas().dispatchEvent(inverted);
    };
    mapContainer.current!.addEventListener("wheel", _wheelHandler, { capture: true, passive: false });

    // Reveal canvas only after every tile has finished rendering at least once
    // Small extra delay ensures no blink between tile-ready and overlay removal
    map.current.once("idle", () => { setTimeout(() => { setMapReady(true); onReady?.(); }, 250); });

    map.current.on("load", () => {
      const m = map.current!;

      m.getStyle().layers.forEach((l) => {
        // Hide all road, transit, path, tunnel, bridge layers
        if (
          l.id.includes("road") || l.id.includes("tunnel") || l.id.includes("bridge") ||
          l.id.includes("path") || l.id.includes("transit") || l.id.includes("motorway") ||
          l.id.includes("highway") || l.id.includes("street") || l.id.includes("turning") ||
          l.id.includes("ferry") || l.id.includes("aeroway") || l.id.includes("rail") ||
          l.id.includes("service") || l.id.includes("trunk") || l.id.includes("link") ||
          l.id.includes("pedestrian") || l.id.includes("steps") || l.id.includes("case")
        ) m.setLayoutProperty(l.id, "visibility", "none");
        if (l.id.includes("continent")) m.setLayoutProperty(l.id, "visibility", "none");

        // Country borders: admin-0 (national) bright, admin-1 (state/province) subtle
        if (l.id.includes("admin") && l.type === "line") {
          try {
            if (l.id.includes("admin-0")) {
              m.setPaintProperty(l.id, "line-color", "rgba(255,255,255,0.7)");
              m.setPaintProperty(l.id, "line-width", 0.55);
              m.setPaintProperty(l.id, "line-opacity", 0.6);
            } else if (l.id.includes("admin-1")) {
              m.setPaintProperty(l.id, "line-color", "rgba(255,255,255,0.45)");
              m.setPaintProperty(l.id, "line-width", 0.5);
              m.setPaintProperty(l.id, "line-opacity", 0.55);
            } else {
              m.setLayoutProperty(l.id, "visibility", "none");
            }
          } catch {}
        }
        if (l.type === "symbol") {
          try { m.setLayoutProperty(l.id, "text-transform", "lowercase"); } catch {}
          // Pin ALL text labels to the globe surface — states, provinces,
          // regions, settlements — so nothing floats off the limb into space.
          try { m.setLayoutProperty(l.id, "text-pitch-alignment", "map"); } catch {}
          try { m.setLayoutProperty(l.id, "text-rotation-alignment", "map"); } catch {}
          try { m.setLayoutProperty(l.id, "symbol-avoid-edges", true); } catch {}
        }

        // Country labels: pin to globe surface so they behave like paint on
        // a physical globe — fixed in place, invisible when facing away.
        if (l.id.includes("country-label")) {
          try {
            const sz = m.getLayoutProperty(l.id, "text-size");
            if (typeof sz === "number") {
              m.setLayoutProperty(l.id, "text-size", Math.max(6, sz - 2));
            } else if (Array.isArray(sz) && sz[0] === "interpolate") {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const mod: any[] = [...sz];
              for (let i = 4; i < mod.length; i += 2) {
                if (typeof mod[i] === "number") mod[i] = Math.max(6, mod[i] - 2);
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              m.setLayoutProperty(l.id, "text-size", mod as any);
            }
            // (pitch/rotation/avoid-edges applied globally to all symbol layers above)
          } catch {}
        }

        // City/settlement dots: translucent blue, no border, smaller
        if ((l.id.startsWith("settlement") || l.id.includes("place-city") || l.id.includes("place-town")) && l.type === "symbol") {
          try {
            m.setPaintProperty(l.id, "icon-color", "rgba(30,58,138,0.55)");
            m.setPaintProperty(l.id, "icon-halo-width", 0);
            const iconSize = m.getLayoutProperty(l.id, "icon-size");
            if (typeof iconSize === "number") m.setLayoutProperty(l.id, "icon-size", iconSize * 0.75);
            else m.setLayoutProperty(l.id, "icon-size", 0.6);
          } catch {}
        }

        try {
          if (l.id === "settlement-major-label") {
            m.setLayerZoomRange(l.id, 3, 24);
          } else if (l.id === "settlement-minor-label") {
            m.setLayerZoomRange(l.id, 10, 24);
          } else if (l.id === "settlement-subdivision-label") {
            m.setLayerZoomRange(l.id, 13, 24);
          } else if (l.id.includes("place-city")) {
            m.setLayerZoomRange(l.id, 4, 24);
          } else if (l.id.includes("place-town")) {
            m.setLayerZoomRange(l.id, 10, 24);
          } else if (l.id.includes("place-village") || l.id.includes("place-neighborhood") || l.id.includes("place-suburb")) {
            m.setLayerZoomRange(l.id, 13, 24);
          }
        } catch {}
      });

      m.setFog({
        color: "rgb(0,0,0)",
        "high-color": "rgb(0,0,0)",
        "space-color": "rgb(0,0,0)",
        "horizon-blend": 0.08,
        "star-intensity": 0.08,
      } as never);

      m.addSource("country-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });

      const worldviewFilter = [
        "any",
        ["==", ["get", "worldview"], "all"],
        ["==", ["get", "worldview"], "US"],
      ];

      // Per-country highlighted fills — color based on side (blue/red), zoom expression handles fade
      for (const iso of HIGHLIGHTED) {
        const [fs, fe] = COUNTRY_FADE_RANGES[iso] ?? [FADE_START, FADE_END];
        const side = COUNTRY_SIDE[iso] as "blue" | "red" | undefined;
        const fillColor = SIDE_COLORS[side ?? "blue"].fill;
        m.addLayer({
          id: `highlighted-fill-${iso}`,
          type: "fill",
          source: "country-boundaries",
          "source-layer": "country_boundaries",
          filter: ["all", worldviewFilter, ["==", ["get", "iso_3166_1_alpha_3"], iso]],
          paint: { "fill-color": fillColor, "fill-opacity": ["interpolate", ["linear"], ["zoom"], fs, 0.48, fe, 0] as never },
        });
      }


      // Casualty highlight fills — side-colored, shown when "+more" is tapped
      const blueHighlighted = HIGHLIGHTED.filter(c => COUNTRY_SIDE[c] === "blue");
      const redHighlighted  = HIGHLIGHTED.filter(c => COUNTRY_SIDE[c] === "red");
      const neutralHighlighted = HIGHLIGHTED.filter(c => !COUNTRY_SIDE[c]);

      m.addLayer({
        id: "casualty-fill-blue",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: ["all", worldviewFilter, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", [""]]]],
        paint: { "fill-color": SIDE_COLORS.blue.fill, "fill-opacity": ["interpolate", ["linear"], ["zoom"], FADE_START, 0.48, FADE_END, 0] as never },
      });
      m.addLayer({
        id: "casualty-fill-red",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: ["all", worldviewFilter, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", [""]]]],
        paint: { "fill-color": SIDE_COLORS.red.fill, "fill-opacity": ["interpolate", ["linear"], ["zoom"], FADE_START, 0.48, FADE_END, 0] as never },
      });

      // Idle pulse — split by side (blue glow on allied, maroon glow on adversary)
      m.addLayer({
        id: "idle-pulse-blue",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: ["all", worldviewFilter, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", [...blueHighlighted, ...neutralHighlighted]]]],
        paint: { "fill-color": SIDE_COLORS.blue.pulse, "fill-opacity": 0 },
      });
      m.addLayer({
        id: "idle-pulse-red",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: ["all", worldviewFilter, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", redHighlighted]]],
        paint: { "fill-color": SIDE_COLORS.red.pulse, "fill-opacity": 0 },
      });

      // ── Desert border casing: single warm line, opacity driven by aridity ──
      // Per-country aridity score 0→1. Green countries (SLE, LBR, GIN…) get 0
      // by default — only countries with meaningful arid terrain are listed.
      // Global coverage: Sahara, Horn, Arabian Peninsula, Middle East,
      // Central Asia, Southern Africa, South America, Australia, Gobi.
      const aridityOpacity = ["match", ["get", "iso_3166_1_alpha_3"],
        // Near-pure desert (Saharan core + Arabian Peninsula)
        ["ESH","DZA","LBY","EGY","SAU","ARE","QAT","BHR","KWT","OMN"], 0.92,
        // High desert (Sahara fringe + Horn + Central Asia core)
        ["MRT","NER","MLI","DJI","YEM","AFG","TKM","NAM"], 0.82,
        // Semi-arid Middle East + Central Asia
        ["MAR","SDN","PAK","IRQ","JOR","SYR","IRN","UZB","SOM","ERI","BWA"], 0.72,
        // Arid/Mediterranean mix + Gobi + Australia
        ["TUN","ISR","PSE","LBN","TJK","KGZ","KAZ","TCD","AZE","MNG","AUS"], 0.60,
        // Semi-arid savanna / steppe (Sahel, Turkey, India Thar, S.America)
        ["ETH","BFA","TUR","ARM","IND","PER","CHL","MEX","ZWE","ZAF","CHN"], 0.44,
        // Dry savanna / light bush (fades toward green)
        ["SEN","GMB","KEN","TZA","MOZ","NGA","CMR","UGA","ARG"], 0.22,
        // Default = 0 (fully green: SLE, LBR, GIN, CIV, GHA, TGO, BEN, etc.)
        0,
      ] as never;

      m.addLayer({
        id: "desert-casing-line",
        type: "line",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: worldviewFilter as never,
        paint: {
          // Warm amber-white — clearly distinct from the cool white admin line,
          // so desert borders read as a different colour, not just a doubled line.
          "line-color": "rgba(255, 215, 140, 0.92)",
          // Wider than the admin line so it's actually visible at globe zoom.
          // Sits on top of the 0.55px white admin line and dominates in arid regions.
          "line-width": ["interpolate", ["linear"], ["zoom"], 1, 1.2, 5, 1.8, 10, 2.6] as never,
          "line-blur":  0.4,
          "line-opacity": aridityOpacity,
        },
        layout: { "line-cap": "round", "line-join": "round" },
      });

      const conflictFilter = [
        "all",
        worldviewFilter,
        ["in", ["get", "iso_3166_1_alpha_3"], ["literal", ALL_HOVERABLE]],
      ];

      // Invisible hit layer — conflict countries only, so scroll/mouse only picks them up
      m.addLayer({
        id: "world-hit",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: conflictFilter,
        paint: { "fill-color": "#000000", "fill-opacity": 0.001 },
      });

      // Fill — conflict countries, shows on hover/scroll
      m.addLayer({
        id: "hover-fill",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: conflictFilter,
        paint: {
          "fill-color": "#1e3a5f",
          "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.38, 0] as never,
        },
      });

      // Selected border — clean
      m.addLayer({
        id: "hover-border",
        type: "line",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: conflictFilter,
        paint: { "line-color": "rgba(255,255,255,0.85)", "line-width": 0.9, "line-blur": 0, "line-opacity": 0 },
      });

      // Secondary border — conflict partners
      m.addLayer({
        id: "secondary-border",
        type: "line",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: ["all", worldviewFilter, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", [""]]]],
        paint: { "line-color": "rgba(255,255,255,0.75)", "line-width": 0.7, "line-blur": 0, "line-opacity": 0 },
      });

      // Oslo Agreement — West Bank subdivisions by CLASS
      // Hidden by default; shown when PSE or ISR is selected
      m.addSource("oslo-agreement", {
        type: "geojson",
        data: "/oslo-agreement.geojson",
      });
      // Area C, H2, East Jerusalem, No Man's Land → deep blue (Israeli-administered)
      m.addLayer({
        id: "oslo-fill-israeli",
        type: "fill",
        source: "oslo-agreement",
        filter: ["in", ["get", "CLASS"], ["literal", ["C", "H2", "Israeli Declared East Jerusalem", "No Man's Land"]]],
        paint: { "fill-color": "#0d2a52", "fill-opacity": 0 },
      });
      // Area B + Nature Reserve → dark purple (joint control, midpoint of blue+red)
      m.addLayer({
        id: "oslo-fill-joint",
        type: "fill",
        source: "oslo-agreement",
        filter: ["in", ["get", "CLASS"], ["literal", ["B", "Nature Reserve"]]],
        paint: { "fill-color": "#24193a", "fill-opacity": 0 },
      });
      // Area A, H1 → deep red (Palestinian full control, ~18%)
      m.addLayer({
        id: "oslo-fill-palestinian",
        type: "fill",
        source: "oslo-agreement",
        filter: ["in", ["get", "CLASS"], ["literal", ["A", "H1"]]],
        paint: { "fill-color": "#3b0f1f", "fill-opacity": 0 },
      });
      // Border on all zones
      m.addLayer({
        id: "oslo-border",
        type: "line",
        source: "oslo-agreement",
        filter: ["!=", ["get", "CLASS"], "No Man's Land"],
        paint: {
          "line-color": "rgba(255,255,255,0.25)",
          "line-width": 0.8,
          "line-opacity": 0,
        },
      });

      // Israel proper fill for Oslo mode — same color/opacity as West Bank Israeli zones
      m.addLayer({
        id: "oslo-fill-isr-country",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: ["all", worldviewFilter, ["==", ["get", "iso_3166_1_alpha_3"], "ISR"]] as never,
        paint: { "fill-color": "#0d2a52", "fill-opacity": 0 },
      });

      // (No Man's Land is now part of oslo-fill-israeli — no separate layer needed)

      // Crisis event dots
      m.addSource("events", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: MOCK_EVENTS.map((e) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [e.lng, e.lat] },
            properties: { title: e.title, type: e.type, color: TYPE_COLORS[e.type] },
          })),
        },
      });

      // Neon dot: outer halo → mid glow → bright core (no stroke)
      m.addLayer({
        id: "events-halo",
        type: "circle",
        source: "events",
        paint: { "circle-radius": 10, "circle-color": ["get", "color"], "circle-opacity": 0.07, "circle-blur": 0.3, "circle-stroke-width": 0 },
      });
      m.addLayer({
        id: "events-glow",
        type: "circle",
        source: "events",
        paint: { "circle-radius": 5, "circle-color": ["get", "color"], "circle-opacity": 0.20, "circle-blur": 0.3, "circle-stroke-width": 0 },
      });
      m.addLayer({
        id: "events-dot",
        type: "circle",
        source: "events",
        paint: { "circle-radius": 3, "circle-color": ["get", "color"], "circle-opacity": 0.50, "circle-blur": 0, "circle-stroke-width": 0 },
      });


      // Strike markers source + layers
      m.addSource("strikes", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      // Strike markers — layered for holographic depth effect
      m.addLayer({
        id: "strike-outer-halo",
        type: "circle",
        source: "strikes",
        paint: { "circle-radius": 22, "circle-color": ["get", "color"], "circle-opacity": 0.04, "circle-blur": 1.2, "circle-stroke-width": 0 },
      });
      m.addLayer({
        id: "strike-halo",
        type: "circle",
        source: "strikes",
        paint: { "circle-radius": 14, "circle-color": ["get", "color"], "circle-opacity": 0.10, "circle-blur": 0.8, "circle-stroke-width": 0 },
      });
      m.addLayer({
        id: "strike-glow",
        type: "circle",
        source: "strikes",
        paint: { "circle-radius": 7, "circle-color": ["get", "color"], "circle-opacity": 0.35, "circle-blur": 0.6, "circle-stroke-width": 0 },
      });
      m.addLayer({
        id: "strike-core",
        type: "circle",
        source: "strikes",
        paint: { "circle-radius": 4.2, "circle-color": ["get", "color"], "circle-opacity": 0.85, "circle-blur": 0.1, "circle-stroke-width": 0 },
      });
      m.addLayer({
        id: "strike-dot",
        type: "circle",
        source: "strikes",
        paint: { "circle-radius": 2, "circle-color": "#ffffff", "circle-opacity": 0.70, "circle-blur": 0, "circle-stroke-width": 0 },
      });

      // --- Idle pulse: 5fps, paused during zoom and during naked-earth idle state ---
      let isZooming = false;
      let lastPulseTs = 0;
      const animateIdle = (ts: number) => {
        if (!pulseStart.current) pulseStart.current = ts;
        if (!isZooming && ts - lastPulseTs >= 200 && !isIdleRef.current) {
          lastPulseTs = ts;
          const t = (ts - pulseStart.current) / 2800;
          const base = 0.06 + 0.12 * Math.abs(Math.sin(t * Math.PI));
          const z = m.getZoom();
          const zf = Math.max(0, Math.min(1, 1 - (z - FADE_START) / (FADE_END - FADE_START)));
          m.setPaintProperty("idle-pulse-blue", "fill-opacity", base * zf);
          m.setPaintProperty("idle-pulse-red", "fill-opacity", base * zf);
        }
        idlePulseFrame.current = requestAnimationFrame(animateIdle);
      };
      idlePulseFrame.current = requestAnimationFrame(animateIdle);

      // --- Shared hover state helpers ---
      const setHovered = (id: string | number | null, code?: string, name?: string, point?: { x: number; y: number }) => {
        // clear previous
        if (hoveredId.current !== null) {
          m.setFeatureState({ source: "country-boundaries", sourceLayer: "country_boundaries", id: hoveredId.current }, { hover: false });
        }
        hoveredId.current = id;
        if (id !== null) {
          m.setFeatureState({ source: "country-boundaries", sourceLayer: "country_boundaries", id }, { hover: true });
        }
        if (name && point) {
          setTooltip({ x: point.x, y: point.y, name, isHighlighted: HIGHLIGHTED.includes(code ?? "") });
        } else {
          setTooltip(null);
        }
      };

      // --- Center-based highlight (when mouse is idle) ---
      let _mouseActive = false;
      let _mouseIdleTimer: ReturnType<typeof setTimeout> | null = null;

      const highlightCenter = () => {
        if (_mouseActive) return;
        if (homeView) { setHovered(null); return; } // radar view — no auto-highlight
        const canvas = m.getCanvas();
        const cx = canvas.width / (window.devicePixelRatio || 1) / 2;
        const cy = canvas.height / (window.devicePixelRatio || 1) / 2;
        const features = m.queryRenderedFeatures([cx, cy] as [number, number], { layers: ["world-hit"] });
        if (features.length) {
          const f = features[0];
          const code = f.properties?.iso_3166_1_alpha_3 as string;
          const name = f.properties?.name_en as string;
          if (f.id !== hoveredId.current) {
            setHovered(f.id ?? null, code, name, { x: cx, y: cy - 40 });
          }
        } else {
          setHovered(null);
        }
      };

      // Pause JS during zoom — queryRenderedFeatures + setPaintProperty compete with tile rendering
      m.on("zoomstart", () => { isZooming = true; });
      m.on("zoomend",   () => { isZooming = false; highlightCenter(); });

      // Throttle center highlight — queryRenderedFeatures at 60fps is very expensive
      let lastHighlightTs = 0;
      m.on("move", () => {
        if (isZooming) return;
        const now = performance.now();
        if (now - lastHighlightTs < 120) return;
        lastHighlightTs = now;
        highlightCenter();
      });

      // --- Mouse overrides center ---
      m.on("mousemove", "world-hit", (e) => {
        _mouseActive = true;
        if (_mouseIdleTimer) clearTimeout(_mouseIdleTimer);
        // reset to center mode after 3s of no mouse movement
        _mouseIdleTimer = setTimeout(() => { _mouseActive = false; }, 3000);

        m.getCanvas().style.cursor = "pointer";
        const feature = e.features?.[0];
        if (!feature) return;
        const code = feature.properties?.iso_3166_1_alpha_3 as string;
        const name = feature.properties?.name_en as string;
        if (feature.id !== hoveredId.current) {
          setHovered(feature.id ?? null, code, name, { x: e.point.x, y: e.point.y });
        } else {
          setTooltip({ x: e.point.x, y: e.point.y, name, isHighlighted: HIGHLIGHTED.includes(code) });
        }
      });

      m.on("mouseleave", "world-hit", () => {
        m.getCanvas().style.cursor = "";
        _mouseActive = false;
        setHovered(null);
      });

      // Click: open panel + fly to country
      m.on("click", "world-hit", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const code = feature.properties?.iso_3166_1_alpha_3 as string;
        const entry = COUNTRY_CENTERS[code];
        if (entry) {
          m.flyTo({ center: entry.center, zoom: entry.zoom, duration: 1400, curve: 1.1, essential: true });
        }
        if (code) onCountryClick?.(code);
      });

      // Click empty map — panels stay locked; only explicit ✕ or ATLAS button closes them

      m.on("mouseenter", "events-dot", () => { m.getCanvas().style.cursor = "pointer"; });
      m.on("mouseleave", "events-dot", () => { m.getCanvas().style.cursor = ""; });

      // Strike dot click → show confidence + sources popup
      m.on("mouseenter", "strike-dot", () => { m.getCanvas().style.cursor = "pointer"; });
      m.on("mouseleave", "strike-dot", () => { m.getCanvas().style.cursor = ""; });
      let strikePopup: mapboxgl.Popup | null = null;
      m.on("click", "strike-dot", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        e.originalEvent.stopPropagation();
        const props = f.properties!;
        const label = props.label || "Strike";
        const confidence = props.confidence ?? 0;
        const sources: { label: string; url?: string }[] = (() => {
          try { return JSON.parse(props.sources || "[]"); } catch { return []; }
        })();
        const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number];

        // Confidence color
        const cc = confidence >= 90 ? "#22c55e" : confidence >= 80 ? "#86efac" : confidence >= 70 ? "#fbbf24" : "#f87171";
        const dotColor = props.color || "#e11d48";

        // Build popup HTML matching the atlas-popup + confidence style
        const html = `
          <div style="min-width:200px;max-width:280px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <span style="width:8px;height:8px;border-radius:50%;background:${dotColor};box-shadow:0 0 8px ${dotColor}88;flex-shrink:0"></span>
              <span style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.92);letter-spacing:0.02em">${label}</span>
            </div>
            ${confidence > 0 ? `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span style="font-size:8px;font-family:monospace;letter-spacing:0.12em;color:rgba(255,255,255,0.35);min-width:52px;text-transform:uppercase">confidence</span>
              <div style="width:80px;height:5px;border-radius:99px;background:rgba(255,255,255,0.10);overflow:hidden;flex-shrink:0">
                <div style="width:${confidence}%;height:100%;border-radius:99px;background:${cc}"></div>
              </div>
              <span style="font-size:9px;font-family:monospace;font-weight:700;color:${cc}">${confidence}%</span>
            </div>` : ""}
            ${sources.length > 0 ? `
            <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:7px;margin-top:4px">
              <span style="font-size:8px;font-family:monospace;letter-spacing:0.14em;color:rgba(255,255,255,0.22);text-transform:uppercase">sources</span>
              <div style="display:flex;flex-direction:column;gap:4px;margin-top:5px">
                ${sources.map(s => s.url
                  ? `<a href="${s.url}" target="_blank" rel="noopener" style="font-size:10px;font-family:monospace;color:rgba(96,165,250,0.7);text-decoration:none;letter-spacing:0.04em"
                      onmouseenter="this.style.color='rgba(147,197,253,1)'" onmouseleave="this.style.color='rgba(96,165,250,0.7)'">${s.label} ↗</a>`
                  : `<span style="font-size:10px;font-family:monospace;color:rgba(255,255,255,0.5);letter-spacing:0.04em">${s.label}</span>`
                ).join("")}
              </div>
            </div>` : ""}
          </div>
        `;

        if (strikePopup) strikePopup.remove();
        strikePopup = new mapboxgl.Popup({ className: "atlas-popup", closeButton: true, closeOnClick: false, maxWidth: "320px", offset: 14 })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(m);
      });

      // ── Collect layer phases for the 8-second reveal animation ─────────────
      {
        const borders: Array<{ id: string; targetOpacity: number }> = [];
        const ocean: string[] = [];
        const countries: string[] = [];
        const cities: string[] = [];

        m.getStyle().layers.forEach(l => {
          // Admin border lines — already styled above, now set to 0 for reveal
          if (l.type === "line" && l.id.includes("admin")) {
            const target = l.id.includes("admin-0") ? 0.6
                         : l.id.includes("admin-1") ? 0.55 : 0;
            if (target > 0) {
              borders.push({ id: l.id, targetOpacity: target });
              try { m.setPaintProperty(l.id, "line-opacity", 0); } catch {}
            }
            return;
          }
          if (l.type !== "symbol") return;
          // Skip layers already permanently hidden (roads, continents, etc.)
          try { if (m.getLayoutProperty(l.id, "visibility") === "none") return; } catch {}
          // Set to 0 — reveal animation will bring them in
          try { m.setPaintProperty(l.id, "text-opacity", 0); } catch {}
          try { m.setPaintProperty(l.id, "icon-opacity", 0); } catch {}
          const id = l.id;
          if (id.includes("water") || id.includes("ocean") || id.includes("sea") ||
              id.includes("bay") || id.includes("glacier") || id.includes("natural") ||
              id.includes("waterway") || id.includes("lake") || id.includes("landuse")) {
            ocean.push(id);
          } else if (id.includes("country") || id.includes("state") ||
                     id.includes("continent") || id.includes("region") || id.includes("province")) {
            countries.push(id);
          } else {
            cities.push(id); // settlements, places, POIs, road labels, etc.
          }
        });

        revealLayersRef.current = { borders, ocean, countries, cities };
      }

      // ── Country label stagger: reveal on first contact (mousedown/touch), closest→farthest ──
      const onFirstContact = (e: mapboxgl.MapMouseEvent | mapboxgl.MapTouchEvent) => {
        m.off("mousedown", onFirstContact);
        m.off("touchstart", onFirstContact);
        if (labelsRevealedRef.current) return;
        labelsRevealedRef.current = true;

        const phases = revealLayersRef.current;
        if (!phases) return;

        const validLayers = phases.countries.filter(id => { try { return !!m.getLayer(id); } catch { return false; } });
        if (!validLayers.length) return;

        // Query all visible country label features across the whole canvas
        const canvas = m.getCanvas();
        const features = m.queryRenderedFeatures(
          [[0, 0], [canvas.offsetWidth, canvas.offsetHeight]],
          { layers: validLayers }
        );

        // Fallback: show all at once if no features returned yet
        if (!features.length) {
          validLayers.forEach(id => {
            try { m.setPaintProperty(id, "text-opacity", 1); } catch {}
            try { m.setPaintProperty(id, "icon-opacity", 1); } catch {}
          });
          return;
        }

        // Deduplicate by name and sort by screen distance from click point
        const seenNames = new Set<string>();
        type LabelEntry = { name: string; coords: [number, number] };
        const entries: LabelEntry[] = [];
        features.forEach(f => {
          const name = String(f.properties?.name_en || f.properties?.name || "");
          if (!name || seenNames.has(name)) return;
          if (f.geometry.type !== "Point") return;
          seenNames.add(name);
          entries.push({ name, coords: (f.geometry as GeoJSON.Point).coordinates as [number, number] });
        });

        // touchstart has an array of points; use the first touch
        const pt = "points" in e && e.points?.length ? e.points[0] : e.point;
        const cx = pt.x, cy = pt.y;
        const sorted = entries
          .sort((a, b) => {
            const pa = m.project(a.coords), pb = m.project(b.coords);
            return Math.hypot(pa.x - cx, pa.y - cy) - Math.hypot(pb.x - cx, pb.y - cy);
          })
          .map(e => e.name);

        if (!sorted.length) {
          validLayers.forEach(id => {
            try { m.setPaintProperty(id, "text-opacity", 1); } catch {}
            try { m.setPaintProperty(id, "icon-opacity", 1); } catch {}
          });
          return;
        }

        const TOTAL = 1400; // ms spread across all countries
        const revealed: string[] = [];

        sorted.forEach((name, i) => {
          const delay = sorted.length > 1 ? (i / (sorted.length - 1)) * TOTAL : 0;
          const t = setTimeout(() => {
            revealed.push(name);
            const isLast = revealed.length === sorted.length;
            // Once all revealed, use plain 1 for performance
            const expr: never = isLast
              ? 1 as never
              : ["case", ["in", ["get", "name_en"], ["literal", [...revealed]]], 1, 0] as never;
            validLayers.forEach(id => {
              try { m.setPaintProperty(id, "text-opacity", expr); } catch {}
              try { m.setPaintProperty(id, "icon-opacity", expr); } catch {}
            });
          }, delay);
          labelRevealTimers.current.push(t);
        });
      };

      m.on("mousedown", onFirstContact);
      m.on("touchstart", onFirstContact);

      // No intro auto-scroll — user navigates manually
    });

    return () => {
      if (idlePulseFrame.current) cancelAnimationFrame(idlePulseFrame.current);
      labelRevealTimers.current.forEach(clearTimeout);
      mapContainer.current?.removeEventListener("wheel", _wheelHandler, { capture: true });
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#000" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      {/* Black overlay hides the map visually until tiles render — pointer-events:none keeps map interactive */}
      {!mapReady && (
        <div style={{ position: "absolute", inset: 0, background: "#000", pointerEvents: "none", zIndex: 1 }} />
      )}

      {osloTooltip && (
        <div style={{
          position: "absolute", left: osloTooltip.x + 14, top: osloTooltip.y - 36,
          pointerEvents: "none", zIndex: 6,
        }}>
          <div style={{
            background: "rgba(2,6,18,0.92)",
            border: `1px solid ${osloLocked.current ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)"}`,
            borderRadius: 4, padding: "5px 10px",
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", flexShrink: 0, display: "inline-block",
              background: osloTooltip.label === "Palestinian Control" ? "#3b0f1f"
                : osloTooltip.label === "Israeli–Palestinian Control" ? "#24193a"
                : "#0d2a52",
            }} />
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
              {osloTooltip.label}
            </span>
          </div>
        </div>
      )}

      {tooltip && (
        <div style={{ position: "absolute", left: tooltip.x + 14, top: tooltip.y - 40, pointerEvents: "none", zIndex: 5 }}>
          <div
            className={tooltip.isHighlighted ? "tooltip-pulse-border" : ""}
            style={{
              background: "rgba(2, 6, 18, 0.94)",
              border: `1px solid ${tooltip.isHighlighted ? "rgba(220,38,38,0.5)" : "rgba(59,130,246,0.4)"}`,
              borderRadius: "4px",
              padding: "5px 10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: tooltip.isHighlighted ? undefined : "0 0 16px rgba(59,130,246,0.1)",
            }}>
            <span
              className={tooltip.isHighlighted ? "tooltip-pulse-dot" : ""}
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: tooltip.isHighlighted ? "#ef4444" : "#3b82f6",
                boxShadow: tooltip.isHighlighted ? undefined : "0 0 6px #3b82f6",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.12em", fontFamily: "monospace" }}>
              ACTIVE CONFLICT
            </span>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}>
              {tooltip.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
