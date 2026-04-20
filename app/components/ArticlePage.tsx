"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SenateVoteVisualization from "./SenateVoteVisualization";
import { Senator } from "./SenateVoteVisualization";

interface ArticlePageProps {
  headline: string;
  description: string;
  heroImage: string;
  date: string;
  billId: string;
}

const SCHUMER_DATA = {
  name: "Chuck Schumer",
  party: "D" as const,
  state: "NY",
  vote: "Aye" as const,
  photo: "/senators/chuck-schumer.jpg",
  age: 73,
  yearsInOffice: 25,
  nextElection: 2028,
  officialUrl: "https://www.schumer.senate.gov",
};

export default function ArticlePage({
  headline,
  description,
  heroImage,
  date,
  billId,
}: ArticlePageProps) {
  const router = useRouter();
  const [senatePopupOpen, setSenatePopupOpen] = useState(false);
  const [selectedSenator, setSelectedSenator] = useState<Senator | null>(null);

  const senators: Senator[] = [
    ...Array.from({ length: 38 }, (_, i) => ({
      name: `Senator D${i + 1}`,
      party: "D" as const,
      state: "XX",
      vote: "Aye" as const,
    })),
    ...Array.from({ length: 2 }, (_, i) => ({
      name: `Senator I${i + 1}`,
      party: "I" as const,
      state: "XX",
      vote: "Aye" as const,
    })),
    ...Array.from({ length: 51 }, (_, i) => ({
      name: `Senator R${i + 1}`,
      party: "R" as const,
      state: "XX",
      vote: "No" as const,
    })),
    ...Array.from({ length: 7 }, (_, i) => ({
      name: `Senator D${i + 39}`,
      party: "D" as const,
      state: "XX",
      vote: "No" as const,
    })),
    {
      name: SCHUMER_DATA.name,
      party: SCHUMER_DATA.party,
      state: SCHUMER_DATA.state,
      vote: SCHUMER_DATA.vote,
    },
  ];

  return (
    <div
      onClick={(e) => {
        if (senatePopupOpen && (e.target as HTMLElement).id === "senate-backdrop") {
          setSenatePopupOpen(false);
        }
        if (selectedSenator) {
          setSelectedSenator(null);
        }
      }}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a1929 0%, #152535 25%, #1a2f42 50%, #152535 75%, #0d1b2a 100%)",
        backgroundSize: "400% 400%",
        animation: "glossyShift 20s ease infinite",
        color: "white",
        padding: "60px 20px 80px",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes glossyShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <button
        onClick={() => router.push("/")}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 8,
          padding: "8px 16px",
          color: "white",
          fontSize: 12,
          fontFamily: "monospace",
          cursor: "pointer",
          backdropFilter: "blur(10px)",
        }}
      >
        ← Back to Atlas
      </button>

      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 48,
      }}>
        <div style={{
          width: "100%",
          height: 400,
          borderRadius: 16,
          overflow: "hidden",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <img
            src={heroImage}
            alt="Bernie Sanders"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        <h1 style={{
          fontSize: 42,
          fontWeight: 700,
          lineHeight: 1.2,
          margin: 0,
          color: "rgba(255,255,255,0.95)",
          letterSpacing: "-0.02em",
        }}>
          {headline}
        </h1>

        <div style={{
          fontSize: 13,
          fontFamily: "monospace",
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.05em",
        }}>
          {date}
        </div>

        <div style={{
          fontSize: 18,
          lineHeight: 1.8,
          color: "rgba(255,255,255,0.85)",
          wordSpacing: "0.3em",
        }}>
          {description.split("\n\n").map((paragraph, i) => (
            <p key={i} style={{ margin: "0 0 28px 0" }}>
              {paragraph}
            </p>
          ))}
        </div>

        <div
          onClick={() => setSenatePopupOpen(true)}
          style={{
            display: "flex",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <SenateVoteVisualization
            title="SENATE"
            senators={senators}
          />
        </div>
      </div>

      {senatePopupOpen && (
        <div
          id="senate-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "rgba(10,15,30,0.95)",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "40px",
              maxWidth: 900,
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SenateVoteVisualization
              title="SENATE"
              senators={senators}
            />
          </div>
        </div>
      )}

      {selectedSenator && selectedSenator.name === SCHUMER_DATA.name && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={() => setSelectedSenator(null)}
        >
          <div
            style={{
              background: "rgba(15,20,35,0.98)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "32px",
              width: 480,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", gap: 24 }}>
              <div style={{
                width: 120,
                height: 120,
                borderRadius: 12,
                overflow: "hidden",
                background: "rgba(255,255,255,0.08)",
                flexShrink: 0,
              }}>
                <img
                  src={SCHUMER_DATA.photo}
                  alt={SCHUMER_DATA.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <a
                  href={SCHUMER_DATA.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "rgba(96,165,250,0.95)",
                    textDecoration: "none",
                    display: "block",
                    marginBottom: 12,
                  }}
                >
                  {SCHUMER_DATA.name}
                </a>

                <div style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.65)",
                  marginBottom: 4,
                }}>
                  Democrat • {SCHUMER_DATA.state}
                </div>

                <div style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.55)",
                  marginBottom: 24,
                }}>
                  Vote: {SCHUMER_DATA.vote}
                </div>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.7)",
                }}>
                  <div>Age: {SCHUMER_DATA.age}</div>
                  <div>In office: {SCHUMER_DATA.yearsInOffice} years</div>
                  <div>Up for re-election: {SCHUMER_DATA.nextElection}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
