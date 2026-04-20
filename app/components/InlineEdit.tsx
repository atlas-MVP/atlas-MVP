"use client";
import React, {
  createContext, useContext, useRef, useEffect, useLayoutEffect, useState, useCallback,
} from "react";
import { createPortal } from "react-dom";

// ── Edit mode context ─────────────────────────────────────────────────────────
export const EditModeCtx = createContext(false);
export const useEditMode  = () => useContext(EditModeCtx);

// ── EText ─────────────────────────────────────────────────────────────────────
const FONT_SIZES = [9, 10, 11, 12, 13, 14, 16, 18, 20, 24];
const TEXT_COLORS = [
  { value: "rgba(255,255,255,0.92)" },
  { value: "rgba(255,255,255,0.55)" },
  { value: "rgba(255,255,255,0.35)" },
  { value: "#60a5fa" },
  { value: "#fbbf24" },
  { value: "#f87171" },
  { value: "#4ade80" },
];

interface ETextProps {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  as?: "span" | "div" | "p";
}

export function EText({ value, onChange, style, as: Tag = "span" }: ETextProps) {
  const editMode   = useEditMode();
  const ref        = useRef<HTMLElement>(null);
  const [focused,  setFocused]  = useState(false);
  const [fontSize, setFontSize] = useState<number | null>(null);
  const [color,    setColor]    = useState<string | null>(null);
  const [tbPos,    setTbPos]    = useState<{ top: number; left: number } | null>(null);

  // Sync from parent. useLayoutEffect so there's no blank flash when edit mode turns on.
  // editMode in deps triggers a sync the moment the contentEditable element mounts.
  useLayoutEffect(() => {
    if (ref.current && !focused) {
      ref.current.textContent = value;
    }
  }, [value, focused, editMode]);

  if (!editMode) {
    return <Tag style={style}>{value}</Tag>;
  }

  const computedStyle: React.CSSProperties = {
    ...style,
    ...(fontSize ? { fontSize } : {}),
    ...(color    ? { color }    : {}),
    outline:     "none",
    borderBottom: focused
      ? "1px solid rgba(100,160,255,0.8)"
      : "1px dashed rgba(255,255,255,0.22)",
    cursor: "text",
    minWidth: 20,
    display: "inline-block",
  };

  const handleFocus = () => {
    setFocused(true);
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setTbPos({ top: r.top - 40, left: Math.max(8, r.left) });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    setFocused(false);
    setTbPos(null);
    const text = e.currentTarget.textContent ?? "";
    if (text !== value) onChange(text);
  };

  const toolbar = focused && tbPos && typeof document !== "undefined"
    ? createPortal(
        <div
          onMouseDown={e => e.preventDefault()}
          style={{
            position: "fixed",
            top: tbPos.top,
            left: tbPos.left,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(8,10,22,0.97)",
            border: "1px solid rgba(255,255,255,0.13)",
            borderRadius: 6,
            padding: "3px 8px",
            boxShadow: "0 4px 18px rgba(0,0,0,0.7)",
            whiteSpace: "nowrap",
          }}
        >
          <select
            value={fontSize ?? (typeof style?.fontSize === "number" ? style.fontSize : 12)}
            onChange={e => setFontSize(Number(e.target.value))}
            style={{
              background: "transparent", border: "none",
              color: "rgba(255,255,255,0.75)", fontFamily: "monospace",
              fontSize: 10, cursor: "pointer",
            }}
          >
            {FONT_SIZES.map(s => (
              <option key={s} value={s} style={{ background: "#0a0c18" }}>{s}px</option>
            ))}
          </select>
          <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.15)" }} />
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
          if (e.key === "Enter") e.preventDefault();
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

  const upload = useCallback(async (file: File) => {
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
  }, [onUploaded]);

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
            background: dragging
              ? "rgba(60,130,255,0.40)"
              : "rgba(0,0,0,0.48)",
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
