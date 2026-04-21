"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SenateVoteVisualization from "./SenateVoteVisualization";
import { Senator } from "./SenateVoteVisualization";
import { SENATOR_BIOS, photoFor } from "./senatorBios";

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

// Legacy alias — the small in-line hover card still references SCHUMER_DATA.
const SCHUMER_DATA = SENATOR_DATA["Chuck Schumer"];

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
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<"headline" | "body" | "date">("headline");
  const [textStyles, setTextStyles] = useState({
    headline: {
      fontFamily: "inherit",
      fontSize: 36,
      fontWeight: 700,
      fontStyle: "normal" as const,
    },
    body: {
      fontFamily: "inherit",
      fontSize: 17,
      fontWeight: 400,
      fontStyle: "normal" as const,
    },
    date: {
      fontFamily: "monospace",
      fontSize: 13,
      fontWeight: 400,
      fontStyle: "normal" as const,
    },
  });

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
        return (
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
              border: `1px solid rgba(${bio.party === "R" ? "239,68,68" : "96,165,250"},0.55)`,
              padding: "28px",
              width: 420,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              animation: crossover ? "crossoverPulse 2s ease-in-out infinite" : "none",
            }}>
              <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                <div style={{
                  width: 100, height: 100, borderRadius: 12,
                  overflow: "hidden", background: "rgba(255,255,255,0.05)", flexShrink: 0,
                }}>
                  <img src={bio.photo} alt={bio.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                    <a
                      href={bio.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "rgba(255,255,255,0.95)",
                        textDecoration: "underline",
                      }}
                    >
                      {bio.name}
                    </a>
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

              <div style={{
                display: "flex", flexDirection: "column", gap: 10,
                fontSize: 13, color: "rgba(255,255,255,0.68)",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: 18,
              }}>
                <div>Age: {bio.age}</div>
                <div>Years in office: {bio.yearsInOffice}</div>
                <div>{reelectionLabel(bio)}</div>
              </div>
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
                <div style={{
                  position: "fixed",
                  [isAye ? "left" : "right"]: 80,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 201,
                  pointerEvents: lockedSenator ? "auto" : "none",
                }}>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                    background: "rgba(4,6,18,0.95)",
                    backdropFilter: "blur(30px)",
                    borderRadius: 16,
                    border: `1px solid rgba(${isAye ? "96,165,250" : "239,68,68"},0.4)`,
                    padding: "20px",
                    width: 420,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    cursor: "default",
                    animation: crossover ? "crossoverPulse 2s ease-in-out infinite" : "none",
                  }}
                >
                  <div style={{ display: "flex", gap: 14, marginBottom: hasBio ? 14 : 0 }}>
                    {hasBio && (
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
                          src={bio.photo}
                          alt={bio.name}
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
                              width: 520,
                              height: 520,
                              boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
                              transition: "opacity 0.18s",
                            }}
                          >
                            <img
                              src={bio.photo}
                              alt={bio.name}
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
                        marginBottom: 8,
                      }}>
                        {hasBio ? (
                          <a
                            href={bio.officialUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{
                              color: "rgba(255,255,255,0.95)",
                              textDecoration: "underline",
                            }}
                          >
                            {senator.name}
                          </a>
                        ) : (
                          <span style={{ color: "rgba(255,255,255,0.95)" }}>{senator.name}</span>
                        )}
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

                  {hasBio && (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      fontSize: 14,
                      color: "rgba(255,255,255,0.68)",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      paddingTop: 14,
                    }}>
                      <div><span style={{ fontWeight: 700 }}>Age:</span> {bio.age}</div>
                      <div><span style={{ fontWeight: 700 }}>Years in office:</span> {bio.yearsInOffice}</div>
                      <div>{reelectionLabel(bio)}</div>
                    </div>
                  )}
                </div>
              </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
