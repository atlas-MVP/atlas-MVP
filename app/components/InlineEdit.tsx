"use client";
import React, {
  createContext, useContext, useRef, useLayoutEffect, useState,
} from "react";
import { createPortal } from "react-dom";

// ── Edit mode context ─────────────────────────────────────────────────────────
export const EditModeCtx = createContext(false);
export const useEditMode  = () => useContext(EditModeCtx);

// ── Shared toolbar constants ───────────────────────────────────────────────────
const TEXT_COLORS = [
  { value: "rgba(255,255,255,0.92)" },
  { value: "rgba(255,255,255,0.55)" },
  { value: "rgba(255,255,255,0.35)" },
  { value: "#60a5fa" },
  { value: "#fbbf24" },
  { value: "#f87171" },
  { value: "#4ade80" },
];

const FONT_FAMILIES = [
  { label: "Mono",  value: "monospace"  },
  { label: "Sans",  value: "sans-serif" },
  { label: "Serif", value: "serif"      },
];

const miniBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.14)",
  color: "rgba(255,255,255,0.85)",
  borderRadius: 3,
  padding: "0 5px",
  cursor: "pointer",
  fontSize: 11,
  lineHeight: "16px",
  height: 18,
  flexShrink: 0,
};

// ── Style wrapper helpers ──────────────────────────────────────────────────────
// Styles (font-size, font-family, color) are encoded as a <span data-s="...">
// wrapper around the HTML content. This keeps them self-contained in the value
// string so they persist across saves without changing the data model.

type StyleMeta = { fontSize?: number; fontFamily?: string; color?: string };

function parseWrapper(v: string): { meta: StyleMeta; inner: string } {
  if (typeof document === "undefined") return { meta: {}, inner: v };
  const div = document.createElement("div");
  div.innerHTML = v;
  const first = div.firstElementChild;
  if (first instanceof HTMLElement && first.tagName === "SPAN" && first.dataset.s) {
    try {
      const meta = JSON.parse(decodeURIComponent(first.dataset.s)) as StyleMeta;
      return { meta, inner: first.innerHTML };
    } catch {}
  }
  return { meta: {}, inner: v };
}

function buildWrapper(inner: string, meta: StyleMeta): string {
  const parts: string[] = [];
  if (meta.fontSize)   parts.push(`font-size:${meta.fontSize}px`);
  if (meta.fontFamily) parts.push(`font-family:${meta.fontFamily}`);
  if (meta.color)      parts.push(`color:${meta.color}`);
  if (!parts.length)   return inner;
  return `<span data-s="${encodeURIComponent(JSON.stringify(meta))}" style="${parts.join(";")}">${inner}</span>`;
}

// ── EText ─────────────────────────────────────────────────────────────────────
interface ETextProps {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  as?: "span" | "div" | "p";
}

export function EText({ value, onChange, style, as: Tag = "span" }: ETextProps) {
  const editMode    = useEditMode();
  const ref         = useRef<HTMLElement>(null);
  const toolbarRef  = useRef<HTMLDivElement>(null);
  const [focused,    setFocused]    = useState(false);
  const [fontSize,   setFontSize]   = useState<number | null>(null);
  const [fontFamily, setFontFamily] = useState<string | null>(null);
  const [color,      setColor]      = useState<string | null>(null);
  const [tbPos,      setTbPos]      = useState<{ top: number; left: number } | null>(null);

  const baseFontSize   = typeof style?.fontSize   === "number" ? style.fontSize   : 13;
  const baseFontFamily = typeof style?.fontFamily  === "string" ? style.fontFamily : "monospace";

  // Sync innerHTML from parent, stripping the style wrapper so computedStyle governs.
  useLayoutEffect(() => {
    if (ref.current && !focused) {
      const { meta, inner } = parseWrapper(value);
      ref.current.innerHTML = inner;
      setFontSize(meta.fontSize   ?? null);
      setFontFamily(meta.fontFamily ?? null);
      setColor(meta.color         ?? null);
    }
  }, [value, focused, editMode]);

  // Read mode — render the full HTML including any style wrapper span.
  if (!editMode) {
    return <Tag style={style} dangerouslySetInnerHTML={{ __html: value }} />;
  }

  const fmt = (cmd: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, undefined);
  };

  const effectiveSize   = fontSize   ?? baseFontSize;
  const effectiveFamily = fontFamily ?? baseFontFamily;

  const computedStyle: React.CSSProperties = {
    ...style,
    fontSize:   effectiveSize,
    fontFamily: effectiveFamily,
    ...(color ? { color } : {}),
    outline:     "none",
    border: focused
      ? "1px solid rgba(100,160,255,0.7)"
      : "1px dashed rgba(255,255,255,0.30)",
    borderRadius: 4,
    padding: "2px 4px",
    margin: "-2px -4px",
    background: focused ? "rgba(100,160,255,0.08)" : "transparent",
    cursor: "text",
    minWidth: 20,
    display: Tag === "span" ? "inline-block" : "block",
    transition: "background 0.12s, border-color 0.12s",
  };

  const handleFocus = () => {
    setFocused(true);
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setTbPos({
        top:  Math.max(8, r.top - 52),
        left: Math.max(8, Math.min(r.left, window.innerWidth - 440)),
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    // If focus moved into the toolbar, keep the editing session alive.
    if (toolbarRef.current?.contains(e.relatedTarget as Node)) return;
    setFocused(false);
    setTbPos(null);

    let html = (e.currentTarget.innerHTML ?? "").replace(/&nbsp;/g, " ").trimEnd();

    // Build style metadata for non-default overrides.
    const meta: StyleMeta = {};
    if (fontSize   !== null && fontSize   !== baseFontSize)   meta.fontSize   = fontSize;
    if (fontFamily !== null && fontFamily !== baseFontFamily)  meta.fontFamily = fontFamily;
    if (color      !== null)                                   meta.color      = color;

    const final = buildWrapper(html, meta);
    if (final !== value) onChange(final);
  };

  const DIVIDER = (
    <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
  );

  const toolbar = focused && tbPos && typeof document !== "undefined"
    ? createPortal(
        <div
          ref={toolbarRef}
          style={{
            position: "fixed",
            top: tbPos.top,
            left: tbPos.left,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(8,10,22,0.97)",
            border: "1px solid rgba(255,255,255,0.13)",
            borderRadius: 6,
            padding: "3px 8px",
            boxShadow: "0 4px 18px rgba(0,0,0,0.7)",
            whiteSpace: "nowrap",
          }}
        >
          {/* ── Font size: − N + ──────────────────────────────────────────── */}
          <button
            onMouseDown={e => { e.preventDefault(); setFontSize(s => Math.max(9, (s ?? baseFontSize) - 1)); }}
            style={miniBtn}
          >−</button>
          <span style={{
            color: "rgba(255,255,255,0.75)", fontFamily: "monospace", fontSize: 10,
            minWidth: 24, textAlign: "center", flexShrink: 0,
          }}>
            {effectiveSize}
          </span>
          <button
            onMouseDown={e => { e.preventDefault(); setFontSize(s => Math.min(36, (s ?? baseFontSize) + 1)); }}
            style={miniBtn}
          >+</button>

          {DIVIDER}

          {/* ── Font family pills ─────────────────────────────────────────── */}
          {FONT_FAMILIES.map(ff => (
            <button
              key={ff.value}
              onMouseDown={e => { e.preventDefault(); setFontFamily(ff.value); }}
              style={{
                ...miniBtn,
                fontFamily: ff.value,
                background: effectiveFamily === ff.value ? "rgba(100,160,255,0.22)" : "rgba(255,255,255,0.07)",
                border:     effectiveFamily === ff.value ? "1px solid rgba(100,160,255,0.55)" : "1px solid rgba(255,255,255,0.14)",
                color:      effectiveFamily === ff.value ? "rgba(160,200,255,0.95)" : "rgba(255,255,255,0.75)",
              }}
            >{ff.label}</button>
          ))}

          {DIVIDER}

          {/* ── Bold / Italic / Underline ─────────────────────────────────── */}
          {([
            { label: "B", cmd: "bold",      s: { fontWeight: 700 as const } },
            { label: "I", cmd: "italic",    s: { fontStyle: "italic" as const } },
            { label: "U", cmd: "underline", s: { textDecoration: "underline" as const } },
          ] as const).map(({ label, cmd, s }) => (
            <button
              key={cmd}
              onMouseDown={e => { e.preventDefault(); fmt(cmd); }}
              style={{ ...s, ...miniBtn }}
            >{label}</button>
          ))}

          {DIVIDER}

          {/* ── Color swatches ────────────────────────────────────────────── */}
          {TEXT_COLORS.map(c => (
            <button
              key={c.value}
              onMouseDown={e => { e.preventDefault(); setColor(c.value); }}
              style={{
                width: 11, height: 11, borderRadius: "50%", background: c.value,
                border: color === c.value ? "2px solid #fff" : "1px solid rgba(255,255,255,0.25)",
                cursor: "pointer", padding: 0, flexShrink: 0,
              }}
            />
          ))}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {toolbar}
      {React.createElement(Tag, {
        ref: ref as React.RefObject<HTMLDivElement>,
        contentEditable: true,
        suppressContentEditableWarning: true,
        style: computedStyle,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" && Tag === "span") e.preventDefault();
        },
      })}
    </>
  );
}

// ── EImg ──────────────────────────────────────────────────────────────────────
interface EImgProps {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  onUploaded: (key: string, url: string) => void;
}

export function EImg({ src, alt, style, onUploaded }: EImgProps) {
  const editMode = useEditMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [hovering,  setHovering]  = useState(false);
  const [dragging,  setDragging]  = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch("/api/radar-image", { method: "POST", body: form });
      const data = await res.json() as { key: string; url: string };
      onUploaded(data.key, data.url);
    } finally {
      setUploading(false);
    }
  };

  const imgEl = (
    <img
      src={src} alt={alt}
      style={{
        width: "100%", height: "100%", objectFit: "cover", display: "block",
        opacity: uploading ? 0.35 : 1, transition: "opacity 0.2s",
      }}
      onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
    />
  );

  if (!editMode) {
    return <div style={style}>{imgEl}</div>;
  }

  const showOverlay = hovering || dragging || uploading;

  return (
    <div
      style={{ position: "relative", ...style }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onDragOver={e  => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault(); setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) upload(file);
      }}
    >
      {imgEl}
      {showOverlay && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          style={{
            position: "absolute", inset: 0,
            background: dragging ? "rgba(60,130,255,0.40)" : "rgba(0,0,0,0.48)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: uploading ? "wait" : "pointer",
            transition: "background 0.15s",
          }}
        >
          <span style={{
            color: "#fff", fontFamily: "monospace", fontSize: 11,
            letterSpacing: "0.12em", textShadow: "0 1px 6px rgba(0,0,0,0.8)",
          }}>
            {uploading ? "uploading…" : dragging ? "drop to upload" : "📷 change photo"}
          </span>
        </div>
      )}
      <input
        ref={inputRef} type="file" accept="image/*"
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
      />
    </div>
  );
}
