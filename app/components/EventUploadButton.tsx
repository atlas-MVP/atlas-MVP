"use client";

/**
 * EventUploadButton — a small "+ upload" chip that opens an inline popup
 * for uploading a video (file or URL) tied to a specific timeline event.
 *
 * Usage in a timeline tile:
 *   <EventUploadButton eventId="october-7" />
 *
 * Behavior:
 *   • Uploads are stored in R2 under events/<eventId>/
 *   • They are NEVER shown in the master Atlas Reels feed
 *   • They are retrievable via GET /api/videos?scope=event&eventId=<eventId>
 *   • Event-scoped videos can later be rendered inline in the tile via
 *     <EventReels eventId="october-7" /> (to be added where desired)
 */

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  eventId: string;
  /** Optional label override (defaults to "+ upload") */
  label?: string;
}

export default function EventUploadButton({ eventId, label = "+ upload" }: Props) {
  const [open, setOpen]   = useState(false);
  const popupRef          = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!popupRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        style={{
          fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em",
          color: "rgba(239,68,68,0.7)", background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10,
          cursor: "pointer", padding: "3px 9px", textTransform: "uppercase",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "rgba(239,68,68,0.9)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.color = "rgba(239,68,68,0.7)"; }}
      >{label}</button>

      {open && (
        // Full-viewport modal — dimmed backdrop, card centered, takes over
        // the site so the popup is never clipped by its parent container.
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            ref={popupRef}
            onClick={e => e.stopPropagation()}
            style={{
              position: "relative",
              width: "min(420px, 100%)",
              padding: 20,
              background: "rgba(10,13,26,0.98)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }}
          >
            <button
              onClick={() => setOpen(false)}
              style={{
                position: "absolute", top: 10, right: 12,
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.35)", fontSize: 16, lineHeight: 1, padding: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            >×</button>
            <Popup eventId={eventId} onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inner popup UI ───────────────────────────────────────────────────────────
function Popup({ eventId, onDone }: { eventId: string; onDone: () => void }) {
  const [mode, setMode]         = useState<"file" | "url">("file");
  const [file, setFile]         = useState<File | null>(null);
  const [url, setUrl]           = useState("");
  const [caption, setCaption]   = useState("");
  const [handle, setHandle]     = useState("");
  const [uploading, setUp]      = useState(false);
  const [pct, setPct]           = useState(0);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState(false);

  const submit = useCallback(() => {
    setError(null); setDone(false);
    if (mode === "file" && !file) return;
    if (mode === "url"  && !url)  return;
    setUp(true); setPct(0);

    if (mode === "file" && file) {
      const form = new FormData();
      form.append("file", file);
      form.append("scope",   "event");
      form.append("eventId", eventId);
      form.append("handle",  handle || "atlas");
      form.append("caption", caption);
      form.append("title",   file.name);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = e => { if (e.lengthComputable) setPct(Math.round(e.loaded / e.total * 100)); };
      xhr.onload = () => {
        setUp(false);
        if (xhr.status === 200) { setDone(true); setTimeout(onDone, 1200); }
        else { try { setError(JSON.parse(xhr.responseText).error); } catch { setError("Upload failed"); } }
      };
      xhr.onerror = () => { setUp(false); setError("Network error"); };
      xhr.open("POST", "/api/upload");
      xhr.send(form);
      return;
    }

    fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embedUrl: url, scope: "event", eventId, handle: handle || "atlas", caption, title: url }),
    })
      .then(async r => {
        const data = await r.json();
        setUp(false);
        if (!r.ok) setError(data.error);
        else { setDone(true); setTimeout(onDone, 1200); }
      })
      .catch(e => { setUp(false); setError((e as Error).message); });
  }, [mode, file, url, handle, caption, eventId, onDone]);

  return (
    <div>
      <p style={{ margin: "0 0 10px", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
        upload → event / {eventId}
      </p>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {(["file", "url"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{
              flex: 1, padding: "5px", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase",
              cursor: "pointer", borderRadius: 5,
              background: mode === m ? "rgba(255,255,255,0.06)" : "transparent",
              border: `1px solid ${mode === m ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}`,
              color: mode === m ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.3)",
            }}>{m === "file" ? "file" : "url"}</button>
        ))}
      </div>

      {mode === "file" ? (
        <input type="file" accept="video/*"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          style={{ width: "100%", fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 10 }} />
      ) : (
        <input type="url" placeholder="youtube / x / direct video url"
          value={url} onChange={e => setUrl(e.target.value)}
          style={{ width: "100%", boxSizing: "border-box", padding: "7px 10px", borderRadius: 6,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.72)", fontSize: 11, fontFamily: "monospace", outline: "none", marginBottom: 10 }} />
      )}

      <input type="text" placeholder="handle (e.g. OliverWeaver)"
        value={handle} onChange={e => setHandle(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", padding: "7px 10px", borderRadius: 6, marginBottom: 8,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.72)", fontSize: 11, fontFamily: "monospace", outline: "none" }} />
      <textarea placeholder="caption" rows={2}
        value={caption} onChange={e => setCaption(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", padding: "7px 10px", borderRadius: 6, marginBottom: 10,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.72)", fontSize: 11, fontFamily: "monospace", outline: "none", resize: "vertical" }} />

      <button onClick={submit} disabled={uploading || done}
        style={{
          width: "100%", padding: "8px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase",
          cursor: uploading || done ? "not-allowed" : "pointer", borderRadius: 8,
          background: done ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.14)",
          border: `1px solid ${done ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
          color: done ? "rgba(34,197,94,0.85)" : uploading ? "rgba(255,255,255,0.25)" : "rgba(239,68,68,0.85)",
        }}>
        {done ? "✓ saved" : uploading ? `uploading ${pct}%…` : `↑ attach to ${eventId}`}
      </button>

      {uploading && (
        <div style={{ height: 2, marginTop: 8, background: "rgba(255,255,255,0.07)", borderRadius: 1, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "rgba(239,68,68,0.75)", transition: "width 0.3s" }} />
        </div>
      )}

      {error && (
        <p style={{ margin: "8px 0 0", fontSize: 10, color: "rgba(239,68,68,0.75)" }}>{error}</p>
      )}
    </div>
  );
}
