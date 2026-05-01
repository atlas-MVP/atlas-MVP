// ─── Congress.gov + Senate.gov API utilities ──────────────────────────────────

const CG_BASE = "https://api.congress.gov/v3";
const SENATE_XML_BASE =
  "https://www.senate.gov/legislative/LIS/roll_call_votes";

export type VoteCast = "Yea" | "Nay" | "Not Voting" | "Present";

export interface SenatorInfo {
  bioguide: string;
  lastName: string;
  stateAbbr: string;
  displayName: string;
}

export interface RollCallRef {
  congress: number;
  session: number;
  rollNumber: number;
}

// ─── Congress.gov fetch helper ────────────────────────────────────────────────

async function cgFetch(path: string, revalidate: number): Promise<unknown> {
  const key = process.env.CONGRESS_API_KEY;
  if (!key) throw new Error("CONGRESS_API_KEY not set");
  const url = `${CG_BASE}${path}?api_key=${encodeURIComponent(key)}&format=json&limit=250`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error(`Congress API ${res.status} for ${path}`);
  return res.json();
}

// ─── Member info ──────────────────────────────────────────────────────────────

export async function getSenatorInfo(bioguide: string): Promise<SenatorInfo> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await cgFetch(`/member/${bioguide}`, 86400 * 30)) as any;
  const m = data.member ?? data;
  const lastName: string = m.lastName ?? "";
  const rawState: string = m.state ?? "";
  const stateAbbr = STATE_ABBR[rawState] ?? rawState.substring(0, 2).toUpperCase();
  const displayName: string =
    m.directOrderName ??
    `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim();
  return { bioguide, lastName, stateAbbr, displayName };
}

// ─── Bill roll-call lookup ────────────────────────────────────────────────────

// Returns all Senate roll-call refs for a bill, in chronological order.
export async function getBillSenateRollCalls(
  congress: number,
  billType: string,
  billNumber: number,
): Promise<RollCallRef[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await cgFetch(
    `/bill/${congress}/${billType}/${billNumber}/actions`,
    86400,
  )) as any;
  const refs: RollCallRef[] = [];
  for (const action of data.actions ?? []) {
    for (const rv of action.recordedVotes ?? []) {
      if ((rv.chamber ?? "").toLowerCase() === "senate") {
        refs.push({
          congress,
          session: rv.sessionNumber,
          rollNumber: rv.rollNumber,
        });
      }
    }
  }
  return refs;
}

// ─── Senate.gov XML vote map ──────────────────────────────────────────────────

// Returns map of "LastName|STATE" → VoteCast for a given roll call.
export async function getSenateVoteMap(
  congress: number,
  session: number,
  rollNumber: number,
): Promise<Record<string, VoteCast>> {
  const pad = String(rollNumber).padStart(5, "0");
  const url = `${SENATE_XML_BASE}/vote${congress}${session}/vote_${congress}_${session}_${pad}.xml`;
  // Votes never change — cache essentially forever
  const res = await fetch(url, { next: { revalidate: 86400 * 365 } });
  if (!res.ok) throw new Error(`Senate XML ${res.status} for roll ${rollNumber}`);
  return parseVoteXml(await res.text());
}

function parseVoteXml(xml: string): Record<string, VoteCast> {
  const map: Record<string, VoteCast> = {};
  const re = /<member>([\s\S]*?)<\/member>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const last = xmlTag(block, "last_name");
    const state = xmlTag(block, "state");
    const cast = xmlTag(block, "vote_cast") as VoteCast;
    if (last && state) map[`${last}|${state}`] = cast;
  }
  return map;
}

function xmlTag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}>([^<]*)<\\/${name}>`));
  return m ? m[1].trim() : "";
}

// ─── State name → abbreviation ────────────────────────────────────────────────

const STATE_ABBR: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR",
  California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID",
  Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS",
  Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS",
  Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM",
  "New York": "NY", "North Carolina": "NC", "North Dakota": "ND",
  Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA",
  "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD",
  Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV",
  Wisconsin: "WI", Wyoming: "WY",
};
