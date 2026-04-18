// OpenGraph link-preview fetcher with R2 caching.
//
// GET /api/og?url=https://example.com/article
//   → { title, image, description, source, url }
//
// Parses og:/twitter:/name meta tags via regex — zero deps, fast.
// Caches results in R2 for 1 week so we never hit the source twice for the
// same article within a news cycle.

import { NextRequest } from "next/server";
import { after } from "next/server";
import { createHash } from "crypto";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "../../lib/r2";

export const runtime     = "nodejs";
export const dynamic     = "force-dynamic";
export const maxDuration = 30;

// Bump when the response shape changes so stale caches don't corrupt the UI.
const VERSION = "v1";

interface OgData {
  title:       string;
  image:       string | null;
  description: string;
  source:      string;
  url:         string;
}

export async function GET(req: NextRequest): Promise<Response> {
  const u       = new URL(req.url);
  const rawUrl  = (u.searchParams.get("url") ?? "").trim();

  if (!rawUrl) return json({ error: "url required" }, 400);

  let target: URL;
  try { target = new URL(rawUrl); }
  catch { return json({ error: "invalid url" }, 400); }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return json({ error: "only http(s) urls" }, 400);
  }

  const hash = createHash("sha256").update(`${VERSION}:${target.href}`).digest("hex").slice(0, 24);
  const key  = `og/${hash}.json`;

  // Cache hit → return stored JSON.
  try {
    const obj  = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const body = await obj.Body!.transformToString();
    return new Response(body, {
      headers: {
        "content-type":  "application/json",
        "cache-control": "public, max-age=604800, immutable",
        "x-atlas-og":    "hit",
      },
    });
  } catch { /* miss */ }

  // Fetch + parse.
  let html = "";
  try {
    const res = await fetch(target.href, {
      // Mimic a desktop browser to avoid bot-blocking paywalls. Several pubs
      // serve the full OG block to anything that looks like a browser; their
      // API/bot endpoints often strip it.
      headers: {
        "user-agent":      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "accept":          "text/html,application/xhtml+xml",
        "accept-language": "en-US,en;q=0.9",
      },
      // These sites are 200-500KB; cap fetch so a hostile page can't eat
      // our function's memory.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    html = await res.text();
  } catch (err) {
    console.error("[og fetch]", rawUrl, err);
    return json({ error: "fetch failed", url: rawUrl }, 502);
  }

  const propMeta = (prop: string): string | null => {
    // Handle both meta[property=""] content="" AND the inverted order.
    const m1 = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`, "i"));
    if (m1?.[1]) return decodeEntities(m1[1]);
    const m2 = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`, "i"));
    if (m2?.[1]) return decodeEntities(m2[1]);
    return null;
  };

  const titleRaw = propMeta("og:title") ?? propMeta("twitter:title") ??
                   html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "";
  let imageRaw   = propMeta("og:image:secure_url") ?? propMeta("og:image") ?? propMeta("twitter:image") ?? null;

  // Resolve protocol-relative or path-relative images against the article URL.
  if (imageRaw) {
    try { imageRaw = new URL(imageRaw, target.href).href; } catch { imageRaw = null; }
  }

  const desc     = propMeta("og:description") ?? propMeta("description") ?? propMeta("twitter:description") ?? "";
  const siteName = propMeta("og:site_name") ?? target.hostname.replace(/^www\./, "");

  const data: OgData = {
    title:       decodeEntities(titleRaw).trim(),
    image:       imageRaw,
    description: desc.trim(),
    source:      siteName.trim(),
    url:         target.href,
  };
  const body = JSON.stringify(data);

  // Warm cache in background — never block the client response on R2 write.
  after(async () => {
    try {
      await r2.send(new PutObjectCommand({
        Bucket:       BUCKET,
        Key:          key,
        Body:         body,
        ContentType:  "application/json",
        CacheControl: "public, max-age=604800, immutable",
      }));
    } catch (err) {
      console.error("[og cache write]", err);
    }
  });

  return new Response(body, {
    headers: {
      "content-type":  "application/json",
      "cache-control": "public, max-age=604800, immutable",
      "x-atlas-og":    "miss",
    },
  });
}

// Minimal HTML entity decode for the common cases that show up in
// og:title / og:description without pulling in a library.
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g,  "&")
    .replace(/&lt;/g,   "<")
    .replace(/&gt;/g,   ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g,  "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)));
}

function json(obj: unknown, status: number): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
