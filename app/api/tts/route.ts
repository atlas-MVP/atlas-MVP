// ElevenLabs TTS proxy with R2 caching.
//
// Flow:
//   GET /api/tts?text=...&voice=...&model=...
//     1. Hash (VERSION:voice:model:text) → R2 key `tts/<sha>.mp3`
//     2. R2 hit  → stream bytes back (browser caches URL → 2nd play is free)
//     3. R2 miss → fetch ElevenLabs, return bytes to client, write R2 via
//                  after() so the client gets audio at wire speed and the
//                  cache is warmed in the background
//
// Why cache in R2 instead of redirecting to a signed URL:
//   - Signed URLs rotate → browser can't cache across sessions reliably
//   - Keeping the response under /api/tts lets the immutable cache-control
//     pin bytes in browser + Vercel edge cache for a year
//
// Why GET with URL-param text instead of POST:
//   - <audio src="/api/tts?text=..."> just works, no JS plumbing
//   - Any text long enough to bust URL limits should be chunked client-side
//     anyway (ElevenLabs caps per-request at 5000 chars on turbo models)

import { NextRequest } from "next/server";
import { after } from "next/server";
import { createHash } from "crypto";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "../../lib/r2";

export const runtime      = "nodejs";
export const dynamic      = "force-dynamic";
export const maxDuration  = 60;

// Bump VERSION any time voice_settings / output_format / prompt shape changes
// so old cached clips get regenerated with the new parameters.
const VERSION        = "v1";
// Atlas default voice — selected via ElevenLabs VoiceLab.
const DEFAULT_VOICE  = "Y7xQSS5ZtS4xv4VJotWd";
// Turbo v2.5 — ~300 ms first-byte, half the credit cost of multilingual_v2.
const DEFAULT_MODEL  = "eleven_turbo_v2_5";
// ElevenLabs per-request char cap on turbo models. Longer narrations must be
// chunked on the client (see lib/tts.ts → splitForTts).
const MAX_CHARS      = 5000;

export async function GET(req: NextRequest): Promise<Response> {
  const u     = new URL(req.url);
  const text  = (u.searchParams.get("text")  ?? "").trim();
  const voice = (u.searchParams.get("voice") ?? DEFAULT_VOICE).trim();
  const model = (u.searchParams.get("model") ?? DEFAULT_MODEL).trim();

  if (!text)                    return new Response("text required", { status: 400 });
  if (text.length > MAX_CHARS)  return new Response(`text > ${MAX_CHARS} chars — chunk client-side`, { status: 413 });

  const hash = createHash("sha256").update(`${VERSION}:${voice}:${model}:${text}`).digest("hex");
  const key  = `tts/${hash}.mp3`;

  // ── Cache path ────────────────────────────────────────────────────────────
  // Try to read from R2 directly. Any error (NoSuchKey, network) falls
  // through to regeneration — R2 miss is the only expected failure mode, so
  // we don't need to branch on error.code.
  try {
    const obj   = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const bytes = await obj.Body!.transformToByteArray();
    return new Response(Buffer.from(bytes), {
      headers: {
        "content-type":  "audio/mpeg",
        "cache-control": "public, max-age=31536000, immutable",
        "x-atlas-tts":   "hit",
      },
    });
  } catch {
    /* cache miss — generate below */
  }

  // ── Generation path ──────────────────────────────────────────────────────
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return new Response("ELEVENLABS_API_KEY not set", { status: 500 });

  const el = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
    {
      method:  "POST",
      headers: {
        "xi-api-key":    apiKey,
        "content-type":  "application/json",
        "accept":        "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: model,
        // Tuned for a serious newsroom read — stable delivery, slight style
        // expression for natural pacing, speaker-boost for headphone clarity.
        voice_settings: {
          stability:         0.50,
          similarity_boost:  0.75,
          style:             0.15,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!el.ok) {
    const msg = await el.text().catch(() => `${el.status} ${el.statusText}`);
    console.error("[tts]", el.status, msg);
    return new Response(msg, { status: 502 });
  }

  const buf = Buffer.from(await el.arrayBuffer());

  // Warm the cache after the response ships. The client already has bytes —
  // never block playback on the R2 write.
  after(async () => {
    try {
      await r2.send(new PutObjectCommand({
        Bucket:       BUCKET,
        Key:          key,
        Body:         buf,
        ContentType:  "audio/mpeg",
        CacheControl: "public, max-age=31536000, immutable",
      }));
    } catch (err) {
      console.error("[tts:cache write]", err);
    }
  });

  return new Response(buf, {
    headers: {
      "content-type":  "audio/mpeg",
      "cache-control": "public, max-age=31536000, immutable",
      "x-atlas-tts":   "miss",
    },
  });
}
