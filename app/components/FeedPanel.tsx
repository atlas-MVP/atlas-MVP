"use client";

import { useState } from "react";

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
      time: "30 min ago",
      headline: "Hezbollah fires 40 rockets at northern Israel as ceasefire violations mount",
      excerpt: "The largest Hezbollah barrage since November 2024. Israel responded with airstrikes on southern Beirut suburbs.",
      imageUrl: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=400&q=80",
      url: "https://www.reuters.com/world/middle-east/",
      paywall: false,
    },
    {
      source: "AP",
      sourceColor: "#3b82f6",
      time: "3 hrs ago",
      headline: "Nasrallah successor consolidates Hezbollah command amid Israeli pressure",
      excerpt: "Sheikh Naim Qassem has restructured Hezbollah's military command to be more decentralized and resilient after leadership decapitation.",
      imageUrl: "https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=400&q=80",
      url: "https://apnews.com/hub/hezbollah",
      paywall: false,
    },
    {
      source: "Al Jazeera",
      sourceColor: "#dc2626",
      time: "5 hrs ago",
      headline: "Lebanon's reconstruction cost estimated at $11 billion as Beirut suburbs lie in ruin",
      excerpt: "The World Bank released an assessment of damage from Israeli airstrikes in the Dahieh district and southern Lebanon.",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
      url: "https://www.aljazeera.com/tag/lebanon/",
      paywall: false,
    },
    {
      source: "France 24",
      sourceColor: "#2563eb",
      time: "7 hrs ago",
      headline: "Southern Lebanon: One million displaced, infrastructure destroyed",
      excerpt: "France 24 journalists on the ground in Tyre report entire villages emptied, with residents unable to return despite the ceasefire.",
      imageUrl: "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=400&q=80",
      url: "https://www.france24.com/en/lebanon/",
      paywall: false,
    },
    {
      source: "The Guardian",
      sourceColor: "#16a34a",
      time: "10 hrs ago",
      headline: "'We have nothing to return to': Lebanese villagers survey the ruins",
      excerpt: "Guardian reporters traveled through southern Lebanon to document the scale of destruction — and the impossible choices facing displaced families.",
      imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80",
      url: "https://www.theguardian.com/world/lebanon",
      paywall: false,
    },
    {
      source: "New York Times",
      sourceColor: "#a3a3a3",
      time: "8 hrs ago",
      headline: "The pager attack: How Israel pulled off the most precise mass assassination in history",
      excerpt: "A detailed reconstruction of Operation Northern Arrow — months of preparation, thousands of tampered devices, and a single day that changed Hezbollah forever.",
      imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&q=80",
      url: "https://www.nytimes.com/section/world/middleeast",
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

type Filter = "free" | "all";

interface Props {
  countryCode: string | null;
  countryName: string;
  onClose: () => void;
  onSourceTap?: (source: string) => void;
}

export default function FeedPanel({ countryCode, countryName, onClose, onSourceTap }: Props) {
  const [freeOnly, setFreeOnly] = useState(false);

  if (!countryCode) return null;
  const allArticles = FEED_DATA[countryCode] ?? [];
  const articles = allArticles.filter((a) => freeOnly ? !a.paywall : true);

  return (
    <div className="absolute z-20 flex flex-col w-[460px]"
      style={{
        top: 72, bottom: 24, left: 496,
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
          <button onClick={onClose} className="text-white/20 hover:text-white/60 transition-colors text-xl">×</button>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {articles.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-white/20 text-xs font-mono tracking-wide">NO ARTICLES MATCH FILTER</p>
          </div>
        ) : (
          articles.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group transition-all"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                padding: "14px 20px",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Source + time + paywall badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold font-mono px-1.5 py-0.5 rounded"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); onSourceTap?.(article.source); }}
                  style={{ background: `${article.sourceColor}18`, color: article.sourceColor, border: `1px solid ${article.sourceColor}30`, cursor: "pointer" }}>
                  {SOURCE_ABBR[article.source] ?? article.source}
                </span>
                <span className="text-white/25 text-xs" onClick={e => { e.preventDefault(); e.stopPropagation(); onSourceTap?.(article.source); }} style={{ cursor: "pointer" }}>{article.source}</span>
                {article.paywall && (
                  <span className="text-white/20 text-xs font-mono ml-0.5">🔒</span>
                )}
                <span className="text-white/15 text-xs ml-auto font-mono">{article.time}</span>
              </div>

              {/* Headline + thumbnail */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-white/80 text-sm font-medium leading-snug mb-1.5 group-hover:text-white transition-colors">
                    {article.headline}
                  </p>
                  <p className="text-white/30 text-xs leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
                <div className="w-14 h-14 rounded overflow-hidden shrink-0 mt-0.5">
                  <img src={article.imageUrl} alt="" className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-white/10 text-xs text-center font-mono tracking-widest">ATLAS · INTELLIGENCE FEED</p>
      </div>
    </div>
  );
}
