"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getPeriodConfig, type HistoricalOverlay } from "./historicalPeriods";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYXRsYXNib3N0b24iLCJhIjoiY21qejY1c211Nmt2azNlcHMwcnljOGR1dCJ9.Pnq-qa_giDk0LN95OpFvMg";

// Pre-highlighted blue + red pulse on hover
const HIGHLIGHTED = ["ISR", "LBN", "IRN"];

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
const COUNTRY_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  ISR: { center: [35.0, 31.5], zoom: 5.0 },
  LBN: { center: [35.5, 33.9], zoom: 5.5 },
  IRN: { center: [53.7, 32.4], zoom: 4.2 },
  PSE: { center: [34.3, 31.9], zoom: 5.5 },
  UKR: { center: [31.2, 48.4], zoom: 4.2 },
  RUS: { center: [37.6, 55.7], zoom: 3.0 },
  SDN: { center: [30.2, 15.6], zoom: 4.0 },
  MMR: { center: [96.1, 19.7], zoom: 4.2 },
  YEM: { center: [44.2, 15.5], zoom: 4.5 },
  COD: { center: [23.5, -3.0], zoom: 3.8 },
  HTI: { center: [-72.3, 18.9], zoom: 5.5 },
  MEX: { center: [-99.1, 23.6], zoom: 3.8 },
  CHN: { center: [104.2, 35.9], zoom: 3.0 },
  TWN: { center: [120.9, 23.7], zoom: 5.5 },
  SYR: { center: [38.3, 34.8], zoom: 5.0 },
  IRQ: { center: [44.4, 33.3], zoom: 4.8 },
  LBY: { center: [17.2, 26.3], zoom: 4.0 },
  AFG: { center: [67.7, 33.9], zoom: 4.5 },
  NGA: { center: [8.7,  9.1],  zoom: 4.2 },
  ETH: { center: [40.5, 9.1],  zoom: 4.2 },
  USA: { center: [-98.5, 39.5], zoom: 2.3 },  // US-centered full globe — Atlas HQ home
  // Gulf / casualty countries
  ARE: { center: [54.4, 23.4], zoom: 5.5 },  // UAE
  KWT: { center: [47.5, 29.3], zoom: 5.8 },  // Kuwait
  QAT: { center: [51.2, 25.3], zoom: 5.8 },  // Qatar
  LKA: { center: [80.7,  7.8], zoom: 5.5 },  // Sri Lanka
  JOR: { center: [36.2, 30.6], zoom: 5.0 },  // Jordan
  GBR: { center: [-2.0, 54.0], zoom: 4.0 },  // UK
  FRA: { center: [2.3,  46.2], zoom: 4.0 },  // France
};

const MOCK_EVENTS = [
  { id: 1,  lng: 34.8,  lat: 31.5,  title: "Israel — Active Conflict",  type: "conflict" },
  { id: 2,  lng: 35.5,  lat: 33.9,  title: "Lebanon — Active Conflict", type: "conflict" },
  { id: 3,  lng: 53.6,  lat: 32.4,  title: "Iran — Active Conflict",    type: "conflict" },
  { id: 4,  lng: 30.5,  lat: 50.4,  title: "Kyiv — Ongoing War",        type: "conflict" },
  { id: 5,  lng: 32.5,  lat: 15.5,  title: "Sudan Civil War",           type: "humanitarian" },
  { id: 6,  lng: 96.1,  lat: 19.7,  title: "Myanmar Civil War",         type: "conflict" },
  { id: 7,  lng: 44.2,  lat: 15.5,  title: "Yemen Civil War",           type: "conflict" },
  { id: 8,  lng: 2.3,   lat: 12.3,  title: "Sahel Insurgency",          type: "conflict" },
  { id: 9,  lng: 23.5,  lat: -3.0,  title: "DR Congo Conflict",         type: "conflict" },
  { id: 10, lng: -72.3, lat: 18.9,  title: "Haiti Crisis",              type: "humanitarian" },
  { id: 11, lng: -99.1, lat: 19.4,  title: "Mexico Cartel War",         type: "conflict" },
  { id: 12, lng: 120.9, lat: 23.7,  title: "Taiwan Strait Crisis",      type: "political" },
];

const TYPE_COLORS: Record<string, string> = {
  conflict:     "#ef4444",
  protest:      "#f97316",
  humanitarian: "#eab308",
  disaster:     "#60a5fa",
  political:    "#a78bfa",
};

interface StrikeMarker {
  lng: number;
  lat: number;
  side: "amber" | "crimson";
  label?: string;
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
  historicalYear?: number | null;
}

// Home view: centered on continental US, zoomed to show full country
const BOSTON: [number, number] = [-98.5, 39.5];
const BOSTON_ZOOM = 2.3;

// Zoom fade range — blue fills/borders disappear when zoomed in past these levels
const FADE_START = 3.5;
const FADE_END = 5.5;

export default function Map({ onCountryClick, flyToCode, flyToPosition, selectedCountry, secondaryCountries = [], activeStrikes, historicalYear }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const hoveredId = useRef<string | number | null>(null);
  const pulseStart = useRef<number | null>(null);
  // Strike animation
  const strikeTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastStrikeTs = useRef<number>(0);
  const currentStrikes = useRef<StrikeMarker[]>([]);
  const idlePulseFrame = useRef<number | null>(null);
  const panelOpenRef = useRef(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; isHighlighted: boolean } | null>(null);

  // When panel opens: hide fills, show border on selected country only
  // When panel closes: restore fills, hide border
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;
    if (!m.getLayer("hover-fill")) return;
    const panelOpen = !!selectedCountry;
    panelOpenRef.current = panelOpen;

    // Highlighted countries (ISR/LBN/IRN) fill — zoom fade handles this when panel is closed
    if (m.getLayer("highlighted-fill")) {
      if (panelOpen) {
        m.setPaintProperty("highlighted-fill", "fill-opacity", 0);
      }
      // when closing, zoom handler will restore correct faded value on next zoom event
      // trigger it immediately by dispatching current zoom
      else {
        const z = m.getZoom();
        const fadeStart = FADE_START, fadeEnd = FADE_END;
        const zf = Math.max(0, Math.min(1, 1 - (z - fadeStart) / (fadeEnd - fadeStart)));
        m.setPaintProperty("highlighted-fill", "fill-opacity", 0.72 * zf);
      }
    }
    // Hover fill (all countries)
    m.setPaintProperty("hover-fill", "fill-opacity",
      panelOpen ? 0 : ["case", ["boolean", ["feature-state", "hover"], false], 0.5, 0]
    );
    // Border: only the selected country gets it
    if (m.getLayer("hover-border")) {
      if (panelOpen && selectedCountry) {
        m.setFilter("hover-border", [
          "all",
          ["any", ["==", ["get", "worldview"], "all"], ["==", ["get", "worldview"], "US"]],
          ["==", ["get", "iso_3166_1_alpha_3"], selectedCountry],
        ]);
        m.setPaintProperty("hover-border", "line-opacity", 0.85);
      } else {
        m.setFilter("hover-border", [
          "all",
          ["any", ["==", ["get", "worldview"], "all"], ["==", ["get", "worldview"], "US"]],
          ["in", ["get", "iso_3166_1_alpha_3"], ["literal", ALL_HOVERABLE]],
        ]);
        m.setPaintProperty("hover-border", "line-opacity", 0);
      }
    }
  }, [selectedCountry]);

  // FlyTo when flyToCode changes from outside (search)
  useEffect(() => {
    if (!flyToCode || !map.current) return;
    const entry = COUNTRY_CENTERS[flyToCode];
    if (entry) {
      map.current.flyTo({ center: entry.center, zoom: entry.zoom, duration: 2800, curve: 1.4, essential: true });
    }
  }, [flyToCode]);

  // Fly to explicit position (conflict-specific view)
  useEffect(() => {
    if (!flyToPosition || !map.current) return;
    map.current.flyTo({ center: flyToPosition.center, zoom: flyToPosition.zoom, duration: 2400, curve: 1.4, essential: true });
  }, [flyToPosition]);

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
      m.setPaintProperty("secondary-border", "line-opacity", 0.75);
    } else {
      m.setFilter("secondary-border", ["all", worldviewFilter, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", [""]]]]);
      m.setPaintProperty("secondary-border", "line-opacity", 0);
    }
  }, [secondaryCountries]);

  // Strike marker animation — fast scroll: instant, pause: sequential reveal
  useEffect(() => {
    const m = map.current;
    if (!m || !m.getSource("strikes")) return;

    const setData = (strikes: StrikeMarker[]) => {
      (m.getSource("strikes") as mapboxgl.GeoJSONSource).setData({
        type: "FeatureCollection",
        features: strikes.map(s => ({
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: [s.lng, s.lat] },
          properties: { color: s.side === "amber" ? "#3b82f6" : "#e11d48", label: s.label ?? "" },
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

  // Historical year mode
  useEffect(() => {
    const m = map.current;
    if (!m) return;

    // Helper: wait until source/layers are ready
    const applyHistorical = () => {
      if (!m.getSource("historical-overlays")) return;

      if (historicalYear == null) {
        // Clear overlays only — country fills stay normal
        (m.getSource("historical-overlays") as mapboxgl.GeoJSONSource).setData({
          type: "FeatureCollection", features: [],
        });
        return;
      }

      const config = getPeriodConfig(historicalYear);
      if (!config) return;

      // 1. Fly to camera
      if (config.camera) {
        m.flyTo({ center: config.camera.center, zoom: config.camera.zoom, duration: 2000, curve: 1.4, essential: true });
      }

      // 2. Update overlay GeoJSON — outline-only (very low fill, line carries the color)
      const overlayFeatures = (config.overlays ?? []).map((ov: HistoricalOverlay) => ({
        type: "Feature" as const,
        geometry: { type: "Polygon" as const, coordinates: ov.coordinates },
        properties: { color: ov.color, opacity: ov.opacity, label: ov.label ?? "" },
      }));
      (m.getSource("historical-overlays") as mapboxgl.GeoJSONSource).setData({
        type: "FeatureCollection", features: overlayFeatures,
      });
    };

    if (m.isStyleLoaded()) {
      applyHistorical();
    } else {
      m.once("load", applyHistorical);
    }
  }, [historicalYear]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      projection: "globe" as never,
      center: [-98.5, 39.5],
      zoom: 1.8,
      antialias: true,
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

    map.current.on("load", () => {
      const m = map.current!;

      m.getStyle().layers.forEach((l) => {
        if (l.id.includes("road")) m.setLayoutProperty(l.id, "visibility", "none");
        if (l.type === "symbol") {
          try { m.setLayoutProperty(l.id, "text-transform", "lowercase"); } catch {}
        }
      });

      m.setFog({
        color: "rgb(0,0,0)",
        "high-color": "rgb(0,0,0)",
        "space-color": "rgb(0,0,0)",
        "horizon-blend": 0.02,
        "star-intensity": 0.35,
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

      // ISR + LBN + IRN — always blue
      m.addLayer({
        id: "highlighted-fill",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: ["all", worldviewFilter, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", HIGHLIGHTED]]],
        paint: { "fill-color": "#0d2a52", "fill-opacity": 0.72 },
      });

      m.addLayer({
        id: "highlighted-border",
        type: "line",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: ["all", worldviewFilter, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", HIGHLIGHTED]]],
        paint: { "line-color": "#3b82f6", "line-width": 1.2, "line-opacity": 0.7 },
      });

      // Idle red pulse — always on for HIGHLIGHTED (no hover needed)
      m.addLayer({
        id: "idle-pulse-fill",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: ["all", worldviewFilter, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", HIGHLIGHTED]]],
        paint: { "fill-color": "#ef4444", "fill-opacity": 0 },
      });

      // Hover red pulse layer
      m.addLayer({
        id: "pulse-fill",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: ["==", ["get", "iso_3166_1_alpha_3"], ""],
        paint: { "fill-color": "#dc2626", "fill-opacity": 0 },
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
          "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.5, 0],
        },
      });

      // Border — only shown on selected country when panel is open
      m.addLayer({
        id: "hover-border",
        type: "line",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: conflictFilter,
        paint: {
          "line-color": "#3b82f6",
          "line-width": 1.5,
          "line-opacity": 0,
        },
      });

      // Turquoise border — conflict partners of the selected country
      m.addLayer({
        id: "secondary-border",
        type: "line",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: ["all", worldviewFilter, ["in", ["get", "iso_3166_1_alpha_3"], ["literal", [""]]]],
        paint: {
          "line-color": "#2dd4bf",
          "line-width": 1.5,
          "line-opacity": 0,
        },
      });

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

      m.addLayer({
        id: "events-glow",
        type: "circle",
        source: "events",
        paint: { "circle-radius": 18, "circle-color": ["get", "color"], "circle-opacity": 0.1, "circle-blur": 1 },
      });

      m.addLayer({
        id: "events-dot",
        type: "circle",
        source: "events",
        paint: {
          "circle-radius": 5,
          "circle-color": ["get", "color"],
          "circle-opacity": 1,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Strike markers source + layers
      m.addSource("strikes", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      m.addLayer({
        id: "strike-outer-glow",
        type: "circle",
        source: "strikes",
        paint: { "circle-radius": 22, "circle-color": ["get", "color"], "circle-opacity": 0.08, "circle-blur": 1.8 },
      });
      m.addLayer({
        id: "strike-inner-glow",
        type: "circle",
        source: "strikes",
        paint: { "circle-radius": 11, "circle-color": ["get", "color"], "circle-opacity": 0.22, "circle-blur": 0.7 },
      });
      m.addLayer({
        id: "strike-dot",
        type: "circle",
        source: "strikes",
        paint: {
          "circle-radius": 5,
          "circle-color": ["get", "color"],
          "circle-opacity": 0.95,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-opacity": 0.65,
        },
      });

      // Historical overlays source + layers
      m.addSource("historical-overlays", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      m.addLayer({
        id: "historical-fill",
        type: "fill",
        source: "historical-overlays",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": ["get", "opacity"],
        },
      });
      m.addLayer({
        id: "historical-outline",
        type: "line",
        source: "historical-overlays",
        paint: {
          "line-color": ["get", "color"],
          "line-opacity": 0.75,
          "line-width": 1.8,
        },
      });

      // --- Zoom-based fade: blue fills/borders disappear when zoomed in ---
      let zoomFactor = 1;

      const applyZoomFade = () => {
        const z = m.getZoom();
        zoomFactor = Math.max(0, Math.min(1, 1 - (z - FADE_START) / (FADE_END - FADE_START)));
        if (!panelOpenRef.current) {
          if (m.getLayer("highlighted-fill"))
            m.setPaintProperty("highlighted-fill", "fill-opacity", 0.72 * zoomFactor);
          // Rebuild hover-fill expression scaled by zoom factor
          if (m.getLayer("hover-fill"))
            m.setPaintProperty("hover-fill", "fill-opacity",
              ["case", ["boolean", ["feature-state", "hover"], false], 0.5 * zoomFactor, 0]
            );
        }
        if (m.getLayer("highlighted-border"))
          m.setPaintProperty("highlighted-border", "line-opacity", 0.70 * zoomFactor);
        if (m.getLayer("hover-border"))
          m.setPaintProperty("hover-border", "line-opacity", panelOpenRef.current ? 0.85 * zoomFactor : 0);
        if (m.getLayer("secondary-border"))
          m.setPaintProperty("secondary-border", "line-opacity", 0.65 * zoomFactor);
      };

      // fire on every camera move (flyTo, pinch, scroll) and once immediately
      m.on("move", applyZoomFade);
      applyZoomFade();

      // --- Idle pulse: soft original style ---
      const animateIdle = (ts: number) => {
        if (!pulseStart.current) pulseStart.current = ts;
        const t = (ts - pulseStart.current) / 2800;
        const base = 0.06 + 0.12 * Math.abs(Math.sin(t * Math.PI));
        m.setPaintProperty("idle-pulse-fill", "fill-opacity", base * zoomFactor);
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

      m.on("move", highlightCenter);

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
          m.flyTo({ center: entry.center, zoom: entry.zoom, duration: 2000, curve: 1.2, essential: true });
        }
        if (code) onCountryClick?.(code);
      });

      // Click empty map → deselect
      m.on("click", (e) => {
        const features = m.queryRenderedFeatures(e.point, { layers: ["world-hit"] });
        if (!features.length) onCountryClick?.("");
      });

      m.on("mouseenter", "events-dot", () => { m.getCanvas().style.cursor = "pointer"; });
      m.on("mouseleave", "events-dot", () => { m.getCanvas().style.cursor = ""; });

      // No intro auto-scroll — user navigates manually
    });

    return () => {
      if (idlePulseFrame.current) cancelAnimationFrame(idlePulseFrame.current);
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {tooltip && (
        <div style={{ position: "absolute", left: tooltip.x + 14, top: tooltip.y - 40, pointerEvents: "none", zIndex: 5 }}>
          <div style={{
            background: "rgba(2, 6, 18, 0.94)",
            border: `1px solid ${tooltip.isHighlighted ? "rgba(220,38,38,0.5)" : "rgba(59,130,246,0.4)"}`,
            borderRadius: "4px",
            padding: "5px 10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: `0 0 16px ${tooltip.isHighlighted ? "rgba(220,38,38,0.15)" : "rgba(59,130,246,0.1)"}`,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: tooltip.isHighlighted ? "#ef4444" : "#3b82f6",
              boxShadow: `0 0 6px ${tooltip.isHighlighted ? "#ef4444" : "#3b82f6"}`,
              display: "inline-block",
            }} />
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
