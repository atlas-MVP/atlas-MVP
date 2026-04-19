"use client";

const SOURCES: Record<string, {
  fullName: string;
  founded: string;
  hq: string;
  type: string;
  accuracy: number;
  description: string;
  staff: string;
  coverage: string;
}> = {
  "Reuters": {
    fullName: "Reuters",
    founded: "October 1851",
    hq: "London, United Kingdom",
    type: "International News Agency",
    accuracy: 5,
    description: "The world's largest international multimedia news organization, owned by Thomson Reuters. Provides real-time, verified reporting to newspapers, broadcast, and digital media across 200+ countries. Widely regarded as the gold standard for neutral, rapid-fire factual reporting.",
    staff: "2,500+ journalists",
    coverage: "Global · 94 countries",
  },
  "AP": {
    fullName: "Associated Press",
    founded: "May 22, 1846",
    hq: "New York, USA",
    type: "Not-for-profit News Agency",
    accuracy: 5,
    description: "America's oldest and most trusted newswire, operating as a nonprofit cooperative. AP content appears in outlets across more than 100 countries. Known for strict standards of impartiality, rapid verification, and zero tolerance for editorial slant.",
    staff: "3,200+ journalists",
    coverage: "Global · 263 bureaus",
  },
  "ACLED": {
    fullName: "Armed Conflict Location & Event Data Project",
    founded: "2010",
    hq: "Brussels, Belgium",
    type: "Conflict Research Database",
    accuracy: 5,
    description: "Disaggregated conflict data platform tracking political violence, battle events, protests, and explosions globally in near-real time. Used as primary source by the UN, World Bank, NATO, and hundreds of NGOs. Data is manually coded, cross-validated, and peer-reviewed.",
    staff: "400+ researchers",
    coverage: "Global conflict zones · 50+ countries",
  },
  "GDELT": {
    fullName: "Global Database of Events, Language & Tone",
    founded: "2013",
    hq: "Washington D.C., USA",
    type: "Open-Source Data Platform",
    accuracy: 5,
    description: "The world's largest open event database, processing every broadcast, print, and web news item globally in real time. Monitors 100 languages and 65 countries. Supported by Google Jigsaw. Used by researchers, intelligence analysts, and journalists as an early-warning signal layer.",
    staff: "Open-source infrastructure",
    coverage: "Every country · 100 languages",
  },
  "NYT": {
    fullName: "The New York Times",
    founded: "September 18, 1851",
    hq: "New York, USA",
    type: "Newspaper / Digital Media",
    accuracy: 4,
    description: "The most influential newspaper in the United States with a global digital readership exceeding 10M subscribers. Pulitzer Prize-winning investigative and foreign journalism. Generally high factual accuracy; editorially leans center-left with occasional geopolitical framing that reflects Western perspective.",
    staff: "1,700+ journalists",
    coverage: "Global · 160+ countries",
  },
  "Al Jazeera": {
    fullName: "Al Jazeera Media Network",
    founded: "November 1, 1996",
    hq: "Doha, Qatar",
    type: "Broadcast & Digital Network",
    accuracy: 4,
    description: "Qatar state-funded pan-Arab news network with significant global reach and strong on-the-ground access across the Middle East and Africa. Known for breaking news in conflict zones where Western outlets have limited access. Coverage quality is high but editorial decisions can reflect Qatari geopolitical interests.",
    staff: "3,000+ staff",
    coverage: "Global · strong MENA, Africa",
  },
  "BBC": {
    fullName: "British Broadcasting Corporation",
    founded: "October 18, 1927",
    hq: "London, United Kingdom",
    type: "Public Broadcaster",
    accuracy: 4,
    description: "The world's largest public broadcaster, funded by UK licence fees and operating independently from the government. Internationally respected for editorial standards and breadth of coverage. Geopolitical reporting occasionally reflects British institutional perspective, particularly on Commonwealth and NATO-adjacent issues.",
    staff: "22,000+ staff",
    coverage: "Global · 40+ languages",
  },
  "The Guardian": {
    fullName: "The Guardian",
    founded: "May 5, 1821",
    hq: "London, United Kingdom",
    type: "Newspaper / Digital Media",
    accuracy: 4,
    description: "One of the UK's most widely read quality newspapers, independently owned by the Scott Trust. Strong investigative and foreign journalism with Pulitzer-winning reporting. Editorially leans centre-left; international coverage is extensive but framing can reflect progressive Western values. Known for transparency in corrections.",
    staff: "1,000+ journalists",
    coverage: "Global · strong UK, US, Australia",
  },
  "France 24": {
    fullName: "France 24",
    founded: "December 6, 2006",
    hq: "Paris, France",
    type: "International News Channel",
    accuracy: 4,
    description: "French state-funded international news channel broadcasting in French, English, Arabic, and Spanish. Strong on-the-ground coverage in Francophone Africa and the Middle East. Generally high factual standards; editorial positioning can reflect French foreign policy interests, particularly regarding Africa and former French territories.",
    staff: "700+ journalists",
    coverage: "Global · strong Africa, Middle East",
  },
  "Washington Post": {
    fullName: "The Washington Post",
    founded: "December 6, 1877",
    hq: "Washington D.C., USA",
    type: "Newspaper / Digital Media",
    accuracy: 4,
    description: "One of America's most influential newspapers, known for investigative reporting on US government and foreign policy. Pulitzer Prize-winning journalism. Owned by Jeff Bezos since 2013. Leans centre-left editorially; foreign policy coverage is comprehensive but anchored in Washington's institutional perspective.",
    staff: "1,000+ journalists",
    coverage: "Global · strong US politics, foreign policy",
  },
  "Haaretz": {
    fullName: "Haaretz",
    founded: "1918",
    hq: "Tel Aviv, Israel",
    type: "Newspaper / Digital Media",
    accuracy: 4,
    description: "Israel's oldest and most internationally read daily newspaper. Known for independent, often critical coverage of Israeli government and military policy. Editorially left-liberal within Israeli politics; provides crucial ground-level reporting on the Israeli-Palestinian conflict from inside Israel with rare willingness to challenge official narratives.",
    staff: "600+ journalists",
    coverage: "Israel, Palestine · English & Hebrew",
  },
  "Financial Times": {
    fullName: "Financial Times",
    founded: "January 9, 1888",
    hq: "London, United Kingdom",
    type: "Financial Newspaper / Digital Media",
    accuracy: 5,
    description: "The world's foremost international business and financial newspaper, read by policymakers, executives, and analysts globally. Exceptionally rigorous factual standards, particularly on economic and geopolitical risk. Coverage of conflict focuses on strategic and economic dimensions. Owned by Nikkei Inc. since 2015.",
    staff: "600+ journalists",
    coverage: "Global · 180+ countries",
  },
  "The Economist": {
    fullName: "The Economist",
    founded: "September 4, 1843",
    hq: "London, United Kingdom",
    type: "Weekly Magazine / Digital Media",
    accuracy: 5,
    description: "One of the most respected and widely read international affairs publications in the world. Known for deeply analytical, data-driven reporting on geopolitics, economics, and conflict. Editorially centrist-liberal; articles are unsigned, enforcing institutional rather than individual perspective. Used heavily by governments and think tanks.",
    staff: "400+ journalists & analysts",
    coverage: "Global · 200+ countries",
  },
  "Times of Israel": {
    fullName: "The Times of Israel",
    founded: "February 2012",
    hq: "Jerusalem, Israel",
    type: "Digital News Outlet",
    accuracy: 4,
    description: "English-language digital news site covering Israel, the Palestinian territories, and the Jewish diaspora. Provides rapid on-the-ground reporting from Israel with a broad range of editorial voices. Generally reliable on factual matters; editorially centrist-to-right within Israeli political spectrum. Strong sourcing from IDF and Israeli government.",
    staff: "150+ journalists",
    coverage: "Israel, Palestine, Jewish world",
  },
  "Middle East Eye": {
    fullName: "Middle East Eye",
    founded: "2014",
    hq: "London, United Kingdom",
    type: "Digital News Outlet",
    accuracy: 3,
    description: "Independent digital news platform covering the Middle East and North Africa region. Provides extensive on-the-ground access and reporting from conflict zones underserved by Western media. Has significant reach in Arab-speaking audiences. Editorial positioning is broadly sympathetic to Palestinian and Islamist political movements; fact-check before citing on contested claims.",
    staff: "100+ journalists",
    coverage: "Middle East, North Africa",
  },
};

const ACCURACY_LABELS: Record<number, string> = {
  5: "Highly Reliable",
  4: "Generally Reliable",
  3: "Mixed",
  2: "Often Unreliable",
  1: "Unreliable",
};

const ACCURACY_COLOR: Record<number, string> = {
  5: "#22c55e",
  4: "#86efac",
  3: "#fbbf24",
  2: "#f87171",
  1: "#ef4444",
};

interface Props {
  source: string;
  onClose: () => void;
}

export default function SourceInfoPanel({ source, onClose }: Props) {
  const data = SOURCES[source];
  if (!data) return null;

  const dots = Array.from({ length: 5 }, (_, i) => i < data.accuracy);
  const color = ACCURACY_COLOR[data.accuracy];

  return (
    <div style={{
      position: "absolute",
      top: 72, left: 528, zIndex: 28,
      width: 320,
      background: "rgba(4,6,18,0.97)",
      backdropFilter: "blur(28px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      boxShadow: "0 0 40px rgba(0,0,0,0.7)",
      overflow: "hidden",
      pointerEvents: "auto",
    }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 8, fontFamily: "monospace", letterSpacing: "0.14em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>source intelligence</span>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.12)", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.12)")}
          >×</button>
        </div>

        {/* Name + type */}
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "0.01em" }}>{data.fullName}</h3>
          <p style={{ margin: "3px 0 0", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>{data.type.toUpperCase()}</p>
        </div>

        {/* Accuracy rating */}
        <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 8, background: `${color}0f`, border: `1px solid ${color}25` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 8, fontFamily: "monospace", letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)" }}>ACCURACY RATING</span>
            <span style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 700, color, letterSpacing: "0.06em" }}>{ACCURACY_LABELS[data.accuracy]}</span>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {dots.map((filled, i) => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 99,
                background: filled ? color : "rgba(255,255,255,0.08)",
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Description */}
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.52)", lineHeight: 1.45 }}>{data.description}</p>

        {/* Key facts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            { label: "Founded",  value: data.founded },
            { label: "HQ",      value: data.hq },
            { label: "Staff",   value: data.staff },
            { label: "Reach",   value: data.coverage },
          ].map(({ label, value }) => (
            <div key={label} style={{
              padding: "8px 10px", borderRadius: 8,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 4px 14px rgba(0,0,0,0.45)",
            }}>
              <p style={{ margin: 0, fontSize: 7, fontFamily: "monospace", letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 3 }}>{label}</p>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 500, lineHeight: 1.3 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
