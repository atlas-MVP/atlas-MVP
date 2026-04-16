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

type MetaState = { title: string; date: string; location: string; handle: string; caption: string };
const emptyMeta = (): MetaState => ({ title: "", date: "", location: "", handle: "", caption: "" });

function MetaFields({ meta, setMeta }: { meta: MetaState; setMeta: (m: MetaState) => void }) {
  const fields: { key: keyof MetaState; label: string; placeholder: string }[] = [
    { key: "title",    label: "Title",    placeholder: "hurricane helene" },
    { key: "date",     label: "Date",     placeholder: "august 27th, 2024" },
    { key: "location", label: "Location", placeholder: "boone, nc" },
    { key: "handle",   label: "Handle",   placeholder: "OliverWeaver" },
    { key: "caption",  label: "Caption",  placeholder: "flooding near the bridge..." },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ margin: "0 0 2px", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>metadata</p>
      {fields.map(({ key, label, placeholder }) => (
        <div key={key}>
          <p style={LABEL_STYLE}>{label}</p>
          {key === "caption" ? (
            <textarea placeholder={placeholder} value={meta[key]}
              onChange={e => setMeta({ ...meta, [key]: e.target.value })}
              rows={2} style={{ ...inputStyle, resize: "vertical" as const }} />
          ) : (
            <input type="text" placeholder={placeholder} value={meta[key]}
              onChange={e => setMeta({ ...meta, [key]: e.target.value })}
              style={inputStyle} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── File upload tab ───────────────────────────────────────────────────────────
function FileUpload() {
  const [file, setFile]         = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pct, setPct]           = useState(0);
  const [result, setResult]     = useState<{ title: string } | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [meta, setMeta]         = useState<MetaState>(emptyMeta());

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
          {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "MP4 · WebM · MOV"}
        </p>
      </div>

      {file && <MetaFields meta={meta} setMeta={setMeta} />}

      {file && (
        <button onClick={upload} disabled={uploading} style={{
          padding: "11px", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.14em",
          textTransform: "uppercase", borderRadius: 10, width: "100%", cursor: uploading ? "not-allowed" : "pointer",
          background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.3)",
          color: uploading ? "rgba(255,255,255,0.25)" : "rgba(239,68,68,0.85)",
        }}>{uploading ? `uploading ${pct}%…` : "↑ upload to atlas"}</button>
      )}

      {uploading && (
        <div style={{ height: 2, background: "rgba(255,255,255,0.07)", borderRadius: 1, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "rgba(239,68,68,0.75)", transition: "width 0.3s" }} />
        </div>
      )}

      {result && <Success title={result.title} />}
      {error   && <ErrorBox msg={error} />}
    </div>
  );
}

// ── Embed URL tab ─────────────────────────────────────────────────────────────
function EmbedUpload() {
  const [url, setUrl]       = useState("");
  const [meta, setMeta]     = useState<MetaState>(emptyMeta());
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ title: string } | null>(null);
  const [error, setError]   = useState<string | null>(null);

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
        body: JSON.stringify({ embedUrl: url, ...meta, title: meta.title || detected }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error);
      else setResult(data);
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

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

      {url && <MetaFields meta={meta} setMeta={setMeta} />}

      {url && (
        <button onClick={save} disabled={saving} style={{
          padding: "11px", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.14em",
          textTransform: "uppercase", borderRadius: 10, width: "100%", cursor: saving ? "not-allowed" : "pointer",
          background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.3)",
          color: saving ? "rgba(255,255,255,0.25)" : "rgba(239,68,68,0.85)",
        }}>{saving ? "saving…" : "↑ add to atlas feed"}</button>
      )}

      {result && <Success title={result.title} />}
      {error   && <ErrorBox msg={error} />}
    </div>
  );
}

function Success({ title }: { title: string }) {
  return (
    <div style={{ padding: "14px 16px", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 12 }}>
      <p style={{ margin: 0, fontSize: 11, color: "rgba(34,197,94,0.75)" }}>✓ live — "{title}" is now in the Atlas Reels feed</p>
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
  const [tab, setTab] = useState<"file" | "embed">("file");

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

        <p style={{ margin: "0 0 4px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.28em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase" }}>atlas · admin</p>
        <h1 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 300, color: "rgba(255,255,255,0.82)", letterSpacing: "0.04em" }}>Video Upload</h1>

        {/* Tabs */}
        <div style={{ display: "flex", marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button style={tabStyle(tab === "file")}  onClick={() => setTab("file")}>↑ Upload File</button>
          <button style={tabStyle(tab === "embed")} onClick={() => setTab("embed")}>⊞ Embed URL</button>
        </div>

        {tab === "file"  && <FileUpload />}
        {tab === "embed" && <EmbedUpload />}
      </div>
    </main>
  );
}
