"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import CountryPanel from "./components/CountryPanel";
import CountryHome from "./components/CountryHome";
import FeedPanel from "./components/FeedPanel";
import SearchBar from "./components/SearchBar";
import Clock from "./components/Clock";
import TimeScrubber from "./components/TimeScrubber";
import AtlasHQ from "./components/AtlasHQ";
import HeadlinesPanel from "./components/HeadlinesPanel";
import SourceInfoPanel from "./components/SourceInfoPanel";
import AuthorBioPanel from "./components/AuthorBioPanel";

function LiveCount() {
  const dotRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let t = 0;
    const id = setInterval(() => {
      t += 0.05;
      const opacity = 0.55 + 0.45 * Math.abs(Math.sin(t));
      if (dotRef.current) dotRef.current.style.opacity = String(opacity);
    }, 40);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span ref={dotRef} style={{
        display: "inline-block", width: 6, height: 6, borderRadius: "50%",
        background: "#22c55e", boxShadow: "0 0 6px #22c55e",
        transition: "opacity 0.1s",
      }} />
      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.12em" }}>
        2 LIVE
      </span>
    </div>
  );
}

const Map = dynamic(() => import("./components/Map"), { ssr: false });

// Map view per conflict (overrides per-country default)
const CONFLICT_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  "israel-iran":  { center: [44.0, 31.5], zoom: 4.0 },   // wide: Israel ↔ Iran
  "israel-gaza":  { center: [34.5, 31.6], zoom: 7.8 },   // tight: Gaza strip + Israel south
  "russia-ukraine": { center: [33.0, 49.0], zoom: 4.0 },
  "taiwan-strait":  { center: [120.5, 24.5], zoom: 5.5 },
};

// All countries in each conflict (used to compute secondaries)
const CONFLICT_ALL_COUNTRIES: Record<string, string[]> = {
  "israel-iran":    ["ISR", "IRN", "LBN", "USA"],
  "israel-gaza":    ["ISR", "PSE"],
  "russia-ukraine": ["UKR", "RUS"],
  "taiwan-strait":  ["CHN", "TWN"],
};

const COUNTRY_NAMES: Record<string, string> = {
  IRN: "Iran", ISR: "Israel", LBN: "Lebanon",
  SYR: "Syria", IRQ: "Iraq", YEM: "Yemen",
  UKR: "Ukraine", RUS: "Russia", SDN: "Sudan",
  MMR: "Myanmar", COD: "DR Congo", HTI: "Haiti",
  MEX: "Mexico", CHN: "China", TWN: "Taiwan",
};

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [homeCountry, setHomeCountry]         = useState<string | null>(null);
  const [feedCountry, setFeedCountry]         = useState<string | null>(null);
  const [flyToCode, setFlyToCode]             = useState<string | null>(null);
  const [flyToPosition, setFlyToPosition]     = useState<{ center: [number, number]; zoom: number; key?: string } | null>(null);
  const [secondaryCountries, setSecondaryCountries] = useState<string[]>([]);
  const [showAuthorBio, setShowAuthorBio] = useState(false);
  const [activeStrikes, setActiveStrikes] = useState<{ strikes: { lng: number; lat: number; side: "amber"|"crimson"; label?: string }[]; center: [number,number]; zoom: number } | null>(null);
  const [historicalYear, setHistoricalYear]   = useState<number | null>(null);
  const [previewYear, setPreviewYear]         = useState<number | null>(null);
  const [timelineOpen, setTimelineOpen]       = useState(false);
  const [showHeadlines, setShowHeadlines]     = useState(false);
  const [showRadar, setShowRadar]             = useState(true);
  const [activeSource, setActiveSource]       = useState<string | null>(null);
  const [radarAlertText, setRadarAlertText]   = useState<string | null>(null);

  const handleCountryHome = (iso: string) => {
    setHomeCountry(iso);
    setSelectedCountry(null);
    setSecondaryCountries([]);
    setActiveStrikes(null);
    setShowAuthorBio(false);
    setShowRadar(false);
    setFlyToCode(iso);
    setTimeout(() => setFlyToCode(null), 100);
  };

  const handleCountryClick = (code: string) => {
    if (!code) {
      setSelectedCountry(null);
      setFeedCountry(null);
      setHomeCountry(null);
      setSecondaryCountries([]);
      return;
    }
    setFeedCountry(null);
    setShowRadar(false);
    // USA → CountryHome (same as all other countries with a home page)
    if (code === "USA") {
      setHomeCountry("USA");
      setSelectedCountry(null);
      setSecondaryCountries([]);
      return;
    }
    setHomeCountry(null);
    setSelectedCountry(code);
    // Set initial secondaries based on first conflict for this country
    const firstConflict = getFirstConflict(code);

    if (firstConflict) applyConflict(firstConflict, code);
    else setSecondaryCountries([]);
  };

  const handleSearch = (code: string) => {
    setFeedCountry(null);
    setHomeCountry(null);
    setShowRadar(false);
    setSelectedCountry(code);
    setFlyToCode(code);
    setTimeout(() => setFlyToCode(null), 100);
    const firstConflict = getFirstConflict(code);

    if (firstConflict) applyConflict(firstConflict, code);
    else setSecondaryCountries([]);
  };

  const getFirstConflict = (code: string): string | null => {
    const COUNTRY_FIRST: Record<string, string> = {
      ISR: "israel-iran", IRN: "israel-iran", LBN: "israel-iran", USA: "israel-iran",
      PSE: "israel-gaza",
      UKR: "russia-ukraine", RUS: "russia-ukraine",
      CHN: "taiwan-strait", TWN: "taiwan-strait",
    };
    return COUNTRY_FIRST[code] ?? null;
  };

  const applyConflict = (conflictId: string, forCountry: string) => {
    // fly to conflict-specific view
    const pos = CONFLICT_CENTERS[conflictId];
    if (pos) {
      setFlyToPosition({ ...pos, key: conflictId + forCountry + Date.now() });
    }
    // secondary borders
    const all = CONFLICT_ALL_COUNTRIES[conflictId] ?? [];
    setSecondaryCountries(all.filter(c => c !== forCountry));
  };

  const handleConflictSelect = (conflictId: string) => {
    if (!selectedCountry) return;
    applyConflict(conflictId, selectedCountry);
  };

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden">
      <Map
        onCountryClick={handleCountryClick}
        flyToCode={flyToCode}
        flyToPosition={flyToPosition}
        selectedCountry={selectedCountry ?? homeCountry}
        secondaryCountries={secondaryCountries}
        activeStrikes={activeStrikes}
        historicalYear={historicalYear}
      />

      {/* Country homepage — loads when pill is tapped from conflict panel */}
      {!historicalYear && homeCountry && (
        <CountryHome
          key={homeCountry}
          countryCode={homeCountry}
          onClose={() => setHomeCountry(null)}
          onSourceTap={(s) => setActiveSource(s)}
        />
      )}

      {/* Country overview panel — USA is a special home screen, handled separately */}
      {!historicalYear && !homeCountry && selectedCountry && selectedCountry !== "USA" && (
        <CountryPanel
          key={selectedCountry}
          countryCode={selectedCountry}
          onClose={() => { setSelectedCountry(null); setSecondaryCountries([]); setActiveStrikes(null); setRadarAlertText(null); setFeedCountry(null); }}
          onViewFeed={(code) => { setFeedCountry(code); }}
          onConflictSelect={handleConflictSelect}
          onFocusCountry={(iso) => {
            setFlyToCode(iso);
            setTimeout(() => setFlyToCode(null), 100);
          }}
          onFocusPosition={(center, zoom) => {
            setFlyToPosition({ center, zoom, key: String(Date.now()) });
          }}
          onCountryHome={handleCountryHome}
          onAuthorClick={() => setShowAuthorBio(v => !v)}
          onTimelineStrike={setActiveStrikes}
          onSourceTap={(s) => setActiveSource(s)}
          initialAlertText={radarAlertText ?? undefined}
        />
      )}

      {/* Radar — only visible when explicitly opened via ATLAS button */}
      {!historicalYear && showRadar && !selectedCountry && !homeCountry && !feedCountry && (
        <AtlasHQ
          onClose={() => { setShowRadar(false); setShowHeadlines(false); }}
          onNavigate={(code, center, zoom, feedItem) => {
            setFlyToPosition({ center, zoom, key: String(Date.now()) });
            if (code) {
              setShowRadar(false);
              setHomeCountry(null);
              setSelectedCountry(code);
              setRadarAlertText(feedItem?.text ?? null);
            }
          }}
          onHeadlinesToggle={() => setShowHeadlines(v => !v)}
          onSourceClick={(s) => setActiveSource(s)}
        />
      )}
      {/* Headlines panel — independent of radar, can show alongside country panels */}
      {!historicalYear && showHeadlines && (
        <HeadlinesPanel onClose={() => setShowHeadlines(false)} />
      )}

      {/* Source info panel — opens when a source pill is tapped */}
      {activeSource && (
        <SourceInfoPanel source={activeSource} onClose={() => setActiveSource(null)} />
      )}

      {/* Author bio panel — to the right of CountryPanel */}
      {!historicalYear && showAuthorBio && (
        <AuthorBioPanel onClose={() => setShowAuthorBio(false)} />
      )}

      {/* Live feed panel */}
      {!historicalYear && (
        <FeedPanel
          countryCode={feedCountry}
          countryName={COUNTRY_NAMES[feedCountry ?? ""] ?? ""}
          onClose={() => setFeedCountry(null)}
          onSourceTap={(s) => setActiveSource(s)}
        />
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => {
              setFeedCountry(null);
              setSelectedCountry(null);
              setHomeCountry(null);
              setSecondaryCountries([]);
              setActiveStrikes(null);
              setShowHeadlines(false);
              setShowRadar(true);
              setFlyToCode("USA");
              setTimeout(() => setFlyToCode(null), 100);
            }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <span className="text-white/80 font-light tracking-[0.3em] text-sm hover:text-white/100 transition-colors">ATLAS</span>
          </button>
          <LiveCount />
        </div>
        <div className="pointer-events-auto">
          <SearchBar onSelect={handleSearch} />
        </div>
      </div>

      {/* Date / time */}
      <Clock
        onYearClick={() => setTimelineOpen(v => !v)}
        displayYear={previewYear ?? historicalYear ?? undefined}
      />

      {/* Historical time scrubber */}
      <TimeScrubber
        expanded={timelineOpen}
        onClose={() => setTimelineOpen(false)}
        onYearChange={(year) => setHistoricalYear(year)}
        onPreviewYear={(year) => setPreviewYear(year)}
        currentYear={historicalYear ?? undefined}
      />
    </main>
  );
}
