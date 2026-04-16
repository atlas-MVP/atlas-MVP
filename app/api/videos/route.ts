// Returns the video manifest with fresh presigned GET URLs
import { NextResponse } from "next/server";
import { getManifest, signedGetUrl } from "../../lib/r2";

export const revalidate = 0; // always fresh

export async function GET(): Promise<NextResponse> {
  try {
    const entries = await getManifest();
    // Generate presigned URLs in parallel
    const videos = await Promise.all(
      entries.map(async (e) => ({
        ...e,
        signedUrl: await signedGetUrl(e.key),
      }))
    );
    return NextResponse.json(videos);
  } catch (err) {
    console.error("[videos]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
