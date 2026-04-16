"use client";

import { useState, useCallback } from "react";
import { upload } from "@vercel/blob/client";

export default function UploadPage() {
  const [uploading, setUploading]   = useState(false);
  const [pct, setPct]               = useState(0);
  const [url, setUrl]               = useState<string | null>(null);
  const [copied, setCopied]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [dragging, setDragging]     = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Only video files are supported (MP4, WebM, MOV)");
      return;
    }
    setUploading(true);
    setUrl(null);
    setError(null);
    setPct(0);
    setCopied(false);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        onUploadProgress: (p) => setPct(p.percentage),
      });
      setUrl(blob.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const copyUrl = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main style={{
      minHeight: "100vh", background: "rgb(4,6,18)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 40,
    }}>
      <div style={{
        width: "100%", maxWidth: 560,
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(40px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: 40,
      }}>
        {/* Header */}
        <p style={{ margin: "0 0 4px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.28em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase" }}>
          atlas · admin
        </p>
        <h1 style={{ margin: "0 0 36px", fontSize: 22, fontWeight: 300, color: "rgba(255,255,255,0.82)", letterSpacing: "0.04em" }}>
          Video Upload
        </h1>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => !uploading && document.getElementById("file-input")?.click()}
          style={{
            border: `2px dashed ${dragging ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.10)"}`,
            borderRadius: 14, padding: "52px 24px", textAlign: "center",
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "all 0.25s",
            background: dragging ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.015)",
          }}
        >
          <input
            id="file-input"
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
          <p style={{ margin: "0 0 8px", fontSize: 32, lineHeight: 1 }}>🎬</p>
          <p style={{ margin: "0 0 6px", fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
            {uploading ? "Uploading…" : "Drop video here or click to browse"}
          </p>
          <p style={{ margin: 0, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.07em", color: "rgba(255,255,255,0.2)" }}>
            MP4 · WebM · MOV · up to 1 GB
          </p>
        </div>

        {/* Progress bar */}
        {uploading && (
          <div style={{ marginTop: 20 }}>
            <div style={{
              height: 2, background: "rgba(255,255,255,0.07)", borderRadius: 1, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                background: "rgba(239,68,68,0.75)", transition: "width 0.3s ease",
              }} />
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)" }}>
              uploading {pct.toFixed(0)}%
            </p>
          </div>
        )}

        {/* Success */}
        {url && (
          <div style={{
            marginTop: 24, padding: "16px 18px",
            background: "rgba(34,197,94,0.05)",
            border: "1px solid rgba(34,197,94,0.18)",
            borderRadius: 12,
          }}>
            <p style={{ margin: "0 0 10px", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(34,197,94,0.6)" }}>
              ✓ ready — paste this url into videoUrl
            </p>
            <code style={{
              display: "block", fontSize: 11, color: "rgba(255,255,255,0.65)",
              wordBreak: "break-all", lineHeight: 1.6, userSelect: "all",
            }}>
              {url}
            </code>
            <button
              onClick={copyUrl}
              style={{
                marginTop: 12, fontSize: 9, fontFamily: "monospace",
                letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "6px 14px", borderRadius: 6, cursor: "pointer",
                background: copied ? "rgba(34,197,94,0.2)" : "rgba(34,197,94,0.10)",
                border: `1px solid rgba(34,197,94,${copied ? "0.4" : "0.22"})`,
                color: copied ? "rgba(34,197,94,0.9)" : "rgba(34,197,94,0.65)",
                transition: "all 0.2s",
              }}
            >
              {copied ? "✓ copied" : "copy url"}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 20, padding: "12px 16px",
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.18)",
            borderRadius: 10,
          }}>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(239,68,68,0.75)" }}>{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ margin: "0 0 10px", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>
            how to use
          </p>
          {[
            "Upload your video → copy the URL above",
            "Paste URL into videoUrl in CountryPanel.tsx",
            "The player auto-detects MP4/WebM vs YouTube",
            "Videos auto-play when the slide becomes active",
          ].map((line, i) => (
            <p key={i} style={{ margin: "0 0 6px", fontSize: 11, color: "rgba(255,255,255,0.28)", lineHeight: 1.6 }}>
              <span style={{ fontFamily: "monospace", color: "rgba(255,255,255,0.15)", marginRight: 8 }}>{i + 1}.</span>
              {line}
            </p>
          ))}
        </div>
      </div>
    </main>
  );
}
