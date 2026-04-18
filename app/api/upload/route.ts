// R2 video upload + manifest registration
// Supports: multipart file upload OR embed URL (YouTube / Twitter / direct)

import { NextResponse } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
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
        scope?: "reels" | "event" | "alert"; eventId?: string; alertId?: string;
        renderMode?: "embed" | "mp4"; size?: "1/1" | "1/2" | "1/4";
      };
      if (!body.embedUrl) return NextResponse.json({ error: "embedUrl required" }, { status: 400 });

      const scope: "reels" | "event" | "alert" =
        body.scope === "event" ? "event" :
        body.scope === "alert" ? "alert" : "reels";
      const eventId = scope === "event" ? (body.eventId || "").trim() : undefined;
      const alertId = scope === "alert" ? (body.alertId || "").trim() : undefined;
      if (scope === "event" && !eventId) {
        return NextResponse.json({ error: "eventId required when scope='event'" }, { status: 400 });
      }
      if (scope === "alert" && !alertId) {
        return NextResponse.json({ error: "alertId required when scope='alert'" }, { status: 400 });
      }

      const type = detectEmbedType(body.embedUrl);
      // Embed metadata is OPTIONAL — empty strings mean "render the embed bare
      // with its own native chrome (YouTube title bar, tweet handle, etc.)".
      // Only if the admin supplies a value do we overlay Atlas chrome on top.
      const entry: VideoEntry = {
        id:         randomUUID(),
        type,
        key:        "",
        embedUrl:   body.embedUrl,
        title:      (body.title    ?? "").trim(),
        date:       (body.date     ?? "").trim(),
        location:   (body.location ?? "").trim(),
        handle:     (body.handle   ?? "").trim(),
        caption:    (body.caption  ?? "").trim(),
        uploadedAt: new Date().toISOString(),
        scope,
        ...(eventId ? { eventId } : {}),
        ...(alertId ? { alertId } : {}),
        ...(body.renderMode ? { renderMode: body.renderMode } : {}),
        size: body.size ?? (type === "article" ? "1/4" : "1/1"),
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
    const rawScope = form.get("scope")    as string | null;
    const rawEvent = form.get("eventId")  as string | null;
    const rawAlert = form.get("alertId")  as string | null;
    const rawSize  = form.get("size")     as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ error: "Only video files supported" }, { status: 400 });
    }

    const scope: "reels" | "event" | "alert" =
      rawScope === "event" ? "event" :
      rawScope === "alert" ? "alert" : "reels";
    const eventId = scope === "event" ? (rawEvent || "").trim() : "";
    const alertId = scope === "alert" ? (rawAlert || "").trim() : "";
    if (scope === "event" && !eventId) {
      return NextResponse.json({ error: "eventId required when scope='event'" }, { status: 400 });
    }
    if (scope === "alert" && !alertId) {
      return NextResponse.json({ error: "alertId required when scope='alert'" }, { status: 400 });
    }

    const id     = randomUUID();
    const ext    = file.name.split(".").pop() ?? "mp4";
    // Folder layout:
    //   reels/<uuid>.ext
    //   events/<eventId>/<uuid>.ext
    //   alerts/<alertId>/<uuid>.ext
    const key    = scope === "event"
      ? `events/${eventId}/${id}.${ext}`
      : scope === "alert"
      ? `alerts/${alertId}/${id}.${ext}`
      : `reels/${id}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2.send(new PutObjectCommand({
      Bucket: BUCKET, Key: key,
      Body: buffer, ContentType: file.type,
    }));

    const fileSize: "1/1" | "1/2" | "1/4" =
      rawSize === "1/2" ? "1/2" :
      rawSize === "1/4" ? "1/4" : "1/1";

    const entry: VideoEntry = {
      id, type: "video", key,
      title:      title    ?? file.name,
      date:       date     ?? new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      location:   location ?? "",
      handle:     handle   ?? "atlas",
      caption:    caption  ?? "",
      uploadedAt: new Date().toISOString(),
      scope,
      ...(eventId ? { eventId } : {}),
      ...(alertId ? { alertId } : {}),
      size: fileSize,
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

// ── Undo / delete an upload ──────────────────────────────────────────────────
// Called by the admin upload page × button. Removes the entry from manifest
// and deletes the underlying R2 object if one exists (embeds have key: "").
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const id  = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const manifest = await getManifest();
    const entry    = manifest.find(e => e.id === id);
    if (!entry) return NextResponse.json({ error: "not found" }, { status: 404 });

    // Delete the R2 object for self-hosted uploads (embeds have no key)
    if (entry.key) {
      try {
        await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: entry.key }));
      } catch (err) {
        // Log but don't fail — still remove from manifest so admin isn't blocked
        console.error("[upload:delete r2 object]", err);
      }
    }

    // Remove from manifest
    const filtered = manifest.filter(e => e.id !== id);
    await saveManifest(filtered);

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[upload:delete]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
