import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

const MILES_TO_METERS = 1609.34;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radius = parseFloat(searchParams.get("radius") ?? "50"); // miles

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 }
    );
  }

  const radiusMeters = radius * MILES_TO_METERS;

  const rows = await sql`
    SELECT
      e.id,
      e.source,
      e.source_id,
      e.title,
      e.description,
      e.event_type,
      e.event_date,
      e.confidence_score,
      e.topics,
      e.status,
      e.article_url,
      e.thumbnail_url,
      e.metadata,
      ST_X(e.coordinates::geometry) as longitude,
      ST_Y(e.coordinates::geometry) as latitude,
      m.media_type,
      m.embed_url as media_url,
      m.thumbnail_url as media_thumbnail
    FROM events e
    LEFT JOIN media m ON m.event_id = e.id
    WHERE ST_DWithin(
      e.coordinates,
      ST_MakePoint(${lng}, ${lat})::geography,
      ${radiusMeters}
    )
    ORDER BY e.event_date DESC
    LIMIT 20
  `;

  return NextResponse.json({ events: rows });
}
