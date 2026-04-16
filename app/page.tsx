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
import SettingsPanel from "./components/SettingsPanel";
import MapEventPlayer from "./components/MapEventPlayer";
import ReelsPlayer from "./components/ReelsPlayer";
import type { MapEvent } from "./lib/mapEvents";

// ATLAS appears instantly; clock fades in shortly after as one unit
function AtlasWordmark() {
  return (
    <span className="font-light tracking-[0.3em] text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>ATLAS</span>
  );
}

function NavTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-US", { hour12: true, hour: "numeric", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>{t}</span>
  );
}

const Map = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => <div style={{ width: "100%", height: "100%", background: "#000" }} />,
});

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
  const [casualtyCountries, setCasualtyCountries] = useState<string[]>([]);
  const [focusCountries, setFocusCountries] = useState<string[]>([]);
  const [showAuthorBio, setShowAuthorBio] = useState(false);
  const [activeStrikes, setActiveStrikes] = useState<{ strikes: { lng: number; lat: number; side: "amber"|"crimson"; label?: string }[]; center: [number,number]; zoom: number } | null>(null);
  const [historicalYear, setHistoricalYear]   = useState<number | null>(null);
  const [previewYear, setPreviewYear]         = useState<number | null>(null);
  const [timelineOpen, setTimelineOpen]       = useState(false);
  const [showHeadlines, setShowHeadlines]     = useState(false);
  const [showRadar, setShowRadar]             = useState(true);
  const [mapReady, setMapReady]                = useState(false);
  const [showSettings, setShowSettings]       = useState(false);
  const [activeSource, setActiveSource]       = useState<string | null>(null);
  const [radarAlertText, setRadarAlertText]   = useState<string | null>(null);
  const [activeMapEvent, setActiveMapEvent]   = useState<MapEvent | null>(null);
  const [showReels, setShowReels]             = useState(false);
  const [initialReelId, setInitialReelId]     = useState<string | null>(null);
  const [historyDate, setHistoryDate]         = useState<string | null>(null);
  const [liveReset, setLiveReset]             = useState(0);

  // Deep link: /?reel=<id> → open the full Atlas You scroll page and jump
  // directly to that video so shared links land on the video, not the HQ.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const reelId = params.get("reel");
    if (reelId) {
      setInitialReelId(reelId);
      setShowReels(true);
    }
  }, []);

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
      setFocusCountries([]);
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
    // secondary borders + focus mode — only involved countries active
    const all = CONFLICT_ALL_COUNTRIES[conflictId] ?? [];
    setSecondaryCountries(all.filter(c => c !== forCountry));
    setFocusCountries(all);
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
        casualtyCountries={casualtyCountries}
        focusCountries={focusCountries}
        activeStrikes={activeStrikes}
        homeView={showRadar && !selectedCountry && !homeCountry && !feedCountry}
        onReady={() => setMapReady(true)}
      />

      {/* Map event playback — scripted flyTo + popup + narration sequences */}
      <MapEventPlayer
        event={activeMapEvent}
        onFlyTo={(center, zoom, duration) => {
          setFlyToPosition({ center, zoom, key: `evt-${Date.now()}` });
        }}
        onHighlight={setCasualtyCountries}
        onStrikes={(strikes, center, zoom) => {
          if (strikes.length > 0) {
            setActiveStrikes({ strikes, center, zoom });
          } else {
            setActiveStrikes(null);
          }
        }}
        onDone={() => setActiveMapEvent(null)}
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
          onClose={() => { setSelectedCountry(null); setSecondaryCountries([]); setCasualtyCountries([]); setFocusCountries([]); setActiveStrikes(null); setRadarAlertText(null); setFeedCountry(null); setHistoryDate(null); }}
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
          onCasualtyHighlight={setCasualtyCountries}
          onPlayEvent={(evt) => { setActiveMapEvent(evt); }}
          onHistoryDate={setHistoryDate}
          initialAlertText={radarAlertText ?? undefined}
        />
      )}

      {/* Settings panel — opens on second ATLAS tap */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      {/* Reels player — replaces AtlasHQ in the same slot */}
      {mapReady && !historicalYear && showReels && !selectedCountry && !homeCountry && !feedCountry && (
        <ReelsPlayer onClose={() => setShowReels(false)} initialReelId={initialReelId} />
      )}

      {/* Radar — only visible when explicitly opened via ATLAS button */}
      {mapReady && !historicalYear && showRadar && !showReels && !selectedCountry && !homeCountry && !feedCountry && (
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
          onReelsTap={() => setShowReels(true)}
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
              if (showRadar) {
                // Second tap → close radar, open settings
                setShowRadar(false);
                setShowSettings(true);
                return;
              }
              // First tap → full reset + open radar + globe camera
              setFeedCountry(null);
              setSelectedCountry(null);
              setHomeCountry(null);
              setSecondaryCountries([]);
              setActiveStrikes(null);
              setShowHeadlines(false);
              setShowAuthorBio(false);
              setActiveSource(null);
              setShowSettings(false);
              setHistoricalYear(null);
              setPreviewYear(null);
              setTimelineOpen(false);
              setHistoryDate(null);
              setShowReels(false);
              setLiveReset(v => v + 1);
              setShowRadar(true);
              setFlyToPosition({ center: [-98.5, 39.5], zoom: 1.8, key: "atlas-globe-" + Date.now() });
            }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <AtlasWordmark key={liveReset} />
          </button>
          <NavTime />
        </div>
        <div
          className="pointer-events-auto"
          style={{ opacity: mapReady ? 1 : 0 }}
        >
          <SearchBar onSelect={handleSearch} />
        </div>
      </div>

      {/* Date / time + live button */}
      {/* "live" is green only when the map is truly showing today — not when
          the scrubber is in a past year and not when the timeline is pinned
          to a non-2026 history date. */}
      {(() => {
        const isHistoryDate = !!historyDate && !/2026/.test(historyDate);
        const isLive = mapReady && !historicalYear && !isHistoryDate;
        return (
      <div style={{ position: "absolute", bottom: 16, right: 28, zIndex: 10, display: "flex", alignItems: "flex-end", gap: 20, pointerEvents: "none" }}>
        <button
          onClick={() => { setHistoricalYear(null); setPreviewYear(null); setLiveReset(v => v + 1); if (!timelineOpen) setTimelineOpen(false); }}
          style={{
            pointerEvents: "auto",
            fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
            padding: "2px 8px", borderRadius: 10, cursor: "pointer",
            background: isLive ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${isLive ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.14)"}`,
            color:      isLive ? "#22c55e" : "rgba(255,255,255,0.35)",
            marginBottom: 7,
          }}
        >live</button>
        <Clock
          onYearClick={() => setTimelineOpen(v => !v)}
          displayYear={previewYear ?? historicalYear ?? undefined}
          historyDate={historyDate}
        />
      </div>
        );
      })()}

      {/* Historical time scrubber */}
      <TimeScrubber
        expanded={timelineOpen}
        onClose={() => setTimelineOpen(false)}
        onYearChange={(year) => setHistoricalYear(year)}
        onPreviewYear={(year) => setPreviewYear(year)}
        currentYear={historicalYear ?? undefined}
        resetSignal={liveReset}
      />
    </main>
  );
}
