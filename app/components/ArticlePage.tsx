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
  vote: "No" as const,
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
  const [lockedSenator, setLockedSenator] = useState<Senator | null>(null);

  const senators: Senator[] = [
    // AYE voters (40 total: 2 Independents + 38 Democrats)
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
    { name: "John Hickenlooper", party: "D" as const, state: "CO", vote: "Aye" as const },
    { name: "Michael Bennet", party: "D" as const, state: "CO", vote: "Aye" as const },
    { name: "Angela Alsobrooks", party: "D" as const, state: "MD", vote: "Aye" as const },

    // NO voters - Democrats who crossed over (8)
    { name: SCHUMER_DATA.name, party: SCHUMER_DATA.party, state: SCHUMER_DATA.state, vote: SCHUMER_DATA.vote },
    { name: "John Fetterman", party: "D" as const, state: "PA", vote: "No" as const },
    { name: "Joe Manchin", party: "D" as const, state: "WV", vote: "No" as const },
    { name: "Jeanne Shaheen", party: "D" as const, state: "NH", vote: "No" as const },
    { name: "Maggie Hassan", party: "D" as const, state: "NH", vote: "No" as const },
    { name: "Chris Coons", party: "D" as const, state: "DE", vote: "No" as const },
    { name: "Tom Carper", party: "D" as const, state: "DE", vote: "No" as const },
    { name: "Elissa Slotkin", party: "D" as const, state: "MI", vote: "No" as const },

    // NO voters - Independent
    { name: "Kyrsten Sinema", party: "I" as const, state: "AZ", vote: "No" as const },

    // NO voters - Republicans (51)
    { name: "Mitch McConnell", party: "R" as const, state: "KY", vote: "No" as const },
    { name: "John Cornyn", party: "R" as const, state: "TX", vote: "No" as const },
    { name: "Ted Cruz", party: "R" as const, state: "TX", vote: "No" as const },
    { name: "Marco Rubio", party: "R" as const, state: "FL", vote: "No" as const },
    { name: "Rick Scott", party: "R" as const, state: "FL", vote: "No" as const },
    { name: "Lindsey Graham", party: "R" as const, state: "SC", vote: "No" as const },
    { name: "Tim Scott", party: "R" as const, state: "SC", vote: "No" as const },
    { name: "Thom Tillis", party: "R" as const, state: "NC", vote: "No" as const },
    { name: "Josh Hawley", party: "R" as const, state: "MO", vote: "No" as const },
    { name: "Roger Marshall", party: "R" as const, state: "KS", vote: "No" as const },
    { name: "John Thune", party: "R" as const, state: "SD", vote: "No" as const },
    { name: "Mike Rounds", party: "R" as const, state: "SD", vote: "No" as const },
    { name: "John Barrasso", party: "R" as const, state: "WY", vote: "No" as const },
    { name: "Cynthia Lummis", party: "R" as const, state: "WY", vote: "No" as const },
    { name: "Steve Daines", party: "R" as const, state: "MT", vote: "No" as const },
    { name: "Mike Crapo", party: "R" as const, state: "ID", vote: "No" as const },
    { name: "Jim Risch", party: "R" as const, state: "ID", vote: "No" as const },
    { name: "Dan Sullivan", party: "R" as const, state: "AK", vote: "No" as const },
    { name: "Lisa Murkowski", party: "R" as const, state: "AK", vote: "No" as const },
    { name: "Chuck Grassley", party: "R" as const, state: "IA", vote: "No" as const },
    { name: "Joni Ernst", party: "R" as const, state: "IA", vote: "No" as const },
    { name: "Deb Fischer", party: "R" as const, state: "NE", vote: "No" as const },
    { name: "Pete Ricketts", party: "R" as const, state: "NE", vote: "No" as const },
    { name: "Jerry Moran", party: "R" as const, state: "KS", vote: "No" as const },
    { name: "James Lankford", party: "R" as const, state: "OK", vote: "No" as const },
    { name: "Markwayne Mullin", party: "R" as const, state: "OK", vote: "No" as const },
    { name: "John Kennedy", party: "R" as const, state: "LA", vote: "No" as const },
    { name: "Bill Cassidy", party: "R" as const, state: "LA", vote: "No" as const },
    { name: "Cindy Hyde-Smith", party: "R" as const, state: "MS", vote: "No" as const },
    { name: "Roger Wicker", party: "R" as const, state: "MS", vote: "No" as const },
    { name: "Tommy Tuberville", party: "R" as const, state: "AL", vote: "No" as const },
    { name: "Katie Britt", party: "R" as const, state: "AL", vote: "No" as const },
    { name: "Marsha Blackburn", party: "R" as const, state: "TN", vote: "No" as const },
    { name: "Bill Hagerty", party: "R" as const, state: "TN", vote: "No" as const },
    { name: "Todd Young", party: "R" as const, state: "IN", vote: "No" as const },
    { name: "Mike Braun", party: "R" as const, state: "IN", vote: "No" as const },
    { name: "J.D. Vance", party: "R" as const, state: "OH", vote: "No" as const },
    { name: "Ron Johnson", party: "R" as const, state: "WI", vote: "No" as const },
    { name: "Eric Schmitt", party: "R" as const, state: "MO", vote: "No" as const },
    { name: "Ted Budd", party: "R" as const, state: "NC", vote: "No" as const },
    { name: "Shelley Moore Capito", party: "R" as const, state: "WV", vote: "No" as const },
    { name: "Susan Collins", party: "R" as const, state: "ME", vote: "No" as const },
    { name: "Rand Paul", party: "R" as const, state: "KY", vote: "No" as const },
    { name: "Mike Lee", party: "R" as const, state: "UT", vote: "No" as const },
    { name: "Mitt Romney", party: "R" as const, state: "UT", vote: "No" as const },
    { name: "Kevin Cramer", party: "R" as const, state: "ND", vote: "No" as const },
    { name: "John Hoeven", party: "R" as const, state: "ND", vote: "No" as const },
    { name: "James Risch", party: "R" as const, state: "ID", vote: "No" as const },
    { name: "Markwayne Mullin", party: "R" as const, state: "OK", vote: "No" as const },
    { name: "Lindsey Graham", party: "R" as const, state: "SC", vote: "No" as const },
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
                onMouseEnter={() => setSenateExpanded(true)}
                onMouseLeave={() => setHoveredSenator(null)}
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
          onMouseLeave={() => { if (!lockedSenator) setSenateExpanded(false); }}
          onClick={(e) => {
            if ((e.target as HTMLElement).id === "senate-backdrop") {
              setSenateExpanded(false);
              setLockedSenator(null);
            }
          }}
          id="senate-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backdropFilter: "blur(20px)",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 0,
            pointerEvents: "auto",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 40,
              width: "100%",
              maxWidth: 1400,
              paddingBottom: 40,
            }}
          >
            {/* Aye voters - left side */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "flex-end",
              opacity: hoveredSenator?.vote === "Aye" || !hoveredSenator ? 1 : 0.3,
              transition: "opacity 0.2s",
            }}>
              {senators.filter(s => s.vote === "Aye").slice(0, 5).map(senator => (
                <div
                  key={senator.name}
                  onMouseEnter={() => setHoveredSenator(senator)}
                  onClick={() => setLockedSenator(senator)}
                  style={{
                    background: "rgba(4,6,18,0.95)",
                    backdropFilter: "blur(30px)",
                    borderRadius: 12,
                    border: `1px solid rgba(96,165,250,${hoveredSenator?.name === senator.name || lockedSenator?.name === senator.name ? 0.8 : 0.3})`,
                    padding: "14px 18px",
                    minWidth: 240,
                    cursor: "pointer",
                    transform: hoveredSenator?.name === senator.name || lockedSenator?.name === senator.name ? "scale(1.02)" : "scale(1)",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.95)",
                    marginBottom: 4,
                  }}>
                    {senator.name}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.55)",
                  }}>
                    {senator.party === "R" ? "Republican" : senator.party === "D" ? "Democrat" : "Independent"} • {senator.state}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: "rgba(100,200,100,0.85)",
                    marginTop: 6,
                    fontFamily: "monospace",
                  }}>
                    Vote: Aye
                  </div>
                </div>
              ))}
            </div>

            {/* Senate visualization - center */}
            <div style={{ transform: "scale(1.4)" }}>
              <SenateVoteVisualization
                title="SENATE"
                senators={senators}
                hideTooltip={true}
              />
            </div>

            {/* No voters - right side */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "flex-start",
              opacity: hoveredSenator?.vote === "No" || !hoveredSenator ? 1 : 0.3,
              transition: "opacity 0.2s",
            }}>
              {senators.filter(s => s.vote === "No" && s.party === "D").map(senator => (
                <div
                  key={senator.name}
                  onMouseEnter={() => setHoveredSenator(senator)}
                  onClick={() => setLockedSenator(senator)}
                  style={{
                    background: "rgba(4,6,18,0.95)",
                    backdropFilter: "blur(30px)",
                    borderRadius: 12,
                    border: `1px solid rgba(239,68,68,${hoveredSenator?.name === senator.name || lockedSenator?.name === senator.name ? 0.8 : 0.3})`,
                    padding: "14px 18px",
                    minWidth: 240,
                    display: "flex",
                    gap: senator.name === SCHUMER_DATA.name ? 14 : 0,
                    cursor: "pointer",
                    transform: hoveredSenator?.name === senator.name || lockedSenator?.name === senator.name ? "scale(1.02)" : "scale(1)",
                    transition: "all 0.2s",
                  }}
                >
                  {senator.name === SCHUMER_DATA.name && (
                    <div style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
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
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.95)",
                      marginBottom: 4,
                    }}>
                      {senator.name}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.55)",
                    }}>
                      Democrat • {senator.state}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: "rgba(239,68,68,0.85)",
                      marginTop: 6,
                      fontFamily: "monospace",
                    }}>
                      Vote: No
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
