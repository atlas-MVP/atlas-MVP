// Cloudflare R2 client — shared across API routes
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Defensive .trim() — pasting a Cloudflare token into the Vercel dashboard
// often leaves a trailing newline or stray whitespace, which makes Node's
// http module throw "Invalid character in header content ['authorization']"
// when the AWS SDK tries to sign the request.
const clean = (v: string | undefined): string => (v ?? "").trim();

export const r2 = new S3Client({
  region: "auto",
  endpoint: clean(process.env.R2_ENDPOINT),
  credentials: {
    accessKeyId:     clean(process.env.R2_ACCESS_KEY_ID),
    secretAccessKey: clean(process.env.R2_SECRET_ACCESS_KEY),
  },
});

export const BUCKET = clean(process.env.R2_BUCKET) || "atlas-media";
export const MANIFEST_KEY = "manifest.json";

// "video"   — self-hosted mp4/webm in R2 OR a direct-video URL
// "youtube" — youtube.com / youtu.be
// "tweet"   — twitter.com / x.com
// "article" — everything else: news articles, blog posts, reports. Rendered
//             via ArticleCard using og: metadata (image + headline). Lets
//             admins drop any URL into the event upload popup and have it
//             appear as a square preview card without manual curation.
export type ReelType = "video" | "youtube" | "tweet" | "article";

export interface VideoEntry {
  id:         string;
  type:       ReelType;
  key:        string;        // R2 object key for uploaded videos, "" for embeds
  embedUrl?:  string;        // raw URL for youtube/tweet/direct-link embeds
  title:      string;
  date:       string;
  location:   string;
  handle:     string;
  caption:    string;
  uploadedAt: string;
  signedUrl?: string;        // populated at read-time (not stored)
  // ── Scope routing ────────────────────────────────────────────────────
  // "reels"  → master Atlas Reels feed (opened via Atlas Radar slot)
  // "event"  → attached to a specific timeline event; NOT shown in master feed
  // "alert"  → attached to a specific live alert; hover-reveal + click-lock
  scope?:     "reels" | "event" | "alert";
  eventId?:   string;        // e.g. "october-7" — required when scope === "event"
  alertId?:   string;        // e.g. "ISR-1d"   — required when scope === "alert"
  // For tweet entries: "embed" renders the full Twitter widget (no autoplay
  // but shows author/text/media); undefined/"mp4" renders our autoplay MP4
  // proxy (default). Per-post override so mixed modes can coexist.
  renderMode?: "embed" | "mp4";
  // Display size slot — controls layout in the video container.
  // "1/1" full frame (landscape default), "1/2" half-width (vertical default),
  // "1/4" 2×2 grid cell (article default). Never crops — always letterboxes.
  size?: "1/1" | "1/2" | "1/4";
}

export async function getManifest(): Promise<VideoEntry[]> {
  try {
    const obj = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: MANIFEST_KEY }));
    const text = await obj.Body?.transformToString();
    return text ? (JSON.parse(text) as VideoEntry[]) : [];
  } catch {
    return [];
  }
}

export async function saveManifest(entries: VideoEntry[]): Promise<void> {
  await r2.send(new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         MANIFEST_KEY,
    Body:        JSON.stringify(entries, null, 2),
    ContentType: "application/json",
  }));
}

export async function signedGetUrl(key: string, expiresIn = 86400): Promise<string> {
  return getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn },
  );
}

// Detect embed type from a URL.
// Order matters: YouTube and Twitter win first, then direct-video URLs (by
// extension), then everything else is an article. This lets admins paste
// ANY URL into the event upload popup and have it classified correctly
// without extra UI.
export function detectEmbedType(url: string): ReelType {
  if (/youtu\.?be|youtube\.com/.test(url))      return "youtube";
  if (/twitter\.com|x\.com/.test(url))          return "tweet";
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url)) return "video";
  return "article";
}
