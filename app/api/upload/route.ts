// R2 video upload + manifest registration
// Supports: multipart file upload OR embed URL (YouTube / Twitter / direct)

import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  r2, BUCKET, getManifest, saveManifest, signedGetUrl,
  detectEmbedType, type VideoEntry,
} from "../../lib/r2";
import { randomUUID } from "crypto";

export const maxDuration = 300;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    // ── Embed URL path (JSON body) ────────────────────────────────────────────
    if (contentType.includes("application/json")) {
      const body = await request.json() as {
        embedUrl: string; title?: string; date?: string;
        location?: string; handle?: string; caption?: string;
      };
      if (!body.embedUrl) return NextResponse.json({ error: "embedUrl required" }, { status: 400 });

      const type = detectEmbedType(body.embedUrl);
      const entry: VideoEntry = {
        id:         randomUUID(),
        type,
        key:        "",
        embedUrl:   body.embedUrl,
        title:      body.title    ?? "Untitled",
        date:       body.date     ?? new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        location:   body.location ?? "",
        handle:     body.handle   ?? "atlas",
        caption:    body.caption  ?? "",
        uploadedAt: new Date().toISOString(),
      };

      const manifest = await getManifest();
      manifest.unshift(entry);
      await saveManifest(manifest);
      return NextResponse.json(entry);
    }

    // ── File upload path (multipart) ──────────────────────────────────────────
    const form     = await request.formData();
    const file     = form.get("file")     as File   | null;
    const title    = form.get("title")    as string | null;
    const date     = form.get("date")     as string | null;
    const location = form.get("location") as string | null;
    const handle   = form.get("handle")   as string | null;
    const caption  = form.get("caption")  as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ error: "Only video files supported" }, { status: 400 });
    }

    const id     = randomUUID();
    const ext    = file.name.split(".").pop() ?? "mp4";
    const key    = `videos/${id}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2.send(new PutObjectCommand({
      Bucket: BUCKET, Key: key,
      Body: buffer, ContentType: file.type,
    }));

    const entry: VideoEntry = {
      id, type: "video", key,
      title:      title    ?? file.name,
      date:       date     ?? new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      location:   location ?? "",
      handle:     handle   ?? "atlas",
      caption:    caption  ?? "",
      uploadedAt: new Date().toISOString(),
    };

    const manifest = await getManifest();
    manifest.unshift(entry);
    await saveManifest(manifest);

    const url = await signedGetUrl(key);
    return NextResponse.json({ ...entry, signedUrl: url });

  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
