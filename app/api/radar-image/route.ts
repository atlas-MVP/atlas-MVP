import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET, signedGetUrl } from "../../lib/r2";
import { randomUUID } from "crypto";

export const maxDuration = 120;

// GET /api/radar-image?key=<r2-object-key>
// Redirects to a fresh signed URL for any uploaded image. Used anywhere in
// the app that needs to <img src=…> an R2-hosted asset (senator portraits,
// alert photos, admin uploads, etc.) through a single public-facing URL.
export async function GET(request: Request): Promise<Response> {
  const key = new URL(request.url).searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  try {
    const url = await signedGetUrl(key, 518400); // 6 days (R2 max)
    return Response.redirect(url, 302);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const key = `atlas-radar/images/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      Body:        buffer,
      ContentType: file.type || "image/jpeg",
    }));

    // 6-day signed URL (R2 hard cap is < 7 days / 604800s)
    const url = await signedGetUrl(key, 518400);

    return NextResponse.json({ key, url });
  } catch (err) {
    console.error("[radar-image:POST]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
