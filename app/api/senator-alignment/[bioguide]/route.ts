import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────
// These define the contract between the API and the UI.
// When ProPublica is wired in, only this file changes — the card never needs updating.

export interface VoteRecord {
  date: string;           // "April 15, 2026"
  billId: string;         // "S.J.Res. 32"
  billTitle: string;      // human-readable bill name
  memberVote: "Yes" | "No" | "Not Voting";
  partyMajority: "Yes" | "No"; // what ≥60% of party voted
  partyPct: number;       // e.g. 85 = 85% of party voted this way
  aligned: boolean;
  url?: string;           // link to congress.gov bill page
}

export interface SenatorAlignmentResponse {
  bioguide: string;
  name: string;
  // -100 = most liberal (Bernie end), +100 = most conservative
  // 0 = center. Algorithm TBD — slot replaced when ProPublica is live.
  alignmentScore: number;
  termStart: string;              // "January 2023"
  totalQualifyingVotes: number;   // bill passage votes since term start
  misalignedCount: number;        // how many they voted against ≥60% party majority
  recentVotes: VoteRecord[];      // 3 most recent qualifying votes
  misalignedVotes: VoteRecord[];  // all misaligned votes (for hover panel)
}

// ─── Mock data ────────────────────────────────────────────────────────────────
// Placeholder until ProPublica API key is live.
// alignmentScore = -42: mainstream center-left Democrat.
// Replace this entire block with real ProPublica fetch when key is available.

const MOCK: Record<string, SenatorAlignmentResponse> = {
  S000148: {
    bioguide: "S000148",
    name: "Chuck Schumer",
    alignmentScore: -42,      // ← algorithm slot: -100 (Bernie) to +100 (Cruz)
    termStart: "January 2023",
    totalQualifyingVotes: 312,
    misalignedCount: 8,
    recentVotes: [
      {
        date: "April 15, 2026",
        billId: "S.J.Res. 32",
        billTitle: "Block bulldozer sales to Israel",
        memberVote: "No",
        partyMajority: "Yes",
        partyPct: 85,
        aligned: false,
        url: "https://www.congress.gov/bill/119th-congress/senate-joint-resolution/32",
      },
      {
        date: "March 14, 2026",
        billId: "H.R. 1968",
        billTitle: "Continuing resolution — government funding extension",
        memberVote: "No",
        partyMajority: "No",
        partyPct: 78,
        aligned: true,
        url: "https://www.congress.gov/bill/119th-congress/house-bill/1968",
      },
      {
        date: "February 6, 2026",
        billId: "H.R. 7521",
        billTitle: "Protecting Americans from Foreign Adversary Controlled Applications Act",
        memberVote: "Yes",
        partyMajority: "Yes",
        partyPct: 68,
        aligned: true,
        url: "https://www.congress.gov/bill/118th-congress/house-bill/7521",
      },
    ],
    misalignedVotes: [
      {
        date: "April 15, 2026",
        billId: "S.J.Res. 32",
        billTitle: "Block bulldozer sales to Israel",
        memberVote: "No",
        partyMajority: "Yes",
        partyPct: 85,
        aligned: false,
        url: "https://www.congress.gov/bill/119th-congress/senate-joint-resolution/32",
      },
      // Additional misaligned votes will populate here from ProPublica
    ],
  },
};

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bioguide: string }> }
) {
  const { bioguide } = await params;

  // ── Future: ProPublica fetch ──────────────────────────────────────────────
  // const PROPUBLICA_KEY = process.env.PROPUBLICA_API_KEY;
  // const res = await fetch(
  //   `https://api.propublica.org/congress/v1/members/${bioguide}/votes.json`,
  //   { headers: { "X-API-Key": PROPUBLICA_KEY! }, next: { revalidate: 3600 } }
  // );
  // const json = await res.json();
  // ... filter to final passage votes since term start,
  // ... cross-ref party breakdown for 60% threshold,
  // ... compute alignmentScore via DW-NOMINATE-style positioning
  // ─────────────────────────────────────────────────────────────────────────

  const data = MOCK[bioguide];
  if (!data) {
    return NextResponse.json({ error: "Senator not found" }, { status: 404 });
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
