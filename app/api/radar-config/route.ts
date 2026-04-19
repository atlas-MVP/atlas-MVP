import { NextResponse } from "next/server";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET, signedGetUrl } from "../../lib/r2";

export const maxDuration = 60;

const CONFIG_KEY = "atlas-radar/config.json";

const EMPTY_CONFIG = {
  liveAlerts: [],
  topConflicts: [],
  moreConflicts: [],
  violenceItems: [],
  financeItems: [],
  disasters: [],
};

// Transform any imageKey field into a signed URL on each item in the array
async function signItems<T extends Record<string, unknown>>(items: T[]): Promise<T[]> {
  return Promise.all(
    items.map(async (item) => {
      if (typeof item.imageKey === "string" && item.imageKey) {
        const imageUrl = await signedGetUrl(item.imageKey, 3600);
        return { ...item, imageUrl };
      }
      return item;
    })
  );
}

export async function GET(): Promise<NextResponse> {
  try {
    const obj = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: CONFIG_KEY }));
    const text = await obj.Body?.transformToString();
    if (!text) return NextResponse.json(EMPTY_CONFIG);

    const config = JSON.parse(text) as Record<string, unknown[]>;

    const [liveAlerts, topConflicts, moreConflicts, violenceItems, financeItems, disasters] =
      await Promise.all([
        signItems((config.liveAlerts as Record<string, unknown>[]) ?? []),
        signItems((config.topConflicts as Record<string, unknown>[]) ?? []),
        signItems((config.moreConflicts as Record<string, unknown>[]) ?? []),
        signItems((config.violenceItems as Record<string, unknown>[]) ?? []),
        signItems((config.financeItems as Record<string, unknown>[]) ?? []),
        signItems((config.disasters as Record<string, unknown>[]) ?? []),
      ]);

    return NextResponse.json({ liveAlerts, topConflicts, moreConflicts, violenceItems, financeItems, disasters });
  } catch (err: unknown) {
    const code = (err as { Code?: string; name?: string }).Code ?? (err as { name?: string }).name;
    if (code === "NoSuchKey" || code === "NotFound") {
      return NextResponse.json(EMPTY_CONFIG);
    }
    console.error("[radar-config:GET]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json() as { config: unknown };
    await r2.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         CONFIG_KEY,
      Body:        JSON.stringify(body.config, null, 2),
      ContentType: "application/json",
    }));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[radar-config:POST]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
