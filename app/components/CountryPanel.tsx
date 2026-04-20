"use client";

import { useState, useRef, useEffect } from "react";
import LiveAlertRow from "./LiveAlertRow";
import { SIDE_COLORS, getCountrySide } from "../lib/sides";
import { getEventsForTimeline, type MapEvent } from "../lib/mapEvents";
import VideoPlayer from "./VideoPlayer";
import EventUploadButton from "./EventUploadButton";
import EventMediaEditor from "./EventMediaEditor";
import EventVideoBubble from "./EventVideoBubble";
import { playTts, type TtsHandle } from "../lib/tts";
import { T, clr, confColor } from "../lib/tokens";

// Stable per-event R2 folder id: "<conflictId>-<slug-of-date>"
// e.g. ("israel-gaza", "October 7, 2023") → "israel-gaza-october-7-2023"
function eventFolderId(conflictId: string, date: string): string {
  const slug = date
    .toLowerCase()
    .replace(/[—–]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${conflictId}-${slug}`;
}

/** Returns true for YouTube embed URLs; false = self-hosted video → use VideoPlayer */
function isYouTube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

interface LiveAlert {
  time: string;
  text: string;
  description: string;
  danger: number;
  confidence: number;
  sources: string[];
  pulse?: boolean;
  flyTo: { center: [number,number]; zoom: number };
}

const CONFLICT_ALERTS: Record<string, LiveAlert[]> = {
  "israel-iran": [
    { time: "2026-04-19T14:30:00",    danger: 5, confidence: 96, sources: ["AP", "Reuters", "ACLED"], pulse: true,
      text: "Israel-Lebanon border exchange — IDF artillery responds to Hezbollah rocket fire in Galilee",
      description: "IDF artillery units opened fire on southern Lebanese villages after Hezbollah launched a salvo of 40+ rockets targeting communities in the Galilee region. Evacuation orders are in effect for several northern Israeli towns. Lebanese civil defense reports casualties in the Bint Jbeil district.",
      flyTo: { center: [35.5, 33.3] as [number,number], zoom: 7 } },
    { time: "2026-04-19T14:18:00",    danger: 5, confidence: 93, sources: ["Reuters", "AP"], pulse: true,
      text: "US 5th Fleet announces heightened readiness posture in Persian Gulf",
      description: "The US Navy's 5th Fleet, headquartered in Bahrain, has raised its alert status following intelligence reports of Iranian naval mobilization near the Strait of Hormuz. Two additional destroyers are being repositioned.",
      flyTo: { center: [50.5, 26.2] as [number,number], zoom: 5 } },
    { time: "2026-04-17T22:15:00", danger: 4, confidence: 91, sources: ["NYT", "Haaretz", "AP"],
      text: "IDF strikes Hezbollah command node in Beirut southern suburbs — 3 commanders killed",
      description: "Israeli Air Force F-35Is struck a Hezbollah command-and-control node beneath a residential building in the Dahieh district of Beirut. IDF confirms three senior Hezbollah field commanders were killed. Lebanese civil defense reports 11 civilians injured. The operation is the deepest strike inside Beirut since the 2024 ceasefire.",
      flyTo: { center: [35.5, 33.3] as [number,number], zoom: 7 } },
    { time: "2026-04-17T09:30:00", danger: 4, confidence: 88, sources: ["Reuters", "ACLED"],
      text: "IRGC Navy deploys additional patrol vessels near Strait of Hormuz — tanker diversions begin",
      description: "Iran's Islamic Revolutionary Guard Corps Navy has deployed 14 additional fast-attack craft to patrol sectors near the narrowest point of the Strait of Hormuz. Several major shipping firms have diverted tankers via the longer Cape of Good Hope route. Daily throughput of crude oil through the strait has declined by an estimated 22%.",
      flyTo: { center: [56.5, 26.5] as [number,number], zoom: 7 } },
    { time: "2026-04-16T18:00:00", danger: 3, confidence: 85, sources: ["Haaretz", "Reuters"],
      text: "Israeli cabinet approves expanded Lebanon ground incursion — 3 additional brigades mobilized",
      description: "Israel's Security Cabinet voted 9-2 to authorize an expanded ground operation in southern Lebanon, committing an additional three armored brigades. The IDF Northern Command has issued displacement orders for 14 villages north of the Litani River. UN peacekeeping forces (UNIFIL) have been notified and are consolidating to protected compounds.",
      flyTo: { center: [35.5, 33.3] as [number,number], zoom: 7 } },
    { time: "2026-04-16T11:00:00", danger: 3, confidence: 90, sources: ["Pentagon", "Reuters"],
      text: "US deploys THAAD battery to Qatar — Al Udeid AB reinforced following missile threat intelligence",
      description: "A Terminal High Altitude Area Defense battery has been airlifted to Al Udeid Air Base in Qatar following specific intelligence of Iranian ballistic missile targeting. The Pentagon confirmed the deployment, citing credible threats against US forces in the Gulf. Qatar's defense ministry issued a joint statement affirming coordination.",
      flyTo: { center: [51.3, 25.1] as [number,number], zoom: 8 } },
    { time: "2026-04-15T16:45:00", danger: 4, confidence: 97, sources: ["CENTCOM", "AP"],
      text: "Houthi anti-ship missiles target USS Gravely in Red Sea — missile intercepted, no casualties",
      description: "The Houthi movement launched two anti-ship ballistic missiles at the USS Gravely, a guided-missile destroyer conducting freedom of navigation operations in the southern Red Sea. Both missiles were successfully intercepted by the ship's SM-2 defense system. CENTCOM confirmed no casualties or damage. This is the 34th documented Houthi attack on US naval assets since October 2023.",
      flyTo: { center: [43.5, 14.0] as [number,number], zoom: 7 } },
  ],
  "israel-gaza": [
    { time: "2026-04-19T14:30:00", danger: 5, confidence: 97, sources: ["AP", "Al Jazeera", "Reuters"], pulse: true,
      text: "Israeli attacks kill 11, including two children, in day of strikes on Gaza",
      description: "A three-year-old and a 14-year-old were among those killed in Israel's latest strikes on northern Gaza.",
      flyTo: { center: [34.4, 31.6] as [number,number], zoom: 8 } },
    { time: "2026-04-19T13:35:00", danger: 4, confidence: 94, sources: ["AP", "Al Jazeera"], pulse: true,
      text: "Northern Gaza hospitals running on emergency reserves — collapse imminent",
      description: "Al-Ahli Arab Hospital and Kamal Adwan Hospital in northern Gaza have issued emergency declarations after fuel stocks dropped below 24-hour reserves. UNRWA reports 14 aid trucks held at the Kerem Shalom crossing for 11 days.",
      flyTo: { center: [34.4, 31.6] as [number,number], zoom: 8 } },
  ],
  "russia-ukraine": [
    { time: "2026-04-19T14:02:00", danger: 4, confidence: 89, sources: ["NYT", "Reuters"], pulse: true,
      text: "Ukraine reports overnight drone barrage — Kyiv air defenses activated",
      description: "Russia launched 78 Shahed-136 drones in an overnight wave targeting Kyiv, Odessa, and Kharkiv. Ukrainian air defense intercepted 61 drones. Three civilians were killed and 14 injured.",
      flyTo: { center: [30.5, 50.4] as [number,number], zoom: 6 } },
  ],
  "sudan": [
    { time: "2026-04-10T19:30:00", danger: 5, confidence: 91, sources: ["UN", "Sudan Tribune"], pulse: true,
      text: "SAF drone strike kills 40+ at wedding celebration in North Darfur — RSF-held town targeted",
      description: "Sudan's armed forces killed at least forty and burned dozens more homes in a drone strike on a wedding celebration in an RSF-held town in North Darfur state. A recent survey describes widespread hunger, separation, and social disruption as families reckon with a lack of access to basic services amid the continued risk of violence.",
      flyTo: { center: [25.1, 15.6] as [number,number], zoom: 6 } },
    { time: "2026-04-19T13:49:00", danger: 5, confidence: 82, sources: ["Al Jazeera", "ACLED"], pulse: true,
      text: "RSF forces reported inside Omdurman residential districts — civilian evacuation underway",
      description: "Rapid Support Forces fighters have pushed into at least four residential neighborhoods in Omdurman, Khartoum's twin city. OCHA reports 80,000 civilians displaced in the past 72 hours. Aid convoys are unable to enter due to active fighting on the Omdurman bridge.",
      flyTo: { center: [32.5, 15.6] as [number,number], zoom: 6 } },
  ],
  "taiwan-strait": [
    { time: "2026-04-19T13:20:00", danger: 2, confidence: 79, sources: ["ACLED", "GDELT"],
      text: "PLA carrier group Shandong approaches Taiwan median line — GDELT naval index elevated",
      description: "The PLA Navy carrier strike group led by the Shandong has approached within 40 nautical miles of the Taiwan Strait median line. Taiwan's MND has scrambled F-16 and Mirage 2000 fighters. The GDELT conflict index for the Taiwan Strait has risen to its highest level since August 2022.",
      flyTo: { center: [121.5, 24.5] as [number,number], zoom: 6.5 } },
  ],
};

interface CivSource {
  label: string;
  url: string;
}

interface Casualty {
  country: string;
  injured: string;
  missing?: string;
  killed: string;
  killedHasMissing?: boolean;
  civilianPct?: number;
  civSources?: CivSource[];
}

export interface StrikeMarker {
  lng: number;
  lat: number;
  side: "amber" | "crimson"; // amber = Israel/US, crimson = Iran/proxy
  label?: string;
  confidence?: number;
  sources?: { label: string; url?: string }[];
}

export interface StrikeEvent {
  strikes: StrikeMarker[];
  center: [number, number];
  zoom: number;
}

interface VideoSlide {
  videoUrl: string;
  title: string;
  subtitle?: string;      // e.g. "44th President of the United States"
  info?: string;           // rich text below the video (same \n/•/@blue format)
}

interface TimelineEvent {
  date: string;
  text: string;
  highlight?: boolean;
  strikeEvent?: StrikeEvent;
  mapView?: { center: [number, number]; zoom: number };
  /** Scrollable video slides — each slide is a leader/moment with its own video */
  slides?: VideoSlide[];
  /** External article URLs to embed as square OG preview cards under the
   *  videos. Fetched + parsed by /api/og; safe to point at any http(s) URL. */
  articles?: string[];
  /** Pulsing pills linking to other conflicts/categories (cross-timeline) */
  linkedConflicts?: { id: string; label: string; type?: "conflict" | "attack" }[];
  /** Category tag shown above text — e.g. "treaty" */
  tag?: string;
  /** Era bracket — groups events into a labelled visual bracket on the left */
  era?: "occupation" | "genocide" | "treaty" | "withdrawal" | "proxy" | "war";
  /** External link URL — makes the entire event clickable */
  link?: string;
}

interface Conflict {
  id: string;
  title: string;
  date: string;
  casualties: Casualty[];
  // country names (matching casualty.country) on each side
  sides?: { blue: string[]; red: string[] };
  xPost: { user: string; handle: string; text: string; imageUrl: string; xUrl: string };
  timeline: TimelineEvent[];
  feedKey: string;
}

// ── Common source sets for strike markers ──────────────────────────────────
const SRC = {
  reuters:   { label: "Reuters", url: "https://www.reuters.com/world/middle-east/" },
  bbc:       { label: "BBC News", url: "https://www.bbc.com/news/world-middle-east" },
  nyt:       { label: "New York Times", url: "https://www.nytimes.com/section/world/middleeast" },
  aljazeera: { label: "Al Jazeera", url: "https://www.aljazeera.com/where/middle-east/" },
  idf:       { label: "IDF Spokesperson", url: "https://www.idf.il/en/" },
  ocha:      { label: "UN OCHA", url: "https://www.ochaopt.org" },
  iaea:      { label: "IAEA", url: "https://www.iaea.org" },
  atlas:     { label: "Atlas Intelligence" },
  ap:        { label: "AP News", url: "https://apnews.com/hub/middle-east" },
  cnn:       { label: "CNN", url: "https://www.cnn.com/world" },
};

// Wide "home" camera per conflict — the camera position shown when the user
// taps the conflict title. Zoomed out far enough to see the whole region of
// operations, not a single strike location.
const CONFLICT_HOMEVIEW: Record<string, { center: [number, number]; zoom: number }> = {
  "israel-iran":    { center: [ 43,   30 ], zoom: 2.8 },
  "israel-gaza":    { center: [ 34.5, 31 ], zoom: 6.0 },
  "russia-ukraine": { center: [ 33,   49 ], zoom: 4.0 },
  "sudan":          { center: [ 28,   15 ], zoom: 4.3 },
  "myanmar":        { center: [ 95,   20 ], zoom: 4.6 },
  "yemen":          { center: [ 46,   15 ], zoom: 5.0 },
  "drc":            { center: [ 23,   -2 ], zoom: 4.3 },
  "mexico-cartel":  { center: [-104,  23 ], zoom: 4.0 },
  "taiwan-strait":  { center: [120,   24 ], zoom: 5.2 },
  "haiti":          { center: [-72.5, 19 ], zoom: 6.2 },
};
const DEFAULT_HOMEVIEW = { center: [ 43, 30 ] as [number, number], zoom: 2.8 };

const CONFLICTS: Record<string, Conflict> = {
  "israel-iran": {
    id: "israel-iran",
    title: "Israel / US in the Middle East",
    date: "February 2026 – Present",
    feedKey: "IRN",
    sides: {
      blue: ["Israel", "USA", "UAE", "Kuwait", "Qatar", "Jordan", "UK", "France"],
      red:  ["Iran", "Lebanon", "Hezbollah", "Houthis", "Syria", "West Bank"],
    },
    casualties: [
      // All figures since Feb 28, 2026 (Operation Epic Fury)
      { country: "Lebanon", injured: "5,200", killed: "1,180", civilianPct: 48, civSources: [
        { label: "Al Jazeera — Lebanon death toll tracker", url: "https://www.aljazeera.com/news/liveblog/2024/10/6/live-israel-attacks-lebanon" },
        { label: "Reuters — Lebanon conflict casualties", url: "https://www.reuters.com/world/middle-east/lebanon/" },
        { label: "Lebanese Ministry of Public Health", url: "https://www.moph.gov.lb" },
      ]},
      { country: "Iran", injured: "1,890", killed: "580", civilianPct: 32, civSources: [
        { label: "AP — Iran strike casualties", url: "https://apnews.com/hub/iran" },
        { label: "NYT — Operation Epic Fury coverage", url: "https://www.nytimes.com/section/world/middleeast" },
        { label: "Reuters — Iran conflict tracker", url: "https://www.reuters.com/world/middle-east/iran/" },
      ]},
      { country: "Israel", injured: "412", killed: "74", civilianPct: 24, civSources: [
        { label: "Reuters — Israel war casualties", url: "https://www.reuters.com/world/middle-east/israel/" },
        { label: "NYT — Israel conflict coverage", url: "https://www.nytimes.com/section/world/middleeast" },
        { label: "IDF official spokesperson", url: "https://www.idf.il/en/" },
      ]},
      { country: "USA", injured: "84", killed: "13", civilianPct: 0, civSources: [
        { label: "AP — Pentagon casualty report", url: "https://apnews.com/hub/pentagon" },
        { label: "NYT — US military losses", url: "https://www.nytimes.com/section/us/politics" },
      ]},
      { country: "UAE", injured: "", killed: "12", civilianPct: 100, civSources: [
        { label: "AP — Gulf state strikes", url: "https://apnews.com/hub/united-arab-emirates" },
        { label: "Al Jazeera — UAE casualties", url: "https://www.aljazeera.com/tag/united-arab-emirates/" },
      ]},
      { country: "Kuwait", injured: "", killed: "7", civilianPct: 100, civSources: [
        { label: "AP — Kuwait casualties", url: "https://apnews.com/hub/kuwait" },
        { label: "Al Jazeera — Gulf conflict", url: "https://www.aljazeera.com/tag/kuwait/" },
      ]},
      { country: "Qatar", injured: "", killed: "7", civilianPct: 100, civSources: [
        { label: "AP — Qatar casualties", url: "https://apnews.com/hub/qatar" },
        { label: "Al Jazeera — Qatar conflict", url: "https://www.aljazeera.com/tag/qatar/" },
      ]},
      { country: "Syria", injured: "", killed: "4", civilianPct: 100, civSources: [
        { label: "Reuters — Syria spillover", url: "https://www.reuters.com/world/middle-east/syria/" },
      ]},
      { country: "West Bank", injured: "", killed: "4", civilianPct: 100, civSources: [
        { label: "Al Jazeera — West Bank violence", url: "https://www.aljazeera.com/tag/west-bank/" },
      ]},
      { country: "Iraq", injured: "", killed: "3", civilianPct: 100, civSources: [
        { label: "Reuters — Iraq conflict", url: "https://www.reuters.com/world/middle-east/iraq/" },
      ]},
    ],
    xPost: {
      user: "Reuters",
      handle: "@Reuters",
      text: "BREAKING: Operation Epic Fury underway. US and Israeli forces have launched nearly 900 strikes on Iranian nuclear and military infrastructure in the first 12 hours. Supreme Leader Khamenei killed. Iran retaliates with drones and ballistic missiles. #Iran #IranWar #OperationEpicFury",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
      xUrl: "https://x.com/search?q=%23IranWar",
    },
    timeline: [
      {
        date: "March — Present",
        era: "war",
        text: "The war becomes the largest Middle East military engagement since 2003. Iran, now led by Mojtaba Khamenei, continues to resist. Iran establishes a toll system on the Strait of Hormuz — $2–4M per tanker in Chinese yuan or stablecoin. Oil tops $110/barrel. Hezbollah re-enters the conflict. The 82nd Airborne is put on alert. Peace talks underway in Islamabad. No ceasefire reached.",
        mapView: { center: [47.0, 30.5], zoom: 3.8 },
      },
      {
        date: "February 28, 2026 — Operation Epic Fury",
        era: "war",
        text: "Trump gives the order at 20:38 UTC. In the first 12 hours, US and Israeli forces launch nearly 900 strikes. Israeli decapitation strikes kill Supreme Leader Ali Khamenei and senior officials. The US uses B-2s, B-1s, B-52s, Tomahawk missiles, and HIMARS. Iran retaliates with hundreds of drones and ballistic missiles at Israel and US Gulf bases. Iran moves to close the Strait of Hormuz.",
        highlight: true,
        strikeEvent: {
          center: [47.0, 30.5], zoom: 3.8,
          strikes: [
            // US/Israel → Iran nuclear & military sites
            { lng: 51.73, lat: 33.72, side: "amber", label: "Natanz Nuclear", confidence: 78, sources: [SRC.atlas, SRC.bbc, SRC.nyt] },
            { lng: 51.12, lat: 34.88, side: "amber", label: "Fordow (FFEP)", confidence: 78, sources: [SRC.atlas, SRC.iaea] },
            { lng: 49.23, lat: 34.47, side: "amber", label: "Arak (IR-40)", confidence: 75, sources: [SRC.atlas, SRC.reuters] },
            { lng: 51.78, lat: 35.49, side: "amber", label: "Parchin Military", confidence: 72, sources: [SRC.atlas, SRC.nyt] },
            { lng: 51.40, lat: 35.69, side: "amber", label: "IRGC Tehran HQ", confidence: 80, sources: [SRC.atlas, SRC.bbc, SRC.reuters] },
            { lng: 50.33, lat: 29.25, side: "amber", label: "Kharg Island", confidence: 74, sources: [SRC.atlas, SRC.reuters] },
            // Iran → US Gulf bases + Israel
            { lng: 51.31, lat: 25.12, side: "crimson", label: "Al Udeid AB (Qatar)", confidence: 70, sources: [SRC.atlas] },
            { lng: 54.55, lat: 24.25, side: "crimson", label: "Al Dhafra AB (UAE)", confidence: 70, sources: [SRC.atlas] },
            { lng: 47.52, lat: 29.45, side: "crimson", label: "Ali Al Salem AB (Kuwait)", confidence: 68, sources: [SRC.atlas] },
            { lng: 34.78, lat: 32.09, side: "crimson", label: "Tel Aviv", confidence: 82, sources: [SRC.atlas, SRC.bbc] },
          ],
        },
      },
      {
        date: "February 26, 2026",
        era: "war",
        text: "Third round of talks in Geneva. Sides remain far apart. All US ships leave port in Bahrain. Fleet headquarters reduced to fewer than 100 personnel — the same measures taken before the 2025 strikes. Fourteen refueling tankers arrive at Ben Gurion Airport.",
      },
      {
        date: "February 25, 2026",
        era: "war",
        text: "Iran's Foreign Minister Araghchi states a \"historic\" deal is \"within reach.\"",
      },
      {
        date: "February 24, 2026",
        era: "war",
        text: "At the State of the Union, Trump accuses Iran of reviving nuclear weapons efforts. US intelligence indicates Iran's long-range missile capabilities wouldn't be viable until 2035. Netanyahu calls Trump with intelligence on an upcoming Khamenei meeting.",
      },
      {
        date: "February 20, 2026",
        era: "war",
        text: "Trump issues a 10-day deadline: \"You are going to be finding out over the next, probably, 10 days.\"",
      },
      {
        date: "February 19, 2026",
        era: "war",
        text: "Reports emerge that US strikes could come within days. The buildup is described as the largest since 2003.",
      },
      {
        date: "February 17, 2026",
        era: "war",
        text: "Second round of talks in Geneva. Khamenei publicly threatens US warships, saying Iran is \"capable of sinking\" them. The Strait of Hormuz is closed for hours during a live fire drill.",
      },
      {
        date: "February 15–20, 2026",
        era: "war",
        text: "Iran increases oil exports to three times the normal rate and reduces storage — later interpreted as stockpiling revenue before anticipated conflict.",
      },
      {
        date: "February 13, 2026",
        era: "war",
        text: "Trump orders a second carrier strike group, led by the USS Gerald R. Ford, to the Middle East.",
      },
      {
        date: "February 6, 2026",
        era: "war",
        text: "First round of indirect US–Iran nuclear talks in Muscat, Oman, mediated by Oman's foreign minister. US delegation includes Steve Witkoff, Jared Kushner, and CENTCOM commander Admiral Brad Cooper. Described as a \"good start\" but sides do not meet face-to-face.",
      },
      {
        date: "February 3, 2026",
        era: "war",
        text: "Six IRGC gunboats attempt to seize a US tanker in the Strait of Hormuz. The tanker continues under escort of the USS McFaul. A US F-35 shoots down an Iranian drone approaching the USS Abraham Lincoln.",
      },
      {
        date: "January 23, 2026",
        era: "war",
        text: "Trump announces a \"massive armada\" heading to the Middle East, including the USS Abraham Lincoln. Becomes the largest US military presence in the region since 2003.",
      },
      {
        date: "January 13, 2026",
        era: "war",
        text: "Trump tells Iranian protesters to \"keep protesting\" and that \"help is on its way.\" He warns those responsible for killings will \"pay a very big price\" and cancels all meetings with Iranian officials.",
      },
      {
        date: "January 8, 2026",
        era: "war",
        text: "Iranian security forces unleash a mass crackdown, cutting all internet access. Death toll estimates range from the government's figure of 3,117 to approximately 30,000 according to Iranian health officials. HRANA documents at least 7,007 deaths.",
      },
      {
        date: "January 5, 2026",
        era: "war",
        text: "Israel's Security Cabinet authorizes additional strikes on Iran following Netanyahu–Trump discussions.",
      },
      {
        date: "December 28, 2025",
        era: "war",
        text: "Nationwide anti-government protests erupt across all 31 Iranian provinces, driven by currency collapse and rising prices. They become the largest demonstrations since the 1979 revolution, with an estimated 5 million Iranians protesting.",
      },
      {
        date: "December 2025",
        era: "war",
        text: "Iran's military admits claims of shooting down two Israeli F-35s during the Twelve-Day War were false. The World Bank projects Iran's economy will shrink in both 2025 and 2026 with inflation heading toward 60%. The rial hits a record low.",
      },
      {
        date: "October 2025",
        era: "war",
        text: "Trump says the US is ready to make a deal. Iran says it would consider any \"fair and balanced\" proposal. No concrete framework materializes.",
      },
      {
        date: "September 2025",
        era: "war",
        text: "The UK, France, and Germany trigger the reimposition of UN sanctions. Iran's economy deteriorates sharply. The rial continues to collapse.",
      },
      {
        date: "June 13–24, 2025 — The Twelve-Day War",
        era: "war",
        text: "Israel launches surprise airstrikes on Iran's nuclear and military infrastructure, killing senior commanders and nuclear scientists. The US joins on June 22, striking three nuclear sites. Iran retaliates with over 550 ballistic missiles and 1,000+ drones. Over 600 killed in Iran, 29 in Israel. A US-brokered ceasefire takes hold June 24.",
        highlight: true,
        strikeEvent: {
          center: [43.0, 33.0], zoom: 3.8,
          strikes: [
            { lng: 51.73, lat: 33.72, side: "amber", label: "Natanz", confidence: 82, sources: [SRC.atlas, SRC.bbc, SRC.nyt] },
            { lng: 51.12, lat: 34.88, side: "amber", label: "Fordow", confidence: 80, sources: [SRC.atlas, SRC.iaea] },
            { lng: 51.67, lat: 32.62, side: "amber", label: "Isfahan IRGC", confidence: 78, sources: [SRC.atlas, SRC.reuters] },
            { lng: 51.40, lat: 35.69, side: "amber", label: "Tehran IRGC HQ", confidence: 80, sources: [SRC.atlas, SRC.bbc] },
            // Iran retaliates → Israel
            { lng: 34.78, lat: 32.09, side: "crimson", label: "Tel Aviv", confidence: 85, sources: [SRC.atlas, SRC.reuters, SRC.bbc] },
            { lng: 34.99, lat: 32.82, side: "crimson", label: "Haifa", confidence: 82, sources: [SRC.atlas, SRC.reuters] },
            { lng: 34.79, lat: 31.25, side: "crimson", label: "Beer Sheva", confidence: 78, sources: [SRC.atlas] },
            { lng: 35.21, lat: 31.77, side: "crimson", label: "Jerusalem", confidence: 85, sources: [SRC.atlas, SRC.bbc] },
          ],
        },
      },
      {
        date: "February 4, 2025",
        era: "proxy",
        text: "Trump signs a presidential memorandum restoring maximum pressure sanctions and directing efforts to drive Iranian oil exports to zero.",
        mapView: { center: [-77.04, 38.90], zoom: 10 },
      },
      {
        date: "December 2024",
        era: "proxy",
        text: "Syrian President Bashar al-Assad flees the country, collapsing a major pillar of Iran's Axis of Resistance. The IAEA reports Iran has enough highly enriched uranium for an estimated nine nuclear warheads.",
        mapView: { center: [38.0, 34.8], zoom: 5.5 },
      },
      {
        date: "October 26, 2024 — Operation Days of Repentance",
        era: "proxy",
        text: "Israel launches its largest-ever strike on Iran. Over 100 aircraft including F-35s strike 20 locations. The strikes destroy nearly all of Iran's Russian-supplied S-300 air defense systems, removing a key layer of protection for future strikes.",
        highlight: true,
        strikeEvent: {
          center: [49.5, 34.5], zoom: 4.2,
          strikes: [
            { lng: 51.67, lat: 32.62, side: "amber", label: "Isfahan S-300 Site", confidence: 94, sources: [SRC.nyt, SRC.reuters, SRC.idf] },
            { lng: 46.29, lat: 38.08, side: "amber", label: "Tabriz Radar", confidence: 91, sources: [SRC.bbc, SRC.reuters] },
            { lng: 48.73, lat: 31.32, side: "amber", label: "Khuzestan Air Defense", confidence: 88, sources: [SRC.nyt, SRC.ap] },
            { lng: 51.30, lat: 35.71, side: "amber", label: "Tehran Air Defense", confidence: 92, sources: [SRC.reuters, SRC.bbc] },
            { lng: 51.73, lat: 33.72, side: "amber", label: "Natanz Perimeter", confidence: 90, sources: [SRC.iaea, SRC.nyt] },
          ],
        },
      },
      {
        date: "October 1, 2024",
        era: "proxy",
        text: "Iran fires approximately 200 ballistic missiles at Israel, hitting military bases (Operation True Promise II). The largest attack on Iran since the Iran–Iraq War.",
        strikeEvent: {
          center: [36.5, 31.5], zoom: 5.0,
          strikes: [
            { lng: 35.01, lat: 30.94, side: "crimson", label: "Nevatim Air Base", confidence: 96, sources: [SRC.idf, SRC.reuters, SRC.bbc] },
            { lng: 34.82, lat: 31.84, side: "crimson", label: "Tel Nof Air Base", confidence: 93, sources: [SRC.nyt, SRC.reuters] },
            { lng: 34.66, lat: 30.78, side: "crimson", label: "Ramon Air Base", confidence: 91, sources: [SRC.reuters, SRC.ap] },
          ],
        },
      },
      {
        date: "September 2024",
        era: "proxy",
        text: "Israel decimates Hezbollah's leadership. Pager and walkie-talkie explosions across Lebanon kill 42 members on September 17–18. On September 27, an airstrike in Beirut kills Hezbollah Secretary-General Hassan Nasrallah and IRGC deputy commander Abbas Nilforoushan.",
        strikeEvent: {
          center: [35.4, 33.6], zoom: 6.5,
          strikes: [
            { lng: 35.50, lat: 33.84, side: "amber", label: "Beirut Dahieh — Nasrallah", confidence: 98, sources: [SRC.reuters, SRC.aljazeera, SRC.nyt] },
            { lng: 35.20, lat: 33.27, side: "amber", label: "Tyre", confidence: 92, sources: [SRC.aljazeera, SRC.reuters] },
            { lng: 35.37, lat: 33.56, side: "amber", label: "Sidon", confidence: 90, sources: [SRC.aljazeera, SRC.bbc] },
            { lng: 35.57, lat: 33.21, side: "amber", label: "Kiryat Shmona (Hezbollah rockets)", confidence: 94, sources: [SRC.idf, SRC.reuters] },
          ],
        },
      },
      {
        date: "July 31, 2024",
        era: "proxy",
        text: "Israel assassinates Hamas political leader Ismail Haniyeh in Tehran. Hours earlier, a Beirut airstrike kills senior Hezbollah commander Fuad Shukr.",
        strikeEvent: {
          center: [44.5, 34.5], zoom: 4.5,
          strikes: [
            { lng: 51.41, lat: 35.72, side: "amber", label: "Tehran — Haniyeh", confidence: 97, sources: [SRC.reuters, SRC.nyt, SRC.aljazeera] },
            { lng: 35.50, lat: 33.84, side: "amber", label: "Beirut — Fuad Shukr", confidence: 96, sources: [SRC.reuters, SRC.bbc, SRC.idf] },
          ],
        },
      },
      {
        date: "April 19, 2024",
        era: "proxy",
        text: "Israel retaliates with a targeted strike on an air defense radar facility near Isfahan, near the Natanz nuclear site. The strike is deliberately limited — a signal of capability.",
        mapView: { center: [51.67, 32.62], zoom: 6.5 },
      },
      {
        date: "April 13, 2024 — Operation True Promise",
        era: "proxy",
        text: "Iran launches its first-ever direct attack on Israel: over 300 drones, cruise missiles, and ballistic missiles. The US, UK, France, and Jordan help intercept what Israel says is 99% of the incoming fire.",
        highlight: true,
        strikeEvent: {
          center: [36.0, 31.8], zoom: 5.2,
          strikes: [
            { lng: 34.78, lat: 32.09, side: "crimson", label: "Tel Aviv", confidence: 97, sources: [SRC.idf, SRC.reuters, SRC.bbc] },
            { lng: 35.21, lat: 31.77, side: "crimson", label: "Jerusalem", confidence: 95, sources: [SRC.reuters, SRC.nyt] },
            { lng: 35.15, lat: 30.98, side: "crimson", label: "Dimona (intercepted)", confidence: 88, sources: [SRC.nyt, SRC.bbc] },
            { lng: 34.66, lat: 30.78, side: "crimson", label: "Ramon AFB", confidence: 90, sources: [SRC.idf, SRC.reuters] },
          ],
        },
      },
      {
        date: "April 1, 2024",
        era: "proxy",
        text: "Israel bombs the Iranian consular annex in Damascus, Syria, killing 16 people including senior IRGC Quds Force commander Brigadier General Mohammad Reza Zahedi.",
        strikeEvent: {
          center: [35.8, 32.8], zoom: 5.8,
          strikes: [
            { lng: 36.28, lat: 33.50, side: "amber", label: "Damascus — Iranian Consulate", confidence: 96, sources: [SRC.reuters, SRC.aljazeera, SRC.nyt] },
          ],
        },
      },
      {
        date: "February 14, 2024",
        era: "proxy",
        text: "An Israeli sabotage operation causes multiple explosions on an Iranian natural gas pipeline in western Iran.",
        mapView: { center: [48.5, 33.5], zoom: 5.8 },
      },
      {
        date: "October 7, 2023",
        era: "proxy",
        text: "Hamas attacks southern Israel, killing approximately 1,200 people and taking over 250 hostages. Israel launches a full-scale military campaign in Gaza. The next day, Iran-backed Hezbollah opens a second front from Lebanon, striking northern Israel.",
        strikeEvent: {
          center: [34.42, 31.40], zoom: 10.5,
          strikes: [
            { lng: 34.5915, lat: 31.5245, side: "crimson", label: "Sderot", confidence: 98, sources: [SRC.reuters, SRC.bbc, SRC.aljazeera] },
            { lng: 34.4890, lat: 31.3768, side: "crimson", label: "Kibbutz Be'eri", confidence: 98, sources: [SRC.nyt, SRC.reuters] },
            { lng: 34.5420, lat: 31.3480, side: "crimson", label: "Nova Festival (Re'im)", confidence: 99, sources: [SRC.reuters, SRC.bbc, SRC.nyt] },
            { lng: 34.4640, lat: 31.3218, side: "crimson", label: "Kibbutz Nir Oz", confidence: 97, sources: [SRC.reuters, SRC.ap] },
            { lng: 34.5730, lat: 31.4850, side: "crimson", label: "Kibbutz Kfar Aza", confidence: 97, sources: [SRC.nyt, SRC.bbc] },
            { lng: 34.3460, lat: 31.4180, side: "amber",   label: "Gaza City (IDF response)", confidence: 95, sources: [SRC.idf, SRC.reuters] },
          ],
        },
        slides: [
          {
            videoUrl: "https://www.youtube.com/embed/tBcKMGI8VzA",
            title: "October 7th — filmed by Hamas terrorists",
            subtitle: "i24NEWS",
            info: "Raw footage captured by Hamas body cameras and GoPros during the October 7 attack on southern Israel. Warning: graphic content.",
          },
        ],
      },
      {
        date: "2018 — JCPOA Withdrawal",
        era: "withdrawal",
        text: "Trump unilaterally withdraws the US from the JCPOA and reinstates maximum pressure sanctions. Iran begins stockpiling enriched uranium and restricting IAEA monitoring.",
        tag: "withdrawal",
        mapView: { center: [-77.04, 38.90], zoom: 10 },
        slides: [
          {
            videoUrl: "https://www.youtube.com/embed/05ZwuFZJEOo?start=229",
            title: "Trump announces withdrawal from Iran Nuclear Deal",
            subtitle: "45th President of the United States",
            info: "Trump calls the JCPOA \"a horrible, one-sided deal that should have never, ever been made.\" He signs a presidential memorandum reinstating all US sanctions on Iran, effectively killing the agreement.",
          },
          {
            videoUrl: "https://www.youtube.com/embed/f0O3l1XtNiE",
            title: "Netanyahu's response to the US withdrawal",
            subtitle: "Prime Minister of Israel",
          },
          {
            videoUrl: "https://www.youtube.com/embed/z0LS7ayXaGw",
            title: "Macron addresses Congress on the Iran nuclear deal",
            subtitle: "President of France",
            info: "In his address to a joint meeting of Congress on April 25, 2018, Macron argues the US should not abandon the JCPOA until a broader agreement is forged — 'it is not perfect, but we should not abandon it.'",
          },
        ],
        articles: [
          "https://www.washingtoninstitute.org/policy-analysis/why-israel-sort-misses-iran-deal",
          "https://www.newyorker.com/news/daily-comment/why-netanyahu-really-wanted-trump-to-scuttle-the-iran-deal",
        ],
      },
      {
        date: "2015 — JCPOA",
        era: "treaty",
        text: "Six world powers and Iran reach the JCPOA nuclear deal, limiting Iran's uranium enrichment in exchange for lifting sanctions.",
        tag: "treaty",
        link: "https://obamawhitehouse.archives.gov/node/328996",
        mapView: { center: [45, 35], zoom: 3.2 },
        slides: [
          {
            videoUrl: "https://www.youtube.com/embed/KqCswpINDTA",
            title: "Obama announces the Iran Nuclear Deal",
            subtitle: "44th President of the United States",
          },
          {
            videoUrl: "https://www.youtube.com/embed/KphsWS_ieBE",
            title: "Khamenei's response to the JCPOA",
            subtitle: "Supreme Leader of Iran",
          },
        ],
      },
    ],
  },
  "israel-gaza": {
    id: "israel-gaza",
    title: "Israel–Palestine Conflict",
    date: "1948 – Present",
    feedKey: "ISR",
    sides: {
      blue: ["Israel"],
      red:  ["Gaza", "Hamas"],
    },
    casualties: [
      { country: "Gaza", injured: "110,165", killed: "46,707", civilianPct: 72, civSources: [
        { label: "Al Jazeera — Gaza death toll live tracker", url: "https://www.aljazeera.com/news/liveblog/2024/10/6/live-israel-attacks-lebanon" },
        { label: "Gaza Ministry of Health (via UN OCHA)", url: "https://www.ochaopt.org" },
        { label: "NYT — Gaza casualty analysis", url: "https://www.nytimes.com/section/world/middleeast" },
      ]},
      { country: "Israel", injured: "8,730", killed: "2,057", civilianPct: 34, civSources: [
        { label: "Reuters — Israel casualty tracker", url: "https://www.reuters.com/world/middle-east/israel/" },
        { label: "NYT — Oct 7 and aftermath", url: "https://www.nytimes.com/section/world/middleeast" },
        { label: "IDF official spokesperson", url: "https://www.idf.il/en/" },
      ]},
    ],
    xPost: {
      user: "Al Jazeera English",
      handle: "@AJEnglish",
      text: "LIVE: The death toll in Gaza has surpassed 34,000. Northern Gaza is in full famine according to the UN World Food Programme. Over 1.7 million displaced. #Gaza #GazaGenocide #Palestine",
      imageUrl: "https://images.unsplash.com/photo-1578496479531-32e296d5c6e1?w=600&q=80",
      xUrl: "https://x.com/search?q=%23Gaza",
    },
    timeline: [
      // ── Gaza Genocide (2023–Present) ──
      {
        date: "March 2025 – Present",
        text: "Gaza death toll surpasses 46,000. Northern Gaza declared in full famine by UN WFP. Over 1.9 million displaced — 85% of the population. Entire neighborhoods flattened. Aid deliveries blocked or bombed.",
        era: "genocide",
        mapView: { center: [34.44, 31.42], zoom: 10 },
      },
      {
        date: "January 26, 2024",
        text: "The International Court of Justice rules that Israel must prevent genocidal acts in Gaza and orders immediate provisional measures. South Africa's case alleging genocide proceeds.",
        era: "genocide",
        mapView: { center: [4.35, 52.07], zoom: 5 },
      },
      {
        date: "December 2023",
        text: "Israel expands ground operations to southern Gaza. Khan Younis besieged. Hospitals across Gaza overwhelmed or destroyed. 70% of housing stock damaged or destroyed.",
        era: "genocide",
        strikeEvent: {
          center: [34.30, 31.35], zoom: 10.5,
          strikes: [
            { lng: 34.30, lat: 31.35, side: "amber", label: "Khan Younis — ground assault", confidence: 95, sources: [SRC.aljazeera, SRC.ocha, SRC.reuters] },
            { lng: 34.44, lat: 31.50, side: "amber", label: "Gaza City — leveled", confidence: 97, sources: [SRC.aljazeera, SRC.bbc, SRC.ocha] },
            { lng: 34.25, lat: 31.22, side: "amber", label: "Rafah border", confidence: 93, sources: [SRC.reuters, SRC.aljazeera] },
          ],
        },
      },
      {
        date: "October 27, 2023",
        text: "Israel launches a full-scale ground invasion of northern Gaza. Communications blackout imposed. Al-Shifa Hospital surrounded and raided. Mass displacement south begins.",
        era: "genocide",
        strikeEvent: {
          center: [34.44, 31.50], zoom: 11,
          strikes: [
            { lng: 34.44, lat: 31.52, side: "amber", label: "Gaza City — ground invasion", confidence: 97, sources: [SRC.aljazeera, SRC.reuters, SRC.bbc] },
            { lng: 34.45, lat: 31.52, side: "amber", label: "Al-Shifa Hospital", confidence: 96, sources: [SRC.aljazeera, SRC.ocha, SRC.nyt] },
          ],
        },
      },
      // ── October 7 (boundary — closes occupation era) ──
      {
        date: "October 7, 2023",
        text: "Hamas fighters breach the Gaza border fence at dawn, killing approximately 1,200 Israelis and taking 253 hostages. The deadliest day in Israeli history. The Nova music festival near Re'im is the deadliest single site — 364 killed.",
        era: "occupation",
        highlight: true,
        strikeEvent: {
          center: [34.42, 31.40], zoom: 10.5,
          strikes: [
            { lng: 34.5915, lat: 31.5245, side: "crimson", label: "Sderot", confidence: 98, sources: [SRC.reuters, SRC.bbc, SRC.aljazeera] },
            { lng: 34.4890, lat: 31.3768, side: "crimson", label: "Kibbutz Be'eri", confidence: 98, sources: [SRC.nyt, SRC.reuters] },
            { lng: 34.5420, lat: 31.3480, side: "crimson", label: "Nova Festival (Re'im)", confidence: 99, sources: [SRC.reuters, SRC.bbc, SRC.nyt] },
            { lng: 34.4640, lat: 31.3218, side: "crimson", label: "Kibbutz Nir Oz", confidence: 97, sources: [SRC.reuters, SRC.ap] },
            { lng: 34.5730, lat: 31.4850, side: "crimson", label: "Kibbutz Kfar Aza", confidence: 97, sources: [SRC.nyt, SRC.bbc] },
            { lng: 34.3460, lat: 31.4180, side: "amber",   label: "Gaza City (IDF response)", confidence: 95, sources: [SRC.idf, SRC.reuters] },
          ],
        },
      },
      // ── Occupation (1967–2023) ──
      {
        date: "May 2021",
        text: "Hamas fires over 4,000 rockets at Israel in 11 days. Israel responds with airstrikes on Gaza, killing 256 Palestinians including 66 children. 13 killed in Israel. Ceasefire brokered by Egypt.",
        era: "occupation",
        mapView: { center: [34.44, 31.50], zoom: 9 },
      },
      {
        date: "2014 — Operation Protective Edge",
        text: "50-day war after Hamas kidnaps and kills three Israeli teenagers. Israel launches ground invasion of Gaza. Over 2,200 Palestinians killed (70% civilians per UN), 73 Israelis killed. Massive destruction across Gaza.",
        era: "occupation",
        mapView: { center: [34.40, 31.40], zoom: 9.5 },
      },
      {
        date: "2008 — Operation Cast Lead",
        text: "Israel launches a 22-day military offensive on Gaza after Hamas rocket fire. Over 1,400 Palestinians killed, 13 Israelis killed. The UN Goldstone Report accuses both sides of war crimes.",
        era: "occupation",
        mapView: { center: [34.44, 31.50], zoom: 9 },
      },
      {
        date: "2005",
        text: "Israel withdraws all settlers and military forces from Gaza. Hamas wins Palestinian legislative elections the following year. Israel and Egypt impose a blockade on Gaza that continues to this day.",
        era: "occupation",
        mapView: { center: [34.44, 31.42], zoom: 9.5 },
      },
      {
        date: "2000 — Second Intifada",
        text: "Five years of Palestinian uprising after the collapse of peace talks. Suicide bombings kill over 1,000 Israelis. Israeli military operations kill over 3,000 Palestinians. Israel begins construction of the West Bank separation barrier.",
        era: "occupation",
        mapView: { center: [35.2, 31.8], zoom: 8 },
      },
      {
        date: "1993 — Oslo Accords",
        text: "Israel and the PLO sign the Oslo Accords, establishing the Palestinian Authority and a framework for Palestinian self-governance. Rabin and Arafat shake hands on the White House lawn. The two-state solution appears possible.",
        era: "occupation",
        mapView: { center: [-77.04, 38.90], zoom: 10 },
      },
      {
        date: "1987 — First Intifada",
        text: "Palestinian uprising erupts across the occupied territories. Six years of mass protests, strikes, and stone-throwing against Israeli military occupation. Over 1,000 Palestinians and 160 Israelis killed. Hamas is founded during this period.",
        era: "occupation",
        mapView: { center: [35.2, 31.8], zoom: 8 },
      },
      {
        date: "1967 — Six-Day War",
        text: "Israel captures the West Bank, Gaza Strip, Sinai Peninsula, and Golan Heights in six days. Military occupation of Palestinian territories begins. UN Resolution 242 calls for Israeli withdrawal — Israel does not comply.",
        era: "occupation",
        highlight: true,
        mapView: { center: [35.0, 31.5], zoom: 7 },
      },
      // ── 1948 — standalone ──
      {
        date: "1948 — Nakba",
        text: "Israel declares independence. In the war that follows, over 700,000 Palestinians are expelled or flee their homes — an event Palestinians call the Nakba (\"catastrophe\"). Palestinian villages are destroyed. The refugee crisis that defines the conflict begins.",
        highlight: true,
        mapView: { center: [35.0, 31.5], zoom: 7.5 },
      },
    ],
  },
  "russia-ukraine": {
    id: "russia-ukraine",
    title: "Russia–Ukraine war",
    date: "February 2022 – Present",
    feedKey: "UKR",
    sides: {
      blue: ["Ukraine"],
      red:  ["Russia"],
    },
    casualties: [
      { country: "Russia", injured: "512,000", killed: "187,000", civilianPct: 4, civSources: [
        { label: "Reuters — Russia-Ukraine casualty estimates", url: "https://www.reuters.com/world/europe/ukraine/" },
        { label: "NYT — War in Ukraine tracker", url: "https://www.nytimes.com/interactive/2022/world/europe/ukraine-maps.html" },
      ]},
      { country: "Ukraine", injured: "388,000", killed: "67,000", civilianPct: 31, civSources: [
        { label: "AP — Ukraine war casualties", url: "https://apnews.com/hub/russia-ukraine" },
        { label: "UN Human Rights — Ukraine report", url: "https://ukraine.un.org/en/233060-civilian-casualties-result-armed-conflict-ukraine" },
        { label: "NYT — Ukraine losses tracker", url: "https://www.nytimes.com/interactive/2022/world/europe/ukraine-maps.html" },
      ]},
    ],
    xPost: {
      user: "Reuters",
      handle: "@Reuters",
      text: "Russia launches largest drone attack on Kyiv in months as frontline advances continue in eastern Ukraine. #Ukraine #RussiaUkraineWar",
      imageUrl: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600&q=80",
      xUrl: "https://x.com/search?q=%23Ukraine",
    },
    timeline: [
      { date: "February 2026", text: "Trump pressures Zelensky to negotiate, threatening to cut all military aid. Ukraine rejects ceasefire terms that would cede occupied territory. Peace talks in Riyadh stall." },
      { date: "January 20, 2026", text: "Trump inaugurated. Immediately signals intent to end the war within 24 hours. Zelensky visits Mar-a-Lago. Both sides agree to indirect talks." },
      { date: "November 2024", text: "Ukraine strikes Russian territory with US-supplied ATACMS missiles. Russia updates nuclear doctrine to lower threshold for nuclear response. North Korea confirms 10,000+ troops deployed to Kursk region." },
      { date: "August 2024", text: "Ukraine launches surprise cross-border incursion into Russia's Kursk Oblast — the first foreign invasion of Russian soil since WWII. Ukraine seizes 1,200 sq km and takes Russian prisoners as leverage.", highlight: true },
      { date: "February 2024", text: "Avdiivka falls to Russia after months of attritional fighting. Ukrainian ammunition shortages become critical as US Congress stalls on aid package." },
      { date: "June 2023", text: "Ukraine's long-awaited summer counteroffensive launches but gains only 17km against deeply fortified Russian lines. Western officials privately acknowledge it failed its objectives." },
      { date: "February 24, 2022", text: "Russia launches a full-scale invasion of Ukraine from multiple directions. Kyiv holds. The largest ground war in Europe since WWII begins.", highlight: true },
    ],
  },
  "sudan": {
    id: "sudan",
    title: "Sudan civil war + genocide",
    date: "April 2023 – Present",
    feedKey: "SDN",
    casualties: [{ country: "Sudan", injured: "14,200", killed: "20,079", killedHasMissing: true, missing: "8,000", }],
    xPost: {
      user: "Al Jazeera English",
      handle: "@AJEnglish",
      text: "Sudan's civil war has displaced more than 10 million people — the world's largest displacement crisis. Mass atrocities and genocide reported in Darfur. #Sudan #SudanWar #DarfurGenocide",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
      xUrl: "https://x.com/search?q=%23Sudan",
    },
    timeline: [
      { date: "April 10, 2026", text: "SAF drone strike kills 40+ civilians at a wedding celebration in an RSF-held town in North Darfur. Dozens of homes burned. UN condemns the attack.", highlight: true },
      { date: "2024–Present", text: "RSF advances on Khartoum and Omdurman. Famine conditions declared across Darfur. UN and ICC investigators document systematic mass killings and sexual violence consistent with genocide. 20,000+ killed, 10M+ displaced — the world's largest displacement crisis." },
      { date: "April 2023", text: "Fighting erupts in Khartoum between the Sudanese Armed Forces and the Rapid Support Forces, rapidly spreading to Darfur, Kordofan, and other regions.", highlight: true },
    ],
  },
  "myanmar": {
    id: "myanmar",
    title: "Myanmar civil war",
    date: "February 2021 – Present",
    feedKey: "MMR",
    casualties: [{ country: "Myanmar", injured: "49,300", killed: "7,214", civilianPct: 61 }],
    xPost: {
      user: "Reuters",
      handle: "@Reuters",
      text: "Myanmar's military junta has lost control of large swaths of territory to ethnic armed organizations. Over 2.6M internally displaced. #Myanmar #MyanmarCivilWar",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
      xUrl: "https://x.com/search?q=%23Myanmar",
    },
    timeline: [
      { date: "2021–Present", text: "Military junta losing territory to ethnic armed organizations and the People's Defence Force. 2.6M+ displaced." },
      { date: "February 2021", text: "Military seizes power in a coup, detaining elected leader Aung San Suu Kyi.", highlight: true },
    ],
  },
  "yemen": {
    id: "yemen",
    title: "Yemen + Houthi attacks",
    date: "2015 – Present",
    feedKey: "YEM",
    casualties: [{ country: "Yemen", injured: "47,600", killed: "153,000", civilianPct: 67 }],
    xPost: {
      user: "AP",
      handle: "@AP",
      text: "Houthis fire ballistic missile at Tel Aviv. US and UK carry out 18th round of airstrikes on Houthi positions in Yemen. Red Sea shipping remains disrupted. #Yemen #Houthis",
      imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",
      xUrl: "https://x.com/search?q=%23Yemen",
    },
    timeline: [
      { date: "2023–Present", text: "Houthis launch 100+ attacks on Israel and Red Sea shipping since October 2023. US/UK conduct ongoing airstrikes on Houthi positions." },
      { date: "2015", text: "Saudi-led coalition intervenes in Yemen's civil war against Houthi forces backed by Iran.", highlight: true },
    ],
  },
  "drc": {
    id: "drc",
    title: "DR Congo conflict",
    date: "Ongoing",
    feedKey: "COD",
    casualties: [{ country: "DR Congo", injured: "unknown", killed: "6,200,000", killedHasMissing: true }],
    xPost: {
      user: "Al Jazeera English",
      handle: "@AJEnglish",
      text: "M23 rebels backed by Rwanda have captured Goma, eastern DRC's largest city. The conflict has produced one of the world's largest displacement crises. #DRC #Congo",
      imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&q=80",
      xUrl: "https://x.com/search?q=%23DRC",
    },
    timeline: [
      { date: "January 2025", text: "M23 rebel group, backed by Rwanda, captures Goma — eastern DRC's largest city.", highlight: true },
      { date: "1996–Present", text: "The DRC conflict has killed an estimated 6 million people since 1996, one of the deadliest conflicts since WWII." },
    ],
  },
  "mexico-cartel": {
    id: "mexico-cartel",
    title: "Mexico cartel war",
    date: "2006 – Present",
    feedKey: "MEX",
    casualties: [{ country: "Mexico", injured: "180,000", killed: "470,000", civilianPct: 78 }],
    xPost: {
      user: "Reuters",
      handle: "@Reuters",
      text: "Trump designates Sinaloa Cartel, CJNG, Gulf Cartel and MS-13 as Foreign Terrorist Organizations. US military operations in Mexico now authorized. #Mexico #CartelWar #Sinaloa",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
      xUrl: "https://x.com/search?q=%23CartelWar",
    },
    timeline: [
      { date: "March 2025", text: "Trump formally designates Sinaloa Cartel, CJNG, Gulf Cartel, and MS-13 as Foreign Terrorist Organizations (FTOs). US military is authorized to conduct operations in Mexico. The Mexican government calls it a violation of sovereignty. Joint US-Mexican operations begin in border states.", highlight: true },
      { date: "February 2025", text: "US deploys additional special operations advisors and surveillance drones to the Texas-Mexico border. Cartel drone attacks on rival factions begin mirroring Middle East warfare tactics." },
      { date: "October 2024", text: "Sinaloa Cartel civil war intensifies: Chapitos faction (sons of El Chapo) versus Los Salazares/Mayo loyalists. Culiacán paralyzed. Gun battles shut down schools and businesses for weeks." },
      { date: "July 25, 2024", text: "Ismael 'El Mayo' Zambada — one of the most powerful drug lords alive — is secretly lured onto a plane and flown to New Mexico where he is arrested. His associate, Joaquín Guzmán López (El Chapo's son), allegedly orchestrated the betrayal. The cartel world fractures.", highlight: true },
      { date: "January 5, 2023", text: "Mexican government captures Ovidio Guzmán 'El Ratón' in Culiacán. Within hours, 700 armed Sinaloa cartel members deploy across the city. 29 killed. Government briefly had to release Ovidio in 2019; this time the capture holds. He is later extradited to the US.", highlight: true },
      { date: "2022", text: "AMLO government refuses to cooperate with DEA intelligence-sharing operations. Security cooperation with the US reaches its lowest point since NAFTA era. Mexico rejects US offers of direct military assistance." },
      { date: "2019 — 'El Culiacanazo'", text: "Mexican forces briefly capture Ovidio Guzmán but are overwhelmed by cartel forces. The government releases him to stop the violence — a humiliation broadcast live on social media." },
      { date: "2015", text: "El Chapo escapes from Altiplano maximum security prison through a mile-long tunnel equipped with a motorcycle. He is recaptured in 2016 and extradited to the US in 2017." },
      { date: "2006", text: "President Felipe Calderón declares war on the drug cartels, deploying 45,000 soldiers nationwide. Marks the beginning of militarized counter-narcotics strategy that would kill hundreds of thousands over the following two decades.", highlight: true },
    ],
  },
  "taiwan-strait": {
    id: "taiwan-strait",
    title: "Taiwan strait crisis",
    date: "Ongoing",
    feedKey: "TWN",
    casualties: [{ country: "No confirmed casualties", injured: "—", killed: "—" }],
    xPost: {
      user: "Reuters",
      handle: "@Reuters",
      text: "China's PLA conducts largest military exercises around Taiwan since 1996. Warships surround the island. Taiwan scrambles jets. US carrier USS Ronald Reagan repositions. #Taiwan #TaiwanStrait #China",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
      xUrl: "https://x.com/search?q=%23TaiwanStrait",
    },
    timeline: [
      { date: "2026 — Present", text: "Trump signals possible shift in US commitment to Taiwan defense under his 'America First' doctrine, demanding Taiwan pay for its own protection. Taiwan announces $19B emergency defense budget increase. PLA conducts monthly incursions into Taiwan's ADIZ." },
      { date: "May 2024 — Joint Sword-2024A", text: "Days after Taiwan's new president Lai Ching-te is inaugurated, China launches massive military exercises encircling Taiwan. PLA warships practice blockade scenarios, sealing off major ports. Taiwan's military goes to full alert.", highlight: true },
      { date: "January 2024", text: "Lai Ching-te (William Lai) wins Taiwan presidential election with 40% of the vote. Beijing calls him a 'dangerous separatist' and warns of consequences. Washington congratulates Taiwan's democracy." },
      { date: "August 2022 — Pelosi Crisis", text: "US House Speaker Nancy Pelosi visits Taiwan over China's explicit threats — the highest-ranking US official to visit in 25 years. China responds with its largest military exercises since 1995–96, firing ballistic missiles over Taiwan for the first time.", highlight: true },
      { date: "October 2022", text: "Xi Jinping secures an unprecedented third term as China's leader. He reaffirms his intention to 'reunify' Taiwan, refusing to renounce the use of force." },
      { date: "2022 — Chip War", text: "The US bans export of advanced semiconductors to China, accelerating the technology decoupling. Taiwan's TSMC — producer of 90% of the world's most advanced chips — becomes a central geopolitical flashpoint." },
      { date: "1995–1996 — Third Taiwan Strait Crisis", text: "China fires missiles near Taiwan ahead of Taiwan's first democratic presidential election. The US deploys two carrier battle groups. China backs down — the last direct military standoff before the current era." },
    ],
  },
  "haiti": {
    id: "haiti",
    title: "Haiti gang crisis",
    date: "2021 – Present",
    feedKey: "HTI",
    casualties: [{ country: "Haiti", injured: "9,840", killed: "5,317", civilianPct: 91 }],
    xPost: {
      user: "AP",
      handle: "@AP",
      text: "Gang coalitions control over 80% of Port-au-Prince. UN-authorized Kenyan security force deployed but struggling. Famine conditions affect ~5 million Haitians. #Haiti",
      imageUrl: "https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=600&q=80",
      xUrl: "https://x.com/search?q=%23Haiti",
    },
    timeline: [
      { date: "2024–Present", text: "Gang coalitions control 80%+ of Port-au-Prince. UN-authorized Kenyan security force struggles to dislodge criminal networks. 5M face famine." },
      { date: "July 2021", text: "President Jovenel Moïse assassinated, triggering collapse of state authority and gang takeover.", highlight: true },
    ],
  },
};

const COUNTRY_CONFLICTS: Record<string, string[]> = {
  ISR: ["israel-iran", "israel-gaza"],
  IRN: ["israel-iran"],
  LBN: ["israel-iran"],
  PSE: ["israel-gaza"],
  UKR: ["russia-ukraine"],
  RUS: ["russia-ukraine"],
  SDN: ["sudan"],
  MMR: ["myanmar"],
  YEM: ["yemen"],
  COD: ["drc"],
  HTI: ["haiti"],
  MEX: ["mexico-cartel"],
  CHN: ["taiwan-strait"],
  TWN: ["taiwan-strait"],
  USA: ["israel-iran"],
};

// Maps casualty country display names → ISO 3166-1 alpha-3
const CASUALTY_ISO: Record<string, string> = {
  "Lebanon":   "LBN", "Iran":      "IRN", "Israel":    "ISR",
  "USA":       "USA", "Gaza":      "PSE", "West Bank": "PSE",
  "Ukraine":   "UKR", "Russia":    "RUS", "Sudan":     "SDN",
  "Myanmar":   "MMR", "Yemen":     "YEM", "DR Congo":  "COD",
  "Haiti":     "HTI", "Mexico":    "MEX", "China":     "CHN",
  "Taiwan":    "TWN", "Syria":     "SYR", "Iraq":      "IRQ",
  "UAE":       "ARE", "Kuwait":    "KWT", "Qatar":     "QAT",
  "Sri Lanka": "LKA", "Jordan":    "JOR", "UK":        "GBR",
  "France":    "FRA",
};

// Maps ISO 3166-1 alpha-3 → casualty country display names
const ISO_TO_NAME = Object.fromEntries(Object.entries(CASUALTY_ISO).map(([k, v]) => [v, k]));

interface Props {
  countryCode: string | null;
  onClose: () => void;
  onViewFeed: (key: string) => void;
  onConflictSelect?: (conflictId: string) => void;
  onFocusCountry?: (isoCode: string) => void;
  onFocusPosition?: (center: [number,number], zoom: number) => void;
  onCountryHome?: (isoCode: string) => void;
  onAuthorClick?: () => void;
  onTimelineStrike?: (data: StrikeEvent | null) => void;
  onSourceTap?: (source: string) => void;
  onCasualtyHighlight?: (isoCodes: string[]) => void;
  onPlayEvent?: (event: MapEvent) => void;
  onHistoryDate?: (date: string | null) => void;
  initialAlertText?: string;
  onAlertLock?: (alertId: string | null) => void;
  // Clicking a country pill at the top of an active-conflict widget jumps
  // to that country's solo widget (exits the conflict view).
  onCountrySwitch?: (isoCode: string) => void;
  // URL slug for the current conflict — used to keep the address bar in sync
  // with the history open/close state (e.g. /israel-us-iran-war/history).
  conflictSlug?: string;
  // If true, open history mode immediately on mount (deep-link from /history).
  defaultHistoryExpanded?: boolean;
}

function parseCasualties(s: string): number {
  return parseInt(s.replace(/[^0-9]/g, ""), 10) || 0;
}

function extractSourceName(label: string): string {
  return label.split(" — ")[0].split(" —")[0].trim();
}

export default function CountryPanel({ countryCode, onClose, onViewFeed, onConflictSelect, onFocusCountry, onFocusPosition, onCountryHome, onAuthorClick, onTimelineStrike, onSourceTap, onCasualtyHighlight, onPlayEvent, onHistoryDate, initialAlertText, onAlertLock, onCountrySwitch, conflictSlug, defaultHistoryExpanded = false }: Props) {
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const [civTooltip, setCivTooltip]       = useState<string | null>(null);
  const [showAllCasualties, setShowAllCasualties] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(defaultHistoryExpanded);
  const [uploadTick, setUploadTick] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeTile, setActiveTile]     = useState(-1);
  const [hoveredTile, setHoveredTile]   = useState<number | null>(null);
  const [pinnedBulletsTile, setPinnedBulletsTile] = useState<number | null>(null);
  const [activeSlide, setActiveSlide]   = useState(0);
  const [autoPlaying, setAutoPlaying]   = useState(false);
  // TTS state machine: "idle" → "playing" ↔ "paused". Paused holds position
  // in the current MP3 chunk so clicking resume picks up mid-sentence.
  const [ttsState, setTtsState] = useState<"idle" | "playing" | "paused">("idle");
  const ttsPlaying = ttsState === "playing";
  const ttsRef = useRef<TtsHandle | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredAlert,  setHoveredAlert]  = useState<number | null>(null);
  const [lockedAlertIdx, setLockedAlertIdx] = useState<number | null>(null);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [hoverMidY,     setHoverMidY]     = useState(0);
  const [sourcesOpen,   setSourcesOpen]   = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef(false);
  const activeTileRef = useRef(-1);

  const cancelLeave = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); };
  const scheduleLeave = () => { cancelLeave(); leaveTimer.current = setTimeout(() => { setHoveredAlert(null); setSourcesOpen(false); }, 220); };

  // History URL sync — keep the address bar in step with open/close.
  // /israel-us-iran-war → /israel-us-iran-war/history and back.
  useEffect(() => {
    if (!conflictSlug || typeof window === "undefined") return;
    const target = timelineExpanded ? `/${conflictSlug}/history` : `/${conflictSlug}`;
    if (window.location.pathname !== target) {
      window.history.replaceState(null, "", target);
    }
  }, [timelineExpanded, conflictSlug]);


  // Auto-play effect — must be before early returns (React hook rules)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!autoPlayRef.current || !timelineExpanded) return;
    const holdMs = 5000; // base hold; autoAdvance() overrides with word-count timing
    const timer = setTimeout(() => {
      if (!autoPlayRef.current) return;
      const nextIdx = activeTileRef.current + 1;
      const el = scrollRef.current?.querySelector<HTMLElement>(`[data-tile='${nextIdx}']`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        setAutoPlaying(false);
        autoPlayRef.current = false;
      }
    }, holdMs);
    return () => clearTimeout(timer);
  }, [activeTile, autoPlaying, timelineExpanded]);

  if (!countryCode) return null;
  const conflictIds = COUNTRY_CONFLICTS[countryCode];
  if (!conflictIds?.length) return null;

  const activeId  = selectedConflictId ?? conflictIds[0];
  const conflict  = activeId ? CONFLICTS[activeId] : null;

  if (!conflict) return null;

  // ── Sorting ─────────────────────────────────────────────────────────────────
  const sorted = [...conflict.casualties].sort(
    (a, b) => parseCasualties(b.killed) - parseCasualties(a.killed)
  );
  const hasMissingCol = conflict.casualties.some(c => c.missing);
  const hasCivCol     = conflict.casualties.some(c => c.civilianPct !== undefined);

  const displayed = showAllCasualties ? sorted : sorted.slice(0, 2);
  const hiddenCount = sorted.length - 2;

  // ── Timeline data — computed once for both normal + history mode ────────────
  const chronological = [...conflict.timeline.slice(1)].reverse();

  // ── Civ tooltip dismiss on outside click ───────────────────────────────────
  const closeCiv = () => setCivTooltip(null);

  // ── Scroll handler ─────────────────────────────────────────────────────────
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;

    // Detect which strike event is in the reading zone (top 40% of container)
    const cRect = container.getBoundingClientRect();
    const zoneTop    = cRect.top + 60;
    const zoneBottom = cRect.top + cRect.height * 0.45;

    const items = container.querySelectorAll<HTMLElement>("[data-strike]");
    let found = false;
    items.forEach(el => {
      if (found) return;
      const r = el.getBoundingClientRect();
      if (r.top <= zoneBottom && r.bottom >= zoneTop) {
        found = true;
        try {
          const parsed: StrikeEvent = JSON.parse(el.dataset.strike!);
          onTimelineStrike?.(parsed);
        } catch { /* ignore */ }
      }
    });
    if (!found) onTimelineStrike?.(null);
  };

  // ── History-mode scroll handler — detect snapped tile + drive map ─────────
  const handleHistoryScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const tiles = container.querySelectorAll<HTMLElement>("[data-tile]");
    const containerTop = container.getBoundingClientRect().top;

    let closest = -1;
    let closestDist = Infinity;
    tiles.forEach(el => {
      const idx = Number(el.dataset.tile);
      const dist = Math.abs(el.getBoundingClientRect().top - containerTop);
      if (dist < closestDist) { closestDist = dist; closest = idx; }
    });

    if (closest !== activeTileRef.current && closest >= 0) {
      activeTileRef.current = closest;
      setActiveTile(closest);
      setEditorOpen(false); // close editor when scrolling to a different tile
      navigateToTile(closest);
    }
  };

  // Shared: navigate map to a given tile index (used by both scroll + tap)
  const navigateToTile = (idx: number) => {
    const ev = chronological[idx];
    if (ev?.strikeEvent) {
      onTimelineStrike?.(ev.strikeEvent);
    } else {
      onTimelineStrike?.(null);
      if (ev?.mapView) {
        onFocusPosition?.(ev.mapView.center, ev.mapView.zoom);
      }
    }
    // Push the tile's date to the Clock
    onHistoryDate?.(ev?.date ?? null);
    // Reset slide position when tile changes
    setActiveSlide(0);
    slideContainerRef.current?.scrollTo({ top: 0 });
  };

  // ── Enter history mode — zoom out to wide conflict view ────────────────────
  // Tapping "read full story" should drop the user onto the first tile already
  // highlighted, rather than a bare list with nothing selected.
  const enterHistory = () => {
    setTimelineExpanded(true);
    setActiveTile(0);
    activeTileRef.current = 0;
    const first = chronological[0];
    onTimelineStrike?.(first?.strikeEvent ?? null);
    onHistoryDate?.(first?.date ?? null);
    // Zoom out to this conflict's wide "home" camera.
    const home = CONFLICT_HOMEVIEW[conflict.id] ?? DEFAULT_HOMEVIEW;
    onFocusPosition?.(home.center, home.zoom);
    // After render, snap the first tile to the top of the history scroller.
    setTimeout(() => {
      const el = scrollRef.current?.querySelector<HTMLElement>("[data-tile='0']");
      if (el) el.scrollIntoView({ block: "start", behavior: "smooth" });
      else scrollRef.current?.scrollTo({ top: 0 });
    }, 60);
  };

  const exitHistory = () => {
    setTimelineExpanded(false);
    setAutoPlaying(false);
    autoPlayRef.current = false;
    setActiveTile(-1);
    activeTileRef.current = -1;
    onTimelineStrike?.(null);
    onHistoryDate?.(null);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── TTS narration (ElevenLabs via /api/tts) ──────────────────────────────
  // Swapped from window.speechSynthesis → the /api/tts route so the voice is
  // a real newsroom voice (ElevenLabs "Charlie") and not the OS's robot TTS.
  // The server caches every generation in R2 by hash(voice+model+text), so
  // the same conflict timeline only burns credits the first time it's read.
  const stopTts = () => {
    ttsRef.current?.cancel();
    ttsRef.current = null;
    setTtsState("idle");
  };

  const startTts = () => {
    if (typeof window === "undefined") return;
    // Full reset — any prior handle is dead after this.
    ttsRef.current?.cancel();
    ttsRef.current = null;

    // Build full narration: conflict title + each tile's date + text.
    // " ... " separator becomes a natural pause when ElevenLabs reads it.
    const parts: string[] = [`${conflict.title}.`];
    const tiles = timelineExpanded ? chronological : [conflict.timeline[0]];
    for (const ev of tiles) {
      if (!ev) continue;
      parts.push(`${ev.date}. ${ev.text}`);
    }
    const fullText = parts.join(" ... ");

    ttsRef.current = playTts(fullText, {
      onEnd:   () => { setTtsState("idle"); ttsRef.current = null; },
      onError: (err) => {
        console.error("[tts]", err);
        setTtsState("idle");
        ttsRef.current = null;
      },
    });
    setTtsState("playing");
  };

  // Single-button state machine:
  //   idle    → start from the top
  //   playing → pause (hold currentTime mid-chunk)
  //   paused  → resume from that exact spot
  const toggleTts = () => {
    if (ttsState === "idle")    { startTts(); return; }
    if (ttsState === "playing") {
      ttsRef.current?.pause();
      setTtsState("paused");
      return;
    }
    if (ttsState === "paused") {
      ttsRef.current?.resume();
      setTtsState("playing");
      return;
    }
  };

  // Cleanup on unmount — release any still-playing audio element.
  useEffect(() => () => { ttsRef.current?.cancel(); }, []);

  // Stop narration when the user navigates to a different conflict; the old
  // narration is about the wrong thing now.
  useEffect(() => {
    return () => { ttsRef.current?.cancel(); ttsRef.current = null; setTtsState("idle"); };
  }, [selectedConflictId]);

  // Notify parent when alert lock changes
  useEffect(() => {
    if (!onAlertLock) return;
    if (lockedAlertIdx !== null) {
      onAlertLock(`${conflict.id}-alert-${lockedAlertIdx}`);
    } else {
      onAlertLock(null);
    }
  }, [lockedAlertIdx, conflict.id]);

  const toggleAutoPlay = () => {
    const next = !autoPlaying;
    setAutoPlaying(next);
    autoPlayRef.current = next;
    if (next) {
      if (activeTileRef.current < 0) {
        const first = scrollRef.current?.querySelector<HTMLElement>("[data-tile='0']");
        first?.scrollIntoView({ block: "start", behavior: "smooth" });
      }
      // Play kicks off the AI narration as well as the auto-advance.
      startTts();
    } else {
      stopTts();
    }
  };

  // Effect: auto-advance when autoPlaying + activeTile changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const autoAdvance = () => {
    if (!autoPlayRef.current || !timelineExpanded) return;
    const ev = chronological[activeTileRef.current];
    const wordCount = ev ? ev.text.split(/\s+/).length : 20;
    const holdMs = Math.max(3500, (wordCount / 3.0) * 1000); // ~3 words/sec reading pace
    const timer = setTimeout(() => {
      if (!autoPlayRef.current) return;
      const nextIdx = activeTileRef.current + 1;
      if (nextIdx < chronological.length) {
        const el = scrollRef.current?.querySelector<HTMLElement>(`[data-tile='${nextIdx}']`);
        el?.scrollIntoView({ behavior: "smooth" });
      } else {
        setAutoPlaying(false);
        autoPlayRef.current = false;
      }
    }, holdMs);
    return () => clearTimeout(timer);
  };

  // ── Row renderer ──────────────────────────────────────────────────────────
  const renderRow = (c: typeof conflict.casualties[0]) => {
    const side = getCountrySide(c.country, conflict.sides);
    const nameColor = "rgba(255,255,255,0.78)";
    const dot = SIDE_COLORS[side].dot;
    const hasInjured = c.injured && c.injured !== "" && c.injured !== "—";
    return (
      <tr key={c.country}>
        <td className="py-1 pr-2">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: dot, flexShrink: 0, display: "inline-block" }} />
            {CASUALTY_ISO[c.country] && onFocusCountry ? (
              <button
                onClick={(e) => { e.stopPropagation(); onFocusCountry(CASUALTY_ISO[c.country]); }}
                style={{ fontSize: 12, fontFamily: "monospace", color: nameColor, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", letterSpacing: "0.02em" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,1)")}
                onMouseLeave={e => (e.currentTarget.style.color = nameColor)}
              >{c.country}</button>
            ) : (
              <span style={{ fontSize: 12, fontFamily: "monospace", color: nameColor }}>{c.country}</span>
            )}
          </div>
        </td>
        {!hasMissingCol && (
          <td style={{ textAlign: "right", fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", paddingRight: 8, paddingTop: 4, paddingBottom: 4 }}>
            {hasInjured ? c.injured : ""}
          </td>
        )}
        {hasMissingCol && (
          <td style={{ textAlign: "right", fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.32)", paddingRight: 8 }}>
            {c.missing ?? ""}
          </td>
        )}
        <td style={{ textAlign: "right", fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: "rgba(255,255,255,0.88)", paddingRight: 8, paddingTop: 4, paddingBottom: 4 }}>
          {c.killed}{c.killedHasMissing ? "+" : ""}
        </td>
        {hasCivCol && !hasMissingCol && (
          <td style={{ textAlign: "right", paddingTop: 4, paddingBottom: 4, position: "relative" }}>
            {c.civilianPct !== undefined ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setCivTooltip(civTooltip === c.country ? null : c.country); }}
                  style={{
                    fontSize: 10, fontFamily: "monospace", padding: "2px 6px", borderRadius: 4, cursor: "pointer", border: "none",
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.92)",
                    fontWeight: 700,
                  }}>
                  {c.civilianPct}%
                </button>
                {civTooltip === c.country && (
                  <div onClick={e => e.stopPropagation()} style={{
                    position: "absolute", top: "calc(100% + 6px)", right: 0,
                    background: "rgba(4,6,18,0.97)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, padding: "10px 12px", width: 210, zIndex: 30,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.7)",
                  }}>
                    <p style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 0 8px" }}>
                      <span style={{ color: "rgba(255,255,255,0.92)", fontWeight: 700 }}>{c.civilianPct}%</span> of confirmed deaths were civilians.{" "}
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>{100 - c.civilianPct!}% were combatants or military personnel.</span>
                    </p>
                    {c.civSources && c.civSources.length > 0 && (
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 7, display: "flex", flexDirection: "column", gap: 4 }}>
                        <p style={{ margin: "0 0 4px", fontSize: 8, fontFamily: "monospace", letterSpacing: "0.1em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase" }}>Sources</p>
                        {c.civSources.map((src, si) => (
                          <div key={si} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button
                              onClick={e => { e.stopPropagation(); onSourceTap?.(extractSourceName(src.label)); }}
                              style={{ fontSize: 10, color: "rgba(96,165,250,0.7)", background: "none", border: "none", textAlign: "left", lineHeight: 1.4, padding: 0, cursor: "pointer", flex: 1 }}
                              onMouseEnter={e => (e.currentTarget.style.color = "rgba(147,197,253,1)")}
                              onMouseLeave={e => (e.currentTarget.style.color = "rgba(96,165,250,0.7)")}
                            >{src.label}</button>
                            <a href={src.url} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{ fontSize: 9, color: "rgba(96,165,250,0.4)", textDecoration: "none", flexShrink: 0 }}
                              onMouseEnter={e => (e.currentTarget.style.color = "rgba(147,197,253,0.8)")}
                              onMouseLeave={e => (e.currentTarget.style.color = "rgba(96,165,250,0.4)")}
                            >↗</a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </td>
        )}
      </tr>
    );
  };

  const alerts = CONFLICT_ALERTS[activeId ?? ""] ?? [];
  const activeAlert = hoveredAlert !== null ? alerts[hoveredAlert] : null;

  return (
    <>
    <style>{`@keyframes cpFade{0%,100%{opacity:0}50%{opacity:1}}`}</style>
    <div
      className="absolute left-6 z-20 w-[520px]"
      style={{ top: 72, bottom: 24, display: "flex", flexDirection: "column" }}
      onClick={closeCiv}
    >
      <div style={{
        background: "rgba(4,6,18,0.62)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        boxShadow: "0 24px 80px rgba(0,0,0,0.38), 0 1px 3px rgba(0,0,0,0.18)",
        display: "flex", flexDirection: "column",
        height: "100%", overflow: "hidden",
      }}>

        {/* ── STICKY HEADER ── */}
        <div style={{ flexShrink: 0, padding: "6px 18px 6px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <h2
                  onClick={() => {
                    const home = CONFLICT_HOMEVIEW[conflict.id] ?? DEFAULT_HOMEVIEW;
                    onFocusPosition?.(home.center, home.zoom);
                    if (timelineExpanded) exitHistory();
                  }}
                  style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)", letterSpacing: "0.02em", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }}
                >
                  {conflict.title}
                </h2>
              </div>
              <p style={{ margin: "3px 0 0", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.32)", letterSpacing: "0.06em" }}>
                {conflict.date}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {/* audio button removed from here — it now lives next to the
                  "play" button inside the history header and only appears
                  once play is active. */}
              <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase" }}>
                active conflict
              </span>
              {/* "← back" only appears when on a secondary (non-primary) conflict */}
              {selectedConflictId && selectedConflictId !== conflictIds[0] && (
                <button
                  onClick={() => { setSelectedConflictId(null); stopTts(); }}
                  title="back"
                  style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: "2px 4px" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                >← back</button>
              )}
            </div>
          </div>

        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div
          ref={!timelineExpanded ? scrollRef : undefined}
          onScroll={!timelineExpanded ? handleScroll : undefined}
          style={{ flex: 1, overflowY: timelineExpanded ? "hidden" : "auto", minHeight: 0, display: "flex", flexDirection: "column" }}
        >
          {/* Casualties, alerts, feed — hidden in history mode */}
          {!timelineExpanded && (<>
          {/* Casualties + timeline preview side by side */}
          <div style={{ padding: "8px 14px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 14, alignItems: "flex-start" }}>
            {/* LEFT: casualties table */}
            <div style={{ flexShrink: 0 }}>
              <table style={{ width: "auto", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", fontWeight: "normal", paddingBottom: 4 }}></th>
                    {!hasMissingCol && <th style={{ textAlign: "right", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", fontWeight: "normal", paddingBottom: 4, paddingRight: 8 }}>Injured</th>}
                    {hasMissingCol && <th style={{ textAlign: "right", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", fontWeight: "normal", paddingBottom: 4, paddingRight: 8 }}>Missing</th>}
                    <th style={{ textAlign: "right", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", fontWeight: "normal", paddingBottom: 4, paddingRight: 8 }}>Killed</th>
                    {hasCivCol && !hasMissingCol && <th style={{ textAlign: "right", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", fontWeight: "normal", paddingBottom: 4 }}>Civ %</th>}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(renderRow)}
                </tbody>
              </table>
              {sorted.length > 2 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = !showAllCasualties;
                    setShowAllCasualties(next);
                    if (next) {
                      const codes = sorted.map(c => CASUALTY_ISO[c.country]).filter(Boolean);
                      onCasualtyHighlight?.(codes);
                    } else {
                      onCasualtyHighlight?.([]);
                    }
                  }}
                  style={{ marginTop: 0, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", padding: "1px 0", display: "block", animation: "cpFade 2s ease-in-out infinite" }}
                  onMouseEnter={e => (e.currentTarget.style.animationPlayState = "paused")}
                  onMouseLeave={e => (e.currentTarget.style.animationPlayState = "running")}>
                  {showAllCasualties ? "▲ show less" : `▼ +${hiddenCount} more`}
                </button>
              )}
            </div>
            {/* RIGHT: timeline preview (March — Present) */}
            {conflict.timeline[0] && (
              <div
                style={{ flex: 1, minWidth: 0, paddingLeft: 12, borderLeft: "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); enterHistory(); }}
              >
                <div style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 600, color: "rgba(255,255,255,0.75)", letterSpacing: "0.03em", marginBottom: 5 }}>
                  {(() => { const d = conflict.timeline[0].date; if (/^(19|20)\d\d/.test(d)) return d; return d.replace(/,?\s*(19|20)\d\d/, ""); })()}
                </div>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.48)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {conflict.timeline[0].text}
                </p>
              </div>
            )}
          </div>


          {/* ── Article cards ── */}
          <div style={{ padding: "8px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 10 }}>
            {([
              { headline: "Who's funded and gained from the Middle East wars?", source: "Atlas Analysis" },
              { headline: "The government's use of AI in war.", source: "Atlas Analysis" },
            ] as const).map((art, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  aspectRatio: "1 / 1",
                  maxWidth: "calc(50% - 5px)",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)",
                  padding: "10px 11px",
                  display: "flex", flexDirection: "column", justifyContent: "flex-start",
                  cursor: "pointer", transition: "background 0.12s",
                  overflow: "hidden",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              >
                <div style={{
                  fontSize: 12, lineHeight: 1.42, color: "rgba(255,255,255,0.78)",
                  display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {art.headline}
                </div>
              </div>
            ))}
          </div>

          {/* Live alerts */}
          {(() => {
            const conflictAlerts = CONFLICT_ALERTS[conflict.id] ?? [];
            if (conflictAlerts.length === 0) return null;
            const visibleAlerts = showAllAlerts ? conflictAlerts : conflictAlerts.slice(0, 3);
            return (
              <div style={{ padding: "14px 6px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <p
                  onClick={() => conflictAlerts.length > 3 && setShowAllAlerts(v => !v)}
                  style={{
                    margin: "0 0 6px 12px",
                    fontSize: 11,
                    fontFamily: "monospace",
                    letterSpacing: "0.18em",
                    color: "rgba(255,255,255,0.42)",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    cursor: conflictAlerts.length > 3 ? "pointer" : "default",
                  }}
                  onMouseEnter={e => conflictAlerts.length > 3 && (e.currentTarget.style.color = "rgba(255,255,255,0.58)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.42)")}
                >live alerts</p>
                {visibleAlerts.map((a, i, arr) => {
                  const alertId = `${conflict.id}-alert-${i}`;
                  const isLocked = lockedAlertIdx === i;
                  return (
                    <div key={i}>
                      <LiveAlertRow
                        item={a}
                        bottomBorder={i < arr.length - 1}
                        showConfidenceInline={false}
                        expandOnHover={true}
                        defaultExpanded={!!initialAlertText && a.text === initialAlertText}
                        isActive={isLocked || hoveredAlert === i}
                        onClick={() => setLockedAlertIdx(prev => prev === i ? null : i)}
                        onHoverChange={(active, anchorY) => {
                          cancelLeave();
                          if (active) { setHoveredAlert(i); setHoverMidY(anchorY); }
                          else scheduleLeave();
                        }}
                      />
                    </div>
                  );
                })}
                {showAllAlerts && conflictAlerts.length > 3 && (
                  <div style={{ padding: "8px 12px", textAlign: "center" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowAllAlerts(false); }}
                      style={{
                        fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em",
                        color: "rgba(255,255,255,0.35)", background: "none", border: "none",
                        cursor: "pointer", padding: "2px 0", textTransform: "uppercase",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.58)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                    >
                      see less
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          </>)}

          {/* Timeline / History */}
          {(() => {
            const NEUTRAL = { solid: "rgba(255,255,255,0.55)", border: "rgba(255,255,255,0.20)", glow: "none", date: "rgba(255,255,255,0.72)", text: "rgba(255,255,255,0.56)" };
            const HIGHLIGHT = { solid: "rgba(255,255,255,0.85)", border: "rgba(255,255,255,0.3)", glow: "0 0 6px rgba(255,255,255,0.25)", date: "rgba(255,255,255,0.92)", text: "rgba(255,255,255,0.72)" };
            const extractYear = (d: string) => { const m = d.match(/\b(20\d\d|19\d\d)\b/); return m ? parseInt(m[1]) : null; };

            const latest = conflict.timeline[0];

            if (!timelineExpanded) {
              // ── Normal mode: action buttons only (preview is in the casualties row) ──
              return (
                <div style={{ padding: "10px 16px 16px", display: "flex", gap: 8 }}>
                  {chronological.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); enterHistory(); }}
                      style={{ flex: 1, padding: "8px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "rgba(255,255,255,0.45)", cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                    >See Timeline →</button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewFeed(conflict.feedKey); }}
                    style={{ flex: 1, padding: "8px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", background: "none", border: "none", borderRadius: 8, color: "rgba(255,255,255,0.45)", cursor: "pointer", animation: "cpFade 2s ease-in-out infinite" }}
                    onMouseEnter={e => { e.currentTarget.style.animationPlayState = "paused"; e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                    onMouseLeave={e => { e.currentTarget.style.animationPlayState = "running"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                  >Live Feed</button>
                </div>
              );
            }
            // ── History mode: snap-scroll tiles ──
            return (
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                {/* Fixed history header */}
                <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                  <p style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.42)", textTransform: "uppercase", margin: 0, fontWeight: 500 }}>history</p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {/* Play (was "auto") — kicks off both the narration AND
                        the tile auto-advance at reading pace. */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleAutoPlay(); }}
                      style={{
                        fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em",
                        color: autoPlaying ? "rgba(239,68,68,0.7)" : "rgba(255,255,255,0.3)",
                        background: autoPlaying ? "rgba(239,68,68,0.08)" : "none",
                        border: `1px solid ${autoPlaying ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 4, cursor: "pointer", padding: "3px 8px", textTransform: "uppercase",
                      }}
                    >{autoPlaying ? "⏸ pause" : "▶ play"}</button>
                    {/* Audio toggle — only visible while play is active, so
                        the rail stays clean until the user opts into narration.
                        Three-state: idle 🔇 · playing ⏸ · paused ▶. Paused holds
                        position mid-sentence; resume picks up from the exact
                        currentTime, not from the top. */}
                    {autoPlaying && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleTts(); }}
                        title={
                          ttsState === "playing" ? "pause narration" :
                          ttsState === "paused"  ? "resume narration" :
                                                   "start narration"
                        }
                        style={{
                          fontSize: 12,
                          background: ttsState !== "idle" ? "rgba(255,255,255,0.08)" : "none",
                          border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 4,
                          color: ttsState !== "idle" ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)",
                          lineHeight: 1,
                        }}
                      >{
                        ttsState === "playing" ? "⏸" :
                        ttsState === "paused"  ? "▶" :
                                                 "🔇"
                      }</button>
                    )}
                    {/* Back → leaves history mode, returns to active-conflict view */}
                    <button
                      onClick={(e) => { e.stopPropagation(); exitHistory(); }}
                      title="back to active conflict"
                      style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", display: "inline-flex", alignItems: "center", gap: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                    >← back</button>
                  </div>
                </div>

                {/* Snap-scroll tile container. Extra bottom padding lets the
                    last tile scroll up until it sits at the top of the viewport
                    (instead of bumping against the end of the list). */}
                <div
                  onScroll={handleHistoryScroll}
                  style={{
                    flex: 1, overflowY: "auto", minHeight: 0,
                    scrollSnapType: "y mandatory",
                    paddingBottom: "calc(100vh - 260px)",
                  }}
                >
                  {chronological.map((event, i) => {
                    const palette = event.highlight ? HIGHLIGHT : NEUTRAL;
                    const isActive = activeTile === i;
                    const currentYear = extractYear(event.date);
                    const prevEvent = chronological[i - 1];
                    const nextEvent = chronological[i + 1];
                    const prevYear = prevEvent ? extractYear(prevEvent.date) : null;
                    const showYearBefore = i === 0 || (prevYear !== null && prevYear !== currentYear);

                    // Era bracket — detect era boundaries for bracket label
                    const eraColor = event.era === "genocide"
                      ? { border: "rgba(220,38,38,0.40)",  fg: "rgba(252,165,165,0.9)",  text: "Gaza Genocide" }
                      : event.era === "occupation"
                      ? { border: "rgba(251,191,36,0.38)", fg: "rgba(253,224,71,0.85)",  text: "Israeli Occupation" }
                      : event.era === "treaty"
                      ? { border: "rgba(22,163,74,0.42)",  fg: "rgba(74,222,128,0.95)",  text: "JCPOA Treaty" }
                      : event.era === "withdrawal"
                      ? { border: "rgba(220,38,38,0.42)",  fg: "rgba(252,165,165,0.95)", text: "US Withdrawal" }
                      : event.era === "proxy"
                      ? { border: "rgba(76,29,149,0.55)",  fg: "rgba(216,180,254,0.95)", text: "Shadow War" }
                      : event.era === "war"
                      ? { border: "rgba(234,88,12,0.45)",  fg: "rgba(253,186,116,0.95)", text: "War" }
                      : null;
                    const isEraStart = event.era && prevEvent?.era !== event.era;
                    const isEraEnd   = event.era && nextEvent?.era !== event.era;

                    // Bullet popup: pull slide.info, drop the @blue/@red
                    // signatory lines (they live in the video caption), keep
                    // only • bullet lines so the popup stays a tight
                    // requirements list rather than a wall of prose.
                    const rawBullets = (event.slides?.[0]?.info ?? "")
                      .split("\n")
                      .map(l => l.trim())
                      .filter(l => l.startsWith("•"))
                      .map(l => l.replace(/^•\s*/, ""));
                    const showBullets =
                      rawBullets.length > 0 &&
                      (hoveredTile === i || pinnedBulletsTile === i);

                    return (
                      <div
                        key={i}
                        data-tile={i}
                        {...(event.strikeEvent ? { "data-strike": JSON.stringify(event.strikeEvent) } : {})}
                        onMouseEnter={() => setHoveredTile(i)}
                        onMouseLeave={() => setHoveredTile(prev => (prev === i ? null : prev))}
                        onClick={(e) => {
                          activeTileRef.current = i;
                          setActiveTile(i);
                          // Toggle the pinned bullets on click so a second
                          // click dismisses the popup.
                          setPinnedBulletsTile(prev => (prev === i ? null : i));
                          navigateToTile(i);
                          // Pin the clicked tile to the top of the history
                          // scroller so the selected event is always the first
                          // thing the user sees (map + bubble line up with it).
                          const tile = e.currentTarget as HTMLElement;
                          tile.scrollIntoView({ block: "start", behavior: "smooth" });
                        }}
                        style={{
                          scrollSnapAlign: "start",
                          padding: "14px 16px 16px 14px",
                          margin: "2px 10px",
                          borderRadius: 14,
                          borderLeft: eraColor ? `2px solid ${eraColor.border}` : "1px solid rgba(255,255,255,0.04)",
                          borderTop: "1px solid rgba(255,255,255,0.04)",
                          borderRight: "1px solid rgba(255,255,255,0.04)",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          background: isActive ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.012)",
                          minHeight: 100,
                          cursor: "pointer",
                          opacity: isActive || activeTile < 0 ? 1 : 0.35,
                          transition: "opacity 0.4s ease, background 0.3s ease",
                        }}
                      >
                        {showYearBefore && currentYear && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em" }}>{currentYear}</span>
                            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 12, paddingLeft: 4, alignItems: "flex-start" }}>
                          <div style={{ flexShrink: 0, marginTop: 4 }}>
                            <div style={{
                              width: 7, height: 7, borderRadius: "50%",
                              background: isActive ? "rgba(239,68,68,0.8)" : palette.solid,
                              border: `1px solid ${isActive ? "rgba(239,68,68,0.4)" : palette.border}`,
                              boxShadow: isActive ? "0 0 8px rgba(239,68,68,0.4)" : palette.glow,
                              transition: "all 0.3s ease",
                            }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 5px" }}>
                              <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: palette.date, letterSpacing: "0.03em" }}>
                                {(() => { const d = event.date; if (/^(19|20)\d\d/.test(d)) return d; return d.replace(/,?\s*(19|20)\d\d/, ""); })()}
                              </span>
                              {/* Category tag — inline beside date */}
                              {event.tag && (
                                <span style={{
                                  fontSize: 8, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase",
                                  padding: "2px 7px", borderRadius: 3, flexShrink: 0,
                                  background: event.tag === "terrorist attack" ? "rgba(239,68,68,0.12)" : event.tag === "genocide" ? "rgba(239,68,68,0.08)" : event.tag === "withdrawal" ? "rgba(239,68,68,0.12)" : event.tag === "treaty" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)",
                                  color: event.tag === "terrorist attack" ? "rgba(239,68,68,0.7)" : event.tag === "genocide" ? "rgba(239,68,68,0.5)" : event.tag === "withdrawal" ? "rgba(239,68,68,0.7)" : event.tag === "treaty" ? "rgba(34,197,94,0.8)" : "rgba(255,255,255,0.3)",
                                  border: `1px solid ${event.tag === "terrorist attack" ? "rgba(239,68,68,0.2)" : event.tag === "genocide" ? "rgba(239,68,68,0.1)" : event.tag === "withdrawal" ? "rgba(239,68,68,0.2)" : event.tag === "treaty" ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.08)"}`,
                                }}>
                                  {event.tag}
                                </span>
                              )}
                            </div>
                            {event.link ? (
                              <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  margin: 0,
                                  fontSize: 14,
                                  color: isActive ? "rgba(255,255,255,0.85)" : palette.text,
                                  lineHeight: 1.65,
                                  transition: "color 0.3s ease",
                                  textDecoration: "none",
                                  display: "block",
                                  cursor: "pointer",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(34,197,94,0.9)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = isActive ? "rgba(255,255,255,0.85)" : palette.text; }}
                              >
                                {event.text}
                              </a>
                            ) : (
                              <p style={{ margin: 0, fontSize: 14, color: isActive ? "rgba(255,255,255,0.85)" : palette.text, lineHeight: 1.65, transition: "color 0.3s ease" }}>
                                {event.text}
                              </p>
                            )}
                            {/* No provenance tag here — the timeline tiles are
                                written by jeni kim and william, not the model. */}
                            {/* Bullet-point popup: fed from slide.info's
                                "• …" lines. Appears on hover, pinned on click
                                (click again to dismiss). Bullets use a warm
                                tinted color so they read as supplemental
                                context rather than primary body text. */}
                            {showBullets && (
                              <div
                                onMouseEnter={() => setHoveredTile(i)}
                                onMouseLeave={() => setHoveredTile(prev => (prev === i ? null : prev))}
                                style={{
                                  marginTop: 10,
                                  padding: "10px 12px",
                                  borderRadius: 10,
                                  background: "rgba(255,255,255,0.03)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  boxShadow: pinnedBulletsTile === i ? "0 4px 18px rgba(0,0,0,0.35)" : "none",
                                  transition: "box-shadow 0.2s",
                                }}
                              >
                                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                                  {rawBullets.map((b, bi) => (
                                    <li key={bi} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, lineHeight: 1.55 }}>
                                      <span style={{ color: "rgba(251,191,36,0.75)", flexShrink: 0, fontWeight: 700, marginTop: 1 }}>•</span>
                                      <span style={{ color: "rgba(253,224,171,0.78)" }}>{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {/* Linked conflict/attack pills — pulsing cross-timeline bridges */}
                            {event.linkedConflicts && event.linkedConflicts.length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                                {event.linkedConflicts.map((lc, lci) => {
                                  const isAttack = lc.type === "attack";
                                  const baseColor = isAttack ? "239,68,68" : "96,165,250";
                                  return (
                                    <button
                                      key={lci}
                                      className={isAttack ? "tooltip-pulse-border" : "link-pulse-border"}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedConflictId(lc.id);
                                        onConflictSelect?.(lc.id);
                                        setTimelineExpanded(false);
                                        setActiveTile(-1);
                                        activeTileRef.current = -1;
                                      }}
                                      style={{
                                        fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em",
                                        color: `rgba(${baseColor},0.7)`, background: `rgba(${baseColor},0.06)`,
                                        border: `1px solid rgba(${baseColor},0.2)`, borderRadius: 10,
                                        cursor: "pointer", padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 6,
                                      }}
                                      onMouseEnter={e => { e.currentTarget.style.background = `rgba(${baseColor},0.12)`; e.currentTarget.style.color = `rgba(${baseColor},0.9)`; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = `rgba(${baseColor},0.06)`; e.currentTarget.style.color = `rgba(${baseColor},0.7)`; }}
                                    >
                                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: `rgba(${baseColor},0.6)` }} className={isAttack ? "tooltip-pulse-dot" : "link-pulse-dot"} />
                                      {lc.label} →
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Era label — outlined oval at bottom of last tile in each era */}
                        {isEraEnd && eraColor && !event.tag && (
                          <div style={{
                            display: "inline-block",
                            background: "transparent",
                            border: `1px solid ${eraColor.border}`,
                            borderRadius: 99,
                            padding: "2px 9px",
                            fontSize: 8, fontFamily: "monospace", letterSpacing: "0.14em",
                            color: eraColor.fg, textTransform: "uppercase",
                            marginTop: 10,
                          }}>
                            {eraColor.text}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Back to top — exits history mode */}
                  <div style={{ padding: "16px", scrollSnapAlign: "start", textAlign: "center" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); exitHistory(); }}
                      style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.28)", background: "none", border: "none", cursor: "pointer", padding: "8px 16px" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
                    >↑ back to top</button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>

    {/* Gap-zone buttons — upload + edit, fixed in the 96px column.
        Both track activeTile so they always target the focused paragraph.
        Vertical positions controlled by T.GAP_UPLOAD_TOP / T.GAP_EDIT_TOP. */}
    {timelineExpanded && activeTile >= 0 && (() => {
      const ev = chronological[activeTile];
      if (!ev) return null;
      const evId = eventFolderId(conflict.id, ev.date);
      return (
        <>
          {/* Upload */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: "fixed", left: T.PANEL_W + 12, top: T.GAP_UPLOAD_TOP, zIndex: 25, pointerEvents: "auto" }}
          >
            <EventUploadButton
              eventId={evId}
              onUploaded={() => setUploadTick(t => t + 1)}
            />
          </div>

          {/* Edit */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: "fixed", left: T.PANEL_W + 12, top: T.GAP_EDIT_TOP, zIndex: 25, pointerEvents: "auto" }}
          >
            <button
              onClick={() => setEditorOpen(true)}
              title="edit media — resize, reorder, delete"
              style={{
                fontSize: 9, fontFamily: T.MONO, letterSpacing: T.TRACK_MED,
                textTransform: "uppercase", color: clr.white(0.4),
                background: clr.white(0.06), border: `1px solid ${clr.white(0.12)}`,
                borderRadius: T.PILL_RADIUS, padding: "4px 10px",
                cursor: "pointer", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = clr.white(0.12); e.currentTarget.style.color = clr.white(0.8); }}
              onMouseLeave={e => { e.currentTarget.style.background = clr.white(0.06); e.currentTarget.style.color = clr.white(0.4); }}
            >edit</button>
          </div>

          {/* Media editor modal */}
          {editorOpen && (
            <EventMediaEditor
              eventId={evId}
              slides={ev.slides ?? []}
              onClose={() => setEditorOpen(false)}
              onChanged={() => setUploadTick(t => t + 1)}
            />
          )}
        </>
      );
    })()}

    {/* Focused event → compact video bubble over the map. Scroll-snap
        container merges the hardcoded slide video with any user-uploaded
        clips for this specific event, so recently-added uploads appear
        just below the default video. */}
    {timelineExpanded && activeTile >= 0 && (() => {
      const ev = chronological[activeTile];
      if (!ev) return null;
      // Pass EVERY slide + EVERY article so the bubble can render the full
      // media column. The bubble itself decides layout/spacing/sizing so
      // every event — video-heavy, article-heavy, or empty — looks consistent.
      return (
        <EventVideoBubble
          key={`${eventFolderId(conflict.id, ev.date)}-${uploadTick}`}
          eventDate={ev.date}
          eventId={eventFolderId(conflict.id, ev.date)}
          slides={ev.slides ?? []}
          articles={ev.articles ?? []}
        />
      );
    })()}

    {/* Floating confidence + sources — sibling outside backdropFilter stacking context */}
    {activeAlert && (() => {
      const cc = confColor(activeAlert.confidence);
      return (
        <div
          onMouseEnter={() => { cancelLeave(); setSourcesOpen(true); }}
          onMouseLeave={() => { setSourcesOpen(false); scheduleLeave(); }}
          style={{ position: "fixed", left: T.PANEL_W - 40, top: hoverMidY - 92, paddingLeft: 60, paddingTop: 80, paddingBottom: 80, paddingRight: 60, zIndex: 21, pointerEvents: "auto" }}
        >
          <div style={{
            background: "rgba(4,6,18,0.92)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            boxShadow: "0 8px 60px rgba(0,0,0,0.85), 0 2px 8px rgba(0,0,0,0.5)",
            backdropFilter: "blur(20px)",
            padding: "8px 12px 10px",
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", minWidth: 52 }}>confidence</span>
            <div style={{ width: 100, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.10)", overflow: "hidden", flexShrink: 0 }}>
              <div style={{ width: `${activeAlert.confidence}%`, height: "100%", borderRadius: 99, background: cc, transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: cc, minWidth: 30 }}>{activeAlert.confidence}%</span>
            {/* Upload chip — lives in the floating panel so it hovers outside
                the live alerts list instead of cluttering each row. */}
            <div style={{ marginLeft: 4 }}>
              <EventUploadButton
                eventId={`${activeId}-alert-${hoveredAlert}`}
                onUploaded={() => {}}
              />
            </div>
          </div>
          {sourcesOpen && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
              <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)", marginRight: 2 }}>SOURCES</span>
              {activeAlert.sources.map(s => (
                <button key={s}
                  onClick={e => { e.stopPropagation(); onSourceTap?.(s); }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
                  style={{ fontSize: 10, fontFamily: T.MONO, letterSpacing: T.TRACK_TIGHT, padding: "2px 8px", borderRadius: T.PILL_RADIUS, cursor: "pointer", background: T.PILL_BG, border: T.PILL_BORDER, color: clr.white(0.65) }}
                >{s}</button>
              ))}
            </div>
          )}
          </div>
        </div>
      );
    })()}

    {/* Live alert media bubble — when an alert row is locked, surface any
        uploaded videos + articles for that alert using the SAME sizing and
        styling as timeline events. Uploads are keyed by
        "<conflictId>-alert-<idx>"; the bubble reads them from the events
        pipeline (scope="event") so the behaviour is 1:1 with history mode.
        Hidden while history/timeline mode is active so the two bubbles
        never overlap. */}
    {conflict && lockedAlertIdx !== null && !timelineExpanded && (
      <EventVideoBubble
        key={`${conflict.id}-alert-${lockedAlertIdx}`}
        eventDate=""
        eventId={`${conflict.id}-alert-${lockedAlertIdx}`}
      />
    )}
    </>
  );
}
