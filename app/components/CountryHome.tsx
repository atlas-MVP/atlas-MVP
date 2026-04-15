"use client";

import { useEffect, useRef, useState } from "react";

function extractAlertSource(line: string): string {
  return line.split(":")[0].trim();
}

function ConflictCard({ label, dot, alerts, onSourceTap }: { label: string; dot: string; alerts?: string[]; onSourceTap?: (source: string) => void }) {
  const [hovered, setHovered]       = useState(false);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const cancelRef = useRef(false);

  useEffect(() => {
    if (!hovered || !alerts?.length) {
      cancelRef.current = true;
      setTypedLines([]);
      setCurrentLine("");
      return;
    }
    cancelRef.current = false;
    let lineIdx = 0;
    let charIdx = 0;

    const tick = () => {
      if (cancelRef.current) return;
      if (lineIdx >= alerts.length) return;
      const target = alerts[lineIdx];
      if (charIdx <= target.length) {
        setCurrentLine(target.slice(0, charIdx));
        charIdx++;
        setTimeout(tick, 22);
      } else {
        setTypedLines(prev => [...prev, target]);
        setCurrentLine("");
        lineIdx++;
        charIdx = 0;
        if (lineIdx < alerts.length) setTimeout(tick, 380);
      }
    };

    setTimeout(tick, 80);
    return () => { cancelRef.current = true; };
  }, [hovered]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: hovered ? "12px 12px" : "10px 12px",
        borderRadius: 8,
        background: hovered ? "rgba(239,68,68,0.09)" : "rgba(239,68,68,0.04)",
        border: "1px solid rgba(239,68,68,0.12)",
        transition: "background 0.2s, padding 0.2s",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          className="dot-pulse"
          style={{ width: 8, height: 8, borderRadius: "50%", background: dot, boxShadow: `0 0 8px ${dot}`, flexShrink: 0 }}
        />
        <span style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em", color: "rgba(255,255,255,0.88)", fontWeight: 700 }}>{label}</span>
      </div>

      {hovered && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5, paddingLeft: 18 }}>
          {typedLines.map((line, i) => (
            <div key={i} onClick={() => onSourceTap?.(extractAlertSource(line))} style={{
              fontSize: 10, color: "rgba(255,255,255,0.60)", lineHeight: 1.5,
              padding: "4px 8px", borderRadius: 5,
              background: "rgba(255,255,255,0.04)",
              borderLeft: `2px solid ${dot}`,
              cursor: "pointer",
            }}>{line}</div>
          ))}
          {currentLine && (
            <div onClick={() => onSourceTap?.(extractAlertSource(currentLine))} style={{
              fontSize: 10, color: "rgba(255,255,255,0.60)", lineHeight: 1.5,
              padding: "4px 8px", borderRadius: 5,
              background: "rgba(255,255,255,0.04)",
              borderLeft: `2px solid ${dot}`,
              cursor: "pointer",
            }}>
              {currentLine}<span style={{ opacity: 0.5, animation: "none" }}>▌</span>
            </div>
          )}
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
      { label: "US · Israel · Iran war", dot: "#ef4444", alerts: ["Reuters: US 5th Fleet on heightened alert in Persian Gulf", "AP: Iran threatens Strait of Hormuz closure amid escalation", "NYT: White House convenes NSC emergency session"] },
      { label: "Israel · Lebanon conflict", dot: "#f87171", alerts: ["AP: IDF artillery active along southern Lebanon border", "Al Jazeera: Hezbollah rockets fired into northern Galilee", "Reuters: Lebanon ceasefire talks collapse in Doha"] },
      { label: "Russia · Ukraine war", dot: "#fb923c", alerts: ["NYT: Ukraine reports overnight drone barrage targeting Kyiv", "Reuters: Russia captures two villages in eastern Donetsk", "AP: US approves additional $2.1B military aid package"] },
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
      { label: "US · Israel · Iran war", dot: "#ef4444", alerts: ["Reuters: IDF strikes Iranian-backed militia positions in Syria", "AP: US carrier group positioned in Persian Gulf in support", "NYT: Iran vows retaliation for strikes on proxy forces"] },
      { label: "Israel · Lebanon conflict", dot: "#f87171", alerts: ["AP: IDF artillery active along southern Lebanon border", "Al Jazeera: Hezbollah fires rockets into northern Galilee", "Reuters: Beirut airport suspended operations"] },
      { label: "Gaza genocide", dot: "#fb923c", alerts: ["Al Jazeera: Gaza death toll surpasses 58,000", "AP: UNRWA fuel exhausted in northern Gaza hospitals", "NYT: Aid corridors remain sealed — famine conditions spreading"] },
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
      { label: "US · Israel · Iran war", dot: "#ef4444", alerts: ["Reuters: Iran nuclear enrichment at 84% — IAEA monitoring limited", "AP: Iran threatens Strait of Hormuz closure amid US pressure", "NYT: Iranian proxies targeted in Syria by IDF strikes"] },
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
      { label: "Russia · Ukraine war", dot: "#ef4444", alerts: ["NYT: Ukraine reports overnight drone barrage targeting Kyiv", "Reuters: Russia captures two villages in eastern Donetsk", "AP: US approves additional $2.1B military aid package"] },
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
      { label: "Russia · Ukraine war", dot: "#ef4444", alerts: ["Reuters: Russian forces advance in eastern Donetsk", "NYT: Russia launches mass Shahed drone attack overnight", "AP: Kremlin rules out ceasefire negotiations"] },
    ],
  },
  PSE: {
    name: "Palestine", fullName: "State of Palestine", flag: "🇵🇸",
    founded: "November 15, 1988", capital: "Ramallah (adm.)", population: "5.4M", region: "Middle East",
    leader: "Mahmoud Abbas", leaderTitle: "President, Palestinian Authority",
    leaderPhoto: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Mahmoud_Abbas_-_2008.jpg/400px-Mahmoud_Abbas_-_2008.jpg",
    description: "Recognized by over 140 UN states, comprising the West Bank and Gaza Strip. Gaza has been under Israeli military campaign since October 2023.",
    stats: [{ label: "GDP / Military", value: "$18B / N/A" }, { label: "Gov't", value: "Semi-Presidential" }],
    conflicts: [
      { label: "Gaza genocide", dot: "#ef4444", alerts: ["Al Jazeera: Gaza death toll surpasses 58,000", "AP: UNRWA fuel exhausted — northern hospitals at collapse", "NYT: Famine conditions declared across northern Gaza"] },
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
    description: "A small Mediterranean country with a complex sectarian political system. Hezbollah operates as a state-within-a-state and is the primary actor in active border exchanges with Israel.",
    stats: [{ label: "GDP / Military", value: "$23B / $400M" }, { label: "Gov't", value: "Confessional Republic" }],
    conflicts: [
      { label: "Israel · Lebanon conflict", dot: "#ef4444", alerts: ["AP: IDF ground forces reported crossing the Blue Line", "Al Jazeera: Hezbollah drone swarm intercepted over Haifa", "Reuters: Beirut airport suspends all operations"] },
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

  return (
    <div
      className="absolute left-6 z-20 w-[420px]"
      style={{ top: 72, bottom: 24, display: "flex", flexDirection: "column" }}
    >
      <div style={{
        background: "rgba(4,6,16,0.95)",
        backdropFilter: "blur(28px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        boxShadow: "0 0 50px rgba(0,0,0,0.8)",
        display: "flex", flexDirection: "column",
        height: "100%", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{ flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "12px 16px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>{data.flag}</span>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "0.01em" }}>
                {data.fullName}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{ color: "rgba(255,255,255,0.12)", fontSize: 20, background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.12)")}>×</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>

          {/* Active conflicts — shown first */}
          {data.conflicts && (
            <div style={{ margin: "14px 14px 0" }}>
              <div style={{ fontSize: 8, fontFamily: "monospace", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>ACTIVE CONFLICTS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {data.conflicts.map((c) => (
                  <ConflictCard key={c.label} label={c.label} dot={c.dot} alerts={c.alerts} onSourceTap={onSourceTap} />
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          {data.conflicts && (
            <div style={{ margin: "16px 14px 0", height: 1, background: "rgba(255,255,255,0.05)" }} />
          )}

          {/* Leader card — below conflicts */}
          <div style={{ margin: "14px 14px 0", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ position: "relative", height: 220 }}>
              <img
                src={data.leaderPhoto}
                alt={data.leader}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                onError={e => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = "none";
                  (el.parentElement as HTMLElement).style.background = "linear-gradient(160deg, rgba(30,40,70,1), rgba(10,14,30,1))";
                }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(4,6,16,1) 0%, rgba(4,6,16,0.4) 50%, transparent 100%)" }} />
              <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.95)" }}>{data.leader}</p>
                <p style={{ margin: "2px 0 0", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}>{data.leaderTitle}</p>
              </div>
            </div>
          </div>

          {/* Key facts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "12px 14px 0" }}>
            {[
              { label: "Founded", value: data.founded },
              { label: "Capital", value: data.capital },
              { label: "Population", value: data.population },
              { label: "Region", value: data.region },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: "8px 10px", borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 4px 14px rgba(0,0,0,0.45)",
              }}>
                <p style={{ margin: 0, fontSize: 8, fontFamily: "monospace", letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 3 }}>{label}</p>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ margin: "12px 14px 0", padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{data.description}</p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "12px 14px 16px" }}>
            {data.stats.map(({ label, value }) => (
              <div key={label} style={{
                padding: "8px 10px", borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 4px 14px rgba(0,0,0,0.45)",
              }}>
                <p style={{ margin: 0, fontSize: 8, fontFamily: "monospace", letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 3 }}>{label}</p>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>{value}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
