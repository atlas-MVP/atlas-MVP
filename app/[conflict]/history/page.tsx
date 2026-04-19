// Dynamic history sub-route — /israel-us-iran-war/history, etc.
//
// Opens the matching conflict AND pre-expands the history timeline.
// The root Home component reads window.location.pathname on mount and
// handles both "/conflict-slug" and "/conflict-slug/history" paths.
// This file just exists so Next.js doesn't 404 the second path segment.
import { notFound } from "next/navigation";
import Home from "../../page";

// Keep in sync with CONFLICT_SLUGS in ../../page.tsx — every conflict
// slug is a valid /[conflict]/history path. Disasters have no history.
const VALID_CONFLICT_SLUGS = new Set([
  "israel-us-iran-war",
  "israel-palestine-conflict",
  "israel-lebanon",
  "russia-ukraine-war",
  "taiwan-strait",
  "sudan-civil-war",
  "myanmar-civil-war",
]);

export default async function ConflictHistoryPage({
  params,
}: {
  params: Promise<{ conflict: string }>;
}) {
  const { conflict } = await params;
  if (!VALID_CONFLICT_SLUGS.has(conflict)) notFound();
  return <Home />;
}
