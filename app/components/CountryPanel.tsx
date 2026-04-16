"use client";

import { useState, useRef, useEffect } from "react";
import LiveAlertRow from "./LiveAlertRow";
import { SIDE_COLORS, getCountrySide } from "../lib/sides";
import { getEventsForTimeline, type MapEvent } from "../lib/mapEvents";

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
    { time: "NOW",    danger: 5, confidence: 96, sources: ["AP", "Reuters", "ACLED"], pulse: true,
      text: "Israel-Lebanon border exchange — IDF artillery responds to Hezbollah rocket fire in Galilee",
      description: "IDF artillery units opened fire on southern Lebanese villages after Hezbollah launched a salvo of 40+ rockets targeting communities in the Galilee region. Evacuation orders are in effect for several northern Israeli towns. Lebanese civil defense reports casualties in the Bint Jbeil district.",
      flyTo: { center: [35.2, 33.1] as [number,number], zoom: 7 } },
    { time: "12m",    danger: 5, confidence: 93, sources: ["Reuters", "AP"], pulse: true,
      text: "US 5th Fleet announces heightened readiness posture in Persian Gulf",
      description: "The US Navy's 5th Fleet, headquartered in Bahrain, has raised its alert status following intelligence reports of Iranian naval mobilization near the Strait of Hormuz. Two additional destroyers are being repositioned.",
      flyTo: { center: [50.5, 26.2] as [number,number], zoom: 5 } },
    { time: "2d ago", danger: 4, confidence: 91, sources: ["NYT", "Haaretz", "AP"],
      text: "IDF strikes Hezbollah command node in Beirut southern suburbs — 3 commanders killed",
      description: "Israeli Air Force F-35Is struck a Hezbollah command-and-control node beneath a residential building in the Dahieh district of Beirut. IDF confirms three senior Hezbollah field commanders were killed. Lebanese civil defense reports 11 civilians injured. The operation is the deepest strike inside Beirut since the 2024 ceasefire.",
      flyTo: { center: [35.5, 33.85] as [number,number], zoom: 9 } },
    { time: "2d ago", danger: 4, confidence: 88, sources: ["Reuters", "ACLED"],
      text: "IRGC Navy deploys additional patrol vessels near Strait of Hormuz — tanker diversions begin",
      description: "Iran's Islamic Revolutionary Guard Corps Navy has deployed 14 additional fast-attack craft to patrol sectors near the narrowest point of the Strait of Hormuz. Several major shipping firms have diverted tankers via the longer Cape of Good Hope route. Daily throughput of crude oil through the strait has declined by an estimated 22%.",
      flyTo: { center: [56.5, 26.5] as [number,number], zoom: 7 } },
    { time: "3d ago", danger: 3, confidence: 85, sources: ["Haaretz", "Reuters"],
      text: "Israeli cabinet approves expanded Lebanon ground incursion — 3 additional brigades mobilized",
      description: "Israel's Security Cabinet voted 9-2 to authorize an expanded ground operation in southern Lebanon, committing an additional three armored brigades. The IDF Northern Command has issued displacement orders for 14 villages north of the Litani River. UN peacekeeping forces (UNIFIL) have been notified and are consolidating to protected compounds.",
      flyTo: { center: [35.3, 33.4] as [number,number], zoom: 8 } },
    { time: "3d ago", danger: 3, confidence: 90, sources: ["Pentagon", "Reuters"],
      text: "US deploys THAAD battery to Qatar — Al Udeid AB reinforced following missile threat intelligence",
      description: "A Terminal High Altitude Area Defense battery has been airlifted to Al Udeid Air Base in Qatar following specific intelligence of Iranian ballistic missile targeting. The Pentagon confirmed the deployment, citing credible threats against US forces in the Gulf. Qatar's defense ministry issued a joint statement affirming coordination.",
      flyTo: { center: [51.3, 25.1] as [number,number], zoom: 8 } },
    { time: "4d ago", danger: 4, confidence: 97, sources: ["CENTCOM", "AP"],
      text: "Houthi anti-ship missiles target USS Gravely in Red Sea — missile intercepted, no casualties",
      description: "The Houthi movement launched two anti-ship ballistic missiles at the USS Gravely, a guided-missile destroyer conducting freedom of navigation operations in the southern Red Sea. Both missiles were successfully intercepted by the ship's SM-2 defense system. CENTCOM confirmed no casualties or damage. This is the 34th documented Houthi attack on US naval assets since October 2023.",
      flyTo: { center: [43.5, 14.0] as [number,number], zoom: 7 } },
  ],
  "israel-gaza": [
    { time: "NOW", danger: 5, confidence: 97, sources: ["AP", "Al Jazeera", "Reuters"], pulse: true,
      text: "Israeli attacks kill 11, including two children, in day of strikes on Gaza",
      description: "A three-year-old and a 14-year-old were among those killed in Israel's latest strikes on northern Gaza.",
      flyTo: { center: [34.4, 31.6] as [number,number], zoom: 8 } },
    { time: "55m", danger: 4, confidence: 94, sources: ["AP", "Al Jazeera"], pulse: true,
      text: "Northern Gaza hospitals running on emergency reserves — collapse imminent",
      description: "Al-Ahli Arab Hospital and Kamal Adwan Hospital in northern Gaza have issued emergency declarations after fuel stocks dropped below 24-hour reserves. UNRWA reports 14 aid trucks held at the Kerem Shalom crossing for 11 days.",
      flyTo: { center: [34.4, 31.6] as [number,number], zoom: 8 } },
  ],
  "russia-ukraine": [
    { time: "28m", danger: 4, confidence: 89, sources: ["NYT", "Reuters"], pulse: true,
      text: "Ukraine reports overnight drone barrage — Kyiv air defenses activated",
      description: "Russia launched 78 Shahed-136 drones in an overnight wave targeting Kyiv, Odessa, and Kharkiv. Ukrainian air defense intercepted 61 drones. Three civilians were killed and 14 injured.",
      flyTo: { center: [30.5, 50.4] as [number,number], zoom: 6 } },
  ],
  "sudan": [
    { time: "Apr 10", danger: 5, confidence: 91, sources: ["UN", "Sudan Tribune"], pulse: true,
      text: "SAF drone strike kills 40+ at wedding celebration in North Darfur — RSF-held town targeted",
      description: "Sudan's armed forces killed at least forty and burned dozens more homes in a drone strike on a wedding celebration in an RSF-held town in North Darfur state. A recent survey describes widespread hunger, separation, and social disruption as families reckon with a lack of access to basic services amid the continued risk of violence.",
      flyTo: { center: [25.1, 15.6] as [number,number], zoom: 6 } },
    { time: "41m", danger: 5, confidence: 82, sources: ["Al Jazeera", "ACLED"], pulse: true,
      text: "RSF forces reported inside Omdurman residential districts — civilian evacuation underway",
      description: "Rapid Support Forces fighters have pushed into at least four residential neighborhoods in Omdurman, Khartoum's twin city. OCHA reports 80,000 civilians displaced in the past 72 hours. Aid convoys are unable to enter due to active fighting on the Omdurman bridge.",
      flyTo: { center: [32.5, 15.6] as [number,number], zoom: 6 } },
  ],
  "taiwan-strait": [
    { time: "1h 10m", danger: 2, confidence: 79, sources: ["ACLED", "GDELT"],
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
}

export interface StrikeEvent {
  strikes: StrikeMarker[];
  center: [number, number];
  zoom: number;
}

interface TimelineEvent {
  date: string;
  text: string;
  highlight?: boolean;
  strikeEvent?: StrikeEvent;
  mapView?: { center: [number, number]; zoom: number };
  videoUrl?: string;
  videoTitle?: string;
  videoInfo?: string; // rich text below the video embed
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

const CONFLICTS: Record<string, Conflict> = {
  "israel-iran": {
    id: "israel-iran",
    title: "Israel–US–Iran war",
    date: "March 2026 – Present",
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
      { country: "Sri Lanka", injured: "", killed: "87", civilianPct: 100, civSources: [
        { label: "Reuters — Iranian warship incident", url: "https://www.reuters.com/world/asia-pacific/sri-lanka/" },
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
        date: "March 2026 — Present",
        text: "The war becomes the largest Middle East military engagement since 2003. Iran, now led by Mojtaba Khamenei, continues to resist. Iran establishes a toll system on the Strait of Hormuz — $2–4M per tanker in Chinese yuan or stablecoin. Oil tops $110/barrel. Hezbollah re-enters the conflict. The 82nd Airborne is put on alert. Peace talks underway in Islamabad. No ceasefire reached.",
        mapView: { center: [47.0, 30.5], zoom: 3.8 },
      },
      {
        date: "February 28, 2026 — Operation Epic Fury",
        text: "Trump gives the order at 20:38 UTC. In the first 12 hours, US and Israeli forces launch nearly 900 strikes. Israeli decapitation strikes kill Supreme Leader Ali Khamenei and senior officials. The US uses B-2s, B-1s, B-52s, Tomahawk missiles, and HIMARS. Iran retaliates with hundreds of drones and ballistic missiles at Israel and US Gulf bases. Iran moves to close the Strait of Hormuz.",
        highlight: true,
        strikeEvent: {
          center: [47.0, 30.5], zoom: 3.8,
          strikes: [
            // US/Israel → Iran nuclear & military sites
            { lng: 51.73, lat: 33.72, side: "amber", label: "Natanz Nuclear" },
            { lng: 51.12, lat: 34.88, side: "amber", label: "Fordow (FFEP)" },
            { lng: 49.23, lat: 34.47, side: "amber", label: "Arak (IR-40)" },
            { lng: 51.78, lat: 35.49, side: "amber", label: "Parchin Military" },
            { lng: 51.40, lat: 35.69, side: "amber", label: "IRGC Tehran HQ" },
            { lng: 50.33, lat: 29.25, side: "amber", label: "Kharg Island" },
            // Iran → US Gulf bases + Israel
            { lng: 51.31, lat: 25.12, side: "crimson", label: "Al Udeid AB (Qatar)" },
            { lng: 54.55, lat: 24.25, side: "crimson", label: "Al Dhafra AB (UAE)" },
            { lng: 47.52, lat: 29.45, side: "crimson", label: "Ali Al Salem AB (Kuwait)" },
            { lng: 34.78, lat: 32.09, side: "crimson", label: "Tel Aviv" },
          ],
        },
      },
      {
        date: "February 26, 2026",
        text: "Third round of talks in Geneva. Sides remain far apart. All US ships leave port in Bahrain. Fleet headquarters reduced to fewer than 100 personnel — the same measures taken before the 2025 strikes. Fourteen refueling tankers arrive at Ben Gurion Airport.",
      },
      {
        date: "February 25, 2026",
        text: "Iran's Foreign Minister Araghchi states a \"historic\" deal is \"within reach.\"",
      },
      {
        date: "February 24, 2026",
        text: "At the State of the Union, Trump accuses Iran of reviving nuclear weapons efforts. US intelligence indicates Iran's long-range missile capabilities wouldn't be viable until 2035. Netanyahu calls Trump with intelligence on an upcoming Khamenei meeting.",
      },
      {
        date: "February 20, 2026",
        text: "Trump issues a 10-day deadline: \"You are going to be finding out over the next, probably, 10 days.\"",
      },
      {
        date: "February 19, 2026",
        text: "Reports emerge that US strikes could come within days. The buildup is described as the largest since 2003.",
      },
      {
        date: "February 17, 2026",
        text: "Second round of talks in Geneva. Khamenei publicly threatens US warships, saying Iran is \"capable of sinking\" them. The Strait of Hormuz is closed for hours during a live fire drill.",
      },
      {
        date: "February 15–20, 2026",
        text: "Iran increases oil exports to three times the normal rate and reduces storage — later interpreted as stockpiling revenue before anticipated conflict.",
      },
      {
        date: "February 13, 2026",
        text: "Trump orders a second carrier strike group, led by the USS Gerald R. Ford, to the Middle East.",
      },
      {
        date: "February 6, 2026",
        text: "First round of indirect US–Iran nuclear talks in Muscat, Oman, mediated by Oman's foreign minister. US delegation includes Steve Witkoff, Jared Kushner, and CENTCOM commander Admiral Brad Cooper. Described as a \"good start\" but sides do not meet face-to-face.",
      },
      {
        date: "February 3, 2026",
        text: "Six IRGC gunboats attempt to seize a US tanker in the Strait of Hormuz. The tanker continues under escort of the USS McFaul. A US F-35 shoots down an Iranian drone approaching the USS Abraham Lincoln.",
      },
      {
        date: "January 23, 2026",
        text: "Trump announces a \"massive armada\" heading to the Middle East, including the USS Abraham Lincoln. Becomes the largest US military presence in the region since 2003.",
      },
      {
        date: "January 13, 2026",
        text: "Trump tells Iranian protesters to \"keep protesting\" and that \"help is on its way.\" He warns those responsible for killings will \"pay a very big price\" and cancels all meetings with Iranian officials.",
      },
      {
        date: "January 8, 2026",
        text: "Iranian security forces unleash a mass crackdown, cutting all internet access. Death toll estimates range from the government's figure of 3,117 to approximately 30,000 according to Iranian health officials. HRANA documents at least 7,007 deaths.",
      },
      {
        date: "January 5, 2026",
        text: "Israel's Security Cabinet authorizes additional strikes on Iran following Netanyahu–Trump discussions.",
      },
      {
        date: "December 28, 2025",
        text: "Nationwide anti-government protests erupt across all 31 Iranian provinces, driven by currency collapse and rising prices. They become the largest demonstrations since the 1979 revolution, with an estimated 5 million Iranians protesting.",
      },
      {
        date: "December 2025",
        text: "Iran's military admits claims of shooting down two Israeli F-35s during the Twelve-Day War were false. The World Bank projects Iran's economy will shrink in both 2025 and 2026 with inflation heading toward 60%. The rial hits a record low.",
      },
      {
        date: "October 2025",
        text: "Trump says the US is ready to make a deal. Iran says it would consider any \"fair and balanced\" proposal. No concrete framework materializes.",
      },
      {
        date: "September 2025",
        text: "The UK, France, and Germany trigger the reimposition of UN sanctions. Iran's economy deteriorates sharply. The rial continues to collapse.",
      },
      {
        date: "June 13–24, 2025 — The Twelve-Day War",
        text: "Israel launches surprise airstrikes on Iran's nuclear and military infrastructure, killing senior commanders and nuclear scientists. The US joins on June 22, striking three nuclear sites. Iran retaliates with over 550 ballistic missiles and 1,000+ drones. Over 600 killed in Iran, 29 in Israel. A US-brokered ceasefire takes hold June 24.",
        highlight: true,
        strikeEvent: {
          center: [43.0, 33.0], zoom: 3.8,
          strikes: [
            { lng: 51.73, lat: 33.72, side: "amber", label: "Natanz" },
            { lng: 51.12, lat: 34.88, side: "amber", label: "Fordow" },
            { lng: 51.67, lat: 32.62, side: "amber", label: "Isfahan IRGC" },
            { lng: 51.40, lat: 35.69, side: "amber", label: "Tehran IRGC HQ" },
            // Iran retaliates → Israel
            { lng: 34.78, lat: 32.09, side: "crimson", label: "Tel Aviv" },
            { lng: 34.99, lat: 32.82, side: "crimson", label: "Haifa" },
            { lng: 34.79, lat: 31.25, side: "crimson", label: "Beer Sheva" },
            { lng: 35.21, lat: 31.77, side: "crimson", label: "Jerusalem" },
          ],
        },
      },
      {
        date: "February 4, 2025",
        text: "Trump signs a presidential memorandum restoring maximum pressure sanctions and directing efforts to drive Iranian oil exports to zero.",
        mapView: { center: [-77.04, 38.90], zoom: 10 },
      },
      {
        date: "December 2024",
        text: "Syrian President Bashar al-Assad flees the country, collapsing a major pillar of Iran's Axis of Resistance. The IAEA reports Iran has enough highly enriched uranium for an estimated nine nuclear warheads.",
        mapView: { center: [38.0, 34.8], zoom: 5.5 },
      },
      {
        date: "October 26, 2024 — Operation Days of Repentance",
        text: "Israel launches its largest-ever strike on Iran. Over 100 aircraft including F-35s strike 20 locations. The strikes destroy nearly all of Iran's Russian-supplied S-300 air defense systems, removing a key layer of protection for future strikes.",
        highlight: true,
        strikeEvent: {
          center: [49.5, 34.5], zoom: 4.2,
          strikes: [
            { lng: 51.67, lat: 32.62, side: "amber", label: "Isfahan S-300 Site" },
            { lng: 46.29, lat: 38.08, side: "amber", label: "Tabriz Radar" },
            { lng: 48.73, lat: 31.32, side: "amber", label: "Khuzestan Air Defense" },
            { lng: 51.30, lat: 35.71, side: "amber", label: "Tehran Air Defense" },
            { lng: 51.73, lat: 33.72, side: "amber", label: "Natanz Perimeter" },
          ],
        },
      },
      {
        date: "October 1, 2024",
        text: "Iran fires approximately 200 ballistic missiles at Israel, hitting military bases (Operation True Promise II). The largest attack on Iran since the Iran–Iraq War.",
        strikeEvent: {
          center: [36.5, 31.5], zoom: 5.0,
          strikes: [
            { lng: 35.01, lat: 30.94, side: "crimson", label: "Nevatim Air Base" },
            { lng: 34.82, lat: 31.84, side: "crimson", label: "Tel Nof Air Base" },
            { lng: 34.66, lat: 30.78, side: "crimson", label: "Ramon Air Base" },
          ],
        },
      },
      {
        date: "September 2024",
        text: "Israel decimates Hezbollah's leadership. Pager and walkie-talkie explosions across Lebanon kill 42 members on September 17–18. On September 27, an airstrike in Beirut kills Hezbollah Secretary-General Hassan Nasrallah and IRGC deputy commander Abbas Nilforoushan.",
        strikeEvent: {
          center: [35.4, 33.6], zoom: 6.5,
          strikes: [
            { lng: 35.50, lat: 33.84, side: "amber", label: "Beirut Dahieh — Nasrallah" },
            { lng: 35.20, lat: 33.27, side: "amber", label: "Tyre" },
            { lng: 35.37, lat: 33.56, side: "amber", label: "Sidon" },
            { lng: 35.57, lat: 33.21, side: "amber", label: "Kiryat Shmona (Hezbollah rockets)" },
          ],
        },
      },
      {
        date: "July 31, 2024",
        text: "Israel assassinates Hamas political leader Ismail Haniyeh in Tehran. Hours earlier, a Beirut airstrike kills senior Hezbollah commander Fuad Shukr.",
        strikeEvent: {
          center: [44.5, 34.5], zoom: 4.5,
          strikes: [
            { lng: 51.41, lat: 35.72, side: "amber", label: "Tehran — Haniyeh" },
            { lng: 35.50, lat: 33.84, side: "amber", label: "Beirut — Fuad Shukr" },
          ],
        },
      },
      {
        date: "April 19, 2024",
        text: "Israel retaliates with a targeted strike on an air defense radar facility near Isfahan, near the Natanz nuclear site. The strike is deliberately limited — a signal of capability.",
        mapView: { center: [51.67, 32.62], zoom: 6.5 },
      },
      {
        date: "April 13, 2024 — Operation True Promise",
        text: "Iran launches its first-ever direct attack on Israel: over 300 drones, cruise missiles, and ballistic missiles. The US, UK, France, and Jordan help intercept what Israel says is 99% of the incoming fire.",
        highlight: true,
        strikeEvent: {
          center: [36.0, 31.8], zoom: 5.2,
          strikes: [
            { lng: 34.78, lat: 32.09, side: "crimson", label: "Tel Aviv" },
            { lng: 35.21, lat: 31.77, side: "crimson", label: "Jerusalem" },
            { lng: 35.15, lat: 30.98, side: "crimson", label: "Dimona (intercepted)" },
            { lng: 34.66, lat: 30.78, side: "crimson", label: "Ramon AFB" },
          ],
        },
      },
      {
        date: "April 1, 2024",
        text: "Israel bombs the Iranian consular annex in Damascus, Syria, killing 16 people including senior IRGC Quds Force commander Brigadier General Mohammad Reza Zahedi.",
        strikeEvent: {
          center: [35.8, 32.8], zoom: 5.8,
          strikes: [
            { lng: 36.28, lat: 33.50, side: "amber", label: "Damascus — Iranian Consulate" },
          ],
        },
      },
      {
        date: "February 14, 2024",
        text: "An Israeli sabotage operation causes multiple explosions on an Iranian natural gas pipeline in western Iran.",
        mapView: { center: [48.5, 33.5], zoom: 5.8 },
      },
      {
        date: "October 7, 2023",
        text: "Hamas attacks southern Israel, killing approximately 1,200 people and taking over 250 hostages. Israel launches a full-scale military campaign in Gaza. The next day, Iran-backed Hezbollah opens a second front from Lebanon, striking northern Israel.",
        strikeEvent: {
          center: [34.8, 31.6], zoom: 7.0,
          strikes: [
            { lng: 34.60, lat: 31.52, side: "crimson", label: "Sderot" },
            { lng: 34.52, lat: 31.40, side: "crimson", label: "Kibbutz Be'eri" },
            { lng: 34.57, lat: 31.37, side: "crimson", label: "Nova Festival (Re'im)" },
            { lng: 34.44, lat: 31.50, side: "amber",   label: "Gaza City (IDF response)" },
          ],
        },
      },
      {
        date: "May 2018",
        text: "Trump unilaterally withdraws the US from the JCPOA and reinstates maximum pressure sanctions. Iran begins stockpiling enriched uranium and restricting IAEA monitoring.",
        mapView: { center: [-77.04, 38.90], zoom: 10 },
        videoUrl: "https://www.youtube.com/embed/05ZwuFZJEOo?start=229",
        videoTitle: "Trump announces withdrawal from Iran Nuclear Deal",
      },
      {
        date: "2015 — JCPOA",
        text: "Six world powers and Iran reach the JCPOA nuclear deal, limiting Iran's uranium enrichment in exchange for lifting sanctions.",
        mapView: { center: [45, 35], zoom: 3.2 },
        videoUrl: "https://www.youtube.com/embed/KqCswpINDTA",
        videoTitle: "Obama announces the Iran Nuclear Deal",
        videoInfo: "Key requirements of the JCPOA:\n• Iran limited to 3.67% uranium enrichment for 15 years\n• Stockpile capped at 300 kg of low-enriched uranium\n• Two-thirds of centrifuges dismantled (from 19,000 to 6,104)\n• Fordow facility converted to research-only — no enrichment\n• Arak heavy-water reactor redesigned to prevent plutonium production\n• IAEA granted unprecedented 24/7 monitoring and inspection access\n• In exchange: US, EU, and UN sanctions on Iran lifted\n• Arms embargo maintained for 5 years, missile restrictions for 8\n\nSignatories: United States, United Kingdom, France, Germany, Russia, China, Iran",
      },
    ],
  },
  "israel-gaza": {
    id: "israel-gaza",
    title: "Gaza genocide",
    date: "October 7, 2023 – Present",
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
      { date: "2024 – Present", text: "Gaza death toll surpasses 34,000. Northern Gaza declared in full famine by UN WFP. ICJ opened genocide proceedings against Israel in January 2024. Hostage negotiations continue." },
      { date: "October 7, 2023 — Hamas Attack", text: "Hamas kills ~1,200 Israelis and takes 253 hostages in a surprise attack from Gaza. Israel launches a full-scale military campaign in response.", highlight: true },
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
  initialAlertText?: string;
}

function parseCasualties(s: string): number {
  return parseInt(s.replace(/[^0-9]/g, ""), 10) || 0;
}

function extractSourceName(label: string): string {
  return label.split(" — ")[0].split(" —")[0].trim();
}

export default function CountryPanel({ countryCode, onClose, onViewFeed, onConflictSelect, onFocusCountry, onFocusPosition, onCountryHome, onAuthorClick, onTimelineStrike, onSourceTap, onCasualtyHighlight, onPlayEvent, initialAlertText }: Props) {
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const [civTooltip, setCivTooltip]       = useState<string | null>(null);
  const [showAllCasualties, setShowAllCasualties] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [activeTile, setActiveTile]     = useState(-1);
  const [autoPlaying, setAutoPlaying]   = useState(false);
  const [hoveredAlert,  setHoveredAlert]  = useState<number | null>(null);
  const [hoverMidY,     setHoverMidY]     = useState(0);
  const [sourcesOpen,   setSourcesOpen]   = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef(false);
  const activeTileRef = useRef(-1);

  const cancelLeave = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); };
  const scheduleLeave = () => { cancelLeave(); leaveTimer.current = setTimeout(() => { setHoveredAlert(null); setSourcesOpen(false); }, 220); };

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
      // Fire map camera for this tile
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
  };

  // ── Enter history mode — zoom out to wide conflict view ────────────────────
  const enterHistory = () => {
    setTimelineExpanded(true);
    setActiveTile(-1);
    activeTileRef.current = -1;
    // Zoom out to show all involved countries (wide Middle East + Iran)
    onFocusPosition?.([47, 30], 2.8);
    // Scroll container to top
    setTimeout(() => scrollRef.current?.scrollTo({ top: 0 }), 50);
  };

  const exitHistory = () => {
    setTimelineExpanded(false);
    setAutoPlaying(false);
    autoPlayRef.current = false;
    setActiveTile(-1);
    activeTileRef.current = -1;
    onTimelineStrike?.(null);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Auto-play: advance tiles at reading pace ──────────────────────────────
  const toggleAutoPlay = () => {
    const next = !autoPlaying;
    setAutoPlaying(next);
    autoPlayRef.current = next;
    if (next && activeTileRef.current < 0) {
      // Start from first tile
      const first = scrollRef.current?.querySelector<HTMLElement>("[data-tile='0']");
      first?.scrollIntoView({ behavior: "smooth" });
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
                    color: c.civilianPct > 60 ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.32)",
                    fontWeight: c.civilianPct > 60 ? 700 : 400,
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
    <div
      className="absolute left-6 z-20 w-[460px]"
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
        <div style={{ flexShrink: 0, padding: "10px 18px 8px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)", letterSpacing: "0.02em", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {conflict.title}
                </h2>
                {countryCode && (() => {
                  const displayName = ISO_TO_NAME[countryCode] ?? countryCode;
                  return (
                    <button
                      onClick={(e) => { e.stopPropagation(); onCountryHome?.(countryCode); }}
                      style={{
                        fontSize: 8, fontFamily: "monospace", letterSpacing: "0.12em",
                        padding: "2px 6px", borderRadius: 4, flexShrink: 0, cursor: "pointer",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        color: "rgba(255,255,255,0.55)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                    >{displayName.toUpperCase()}</button>
                  );
                })()}
              </div>
              <p style={{ margin: "3px 0 0", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.32)", letterSpacing: "0.06em" }}>
                {conflict.date}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase" }}>
                active conflict
              </span>
              <button onClick={() => { onClose(); setSelectedConflictId(null); }}
                style={{ color: "rgba(255,255,255,0.12)", fontSize: 18, background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.12)")}>×</button>
            </div>
          </div>

          {/* Conflict selector */}
          {conflictIds.length > 1 && (
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {conflictIds.map((id) => (
                <button key={id}
                  onClick={(e) => { e.stopPropagation(); setSelectedConflictId(id); onConflictSelect?.(id); }}
                  style={{
                    fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "4px 10px", borderRadius: 8, cursor: "pointer",
                    background: activeId === id ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${activeId === id ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)"}`,
                    color: activeId === id ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.25)",
                    boxShadow: activeId === id ? "inset 0 1px 0 rgba(255,255,255,0.07)" : "none",
                  }}>
                  {CONFLICTS[id]?.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div
          ref={!timelineExpanded ? scrollRef : undefined}
          onScroll={!timelineExpanded ? handleScroll : undefined}
          style={{ flex: 1, overflowY: timelineExpanded ? "hidden" : "auto", minHeight: 0, display: "flex", flexDirection: "column" }}
        >
          {/* Casualties, alerts, feed — hidden in history mode */}
          {!timelineExpanded && (<>
          {/* Casualties */}
          <div style={{ padding: "8px 14px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {(
              /* COUNTRY-BY-COUNTRY VIEW */
              <>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.22)", fontWeight: "normal", paddingBottom: 4, letterSpacing: "0.08em" }}></th>
                      {!hasMissingCol && <th style={{ textAlign: "right", fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.22)", fontWeight: "normal", paddingBottom: 4, letterSpacing: "0.08em", paddingRight: 8 }}>Injured</th>}
                      {hasMissingCol && <th style={{ textAlign: "right", fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.22)", fontWeight: "normal", paddingBottom: 4, letterSpacing: "0.08em", paddingRight: 8 }}>Missing</th>}
                      <th style={{ textAlign: "right", fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.22)", fontWeight: "normal", paddingBottom: 4, letterSpacing: "0.08em", paddingRight: 8 }}>Killed</th>
                      {hasCivCol && !hasMissingCol && <th style={{ textAlign: "right", fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.22)", fontWeight: "normal", paddingBottom: 4, letterSpacing: "0.08em" }}>Civ %</th>}
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
                    style={{ marginTop: 4, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.08em", color: "rgba(255,255,255,0.2)", background: "none", border: "none", cursor: "pointer", padding: "2px 0", display: "block" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}>
                    {showAllCasualties ? "▲ show less" : `▼ +${hiddenCount} more`}
                  </button>
                )}
              </>
            )}
          </div>


          {/* Live alerts */}
          {(() => {
            const conflictAlerts = CONFLICT_ALERTS[conflict.id] ?? [];
            if (conflictAlerts.length === 0) return null;
            return (
              <div style={{ padding: "14px 6px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ margin: "0 0 6px 12px", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", fontWeight: 500 }}>live alerts</p>
                {conflictAlerts.slice(0, 4).map((a, i, arr) => (
                  <LiveAlertRow
                    key={i}
                    item={a}
                    bottomBorder={i < arr.length - 1}
                    showConfidenceInline={false}
                    expandOnHover={true}
                    defaultExpanded={!!initialAlertText && a.text === initialAlertText}
                    isActive={hoveredAlert === i}
                    onHoverChange={(active, anchorY) => {
                      cancelLeave();
                      if (active) { setHoveredAlert(i); setHoverMidY(anchorY); }
                      else scheduleLeave();
                    }}
                  />
                ))}
              </div>
            );
          })()}

          {/* View Feed */}
          <div style={{ padding: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <button
              onClick={(e) => { e.stopPropagation(); onViewFeed(conflict.feedKey); }}
              style={{ width: "100%", padding: "9px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
              View Live Feed →
            </button>
          </div>
          </>)}

          {/* Timeline / History */}
          {(() => {
            const NEUTRAL = { solid: "rgba(255,255,255,0.55)", border: "rgba(255,255,255,0.20)", glow: "none", date: "rgba(255,255,255,0.72)", text: "rgba(255,255,255,0.56)" };
            const HIGHLIGHT = { solid: "rgba(255,255,255,0.85)", border: "rgba(255,255,255,0.3)", glow: "0 0 6px rgba(255,255,255,0.25)", date: "rgba(255,255,255,0.92)", text: "rgba(255,255,255,0.72)" };
            const extractYear = (d: string) => { const m = d.match(/\b(20\d\d|19\d\d)\b/); return m ? parseInt(m[1]) : null; };

            const latest = conflict.timeline[0];

            if (!timelineExpanded) {
              // ── Normal mode: present + "read full story" button ──
              return (
                <div style={{ padding: "0 16px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, marginBottom: 14 }}>
                    <p style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", margin: 0, fontWeight: 500 }}>timeline</p>
                  </div>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 1, background: "rgba(255,255,255,0.05)" }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                      {latest && (
                        <div {...(latest.strikeEvent ? { "data-strike": JSON.stringify(latest.strikeEvent) } : {})}>
                          <div style={{ display: "flex", gap: 12, paddingLeft: 4 }}>
                            <div style={{ flexShrink: 0, marginTop: 4 }}>
                              <div style={{ width: 7, height: 7, borderRadius: "50%", background: HIGHLIGHT.solid, border: `1px solid ${HIGHLIGHT.border}`, boxShadow: HIGHLIGHT.glow }} />
                            </div>
                            <div>
                              <p style={{ margin: "0 0 5px", fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: HIGHLIGHT.date, letterSpacing: "0.03em" }}>
                                {(() => { const d = latest.date; if (/^(19|20)\d\d/.test(d)) return d; return d.replace(/,?\s*(19|20)\d\d/, ""); })()}
                              </p>
                              <p style={{ margin: 0, fontSize: 14, color: HIGHLIGHT.text, lineHeight: 1.65 }}>{latest.text}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {chronological.length > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); enterHistory(); }}
                          style={{ fontSize: 13, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", padding: "0", textAlign: "left" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                        >read full story →</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // ── History mode: snap-scroll tiles ──
            return (
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                {/* Fixed history header */}
                <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                  <p style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", margin: 0, fontWeight: 500 }}>history</p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {/* Auto-play toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleAutoPlay(); }}
                      style={{
                        fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em",
                        color: autoPlaying ? "rgba(239,68,68,0.7)" : "rgba(255,255,255,0.3)",
                        background: autoPlaying ? "rgba(239,68,68,0.08)" : "none",
                        border: `1px solid ${autoPlaying ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 4, cursor: "pointer", padding: "3px 8px", textTransform: "uppercase",
                      }}
                    >{autoPlaying ? "⏸ pause" : "▶ auto"}</button>
                    {/* Progress */}
                    <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.18)" }}>
                      {activeTile >= 0 ? `${activeTile + 1}/${chronological.length}` : ""}
                    </span>
                    {/* Reset */}
                    <button
                      onClick={(e) => { e.stopPropagation(); exitHistory(); }}
                      style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                    >✕ exit</button>
                  </div>
                </div>

                {/* Snap-scroll tile container */}
                <div
                  onScroll={handleHistoryScroll}
                  style={{
                    flex: 1, overflowY: "auto", minHeight: 0,
                    scrollSnapType: "y mandatory",
                  }}
                >
                  {chronological.map((event, i) => {
                    const palette = event.highlight ? HIGHLIGHT : NEUTRAL;
                    const isActive = activeTile === i;
                    const currentYear = extractYear(event.date);
                    const prevEvent = chronological[i - 1];
                    const prevYear = prevEvent ? extractYear(prevEvent.date) : null;
                    const showYearBefore = i === 0 || (prevYear !== null && prevYear !== currentYear);

                    return (
                      <div
                        key={i}
                        data-tile={i}
                        {...(event.strikeEvent ? { "data-strike": JSON.stringify(event.strikeEvent) } : {})}
                        onClick={() => {
                          activeTileRef.current = i;
                          setActiveTile(i);
                          navigateToTile(i);
                        }}
                        style={{
                          scrollSnapAlign: "start",
                          padding: "16px 16px 20px",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          minHeight: 120,
                          cursor: "pointer",
                          opacity: isActive || activeTile < 0 ? 1 : 0.35,
                          transition: "opacity 0.4s ease",
                        }}
                      >
                        {showYearBefore && currentYear && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "rgba(255,255,255,0.22)", letterSpacing: "0.14em" }}>{currentYear}</span>
                            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 12, paddingLeft: 4 }}>
                          <div style={{ flexShrink: 0, marginTop: 4 }}>
                            <div style={{
                              width: 7, height: 7, borderRadius: "50%",
                              background: isActive ? "rgba(239,68,68,0.8)" : palette.solid,
                              border: `1px solid ${isActive ? "rgba(239,68,68,0.4)" : palette.border}`,
                              boxShadow: isActive ? "0 0 8px rgba(239,68,68,0.4)" : palette.glow,
                              transition: "all 0.3s ease",
                            }} />
                          </div>
                          <div>
                            <p style={{ margin: "0 0 5px", fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: palette.date, letterSpacing: "0.03em" }}>
                              {(() => { const d = event.date; if (/^(19|20)\d\d/.test(d)) return d; return d.replace(/,?\s*(19|20)\d\d/, ""); })()}
                            </p>
                            <p style={{ margin: 0, fontSize: 14, color: isActive ? "rgba(255,255,255,0.85)" : palette.text, lineHeight: 1.65, transition: "color 0.3s ease" }}>
                              {event.text}
                            </p>
                            {(() => {
                              const events = getEventsForTimeline(conflict.id, event.date);
                              if (events.length === 0 || !onPlayEvent) return null;
                              return (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onPlayEvent(events[0]); }}
                                  style={{
                                    marginTop: 8, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em",
                                    color: "rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.06)",
                                    border: "1px solid rgba(239,68,68,0.15)", borderRadius: 6,
                                    cursor: "pointer", padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: 6,
                                    textTransform: "uppercase",
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "rgba(239,68,68,0.8)"; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.color = "rgba(239,68,68,0.5)"; }}
                                >
                                  <span style={{ fontSize: 8 }}>▶</span> watch event
                                </button>
                              );
                            })()}
                          </div>
                        </div>
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

    {/* Floating video panel — appears right of conflict panel when active tile has video */}
    {timelineExpanded && activeTile >= 0 && (() => {
      const ev = chronological[activeTile];
      if (!ev?.videoUrl) return null;
      return (
        <div
          className="absolute z-20"
          style={{
            right: 24, top: 72, width: 460, bottom: 24,
            display: "flex", flexDirection: "column",
          }}
        >
          <div style={{
            background: "rgba(4,6,18,0.62)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16,
            boxShadow: "0 24px 80px rgba(0,0,0,0.38), 0 1px 3px rgba(0,0,0,0.18)",
            overflow: "hidden", display: "flex", flexDirection: "column",
            height: "100%",
          }}>
            {/* Video */}
            <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", flexShrink: 0 }}>
              <iframe
                src={ev.videoUrl}
                style={{ width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {/* Title + date */}
            {ev.videoTitle && (
              <div style={{ padding: "12px 18px 10px", flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.88)", lineHeight: 1.4 }}>
                  {ev.videoTitle}
                </p>
                <p style={{ margin: "6px 0 0", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em", color: "rgba(255,255,255,0.25)" }}>
                  {ev.date}
                </p>
              </div>
            )}
            {/* Video info — key requirements, context etc. */}
            {ev.videoInfo && (
              <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "0 18px 18px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ paddingTop: 14 }}>
                  {ev.videoInfo.split("\n").map((line, li) => {
                    if (line.startsWith("•")) {
                      return (
                        <p key={li} style={{ margin: "0 0 6px", fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, paddingLeft: 4 }}>
                          <span style={{ color: "rgba(239,68,68,0.5)", marginRight: 6 }}>•</span>
                          {line.slice(1).trim()}
                        </p>
                      );
                    }
                    if (line.trim() === "") return <div key={li} style={{ height: 10 }} />;
                    return (
                      <p key={li} style={{ margin: "0 0 8px", fontSize: 12, fontWeight: line.startsWith("Key") || line.startsWith("Signatories") ? 600 : 400, color: line.startsWith("Key") || line.startsWith("Signatories") ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    })()}

    {/* Floating confidence + sources — sibling outside backdropFilter stacking context */}
    {activeAlert && (() => {
      const cc = activeAlert.confidence >= 90 ? "#22c55e" : activeAlert.confidence >= 80 ? "#86efac" : activeAlert.confidence >= 70 ? "#fbbf24" : "#f87171";
      return (
        <div
          onMouseEnter={() => { cancelLeave(); setSourcesOpen(true); }}
          onMouseLeave={() => { setSourcesOpen(false); scheduleLeave(); }}
          style={{ position: "fixed", left: 444, top: hoverMidY - 92, paddingLeft: 60, paddingTop: 80, paddingBottom: 80, paddingRight: 60, zIndex: 21, pointerEvents: "auto" }}
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
          </div>
          {sourcesOpen && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
              <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)", marginRight: 2 }}>SOURCES</span>
              {activeAlert.sources.map(s => (
                <button key={s}
                  onClick={e => { e.stopPropagation(); onSourceTap?.(s); }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
                  style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em", padding: "2px 8px", borderRadius: 99, cursor: "pointer", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.65)" }}
                >{s}</button>
              ))}
            </div>
          )}
          </div>
        </div>
      );
    })()}
    </>
  );
}
