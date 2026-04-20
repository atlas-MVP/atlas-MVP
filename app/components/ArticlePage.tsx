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
  photo: "/chuck-schumer.jpg",
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
  const [hoveredSenator, setHoveredSenator] = useState<Senator | null>(null);
  const [senateExpanded, setSenateExpanded] = useState(false);

  const senators: Senator[] = [
    { name: "Bernie Sanders", party: "I" as const, state: "VT", vote: "Aye" as const },
    { name: "Angus King", party: "I" as const, state: "ME", vote: "Aye" as const },
    { name: "Elizabeth Warren", party: "D" as const, state: "MA", vote: "Aye" as const },
    { name: "Jeff Merkley", party: "D" as const, state: "OR", vote: "Aye" as const },
    { name: "Chris Van Hollen", party: "D" as const, state: "MD", vote: "Aye" as const },
    { name: "Peter Welch", party: "D" as const, state: "VT", vote: "Aye" as const },
    { name: "Ed Markey", party: "D" as const, state: "MA", vote: "Aye" as const },
    { name: "Dick Durbin", party: "D" as const, state: "IL", vote: "Aye" as const },
    { name: "Mazie Hirono", party: "D" as const, state: "HI", vote: "Aye" as const },
    { name: "Tammy Baldwin", party: "D" as const, state: "WI", vote: "Aye" as const },
    { name: "Cory Booker", party: "D" as const, state: "NJ", vote: "Aye" as const },
    { name: "Sherrod Brown", party: "D" as const, state: "OH", vote: "Aye" as const },
    { name: "Ben Ray Luján", party: "D" as const, state: "NM", vote: "Aye" as const },
    { name: "Alex Padilla", party: "D" as const, state: "CA", vote: "Aye" as const },
    { name: "Tina Smith", party: "D" as const, state: "MN", vote: "Aye" as const },
    { name: "Brian Schatz", party: "D" as const, state: "HI", vote: "Aye" as const },
    { name: "Ron Wyden", party: "D" as const, state: "OR", vote: "Aye" as const },
    { name: "Raphael Warnock", party: "D" as const, state: "GA", vote: "Aye" as const },
    { name: "Jon Ossoff", party: "D" as const, state: "GA", vote: "Aye" as const },
    { name: "Amy Klobuchar", party: "D" as const, state: "MN", vote: "Aye" as const },
    { name: "Kirsten Gillibrand", party: "D" as const, state: "NY", vote: "Aye" as const },
    { name: "Martin Heinrich", party: "D" as const, state: "NM", vote: "Aye" as const },
    { name: "Debbie Stabenow", party: "D" as const, state: "MI", vote: "Aye" as const },
    { name: "Gary Peters", party: "D" as const, state: "MI", vote: "Aye" as const },
    { name: "Tammy Duckworth", party: "D" as const, state: "IL", vote: "Aye" as const },
    { name: "Patty Murray", party: "D" as const, state: "WA", vote: "Aye" as const },
    { name: "Maria Cantwell", party: "D" as const, state: "WA", vote: "Aye" as const },
    { name: "Mark Warner", party: "D" as const, state: "VA", vote: "Aye" as const },
    { name: "Tim Kaine", party: "D" as const, state: "VA", vote: "Aye" as const },
    { name: "Bob Casey", party: "D" as const, state: "PA", vote: "Aye" as const },
    { name: "Jacky Rosen", party: "D" as const, state: "NV", vote: "Aye" as const },
    { name: "Catherine Cortez Masto", party: "D" as const, state: "NV", vote: "Aye" as const },
    { name: "Mark Kelly", party: "D" as const, state: "AZ", vote: "Aye" as const },
    { name: "Ruben Gallego", party: "D" as const, state: "AZ", vote: "Aye" as const },
    { name: "Adam Schiff", party: "D" as const, state: "CA", vote: "Aye" as const },
    { name: "Andy Kim", party: "D" as const, state: "NJ", vote: "Aye" as const },
    { name: SCHUMER_DATA.name, party: SCHUMER_DATA.party, state: SCHUMER_DATA.state, vote: SCHUMER_DATA.vote },
    { name: "John Hickenlooper", party: "D" as const, state: "CO", vote: "Aye" as const },
    { name: "Michael Bennet", party: "D" as const, state: "CO", vote: "Aye" as const },
    { name: "Angela Alsobrooks", party: "D" as const, state: "MD", vote: "Aye" as const },
    ...Array.from({ length: 50 }, (_, i) => ({ name: `R Senator ${i + 1}`, party: "R" as const, state: "XX", vote: "No" as const })),
    { name: "John Fetterman", party: "D" as const, state: "PA", vote: "No" as const },
    { name: "Joe Manchin", party: "D" as const, state: "WV", vote: "No" as const },
    { name: "Jeanne Shaheen", party: "D" as const, state: "NH", vote: "No" as const },
    { name: "Maggie Hassan", party: "D" as const, state: "NH", vote: "No" as const },
    { name: "Chris Coons", party: "D" as const, state: "DE", vote: "No" as const },
    { name: "Tom Carper", party: "D" as const, state: "DE", vote: "No" as const },
    { name: "Elissa Slotkin", party: "D" as const, state: "MI", vote: "No" as const },
    { name: "Jon Tester", party: "D" as const, state: "MT", vote: "No" as const },
    { name: "Kyrsten Sinema", party: "I" as const, state: "AZ", vote: "No" as const },
  ];

  return (
    <div style={{
      position: "fixed",
      inset: "10px",
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
    }}>
      <div style={{
        width: "100%",
        height: "100%",
        background: "rgba(4,6,18,0.85)",
        backdropFilter: "blur(40px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        pointerEvents: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.38)",
      }}>
        <button
          onClick={() => router.push("/")}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 6,
            padding: "4px 10px",
            color: "rgba(255,255,255,0.7)",
            fontSize: 11,
            fontFamily: "monospace",
            cursor: "pointer",
            zIndex: 10,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
        >
          Back
        </button>

        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "60px 40px 40px",
          color: "white",
        }}>
          <div style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}>
            <h1 style={{
              fontSize: 38,
              fontWeight: 700,
              lineHeight: 1.2,
              margin: 0,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.02em",
            }}>
              {headline}
            </h1>

            <div style={{
              fontSize: 12,
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.42)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>
              {date}
            </div>

            <div style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.82)",
            }}>
              {description.split("\n\n").map((paragraph, i) => (
                <p key={i} style={{ margin: "0 0 24px 0" }}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 16,
            }}>
              <div
                onMouseLeave={() => setHoveredSenator(null)}
                onClick={() => setSenateExpanded(true)}
                style={{ cursor: "pointer" }}
              >
                <SenateVoteVisualization
                  title="SENATE"
                  senators={senators}
                  onSenatorHover={setHoveredSenator}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {hoveredSenator && hoveredSenator.name === SCHUMER_DATA.name && !senateExpanded && (
        <div style={{
          position: "fixed",
          right: 30,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 100,
          pointerEvents: "none",
        }}>
          <div style={{
            background: "rgba(4,6,18,0.95)",
            backdropFilter: "blur(30px)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.15)",
            padding: "28px",
            width: 420,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}>
            <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
              <div style={{
                width: 100,
                height: 100,
                borderRadius: 12,
                overflow: "hidden",
                background: "rgba(255,255,255,0.05)",
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
                />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.95)",
                  marginBottom: 8,
                }}>
                  {SCHUMER_DATA.name}
                </div>

                <div style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.62)",
                  marginBottom: 6,
                }}>
                  Democrat • {SCHUMER_DATA.state}
                </div>

                <div style={{
                  fontSize: 13,
                  color: "rgba(100,200,100,0.85)",
                  fontFamily: "monospace",
                }}>
                  Vote: {SCHUMER_DATA.vote}
                </div>
              </div>
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontSize: 13,
              color: "rgba(255,255,255,0.68)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 18,
            }}>
              <div>Age: {SCHUMER_DATA.age}</div>
              <div>In office: {SCHUMER_DATA.yearsInOffice} years</div>
              <div>Up for re-election: {SCHUMER_DATA.nextElection}</div>
            </div>
          </div>
        </div>
      )}

      {senateExpanded && (
        <div
          onClick={() => setSenateExpanded(false)}
          style={{
            position: "fixed",
            inset: "60px",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: "scale(1.4)",
            }}
          >
            <SenateVoteVisualization
              title="SENATE"
              senators={senators}
              hideTooltip={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
