// /api/tweet-video/stream/<tweetId>
// Proxies the tweet's MP4 through our origin so the browser never sends a
// Referer to video.twimg.com — twimg's CDN 403s any request whose Referer
// isn't twitter.com, which is why a direct <video src=twimg> on atlas.boston
// silently fails to play (Chrome doesn't surface media network errors to JS).
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return new Response("bad id", { status: 400 });

  // Resolve tweet id → MP4 url via fxtwitter
  const fx = await fetch(`https://api.fxtwitter.com/status/${id}`, {
    headers: { "User-Agent": "AtlasBot/1.0" },
    next: { revalidate: 600 },
  });
  if (!fx.ok) return new Response(`fxtwitter ${fx.status}`, { status: 502 });
  const data = (await fx.json()) as {
    tweet?: { media?: { videos?: { url: string }[] } };
  };
  const video = data.tweet?.media?.videos?.find(v => v.url && !v.url.includes(".m3u8"));
  if (!video?.url) return new Response("no mp4 variant", { status: 404 });

  // Forward client's Range header so seeking still works through the proxy.
  const range = request.headers.get("range");
  const upstream = await fetch(video.url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      ...(range ? { Range: range } : {}),
    },
  });

  const headers = new Headers();
  for (const k of ["content-type", "content-length", "content-range", "accept-ranges"]) {
    const v = upstream.headers.get(k);
    if (v) headers.set(k, v);
  }
  if (!headers.has("content-type")) headers.set("content-type", "video/mp4");
  headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");

  return new Response(upstream.body, { status: upstream.status, headers });
}
