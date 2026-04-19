// Map Event Playback — scripted sequences of map actions tied to timeline entries
//
// Each MapEvent is a named sequence of steps. Steps execute in order with
// configurable delays. The player component drives the map via callbacks.

export interface MapEventStep {
  /** Fly the camera to this position */
  flyTo?: { center: [number, number]; zoom: number; duration?: number };
  /** Show a popup at a position with rich content */
  popup?: {
    center: [number, number];
    title: string;
    body?: string;
    videoUrl?: string;       // embedded video (YouTube/mp4)
    imageUrl?: string;       // static image
    thumbnailUrl?: string;   // small preview image
    sourceLabel?: string;    // e.g. "C-SPAN" or "Reuters"
    sourceUrl?: string;      // link to original
  };
  /** Highlight countries (ISO codes) — fills them on the map */
  highlight?: string[];
  /** Show strike markers */
  strikes?: { lng: number; lat: number; side: "amber" | "crimson"; label?: string; confidence?: number; sources?: { label: string; url?: string }[] }[];
  /** Narration text shown as overlay subtitle */
  narration?: string;
  /** Milliseconds to wait BEFORE this step executes (default 0) */
  delay?: number;
  /** Milliseconds this step stays visible before advancing (default: auto based on content) */
  hold?: number;
  /** Dismiss any active popup */
  dismissPopup?: boolean;
}

export interface MapEvent {
  id: string;
  title: string;
  /** Which conflict this belongs to (matches Conflict.id) */
  conflictId: string;
  /** Which timeline entry this attaches to (matches TimelineEvent.date) */
  timelineDate?: string;
  steps: MapEventStep[];
}

// ─── Event Library ───────────────────────────────────────────────────────────

export const MAP_EVENTS: Record<string, MapEvent> = {
  "jcpoa-withdrawal": {
    id: "jcpoa-withdrawal",
    title: "Trump Withdraws from Iran Nuclear Deal",
    conflictId: "israel-iran",
    timelineDate: undefined, // video embedded directly on the tile
    steps: [
      {
        flyTo: { center: [-77.04, 38.90], zoom: 14, duration: 2000 },
        narration: "May 8, 2018 — The White House",
        delay: 0,
        hold: 2500,
      },
      {
        popup: {
          center: [-77.04, 38.90],
          title: "Trump announces US withdrawal from JCPOA",
          body: "\"The United States no longer makes empty threats. If I say I'm going to do something, I do it.\"",
          videoUrl: "https://www.youtube.com/embed/hJjVyNhOqkY?start=120",
          sourceLabel: "C-SPAN",
          sourceUrl: "https://www.c-span.org/video/?445778-1/president-trump-announces-withdrawal-iran-nuclear-deal",
        },
        narration: "Trump signs a presidential memorandum reinstating sanctions on Iran",
        hold: 8000,
      },
      {
        dismissPopup: true,
        flyTo: { center: [51.4, 35.7], zoom: 5.5, duration: 2500 },
        narration: "Tehran responds — Iran begins exceeding uranium enrichment limits",
        delay: 500,
        hold: 3000,
      },
      {
        highlight: ["IRN"],
        narration: "Iran stockpiles enriched uranium and restricts IAEA inspectors",
        hold: 3000,
      },
      {
        flyTo: { center: [51.73, 33.72], zoom: 7, duration: 2000 },
        popup: {
          center: [51.73, 33.72],
          title: "Natanz Nuclear Facility",
          body: "Iran's primary enrichment site — centrifuges begin spinning beyond JCPOA limits",
          imageUrl: "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=600&q=80",
          sourceLabel: "IAEA",
        },
        narration: "By 2024, Iran has enough enriched uranium for an estimated nine nuclear warheads",
        hold: 5000,
      },
      {
        dismissPopup: true,
        flyTo: { center: [47.0, 30.5], zoom: 3.8, duration: 2500 },
        narration: "The path to Operation Epic Fury begins here",
        hold: 3000,
      },
    ],
  },

  "october-7": {
    id: "october-7",
    title: "October 7 Attack",
    conflictId: "israel-gaza",
    timelineDate: "October 7, 2023",
    steps: [
      {
        flyTo: { center: [34.48, 31.38], zoom: 10.5, duration: 2500 },
        narration: "October 7, 2023 — 6:30 AM — Southern Israel and Gaza border",
        delay: 0,
        hold: 2000,
      },
      {
        flyTo: { center: [34.50, 31.36], zoom: 11.5, duration: 3000 },
        narration: "Hamas fighters breach the Gaza border fence at multiple points",
        delay: 500,
        hold: 2500,
      },
      {
        strikes: [
          { lng: 34.5915, lat: 31.5245, side: "crimson", label: "Sderot" },
          { lng: 34.5730, lat: 31.4850, side: "crimson", label: "Kibbutz Kfar Aza" },
          { lng: 34.4890, lat: 31.3768, side: "crimson", label: "Kibbutz Be'eri" },
          { lng: 34.4640, lat: 31.3218, side: "crimson", label: "Kibbutz Nir Oz" },
          { lng: 34.5420, lat: 31.3480, side: "crimson", label: "Nova Festival (Re'im)" },
        ],
        narration: "Five major attack sites across the western Negev — coordinated ground assault",
        hold: 4000,
      },
      {
        flyTo: { center: [34.5420, 31.3480], zoom: 13, duration: 2500 },
        popup: {
          center: [34.5420, 31.3480],
          title: "Nova Music Festival",
          body: "364 people killed at an outdoor music festival near Re'im. Thousands attended the Supernova Sukkot gathering. Gunmen arrived by paraglider and vehicle. The deadliest single site of the attack.",
          sourceLabel: "Reuters",
          sourceUrl: "https://www.reuters.com/world/middle-east/",
        },
        narration: "The Nova festival near Re'im — 364 killed, the deadliest single site",
        hold: 6000,
      },
      {
        dismissPopup: true,
        flyTo: { center: [34.42, 31.40], zoom: 10.5, duration: 2000 },
        narration: "Approximately 1,200 people killed — over 250 taken hostage into Gaza",
        hold: 3500,
      },
      {
        flyTo: { center: [34.35, 31.42], zoom: 11, duration: 2000 },
        strikes: [
          { lng: 34.3460, lat: 31.4180, side: "amber", label: "Gaza City — IDF response" },
          { lng: 34.3330, lat: 31.5000, side: "amber", label: "Beit Hanoun" },
        ],
        narration: "Israel declares war and begins a full-scale military campaign in Gaza",
        hold: 4000,
      },
      {
        flyTo: { center: [35.5, 33.2], zoom: 7, duration: 3000 },
        highlight: ["LBN"],
        narration: "The next day, Hezbollah opens a second front from Lebanon",
        hold: 3000,
      },
    ],
  },

  "epic-fury": {
    id: "epic-fury",
    title: "Operation Epic Fury",
    conflictId: "israel-iran",
    timelineDate: "February 28, 2026 — Operation Epic Fury",
    steps: [
      {
        flyTo: { center: [-77.04, 38.90], zoom: 12, duration: 2000 },
        narration: "February 28, 2026 — 20:38 UTC — Trump gives the order",
        delay: 0,
        hold: 2500,
      },
      {
        flyTo: { center: [47.0, 30.5], zoom: 3.8, duration: 3000 },
        narration: "The largest Middle East military operation since 2003 begins",
        delay: 500,
        hold: 2000,
      },
      {
        strikes: [
          { lng: 51.73, lat: 33.72, side: "amber", label: "Natanz Nuclear" },
          { lng: 51.12, lat: 34.88, side: "amber", label: "Fordow (FFEP)" },
          { lng: 49.23, lat: 34.47, side: "amber", label: "Arak (IR-40)" },
        ],
        narration: "US and Israeli forces launch nearly 900 strikes on Iranian nuclear sites",
        hold: 4000,
      },
      {
        strikes: [
          { lng: 51.40, lat: 35.69, side: "amber", label: "Tehran IRGC HQ" },
          { lng: 51.67, lat: 32.62, side: "amber", label: "Isfahan IRGC" },
        ],
        narration: "Israeli decapitation strikes kill Supreme Leader Ali Khamenei",
        hold: 4000,
      },
      {
        strikes: [
          { lng: 34.78, lat: 32.09, side: "crimson", label: "Tel Aviv" },
          { lng: 34.99, lat: 32.82, side: "crimson", label: "Haifa" },
          { lng: 35.21, lat: 31.77, side: "crimson", label: "Jerusalem" },
        ],
        narration: "Iran retaliates with hundreds of drones and ballistic missiles",
        hold: 4000,
      },
      {
        flyTo: { center: [54.0, 26.5], zoom: 6, duration: 2500 },
        narration: "Iran moves to close the Strait of Hormuz — oil tops $110/barrel",
        hold: 3000,
      },
    ],
  },
};

// Helper: find all events for a given conflict + timeline date
export function getEventsForTimeline(conflictId: string, date: string): MapEvent[] {
  return Object.values(MAP_EVENTS).filter(
    e => e.conflictId === conflictId && e.timelineDate === date
  );
}
