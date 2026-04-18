// /api/tweet-video?id=<tweetId>
// Resolves a tweet to its direct MP4 URL via fxtwitter so we can render it as
// a bare <video autoplay muted loop> — Twitter's own widget requires a click
// to play, which breaks the /you page's autoplay rule.
//
// Response: { videoUrl, width, height } or { videoUrl: null } if the tweet
// has no video (or only HLS variants, which most browsers can't play natively).
import { NextResponse } from "next/server";

export const revalidate = 600;

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const id = (searchParams.get("id") ?? "").trim();
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "numeric tweet id required" }, { status: 400 });
  }
  try {
    const r = await fetch(`https://api.fxtwitter.com/status/${id}`, {
      headers: { "User-Agent": "AtlasBot/1.0" },
      next: { revalidate: 600 },
    });
    if (!r.ok) {
      return NextResponse.json({ videoUrl: null, error: `fxtwitter ${r.status}` }, {
        headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
      });
    }
    const data = await r.json() as {
      tweet?: { media?: { videos?: { url: string; width?: number; height?: number }[] } };
    };
    const videos = data.tweet?.media?.videos ?? [];
    // MP4 only — skip HLS to avoid the hls.js dependency / Chrome can't play it.
    const video = videos.find(v => v.url && !v.url.includes(".m3u8"));
    // Twimg MP4 paths embed dimensions (/720x900/) — use them if fxtwitter
    // didn't supply structured width/height.
    let { width, height } = video ?? {};
    if (video?.url && (!width || !height)) {
      const m = video.url.match(/\/(\d+)x(\d+)\//);
      if (m) { width = Number(m[1]); height = Number(m[2]); }
    }
    // Return a same-origin proxy URL instead of the raw twimg URL — twimg's
    // CDN 403s requests whose Referer isn't twitter.com, so we have to stream
    // the bytes through our own server. See /api/tweet-video/stream/[id].
    const videoUrl = video?.url ? `/api/tweet-video/stream/${id}` : null;
    return NextResponse.json(
      { videoUrl, width: width ?? null, height: height ?? null },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } },
    );
  } catch (err) {
    return NextResponse.json({ videoUrl: null, error: (err as Error).message }, { status: 500 });
  }
}
