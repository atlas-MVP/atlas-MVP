// Tiny in-memory store for handing a reel off from the AtlasHQ preview player
// into the full-screen ReelsPlayer without a restart. When the user taps the
// preview, we save { id, currentTime }. The full player, on mount, reads that
// value for the first reel and seeks to the same timestamp — so there's no
// audible/visual "rewind" on handoff.

interface ResumeState {
  id: string;          // reel entry id
  currentTime: number; // seconds into the video
}

let state: ResumeState | null = null;

export function setReelResume(id: string, currentTime: number): void {
  state = { id, currentTime };
}

export function readReelResume(id: string): number | null {
  if (!state || state.id !== id) return null;
  const t = state.currentTime;
  state = null; // one-shot — consumed on read
  return t;
}
