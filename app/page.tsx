"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import CountryPanel from "./components/CountryPanel";
import CountryHome from "./components/CountryHome";
import FeedPanel from "./components/FeedPanel";
import SearchBar from "./components/SearchBar";
import Clock from "./components/Clock";
import TimeScrubber from "./components/TimeScrubber";
import AtlasHQ from "./components/AtlasHQ";
import DisasterPanel from "./components/DisasterPanel";
import FinancePanel      from "./components/FinancePanel";
import GunViolencePanel  from "./components/GunViolencePanel";
import HeadlinesPanel from "./components/HeadlinesPanel";
import SourceInfoPanel from "./components/SourceInfoPanel";
import AuthorBioPanel from "./components/AuthorBioPanel";
import SettingsPanel from "./components/SettingsPanel";
import SettingsSubPanel from "./components/SettingsSubPanel";
import YouPanel from "./components/YouPanel";
import UsPanel from "./components/UsPanel";
import MethodologyPanel from "./components/MethodologyPanel";
import MapEventPlayer from "./components/MapEventPlayer";
import type { MapEvent } from "./lib/mapEvents";
import { pickRandomNatureSite, NATURE_FLY_ZOOM, NATURE_CATEGORY_ZOOM, type NatureCategory } from "./lib/natureSites";
import { EditModeCtx, EditModeSetCtx } from "./components/InlineEdit";

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
    <span style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", position: "relative", top: 2 }}>{t}</span>
  );
}

const Map = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => <div style={{ width: "100%", height: "100%", background: "#000" }} />,
});

// Map view per conflict (overrides per-country default)
const CONFLICT_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  "israel-iran":     { center: [43.0, 35.0], zoom: 4.0 },   // wide: Israel ↔ Iran
  "israel-gaza":     { center: [34.2, 31.6], zoom: 7.8 },   // tight: Gaza strip + Israel south
  "russia-ukraine":  { center: [31.0, 49.0], zoom: 4.0 },
  "taiwan-strait":   { center: [119.5, 24.5], zoom: 5.5 },
  "sudan":           { center: [31.5, 15.6], zoom: 5.5 },
  "myanmar":         { center: [95.1, 19.7], zoom: 5.0 },
};

// All countries in each conflict (used to compute secondaries)
const CONFLICT_ALL_COUNTRIES: Record<string, string[]> = {
  "israel-iran":    ["ISR", "IRN", "LBN", "USA"],
  "israel-gaza":    ["ISR", "PSE"],
  "russia-ukraine": ["UKR", "RUS"],
  "taiwan-strait":  ["CHN", "TWN"],
  "sudan":          ["SDN"],
  "myanmar":        ["MMR"],
};

// URL slug ↔ conflict ID. Each active conflict gets its own path so
// atlas.boston/israel-us-iran-war deep-links straight into that widget.
// The app/[conflict]/page.tsx dynamic route picks up these slugs.
const CONFLICT_SLUGS: Record<string, string> = {
  "israel-iran":    "israel-and-us-in-the-middle-east",
  "israel-gaza":    "israel-palestine-conflict",
  "russia-ukraine": "russia-ukraine-war",
  "taiwan-strait":  "taiwan-strait",
  "sudan":          "sudan-civil-war",
  "myanmar":        "myanmar-civil-war",
};
const SLUG_TO_CONFLICT: Record<string, string> = Object.fromEntries(
  Object.entries(CONFLICT_SLUGS).map(([k, v]) => [v, k])
);

// Disaster slugs — no country panel, just flyTo + URL.
const DISASTER_SLUGS: Record<string, { center: [number, number]; zoom: number }> = {
  "kenya-floods": { center: [36.9, 0.0] as [number, number], zoom: 5.5 },
};

// Default country to pre-select when deep-linking to a conflict slug.
const CONFLICT_DEFAULT_COUNTRY: Record<string, string> = {
  "israel-iran":    "ISR",
  "israel-gaza":    "ISR",
  "russia-ukraine": "UKR",
  "taiwan-strait":  "TWN",
  "sudan":          "SDN",
  "myanmar":        "MMR",
};

const COUNTRY_NAMES: Record<string, string> = {
  IRN: "Iran", ISR: "Israel", LBN: "Lebanon",
  SYR: "Syria", IRQ: "Iraq", YEM: "Yemen",
  UKR: "Ukraine", RUS: "Russia", SDN: "Sudan",
  MMR: "Myanmar", COD: "DR Congo", HTI: "Haiti",
  MEX: "Mexico", CHN: "China", TWN: "Taiwan",
};

export default function Home() {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
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
  const [activeSubPanel, setActiveSubPanel]   = useState<"you" | "us" | "methodology" | "settings" | null>(null);
  const [spinEnabled,    setSpinEnabled]      = useState(true);
  const [activeSource, setActiveSource]       = useState<string | null>(null);
  const [radarAlertText, setRadarAlertText]   = useState<string | null>(null);
  const [activeMapEvent, setActiveMapEvent]   = useState<MapEvent | null>(null);
  const [historyDate, setHistoryDate]         = useState<string | null>(null);
  const [liveReset, setLiveReset]             = useState(0);
  const [currentConflictSlug, setCurrentConflictSlug] = useState<string | null>(null);
  const [openWithHistory, setOpenWithHistory] = useState(false);
  const [activeDisaster,     setActiveDisaster]     = useState<string | null>(null);
  const [activeFinance,      setActiveFinance]      = useState<string | null>(null);
  const [activeGunViolence,  setActiveGunViolence]  = useState<string | null>(null); // incident id
  // Track placed nature site names so we don't repeat within a session.
  const [placedNatureNames, setPlacedNatureNames] = useState<string[]>([]);
  // Increment to resume globe spin after a permanent stop (ATLAS tap).
  const [spinKey, setSpinKey] = useState(0);

  // Deep link: /?reel=<id> → redirect to the dedicated /you page so shared
  // links land on the full reels experience, not the HQ widget.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const reelId = params.get("reel");
    if (reelId) router.replace(`/you?reel=${encodeURIComponent(reelId)}`);
  }, [router]);

  // Deep link: /<slug> → pre-select conflict or fly to disaster on first mount.
  const initialPathRef = useRef<string | null>(null);
  const deepLinkAppliedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (initialPathRef.current === null) {
      initialPathRef.current = window.location.pathname;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapReady || deepLinkAppliedRef.current) return;
    const pathname = initialPathRef.current ?? window.location.pathname;
    const parts = pathname.replace(/^\/+|\/+$/g, "").split("/");
    const slug  = parts[0];
    const historyMode = parts[1] === "history";
    if (!slug) return;

    // Conflict slug → open CountryPanel + apply conflict state
    const conflictId = SLUG_TO_CONFLICT[slug];
    if (conflictId) {
      const country = CONFLICT_DEFAULT_COUNTRY[conflictId];
      if (!country) return;
      setShowRadar(false);
      setSelectedCountry(country);
      if (historyMode) setOpenWithHistory(true);
      applyConflict(conflictId, country);
      deepLinkAppliedRef.current = true;
      return;
    }
    // Violence slug → open gun violence panel
    if (slug === "violence" || slug === "gun-violence") {
      setShowRadar(false);
      setActiveGunViolence("");
      setFlyToPosition({ center: [-98.5, 39.5], zoom: 4, key: "violence-init" });
      deepLinkAppliedRef.current = true;
      return;
    }
    // Disaster slug → fly to location only, no country panel
    const disasterPos = DISASTER_SLUGS[slug];
    if (disasterPos) {
      setShowRadar(false);
      setFlyToPosition({ ...disasterPos, key: "disaster-" + slug });
      deepLinkAppliedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

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

  // Drop a fresh random nature pin of the given category (cycling so the
  // user can tap "Forest" repeatedly and keep getting new sites), fly to it,
  // and DO NOT touch selectedCountry — this is a discovery action, not a
  // country-focused one. If `category` is null → any category.
  const dropNaturePin = (category: NatureCategory | null) => {
    const cat: NatureCategory = category
      ?? (["forest", "beach", "mountains", "others"] as const)[Math.floor(Math.random() * 4)];
    const site = pickRandomNatureSite(cat, placedNatureNames);
    setPlacedNatureNames(prev => [...prev, site.name]);
    // Clear any active conflict state so the fly-to lands cleanly.
    setSelectedCountry(null);
    setHomeCountry(null);
    setFeedCountry(null);
    setSecondaryCountries([]);
    setFocusCountries([]);
    setShowRadar(false);
    const flyZoom = NATURE_CATEGORY_ZOOM[site.category] ?? NATURE_FLY_ZOOM;
    setFlyToPosition({ center: [site.lng, site.lat], zoom: flyZoom, key: `nature-${site.name}-${Date.now()}` });
  };

  const handleSearch = (code: string) => {
    // Nature-category searches (Forest / Beach / Mountains / Others / Any)
    if (code.startsWith("NATURE_")) {
      const key = code.slice(7).toLowerCase();
      const cat: NatureCategory | null =
        key === "forest"    ? "forest"    :
        key === "beach"     ? "beach"     :
        key === "mountains" ? "mountains" :
        key === "others"    ? "others"    : null;
      dropNaturePin(cat);
      return;
    }
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
      ISR: "israel-iran", IRN: "israel-iran", USA: "israel-iran",
      PSE: "israel-gaza",
      UKR: "russia-ukraine", RUS: "russia-ukraine",
      CHN: "taiwan-strait", TWN: "taiwan-strait",
      SDN: "sudan",
      MMR: "myanmar",
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
    // URL sync — each active conflict has its own deep-link path.
    const slug = CONFLICT_SLUGS[conflictId];
    setCurrentConflictSlug(slug ?? null);
    if (slug && typeof window !== "undefined" && window.location.pathname !== `/${slug}`) {
      window.history.replaceState(null, "", `/${slug}`);
    }
  };

  const handleConflictSelect = (conflictId: string) => {
    if (!selectedCountry) return;
    setOpenWithHistory(false);
    applyConflict(conflictId, selectedCountry);
  };

  return (
    <EditModeCtx.Provider value={editMode}>
    <EditModeSetCtx.Provider value={setEditMode}>
    <main className="relative w-screen h-screen bg-black overflow-hidden">
      <style>{`
        @keyframes flicker {
          0% { opacity: 0.3; color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.14); }
          20% { opacity: 0.5; color: rgba(34,197,94,0.5); background: rgba(34,197,94,0.09); border-color: rgba(34,197,94,0.2); }
          25% { opacity: 0.4; color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.14); }
          40% { opacity: 0.8; color: rgba(34,197,94,0.8); background: rgba(34,197,94,0.14); border-color: rgba(34,197,94,0.3); }
          50% { opacity: 1; color: #22c55e; background: rgba(34,197,94,0.18); border-color: rgba(34,197,94,0.35); }
          100% { opacity: 1; color: #22c55e; background: rgba(34,197,94,0.18); border-color: rgba(34,197,94,0.35); }
        }
        @keyframes yearFlicker {
          0% { opacity: 0.2; }
          20% { opacity: 0.4; }
          25% { opacity: 0.3; }
          40% { opacity: 0.7; }
          50% { opacity: 0.9; }
          100% { opacity: 0.9; }
        }
      `}</style>
      <div style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        maskImage: mapReady ? "linear-gradient(to right, black 0%, black 12.5%, black 25%, black 37.5%, black 50%, black 62.5%, black 75%, black 87.5%, black 100%)" : "none",
        maskSize: mapReady ? "800% 100%" : "100% 100%",
        maskPosition: mapReady ? "0% 0%" : "0% 0%",
        animation: mapReady ? "slideReveal 0.8s steps(8) forwards" : "none",
      }}>
        <style>{`
          @keyframes slideReveal {
            0% { mask-position: -700% 0%; }
            100% { mask-position: 0% 0%; }
          }
        `}</style>
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
          spinKey={spinKey}
          spinDisabled={!spinEnabled}
          isIdle={!selectedCountry && !homeCountry && !feedCountry && !activeGunViolence && !activeDisaster && !activeFinance}
          onReady={() => setMapReady(true)}
        />
      </div>

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
          onClose={() => { setSelectedCountry(null); setSecondaryCountries([]); setCasualtyCountries([]); setFocusCountries([]); setActiveStrikes(null); setRadarAlertText(null); setFeedCountry(null); setHistoryDate(null); if (typeof window !== "undefined" && window.location.pathname !== "/") window.history.replaceState(null, "", "/"); }}
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
          onCountrySwitch={handleCountryClick}
          conflictSlug={currentConflictSlug ?? undefined}
          defaultHistoryExpanded={openWithHistory}
        />
      )}

      {/* Settings nav menu — opens on second ATLAS tap */}
      {showSettings && !activeSubPanel && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onOpen={(panel) => setActiveSubPanel(panel)}
        />
      )}
      {showSettings && activeSubPanel === "you" && (
        <YouPanel onClose={() => { setShowSettings(false); setActiveSubPanel(null); }} onBack={() => setActiveSubPanel(null)} />
      )}
      {showSettings && activeSubPanel === "us" && (
        <UsPanel onClose={() => { setShowSettings(false); setActiveSubPanel(null); }} onBack={() => setActiveSubPanel(null)} />
      )}
      {showSettings && activeSubPanel === "methodology" && (
        <MethodologyPanel onClose={() => { setShowSettings(false); setActiveSubPanel(null); }} onBack={() => setActiveSubPanel(null)} />
      )}
      {showSettings && activeSubPanel === "settings" && (
        <SettingsSubPanel
          onClose={() => { setShowSettings(false); setActiveSubPanel(null); }}
          onBack={() => setActiveSubPanel(null)}
          spinEnabled={spinEnabled}
          onSpinChange={setSpinEnabled}
        />
      )}

      {/* Disaster panel — opens when a disaster card is tapped */}
      {!historicalYear && activeDisaster && (
        <DisasterPanel
          slug={activeDisaster}
          onClose={() => { setActiveDisaster(null); if (typeof window !== "undefined") window.history.replaceState(null, "", "/"); }}
        />
      )}

      {/* Gun violence panel — opens when a shooting alert is tapped */}
      {!historicalYear && activeGunViolence !== null && !showRadar && (
        <GunViolencePanel
          highlightId={activeGunViolence}
          onClose={() => { setActiveGunViolence(null); if (typeof window !== "undefined") window.history.replaceState(null, "", "/"); }}
          onFlyTo={(center, zoom) => setFlyToPosition({ center, zoom, key: String(Date.now()) })}
        />
      )}

      {/* Finance panel — opens when a finance card is tapped */}
      {!historicalYear && activeFinance && (
        <FinancePanel
          slug={activeFinance}
          onClose={() => setActiveFinance(null)}
        />
      )}

      {/* Radar — only visible when explicitly opened via ATLAS button */}
      {mapReady && !historicalYear && showRadar && !selectedCountry && !homeCountry && !feedCountry && (
        <AtlasHQ
          onClose={() => { setShowRadar(false); setShowHeadlines(false); }}
          onNavigate={(code, center, zoom, feedItem, slug) => {
            if (code) {
              setShowRadar(false);
              setOpenWithHistory(false);
              setHomeCountry(null);
              setSelectedCountry(code);
              setRadarAlertText(feedItem?.text ?? null);
              // Resolve conflict: prefer explicit slug from card, fall back to code lookup
              const conflictId = slug ? SLUG_TO_CONFLICT[slug] : getFirstConflict(code);
              if (conflictId) {
                // applyConflict sets secondaries, focusCountries, currentConflictSlug, and URL
                applyConflict(conflictId, code);
              } else if (slug && typeof window !== "undefined") {
                window.history.replaceState(null, "", `/${slug}`);
              }
              // Always honour the card-specific flyTo (overrides conflict default set above)
              setFlyToPosition({ center, zoom, key: String(Date.now()) });
            } else if (slug === "gun-violence" || slug === "violence") {
              // Gun violence — fly to incident city, open gun violence panel
              setShowRadar(false);
              setFlyToPosition({ center, zoom, key: String(Date.now()) });
              setActiveGunViolence(feedItem?.incidentId ?? "");
              if (typeof window !== "undefined") {
                window.history.replaceState(null, "", "/violence");
              }
            } else {
              // Disaster — fly to location, open disaster panel, set URL
              setShowRadar(false);
              setFlyToPosition({ center, zoom, key: String(Date.now()) });
              if (slug) setActiveDisaster(slug);
              if (slug && typeof window !== "undefined") {
                window.history.replaceState(null, "", `/${slug}`);
              }
            }
          }}
          onHeadlinesToggle={() => setShowHeadlines(v => !v)}
          onSourceClick={(s) => setActiveSource(s)}
          onReelsTap={() => router.push("/you")}
          onFinanceTap={(slug) => { setShowRadar(false); setActiveFinance(slug); }}
          onViolenceTap={(incidentId, center, zoom) => {
            setShowRadar(false);
            setFlyToPosition({ center, zoom, key: String(Date.now()) });
            setActiveGunViolence(incidentId);
          }}
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
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-2 pointer-events-none">
        <div className="flex items-center pointer-events-auto" style={{ gap: 12 }}>
          <button
            onClick={() => {
              if (showRadar) {
                // Second tap → close radar, open settings nav menu
                setShowRadar(false);
                setShowSettings(true);
                setActiveSubPanel(null);
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
              setActiveSubPanel(null);
              setActiveDisaster(null);
              setActiveFinance(null);
              setActiveGunViolence(null);
              setHistoricalYear(null);
              setPreviewYear(null);
              setTimelineOpen(false);
              setHistoryDate(null);
              setLiveReset(v => v + 1);
              setShowRadar(true);
              setSpinKey(k => k + 1);
              setFlyToPosition({ center: [-98.5, 39.5], zoom: 1.8, key: "atlas-globe-" + Date.now() });
              if (typeof window !== "undefined") window.history.replaceState(null, "", "/");
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
      <div style={{ position: "absolute", bottom: 16, right: 28, zIndex: 10, display: "flex", alignItems: "center", gap: 12, pointerEvents: "none" }}>
        <button
          onClick={() => { setHistoricalYear(null); setPreviewYear(null); setLiveReset(v => v + 1); if (!timelineOpen) setTimelineOpen(false); }}
          style={{
            pointerEvents: "auto",
            fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
            padding: "2px 8px", borderRadius: 10, cursor: "pointer",
            background: isLive ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${isLive ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.14)"}`,
            color:      isLive ? "#22c55e" : "rgba(255,255,255,0.35)",
            animation: mapReady && isLive ? "flicker 1.2s ease-out forwards" : "none",
          }}
        >live</button>
        <div style={{
          animation: mapReady ? "yearFlicker 1.2s ease-out forwards" : "none",
        }}>
          <Clock
            onYearClick={() => setTimelineOpen(v => !v)}
            displayYear={previewYear ?? historicalYear ?? undefined}
            historyDate={historyDate}
          />
        </div>
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

      {/* ── Global edit button — always visible, site-wide ── */}
      <button
        onClick={() => setEditMode(v => !v)}
        style={{
          position: "fixed", top: 52, left: 516, zIndex: 9999,
          background: editMode ? "rgba(100,160,255,0.14)" : "rgba(255,255,255,0.07)",
          border: editMode ? "1px solid rgba(100,160,255,0.40)" : "1px solid rgba(255,255,255,0.14)",
          borderRadius: 6,
          color: editMode ? "rgba(140,185,255,0.95)" : "rgba(255,255,255,0.55)",
          fontFamily: "monospace", fontSize: 11, letterSpacing: "0.10em",
          padding: "3px 10px", cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = editMode ? "rgba(100,160,255,0.22)" : "rgba(255,255,255,0.12)")}
        onMouseLeave={e => (e.currentTarget.style.background = editMode ? "rgba(100,160,255,0.14)" : "rgba(255,255,255,0.07)")}
      >
        {editMode ? "✓ done" : "✎ edit"}
      </button>
    </main>
    </EditModeSetCtx.Provider>
    </EditModeCtx.Provider>
  );
}
