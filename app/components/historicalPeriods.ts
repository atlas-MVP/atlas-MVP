export interface HistoricalOverlay {
  id: string;
  type: "fill";
  coordinates: number[][][];
  color: string;
  opacity: number;
  label?: string;
}

export interface PeriodConfig {
  year: number;
  camera?: { center: [number, number]; zoom: number };
  isoColors?: Record<string, string>;
  dimOthers?: boolean;
  overlays?: HistoricalOverlay[];
}

// Mandate Palestine polygon (simplified, west of Jordan River)
const MANDATE_PALESTINE_COORDS: number[][][] = [[
  [35.10, 33.10], [35.57, 33.28], [35.62, 32.99], [35.65, 32.72],
  [35.55, 32.45], [35.52, 31.88], [35.48, 31.48], [34.95, 29.55],
  [34.25, 29.56], [34.23, 30.90], [34.24, 31.30], [34.38, 31.52],
  [34.55, 31.68], [34.75, 32.05], [34.99, 32.82], [35.10, 33.10],
]];

// Sinai Peninsula (occupied by Israel 1967–1982)
const SINAI_COORDS: number[][][] = [[
  [32.35, 31.25], [34.24, 31.30], [34.97, 29.50],
  [33.65, 27.83], [32.58, 29.95], [32.35, 31.25],
]];

// Golan Heights (occupied by Israel since 1967)
const GOLAN_COORDS: number[][][] = [[
  [35.62, 33.28], [36.05, 33.08], [36.12, 32.70],
  [35.70, 32.68], [35.62, 33.28],
]];

// West Bank (occupied by Israel since 1967, distinct from Gaza)
const WEST_BANK_COORDS: number[][][] = [[
  [35.55, 32.52], [35.57, 31.98], [35.48, 31.48],
  [34.88, 31.36], [34.88, 31.78], [34.97, 32.10],
  [35.20, 32.40], [35.55, 32.52],
]];

// Gaza Strip
const GAZA_COORDS: number[][][] = [[
  [34.55, 31.60], [34.25, 31.22], [34.22, 31.52],
  [34.50, 31.68], [34.55, 31.60],
]];

// Rough Eastern Front overlay (German-occupied Eastern Europe 1941-1943)
const EASTERN_FRONT_COORDS: number[][][] = [[
  [23.0, 55.0], [27.0, 57.5], [30.5, 59.5],
  [36.0, 59.0], [38.0, 55.0], [37.5, 49.0],
  [36.0, 47.0], [31.0, 46.0], [26.0, 48.0],
  [23.0, 50.0], [21.0, 52.0], [23.0, 55.0],
]];

// ISIS caliphate approximate territory (2014 peak)
const ISIS_CALIPHATE_COORDS: number[][][] = [[
  [38.0, 37.5], [42.0, 37.5], [44.5, 36.0],
  [44.0, 33.5], [42.0, 33.0], [40.5, 32.5],
  [38.5, 33.0], [36.5, 34.5], [37.5, 36.5],
  [38.0, 37.5],
]];

// Transjordan / Jordan (British Mandate East, distinct from Palestine)
const TRANSJORDAN_COORDS: number[][][] = [[
  [35.57, 33.28], [39.0, 32.5], [39.0, 29.0],
  [36.0, 29.0], [34.97, 29.50], [35.48, 31.48],
  [35.57, 32.0], [35.57, 33.28],
]];

const USSR_ISOS = ["RUS", "UKR", "BLR", "EST", "LVA", "LTU", "MDA", "GEO", "ARM", "AZE", "KAZ", "UZB", "TKM", "KGZ", "TJK"];
const NAZI_ISOS = ["DEU", "AUT", "POL", "FRA", "BEL", "NLD", "LUX", "NOR", "DNK", "CZE"];

// Colour palette
const C_BRITISH = "rgba(251,191,36,0.30)";   // amber
const C_FRENCH  = "rgba(167,139,250,0.30)";  // purple
const C_BLUE    = "rgba(59,130,246,0.35)";   // Israel/Jewish
const C_GREEN   = "rgba(34,197,94,0.35)";    // Arab/Palestinian
const C_RED     = "rgba(225,29,72,0.35)";    // Soviet
const C_GREY    = "rgba(75,75,75,0.50)";     // Axis
const C_DIM     = "rgba(255,255,255,0.08)";  // neutral dim

export const PERIOD_CONFIGS: PeriodConfig[] = [
  // ── 1916 — Sykes-Picot Agreement ────────────────────────────────────────────
  {
    year: 1916,
    camera: { center: [38.0, 33.0], zoom: 4.5 },
    isoColors: {
      GBR: C_BRITISH, FRA: C_FRENCH,
      IRQ: C_BRITISH, JOR: C_BRITISH, PSE: C_BRITISH,
      SYR: C_FRENCH, LBN: C_FRENCH,
    },
    dimOthers: true,
    overlays: [
      {
        id: "mandate-palestine-1916",
        type: "fill",
        coordinates: MANDATE_PALESTINE_COORDS,
        color: C_BRITISH,
        opacity: 0.35,
        label: "British Zone",
      },
      {
        id: "transjordan-1916",
        type: "fill",
        coordinates: TRANSJORDAN_COORDS,
        color: C_BRITISH,
        opacity: 0.25,
        label: "British Zone",
      },
    ],
  },

  // ── 1920 — British Mandates ──────────────────────────────────────────────────
  {
    year: 1920,
    camera: { center: [38.0, 32.0], zoom: 4.8 },
    isoColors: {
      GBR: C_BRITISH,
      PSE: C_BRITISH, JOR: C_BRITISH, IRQ: C_BRITISH,
      SYR: C_FRENCH, LBN: C_FRENCH, FRA: C_FRENCH,
    },
    dimOthers: true,
    overlays: [
      {
        id: "mandate-palestine-1920",
        type: "fill",
        coordinates: MANDATE_PALESTINE_COORDS,
        color: C_BRITISH,
        opacity: 0.40,
        label: "Mandate Palestine",
      },
      {
        id: "transjordan-1920",
        type: "fill",
        coordinates: TRANSJORDAN_COORDS,
        color: C_BRITISH,
        opacity: 0.28,
        label: "Transjordan",
      },
    ],
  },

  // ── 1922 — USSR Founded ───────────────────────────────────────────────────────
  {
    year: 1922,
    camera: { center: [55.0, 55.0], zoom: 2.8 },
    isoColors: Object.fromEntries(USSR_ISOS.map(iso => [iso, C_RED])),
    dimOthers: true,
  },

  // ── 1933 — Rise of Third Reich ────────────────────────────────────────────────
  {
    year: 1933,
    camera: { center: [13.0, 51.0], zoom: 4.2 },
    isoColors: { DEU: C_GREY, AUT: C_GREY },
    dimOthers: true,
  },

  // ── 1939 — WWII Begins ────────────────────────────────────────────────────────
  {
    year: 1939,
    camera: { center: [18.0, 51.0], zoom: 3.8 },
    isoColors: Object.fromEntries(NAZI_ISOS.map(iso => [iso, C_GREY])),
    dimOthers: true,
    overlays: [
      {
        id: "eastern-front-1939",
        type: "fill",
        coordinates: EASTERN_FRONT_COORDS,
        color: C_GREY,
        opacity: 0.25,
        label: "German Advance",
      },
    ],
  },

  // ── 1945 — WWII Ends ──────────────────────────────────────────────────────────
  {
    year: 1945,
    camera: { center: [20.0, 50.0], zoom: 3.5 },
    isoColors: {
      ...Object.fromEntries(USSR_ISOS.map(iso => [iso, C_RED])),
      DEU: "rgba(100,100,100,0.40)",
    },
    dimOthers: false,
  },

  // ── 1947 — UN Partition Plan ──────────────────────────────────────────────────
  {
    year: 1947,
    camera: { center: [35.2, 31.8], zoom: 6.5 },
    isoColors: {},
    dimOthers: false,
    overlays: [
      {
        id: "jewish-partition-1947",
        type: "fill",
        coordinates: [[
          [34.55, 31.68], [34.75, 32.05], [34.99, 32.82], [35.25, 32.95],
          [35.55, 32.52], [35.52, 31.88], [35.10, 31.30], [34.55, 31.68],
        ]],
        color: C_BLUE,
        opacity: 0.50,
        label: "Jewish State (Proposed)",
      },
      {
        id: "arab-partition-1947",
        type: "fill",
        coordinates: [[
          [35.10, 33.10], [35.57, 33.28], [35.62, 32.99], [35.25, 32.95],
          [34.99, 32.82], [34.75, 32.05], [34.55, 31.68], [34.38, 31.52],
          [34.24, 31.30], [34.23, 30.90], [34.25, 29.56], [34.95, 29.55],
          [35.48, 31.48], [35.10, 33.10],
        ]],
        color: C_GREEN,
        opacity: 0.45,
        label: "Arab State (Proposed)",
      },
    ],
  },

  // ── 1948 — Israel Founded ─────────────────────────────────────────────────────
  {
    year: 1948,
    camera: { center: [35.0, 31.8], zoom: 6.5 },
    isoColors: { ISR: C_BLUE, EGY: C_GREEN, JOR: C_GREEN, SYR: C_GREEN },
    dimOthers: true,
    overlays: [
      {
        id: "mandate-palestine-1948",
        type: "fill",
        coordinates: MANDATE_PALESTINE_COORDS,
        color: C_BLUE,
        opacity: 0.35,
        label: "Israel (declared)",
      },
    ],
  },

  // ── 1949 — Armistice Lines ────────────────────────────────────────────────────
  {
    year: 1949,
    camera: { center: [35.0, 31.8], zoom: 6.5 },
    isoColors: { ISR: C_BLUE, EGY: C_GREEN, JOR: C_GREEN, SYR: C_GREEN },
    dimOthers: true,
    overlays: [
      {
        id: "israel-1949",
        type: "fill",
        coordinates: [[
          [35.10, 33.10], [35.57, 33.28], [35.62, 32.99], [35.65, 32.72],
          [35.55, 32.52], [35.20, 32.40], [34.97, 32.10], [34.88, 31.78],
          [34.75, 31.60], [34.55, 31.40], [34.50, 31.00], [34.95, 29.55],
          [34.25, 29.56], [34.23, 30.90], [34.24, 31.30], [34.38, 31.52],
          [34.55, 31.68], [34.75, 32.05], [34.99, 32.82], [35.10, 33.10],
        ]],
        color: C_BLUE,
        opacity: 0.40,
        label: "Israel (armistice)",
      },
      {
        id: "west-bank-1949",
        type: "fill",
        coordinates: WEST_BANK_COORDS,
        color: C_GREEN,
        opacity: 0.35,
        label: "Jordanian-held West Bank",
      },
      {
        id: "gaza-1949",
        type: "fill",
        coordinates: GAZA_COORDS,
        color: C_GREEN,
        opacity: 0.35,
        label: "Egyptian-held Gaza",
      },
    ],
  },

  // ── 1967 — Six-Day War ────────────────────────────────────────────────────────
  {
    year: 1967,
    camera: { center: [35.5, 31.0], zoom: 5.8 },
    isoColors: { ISR: C_BLUE, EGY: C_GREEN, JOR: C_GREEN, SYR: C_GREEN },
    dimOthers: true,
    overlays: [
      {
        id: "sinai-1967",
        type: "fill",
        coordinates: SINAI_COORDS,
        color: C_BLUE,
        opacity: 0.40,
        label: "Sinai (captured)",
      },
      {
        id: "golan-1967",
        type: "fill",
        coordinates: GOLAN_COORDS,
        color: C_BLUE,
        opacity: 0.40,
        label: "Golan Heights",
      },
      {
        id: "west-bank-1967",
        type: "fill",
        coordinates: WEST_BANK_COORDS,
        color: C_BLUE,
        opacity: 0.35,
        label: "West Bank (captured)",
      },
      {
        id: "gaza-1967",
        type: "fill",
        coordinates: GAZA_COORDS,
        color: C_BLUE,
        opacity: 0.35,
        label: "Gaza (captured)",
      },
    ],
  },

  // ── 1973 — Yom Kippur War ─────────────────────────────────────────────────────
  {
    year: 1973,
    camera: { center: [35.5, 31.0], zoom: 5.8 },
    isoColors: { ISR: C_BLUE, EGY: C_GREEN, SYR: C_GREEN },
    dimOthers: true,
    overlays: [
      {
        id: "sinai-1973",
        type: "fill",
        coordinates: SINAI_COORDS,
        color: "rgba(251,191,36,0.35)",
        opacity: 0.40,
        label: "Sinai (contested)",
      },
      {
        id: "golan-1973",
        type: "fill",
        coordinates: GOLAN_COORDS,
        color: "rgba(251,191,36,0.35)",
        opacity: 0.40,
        label: "Golan (contested)",
      },
    ],
  },

  // ── 1979 — Islamic Revolution + Egypt-Israel Peace Treaty ─────────────────────
  {
    year: 1979,
    camera: { center: [45.0, 32.0], zoom: 4.0 },
    isoColors: {
      IRN: "rgba(225,29,72,0.50)",
      EGY: "rgba(251,191,36,0.35)",
      ISR: C_BLUE,
    },
    dimOthers: true,
    overlays: [
      {
        id: "sinai-1979",
        type: "fill",
        coordinates: SINAI_COORDS,
        color: "rgba(251,191,36,0.30)",
        opacity: 0.35,
        label: "Sinai (return scheduled)",
      },
    ],
  },

  // ── 1982 — Sinai Returned ─────────────────────────────────────────────────────
  {
    year: 1982,
    camera: { center: [35.0, 30.5], zoom: 5.5 },
    isoColors: { ISR: C_BLUE, EGY: C_GREEN, LBN: "rgba(225,29,72,0.35)" },
    dimOthers: true,
    overlays: [
      {
        id: "golan-1982",
        type: "fill",
        coordinates: GOLAN_COORDS,
        color: C_BLUE,
        opacity: 0.40,
        label: "Golan (annexed)",
      },
      {
        id: "west-bank-1982",
        type: "fill",
        coordinates: WEST_BANK_COORDS,
        color: C_BLUE,
        opacity: 0.30,
        label: "West Bank (occupied)",
      },
    ],
  },

  // ── 1989 — Berlin Wall Falls ──────────────────────────────────────────────────
  {
    year: 1989,
    camera: { center: [20.0, 52.0], zoom: 3.5 },
    isoColors: {
      DEU: "rgba(59,130,246,0.35)",
      POL: "rgba(59,130,246,0.25)",
      HUN: "rgba(59,130,246,0.25)",
      CZE: "rgba(59,130,246,0.25)",
      ...Object.fromEntries(USSR_ISOS.map(iso => [iso, C_DIM])),
    },
    dimOthers: false,
  },

  // ── 1991 — USSR Dissolved ─────────────────────────────────────────────────────
  {
    year: 1991,
    camera: { center: [55.0, 55.0], zoom: 2.8 },
    isoColors: Object.fromEntries(USSR_ISOS.map(iso => [iso, "rgba(59,130,246,0.25)"])),
    dimOthers: false,
  },

  // ── 1993 — Oslo Accords ───────────────────────────────────────────────────────
  {
    year: 1993,
    camera: { center: [35.2, 32.0], zoom: 7.0 },
    isoColors: { ISR: C_BLUE, PSE: C_GREEN },
    dimOthers: true,
    overlays: [
      {
        id: "oslo-west-bank",
        type: "fill",
        coordinates: WEST_BANK_COORDS,
        color: C_GREEN,
        opacity: 0.40,
        label: "PA (Oslo I)",
      },
      {
        id: "oslo-gaza",
        type: "fill",
        coordinates: GAZA_COORDS,
        color: C_GREEN,
        opacity: 0.40,
        label: "PA (Oslo I)",
      },
    ],
  },

  // ── 1995 — Oslo II ────────────────────────────────────────────────────────────
  {
    year: 1995,
    camera: { center: [35.2, 32.0], zoom: 7.0 },
    isoColors: { ISR: C_BLUE, PSE: C_GREEN },
    dimOthers: true,
    overlays: [
      {
        id: "oslo2-west-bank",
        type: "fill",
        coordinates: WEST_BANK_COORDS,
        color: C_GREEN,
        opacity: 0.38,
        label: "Area A/B (Oslo II)",
      },
      {
        id: "oslo2-gaza",
        type: "fill",
        coordinates: GAZA_COORDS,
        color: C_GREEN,
        opacity: 0.42,
        label: "Gaza (PA)",
      },
    ],
  },

  // ── 2000 — Camp David Fails ───────────────────────────────────────────────────
  {
    year: 2000,
    camera: { center: [35.2, 31.8], zoom: 6.5 },
    isoColors: { ISR: C_BLUE, PSE: C_GREEN },
    dimOthers: true,
    overlays: [
      {
        id: "2000-west-bank",
        type: "fill",
        coordinates: WEST_BANK_COORDS,
        color: C_GREEN,
        opacity: 0.35,
        label: "West Bank (PA)",
      },
      {
        id: "2000-gaza",
        type: "fill",
        coordinates: GAZA_COORDS,
        color: C_GREEN,
        opacity: 0.35,
        label: "Gaza (PA)",
      },
    ],
  },

  // ── 2001 — 9/11 ───────────────────────────────────────────────────────────────
  {
    year: 2001,
    camera: { center: [65.0, 33.0], zoom: 3.8 },
    isoColors: { AFG: "rgba(225,29,72,0.50)", USA: C_BLUE },
    dimOthers: false,
  },

  // ── 2003 — Iraq Invasion ──────────────────────────────────────────────────────
  {
    year: 2003,
    camera: { center: [44.4, 33.3], zoom: 5.0 },
    isoColors: { IRQ: "rgba(225,29,72,0.50)", USA: C_BLUE, GBR: C_BRITISH },
    dimOthers: false,
  },

  // ── 2005 — Gaza Disengagement ─────────────────────────────────────────────────
  {
    year: 2005,
    camera: { center: [34.6, 31.5], zoom: 8.0 },
    isoColors: { ISR: C_BLUE, PSE: C_GREEN },
    dimOthers: true,
    overlays: [
      {
        id: "gaza-2005",
        type: "fill",
        coordinates: GAZA_COORDS,
        color: C_GREEN,
        opacity: 0.50,
        label: "Gaza (PA control)",
      },
      {
        id: "west-bank-2005",
        type: "fill",
        coordinates: WEST_BANK_COORDS,
        color: C_GREEN,
        opacity: 0.35,
        label: "West Bank (PA)",
      },
    ],
  },

  // ── 2007 — Hamas Takes Gaza ───────────────────────────────────────────────────
  {
    year: 2007,
    camera: { center: [34.6, 31.5], zoom: 7.8 },
    isoColors: { ISR: C_BLUE, PSE: "rgba(225,29,72,0.40)" },
    dimOthers: true,
    overlays: [
      {
        id: "hamas-gaza-2007",
        type: "fill",
        coordinates: GAZA_COORDS,
        color: "rgba(225,29,72,0.50)",
        opacity: 0.55,
        label: "Hamas-controlled Gaza",
      },
      {
        id: "pa-west-bank-2007",
        type: "fill",
        coordinates: WEST_BANK_COORDS,
        color: C_GREEN,
        opacity: 0.35,
        label: "West Bank (PA/Fatah)",
      },
    ],
  },

  // ── 2010 — Arab Spring Begins ─────────────────────────────────────────────────
  {
    year: 2010,
    camera: { center: [20.0, 28.0], zoom: 3.8 },
    isoColors: {
      TUN: "rgba(251,191,36,0.50)",
      EGY: "rgba(251,191,36,0.40)",
      LBY: "rgba(225,29,72,0.40)",
      SYR: "rgba(225,29,72,0.40)",
      YEM: "rgba(225,29,72,0.35)",
    },
    dimOthers: false,
  },

  // ── 2011 — Arab Spring ────────────────────────────────────────────────────────
  {
    year: 2011,
    camera: { center: [25.0, 28.0], zoom: 3.5 },
    isoColors: {
      TUN: "rgba(251,191,36,0.50)",
      EGY: "rgba(251,191,36,0.50)",
      LBY: "rgba(225,29,72,0.55)",
      SYR: "rgba(225,29,72,0.55)",
      BHR: "rgba(251,191,36,0.40)",
      YEM: "rgba(225,29,72,0.50)",
    },
    dimOthers: false,
  },

  // ── 2014 — ISIS Caliphate ─────────────────────────────────────────────────────
  {
    year: 2014,
    camera: { center: [42.0, 35.0], zoom: 4.8 },
    isoColors: {
      IRQ: "rgba(75,75,75,0.50)",
      SYR: "rgba(75,75,75,0.40)",
    },
    dimOthers: false,
    overlays: [
      {
        id: "isis-2014",
        type: "fill",
        coordinates: ISIS_CALIPHATE_COORDS,
        color: "rgba(75,75,75,0.55)",
        opacity: 0.55,
        label: "ISIS Caliphate (peak)",
      },
    ],
  },

  // ── 2022 — Russia Invades Ukraine ─────────────────────────────────────────────
  {
    year: 2022,
    camera: { center: [33.0, 49.0], zoom: 4.2 },
    isoColors: {
      RUS: "rgba(225,29,72,0.50)",
      UKR: "rgba(251,191,36,0.50)",
      BLR: "rgba(225,29,72,0.25)",
    },
    dimOthers: false,
  },

  // ── 2023 — Oct 7 Attack ───────────────────────────────────────────────────────
  {
    year: 2023,
    camera: { center: [34.8, 31.5], zoom: 7.5 },
    isoColors: {
      ISR: C_BLUE,
      PSE: "rgba(225,29,72,0.55)",
      LBN: "rgba(225,29,72,0.35)",
      IRN: "rgba(225,29,72,0.35)",
    },
    dimOthers: true,
    overlays: [
      {
        id: "gaza-2023",
        type: "fill",
        coordinates: GAZA_COORDS,
        color: "rgba(225,29,72,0.55)",
        opacity: 0.60,
        label: "Gaza (War)",
      },
    ],
  },

  // ── 2024 — Gaza War + Lebanon War ─────────────────────────────────────────────
  {
    year: 2024,
    camera: { center: [36.0, 32.0], zoom: 6.0 },
    isoColors: {
      ISR: C_BLUE,
      PSE: "rgba(225,29,72,0.55)",
      LBN: "rgba(225,29,72,0.50)",
      IRN: "rgba(225,29,72,0.40)",
      YEM: "rgba(225,29,72,0.35)",
    },
    dimOthers: true,
    overlays: [
      {
        id: "gaza-2024",
        type: "fill",
        coordinates: GAZA_COORDS,
        color: "rgba(225,29,72,0.60)",
        opacity: 0.65,
        label: "Gaza (active war)",
      },
    ],
  },

  // ── 2025 — Twelve-Day War ─────────────────────────────────────────────────────
  {
    year: 2025,
    camera: { center: [44.0, 32.0], zoom: 4.5 },
    isoColors: {
      ISR: C_BLUE,
      IRN: "rgba(225,29,72,0.60)",
      IRQ: "rgba(225,29,72,0.35)",
      SYR: "rgba(225,29,72,0.30)",
    },
    dimOthers: true,
  },

  // ── 2026 — Operation Epic Fury ────────────────────────────────────────────────
  {
    year: 2026,
    camera: { center: [44.0, 31.5], zoom: 4.2 },
    isoColors: {
      ISR: C_BLUE,
      IRN: "rgba(225,29,72,0.65)",
      USA: "rgba(59,130,246,0.40)",
      SAU: "rgba(251,191,36,0.30)",
    },
    dimOthers: true,
  },
];

/**
 * Get the PeriodConfig for a given year.
 * Falls back to the most recent defined year ≤ requested year.
 */
export function getPeriodConfig(year: number): PeriodConfig | null {
  const sorted = [...PERIOD_CONFIGS].sort((a, b) => b.year - a.year);
  const match = sorted.find(p => p.year <= year);
  return match ?? null;
}
