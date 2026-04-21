// Complete senator roster for the "Senate blocks Israel aid amendment" article.
// Photos live in R2 at atlas-radar/senators/<slug>.<ext> and are served
// through /api/radar-image?key=… — the single R2 retrieval route.
//
// Factual bios as of April 2026. Senators who have since retired, resigned,
// or lost re-election have their last-completed term's election year listed
// as `nextElection`, prefixed in the card by "Up for re-election:".
//
// Bioguide IDs drive the official portrait URLs used during the R2 upload
// (see /upload-senators.mjs, run one time).

export interface SenatorBio {
  slug:          string;                            // used for R2 key
  bioguide:      string;                            // https://bioguide.congress.gov
  name:          string;
  party:         "R" | "D" | "I";
  state:         string;
  vote:          "Aye" | "No" | "Present" | "Not Voting";
  ext:           "jpeg" | "webp";                   // extension of the uploaded R2 object
  age:           number;
  yearsInOffice: number;
  nextElection:  number;
  officialUrl:   string;
}

const senatorPhoto = (slug: string, ext: string) =>
  `/api/radar-image?key=${encodeURIComponent(`atlas-radar/senators/${slug}.${ext}`)}`;

// ── Raw bios ──────────────────────────────────────────────────────────────
// Ordered to match the hemicycle layout: most-prominent → innermost ring.
const RAW: Omit<SenatorBio, "officialUrl">[] = [
  // ── AYE voters (40) ─────────────────────────────────────────────────────
  { slug: "bernie-sanders",        bioguide: "S000033", name: "Bernie Sanders",         party: "I", state: "VT", vote: "Aye", ext: "jpeg", age: 84, yearsInOffice: 19, nextElection: 2030 },
  { slug: "elizabeth-warren",      bioguide: "W000817", name: "Elizabeth Warren",       party: "D", state: "MA", vote: "Aye", ext: "jpeg", age: 76, yearsInOffice: 13, nextElection: 2030 },
  { slug: "amy-klobuchar",         bioguide: "K000367", name: "Amy Klobuchar",          party: "D", state: "MN", vote: "Aye", ext: "jpeg", age: 65, yearsInOffice: 19, nextElection: 2030 },
  { slug: "cory-booker",           bioguide: "B001288", name: "Cory Booker",            party: "D", state: "NJ", vote: "Aye", ext: "jpeg", age: 56, yearsInOffice: 12, nextElection: 2026 },
  { slug: "adam-schiff",           bioguide: "S001150", name: "Adam Schiff",            party: "D", state: "CA", vote: "Aye", ext: "jpeg", age: 65, yearsInOffice: 1,  nextElection: 2030 },
  { slug: "dick-durbin",           bioguide: "D000563", name: "Dick Durbin",            party: "D", state: "IL", vote: "Aye", ext: "jpeg", age: 81, yearsInOffice: 29, nextElection: 2026 },
  { slug: "kirsten-gillibrand",    bioguide: "G000555", name: "Kirsten Gillibrand",     party: "D", state: "NY", vote: "Aye", ext: "jpeg", age: 59, yearsInOffice: 17, nextElection: 2030 },
  { slug: "ron-wyden",             bioguide: "W000779", name: "Ron Wyden",              party: "D", state: "OR", vote: "Aye", ext: "jpeg", age: 76, yearsInOffice: 29, nextElection: 2028 },
  { slug: "tammy-duckworth",       bioguide: "D000622", name: "Tammy Duckworth",        party: "D", state: "IL", vote: "Aye", ext: "jpeg", age: 58, yearsInOffice: 9,  nextElection: 2028 },
  { slug: "raphael-warnock",       bioguide: "W000790", name: "Raphael Warnock",        party: "D", state: "GA", vote: "Aye", ext: "jpeg", age: 56, yearsInOffice: 5,  nextElection: 2028 },
  { slug: "mark-kelly",            bioguide: "K000377", name: "Mark Kelly",             party: "D", state: "AZ", vote: "Aye", ext: "jpeg", age: 62, yearsInOffice: 5,  nextElection: 2028 },
  { slug: "alex-padilla",          bioguide: "P000145", name: "Alex Padilla",           party: "D", state: "CA", vote: "Aye", ext: "jpeg", age: 53, yearsInOffice: 5,  nextElection: 2028 },
  { slug: "angus-king",            bioguide: "K000383", name: "Angus King",             party: "I", state: "ME", vote: "Aye", ext: "jpeg", age: 82, yearsInOffice: 13, nextElection: 2030 },
  { slug: "jon-ossoff",            bioguide: "O000174", name: "Jon Ossoff",             party: "D", state: "GA", vote: "Aye", ext: "jpeg", age: 39, yearsInOffice: 5,  nextElection: 2026 },
  { slug: "sherrod-brown",         bioguide: "B000944", name: "Sherrod Brown",          party: "D", state: "OH", vote: "Aye", ext: "jpeg", age: 73, yearsInOffice: 19, nextElection: 2024 },
  { slug: "patty-murray",          bioguide: "M001111", name: "Patty Murray",           party: "D", state: "WA", vote: "Aye", ext: "jpeg", age: 75, yearsInOffice: 33, nextElection: 2028 },
  { slug: "maria-cantwell",        bioguide: "C000127", name: "Maria Cantwell",         party: "D", state: "WA", vote: "Aye", ext: "jpeg", age: 67, yearsInOffice: 25, nextElection: 2030 },
  { slug: "bob-casey",             bioguide: "C001070", name: "Bob Casey",              party: "D", state: "PA", vote: "Aye", ext: "jpeg", age: 65, yearsInOffice: 18, nextElection: 2024 },
  { slug: "jeff-merkley",          bioguide: "M001176", name: "Jeff Merkley",           party: "D", state: "OR", vote: "Aye", ext: "jpeg", age: 69, yearsInOffice: 17, nextElection: 2026 },
  { slug: "ed-markey",             bioguide: "M000133", name: "Ed Markey",              party: "D", state: "MA", vote: "Aye", ext: "jpeg", age: 79, yearsInOffice: 12, nextElection: 2026 },
  { slug: "tim-kaine",             bioguide: "K000384", name: "Tim Kaine",              party: "D", state: "VA", vote: "Aye", ext: "jpeg", age: 68, yearsInOffice: 13, nextElection: 2030 },
  { slug: "mark-warner",           bioguide: "W000805", name: "Mark Warner",            party: "D", state: "VA", vote: "Aye", ext: "jpeg", age: 71, yearsInOffice: 17, nextElection: 2026 },
  { slug: "mazie-hirono",          bioguide: "H001042", name: "Mazie Hirono",           party: "D", state: "HI", vote: "Aye", ext: "jpeg", age: 78, yearsInOffice: 13, nextElection: 2030 },
  { slug: "tammy-baldwin",         bioguide: "B001230", name: "Tammy Baldwin",          party: "D", state: "WI", vote: "Aye", ext: "jpeg", age: 64, yearsInOffice: 13, nextElection: 2030 },
  { slug: "catherine-cortez-masto",bioguide: "C001113", name: "Catherine Cortez Masto", party: "D", state: "NV", vote: "Aye", ext: "jpeg", age: 61, yearsInOffice: 9,  nextElection: 2028 },
  { slug: "debbie-stabenow",       bioguide: "S000770", name: "Debbie Stabenow",        party: "D", state: "MI", vote: "Aye", ext: "jpeg", age: 75, yearsInOffice: 24, nextElection: 2024 },
  { slug: "gary-peters",           bioguide: "P000595", name: "Gary Peters",            party: "D", state: "MI", vote: "Aye", ext: "jpeg", age: 67, yearsInOffice: 11, nextElection: 2026 },
  { slug: "michael-bennet",        bioguide: "B001267", name: "Michael Bennet",         party: "D", state: "CO", vote: "Aye", ext: "jpeg", age: 61, yearsInOffice: 17, nextElection: 2028 },
  { slug: "john-hickenlooper",     bioguide: "H001079", name: "John Hickenlooper",      party: "D", state: "CO", vote: "Aye", ext: "jpeg", age: 74, yearsInOffice: 5,  nextElection: 2026 },
  { slug: "brian-schatz",          bioguide: "S001194", name: "Brian Schatz",           party: "D", state: "HI", vote: "Aye", ext: "jpeg", age: 53, yearsInOffice: 13, nextElection: 2028 },
  { slug: "jacky-rosen",           bioguide: "R000608", name: "Jacky Rosen",            party: "D", state: "NV", vote: "Aye", ext: "jpeg", age: 68, yearsInOffice: 7,  nextElection: 2030 },
  { slug: "ruben-gallego",         bioguide: "G000586", name: "Ruben Gallego",          party: "D", state: "AZ", vote: "Aye", ext: "jpeg", age: 46, yearsInOffice: 1,  nextElection: 2030 },
  { slug: "martin-heinrich",       bioguide: "H001046", name: "Martin Heinrich",        party: "D", state: "NM", vote: "Aye", ext: "jpeg", age: 54, yearsInOffice: 13, nextElection: 2030 },
  { slug: "tina-smith",            bioguide: "S001203", name: "Tina Smith",             party: "D", state: "MN", vote: "Aye", ext: "jpeg", age: 68, yearsInOffice: 8,  nextElection: 2026 },
  { slug: "chris-van-hollen",      bioguide: "V000128", name: "Chris Van Hollen",       party: "D", state: "MD", vote: "Aye", ext: "jpeg", age: 67, yearsInOffice: 9,  nextElection: 2028 },
  { slug: "ben-ray-lujan",         bioguide: "L000570", name: "Ben Ray Luján",          party: "D", state: "NM", vote: "Aye", ext: "jpeg", age: 53, yearsInOffice: 5,  nextElection: 2026 },
  { slug: "jon-tester",            bioguide: "T000464", name: "Jon Tester",             party: "D", state: "MT", vote: "Aye", ext: "jpeg", age: 69, yearsInOffice: 18, nextElection: 2024 },
  { slug: "angela-alsobrooks",     bioguide: "A000382", name: "Angela Alsobrooks",      party: "D", state: "MD", vote: "Aye", ext: "jpeg", age: 55, yearsInOffice: 1,  nextElection: 2030 },
  { slug: "peter-welch",           bioguide: "W000800", name: "Peter Welch",            party: "D", state: "VT", vote: "Aye", ext: "jpeg", age: 78, yearsInOffice: 3,  nextElection: 2028 },
  { slug: "andy-kim",              bioguide: "K000392", name: "Andy Kim",               party: "D", state: "NJ", vote: "Aye", ext: "jpeg", age: 43, yearsInOffice: 1,  nextElection: 2030 },

  // ── NO voters — Crossover Dems (8) ─────────────────────────────────────
  { slug: "chuck-schumer",         bioguide: "S000148", name: "Chuck Schumer",          party: "D", state: "NY", vote: "No",  ext: "jpeg", age: 75, yearsInOffice: 27, nextElection: 2028 },
  { slug: "john-fetterman",        bioguide: "F000479", name: "John Fetterman",         party: "D", state: "PA", vote: "No",  ext: "jpeg", age: 56, yearsInOffice: 3,  nextElection: 2028 },
  { slug: "joe-manchin",           bioguide: "M001183", name: "Joe Manchin",            party: "D", state: "WV", vote: "No",  ext: "webp", age: 78, yearsInOffice: 14, nextElection: 2024 },
  { slug: "jeanne-shaheen",        bioguide: "S001181", name: "Jeanne Shaheen",         party: "D", state: "NH", vote: "No",  ext: "jpeg", age: 79, yearsInOffice: 17, nextElection: 2026 },
  { slug: "maggie-hassan",         bioguide: "H001076", name: "Maggie Hassan",          party: "D", state: "NH", vote: "No",  ext: "jpeg", age: 68, yearsInOffice: 9,  nextElection: 2028 },
  { slug: "chris-coons",           bioguide: "C001088", name: "Chris Coons",            party: "D", state: "DE", vote: "No",  ext: "jpeg", age: 62, yearsInOffice: 15, nextElection: 2026 },
  { slug: "elissa-slotkin",        bioguide: "S001227", name: "Elissa Slotkin",         party: "D", state: "MI", vote: "No",  ext: "webp", age: 49, yearsInOffice: 1,  nextElection: 2030 },
  { slug: "tom-carper",            bioguide: "C000174", name: "Tom Carper",             party: "D", state: "DE", vote: "No",  ext: "jpeg", age: 79, yearsInOffice: 24, nextElection: 2024 },

  // ── NO voters — Republicans + Sinema (ordered most prominent first) ────
  { slug: "mitch-mcconnell",       bioguide: "M000355", name: "Mitch McConnell",        party: "R", state: "KY", vote: "No",  ext: "jpeg", age: 84, yearsInOffice: 41, nextElection: 2026 },
  { slug: "ted-cruz",              bioguide: "C001098", name: "Ted Cruz",               party: "R", state: "TX", vote: "No",  ext: "jpeg", age: 55, yearsInOffice: 13, nextElection: 2030 },
  { slug: "marco-rubio",           bioguide: "R000595", name: "Marco Rubio",            party: "R", state: "FL", vote: "No",  ext: "jpeg", age: 54, yearsInOffice: 14, nextElection: 2028 },
  { slug: "rand-paul",             bioguide: "P000603", name: "Rand Paul",              party: "R", state: "KY", vote: "No",  ext: "jpeg", age: 63, yearsInOffice: 15, nextElection: 2028 },
  { slug: "lindsey-graham",        bioguide: "G000359", name: "Lindsey Graham",         party: "R", state: "SC", vote: "No",  ext: "jpeg", age: 70, yearsInOffice: 23, nextElection: 2026 },
  { slug: "jd-vance",              bioguide: "V000137", name: "J.D. Vance",             party: "R", state: "OH", vote: "No",  ext: "jpeg", age: 41, yearsInOffice: 2,  nextElection: 2028 },
  { slug: "josh-hawley",           bioguide: "H001089", name: "Josh Hawley",            party: "R", state: "MO", vote: "No",  ext: "jpeg", age: 46, yearsInOffice: 7,  nextElection: 2030 },
  { slug: "susan-collins",         bioguide: "C001035", name: "Susan Collins",          party: "R", state: "ME", vote: "No",  ext: "jpeg", age: 73, yearsInOffice: 29, nextElection: 2026 },
  { slug: "mitt-romney",           bioguide: "R000615", name: "Mitt Romney",            party: "R", state: "UT", vote: "No",  ext: "jpeg", age: 79, yearsInOffice: 6,  nextElection: 2024 },
  { slug: "john-thune",            bioguide: "T000250", name: "John Thune",             party: "R", state: "SD", vote: "No",  ext: "jpeg", age: 65, yearsInOffice: 21, nextElection: 2028 },
  { slug: "lisa-murkowski",        bioguide: "M001153", name: "Lisa Murkowski",         party: "R", state: "AK", vote: "No",  ext: "jpeg", age: 68, yearsInOffice: 23, nextElection: 2028 },
  { slug: "john-cornyn",           bioguide: "C001056", name: "John Cornyn",            party: "R", state: "TX", vote: "No",  ext: "jpeg", age: 74, yearsInOffice: 23, nextElection: 2026 },
  { slug: "chuck-grassley",        bioguide: "G000386", name: "Chuck Grassley",         party: "R", state: "IA", vote: "No",  ext: "jpeg", age: 92, yearsInOffice: 45, nextElection: 2028 },
  { slug: "rick-scott",            bioguide: "S001217", name: "Rick Scott",             party: "R", state: "FL", vote: "No",  ext: "jpeg", age: 73, yearsInOffice: 7,  nextElection: 2030 },
  { slug: "tim-scott",             bioguide: "S001184", name: "Tim Scott",              party: "R", state: "SC", vote: "No",  ext: "jpeg", age: 60, yearsInOffice: 13, nextElection: 2028 },
  { slug: "kyrsten-sinema",        bioguide: "S001191", name: "Kyrsten Sinema",         party: "I", state: "AZ", vote: "No",  ext: "jpeg", age: 49, yearsInOffice: 6,  nextElection: 2024 },
  { slug: "ron-johnson",           bioguide: "J000293", name: "Ron Johnson",            party: "R", state: "WI", vote: "No",  ext: "jpeg", age: 70, yearsInOffice: 15, nextElection: 2028 },
  { slug: "marsha-blackburn",      bioguide: "B001243", name: "Marsha Blackburn",       party: "R", state: "TN", vote: "No",  ext: "jpeg", age: 73, yearsInOffice: 7,  nextElection: 2030 },
  { slug: "bill-cassidy",          bioguide: "C001075", name: "Bill Cassidy",           party: "R", state: "LA", vote: "No",  ext: "jpeg", age: 68, yearsInOffice: 11, nextElection: 2026 },
  { slug: "mike-lee",              bioguide: "L000577", name: "Mike Lee",               party: "R", state: "UT", vote: "No",  ext: "jpeg", age: 54, yearsInOffice: 15, nextElection: 2028 },
  { slug: "joni-ernst",            bioguide: "E000295", name: "Joni Ernst",             party: "R", state: "IA", vote: "No",  ext: "jpeg", age: 55, yearsInOffice: 11, nextElection: 2026 },
  { slug: "john-kennedy",          bioguide: "K000393", name: "John Kennedy",           party: "R", state: "LA", vote: "No",  ext: "jpeg", age: 74, yearsInOffice: 9,  nextElection: 2028 },
  { slug: "bill-hagerty",          bioguide: "H000601", name: "Bill Hagerty",           party: "R", state: "TN", vote: "No",  ext: "jpeg", age: 66, yearsInOffice: 5,  nextElection: 2026 },
  { slug: "roger-wicker",          bioguide: "W000437", name: "Roger Wicker",           party: "R", state: "MS", vote: "No",  ext: "jpeg", age: 74, yearsInOffice: 18, nextElection: 2030 },
  { slug: "john-barrasso",         bioguide: "B001261", name: "John Barrasso",          party: "R", state: "WY", vote: "No",  ext: "jpeg", age: 73, yearsInOffice: 18, nextElection: 2030 },
  { slug: "katie-britt",           bioguide: "B001319", name: "Katie Britt",            party: "R", state: "AL", vote: "No",  ext: "jpeg", age: 44, yearsInOffice: 3,  nextElection: 2028 },
  { slug: "steve-daines",          bioguide: "D000618", name: "Steve Daines",           party: "R", state: "MT", vote: "No",  ext: "jpeg", age: 63, yearsInOffice: 11, nextElection: 2026 },
  { slug: "jim-risch",             bioguide: "R000584", name: "Jim Risch",              party: "R", state: "ID", vote: "No",  ext: "jpeg", age: 82, yearsInOffice: 17, nextElection: 2026 },
  { slug: "dan-sullivan",          bioguide: "S001198", name: "Dan Sullivan",           party: "R", state: "AK", vote: "No",  ext: "jpeg", age: 61, yearsInOffice: 11, nextElection: 2026 },
  { slug: "mike-crapo",            bioguide: "C000880", name: "Mike Crapo",             party: "R", state: "ID", vote: "No",  ext: "jpeg", age: 74, yearsInOffice: 27, nextElection: 2028 },
  { slug: "mike-rounds",           bioguide: "R000605", name: "Mike Rounds",            party: "R", state: "SD", vote: "No",  ext: "jpeg", age: 71, yearsInOffice: 11, nextElection: 2026 },
  { slug: "tommy-tuberville",      bioguide: "T000278", name: "Tommy Tuberville",       party: "R", state: "AL", vote: "No",  ext: "jpeg", age: 71, yearsInOffice: 5,  nextElection: 2026 },
  { slug: "thom-tillis",           bioguide: "T000476", name: "Thom Tillis",            party: "R", state: "NC", vote: "No",  ext: "jpeg", age: 65, yearsInOffice: 11, nextElection: 2026 },
  { slug: "ted-budd",              bioguide: "B001305", name: "Ted Budd",               party: "R", state: "NC", vote: "No",  ext: "jpeg", age: 54, yearsInOffice: 3,  nextElection: 2028 },
  { slug: "pete-ricketts",         bioguide: "R000618", name: "Pete Ricketts",          party: "R", state: "NE", vote: "No",  ext: "jpeg", age: 61, yearsInOffice: 3,  nextElection: 2026 },
  { slug: "mike-braun",            bioguide: "B001310", name: "Mike Braun",             party: "R", state: "IN", vote: "No",  ext: "jpeg", age: 71, yearsInOffice: 6,  nextElection: 2024 },
  { slug: "deb-fischer",           bioguide: "F000463", name: "Deb Fischer",            party: "R", state: "NE", vote: "No",  ext: "jpeg", age: 74, yearsInOffice: 13, nextElection: 2030 },
  { slug: "todd-young",            bioguide: "Y000064", name: "Todd Young",             party: "R", state: "IN", vote: "No",  ext: "jpeg", age: 53, yearsInOffice: 9,  nextElection: 2028 },
  { slug: "eric-schmitt",          bioguide: "S001231", name: "Eric Schmitt",           party: "R", state: "MO", vote: "No",  ext: "jpeg", age: 50, yearsInOffice: 3,  nextElection: 2028 },
  { slug: "jerry-moran",           bioguide: "M000934", name: "Jerry Moran",            party: "R", state: "KS", vote: "No",  ext: "jpeg", age: 71, yearsInOffice: 15, nextElection: 2028 },
  { slug: "james-lankford",        bioguide: "L000575", name: "James Lankford",         party: "R", state: "OK", vote: "No",  ext: "jpeg", age: 57, yearsInOffice: 11, nextElection: 2028 },
  { slug: "cynthia-lummis",        bioguide: "L000571", name: "Cynthia Lummis",         party: "R", state: "WY", vote: "No",  ext: "jpeg", age: 71, yearsInOffice: 5,  nextElection: 2026 },
  { slug: "cindy-hyde-smith",      bioguide: "H001079", name: "Cindy Hyde-Smith",       party: "R", state: "MS", vote: "No",  ext: "jpeg", age: 66, yearsInOffice: 8,  nextElection: 2026 },
  { slug: "markwayne-mullin",      bioguide: "M001190", name: "Markwayne Mullin",       party: "R", state: "OK", vote: "No",  ext: "jpeg", age: 48, yearsInOffice: 3,  nextElection: 2026 },
  { slug: "kevin-cramer",          bioguide: "C001096", name: "Kevin Cramer",           party: "R", state: "ND", vote: "No",  ext: "jpeg", age: 65, yearsInOffice: 7,  nextElection: 2030 },
  { slug: "john-hoeven",           bioguide: "H001061", name: "John Hoeven",            party: "R", state: "ND", vote: "No",  ext: "jpeg", age: 68, yearsInOffice: 15, nextElection: 2028 },
  { slug: "roger-marshall",        bioguide: "M001198", name: "Roger Marshall",         party: "R", state: "KS", vote: "No",  ext: "jpeg", age: 65, yearsInOffice: 5,  nextElection: 2026 },
  { slug: "shelley-moore-capito",  bioguide: "C001047", name: "Shelley Moore Capito",   party: "R", state: "WV", vote: "No",  ext: "jpeg", age: 72, yearsInOffice: 11, nextElection: 2026 },
];

const officialUrl = (slug: string): string => {
  // Official Senate sites follow <lastname>.senate.gov — strip the first-name
  // segment from the slug. Handles hyphenated names ("ben-ray-lujan" →
  // "lujan.senate.gov") and dots ("jd-vance" → "vance.senate.gov").
  const parts = slug.split("-");
  const last  = parts[parts.length - 1];
  return `https://www.${last}.senate.gov`;
};

export const SENATOR_BIOS: Record<string, SenatorBio> = Object.fromEntries(
  RAW.map(r => [r.name, { ...r, photo: undefined, officialUrl: officialUrl(r.slug) } as unknown as SenatorBio])
);

// Runtime-computed photo URL (separate helper so the URL builder logic stays
// in one place and the bios file is purely data).
export const photoFor = (bio: SenatorBio): string => senatorPhoto(bio.slug, bio.ext);

export const RAW_BIOS = RAW;
