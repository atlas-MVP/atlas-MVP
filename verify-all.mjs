// One-shot auditor + uploader for app/components/senatorBios.ts.
//
//   Phase 1 — URL AUDIT
//     Every officialUrl must return < 400 AND its <title> must contain the
//     senator's last name. Prints BAD_URL for any failure.
//
//   Phase 2 — BIOGUIDE + PHOTO AUDIT / RE-UPLOAD
//     For every senator, fetch the highest-resolution portrait we can find:
//       a) https://bioguide.congress.gov/bioguide/photo/<L>/<ID>.jpg   (≈800×1000)
//       b) https://www.congress.gov/img/member/<id>_200.jpg             (200×250)
//     Whichever returns 200 first wins. We then PUT it to R2 at
//     atlas-radar/senators/<slug>.<ext> so /api/radar-image?key=… serves it.
//     The upload is gated behind the UPLOAD=1 env flag so dry-runs are safe.
//
// Usage:
//   node verify-all.mjs              # dry-run, verify only
//   UPLOAD=1 node verify-all.mjs     # verify + re-upload every portrait
//   ONLY=bernie-sanders,elizabeth-warren node verify-all.mjs   # subset

import { readFileSync }              from "node:fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Tiny .env.local loader (project has no dotenv dep).
try {
  const envText = readFileSync(".env.local", "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const v = m[2].replace(/^['"]|['"]$/g, "");
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
} catch {}

// ── Parse RAW rows from senatorBios.ts ────────────────────────────────────
const src = readFileSync("app/components/senatorBios.ts", "utf8");
const ROW_RE = /\{\s*slug:\s*"([^"]+)",\s*bioguide:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*party:\s*"([^"]+)",\s*state:\s*"([^"]+)"/g;
const rows = [];
let m;
while ((m = ROW_RE.exec(src)) !== null) {
  rows.push({ slug: m[1], bioguide: m[2], name: m[3], party: m[4], state: m[5] });
}

const URL_RE = /"([^"]+)":\s*"(https?:\/\/[^"]+)"/g;
const urlMap = {};
const urlBlock = src.match(/const OFFICIAL_URL[^{]*\{([\s\S]+?)\n\};/)?.[1] ?? "";
while ((m = URL_RE.exec(urlBlock)) !== null) urlMap[m[1]] = m[2];

const onlyList = (process.env.ONLY ?? "").split(",").filter(Boolean);
const filtered = onlyList.length
  ? rows.filter(r => onlyList.includes(r.slug))
  : rows;

console.log(`Parsed ${rows.length} senators, ${Object.keys(urlMap).length} URLs; processing ${filtered.length}.\n`);

// ── HTTP helpers ──────────────────────────────────────────────────────────
async function get(url, asBuffer = false, depth = 0) {
  try {
    const res = await fetch(url, {
      method:   "GET",
      redirect: "follow",
      headers:  { "User-Agent": "Mozilla/5.0 (compatible; AtlasRadar/1.0)" },
      signal:   AbortSignal.timeout(30000),
    });
    if (res.status >= 400) return { status: res.status };
    if (asBuffer) {
      const buf = Buffer.from(await res.arrayBuffer());
      return { status: res.status, body: buf, contentType: res.headers.get("content-type") ?? "" };
    }
    const body = await res.text();
    // Follow meta-refresh one level (senate.gov bases all redirect to /public/)
    if (depth < 2) {
      const refresh = body.match(/<meta[^>]+http-equiv=["']?refresh["']?[^>]+URL=([^"'>]+)/i)?.[1];
      if (refresh) return get(refresh.trim(), false, depth + 1);
    }
    return { status: res.status, body, finalUrl: res.url };
  } catch (err) {
    return { status: 0, err: err.message };
  }
}

const titleOf = body => (body?.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();
const lastNameOf = name => name.replace(/[.,]/g, "").trim().split(/\s+/).pop().toLowerCase();

// ── R2 client (only used when UPLOAD=1) ───────────────────────────────────
const shouldUpload = process.env.UPLOAD === "1";
const clean = v => (v ?? "").trim();
const r2 = shouldUpload
  ? new S3Client({
      region:      "auto",
      endpoint:    clean(process.env.R2_ENDPOINT),
      credentials: {
        accessKeyId:     clean(process.env.R2_ACCESS_KEY_ID),
        secretAccessKey: clean(process.env.R2_SECRET_ACCESS_KEY),
      },
    })
  : null;
const BUCKET = clean(process.env.R2_BUCKET) || "atlas-media";

async function uploadToR2(slug, buf, ext) {
  if (!shouldUpload) return;
  const Key = `atlas-radar/senators/${slug}.${ext}`;
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key,
    Body:   buf,
    ContentType: ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png",
  }));
}

// Bioguide gives us ~45KB 180×225 photos. Wikipedia (Commons) hosts the
// official Senate portrait at up to 2000×3000px, and we can request a
// specific-width thumb to keep payload reasonable. We prefer Wikipedia first.
function bioguideUrls(id) {
  return [`https://bioguide.congress.gov/photo/${id}.jpg`];
}

// Slug → Wikipedia page title override for ambiguous names. Wikipedia's page
// for "Tim Scott" is a disambig — we need "Tim Scott (American politician)".
const WIKI_OVERRIDE = {
  "tim-scott":              "Tim_Scott",
  "rick-scott":             "Rick_Scott",
  "jim-banks":              "Jim_Banks_(politician)",
  "jim-justice":            "Jim_Justice",
  "lindsey-graham":         "Lindsey_Graham",
  "mike-lee":               "Mike_Lee_(American_politician)",
  "john-kennedy":           "John_Kennedy_(Louisiana_politician)",
  "chris-murphy":           "Chris_Murphy",
  "mark-kelly":             "Mark_Kelly_(astronaut)",
  "roger-marshall":         "Roger_Marshall_(politician)",
  "john-hoeven":            "John_Hoeven",
  "kelly-armstrong":        "Kelly_Armstrong",
  "ashley-moody":           "Ashley_Moody",
  "jon-husted":             "Jon_Husted",
  "bernie-moreno":          "Bernie_Moreno",
  "dave-mccormick":         "Dave_McCormick",
  "tim-sheehy":             "Tim_Sheehy",
  "ted-budd":               "Ted_Budd",
  "john-curtis":            "John_Curtis_(politician)",
  "mike-rounds":            "Mike_Rounds",
  "todd-young":             "Todd_Young",
  "mike-braun":             "Mike_Braun",
  "tom-cotton":             "Tom_Cotton",
  "eric-schmitt":           "Eric_Schmitt",
  "richard-blumenthal":     "Richard_Blumenthal",
  "john-boozman":           "John_Boozman",
  "peter-welch":            "Peter_Welch",
  "andy-kim":               "Andy_Kim_(politician)",
  "angela-alsobrooks":      "Angela_Alsobrooks",
  "lisa-blunt-rochester":   "Lisa_Blunt_Rochester",
};

function wikiTitleFor(row) {
  return WIKI_OVERRIDE[row.slug] ?? row.name.replace(/\s+/g, "_");
}

// Fetch the Wikipedia page summary and return the "originalimage" URL
// rewritten to an 800px thumbnail so the file size stays ~100-250KB. The
// originalimage is often 2000+px which would bloat R2 and hurt page load.
async function wikiPhotoUrl(title) {
  const summary = await get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
  if (summary.status >= 400 || !summary.body) return null;
  let json;
  try { json = JSON.parse(summary.body); } catch { return null; }
  const orig = json?.originalimage?.source;
  if (!orig) return null;
  // Rewrite: upload.wikimedia.org/wikipedia/commons/<a>/<ab>/<name>.jpg
  //      →   upload.wikimedia.org/wikipedia/commons/thumb/<a>/<ab>/<name>.jpg/800px-<name>.jpg
  const m = orig.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/)([0-9a-f]\/[0-9a-f]{2})\/([^/]+)$/);
  if (!m) return orig;
  const filename = m[3];
  // If filename ends with svg, thumbs need a .png suffix — but senators use jpg/png.
  return `${m[1]}thumb/${m[2]}/${filename}/800px-${filename}`;
}

// ── 1. URL audit ──────────────────────────────────────────────────────────
console.log("──── URL AUDIT ────");
const urlFailures = [];
for (const row of filtered) {
  const url = urlMap[row.slug];
  if (!url) { console.log(`✗ NO_URL       ${row.slug}`); urlFailures.push(row); continue; }
  const r = await get(url);
  const title   = titleOf(r.body).toLowerCase();
  const ogTitle = (r.body?.match(/og:title"\s*content="([^"]+)"/i)?.[1] ?? "").toLowerCase();
  const host    = url.toLowerCase();
  const last    = lastNameOf(row.name);
  // Pass if: status OK AND (title, og:title, or subdomain contains last name)
  const ok = r.status < 400 && (title.includes(last) || ogTitle.includes(last) || host.includes(last.replace("-", "")));
  if (!ok) {
    console.log(`✗ BAD_URL      ${row.slug.padEnd(26)} status=${r.status}  title="${titleOf(r.body).slice(0,70)}"  url=${url}`);
    urlFailures.push({ ...row, url, status: r.status, title: titleOf(r.body) });
  } else {
    process.stdout.write(".");
  }
}
console.log("\n");

// ── 2. Photo fetch + R2 upload ────────────────────────────────────────────
console.log(`──── PHOTO ${shouldUpload ? "UPLOAD" : "AUDIT (dry-run)"} ────`);
const photoFailures = [];
const photoSources  = [];
for (const row of filtered) {
  let picked;
  // 1. Wikipedia Commons (best quality, 800×1000 thumb ≈150KB).
  const wikiTitle = wikiTitleFor(row);
  const wikiUrl   = await wikiPhotoUrl(wikiTitle);
  if (wikiUrl) {
    const r = await get(wikiUrl, true);
    if (r.status < 400 && r.body && r.body.length > 3000) {
      picked = { url: wikiUrl, buf: r.body, size: r.body.length, tag: "WIKI" };
    }
  }
  // 2. Bioguide (180×225 tiny fallback).
  if (!picked) {
    for (const pUrl of bioguideUrls(row.bioguide)) {
      const r = await get(pUrl, true);
      if (r.status < 400 && r.body && r.body.length > 3000) {
        picked = { url: pUrl, buf: r.body, size: r.body.length, tag: "BIO " };
        break;
      }
    }
  }
  if (!picked) {
    console.log(`✗ NO_PHOTO     ${row.slug.padEnd(26)} ${row.bioguide}`);
    photoFailures.push(row);
    continue;
  }
  const kb  = Math.round(picked.size / 1024);
  const tag = picked.tag;
  try {
    await uploadToR2(row.slug, picked.buf, "jpeg");
    console.log(`${shouldUpload ? "✓" : "•"} ${tag}  ${row.slug.padEnd(26)} ${kb.toString().padStart(4)}KB  ${picked.url}`);
    photoSources.push({ slug: row.slug, source: picked.url, size: picked.size });
  } catch (err) {
    console.log(`✗ UPLOAD_FAIL  ${row.slug.padEnd(26)} ${err.message}`);
    photoFailures.push({ ...row, err: err.message });
  }
}

// ── Summary ───────────────────────────────────────────────────────────────
console.log("\n──── SUMMARY ────");
console.log(`URL failures:     ${urlFailures.length}`);
console.log(`Photo failures:   ${photoFailures.length}`);
if (urlFailures.length) {
  console.log("\nURL FIX LIST:");
  for (const f of urlFailures) console.log(`  ${f.slug}  →  ${f.url ?? "(missing)"}  [${f.status ?? "?"}]`);
}
if (photoFailures.length) {
  console.log("\nPHOTO FIX LIST:");
  for (const f of photoFailures) console.log(`  ${f.slug}  bioguide=${f.bioguide}  ${f.err ?? ""}`);
}

// Largest → smallest, for spotting the last dregs of low-res stragglers.
const lowRes = photoSources.filter(p => p.size < 50_000).sort((a, b) => a.size - b.size);
if (lowRes.length) {
  console.log("\nSMALLEST IMAGES (<50KB) — likely still low-res:");
  for (const p of lowRes) console.log(`  ${Math.round(p.size/1024).toString().padStart(3)}KB  ${p.slug}   ${p.source}`);
}

process.exit(urlFailures.length || photoFailures.length ? 1 : 0);
