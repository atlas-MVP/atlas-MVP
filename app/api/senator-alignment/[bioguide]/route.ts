import { NextRequest, NextResponse } from "next/server";
import {
  getSenatorInfo,
  getBillSenateRollCalls,
  getSenateVoteMap,
  type VoteCast,
  type SenatorInfo,
} from "../../../lib/congressApi";
import {
  GLOBAL_ISSUES,
  DOMESTIC_ISSUES,
  type BillDef,
  type IssueCategoryDef,
} from "../../../lib/billRegistry";

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
  subcategories: Subcategory[];
}

export interface SenatorScorecard {
  bioguide: string;
  name: string;
  globalIssues: IssueCategory[];
  domesticIssues: IssueCategory[];
}

// ─── Vote resolution ──────────────────────────────────────────────────────────

// Shared cache within a single request — avoids re-fetching the same XML
// for bills that share the same underlying legislation (e.g. IRA provisions).
type VoteMapCache = Map<string, Record<string, VoteCast>>;

async function resolveVoteMap(
  bill: BillDef,
  cache: VoteMapCache,
): Promise<Record<string, VoteCast> | null> {
  if (!bill.roll) return null;
  const { congress, billType, billNumber, index } = bill.roll;
  const key = `${congress}/${billType}/${billNumber}/${index}`;

  if (cache.has(key)) return cache.get(key)!;

  const refs = await getBillSenateRollCalls(congress, billType, billNumber);
  if (!refs.length) {
    cache.set(key, {});
    return {};
  }

  const idx = index < 0 ? refs.length + index : index;
  const ref = refs[Math.max(0, Math.min(idx, refs.length - 1))];
  const map = await getSenateVoteMap(ref.congress, ref.session, ref.rollNumber);
  cache.set(key, map);
  return map;
}

function castToMemberVote(cast: VoteCast): BillRecord["memberVote"] {
  if (cast === "Yea") return "Yes";
  if (cast === "Nay") return "No";
  return "Not Voting";
}

async function resolveBill(
  bill: BillDef,
  cache: VoteMapCache,
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
    const voteMap = await resolveVoteMap(bill, cache);
    if (!voteMap) {
      return { ...base, memberVote: bill.mockMemberVote, aligned: bill.mockAligned };
    }

    const lookupKey = `${senator.lastName}|${senator.stateAbbr}`;
    const cast = voteMap[lookupKey];

    if (!cast) {
      // Senator not found in XML (not in office, name mismatch) — use mock
      return { ...base, memberVote: bill.mockMemberVote, aligned: bill.mockAligned };
    }

    return {
      ...base,
      memberVote: castToMemberVote(cast),
      aligned: cast === bill.roll.alignedVote,
    };
  } catch {
    // API failure — fall back to mock values
    return { ...base, memberVote: bill.mockMemberVote, aligned: bill.mockAligned };
  }
}

async function resolveCategory(
  cat: IssueCategoryDef,
  cache: VoteMapCache,
  senator: SenatorInfo,
): Promise<IssueCategory> {
  return {
    id: cat.id,
    label: cat.label,
    subcategories: await Promise.all(
      cat.subcategories.map(async (sub) => ({
        id: sub.id,
        label: sub.label,
        bills: await Promise.all(sub.bills.map((b) => resolveBill(b, cache, senator))),
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

  const cache: VoteMapCache = new Map();

  const [globalIssues, domesticIssues] = await Promise.all([
    Promise.all(GLOBAL_ISSUES.map((cat) => resolveCategory(cat, cache, senator))),
    Promise.all(DOMESTIC_ISSUES.map((cat) => resolveCategory(cat, cache, senator))),
  ]);

  const scorecard: SenatorScorecard = {
    bioguide,
    name: senator.displayName,
    globalIssues,
    domesticIssues,
  };

  return NextResponse.json(scorecard, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
