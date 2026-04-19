// Dynamic conflict route — /israel-us-iran-war, /israel-gaza, etc.
//
// Each active conflict gets its own URL so atlas.boston/israel-us-iran-war
// deep-links straight into the Israel-US-Iran widget. The actual rendering
// is handled by the root Home component, which reads window.location.pathname
// on mount and pre-selects the matching conflict. This file just exists so
// Next.js doesn't 404 on the dynamic slug — Home does the rest.
import { notFound } from "next/navigation";
import Home from "../page";

// Keep in sync with CONFLICT_SLUGS + DISASTER_SLUGS in ../page.tsx —
// every slug there is a valid /:slug path.
const VALID_SLUGS = new Set([
  // Conflicts
  "israel-us-iran-war",
  "israel-palestine-conflict",
  "israel-lebanon",
  "russia-ukraine-war",
  "taiwan-strait",
  "sudan-civil-war",
  "myanmar-civil-war",
  // Disasters
  "myanmar-earthquake",
  "la-wildfires",
]);

export default async function ConflictPage({
  params,
}: {
  params: Promise<{ conflict: string }>;
}) {
  const { conflict } = await params;
  if (!VALID_SLUGS.has(conflict)) notFound();
  return <Home />;
}
