import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET, signedGetUrl } from "../../lib/r2";
import { randomUUID } from "crypto";

export const maxDuration = 120;

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

    // 1-year signed URL
    const url = await signedGetUrl(key, 31536000);

    return NextResponse.json({ key, url });
  } catch (err) {
    console.error("[radar-image:POST]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
