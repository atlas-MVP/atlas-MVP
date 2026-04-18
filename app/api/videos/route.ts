// Returns the video manifest with fresh presigned GET URLs.
//
// Query params:
//   ?scope=reels               → only master-feed reels (DEFAULT)
//   ?scope=event&eventId=<id>  → only uploads tied to a specific timeline event
//   ?scope=all                 → every entry (admin only)
//
// Legacy entries without a scope are treated as "reels" so existing uploads stay visible.
import { NextResponse } from "next/server";
import { getManifest, signedGetUrl, type VideoEntry } from "../../lib/r2";

export const revalidate = 0; // always fresh

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const scope   = (searchParams.get("scope") ?? "reels").toLowerCase();
    const eventId = searchParams.get("eventId") ?? "";
    const alertId = searchParams.get("alertId") ?? "";

    const all = await getManifest();

    const filtered: VideoEntry[] =
      scope === "all"   ? all
      : scope === "event"
        ? all.filter(e => e.scope === "event" && e.eventId === eventId)
      : scope === "alert"
        ? all.filter(e => e.scope === "alert" && e.alertId === alertId)
        : all.filter(e => !e.scope || e.scope === "reels");

    // Generate presigned URLs in parallel (only for entries with an R2 key)
    const videos = await Promise.all(
      filtered.map(async (e) => ({
        ...e,
        signedUrl: e.key ? await signedGetUrl(e.key) : undefined,
      }))
    );
    // Prevent any intermediate caching; the manifest changes with every
    // upload/delete and stale lists confuse users (newest reel missing).
    return NextResponse.json(videos, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" },
    });
  } catch (err) {
    console.error("[videos]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
