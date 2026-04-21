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

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming",
};

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
  const [photoEnlarged, setPhotoEnlarged] = useState(false);

  const senators: Senator[] = [
    // AYE voters — sorted most to least prominent (most famous → innermost ring)
    { name: "Bernie Sanders",          party: "I" as const, state: "VT", vote: "Aye" as const }, // bill introducer
    { name: "Elizabeth Warren",        party: "D" as const, state: "MA", vote: "Aye" as const },
    { name: "Amy Klobuchar",           party: "D" as const, state: "MN", vote: "Aye" as const },
    { name: "Cory Booker",             party: "D" as const, state: "NJ", vote: "Aye" as const },
    { name: "Adam Schiff",             party: "D" as const, state: "CA", vote: "Aye" as const },
    { name: "Dick Durbin",             party: "D" as const, state: "IL", vote: "Aye" as const },
    { name: "Kirsten Gillibrand",      party: "D" as const, state: "NY", vote: "Aye" as const },
    { name: "Ron Wyden",               party: "D" as const, state: "OR", vote: "Aye" as const },
    { name: "Tammy Duckworth",         party: "D" as const, state: "IL", vote: "Aye" as const },
    { name: "Raphael Warnock",         party: "D" as const, state: "GA", vote: "Aye" as const },
    { name: "Mark Kelly",              party: "D" as const, state: "AZ", vote: "Aye" as const },
    { name: "Alex Padilla",            party: "D" as const, state: "CA", vote: "Aye" as const },
    { name: "Angus King",              party: "I" as const, state: "ME", vote: "Aye" as const },
    { name: "Jon Ossoff",              party: "D" as const, state: "GA", vote: "Aye" as const },
    { name: "Sherrod Brown",           party: "D" as const, state: "OH", vote: "Aye" as const },
    { name: "Patty Murray",            party: "D" as const, state: "WA", vote: "Aye" as const },
    { name: "Maria Cantwell",          party: "D" as const, state: "WA", vote: "Aye" as const },
    { name: "Bob Casey",               party: "D" as const, state: "PA", vote: "Aye" as const },
    { name: "Jeff Merkley",            party: "D" as const, state: "OR", vote: "Aye" as const },
    { name: "Ed Markey",               party: "D" as const, state: "MA", vote: "Aye" as const },
    { name: "Tim Kaine",               party: "D" as const, state: "VA", vote: "Aye" as const },
    { name: "Mark Warner",             party: "D" as const, state: "VA", vote: "Aye" as const },
    { name: "Mazie Hirono",            party: "D" as const, state: "HI", vote: "Aye" as const },
    { name: "Tammy Baldwin",           party: "D" as const, state: "WI", vote: "Aye" as const },
    { name: "Catherine Cortez Masto", party: "D" as const, state: "NV", vote: "Aye" as const },
    { name: "Debbie Stabenow",         party: "D" as const, state: "MI", vote: "Aye" as const },
    { name: "Gary Peters",             party: "D" as const, state: "MI", vote: "Aye" as const },
    { name: "Michael Bennet",          party: "D" as const, state: "CO", vote: "Aye" as const },
    { name: "John Hickenlooper",       party: "D" as const, state: "CO", vote: "Aye" as const },
    { name: "Brian Schatz",            party: "D" as const, state: "HI", vote: "Aye" as const },
    { name: "Jacky Rosen",             party: "D" as const, state: "NV", vote: "Aye" as const },
    { name: "Ruben Gallego",           party: "D" as const, state: "AZ", vote: "Aye" as const },
    { name: "Martin Heinrich",         party: "D" as const, state: "NM", vote: "Aye" as const },
    { name: "Tina Smith",              party: "D" as const, state: "MN", vote: "Aye" as const },
    { name: "Chris Van Hollen",        party: "D" as const, state: "MD", vote: "Aye" as const },
    { name: "Ben Ray Luján",           party: "D" as const, state: "NM", vote: "Aye" as const },
    { name: "Jon Tester",              party: "D" as const, state: "MT", vote: "Aye" as const },
    { name: "Angela Alsobrooks",       party: "D" as const, state: "MD", vote: "Aye" as const },
    { name: "Peter Welch",             party: "D" as const, state: "VT", vote: "Aye" as const },
    { name: "Andy Kim",                party: "D" as const, state: "NJ", vote: "Aye" as const },

    // NO voters - Democrats who crossed over — sorted most to least prominent
    { name: SCHUMER_DATA.name, party: SCHUMER_DATA.party, state: SCHUMER_DATA.state, vote: SCHUMER_DATA.vote },
    { name: "John Fetterman",  party: "D" as const, state: "PA", vote: "No" as const },
    { name: "Joe Manchin",     party: "D" as const, state: "WV", vote: "No" as const },
    { name: "Jeanne Shaheen",  party: "D" as const, state: "NH", vote: "No" as const },
    { name: "Maggie Hassan",   party: "D" as const, state: "NH", vote: "No" as const },
    { name: "Chris Coons",     party: "D" as const, state: "DE", vote: "No" as const },
    { name: "Elissa Slotkin",  party: "D" as const, state: "MI", vote: "No" as const },
    { name: "Tom Carper",      party: "D" as const, state: "DE", vote: "No" as const },

    // NO voters — sorted most to least prominent (most famous → innermost row)
    { name: "Mitch McConnell",      party: "R" as const, state: "KY", vote: "No" as const },
    { name: "Ted Cruz",             party: "R" as const, state: "TX", vote: "No" as const },
    { name: "Marco Rubio",          party: "R" as const, state: "FL", vote: "No" as const },
    { name: "Rand Paul",            party: "R" as const, state: "KY", vote: "No" as const },
    { name: "Lindsey Graham",       party: "R" as const, state: "SC", vote: "No" as const },
    { name: "J.D. Vance",           party: "R" as const, state: "OH", vote: "No" as const },
    { name: "Josh Hawley",          party: "R" as const, state: "MO", vote: "No" as const },
    { name: "Susan Collins",        party: "R" as const, state: "ME", vote: "No" as const },
    { name: "Mitt Romney",          party: "R" as const, state: "UT", vote: "No" as const },
    { name: "John Thune",           party: "R" as const, state: "SD", vote: "No" as const },
    { name: "Lisa Murkowski",       party: "R" as const, state: "AK", vote: "No" as const },
    { name: "John Cornyn",          party: "R" as const, state: "TX", vote: "No" as const },
    { name: "Chuck Grassley",       party: "R" as const, state: "IA", vote: "No" as const },
    { name: "Rick Scott",           party: "R" as const, state: "FL", vote: "No" as const },
    { name: "Tim Scott",            party: "R" as const, state: "SC", vote: "No" as const },
    { name: "Kyrsten Sinema",       party: "I" as const, state: "AZ", vote: "No" as const },
    { name: "Ron Johnson",          party: "R" as const, state: "WI", vote: "No" as const },
    { name: "Marsha Blackburn",     party: "R" as const, state: "TN", vote: "No" as const },
    { name: "Bill Cassidy",         party: "R" as const, state: "LA", vote: "No" as const },
    { name: "Mike Lee",             party: "R" as const, state: "UT", vote: "No" as const },
    { name: "Joni Ernst",           party: "R" as const, state: "IA", vote: "No" as const },
    { name: "John Kennedy",         party: "R" as const, state: "LA", vote: "No" as const },
    { name: "Bill Hagerty",         party: "R" as const, state: "TN", vote: "No" as const },
    { name: "Roger Wicker",         party: "R" as const, state: "MS", vote: "No" as const },
    { name: "John Barrasso",        party: "R" as const, state: "WY", vote: "No" as const },
    { name: "Katie Britt",          party: "R" as const, state: "AL", vote: "No" as const },
    { name: "Steve Daines",         party: "R" as const, state: "MT", vote: "No" as const },
    { name: "Jim Risch",            party: "R" as const, state: "ID", vote: "No" as const },
    { name: "Dan Sullivan",         party: "R" as const, state: "AK", vote: "No" as const },
    { name: "Mike Crapo",           party: "R" as const, state: "ID", vote: "No" as const },
    { name: "Mike Rounds",          party: "R" as const, state: "SD", vote: "No" as const },
    { name: "Tommy Tuberville",     party: "R" as const, state: "AL", vote: "No" as const },
    { name: "Thom Tillis",          party: "R" as const, state: "NC", vote: "No" as const },
    { name: "Ted Budd",             party: "R" as const, state: "NC", vote: "No" as const },
    { name: "Pete Ricketts",        party: "R" as const, state: "NE", vote: "No" as const },
    { name: "Mike Braun",           party: "R" as const, state: "IN", vote: "No" as const },
    { name: "Deb Fischer",          party: "R" as const, state: "NE", vote: "No" as const },
    { name: "Todd Young",           party: "R" as const, state: "IN", vote: "No" as const },
    { name: "Eric Schmitt",         party: "R" as const, state: "MO", vote: "No" as const },
    { name: "Jerry Moran",          party: "R" as const, state: "KS", vote: "No" as const },
    { name: "James Lankford",       party: "R" as const, state: "OK", vote: "No" as const },
    { name: "Cynthia Lummis",       party: "R" as const, state: "WY", vote: "No" as const },
    { name: "Cindy Hyde-Smith",     party: "R" as const, state: "MS", vote: "No" as const },
    { name: "Markwayne Mullin",     party: "R" as const, state: "OK", vote: "No" as const },
    { name: "Kevin Cramer",         party: "R" as const, state: "ND", vote: "No" as const },
    { name: "John Hoeven",          party: "R" as const, state: "ND", vote: "No" as const },
    { name: "Roger Marshall",       party: "R" as const, state: "KS", vote: "No" as const },
    { name: "Shelley Moore Capito", party: "R" as const, state: "WV", vote: "No" as const },
    { name: "James Risch",          party: "R" as const, state: "ID", vote: "No" as const },
    { name: "Markwayne Mullin",     party: "R" as const, state: "OK", vote: "No" as const },
    { name: "Lindsey Graham",       party: "R" as const, state: "SC", vote: "No" as const },
  ];

  // A senator "crosses over" when they vote against their party's majority bloc
  const isCrossoverSenator = (s: { party: string; vote: string }) =>
    (s.party === "D" && s.vote === "No") || (s.party === "R" && s.vote === "Aye");

  return (
    <div style={{
      position: "fixed",
      top: 20,
      left: 20,
      right: 20,
      bottom: 20,
      zIndex: 20,
      pointerEvents: "auto",
    }}>
      <style>{`
        @keyframes crossoverPulse {
          0%, 100% { border-color: rgba(96,165,250,0.55); box-shadow: 0 0 0 0 rgba(96,165,250,0.0); }
          50%       { border-color: rgba(239,68,68,0.55);  box-shadow: 0 0 0 0 rgba(239,68,68,0.0); }
        }
      `}</style>
      <div style={{
        width: "100%",
        height: "100%",
        background: "rgba(4,6,18,0.62)",
        backdropFilter: "blur(40px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 24px 80px rgba(0,0,0,0.38)",
      }}>
        <button
          onClick={() => router.push("/")}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 6,
            padding: "6px 8px",
            color: "rgba(255,255,255,0.7)",
            fontSize: 16,
            cursor: "pointer",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
        >
          ←
        </button>

        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "50px 40px 20px",
          color: "white",
        }}>
          <div style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}>
            <h1 style={{
              fontSize: 36,
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
              color: "rgba(255,255,255,0.42)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>
              {date}
            </div>

            <div style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.82)",
            }}>
              {description.split("\n\n").map((paragraph, i) => (
                <p key={i} style={{ margin: "0 0 20px 0" }}>
                  {paragraph}
                </p>
              ))}
            </div>

            {!senateExpanded && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 16,
              }}>
                <div
                  onMouseEnter={() => setSenateExpanded(true)}
                  style={{ cursor: "pointer" }}
                >
                  <SenateVoteVisualization
                    title="SENATE"
                    senators={senators}
                  />
                </div>
              </div>
            )}
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
            border: "1px solid rgba(96,165,250,0.55)",
            padding: "28px",
            width: 420,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            animation: "crossoverPulse 2s ease-in-out infinite",
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
          onClick={() => {
            setSenateExpanded(false);
            setLockedSenator(null);
            setHoveredSenator(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backdropFilter: "blur(20px)",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
          }}
        >
          <div
            onMouseLeave={() => {
              if (!lockedSenator) {
                setSenateExpanded(false);
                setHoveredSenator(null);
              }
            }}
            style={{
              position: "relative",
              transform: "scale(1.5)",
              padding: "40px",
            }}
          >
            <SenateVoteVisualization
              title="SENATE"
              senators={senators}
              hideTooltip={true}
              onSenatorHover={setHoveredSenator}
              onSenatorClick={(senator) => {
                if (lockedSenator?.name === senator.name) {
                  setLockedSenator(null);
                } else {
                  setLockedSenator(senator);
                }
              }}
            />
          </div>

          {/* Senator info card - appears on hover/lock */}
          {(hoveredSenator || lockedSenator) && (() => {
            const senator = lockedSenator || hoveredSenator;
            if (!senator) return null;

            const isAye = senator.vote === "Aye";
            const isSchumer = senator.name === SCHUMER_DATA.name;
            const crossover = isCrossoverSenator(senator);

            return (
              <div style={{
                position: "fixed",
                [isAye ? "left" : "right"]: 80,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 201,
                pointerEvents: lockedSenator ? "auto" : "none",
              }}>
                <div
                  onClick={() => {
                    if (lockedSenator) {
                      setLockedSenator(null);
                    }
                  }}
                  style={{
                    background: "rgba(4,6,18,0.95)",
                    backdropFilter: "blur(30px)",
                    borderRadius: 16,
                    border: `1px solid rgba(${isAye ? "96,165,250" : "239,68,68"},0.4)`,
                    padding: "20px",
                    width: 420,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    cursor: lockedSenator ? "pointer" : "default",
                    animation: crossover ? "crossoverPulse 2s ease-in-out infinite" : "none",
                  }}
                >
                  <div style={{ display: "flex", gap: 14, marginBottom: isSchumer ? 14 : 0 }}>
                    {isSchumer && (
                      <div
                        onMouseEnter={() => setPhotoEnlarged(true)}
                        onMouseLeave={() => setPhotoEnlarged(false)}
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 12,
                          overflow: "hidden",
                          background: "rgba(255,255,255,0.05)",
                          flexShrink: 0,
                          cursor: "zoom-in",
                          position: "relative",
                        }}
                      >
                        <img
                          src={SCHUMER_DATA.photo}
                          alt={SCHUMER_DATA.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {/* Enlarged overlay — separate element so the small photo never moves */}
                        {photoEnlarged && (
                          <div
                            style={{
                              position: "fixed",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              zIndex: 400,
                              pointerEvents: "none",
                              borderRadius: 16,
                              overflow: "hidden",
                              width: 360,
                              height: 360,
                              boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
                              transition: "opacity 0.18s",
                            }}
                          >
                            <img
                              src={SCHUMER_DATA.photo}
                              alt={SCHUMER_DATA.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.95)",
                        marginBottom: 8,
                      }}>
                        {senator.name}
                      </div>

                      <div style={{
                        fontSize: 15,
                        color: "rgba(255,255,255,0.62)",
                        marginBottom: 6,
                      }}>
                        {senator.party === "R" ? "Republican" : senator.party === "D" ? "Democrat" : "Independent"} • {STATE_NAMES[senator.state] ?? senator.state}
                      </div>

                      <div style={{
                        fontSize: 14,
                        color: isAye ? "rgba(100,200,100,0.85)" : "rgba(239,68,68,0.85)",
                        fontFamily: "monospace",
                      }}>
                        Vote: {senator.vote}
                      </div>
                    </div>
                  </div>

                  {isSchumer && (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      fontSize: 14,
                      color: "rgba(255,255,255,0.68)",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      paddingTop: 14,
                    }}>
                      <div><span style={{ fontWeight: 700 }}>Age:</span> {SCHUMER_DATA.age}</div>
                      <div><span style={{ fontWeight: 700 }}>In office:</span> {SCHUMER_DATA.yearsInOffice} years</div>
                      <div><span style={{ fontWeight: 700 }}>Up for re-election:</span> {SCHUMER_DATA.nextElection}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
