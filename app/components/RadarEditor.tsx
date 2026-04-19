"use client";

import React, { useState, useRef } from "react";
import { T, clr } from "../lib/tokens";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LiveAlertItem {
  time: string;
  danger: number;
  code: string;
  text: string;
  description: string;
  sources: string[];
  confidence: number;
  slug?: string;
  pulse?: boolean;
  incidentId?: string;
  flyTo?: { center: [number, number]; zoom: number };
}

export interface ConflictItem {
  label: string;
  sub: string;
  code: string;
  slug: string;
  flyTo?: { center: [number, number]; zoom: number };
  pulse?: boolean;
  image?: string;
  imageKey?: string;
  imageUrl?: string;
}

export interface DisasterItem {
  label: string;
  slug: string;
  sub: string;
  flyTo?: { center: [number, number]; zoom: number };
  image?: string;
  imageKey?: string;
  imageUrl?: string;
}

export interface ViolenceItem {
  slug: string;
  headline: string;
  image?: string;
  imageKey?: string;
  imageUrl?: string;
  source: string;
  flyTo?: { center: [number, number]; zoom: number };
  incidentId?: string;
}

export interface FinanceItem {
  slug: string;
  headline: string;
  image?: string;
  imageKey?: string;
  imageUrl?: string;
  source: string;
}

export interface RadarConfig {
  liveAlerts:   LiveAlertItem[];
  topConflicts: ConflictItem[];
  moreConflicts: ConflictItem[];
  violenceItems: ViolenceItem[];
  financeItems:  FinanceItem[];
  disasters:     DisasterItem[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

type Tab = "alerts" | "violence" | "finance" | "disasters" | "geopolitics";

const TABS: { id: Tab; label: string }[] = [
  { id: "alerts",     label: "ALERTS" },
  { id: "violence",   label: "VIOLENCE" },
  { id: "finance",    label: "FINANCE" },
  { id: "disasters",  label: "DISASTERS" },
  { id: "geopolitics",label: "GEO" },
];

const FIELD_STYLE: React.CSSProperties = {
  width: "100%",
  background: clr.white(0.05),
  border: `1px solid ${clr.white(0.12)}`,
  borderRadius: 6,
  color: clr.white(0.9),
  fontFamily: T.MONO,
  fontSize: 12,
  padding: "5px 8px",
  outline: "none",
  boxSizing: "border-box",
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 9,
  fontFamily: T.MONO,
  letterSpacing: T.TRACK_WIDE,
  color: clr.white(0.38),
  textTransform: "uppercase",
  marginBottom: 3,
};

const BTN_SMALL: React.CSSProperties = {
  background: clr.white(0.06),
  border: `1px solid ${clr.white(0.12)}`,
  borderRadius: 5,
  color: clr.white(0.55),
  fontFamily: T.MONO,
  fontSize: 10,
  padding: "3px 7px",
  cursor: "pointer",
  letterSpacing: T.TRACK_MED,
};

function Field({
  label, value, onChange, multiline = false, type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={LABEL_STYLE}>{label}</div>
      {multiline ? (
        <textarea
          value={value as string}
          onChange={e => onChange(e.target.value)}
          rows={3}
          style={{ ...FIELD_STYLE, resize: "vertical", lineHeight: 1.45 }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={FIELD_STYLE}
        />
      )}
    </div>
  );
}

// Upload an image and return { key, url }
async function uploadImage(file: File): Promise<{ key: string; url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/radar-image", { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function ImageArea({
  imageUrl,
  image,
  onUploaded,
}: {
  imageUrl?: string;
  image?: string;
  onUploaded: (key: string, url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const preview = imageUrl || image;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { key, url } = await uploadImage(file);
      onUploaded(key, url);
    } catch (err) {
      console.error("[RadarEditor] image upload failed", err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={LABEL_STYLE}>image</div>
      {preview && (
        <img
          src={preview}
          alt=""
          style={{
            width: "100%", height: 60, objectFit: "cover",
            borderRadius: 6, display: "block", marginBottom: 5,
            border: `1px solid ${clr.white(0.10)}`,
          }}
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      <button
        style={BTN_SMALL}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "uploading…" : "upload photo"}
      </button>
    </div>
  );
}

// ── Item card wrappers ──────────────────────────────────────────────────────────

function CardShell({
  children, onUp, onDown, onDelete,
}: {
  children: React.ReactNode;
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div style={{
      background: clr.white(0.04),
      border: `1px solid ${clr.white(0.10)}`,
      borderRadius: 10,
      padding: "12px 14px",
      marginBottom: 8,
      position: "relative",
    }}>
      {children}
      <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
        <button style={BTN_SMALL} onClick={onUp}>↑</button>
        <button style={BTN_SMALL} onClick={onDown}>↓</button>
        <button
          style={{ ...BTN_SMALL, color: clr.red(0.75), borderColor: clr.red(0.25) }}
          onClick={onDelete}
        >
          🗑
        </button>
      </div>
    </div>
  );
}

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const next = [...arr];
  const j = i + dir;
  if (j < 0 || j >= next.length) return next;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

// ── Tab panels ─────────────────────────────────────────────────────────────────

function AlertsPanel({
  items, onChange,
}: {
  items: LiveAlertItem[];
  onChange: (items: LiveAlertItem[]) => void;
}) {
  const set = (i: number, patch: Partial<LiveAlertItem>) =>
    onChange(items.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const blank = (): LiveAlertItem => ({
    time: "", danger: 3, code: "", text: "", description: "",
    sources: [], confidence: 85,
  });

  return (
    <>
      {items.map((item, i) => (
        <CardShell
          key={i}
          onUp={() => onChange(move(items, i, -1))}
          onDown={() => onChange(move(items, i, 1))}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}
        >
          <Field label="time" value={item.time} onChange={v => set(i, { time: v })} />
          <Field label="code" value={item.code} onChange={v => set(i, { code: v })} />
          <Field label="slug" value={item.slug ?? ""} onChange={v => set(i, { slug: v })} />
          <Field label="text" value={item.text} onChange={v => set(i, { text: v })} multiline />
          <Field label="description" value={item.description} onChange={v => set(i, { description: v })} multiline />
          <Field label="danger (1-5)" value={item.danger} type="number" onChange={v => set(i, { danger: Number(v) })} />
          <Field label="confidence (0-100)" value={item.confidence} type="number" onChange={v => set(i, { confidence: Number(v) })} />
          <Field label="sources (comma-separated)" value={item.sources.join(", ")} onChange={v => set(i, { sources: v.split(",").map(s => s.trim()).filter(Boolean) })} />
        </CardShell>
      ))}
      <button style={{ ...BTN_SMALL, width: "100%", textAlign: "center", marginTop: 4 }} onClick={() => onChange([...items, blank()])}>
        + add alert
      </button>
    </>
  );
}

function ViolencePanel({
  items, onChange,
}: {
  items: ViolenceItem[];
  onChange: (items: ViolenceItem[]) => void;
}) {
  const set = (i: number, patch: Partial<ViolenceItem>) =>
    onChange(items.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const blank = (): ViolenceItem => ({
    slug: "", headline: "", source: "", incidentId: "",
  });

  return (
    <>
      {items.map((item, i) => (
        <CardShell
          key={i}
          onUp={() => onChange(move(items, i, -1))}
          onDown={() => onChange(move(items, i, 1))}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}
        >
          <Field label="headline" value={item.headline} onChange={v => set(i, { headline: v })} multiline />
          <Field label="slug" value={item.slug} onChange={v => set(i, { slug: v })} />
          <Field label="source" value={item.source} onChange={v => set(i, { source: v })} />
          <Field label="incidentId" value={item.incidentId ?? ""} onChange={v => set(i, { incidentId: v })} />
          <ImageArea
            imageUrl={item.imageUrl}
            image={item.image}
            onUploaded={(key, url) => set(i, { imageKey: key, imageUrl: url })}
          />
        </CardShell>
      ))}
      <button style={{ ...BTN_SMALL, width: "100%", textAlign: "center", marginTop: 4 }} onClick={() => onChange([...items, blank()])}>
        + add item
      </button>
    </>
  );
}

function FinancePanel({
  items, onChange,
}: {
  items: FinanceItem[];
  onChange: (items: FinanceItem[]) => void;
}) {
  const set = (i: number, patch: Partial<FinanceItem>) =>
    onChange(items.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const blank = (): FinanceItem => ({ slug: "", headline: "", source: "" });

  return (
    <>
      {items.map((item, i) => (
        <CardShell
          key={i}
          onUp={() => onChange(move(items, i, -1))}
          onDown={() => onChange(move(items, i, 1))}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}
        >
          <Field label="headline" value={item.headline} onChange={v => set(i, { headline: v })} multiline />
          <Field label="slug" value={item.slug} onChange={v => set(i, { slug: v })} />
          <Field label="source" value={item.source} onChange={v => set(i, { source: v })} />
          <ImageArea
            imageUrl={item.imageUrl}
            image={item.image}
            onUploaded={(key, url) => set(i, { imageKey: key, imageUrl: url })}
          />
        </CardShell>
      ))}
      <button style={{ ...BTN_SMALL, width: "100%", textAlign: "center", marginTop: 4 }} onClick={() => onChange([...items, blank()])}>
        + add item
      </button>
    </>
  );
}

function DisastersPanel({
  items, onChange,
}: {
  items: DisasterItem[];
  onChange: (items: DisasterItem[]) => void;
}) {
  const set = (i: number, patch: Partial<DisasterItem>) =>
    onChange(items.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const blank = (): DisasterItem => ({ label: "", slug: "", sub: "" });

  return (
    <>
      {items.map((item, i) => (
        <CardShell
          key={i}
          onUp={() => onChange(move(items, i, -1))}
          onDown={() => onChange(move(items, i, 1))}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}
        >
          <Field label="label" value={item.label} onChange={v => set(i, { label: v })} />
          <Field label="slug" value={item.slug} onChange={v => set(i, { slug: v })} />
          <Field label="sub" value={item.sub} onChange={v => set(i, { sub: v })} multiline />
          <ImageArea
            imageUrl={item.imageUrl}
            image={item.image}
            onUploaded={(key, url) => set(i, { imageKey: key, imageUrl: url })}
          />
        </CardShell>
      ))}
      <button style={{ ...BTN_SMALL, width: "100%", textAlign: "center", marginTop: 4 }} onClick={() => onChange([...items, blank()])}>
        + add item
      </button>
    </>
  );
}

function ConflictsPanel({
  top, more, onChangeTop, onChangeMore,
}: {
  top: ConflictItem[];
  more: ConflictItem[];
  onChangeTop: (items: ConflictItem[]) => void;
  onChangeMore: (items: ConflictItem[]) => void;
}) {
  const setTop  = (i: number, patch: Partial<ConflictItem>) =>
    onChangeTop(top.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const setMore = (i: number, patch: Partial<ConflictItem>) =>
    onChangeMore(more.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const blankConflict = (): ConflictItem => ({ label: "", sub: "", code: "", slug: "" });

  const ConflictCard = ({
    item, i, items, onChange, set,
  }: {
    item: ConflictItem;
    i: number;
    items: ConflictItem[];
    onChange: (items: ConflictItem[]) => void;
    set: (i: number, patch: Partial<ConflictItem>) => void;
  }) => (
    <CardShell
      onUp={() => onChange(move(items, i, -1))}
      onDown={() => onChange(move(items, i, 1))}
      onDelete={() => onChange(items.filter((_, idx) => idx !== i))}
    >
      <Field label="label" value={item.label} onChange={v => set(i, { label: v })} />
      <Field label="sub" value={item.sub} onChange={v => set(i, { sub: v })} multiline />
      <Field label="code" value={item.code} onChange={v => set(i, { code: v })} />
      <Field label="slug" value={item.slug} onChange={v => set(i, { slug: v })} />
      <ImageArea
        imageUrl={item.imageUrl}
        image={item.image}
        onUploaded={(key, url) => set(i, { imageKey: key, imageUrl: url })}
      />
    </CardShell>
  );

  return (
    <>
      <div style={{ ...LABEL_STYLE, marginBottom: 8, marginTop: 4 }}>top conflicts</div>
      {top.map((item, i) => (
        <ConflictCard key={`top-${i}`} item={item} i={i} items={top} onChange={onChangeTop} set={setTop} />
      ))}
      <button style={{ ...BTN_SMALL, width: "100%", textAlign: "center", marginBottom: 16 }} onClick={() => onChangeTop([...top, blankConflict()])}>
        + add top conflict
      </button>

      <div style={{ ...LABEL_STYLE, marginBottom: 8 }}>more conflicts</div>
      {more.map((item, i) => (
        <ConflictCard key={`more-${i}`} item={item} i={i} items={more} onChange={onChangeMore} set={setMore} />
      ))}
      <button style={{ ...BTN_SMALL, width: "100%", textAlign: "center", marginTop: 4 }} onClick={() => onChangeMore([...more, blankConflict()])}>
        + add more conflict
      </button>
    </>
  );
}

// ── Main RadarEditor ───────────────────────────────────────────────────────────

export interface RadarEditorProps {
  config: RadarConfig;
  onSave: (c: RadarConfig) => Promise<void>;
  onClose: () => void;
}

export default function RadarEditor({ config, onSave, onClose }: RadarEditorProps) {
  const [tab, setTab]     = useState<Tab>("alerts");
  const [draft, setDraft] = useState<RadarConfig>(config);
  const [saving, setSaving] = useState(false);

  const patch = (key: keyof RadarConfig, val: unknown) =>
    setDraft(d => ({ ...d, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  };

  return (
    // Backdrop
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: clr.black(0.75),
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        overflowY: "auto",
        padding: "32px 16px",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div
        style={{
          width: "100%", maxWidth: 700,
          background: T.MODAL_BG,
          border: T.MODAL_BORDER,
          borderRadius: T.MODAL_RADIUS,
          boxShadow: T.MODAL_SHADOW,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          flexShrink: 0,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: `1px solid ${clr.white(0.08)}`,
        }}>
          <span style={{
            fontFamily: T.MONO, fontSize: 11, letterSpacing: T.TRACK_XWIDE,
            color: clr.white(0.55), textTransform: "uppercase",
          }}>
            radar editor
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saving ? clr.white(0.08) : clr.blue(0.18),
                border: `1px solid ${clr.blue(0.35)}`,
                borderRadius: 6, color: clr.blue(1),
                fontFamily: T.MONO, fontSize: 11, letterSpacing: T.TRACK_MED,
                padding: "5px 14px", cursor: saving ? "default" : "pointer",
                transition: T.FADE,
              }}
            >
              {saving ? "saving…" : "save"}
            </button>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: `1px solid ${clr.white(0.12)}`,
                borderRadius: 6, color: clr.white(0.5),
                fontFamily: T.MONO, fontSize: 13,
                padding: "3px 10px", cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 2, padding: "10px 14px 0",
          borderBottom: `1px solid ${clr.white(0.08)}`,
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: tab === t.id ? clr.white(0.09) : "none",
                border: `1px solid ${tab === t.id ? clr.white(0.16) : "transparent"}`,
                borderBottom: "none",
                borderRadius: "6px 6px 0 0",
                color: tab === t.id ? clr.white(0.9) : clr.white(0.38),
                fontFamily: T.MONO, fontSize: 10, letterSpacing: T.TRACK_WIDE,
                padding: "5px 12px", cursor: "pointer",
                transition: T.FADE,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "16px 18px", overflowY: "auto", maxHeight: "70vh" }}>
          {tab === "alerts" && (
            <AlertsPanel
              items={draft.liveAlerts}
              onChange={v => patch("liveAlerts", v)}
            />
          )}
          {tab === "violence" && (
            <ViolencePanel
              items={draft.violenceItems}
              onChange={v => patch("violenceItems", v)}
            />
          )}
          {tab === "finance" && (
            <FinancePanel
              items={draft.financeItems}
              onChange={v => patch("financeItems", v)}
            />
          )}
          {tab === "disasters" && (
            <DisastersPanel
              items={draft.disasters}
              onChange={v => patch("disasters", v)}
            />
          )}
          {tab === "geopolitics" && (
            <ConflictsPanel
              top={draft.topConflicts}
              more={draft.moreConflicts}
              onChangeTop={v => patch("topConflicts", v)}
              onChangeMore={v => patch("moreConflicts", v)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
