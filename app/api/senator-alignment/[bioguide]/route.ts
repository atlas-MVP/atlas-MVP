import { NextRequest, NextResponse } from "next/server";
import {
  getSenatorInfo,
  getBillSenateRollCalls,
  getSenateVoteMap,
  getBillCosponsors,
  type VoteCast,
  type SenatorInfo,
} from "../../../lib/congressApi";
import {
  GLOBAL_ISSUES,
  DOMESTIC_ISSUES,
  type BillDef,
  type IssueCategoryDef,
} from "../../../lib/billRegistry";
import {
  scoreSenator,
  uiCatScore,
  buildRegistryKey,
  MANUAL_ACTIONS,
  FOUNDING_ACTIONS,
  type SenatorAction,
} from "../../../lib/scoreEngine";

// ─── Exported types (consumed by UI components) ───────────────────────────────

export interface BillRecord {
  id: string;
  title: string;
  description: string;
  memberVote: "Yes" | "No" | "Not Voting" | "Cosponsored" | "Blocked";
  aligned: boolean;
  date: string;
  congress_url?: string;
}

export interface Subcategory {
  id: string;
  label: string;
  bills: BillRecord[];
}

export interface IssueCategory {
  id: string;
  label: string;
  score: number;          // pre-computed 0–67 score from weighted engine
  subcategories: Subcategory[];
}

export interface SenatorScorecard {
  bioguide: string;
  name: string;
  overall: number;        // weighted overall 0–67
  globalIssues: IssueCategory[];
  domesticIssues: IssueCategory[];
}

// ─── Vote resolution for display bills ───────────────────────────────────────

type VoteMapCache = Map<string, Record<string, VoteCast>>;
type CosponsorCache = Map<string, Set<string>>;

async function resolveVoteMap(
  bill: BillDef,
  cache: VoteMapCache,
): Promise<Record<string, VoteCast> | null> {
  if (!bill.roll) return null;
  const { congress, billType, billNumber, index } = bill.roll;
  const key = `vm:${congress}/${billType}/${billNumber}/${index}`;
  if (cache.has(key)) return cache.get(key)!;
  const refs = await getBillSenateRollCalls(congress, billType, billNumber);
  if (!refs.length) { cache.set(key, {}); return {}; }
  const idx = index < 0 ? refs.length + index : index;
  const ref = refs[Math.max(0, Math.min(idx, refs.length - 1))];
  const map = await getSenateVoteMap(ref.congress, ref.session, ref.rollNumber);
  cache.set(key, map);
  return map;
}

async function resolveCosponsors(
  bill: BillDef,
  cache: CosponsorCache,
): Promise<Set<string>> {
  if (!bill.roll) return new Set();
  const { congress, billType, billNumber } = bill.roll;
  const key = `cs:${congress}/${billType}/${billNumber}`;
  if (cache.has(key)) return cache.get(key)!;
  try {
    const ids = await getBillCosponsors(congress, billType, billNumber);
    cache.set(key, ids);
    return ids;
  } catch {
    cache.set(key, new Set());
    return new Set();
  }
}

function castToMemberVote(cast: VoteCast): BillRecord["memberVote"] {
  if (cast === "Yea") return "Yes";
  if (cast === "Nay") return "No";
  return "Not Voting";
}

async function resolveBill(
  bill: BillDef,
  voteCache: VoteMapCache,
  csCache: CosponsorCache,
  senator: SenatorInfo,
): Promise<BillRecord> {
  const base = {
    id: bill.id,
    title: bill.title,
    description: bill.description,
    date: bill.date,
    congress_url: bill.congress_url,
  };

  if (!bill.roll) {
    return { ...base, memberVote: bill.mockMemberVote, aligned: bill.mockAligned };
  }

  try {
    // Check cosponsor status
    const cosponsors = await resolveCosponsors(bill, csCache);
    if (cosponsors.has(senator.bioguide)) {
      return {
        ...base,
        memberVote: "Cosponsored",
        aligned: bill.roll.alignedVote === "Yea", // cosponsoring = supporting = Yea
      };
    }

    // Check vote
    const voteMap = await resolveVoteMap(bill, voteCache);
    if (!voteMap) {
      return { ...base, memberVote: bill.mockMemberVote, aligned: bill.mockAligned };
    }
    const lookupKey = `${senator.lastName}|${senator.stateAbbr}`;
    const cast = voteMap[lookupKey];
    if (!cast) {
      return { ...base, memberVote: bill.mockMemberVote, aligned: bill.mockAligned };
    }
    return {
      ...base,
      memberVote: castToMemberVote(cast),
      aligned: cast === bill.roll.alignedVote,
    };
  } catch {
    return { ...base, memberVote: bill.mockMemberVote, aligned: bill.mockAligned };
  }
}

async function resolveCategory(
  cat: IssueCategoryDef,
  voteCache: VoteMapCache,
  csCache: CosponsorCache,
  senator: SenatorInfo,
  byCat: Record<string, number>,
): Promise<IssueCategory> {
  return {
    id: cat.id,
    label: cat.label,
    score: uiCatScore(cat.id, byCat),
    subcategories: await Promise.all(
      cat.subcategories.map(async (sub) => ({
        id: sub.id,
        label: sub.label,
        bills: await Promise.all(
          sub.bills.map((b) => resolveBill(b, voteCache, csCache, senator)),
        ),
      })),
    ),
  };
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bioguide: string }> },
) {
  const { bioguide } = await params;

  let senator: SenatorInfo;
  try {
    senator = await getSenatorInfo(bioguide);
  } catch {
    return NextResponse.json({ error: "Senator not found" }, { status: 404 });
  }

  // Build the registry key used in MANUAL_ACTIONS / FOUNDING_ACTIONS
  const registryKey = buildRegistryKey(senator.lastName, senator.stateAbbr);

  // Merge all static actions — foundingActions already contains the 10 senators;
  // for anyone else, only MANUAL_ACTIONS applies (API-fetched votes come via
  // the display resolution below, not the score engine, for non-founding senators).
  const allActions: SenatorAction[] = [...MANUAL_ACTIONS, ...FOUNDING_ACTIONS];

  // Compute per-category weighted scores (0–67)
  const { byCat, overall } = scoreSenator(registryKey, allActions);

  // Resolve display bills (actual votes + cosponsors)
  const voteCache: VoteMapCache = new Map();
  const csCache: CosponsorCache = new Map();

  const [globalIssues, domesticIssues] = await Promise.all([
    Promise.all(
      GLOBAL_ISSUES.map((cat) =>
        resolveCategory(cat, voteCache, csCache, senator, byCat),
      ),
    ),
    Promise.all(
      DOMESTIC_ISSUES.map((cat) =>
        resolveCategory(cat, voteCache, csCache, senator, byCat),
      ),
    ),
  ]);

  const scorecard: SenatorScorecard = {
    bioguide,
    name: senator.displayName,
    overall,
    globalIssues,
    domesticIssues,
  };

  return NextResponse.json(scorecard, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
