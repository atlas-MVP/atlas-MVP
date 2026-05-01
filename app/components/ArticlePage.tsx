"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SenateVoteVisualization from "./SenateVoteVisualization";
import { Senator } from "./SenateVoteVisualization";
import { SENATOR_BIOS, RAW_BIOS, photoFor } from "./senatorBios";
import SenatorProfileCard from "./SenatorProfileCard";

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

// Bios + R2 photo URLs live in ./senatorBios — one record per senator.
// Build a view model that adds the computed `photo` URL so the JSX below can
// stay exactly as-is (reads `bio.photo`, `bio.age`, etc.).
import type { SenatorBio } from "./senatorBios";
type SenatorView = SenatorBio & { photo: string };
const SENATOR_DATA: Record<string, SenatorView> = Object.fromEntries(
  Object.entries(SENATOR_BIOS).map(([name, bio]) => [name, { ...bio, photo: photoFor(bio) }])
);

// Current calendar year drives the "Left office" vs "Retiring" split.
const CURRENT_YEAR = new Date().getFullYear();

// Returns the one-line bio-card label for a senator's electoral status.
// Three cases:
//   • Left office:       runningAgain=false AND term already ended
//   • Retiring:          runningAgain=false AND term ends in the future
//   • Up for re-election runningAgain=true (default)
function reelectionLabel(bio: SenatorBio): string {
  if (!bio.runningAgain) {
    return bio.nextElection < CURRENT_YEAR
      ? `Left office: ${bio.nextElection}`
      : `Retiring: ${bio.nextElection}`;
  }
  return `Up for re-election: ${bio.nextElection}`;
}

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
  const [profileSenator, setProfileSenator] = useState<typeof SENATOR_DATA[string] & { vote: string } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<"headline" | "body" | "date">("headline");
  const [textStyles, setTextStyles] = useState<{
    headline: { fontFamily: string; fontSize: number; fontWeight: number; fontStyle: "normal" | "italic" };
    body: { fontFamily: string; fontSize: number; fontWeight: number; fontStyle: "normal" | "italic" };
    date: { fontFamily: string; fontSize: number; fontWeight: number; fontStyle: "normal" | "italic" };
  }>({
    headline: {
      fontFamily: "inherit",
      fontSize: 36,
      fontWeight: 700,
      fontStyle: "normal",
    },
    body: {
      fontFamily: "inherit",
      fontSize: 17,
      fontWeight: 400,
      fontStyle: "normal",
    },
    date: {
      fontFamily: "monospace",
      fontSize: 13,
      fontWeight: 400,
      fontStyle: "normal",
    },
  });

  // Roster is derived from senatorBios.ts so the hemicycle dots, the bios, and
  // the S.J.Res. 32 roll-call sheet all come from a single source of truth.
  // Ordering in RAW_BIOS (most-prominent → innermost) drives ring placement.
  const senators: Senator[] = RAW_BIOS.map(b => ({
    name:  b.name,
    party: b.party,
    state: b.state,
    vote:  b.vote,
  }));

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
        @import url('https://fonts.googleapis.com/css2?family=Exo:ital,wght@0,400;0,700;1,400;1,700&family=Exo+2:ital,wght@0,400;0,700;1,400;1,700&family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Lato:ital,wght@0,400;0,700;1,400;1,700&family=Montserrat:ital,wght@0,400;0,700;1,400;1,700&family=Source+Code+Pro:ital,wght@0,400;0,700;1,400;1,700&display=swap');

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

        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: editMode ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.07)",
            border: editMode ? "1px solid rgba(96,165,250,0.4)" : "1px solid rgba(255,255,255,0.14)",
            borderRadius: 6,
            padding: "6px 12px",
            color: editMode ? "rgba(96,165,250,0.95)" : "rgba(255,255,255,0.7)",
            fontSize: 13,
            fontFamily: "monospace",
            letterSpacing: "0.05em",
            cursor: "pointer",
            zIndex: 10,
            fontWeight: 600,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = editMode ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.12)")}
          onMouseLeave={e => (e.currentTarget.style.background = editMode ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.07)")}
        >
          EDIT
        </button>

        {/* Style Controls Panel */}
        {editMode && (
          <div style={{
            position: "absolute",
            top: 52,
            right: 12,
            background: "rgba(4,6,18,0.95)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(96,165,250,0.3)",
            borderRadius: 12,
            padding: "16px",
            width: 280,
            zIndex: 10,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}>
            <div style={{
              fontSize: 11,
              fontFamily: "monospace",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              marginBottom: 12,
            }}>
              Style Controls
            </div>

            {/* Element Selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                fontSize: 10,
                fontFamily: "monospace",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.45)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}>
                Element
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {(["headline", "body", "date"] as const).map(el => (
                  <button
                    key={el}
                    onClick={() => setSelectedElement(el)}
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      background: selectedElement === el ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.05)",
                      border: selectedElement === el ? "1px solid rgba(96,165,250,0.4)" : "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 6,
                      color: selectedElement === el ? "rgba(96,165,250,0.95)" : "rgba(255,255,255,0.6)",
                      fontSize: 11,
                      fontFamily: "monospace",
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {el}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                fontSize: 10,
                fontFamily: "monospace",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.45)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}>
                Font Family
              </label>
              <select
                value={textStyles[selectedElement].fontFamily}
                onChange={(e) => setTextStyles({
                  ...textStyles,
                  [selectedElement]: {
                    ...textStyles[selectedElement],
                    fontFamily: e.target.value,
                  },
                })}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                <option value="inherit">Default (Inter)</option>
                <option value="'Exo', sans-serif">Exo</option>
                <option value="'Exo 2', sans-serif">Exo 2</option>
                <option value="'PT Serif', serif">PT Serif</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Georgia', serif">Georgia</option>
                <option value="monospace">Monospace</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="'Source Code Pro', monospace">Source Code Pro</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
                <option value="'Lato', sans-serif">Lato</option>
                <option value="'Montserrat', sans-serif">Montserrat</option>
              </select>
            </div>

            {/* Font Size */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                fontSize: 10,
                fontFamily: "monospace",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.45)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}>
                Font Size
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="number"
                  value={textStyles[selectedElement].fontSize}
                  onChange={(e) => setTextStyles({
                    ...textStyles,
                    [selectedElement]: {
                      ...textStyles[selectedElement],
                      fontSize: parseInt(e.target.value) || 12,
                    },
                  })}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 12,
                  }}
                />
                <span style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "monospace",
                }}>
                  px
                </span>
              </div>
            </div>

            {/* Bold & Italic Toggles */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                fontSize: 10,
                fontFamily: "monospace",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.45)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}>
                Style
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setTextStyles({
                    ...textStyles,
                    [selectedElement]: {
                      ...textStyles[selectedElement],
                      fontWeight: textStyles[selectedElement].fontWeight === 700 ? 400 : 700,
                    },
                  })}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: textStyles[selectedElement].fontWeight === 700 ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.05)",
                    border: textStyles[selectedElement].fontWeight === 700 ? "1px solid rgba(96,165,250,0.4)" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    color: textStyles[selectedElement].fontWeight === 700 ? "rgba(96,165,250,0.95)" : "rgba(255,255,255,0.6)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  B
                </button>
                <button
                  onClick={() => setTextStyles({
                    ...textStyles,
                    [selectedElement]: {
                      ...textStyles[selectedElement],
                      fontStyle: textStyles[selectedElement].fontStyle === "italic" ? "normal" : "italic",
                    },
                  })}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: textStyles[selectedElement].fontStyle === "italic" ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.05)",
                    border: textStyles[selectedElement].fontStyle === "italic" ? "1px solid rgba(96,165,250,0.4)" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    color: textStyles[selectedElement].fontStyle === "italic" ? "rgba(96,165,250,0.95)" : "rgba(255,255,255,0.6)",
                    fontSize: 12,
                    fontStyle: "italic",
                    cursor: "pointer",
                  }}
                >
                  I
                </button>
              </div>
            </div>
          </div>
        )}

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
              fontSize: textStyles.headline.fontSize,
              fontWeight: textStyles.headline.fontWeight,
              fontFamily: textStyles.headline.fontFamily,
              fontStyle: textStyles.headline.fontStyle,
              lineHeight: 1.2,
              margin: 0,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.02em",
            }}>
              {headline}
            </h1>

            <div style={{
              fontSize: textStyles.date.fontSize,
              fontFamily: textStyles.date.fontFamily,
              fontWeight: textStyles.date.fontWeight,
              fontStyle: textStyles.date.fontStyle,
              color: "rgba(255,255,255,0.42)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>
              {date}
            </div>

            <div style={{
              fontSize: textStyles.body.fontSize,
              fontFamily: textStyles.body.fontFamily,
              fontWeight: textStyles.body.fontWeight,
              fontStyle: textStyles.body.fontStyle,
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
                    onSenatorClick={(senator) => {
                      const bio = SENATOR_DATA[senator.name];
                      if (bio) {
                        setProfileSenator({ ...bio, vote: senator.vote });
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {hoveredSenator && SENATOR_DATA[hoveredSenator.name] && !senateExpanded && (() => {
        const bio = SENATOR_DATA[hoveredSenator.name];
        const crossover = isCrossoverSenator(hoveredSenator);
        const isSchumer = bio.slug === "chuck-schumer";
        return (
          <div style={{
            position: "fixed",
            right: 30,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 100,
            pointerEvents: "none",
          }}>
            <div
              onClick={isSchumer ? () => setProfileSenator({ ...bio, vote: hoveredSenator.vote }) : undefined}
              style={{
                background: "rgba(4,6,18,0.95)",
                backdropFilter: "blur(30px)",
                borderRadius: 16,
                border: `1px solid rgba(${bio.party === "R" ? "239,68,68" : "96,165,250"},0.55)`,
                padding: "28px",
                width: 420,
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                animation: crossover ? "crossoverPulse 2s ease-in-out infinite" : "none",
                position: "relative",
                cursor: isSchumer ? "pointer" : "default",
                pointerEvents: "auto",
              }}>
              {isSchumer && (
                <div style={{
                  position: "absolute", top: 10, right: 14,
                  fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
                }}>tap to expand</div>
              )}
              <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                <div
                  onClick={(e) => { e.stopPropagation(); setPhotoEnlarged(v => !v); }}
                  style={{
                    width: 100, height: 100, borderRadius: 12,
                    background: "rgba(255,255,255,0.05)", flexShrink: 0,
                    cursor: photoEnlarged ? "zoom-out" : "zoom-in",
                    pointerEvents: "auto",
                    overflow: "hidden",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "scale(1.025) translateY(-4px) rotateX(1deg)";
                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3), 0 15px 30px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  <img src={bio.photo} alt={bio.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                    <span style={{ color: "rgba(255,255,255,0.95)" }}>{bio.name}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.62)", marginBottom: 6 }}>
                    {bio.party === "R" ? "Republican" : bio.party === "D" ? "Democrat" : "Independent"} • {STATE_NAMES[bio.state] ?? bio.state}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: bio.vote === "Aye" ? "rgba(100,200,100,0.85)" : "rgba(239,68,68,0.85)",
                    fontFamily: "monospace",
                  }}>
                    Vote: {bio.vote}
                  </div>
                </div>
              </div>

              {bio.isSponsor && (
                <div style={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "rgba(250,204,21,0.15)",
                  border: "1px solid rgba(250,204,21,0.55)",
                  color: "rgba(250,204,21,0.95)",
                  fontSize: 10,
                  fontFamily: "monospace",
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}>
                  Bill Sponsor
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Small-card enlarged photo overlay — same dim-behind treatment as
          expanded-mode. Shown only when expanded mode is OFF. */}
      {photoEnlarged && !senateExpanded && hoveredSenator && SENATOR_DATA[hoveredSenator.name] && (() => {
        const bio = SENATOR_DATA[hoveredSenator.name];
        return (
          <div
            onClick={() => setPhotoEnlarged(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 400,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "zoom-out",
              pointerEvents: "auto",
            }}
          >
            <div style={{
              width: 520,
              height: 520,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
            }}>
              <img
                src={bio.photo}
                alt={bio.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        );
      })()}

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
                const bio = SENATOR_DATA[senator.name];
                if (bio) {
                  setProfileSenator({ ...bio, vote: senator.vote });
                } else {
                  setLockedSenator(lockedSenator?.name === senator.name ? null : senator);
                }
              }}
            />
          </div>

          {/* Senator info card - appears on hover/lock */}
          {(hoveredSenator || lockedSenator) && (() => {
            const senator = lockedSenator || hoveredSenator;
            if (!senator) return null;

            const isAye     = senator.vote === "Aye";
            const bio       = SENATOR_DATA[senator.name];      // full bio + photo (may be undefined)
            const hasBio    = !!bio;
            const crossover = isCrossoverSenator(senator);

            return (
              <>
                {/* Backdrop - click outside to close */}
                {lockedSenator && (
                  <div
                    onClick={() => setLockedSenator(null)}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 200,
                      background: "rgba(0,0,0,0.2)",
                    }}
                  />
                )}
                {/* Enlarged photo overlay — dims everything behind, click anywhere to dismiss. */}
                {photoEnlarged && bio && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoEnlarged(false);
                    }}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 400,
                      background: "rgba(0,0,0,0.75)",
                      backdropFilter: "blur(6px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "zoom-out",
                    }}
                  >
                    <div style={{
                      width: 520,
                      height: 520,
                      borderRadius: 16,
                      overflow: "hidden",
                      boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
                    }}>
                      <img
                        src={bio.photo}
                        alt={bio.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  </div>
                )}
                <div style={{
                  position: "fixed",
                  [isAye ? "left" : "right"]: 80,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 201,
                  pointerEvents: lockedSenator ? "auto" : "none",
                }}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasBio && bio.slug === "chuck-schumer") {
                        setProfileSenator({ ...bio, vote: senator.vote });
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
                    cursor: hasBio && bio.slug === "chuck-schumer" ? "pointer" : "default",
                    animation: crossover ? "crossoverPulse 2s ease-in-out infinite" : "none",
                    position: "relative",
                  }}
                >
                  {hasBio && bio.slug === "chuck-schumer" && (
                    <div style={{
                      position: "absolute", top: 10, right: 14,
                      fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em",
                      color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
                    }}>tap to expand</div>
                  )}
                  <div style={{ display: "flex", gap: 14, marginBottom: hasBio ? 14 : 0 }}>
                    {hasBio && (
                      <div
                        onClick={(e) => { e.stopPropagation(); setPhotoEnlarged(v => !v); }}
                        style={{
                          width: 120, height: 120, borderRadius: 12,
                          background: "rgba(255,255,255,0.05)",
                          flexShrink: 0, cursor: photoEnlarged ? "zoom-out" : "zoom-in",
                          overflow: "hidden",
                          transition: "transform 0.2s, box-shadow 0.2s",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = "scale(1.025) translateY(-4px) rotateX(1deg)";
                          e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3), 0 15px 30px rgba(0,0,0,0.2)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = "";
                          e.currentTarget.style.boxShadow = "";
                        }}
                      >
                        <img src={bio.photo} alt={bio.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                        <span style={{ color: "rgba(255,255,255,0.95)" }}>{senator.name}</span>
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

                  {hasBio && bio.isSponsor && (
                    <div style={{
                      position: "absolute",
                      bottom: 12,
                      right: 12,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "rgba(250,204,21,0.15)",
                      border: "1px solid rgba(250,204,21,0.55)",
                      color: "rgba(250,204,21,0.95)",
                      fontSize: 10,
                      fontFamily: "monospace",
                      letterSpacing: "0.12em",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}>
                      Bill Sponsor
                    </div>
                  )}
                </div>
              </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ── Senator profile card — expands from bio card on tap ── */}
      {profileSenator && (
        <SenatorProfileCard
          bioguide={profileSenator.bioguide}
          name={profileSenator.name}
          photo={profileSenator.photo}
          party={profileSenator.party}
          state={profileSenator.state}
          age={profileSenator.age}
          yearsInOffice={profileSenator.yearsInOffice}
          nextElection={profileSenator.nextElection}
          runningAgain={profileSenator.runningAgain}
          officialUrl={profileSenator.officialUrl}
          side={profileSenator.vote === "Aye" ? "left" : "right"}
          onClose={() => setProfileSenator(null)}
        />
      )}
    </div>
  );
}
