"use client";

import { useEffect, useState } from "react";
import { EText } from "./InlineEdit";

function extractAlertSource(line: string): string {
  return line.split(":")[0].trim();
}

function ConflictCard({ label, dot, alerts, onSourceTap }: { label: string; dot: string; alerts?: string[]; onSourceTap?: (source: string) => void }) {
  const [hovered, setHovered]       = useState(false);
  const [litCount, setLitCount]     = useState(0);

  useEffect(() => {
    if (!hovered || !alerts?.length) {
      setLitCount(0);
      return;
    }
    setLitCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    alerts.forEach((_, i) => {
      timers.push(setTimeout(() => setLitCount(n => Math.max(n, i + 1)), 90 + i * 160));
    });
    return () => timers.forEach(clearTimeout);
  }, [hovered, alerts]);

  // Neutral radar aesthetic — no red/pink tinting, no blinking dot
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: hovered ? "12px 13px" : "10px 13px",
        borderRadius: 10,
        background: hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
        transition: "background 0.2s, padding 0.2s",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontFamily: "monospace", letterSpacing: "0.06em", color: "rgba(255,255,255,0.88)", fontWeight: 700 }}>{label}</span>
      </div>

      {hovered && alerts && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5, paddingLeft: 18 }}>
          {alerts.map((line, i) => {
            const lit = i < litCount;
            return (
              <div key={i} onClick={() => onSourceTap?.(extractAlertSource(line))} style={{
                fontSize: 10, color: "rgba(255,255,255,0.60)", lineHeight: 1.5,
                padding: "4px 8px", borderRadius: 5,
                background: "rgba(255,255,255,0.04)",
                borderLeft: "2px solid rgba(255,255,255,0.25)",
                cursor: "pointer",
                opacity: lit ? 1 : 0,
                filter: lit ? "blur(0)" : "blur(4px)",
                transform: lit ? "translateY(0)" : "translateY(3px)",
                transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1), filter 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
              }}>{line}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface CountryStat {
  label: string;
  value: string;
}

interface CountryHomeData {
  name: string;
  fullName: string;
  flag: string;
  founded: string;
  capital: string;
  population: string;
  region: string;
  leader: string;
  leaderTitle: string;
  leaderPhoto: string;
  description: string;
  stats: CountryStat[];
  conflicts?: { label: string; dot: string; alerts?: string[] }[];
}

const DATA: Record<string, CountryHomeData> = {
  USA: {
    name: "United States of America", fullName: "United States of America", flag: "🇺🇸",
    founded: "July 4, 1776", capital: "Washington, D.C.", population: "335M", region: "North America",
    leader: "Donald J. Trump", leaderTitle: "47th President of the United States",
    leaderPhoto: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Donald_Trump_official_portrait.jpg/400px-Donald_Trump_official_portrait.jpg",
    description: "The world's leading military and economic power, with the largest defense budget on Earth. The United States projects force globally through carrier groups, forward bases, and a vast alliance network.",
    stats: [{ label: "GDP / Military", value: "$28.8T / $886B" }, { label: "Gov't", value: "Federal Republic" }],
    conflicts: [
      { label: "Israel / US in the Middle East", dot: "#ef4444", alerts: ["Reuters: US 5th Fleet on heightened alert in Persian Gulf", "AP: Iran threatens Strait of Hormuz closure amid escalation", "NYT: White House convenes NSC emergency session"] },
      { label: "Russia — Ukraine war", dot: "#fb923c", alerts: ["NYT: Ukraine reports overnight drone barrage targeting Kyiv", "Reuters: Russia captures two villages in eastern Donetsk", "AP: US approves additional $2.1B military aid package"] },
    ],
  },
  ISR: {
    name: "Israel", fullName: "State of Israel", flag: "🇮🇱",
    founded: "May 14, 1948", capital: "Jerusalem", population: "9.8M", region: "Middle East",
    leader: "Benjamin Netanyahu", leaderTitle: "Prime Minister",
    leaderPhoto: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Benjamin_Netanyahu_2023.jpg/400px-Benjamin_Netanyahu_2023.jpg",
    description: "A parliamentary democracy in the Middle East, founded following the 1948 Arab–Israeli War. Home to Jerusalem and a global leader in technology and defense innovation.",
    stats: [{ label: "GDP / Military", value: "$564B / $23.7B" }, { label: "Gov't", value: "Parliamentary Republic" }],
    conflicts: [
      { label: "Israel / US in the Middle East", dot: "#ef4444", alerts: ["Reuters: IDF strikes Iranian-backed militia positions in Syria", "AP: US carrier group positioned in Persian Gulf in support", "NYT: Iran vows retaliation for strikes on proxy forces"] },
      { label: "Israel–Palestine Conflict", dot: "#f87171", alerts: ["Al Jazeera: Gaza death toll surpasses 58,000", "AP: UNRWA fuel exhausted in northern Gaza hospitals", "NYT: Aid corridors remain sealed — famine conditions spreading"] },
    ],
  },
  IRN: {
    name: "Iran", fullName: "Islamic Republic of Iran", flag: "🇮🇷",
    founded: "April 1, 1979", capital: "Tehran", population: "88.6M", region: "Middle East",
    leader: "Masoud Pezeshkian", leaderTitle: "President",
    leaderPhoto: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Masoud_Pezeshkian_2024.jpg/400px-Masoud_Pezeshkian_2024.jpg",
    description: "A theocratic republic established after the 1979 Islamic Revolution. One of the most influential powers in the Middle East, with vast oil reserves and a long Persian cultural history.",
    stats: [{ label: "GDP / Military", value: "$367B / $10B" }, { label: "Gov't", value: "Islamic Republic" }],
    conflicts: [
      { label: "Israel / US in the Middle East", dot: "#ef4444", alerts: ["Reuters: Iran nuclear enrichment at 84% — IAEA monitoring limited", "AP: Iran threatens Strait of Hormuz closure amid US pressure", "NYT: Mojtaba Khamenei consolidates power after father's death in strikes"] },
    ],
  },
  UKR: {
    name: "Ukraine", fullName: "Ukraine", flag: "🇺🇦",
    founded: "August 24, 1991", capital: "Kyiv", population: "43.5M", region: "Eastern Europe",
    leader: "Volodymyr Zelensky", leaderTitle: "President",
    leaderPhoto: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Volodymyr_Zelensky_2019.jpg/400px-Volodymyr_Zelensky_2019.jpg",
    description: "The largest country entirely within Europe. At the center of Europe's largest ground war since World War II following Russia's 2022 full-scale invasion.",
    stats: [{ label: "GDP / Military", value: "$160B / $62B" }, { label: "Gov't", value: "Presidential Republic" }],
    conflicts: [
      { label: "Russia — Ukraine war", dot: "#ef4444", alerts: ["NYT: Ukraine reports overnight drone barrage targeting Kyiv", "Reuters: Russia captures two villages in eastern Donetsk", "AP: US approves additional $2.1B military aid package"] },
    ],
  },
  RUS: {
    name: "Russia", fullName: "Russian Federation", flag: "🇷🇺",
    founded: "June 12, 1990", capital: "Moscow", population: "144M", region: "Eurasia",
    leader: "Vladimir Putin", leaderTitle: "President",
    leaderPhoto: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Vladimir_Putin_%282023-11-24%29.jpg/400px-Vladimir_Putin_%282023-11-24%29.jpg",
    description: "The world's largest country by area. A permanent UN Security Council member and major nuclear power, Russia is conducting a full-scale war in Ukraine.",
    stats: [{ label: "GDP / Military", value: "$1.86T / $109B" }, { label: "Gov't", value: "Semi-Presidential" }],
    conflicts: [
      { label: "Russia — Ukraine war", dot: "#ef4444", alerts: ["Reuters: Russian forces advance in eastern Donetsk", "NYT: Russia launches mass Shahed drone attack overnight", "AP: Kremlin rules out ceasefire negotiations"] },
    ],
  },
  PSE: {
    name: "Palestine", fullName: "State of Palestine", flag: "🇵🇸",
    founded: "November 15, 1988", capital: "Ramallah (adm.)", population: "5.4M", region: "Middle East",
    leader: "Mahmoud Abbas", leaderTitle: "President, Palestinian Authority",
    leaderPhoto: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Mahmoud_Abbas_-_2008.jpg/400px-Mahmoud_Abbas_-_2008.jpg",
    description: "Recognized by over 140 UN states, comprising the West Bank and Gaza Strip. Gaza has been under Israeli military campaign since October 2023 with 58,000+ killed.",
    stats: [{ label: "GDP / Military", value: "$18B / N/A" }, { label: "Gov't", value: "Semi-Presidential" }],
    conflicts: [
      { label: "Israel–Palestine Conflict", dot: "#ef4444", alerts: ["Al Jazeera: Gaza death toll surpasses 58,000", "AP: UNRWA fuel exhausted — northern hospitals at collapse", "NYT: Famine conditions declared across northern Gaza"] },
    ],
  },
  CHN: {
    name: "China", fullName: "People's Republic of China", flag: "🇨🇳",
    founded: "October 1, 1949", capital: "Beijing", population: "1.41B", region: "East Asia",
    leader: "Xi Jinping", leaderTitle: "General Secretary / President",
    leaderPhoto: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Xi_Jinping_2019.jpg/400px-Xi_Jinping_2019.jpg",
    description: "The world's second largest economy and most populous country. Under Xi Jinping, China has accelerated military modernization with Taiwan reunification as a stated long-term objective.",
    stats: [{ label: "GDP / Military", value: "$18.5T / $225B" }, { label: "Gov't", value: "One-Party State" }],
    conflicts: [
      { label: "Taiwan strait crisis", dot: "#fbbf24", alerts: ["NYT: PLA conducts 47-aircraft crossing of Taiwan median line", "Reuters: US 7th Fleet on standby amid exercises", "AP: Taiwan raises readiness to Level 2"] },
    ],
  },
  TWN: {
    name: "Taiwan", fullName: "Republic of China (Taiwan)", flag: "🇹🇼",
    founded: "January 1, 1912", capital: "Taipei", population: "23.6M", region: "East Asia",
    leader: "Lai Ching-te", leaderTitle: "President",
    leaderPhoto: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Lai_Ching-te_2023.jpg/400px-Lai_Ching-te_2023.jpg",
    description: "A self-governing democratic island claimed by the PRC. Home to TSMC — manufacturer of 90% of the world's most advanced semiconductors — making it a critical US–China flashpoint.",
    stats: [{ label: "GDP / Military", value: "$756B / $19B" }, { label: "Gov't", value: "Semi-Presidential" }],
    conflicts: [
      { label: "Taiwan strait crisis", dot: "#fbbf24", alerts: ["NYT: PLA extends naval exercises into third consecutive day", "AP: Taiwan MND tracks 47 PLA aircraft crossing median line", "Reuters: US pledges continued arms supply to Taiwan"] },
    ],
  },
  LBN: {
    name: "Lebanon", fullName: "Lebanese Republic", flag: "🇱🇧",
    founded: "November 22, 1943", capital: "Beirut", population: "5.5M", region: "Middle East",
    leader: "Joseph Aoun", leaderTitle: "President",
    leaderPhoto: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Joseph_Aoun_2024.jpg/400px-Joseph_Aoun_2024.jpg",
    description: "A small Mediterranean country with a complex sectarian political system. A US-brokered ceasefire with Israel took hold in November 2024, though Hezbollah's long-term status remains unresolved.",
    stats: [{ label: "GDP / Military", value: "$23B / $400M" }, { label: "Gov't", value: "Confessional Republic" }],
    conflicts: [
      { label: "Israel / US in the Middle East", dot: "#f87171", alerts: ["Reuters: IDF maintains buffer zone in southern Lebanon despite ceasefire", "AP: Hezbollah rearms amid ongoing regional escalation", "Al Jazeera: Lebanon army deploying to south under ceasefire terms"] },
    ],
  },
  SDN: {
    name: "Sudan", fullName: "Republic of Sudan", flag: "🇸🇩",
    founded: "January 1, 1956", capital: "Port Sudan", population: "47M", region: "East Africa",
    leader: "Abdel Fattah al-Burhan", leaderTitle: "Chairman, Sovereignty Council",
    leaderPhoto: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Abdel_Fattah_al-Burhan.jpg/400px-Abdel_Fattah_al-Burhan.jpg",
    description: "Sub-Saharan Africa's third-largest country, gripped by a devastating civil war between the Sudanese Armed Forces and the Rapid Support Forces since April 2023.",
    stats: [{ label: "GDP / Military", value: "$34B / $1.2B" }, { label: "Gov't", value: "Military Council" }],
    conflicts: [
      { label: "Sudan civil war + genocide", dot: "#ef4444", alerts: ["AP: RSF accused of mass atrocities in Darfur — ICC opens investigation", "NYT: 10M+ displaced — world's largest displacement crisis", "Reuters: SAF and RSF both blocking humanitarian access to Khartoum"] },
    ],
  },
  MMR: {
    name: "Myanmar", fullName: "Republic of the Union of Myanmar", flag: "🇲🇲",
    founded: "January 4, 1948", capital: "Naypyidaw", population: "54M", region: "Southeast Asia",
    leader: "Min Aung Hlaing", leaderTitle: "Chairman, State Administration Council",
    leaderPhoto: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Min_Aung_Hlaing_2019.jpg/400px-Min_Aung_Hlaing_2019.jpg",
    description: "Since the February 2021 military coup, Myanmar has been engulfed in civil war. Ethnic armed groups and the People's Defence Force control large swaths of territory once held by the junta.",
    stats: [{ label: "GDP / Military", value: "$65B / $2.8B" }, { label: "Gov't", value: "Military Junta" }],
    conflicts: [
      { label: "Myanmar civil war", dot: "#ef4444", alerts: ["Reuters: Junta loses Lashio — resistance controls 60% of Shan State", "AP: Junta airstrikes on civilian markets in Sagaing Region", "NYT: 2.6M+ displaced — ASEAN ceasefire efforts stalled"] },
    ],
  },
};

interface Props {
  countryCode: string;
  onClose: () => void;
  onSourceTap?: (source: string) => void;
}

export default function CountryHome({ countryCode, onClose, onSourceTap }: Props) {
  const data = DATA[countryCode];
  if (!data) return null;

  const [fullName,    setFullName]    = useState(data.fullName);
  const [description, setDescription] = useState(data.description);
  const [founded,     setFounded]     = useState(data.founded);
  const [capital,     setCapital]     = useState(data.capital);
  const [population,  setPopulation]  = useState(data.population);
  const [region,      setRegion]      = useState(data.region);
  const [stats,       setStats]       = useState(data.stats);

  const StatTile = ({ label, value, onLabelChange, onValueChange }: { label: string; value: string; onLabelChange: (v: string) => void; onValueChange: (v: string) => void }) => (
    <div style={{
      padding: "9px 11px", borderRadius: 10,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.09)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
    }}>
      <p style={{ margin: 0, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.14em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 4 }}>
        <EText value={label} onChange={onLabelChange} style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.14em", color: "rgba(255,255,255,0.28)" }} />
      </p>
      <p style={{ margin: 0, fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.78)", fontWeight: 500 }}>
        <EText value={value} onChange={onValueChange} style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.78)", fontWeight: 500 }} />
      </p>
    </div>
  );

  return (
    <div
      className="absolute left-6 z-20 w-[480px]"
      style={{ top: 72, bottom: 24, display: "flex", flexDirection: "column" }}
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

        {/* Header — no flag, no border */}
        <div style={{ flexShrink: 0, padding: "14px 18px 4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.92)", letterSpacing: "0.01em" }}>
              <EText value={fullName} onChange={setFullName} style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.92)", letterSpacing: "0.01em" }} />
            </h2>
            <button
              onClick={onClose}
              style={{ color: "rgba(255,255,255,0.15)", fontSize: 18, background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: 0, flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.15)")}>×</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>

          {/* ACTIVE CONFLICTS — AtlasHQ section-label style */}
          {data.conflicts && (
            <div>
              <div style={{ padding: "14px 18px 6px" }}>
                <span style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", fontWeight: 500 }}>active conflicts</span>
              </div>
              <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                {data.conflicts.map((c) => (
                  <ConflictCard key={c.label} label={c.label} dot={c.dot} alerts={c.alerts} onSourceTap={onSourceTap} />
                ))}
              </div>
            </div>
          )}

          {/* KEY FACTS */}
          <div style={{ padding: "20px 18px 6px" }}>
            <span style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", fontWeight: 500 }}>key facts</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, margin: "0 14px" }}>
            <StatTile label="Founded"    value={founded}    onLabelChange={() => {}} onValueChange={setFounded} />
            <StatTile label="Capital"    value={capital}    onLabelChange={() => {}} onValueChange={setCapital} />
            <StatTile label="Population" value={population} onLabelChange={() => {}} onValueChange={setPopulation} />
            <StatTile label="Region"     value={region}     onLabelChange={() => {}} onValueChange={setRegion} />
          </div>

          {/* OVERVIEW */}
          <div style={{ padding: "20px 18px 6px" }}>
            <span style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", fontWeight: 500 }}>overview</span>
          </div>
          <div style={{ margin: "0 14px", padding: "11px 13px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
            <EText value={description} onChange={setDescription} as="div" style={{ fontSize: 12, color: "rgba(255,255,255,0.58)", lineHeight: 1.65 }} />
          </div>

          {/* ECONOMY */}
          <div style={{ padding: "20px 18px 6px" }}>
            <span style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", fontWeight: 500 }}>economy</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, margin: "0 14px 20px" }}>
            {stats.map((s, i) => (
              <StatTile
                key={i}
                label={s.label}
                value={s.value}
                onLabelChange={v => setStats(prev => prev.map((st, j) => j === i ? { ...st, label: v } : st))}
                onValueChange={v => setStats(prev => prev.map((st, j) => j === i ? { ...st, value: v } : st))}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
