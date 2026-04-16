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

export type ReelType = "video" | "youtube" | "tweet";

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
  scope?:     "reels" | "event";
  eventId?:   string;        // e.g. "october-7" — required when scope === "event"
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

// Detect embed type from a URL
export function detectEmbedType(url: string): ReelType {
  if (/youtu\.?be|youtube\.com/.test(url)) return "youtube";
  if (/twitter\.com|x\.com/.test(url)) return "tweet";
  return "video"; // direct video URL
}
