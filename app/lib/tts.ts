// Client-side TTS helper. Wraps /api/tts so callers get a single cancellable
// handle regardless of whether the narration fits in one ElevenLabs request
// or has to be chunked into several.
//
// Usage:
//   const tts = playTts("Long narration text …");
//   // later
//   tts.cancel();
//
// Shape matches the previous `ttsRef.current = { cancel }` contract so
// existing call sites keep working with a one-line swap.

// ElevenLabs turbo models cap single requests at ~5000 chars. We stay
// comfortably under that so sentence-boundary splits have room to breathe
// without landing mid-word.
const CHUNK_MAX = 4500;

export type TtsVoice = "charlie" | "daniel" | "rachel" | "adam" | "bella";

// Voice-ID aliases so call sites never have to remember ElevenLabs UUIDs.
// Server route resolves unknown voices to its own default, so passing a raw
// UUID also works if you grab one from the dashboard.
const VOICE_IDS: Record<TtsVoice, string> = {
  charlie: "Y7xQSS5ZtS4xv4VJotWd", // Atlas default — custom voice picked in ElevenLabs VoiceLab
  daniel:  "onwK4e9ZLuTAKqWW03F9", // British, deeper news anchor
  rachel:  "21m00Tcm4TlvDq8ikWAM", // American, neutral female
  adam:    "pNInz6obpgDQGcFmaJgB", // American, male
  bella:   "EXAVITQu4vr4xnSDxMaL", // American, warm female
};

interface PlayOpts {
  voice?:   TtsVoice | string;        // alias or raw ElevenLabs voice_id
  model?:   string;                   // e.g. "eleven_multilingual_v2" for quality
  onEnd?:   () => void;               // fires when full narration finishes
  onError?: (err: unknown) => void;   // fires on any chunk failure (loud)
}

export interface TtsHandle {
  cancel: () => void;   // stop + release audio (resets to idle)
  pause:  () => void;   // pause in place — resume() picks up where we left off
  resume: () => void;   // resume a paused stream
}

export function playTts(text: string, opts: PlayOpts = {}): TtsHandle {
  const trimmed = text.trim();
  if (!trimmed) {
    opts.onEnd?.();
    return { cancel: () => {}, pause: () => {}, resume: () => {} };
  }

  const chunks    = splitForTts(trimmed, CHUNK_MAX);
  const voiceId   = resolveVoice(opts.voice);
  const modelQ    = opts.model ? `&model=${encodeURIComponent(opts.model)}` : "";

  let current:   HTMLAudioElement | null = null;
  let idx        = 0;
  let cancelled  = false;
  let paused     = false;

  const urlFor = (chunk: string) =>
    `/api/tts?text=${encodeURIComponent(chunk)}&voice=${encodeURIComponent(voiceId)}${modelQ}`;

  const playNext = () => {
    if (cancelled || paused) return;
    if (idx >= chunks.length) { opts.onEnd?.(); return; }

    const a = new Audio(urlFor(chunks[idx]));
    current = a;

    // Warm the edge cache for the next chunk while this one plays — makes
    // multi-segment narrations gapless. Fire-and-forget; failures are fine
    // because the real request will retry when playNext() actually needs it.
    if (idx + 1 < chunks.length) {
      fetch(urlFor(chunks[idx + 1])).catch(() => {});
    }

    // Only advance when the chunk ENDS naturally. A manual .pause() doesn't
    // fire 'ended', so pause() holds position mid-chunk cleanly.
    a.onended = () => {
      idx++;
      if (!cancelled && !paused) playNext();
    };
    a.onerror = (e) => {
      opts.onError?.(e);
      // Skip past the broken chunk and keep narrating; stopping the whole
      // stream on one failed MP3 is worse UX than a small silent gap.
      idx++;
      if (!cancelled && !paused) playNext();
    };

    a.play().catch((e) => {
      opts.onError?.(e);
      // Autoplay policy block or network — bail entirely, caller should
      // retry after a user gesture.
      cancelled = true;
    });
  };

  playNext();

  return {
    pause() {
      if (cancelled) return;
      paused = true;
      current?.pause();
    },
    resume() {
      if (cancelled) return;
      paused = false;
      // Two cases:
      //   1. current chunk was paused mid-playback — HTMLAudioElement.play()
      //      picks back up from currentTime automatically.
      //   2. current chunk already ended while paused (idx advanced in
      //      onended) — kick off the next chunk.
      if (current && !current.ended) {
        current.play().catch((e) => opts.onError?.(e));
      } else {
        playNext();
      }
    },
    cancel() {
      cancelled = true;
      paused    = false;
      if (current) {
        current.pause();
        current.src = "";              // release buffered data + stop download
        current.load();                // reset to initial state
      }
      current = null;
    },
  };
}

// Split long narration at sentence → word → hard boundaries so each chunk
// stays under the server's MAX_CHARS and no word gets cut mid-syllable.
function splitForTts(text: string, max: number): string[] {
  if (text.length <= max) return [text];

  const chunks: string[] = [];
  let rest = text;

  while (rest.length > max) {
    // Prefer ". " boundaries so chunks end on natural pauses.
    let cut = rest.lastIndexOf(". ", max);
    // If no sentence boundary in the first half, fall back to any whitespace.
    if (cut < max * 0.4) cut = rest.lastIndexOf(" ", max);
    // Last resort: hard cut at max.
    if (cut <= 0) cut = max;

    chunks.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  if (rest) chunks.push(rest);

  return chunks;
}

function resolveVoice(v: PlayOpts["voice"]): string {
  if (!v) return VOICE_IDS.charlie;
  if (v in VOICE_IDS) return VOICE_IDS[v as TtsVoice];
  return v; // raw voice_id passthrough
}
