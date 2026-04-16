"use client";

import { useState, useCallback } from "react";

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  padding: "9px 12px", borderRadius: 8,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.72)",
  fontSize: 12, fontFamily: "monospace", letterSpacing: "0.03em", outline: "none",
};

const LABEL_STYLE: React.CSSProperties = {
  margin: "0 0 4px", fontSize: 9, fontFamily: "monospace",
  letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
};

// ── Destination options ──────────────────────────────────────────────────────
// "reels"                  → master Atlas Reels feed (folder: reels/)
// { scope: "event", eventId } → attached ONLY to that timeline event, NOT in master feed
//                              (folder: events/<eventId>/)
type Destination =
  | { scope: "reels"; label: string }
  | { scope: "event"; eventId: string; label: string };

// Master feed only — event uploads happen in-context from the timeline
// tiles on atlas.boston (see EventUploadButton).
const DESTINATIONS: Destination[] = [
  { scope: "reels", label: "Atlas You (master feed)" },
];

function destKey(d: Destination): string {
  return d.scope === "reels" ? "reels" : `event:${d.eventId}`;
}
function destFromKey(key: string): Destination {
  if (key === "reels") return DESTINATIONS[0];
  const eventId = key.slice("event:".length);
  return DESTINATIONS.find(d => d.scope === "event" && d.eventId === eventId) ?? DESTINATIONS[0];
}

function DestinationSelector({ value, onChange }: { value: Destination; onChange: (d: Destination) => void }) {
  const isEvent = value.scope === "event";
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={LABEL_STYLE}>Destination</p>
      <select
        value={destKey(value)}
        onChange={e => onChange(destFromKey(e.target.value))}
        style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
      >
        {DESTINATIONS.map(d => (
          <option key={destKey(d)} value={destKey(d)} style={{ background: "#0a0d1a", color: "rgba(255,255,255,0.85)" }}>
            {d.label}
          </option>
        ))}
      </select>
      <p style={{ margin: "6px 0 0", fontSize: 9, fontFamily: "monospace", color: isEvent ? "rgba(239,68,68,0.55)" : "rgba(255,255,255,0.25)", letterSpacing: "0.06em" }}>
        {isEvent
          ? `→ stored in events/${(value as { eventId: string }).eventId}/ — will NOT appear in master feed`
          : "→ stored in reels/ — visible to all users in Atlas You"}
      </p>
    </div>
  );
}

type MetaState = { title: string; date: string; location: string; handle: string; caption: string };
const emptyMeta = (): MetaState => ({ title: "", date: "", location: "", handle: "", caption: "" });

function MetaFields({ meta, setMeta }: { meta: MetaState; setMeta: (m: MetaState) => void }) {
  const fields: { key: keyof MetaState; label: string }[] = [
    { key: "title",    label: "Title"    },
    { key: "date",     label: "Date"     },
    { key: "location", label: "Location" },
    { key: "handle",   label: "Handle"   },
    { key: "caption",  label: "Caption"  },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ margin: "0 0 2px", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>metadata</p>
      {fields.map(({ key, label }) => (
        <div key={key}>
          <p style={LABEL_STYLE}>{label}</p>
          {key === "caption" ? (
            <textarea value={meta[key]}
              onChange={e => setMeta({ ...meta, [key]: e.target.value })}
              rows={2} style={{ ...inputStyle, resize: "vertical" as const }} />
          ) : (
            <input type="text" value={meta[key]}
              onChange={e => setMeta({ ...meta, [key]: e.target.value })}
              style={inputStyle} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── File upload tab ───────────────────────────────────────────────────────────
function FileUpload({ dest }: { dest: Destination }) {
  const [file, setFile]         = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pct, setPct]           = useState(0);
  const [result, setResult]     = useState<{ id: string; title: string } | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [meta, setMeta]         = useState<MetaState>(emptyMeta());

  const resetAll = () => {
    setFile(null); setPct(0); setResult(null); setError(null); setMeta(emptyMeta());
  };

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) { setError("Only video files supported (MP4, WebM, MOV)"); return; }
    setFile(f); setError(null); setResult(null);
  }, []);

  const upload = () => {
    if (!file) return;
    setUploading(true); setError(null); setPct(0); setResult(null);
    const form = new FormData();
    form.append("file", file);
    form.append("title",    meta.title    || file.name);
    form.append("date",     meta.date);
    form.append("location", meta.location);
    form.append("handle",   meta.handle   || "atlas");
    form.append("caption",  meta.caption);
    form.append("scope",    dest.scope);
    if (dest.scope === "event") form.append("eventId", dest.eventId);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = e => { if (e.lengthComputable) setPct(Math.round(e.loaded / e.total * 100)); };
    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) setResult(JSON.parse(xhr.responseText));
      else { try { setError(JSON.parse(xhr.responseText).error); } catch { setError("Upload failed"); } }
    };
    xhr.onerror = () => { setUploading(false); setError("Network error"); };
    xhr.open("POST", "/api/upload");
    xhr.send(form);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Drop zone */}
      <div
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => !uploading && document.getElementById("file-input")?.click()}
        style={{
          border: `2px dashed ${dragging ? "rgba(239,68,68,0.5)" : file ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.10)"}`,
          borderRadius: 14, padding: "32px 24px", textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer", transition: "all 0.25s",
          background: dragging ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.015)",
        }}
      >
        <input id="file-input" type="file" accept="video/*" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
        <p style={{ margin: "0 0 6px", fontSize: 26, lineHeight: 1 }}>{file ? "🎬" : "📁"}</p>
        <p style={{ margin: "0 0 4px", fontSize: 13, color: file ? "rgba(34,197,94,0.8)" : "rgba(255,255,255,0.55)" }}>
          {file ? file.name : "Drop video here or click to browse"}
        </p>
        <p style={{ margin: 0, fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.2)" }}>
          {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "MP4 · WebM · MOV · 10 GB free on R2"}
        </p>
      </div>

      {file && <MetaFields meta={meta} setMeta={setMeta} />}

      {file && (
        <button onClick={upload} disabled={uploading} style={{
          padding: "11px", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.14em",
          textTransform: "uppercase", borderRadius: 10, width: "100%", cursor: uploading ? "not-allowed" : "pointer",
          background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.3)",
          color: uploading ? "rgba(255,255,255,0.25)" : "rgba(239,68,68,0.85)",
        }}>{uploading ? `uploading ${pct}%…` : `↑ upload → ${dest.scope === "event" ? dest.eventId : "reels"}`}</button>
      )}

      {uploading && (
        <div style={{ height: 2, background: "rgba(255,255,255,0.07)", borderRadius: 1, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "rgba(239,68,68,0.75)", transition: "width 0.3s" }} />
        </div>
      )}

      {result && <Success id={result.id} title={result.title} dest={dest} onUndone={resetAll} />}
      {error   && <ErrorBox msg={error} />}
    </div>
  );
}

// ── Embed URL tab ─────────────────────────────────────────────────────────────
function EmbedUpload({ dest }: { dest: Destination }) {
  const [url, setUrl]       = useState("");
  const [meta, setMeta]     = useState<MetaState>(emptyMeta());
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ id: string; title: string } | null>(null);
  const [error, setError]   = useState<string | null>(null);

  const resetAll = () => {
    setUrl(""); setMeta(emptyMeta()); setResult(null); setError(null);
  };

  const detected = url.match(/youtu\.?be|youtube/) ? "YouTube" :
                   url.match(/twitter\.com|x\.com/) ? "Twitter / X" :
                   url.match(/^https?:\/\//) ? "Direct video URL" : "";

  const save = async () => {
    if (!url) return;
    setSaving(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embedUrl: url,
          // Pass metadata through as-is — empty strings stay empty so the reel
          // renders bare with only the embed's own native chrome.
          ...meta,
          scope: dest.scope,
          ...(dest.scope === "event" ? { eventId: dest.eventId } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error);
      else setResult(data);
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

  // YouTube + tweets carry their own title/handle/caption/date, so Atlas chrome
  // would just sit on top of the embed's own chrome. For direct video URLs
  // there's no built-in metadata, so filling the fields is more useful.
  const hint =
    detected === "YouTube"        ? "YouTube already shows its own title / channel — leave blank to render the player bare. Fill in any field to overlay Atlas chrome."
  : detected === "Twitter / X"    ? "Tweets already carry their own handle / text / date — leave blank to render the tweet bare. Fill in any field to overlay Atlas chrome."
  : detected === "Direct video URL" ? "Recommended for direct video URLs — there's no built-in title or caption, so whatever you fill in is what viewers will see."
  : "All metadata fields are optional. Fill any to overlay Atlas chrome, or leave blank to render the embed bare.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <p style={LABEL_STYLE}>Paste URL</p>
        <input
          type="url" placeholder="https://youtube.com/watch?v=… or https://x.com/…/status/…"
          value={url} onChange={e => { setUrl(e.target.value); setResult(null); setError(null); }}
          style={inputStyle}
        />
        {detected && (
          <p style={{ margin: "6px 0 0", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em", color: "rgba(34,197,94,0.6)", textTransform: "uppercase" }}>
            ✓ detected: {detected}
          </p>
        )}
      </div>

      {url && (
        <>
          <div style={{
            padding: "10px 12px", borderRadius: 8,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <p style={{
              margin: 0, fontSize: 10, fontFamily: "monospace",
              color: "rgba(255,255,255,0.45)", lineHeight: 1.5, letterSpacing: "0.02em",
            }}>
              <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>metadata — optional.</span>{" "}
              {hint}
            </p>
          </div>
          <MetaFields meta={meta} setMeta={setMeta} />
        </>
      )}

      {url && (
        <button onClick={save} disabled={saving} style={{
          padding: "11px", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.14em",
          textTransform: "uppercase", borderRadius: 10, width: "100%", cursor: saving ? "not-allowed" : "pointer",
          background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.3)",
          color: saving ? "rgba(255,255,255,0.25)" : "rgba(239,68,68,0.85)",
        }}>{saving ? "saving…" : `↑ add → ${dest.scope === "event" ? dest.eventId : "reels"}`}</button>
      )}

      {result && <Success id={result.id} title={result.title} dest={dest} onUndone={resetAll} />}
      {error   && <ErrorBox msg={error} />}
    </div>
  );
}

function Success({ id, title, dest, onUndone }: { id: string; title: string; dest: Destination; onUndone: () => void }) {
  const [undoing, setUndoing] = useState(false);
  const [undone,  setUndone]  = useState(false);
  const [err,     setErr]     = useState<string | null>(null);
  const where = dest.scope === "event" ? `timeline event "${dest.eventId}"` : "Atlas You feed";

  const undo = async () => {
    setUndoing(true); setErr(null);
    try {
      const res  = await fetch(`/api/upload?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "delete failed"); setUndoing(false); return; }
      setUndone(true);
      // Give the user a beat to see the "removed" state, then reset the form
      setTimeout(onUndone, 700);
    } catch (e) {
      setErr((e as Error).message);
      setUndoing(false);
    }
  };

  if (undone) {
    return (
      <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>✓ removed — resetting…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 14px", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 10 }}>
      <p style={{ margin: 0, fontSize: 11, color: "rgba(34,197,94,0.75)", flex: 1, lineHeight: 1.45 }}>
        ✓ live — {title ? <>&ldquo;{title}&rdquo;</> : "upload"} is now in the {where}
        {err && <span style={{ display: "block", color: "rgba(239,68,68,0.75)", marginTop: 4 }}>{err}</span>}
      </p>
      <button
        onClick={undo}
        disabled={undoing}
        title="undo / remove this upload"
        style={{
          flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)",
          color: undoing ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.55)",
          fontSize: 13, lineHeight: 1, cursor: undoing ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 0,
        }}
        onMouseEnter={e => { if (!undoing) { e.currentTarget.style.color = "rgba(239,68,68,0.85)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)"; } }}
        onMouseLeave={e => { if (!undoing) { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; } }}
      >{undoing ? "…" : "×"}</button>
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 10 }}>
      <p style={{ margin: 0, fontSize: 12, color: "rgba(239,68,68,0.75)" }}>{msg}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function UploadPage() {
  const [tab, setTab]   = useState<"file" | "embed">("file");
  const [dest, setDest] = useState<Destination>(DESTINATIONS[0]);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "8px", fontSize: 10, fontFamily: "monospace",
    letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
    background: active ? "rgba(255,255,255,0.06)" : "transparent",
    border: "none", borderBottom: `1px solid ${active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}`,
    color: active ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.28)",
    transition: "all 0.2s",
  });

  return (
    <main style={{ minHeight: "100vh", background: "rgb(4,6,18)", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ width: "100%", maxWidth: 560, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 40 }}>

        <p style={{ margin: "0 0 4px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.28em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase" }}>atlas · admin · cloudflare r2</p>
        <h1 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 300, color: "rgba(255,255,255,0.82)", letterSpacing: "0.04em" }}>Video Upload</h1>

        {/* Destination selector — picks the R2 folder + visibility scope */}
        <DestinationSelector value={dest} onChange={setDest} />

        {/* Tabs */}
        <div style={{ display: "flex", marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button style={tabStyle(tab === "file")}  onClick={() => setTab("file")}>↑ Upload File</button>
          <button style={tabStyle(tab === "embed")} onClick={() => setTab("embed")}>⊞ Embed URL</button>
        </div>

        {tab === "file"  && <FileUpload  dest={dest} />}
        {tab === "embed" && <EmbedUpload dest={dest} />}
      </div>
    </main>
  );
}
