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
  // true  = currently serving AND publicly planning to run in the next cycle
  // false = retiring, defeated, or seeking different office (e.g. Tuberville → AL Gov)
  runningAgain:  boolean;
  officialUrl:   string;
}

const senatorPhoto = (slug: string, ext: string) =>
  `/api/radar-image?key=${encodeURIComponent(`atlas-radar/senators/${slug}.${ext}`)}`;

// ── Raw bios ──────────────────────────────────────────────────────────────
// Ordered to match the hemicycle layout: most-prominent → innermost ring.
const RAW: Omit<SenatorBio, "officialUrl">[] = [
  // ── AYE voters (40) ─────────────────────────────────────────────────────
  { slug: "bernie-sanders",        bioguide: "S000033", name: "Bernie Sanders",         party: "I", state: "VT", vote: "Aye", ext: "jpeg", age: 84, yearsInOffice: 19, nextElection: 2030, runningAgain: true },
  { slug: "elizabeth-warren",      bioguide: "W000817", name: "Elizabeth Warren",       party: "D", state: "MA", vote: "Aye", ext: "jpeg", age: 76, yearsInOffice: 13, nextElection: 2030, runningAgain: true },
  { slug: "amy-klobuchar",         bioguide: "K000367", name: "Amy Klobuchar",          party: "D", state: "MN", vote: "Aye", ext: "jpeg", age: 65, yearsInOffice: 19, nextElection: 2030, runningAgain: true },
  { slug: "cory-booker",           bioguide: "B001288", name: "Cory Booker",            party: "D", state: "NJ", vote: "Aye", ext: "jpeg", age: 56, yearsInOffice: 12, nextElection: 2026, runningAgain: true },
  { slug: "adam-schiff",           bioguide: "S001150", name: "Adam Schiff",            party: "D", state: "CA", vote: "Aye", ext: "jpeg", age: 65, yearsInOffice: 1,  nextElection: 2030, runningAgain: true },
  { slug: "dick-durbin",           bioguide: "D000563", name: "Dick Durbin",            party: "D", state: "IL", vote: "Aye", ext: "jpeg", age: 81, yearsInOffice: 29, nextElection: 2026, runningAgain: false },
  { slug: "kirsten-gillibrand",    bioguide: "G000555", name: "Kirsten Gillibrand",     party: "D", state: "NY", vote: "Aye", ext: "jpeg", age: 59, yearsInOffice: 17, nextElection: 2030, runningAgain: true },
  { slug: "ron-wyden",             bioguide: "W000779", name: "Ron Wyden",              party: "D", state: "OR", vote: "Aye", ext: "jpeg", age: 76, yearsInOffice: 29, nextElection: 2028, runningAgain: true },
  { slug: "tammy-duckworth",       bioguide: "D000622", name: "Tammy Duckworth",        party: "D", state: "IL", vote: "Aye", ext: "jpeg", age: 58, yearsInOffice: 9,  nextElection: 2028, runningAgain: true },
  { slug: "raphael-warnock",       bioguide: "W000790", name: "Raphael Warnock",        party: "D", state: "GA", vote: "Aye", ext: "jpeg", age: 56, yearsInOffice: 5,  nextElection: 2028, runningAgain: true },
  { slug: "mark-kelly",            bioguide: "K000377", name: "Mark Kelly",             party: "D", state: "AZ", vote: "Aye", ext: "jpeg", age: 62, yearsInOffice: 5,  nextElection: 2028, runningAgain: true },
  { slug: "alex-padilla",          bioguide: "P000145", name: "Alex Padilla",           party: "D", state: "CA", vote: "Aye", ext: "jpeg", age: 53, yearsInOffice: 5,  nextElection: 2028, runningAgain: true },
  { slug: "angus-king",            bioguide: "K000383", name: "Angus King",             party: "I", state: "ME", vote: "Aye", ext: "jpeg", age: 82, yearsInOffice: 13, nextElection: 2030, runningAgain: true },
  { slug: "jon-ossoff",            bioguide: "O000174", name: "Jon Ossoff",             party: "D", state: "GA", vote: "Aye", ext: "jpeg", age: 39, yearsInOffice: 5,  nextElection: 2026, runningAgain: true },
  { slug: "sherrod-brown",         bioguide: "B000944", name: "Sherrod Brown",          party: "D", state: "OH", vote: "Aye", ext: "jpeg", age: 73, yearsInOffice: 19, nextElection: 2024, runningAgain: false },
  { slug: "patty-murray",          bioguide: "M001111", name: "Patty Murray",           party: "D", state: "WA", vote: "Aye", ext: "jpeg", age: 75, yearsInOffice: 33, nextElection: 2028, runningAgain: true },
  { slug: "maria-cantwell",        bioguide: "C000127", name: "Maria Cantwell",         party: "D", state: "WA", vote: "Aye", ext: "jpeg", age: 67, yearsInOffice: 25, nextElection: 2030, runningAgain: true },
  { slug: "bob-casey",             bioguide: "C001070", name: "Bob Casey",              party: "D", state: "PA", vote: "Aye", ext: "jpeg", age: 65, yearsInOffice: 18, nextElection: 2024, runningAgain: false },
  { slug: "jeff-merkley",          bioguide: "M001176", name: "Jeff Merkley",           party: "D", state: "OR", vote: "Aye", ext: "jpeg", age: 69, yearsInOffice: 17, nextElection: 2026, runningAgain: true },
  { slug: "ed-markey",             bioguide: "M000133", name: "Ed Markey",              party: "D", state: "MA", vote: "Aye", ext: "jpeg", age: 79, yearsInOffice: 12, nextElection: 2026, runningAgain: true },
  { slug: "tim-kaine",             bioguide: "K000384", name: "Tim Kaine",              party: "D", state: "VA", vote: "Aye", ext: "jpeg", age: 68, yearsInOffice: 13, nextElection: 2030, runningAgain: true },
  { slug: "mark-warner",           bioguide: "W000805", name: "Mark Warner",            party: "D", state: "VA", vote: "Aye", ext: "jpeg", age: 71, yearsInOffice: 17, nextElection: 2026, runningAgain: true },
  { slug: "mazie-hirono",          bioguide: "H001042", name: "Mazie Hirono",           party: "D", state: "HI", vote: "Aye", ext: "jpeg", age: 78, yearsInOffice: 13, nextElection: 2030, runningAgain: true },
  { slug: "tammy-baldwin",         bioguide: "B001230", name: "Tammy Baldwin",          party: "D", state: "WI", vote: "Aye", ext: "jpeg", age: 64, yearsInOffice: 13, nextElection: 2030, runningAgain: true },
  { slug: "catherine-cortez-masto",bioguide: "C001113", name: "Catherine Cortez Masto", party: "D", state: "NV", vote: "Aye", ext: "jpeg", age: 61, yearsInOffice: 9,  nextElection: 2028, runningAgain: true },
  { slug: "debbie-stabenow",       bioguide: "S000770", name: "Debbie Stabenow",        party: "D", state: "MI", vote: "Aye", ext: "jpeg", age: 75, yearsInOffice: 24, nextElection: 2024, runningAgain: false },
  { slug: "gary-peters",           bioguide: "P000595", name: "Gary Peters",            party: "D", state: "MI", vote: "Aye", ext: "jpeg", age: 67, yearsInOffice: 11, nextElection: 2026, runningAgain: false },
  { slug: "michael-bennet",        bioguide: "B001267", name: "Michael Bennet",         party: "D", state: "CO", vote: "Aye", ext: "jpeg", age: 61, yearsInOffice: 17, nextElection: 2028, runningAgain: true },
  { slug: "john-hickenlooper",     bioguide: "H001079", name: "John Hickenlooper",      party: "D", state: "CO", vote: "Aye", ext: "jpeg", age: 74, yearsInOffice: 5,  nextElection: 2026, runningAgain: true },
  { slug: "brian-schatz",          bioguide: "S001194", name: "Brian Schatz",           party: "D", state: "HI", vote: "Aye", ext: "jpeg", age: 53, yearsInOffice: 13, nextElection: 2028, runningAgain: true },
  { slug: "jacky-rosen",           bioguide: "R000608", name: "Jacky Rosen",            party: "D", state: "NV", vote: "Aye", ext: "jpeg", age: 68, yearsInOffice: 7,  nextElection: 2030, runningAgain: true },
  { slug: "ruben-gallego",         bioguide: "G000586", name: "Ruben Gallego",          party: "D", state: "AZ", vote: "Aye", ext: "jpeg", age: 46, yearsInOffice: 1,  nextElection: 2030, runningAgain: true },
  { slug: "martin-heinrich",       bioguide: "H001046", name: "Martin Heinrich",        party: "D", state: "NM", vote: "Aye", ext: "jpeg", age: 54, yearsInOffice: 13, nextElection: 2030, runningAgain: true },
  { slug: "tina-smith",            bioguide: "S001203", name: "Tina Smith",             party: "D", state: "MN", vote: "Aye", ext: "jpeg", age: 68, yearsInOffice: 8,  nextElection: 2026, runningAgain: false },
  { slug: "chris-van-hollen",      bioguide: "V000128", name: "Chris Van Hollen",       party: "D", state: "MD", vote: "Aye", ext: "jpeg", age: 67, yearsInOffice: 9,  nextElection: 2028, runningAgain: true },
  { slug: "ben-ray-lujan",         bioguide: "L000570", name: "Ben Ray Luján",          party: "D", state: "NM", vote: "Aye", ext: "jpeg", age: 53, yearsInOffice: 5,  nextElection: 2026, runningAgain: true },
  { slug: "jon-tester",            bioguide: "T000464", name: "Jon Tester",             party: "D", state: "MT", vote: "Aye", ext: "jpeg", age: 69, yearsInOffice: 18, nextElection: 2024, runningAgain: false },
  { slug: "angela-alsobrooks",     bioguide: "A000382", name: "Angela Alsobrooks",      party: "D", state: "MD", vote: "Aye", ext: "jpeg", age: 55, yearsInOffice: 1,  nextElection: 2030, runningAgain: true },
  { slug: "peter-welch",           bioguide: "W000800", name: "Peter Welch",            party: "D", state: "VT", vote: "Aye", ext: "jpeg", age: 78, yearsInOffice: 3,  nextElection: 2028, runningAgain: true },
  { slug: "andy-kim",              bioguide: "K000392", name: "Andy Kim",               party: "D", state: "NJ", vote: "Aye", ext: "jpeg", age: 43, yearsInOffice: 1,  nextElection: 2030, runningAgain: true },

  // ── NO voters — Crossover Dems (8) ─────────────────────────────────────
  { slug: "chuck-schumer",         bioguide: "S000148", name: "Chuck Schumer",          party: "D", state: "NY", vote: "No",  ext: "jpeg", age: 75, yearsInOffice: 27, nextElection: 2028, runningAgain: true },
  { slug: "john-fetterman",        bioguide: "F000479", name: "John Fetterman",         party: "D", state: "PA", vote: "No",  ext: "jpeg", age: 56, yearsInOffice: 3,  nextElection: 2028, runningAgain: true },
  { slug: "joe-manchin",           bioguide: "M001183", name: "Joe Manchin",            party: "D", state: "WV", vote: "No",  ext: "webp", age: 78, yearsInOffice: 14, nextElection: 2024, runningAgain: false },
  { slug: "jeanne-shaheen",        bioguide: "S001181", name: "Jeanne Shaheen",         party: "D", state: "NH", vote: "No",  ext: "jpeg", age: 79, yearsInOffice: 17, nextElection: 2026, runningAgain: false },
  { slug: "maggie-hassan",         bioguide: "H001076", name: "Maggie Hassan",          party: "D", state: "NH", vote: "No",  ext: "jpeg", age: 68, yearsInOffice: 9,  nextElection: 2028, runningAgain: true },
  { slug: "chris-coons",           bioguide: "C001088", name: "Chris Coons",            party: "D", state: "DE", vote: "No",  ext: "jpeg", age: 62, yearsInOffice: 15, nextElection: 2026, runningAgain: true },
  { slug: "elissa-slotkin",        bioguide: "S001227", name: "Elissa Slotkin",         party: "D", state: "MI", vote: "No",  ext: "webp", age: 49, yearsInOffice: 1,  nextElection: 2030, runningAgain: true },
  { slug: "tom-carper",            bioguide: "C000174", name: "Tom Carper",             party: "D", state: "DE", vote: "No",  ext: "jpeg", age: 79, yearsInOffice: 24, nextElection: 2024, runningAgain: false },

  // ── NO voters — Republicans + Sinema (ordered most prominent first) ────
  { slug: "mitch-mcconnell",       bioguide: "M000355", name: "Mitch McConnell",        party: "R", state: "KY", vote: "No",  ext: "jpeg", age: 84, yearsInOffice: 41, nextElection: 2026, runningAgain: false },
  { slug: "ted-cruz",              bioguide: "C001098", name: "Ted Cruz",               party: "R", state: "TX", vote: "No",  ext: "jpeg", age: 55, yearsInOffice: 13, nextElection: 2030, runningAgain: true },
  { slug: "marco-rubio",           bioguide: "R000595", name: "Marco Rubio",            party: "R", state: "FL", vote: "No",  ext: "jpeg", age: 54, yearsInOffice: 14, nextElection: 2028, runningAgain: true },
  { slug: "rand-paul",             bioguide: "P000603", name: "Rand Paul",              party: "R", state: "KY", vote: "No",  ext: "jpeg", age: 63, yearsInOffice: 15, nextElection: 2028, runningAgain: true },
  { slug: "lindsey-graham",        bioguide: "G000359", name: "Lindsey Graham",         party: "R", state: "SC", vote: "No",  ext: "jpeg", age: 70, yearsInOffice: 23, nextElection: 2026, runningAgain: true },
  { slug: "jd-vance",              bioguide: "V000137", name: "J.D. Vance",             party: "R", state: "OH", vote: "No",  ext: "jpeg", age: 41, yearsInOffice: 2,  nextElection: 2028, runningAgain: true },
  { slug: "josh-hawley",           bioguide: "H001089", name: "Josh Hawley",            party: "R", state: "MO", vote: "No",  ext: "jpeg", age: 46, yearsInOffice: 7,  nextElection: 2030, runningAgain: true },
  { slug: "susan-collins",         bioguide: "C001035", name: "Susan Collins",          party: "R", state: "ME", vote: "No",  ext: "jpeg", age: 73, yearsInOffice: 29, nextElection: 2026, runningAgain: true },
  { slug: "mitt-romney",           bioguide: "R000615", name: "Mitt Romney",            party: "R", state: "UT", vote: "No",  ext: "jpeg", age: 79, yearsInOffice: 6,  nextElection: 2024, runningAgain: false },
  { slug: "john-thune",            bioguide: "T000250", name: "John Thune",             party: "R", state: "SD", vote: "No",  ext: "jpeg", age: 65, yearsInOffice: 21, nextElection: 2028, runningAgain: true },
  { slug: "lisa-murkowski",        bioguide: "M001153", name: "Lisa Murkowski",         party: "R", state: "AK", vote: "No",  ext: "jpeg", age: 68, yearsInOffice: 23, nextElection: 2028, runningAgain: true },
  { slug: "john-cornyn",           bioguide: "C001056", name: "John Cornyn",            party: "R", state: "TX", vote: "No",  ext: "jpeg", age: 74, yearsInOffice: 23, nextElection: 2026, runningAgain: true },
  { slug: "chuck-grassley",        bioguide: "G000386", name: "Chuck Grassley",         party: "R", state: "IA", vote: "No",  ext: "jpeg", age: 92, yearsInOffice: 45, nextElection: 2028, runningAgain: true },
  { slug: "rick-scott",            bioguide: "S001217", name: "Rick Scott",             party: "R", state: "FL", vote: "No",  ext: "jpeg", age: 73, yearsInOffice: 7,  nextElection: 2030, runningAgain: true },
  { slug: "tim-scott",             bioguide: "S001184", name: "Tim Scott",              party: "R", state: "SC", vote: "No",  ext: "jpeg", age: 60, yearsInOffice: 13, nextElection: 2028, runningAgain: true },
  { slug: "kyrsten-sinema",        bioguide: "S001191", name: "Kyrsten Sinema",         party: "I", state: "AZ", vote: "No",  ext: "jpeg", age: 49, yearsInOffice: 6,  nextElection: 2024, runningAgain: false },
  { slug: "ron-johnson",           bioguide: "J000293", name: "Ron Johnson",            party: "R", state: "WI", vote: "No",  ext: "jpeg", age: 70, yearsInOffice: 15, nextElection: 2028, runningAgain: true },
  { slug: "marsha-blackburn",      bioguide: "B001243", name: "Marsha Blackburn",       party: "R", state: "TN", vote: "No",  ext: "jpeg", age: 73, yearsInOffice: 7,  nextElection: 2030, runningAgain: true },
  { slug: "bill-cassidy",          bioguide: "C001075", name: "Bill Cassidy",           party: "R", state: "LA", vote: "No",  ext: "jpeg", age: 68, yearsInOffice: 11, nextElection: 2026, runningAgain: true },
  { slug: "mike-lee",              bioguide: "L000577", name: "Mike Lee",               party: "R", state: "UT", vote: "No",  ext: "jpeg", age: 54, yearsInOffice: 15, nextElection: 2028, runningAgain: true },
  { slug: "joni-ernst",            bioguide: "E000295", name: "Joni Ernst",             party: "R", state: "IA", vote: "No",  ext: "jpeg", age: 55, yearsInOffice: 11, nextElection: 2026, runningAgain: true },
  { slug: "john-kennedy",          bioguide: "K000393", name: "John Kennedy",           party: "R", state: "LA", vote: "No",  ext: "jpeg", age: 74, yearsInOffice: 9,  nextElection: 2028, runningAgain: true },
  { slug: "bill-hagerty",          bioguide: "H000601", name: "Bill Hagerty",           party: "R", state: "TN", vote: "No",  ext: "jpeg", age: 66, yearsInOffice: 5,  nextElection: 2026, runningAgain: true },
  { slug: "roger-wicker",          bioguide: "W000437", name: "Roger Wicker",           party: "R", state: "MS", vote: "No",  ext: "jpeg", age: 74, yearsInOffice: 18, nextElection: 2030, runningAgain: true },
  { slug: "john-barrasso",         bioguide: "B001261", name: "John Barrasso",          party: "R", state: "WY", vote: "No",  ext: "jpeg", age: 73, yearsInOffice: 18, nextElection: 2030, runningAgain: true },
  { slug: "katie-britt",           bioguide: "B001319", name: "Katie Britt",            party: "R", state: "AL", vote: "No",  ext: "jpeg", age: 44, yearsInOffice: 3,  nextElection: 2028, runningAgain: true },
  { slug: "steve-daines",          bioguide: "D000618", name: "Steve Daines",           party: "R", state: "MT", vote: "No",  ext: "jpeg", age: 63, yearsInOffice: 11, nextElection: 2026, runningAgain: true },
  { slug: "jim-risch",             bioguide: "R000584", name: "Jim Risch",              party: "R", state: "ID", vote: "No",  ext: "jpeg", age: 82, yearsInOffice: 17, nextElection: 2026, runningAgain: true },
  { slug: "dan-sullivan",          bioguide: "S001198", name: "Dan Sullivan",           party: "R", state: "AK", vote: "No",  ext: "jpeg", age: 61, yearsInOffice: 11, nextElection: 2026, runningAgain: true },
  { slug: "mike-crapo",            bioguide: "C000880", name: "Mike Crapo",             party: "R", state: "ID", vote: "No",  ext: "jpeg", age: 74, yearsInOffice: 27, nextElection: 2028, runningAgain: true },
  { slug: "mike-rounds",           bioguide: "R000605", name: "Mike Rounds",            party: "R", state: "SD", vote: "No",  ext: "jpeg", age: 71, yearsInOffice: 11, nextElection: 2026, runningAgain: true },
  { slug: "tommy-tuberville",      bioguide: "T000278", name: "Tommy Tuberville",       party: "R", state: "AL", vote: "No",  ext: "jpeg", age: 71, yearsInOffice: 5,  nextElection: 2026, runningAgain: false },
  { slug: "thom-tillis",           bioguide: "T000476", name: "Thom Tillis",            party: "R", state: "NC", vote: "No",  ext: "jpeg", age: 65, yearsInOffice: 11, nextElection: 2026, runningAgain: false },
  { slug: "ted-budd",              bioguide: "B001305", name: "Ted Budd",               party: "R", state: "NC", vote: "No",  ext: "jpeg", age: 54, yearsInOffice: 3,  nextElection: 2028, runningAgain: true },
  { slug: "pete-ricketts",         bioguide: "R000618", name: "Pete Ricketts",          party: "R", state: "NE", vote: "No",  ext: "jpeg", age: 61, yearsInOffice: 3,  nextElection: 2026, runningAgain: true },
  { slug: "mike-braun",            bioguide: "B001310", name: "Mike Braun",             party: "R", state: "IN", vote: "No",  ext: "jpeg", age: 71, yearsInOffice: 6,  nextElection: 2024, runningAgain: false },
  { slug: "deb-fischer",           bioguide: "F000463", name: "Deb Fischer",            party: "R", state: "NE", vote: "No",  ext: "jpeg", age: 74, yearsInOffice: 13, nextElection: 2030, runningAgain: true },
  { slug: "todd-young",            bioguide: "Y000064", name: "Todd Young",             party: "R", state: "IN", vote: "No",  ext: "jpeg", age: 53, yearsInOffice: 9,  nextElection: 2028, runningAgain: true },
  { slug: "eric-schmitt",          bioguide: "S001231", name: "Eric Schmitt",           party: "R", state: "MO", vote: "No",  ext: "jpeg", age: 50, yearsInOffice: 3,  nextElection: 2028, runningAgain: true },
  { slug: "jerry-moran",           bioguide: "M000934", name: "Jerry Moran",            party: "R", state: "KS", vote: "No",  ext: "jpeg", age: 71, yearsInOffice: 15, nextElection: 2028, runningAgain: true },
  { slug: "james-lankford",        bioguide: "L000575", name: "James Lankford",         party: "R", state: "OK", vote: "No",  ext: "jpeg", age: 57, yearsInOffice: 11, nextElection: 2028, runningAgain: true },
  { slug: "cynthia-lummis",        bioguide: "L000571", name: "Cynthia Lummis",         party: "R", state: "WY", vote: "No",  ext: "jpeg", age: 71, yearsInOffice: 5,  nextElection: 2026, runningAgain: true },
  { slug: "cindy-hyde-smith",      bioguide: "H001079", name: "Cindy Hyde-Smith",       party: "R", state: "MS", vote: "No",  ext: "jpeg", age: 66, yearsInOffice: 8,  nextElection: 2026, runningAgain: true },
  { slug: "markwayne-mullin",      bioguide: "M001190", name: "Markwayne Mullin",       party: "R", state: "OK", vote: "No",  ext: "jpeg", age: 48, yearsInOffice: 3,  nextElection: 2026, runningAgain: true },
  { slug: "kevin-cramer",          bioguide: "C001096", name: "Kevin Cramer",           party: "R", state: "ND", vote: "No",  ext: "jpeg", age: 65, yearsInOffice: 7,  nextElection: 2030, runningAgain: true },
  { slug: "john-hoeven",           bioguide: "H001061", name: "John Hoeven",            party: "R", state: "ND", vote: "No",  ext: "jpeg", age: 68, yearsInOffice: 15, nextElection: 2028, runningAgain: true },
  { slug: "roger-marshall",        bioguide: "M001198", name: "Roger Marshall",         party: "R", state: "KS", vote: "No",  ext: "jpeg", age: 65, yearsInOffice: 5,  nextElection: 2026, runningAgain: true },
  { slug: "shelley-moore-capito",  bioguide: "C001047", name: "Shelley Moore Capito",   party: "R", state: "WV", vote: "No",  ext: "jpeg", age: 72, yearsInOffice: 11, nextElection: 2026, runningAgain: true },
];

// Verified one-by-one against live HTTP responses (see check-senate-urls.mjs
// commit history). Senate.gov for serving members; Ballotpedia for retired,
// defeated, or those who moved to the exec branch (Rubio → SecState,
// Vance → VP). Last-name collisions hand-tuned: Rick Scott uses
// rickscott.senate.gov, Tim Scott gets the plain scott.senate.gov; Lindsey
// Graham is lgraham.senate.gov because of past collisions; Tina Smith holds
// smith.senate.gov, Cindy Hyde-Smith uses hydesmith.senate.gov.
const OFFICIAL_URL: Record<string, string> = {
  "bernie-sanders":         "https://www.sanders.senate.gov/",
  "elizabeth-warren":       "https://www.warren.senate.gov/",
  "amy-klobuchar":          "https://www.klobuchar.senate.gov/",
  "cory-booker":            "https://www.booker.senate.gov/",
  "adam-schiff":            "https://www.schiff.senate.gov/",
  "dick-durbin":            "https://www.durbin.senate.gov/",
  "kirsten-gillibrand":     "https://www.gillibrand.senate.gov/",
  "ron-wyden":              "https://www.wyden.senate.gov/",
  "tammy-duckworth":        "https://www.duckworth.senate.gov/",
  "raphael-warnock":        "https://www.warnock.senate.gov/",
  "mark-kelly":             "https://www.kelly.senate.gov/",
  "alex-padilla":           "https://www.padilla.senate.gov/",
  "angus-king":             "https://www.king.senate.gov/",
  "jon-ossoff":             "https://www.ossoff.senate.gov/",
  "sherrod-brown":          "https://ballotpedia.org/Sherrod_Brown",
  "patty-murray":           "https://www.murray.senate.gov/",
  "maria-cantwell":         "https://www.cantwell.senate.gov/",
  "bob-casey":              "https://ballotpedia.org/Bob_Casey_Jr.",
  "jeff-merkley":           "https://www.merkley.senate.gov/",
  "ed-markey":              "https://www.markey.senate.gov/",
  "tim-kaine":              "https://www.kaine.senate.gov/",
  "mark-warner":            "https://www.warner.senate.gov/",
  "mazie-hirono":           "https://www.hirono.senate.gov/",
  "tammy-baldwin":          "https://www.baldwin.senate.gov/",
  "catherine-cortez-masto": "https://www.cortezmasto.senate.gov/",
  "debbie-stabenow":        "https://ballotpedia.org/Debbie_Stabenow",
  "gary-peters":            "https://www.peters.senate.gov/",
  "michael-bennet":         "https://www.bennet.senate.gov/",
  "john-hickenlooper":      "https://www.hickenlooper.senate.gov/",
  "brian-schatz":           "https://www.schatz.senate.gov/",
  "jacky-rosen":            "https://www.rosen.senate.gov/",
  "ruben-gallego":          "https://www.gallego.senate.gov/",
  "martin-heinrich":        "https://www.heinrich.senate.gov/",
  "tina-smith":             "https://www.smith.senate.gov/",
  "chris-van-hollen":       "https://www.vanhollen.senate.gov/",
  "ben-ray-lujan":          "https://www.lujan.senate.gov/",
  "jon-tester":             "https://ballotpedia.org/Jon_Tester",
  "angela-alsobrooks":      "https://www.alsobrooks.senate.gov/",
  "peter-welch":            "https://www.welch.senate.gov/",
  "andy-kim":               "https://www.kim.senate.gov/",
  "chuck-schumer":          "https://www.schumer.senate.gov/",
  "john-fetterman":         "https://www.fetterman.senate.gov/",
  "joe-manchin":            "https://ballotpedia.org/Joe_Manchin",
  "jeanne-shaheen":         "https://www.shaheen.senate.gov/",
  "maggie-hassan":          "https://www.hassan.senate.gov/",
  "chris-coons":            "https://www.coons.senate.gov/",
  "elissa-slotkin":         "https://www.slotkin.senate.gov/",
  "tom-carper":             "https://ballotpedia.org/Tom_Carper",
  "mitch-mcconnell":        "https://www.mcconnell.senate.gov/",
  "ted-cruz":               "https://www.cruz.senate.gov/",
  "marco-rubio":            "https://ballotpedia.org/Marco_Rubio",
  "rand-paul":              "https://www.paul.senate.gov/",
  "lindsey-graham":         "https://www.lgraham.senate.gov/",
  "jd-vance":               "https://ballotpedia.org/JD_Vance",
  "josh-hawley":            "https://www.hawley.senate.gov/",
  "susan-collins":          "https://www.collins.senate.gov/",
  "mitt-romney":            "https://ballotpedia.org/Mitt_Romney",
  "john-thune":             "https://www.thune.senate.gov/",
  "lisa-murkowski":         "https://www.murkowski.senate.gov/",
  "john-cornyn":            "https://www.cornyn.senate.gov/",
  "chuck-grassley":         "https://www.grassley.senate.gov/",
  "rick-scott":             "https://www.rickscott.senate.gov/",
  "tim-scott":              "https://www.scott.senate.gov/",
  "kyrsten-sinema":         "https://ballotpedia.org/Kyrsten_Sinema",
  "ron-johnson":            "https://www.ronjohnson.senate.gov/",
  "marsha-blackburn":       "https://www.blackburn.senate.gov/",
  "bill-cassidy":           "https://www.cassidy.senate.gov/",
  "mike-lee":               "https://www.lee.senate.gov/",
  "joni-ernst":             "https://www.ernst.senate.gov/",
  "john-kennedy":           "https://www.kennedy.senate.gov/",
  "bill-hagerty":           "https://www.hagerty.senate.gov/",
  "roger-wicker":           "https://www.wicker.senate.gov/",
  "john-barrasso":          "https://www.barrasso.senate.gov/",
  "katie-britt":            "https://www.britt.senate.gov/",
  "steve-daines":           "https://www.daines.senate.gov/",
  "jim-risch":              "https://www.risch.senate.gov/",
  "dan-sullivan":           "https://www.sullivan.senate.gov/",
  "mike-crapo":             "https://www.crapo.senate.gov/",
  "mike-rounds":            "https://www.rounds.senate.gov/",
  "tommy-tuberville":       "https://www.tuberville.senate.gov/",
  "thom-tillis":            "https://www.tillis.senate.gov/",
  "ted-budd":               "https://www.budd.senate.gov/",
  "pete-ricketts":          "https://www.ricketts.senate.gov/",
  "mike-braun":             "https://ballotpedia.org/Mike_Braun",
  "deb-fischer":            "https://www.fischer.senate.gov/",
  "todd-young":             "https://www.young.senate.gov/",
  "eric-schmitt":           "https://www.schmitt.senate.gov/",
  "jerry-moran":            "https://www.moran.senate.gov/",
  "james-lankford":         "https://www.lankford.senate.gov/",
  "cynthia-lummis":         "https://www.lummis.senate.gov/",
  "cindy-hyde-smith":       "https://www.hydesmith.senate.gov/",
  "markwayne-mullin":       "https://www.mullin.senate.gov/",
  "kevin-cramer":           "https://www.cramer.senate.gov/",
  "john-hoeven":            "https://www.hoeven.senate.gov/",
  "roger-marshall":         "https://www.marshall.senate.gov/",
  "shelley-moore-capito":   "https://www.capito.senate.gov/",
};

export const SENATOR_BIOS: Record<string, SenatorBio> = Object.fromEntries(
  RAW.map(r => [r.name, { ...r, officialUrl: OFFICIAL_URL[r.slug] ?? "" }])
);

// Runtime-computed photo URL (separate helper so the URL builder logic stays
// in one place and the bios file is purely data).
export const photoFor = (bio: SenatorBio): string => senatorPhoto(bio.slug, bio.ext);

export const RAW_BIOS = RAW;
