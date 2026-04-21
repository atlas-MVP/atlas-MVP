"use client";

import { useState, useEffect } from "react";
import { EText } from "./InlineEdit";

interface Article {
  source: string;
  sourceColor: string;
  time: string;
  headline: string;
  excerpt: string;
  imageUrl: string;
  url: string;
  paywall: boolean;
}

const FEED_DATA: Record<string, Article[]> = {
  IRN: [
    {
      source: "Reuters",
      sourceColor: "#f97316",
      time: "2 hrs ago",
      headline: "Iran vows retaliation after Israeli strikes on air defense sites near Isfahan",
      excerpt: "Iran's Revolutionary Guard said it would respond 'at the time and place of its choosing' after Israeli F-35s penetrated Iranian airspace, destroying S-300 radar systems.",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80",
      url: "https://www.reuters.com/world/middle-east/",
      paywall: false,
    },
    {
      source: "AP",
      sourceColor: "#3b82f6",
      time: "3 hrs ago",
      headline: "Strait of Hormuz: Iran holds naval drills as tanker traffic falls 22%",
      excerpt: "Iranian naval forces conducted live-fire exercises in the strait through which 20% of the world's oil supply passes, rattling energy markets.",
      imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80",
      url: "https://apnews.com/hub/iran",
      paywall: false,
    },
    {
      source: "Al Jazeera",
      sourceColor: "#dc2626",
      time: "5 hrs ago",
      headline: "Iran nuclear enrichment reaches 60% purity as IAEA warns of 'critical' escalation",
      excerpt: "The IAEA confirmed Iran has enough enriched uranium for multiple nuclear devices if further processed.",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80",
      url: "https://www.aljazeera.com/tag/iran/",
      paywall: false,
    },
    {
      source: "BBC",
      sourceColor: "#dc2626",
      time: "6 hrs ago",
      headline: "Iran's shadow war: How Tehran funds proxies across seven countries",
      excerpt: "A BBC investigation maps the supply routes, funding flows, and command structures linking Tehran to Hezbollah, Hamas, Houthis, and Iraqi militias.",
      imageUrl: "https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=400&q=80",
      url: "https://www.bbc.com/news/world/middle_east",
      paywall: false,
    },
    {
      source: "The Guardian",
      sourceColor: "#16a34a",
      time: "9 hrs ago",
      headline: "Iran's oil exports hit five-year high despite US sanctions",
      excerpt: "Iran exported 1.7 million barrels per day in Q1 2024, largely to China, undermining the economic pressure strategy of Western nations.",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
      url: "https://www.theguardian.com/world/iran",
      paywall: false,
    },
    {
      source: "France 24",
      sourceColor: "#2563eb",
      time: "11 hrs ago",
      headline: "Inside Tehran: How ordinary Iranians view the war with Israel",
      excerpt: "France 24 correspondents report from Tehran on public sentiment — a mix of state-mandated bravado and private fear of wider escalation.",
      imageUrl: "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=400&q=80",
      url: "https://www.france24.com/en/iran/",
      paywall: false,
    },
    {
      source: "New York Times",
      sourceColor: "#a3a3a3",
      time: "8 hrs ago",
      headline: "Inside the drone war: How Iran-backed militias built a shadow arsenal",
      excerpt: "An investigation reveals the supply chains feeding thousands of precision drones to proxy forces, reshaping regional warfare.",
      imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&q=80",
      url: "https://www.nytimes.com/section/world/middleeast",
      paywall: true,
    },
    {
      source: "The Economist",
      sourceColor: "#dc2626",
      time: "1 day ago",
      headline: "The Iran-Israel shadow war is becoming a real one",
      excerpt: "For decades, Iran and Israel fought through proxies and covert operations. That era may be over — and the implications for the region are profound.",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
      url: "https://www.economist.com/middle-east-and-africa",
      paywall: true,
    },
    {
      source: "Washington Post",
      sourceColor: "#a3a3a3",
      time: "14 hrs ago",
      headline: "US quietly repositions carrier group as Iran tensions spike",
      excerpt: "The USS Eisenhower carrier strike group has moved to within striking distance of Iranian coastal installations, officials said.",
      imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&q=80",
      url: "https://www.washingtonpost.com/world/middle_east/",
      paywall: true,
    },
  ],
  ISR: [
    {
      source: "Reuters",
      sourceColor: "#f97316",
      time: "1 hr ago",
      headline: "IDF confirms strike on Rafah crossing as ceasefire talks stall in Cairo",
      excerpt: "Israeli forces struck the Rafah border crossing hours after Hamas rejected a revised hostage deal. 34 hostages remain in Gaza.",
      imageUrl: "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=400&q=80",
      url: "https://www.reuters.com/world/middle-east/",
      paywall: false,
    },
    {
      source: "AP",
      sourceColor: "#3b82f6",
      time: "3 hrs ago",
      headline: "US pauses 1,800 bombs shipment to Israel amid civilian casualty concerns",
      excerpt: "The Biden administration froze a delivery of 2,000-pound bombs, marking the first pause in US weapons supply since October 7.",
      imageUrl: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=400&q=80",
      url: "https://apnews.com/hub/israel-hamas-war",
      paywall: false,
    },
    {
      source: "Al Jazeera",
      sourceColor: "#dc2626",
      time: "4 hrs ago",
      headline: "Gaza death toll surpasses 34,000 as WHO warns of famine in northern enclave",
      excerpt: "The UN World Food Programme says northern Gaza is in 'full famine,' with 1.1 million people facing catastrophic food insecurity.",
      imageUrl: "https://images.unsplash.com/photo-1578496479531-32e296d5c6e1?w=400&q=80",
      url: "https://www.aljazeera.com/tag/israel-palestine-conflict/",
      paywall: false,
    },
    {
      source: "Times of Israel",
      sourceColor: "#2563eb",
      time: "2 hrs ago",
      headline: "Netanyahu coalition fractures as Gantz threatens withdrawal over Gaza strategy",
      excerpt: "Benny Gantz issued an ultimatum demanding a post-war governance plan for Gaza by June 8, plunging the government into crisis.",
      imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&q=80",
      url: "https://www.timesofisrael.com/",
      paywall: false,
    },
    {
      source: "BBC",
      sourceColor: "#dc2626",
      time: "5 hrs ago",
      headline: "Inside Gaza: Hospitals overwhelmed as ground offensive intensifies",
      excerpt: "BBC reporters document scenes inside Al-Shifa hospital, where thousands of displaced Palestinians shelter amid ongoing Israeli operations.",
      imageUrl: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=400&q=80",
      url: "https://www.bbc.com/news/topics/c2vdnvyt2lxt",
      paywall: false,
    },
    {
      source: "Middle East Eye",
      sourceColor: "#16a34a",
      time: "6 hrs ago",
      headline: "Israeli settlers rampage through West Bank village under army protection",
      excerpt: "Hundreds of settlers attacked Palestinian homes in Sinjil village, torching cars and homes while soldiers stood by, witnesses say.",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
      url: "https://www.middleeasteye.net/countries/palestine",
      paywall: false,
    },
    {
      source: "Haaretz",
      sourceColor: "#a3a3a3",
      time: "7 hrs ago",
      headline: "IDF internal review finds October 7 failures went beyond intelligence to command",
      excerpt: "A classified military report reviewed by Haaretz concludes the failures were systemic, implicating senior commanders who ignored warnings.",
      imageUrl: "https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=400&q=80",
      url: "https://www.haaretz.com/",
      paywall: true,
    },
    {
      source: "New York Times",
      sourceColor: "#a3a3a3",
      time: "9 hrs ago",
      headline: "The hostage deal that almost was: inside the failed Cairo negotiations",
      excerpt: "A months-long investigation into how close Israel and Hamas came to a deal — and why it collapsed — reveals deep divisions on both sides.",
      imageUrl: "https://images.unsplash.com/photo-1578496479914-4d13acfe97a2?w=400&q=80",
      url: "https://www.nytimes.com/section/world/middleeast",
      paywall: true,
    },
    {
      source: "Financial Times",
      sourceColor: "#f97316",
      time: "12 hrs ago",
      headline: "Israel's economy contracts 5.6% as defence spending surges to wartime levels",
      excerpt: "The Bank of Israel revised GDP forecasts sharply downward as military spending crowds out investment and tourism collapses.",
      imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80",
      url: "https://www.ft.com/middle-east",
      paywall: true,
    },
  ],
  LBN: [
    {
      source: "Reuters",
      sourceColor: "#f97316",
      time: "1 hr ago",
      headline: "IDF strikes Hezbollah weapons depot in Bekaa Valley despite ceasefire",
      excerpt: "Israeli forces struck a suspected Hezbollah weapons transfer site near Baalbek, marking the third such strike this week. Israel says operations will continue as long as rearming continues.",
      imageUrl: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=400&q=80",
      url: "https://www.reuters.com/world/middle-east/",
      paywall: false,
    },
    {
      source: "AP",
      sourceColor: "#3b82f6",
      time: "3 hrs ago",
      headline: "Hezbollah fires anti-tank missiles at IDF patrol in southern Lebanon buffer zone",
      excerpt: "Israeli troops on a routine patrol near the Litani River came under fire Tuesday. No casualties reported. IDF artillery returned fire at suspected launch positions.",
      imageUrl: "https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=400&q=80",
      url: "https://apnews.com/hub/hezbollah",
      paywall: false,
    },
    {
      source: "BBC",
      sourceColor: "#dc2626",
      time: "4 hrs ago",
      headline: "Lebanon ceasefire 'on life support' as violations exceed 1,200 since November",
      excerpt: "The US-brokered ceasefire that ended the 2024 war has been violated repeatedly by both sides. UNIFIL peacekeepers say the situation on the ground bears little resemblance to the agreement.",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
      url: "https://www.bbc.com/news/world/middle_east",
      paywall: false,
    },
    {
      source: "Al Jazeera",
      sourceColor: "#dc2626",
      time: "5 hrs ago",
      headline: "Lebanon's reconstruction cost estimated at $15 billion as south remains off-limits",
      excerpt: "Over one million internally displaced Lebanese cannot return home. The World Bank says the window for orderly reconstruction is closing as political deadlock persists in Beirut.",
      imageUrl: "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=400&q=80",
      url: "https://www.aljazeera.com/tag/lebanon/",
      paywall: false,
    },
    {
      source: "France 24",
      sourceColor: "#2563eb",
      time: "7 hrs ago",
      headline: "Naim Qassem rebuilds Hezbollah with Iranian resupply through Syria corridor",
      excerpt: "Intelligence officials say Hezbollah has reconstituted roughly 40% of its pre-war precision missile stock. Transfers move through a land corridor via Damascus that Israel has repeatedly targeted.",
      imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&q=80",
      url: "https://www.france24.com/en/lebanon/",
      paywall: false,
    },
    {
      source: "The Guardian",
      sourceColor: "#16a34a",
      time: "9 hrs ago",
      headline: "'We have nothing to return to': Lebanese villagers survey the ruins",
      excerpt: "Guardian correspondents crossed back into southern Lebanon to document the scale of destruction. Entire villages stand empty, with residents saying Israeli restrictions and mine contamination make return impossible.",
      imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80",
      url: "https://www.theguardian.com/world/lebanon",
      paywall: false,
    },
    {
      source: "Haaretz",
      sourceColor: "#1d4ed8",
      time: "11 hrs ago",
      headline: "IDF maintains 'security zone' inside Lebanon weeks past withdrawal deadline",
      excerpt: "Israel was required to withdraw from Lebanese territory by late January. It has not. Military officials cite Hezbollah's failure to redeploy north of the Litani as justification.",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
      url: "https://www.haaretz.com/",
      paywall: false,
    },
    {
      source: "L'Orient Today",
      sourceColor: "#7c3aed",
      time: "13 hrs ago",
      headline: "Lebanon army deployed to south but refuses direct confrontation with IDF",
      excerpt: "Lebanese Armed Forces have moved units south as required by the ceasefire, but commanders have quietly told troops to avoid any engagement with Israeli forces — leaving a dangerous vacuum.",
      imageUrl: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=400&q=80",
      url: "https://today.lorientlejour.com/",
      paywall: false,
    },
    {
      source: "New York Times",
      sourceColor: "#a3a3a3",
      time: "1 day ago",
      headline: "The pager attack: How Israel dismantled Hezbollah's command structure in 60 seconds",
      excerpt: "A reconstruction of the September 2024 operation — years of supply chain infiltration, 3,000 tampered devices, and a single afternoon that killed or maimed Hezbollah's entire logistics network.",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
      url: "https://www.nytimes.com/section/world/middleeast",
      paywall: true,
    },
    {
      source: "The Economist",
      sourceColor: "#dc2626",
      time: "2 days ago",
      headline: "After the twelve-day war: What a ceasefire without peace looks like",
      excerpt: "The guns paused but the conflict did not end. The Economist surveys a Lebanon caught between Hezbollah's determination to rearm and Israel's determination to stop it — with no political resolution in sight.",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80",
      url: "https://www.economist.com/middle-east-and-africa",
      paywall: true,
    },
  ],
  SYR: [
    {
      source: "Reuters",
      sourceColor: "#f97316",
      time: "2 hrs ago",
      headline: "HTS-led government struggles to restore services as Syrian pound collapses",
      excerpt: "Three months after Assad's fall, the transitional government faces a currency crisis and multiple armed factions contesting territory.",
      imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80",
      url: "https://www.reuters.com/world/middle-east/",
      paywall: false,
    },
    {
      source: "Al Jazeera",
      sourceColor: "#dc2626",
      time: "5 hrs ago",
      headline: "Israeli airstrikes hit 300+ Syrian military sites since Assad's fall",
      excerpt: "Israel has systematically destroyed Syria's military infrastructure to prevent stockpiles falling into jihadist hands.",
      imageUrl: "https://images.unsplash.com/photo-1578496479914-4d13acfe97a2?w=400&q=80",
      url: "https://www.aljazeera.com/tag/syria/",
      paywall: false,
    },
  ],
  YEM: [
    {
      source: "Reuters",
      sourceColor: "#f97316",
      time: "45 min ago",
      headline: "Houthis claim drone strike on Tel Aviv, Israel confirms interception",
      excerpt: "The Houthi military spokesperson announced a ballistic missile and drone swarm targeting Tel Aviv. Israel's Arrow system intercepted the threat.",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
      url: "https://www.reuters.com/world/middle-east/",
      paywall: false,
    },
    {
      source: "AP",
      sourceColor: "#3b82f6",
      time: "3 hrs ago",
      headline: "US and UK conduct 18th round of airstrikes on Houthi positions in Sanaa",
      excerpt: "Coalition forces targeted Houthi missile storage and radar installations after a container ship was struck in the Gulf of Aden.",
      imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&q=80",
      url: "https://apnews.com/hub/houthis",
      paywall: false,
    },
  ],
  IRQ: [
    {
      source: "Reuters",
      sourceColor: "#f97316",
      time: "2 hrs ago",
      headline: "Iran-backed militias rocket US al-Asad base, wounding four American soldiers",
      excerpt: "Kataib Hezbollah claimed responsibility for a complex drone-rocket attack on the Iraqi base hosting US forces.",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
      url: "https://www.reuters.com/world/middle-east/",
      paywall: false,
    },
  ],
};

const SOURCE_ABBR: Record<string, string> = {
  "Reuters": "R",
  "Al Jazeera": "AJ",
  "AP": "AP",
  "New York Times": "NYT",
  "BBC": "BBC",
  "The Guardian": "GRD",
  "France 24": "F24",
  "Times of Israel": "TOI",
  "Middle East Eye": "MEE",
  "Haaretz": "HAA",
  "The Economist": "ECO",
  "Washington Post": "WPO",
  "Financial Times": "FT",
};


interface Props {
  countryCode: string | null;
  countryName: string;
  onClose: () => void;
  onSourceTap?: (source: string) => void;
}

export default function FeedPanel({ countryCode, countryName, onClose, onSourceTap }: Props) {
  const [freeOnly,  setFreeOnly]  = useState(false);
  const [allArticles, setAllArticles] = useState<Article[]>(() => FEED_DATA[countryCode ?? ""] ?? []);

  useEffect(() => {
    setAllArticles(FEED_DATA[countryCode ?? ""] ?? []);
  }, [countryCode]);

  if (!countryCode) return null;
  const articles = allArticles.filter((a) => freeOnly ? !a.paywall : true);

  return (
    <div className="absolute z-20 flex flex-col w-[520px]"
      style={{
        top: 72, bottom: 24, right: 24,
        background: "rgba(4,6,16,0.95)",
        backdropFilter: "blur(28px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        boxShadow: "0 0 50px rgba(0,0,0,0.8)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white/25 text-xs tracking-widest uppercase font-mono">Live Feed</span>
          <span className="text-white/60 text-xs font-medium">{countryName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFreeOnly(v => !v)}
            style={{
              fontSize: 8, fontFamily: "monospace", letterSpacing: "0.10em",
              padding: "2px 6px", borderRadius: 4, cursor: "pointer",
              background: freeOnly ? "rgba(255,255,255,0.12)" : "transparent",
              border: `1px solid ${freeOnly ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)"}`,
              color: freeOnly ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
            }}
          >free</button>
          <button onClick={onClose} className="hover:text-white/60 transition-colors text-xl" style={{ color: "rgba(255,255,255,0.12)", background: "none", border: "none", cursor: "pointer" }}>×</button>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {articles.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-white/20 text-xs font-mono tracking-wide">NO ARTICLES MATCH FILTER</p>
          </div>
        ) : (
          articles.map((article, _fi) => {
            const realIdx = allArticles.indexOf(article);
            const patch = (field: keyof Article, val: string) =>
              setAllArticles(prev => prev.map((x, j) => j === realIdx ? { ...x, [field]: val } : x));
            return (
            <div
              key={realIdx}
              className="block group transition-all"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                padding: "14px 20px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Source + time + paywall badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold font-mono px-1.5 py-0.5 rounded"
                  onClick={e => { e.stopPropagation(); onSourceTap?.(article.source); }}
                  style={{ background: `${article.sourceColor}18`, color: article.sourceColor, border: `1px solid ${article.sourceColor}30`, cursor: "pointer" }}>
                  {SOURCE_ABBR[article.source] ?? article.source}
                </span>
                <span className="text-white/25 text-xs" onClick={e => { e.stopPropagation(); onSourceTap?.(article.source); }} style={{ cursor: "pointer" }}>
                  <EText value={article.source} onChange={v => patch("source", v)} style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }} />
                </span>
                {article.paywall && (
                  <span className="text-white/20 text-xs font-mono ml-0.5">🔒</span>
                )}
                <span className="text-white/15 text-xs ml-auto font-mono">
                  <EText value={article.time} onChange={v => patch("time", v)} style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", fontFamily: "monospace" }} />
                </span>
              </div>

              {/* Headline + thumbnail */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="mb-1.5" style={{ fontSize: 14, color: "rgba(255,255,255,0.80)", fontWeight: 500, lineHeight: 1.4 }}>
                    <EText value={article.headline} onChange={v => patch("headline", v)} style={{ fontSize: 14, color: "rgba(255,255,255,0.80)", fontWeight: 500, lineHeight: 1.4 }} />
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.30)", lineHeight: 1.5, margin: 0 }}>
                    <EText value={article.excerpt} onChange={v => patch("excerpt", v)} style={{ fontSize: 12, color: "rgba(255,255,255,0.30)", lineHeight: 1.5 }} />
                  </p>
                </div>
                <div className="w-14 h-14 rounded overflow-hidden shrink-0 mt-0.5">
                  <img src={article.imageUrl} alt="" className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-white/10 text-xs text-center font-mono tracking-widest">ATLAS · INTELLIGENCE FEED</p>
      </div>
    </div>
  );
}
