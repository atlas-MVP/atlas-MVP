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
  liveAlerts:    LiveAlertItem[];
  topConflicts:  ConflictItem[];
  moreConflicts: ConflictItem[];
  violenceItems: ViolenceItem[];
  financeItems:  FinanceItem[];
  disasters:     DisasterItem[];
}

// ── Nav (matches radar render order) ──────────────────────────────────────────

type Tab = "geo" | "alerts" | "violence" | "finance" | "disasters";

const NAV: { id: Tab; label: string }[] = [
  { id: "geo",       label: "Geopolitics" },
  { id: "alerts",    label: "Live Alerts" },
  { id: "violence",  label: "Violence"    },
  { id: "finance",   label: "Finance"     },
  { id: "disasters", label: "Disasters"   },
];

// ── Drag-and-drop helpers ──────────────────────────────────────────────────────

function reorder<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function useDrag<T>(items: T[], onChange: (items: T[]) => void) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [over,     setOver]     = useState<number | null>(null);

  const props = (i: number) => ({
    draggable: true as const,
    onDragStart: (e: React.DragEvent) => {
      setDragging(i);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(i)); // required for Firefox
    },
    onDragEnd:   () => { setDragging(null); setOver(null); },
    onDragOver:  (e: React.DragEvent) => { e.preventDefault(); setOver(i); },
    onDragLeave: () => setOver(null),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragging !== null && dragging !== i) onChange(reorder(items, dragging, i));
      setDragging(null); setOver(null);
    },
  });

  return { dragging, over, props };
}

// ── Shared styles ──────────────────────────────────────────────────────────────

const INPUT: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 6,
  color: "rgba(255,255,255,0.88)",
  fontFamily: "monospace", fontSize: 12,
  padding: "6px 9px", outline: "none",
};

const LBL: React.CSSProperties = {
  display: "block",
  fontSize: 9, fontFamily: "monospace", letterSpacing: "0.14em",
  color: "rgba(255,255,255,0.32)", textTransform: "uppercase",
  marginBottom: 3,
};

const ADD_BTN: React.CSSProperties = {
  width: "100%", marginTop: 6, padding: "8px",
  background: "rgba(255,255,255,0.03)",
  border: "1px dashed rgba(255,255,255,0.12)",
  borderRadius: 8, cursor: "pointer",
  fontFamily: "monospace", fontSize: 10, letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.38)", textAlign: "center" as const,
  transition: "background 0.12s, color 0.12s",
};

// ── Field components ───────────────────────────────────────────────────────────

function Field({
  label, value, onChange, multi = false, placeholder = "", type = "text",
}: {
  label: string; value: string | number; onChange: (v: string) => void;
  multi?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <span style={LBL}>{label}</span>
      {multi ? (
        <textarea
          value={value as string} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          rows={2}
          style={{ ...INPUT, resize: "vertical", lineHeight: 1.5 }}
        />
      ) : (
        <input
          type={type} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          style={INPUT}
        />
      )}
    </div>
  );
}

async function uploadImage(file: File): Promise<{ key: string; url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/radar-image", { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function PhotoField({
  imageUrl, image, onUploaded,
}: {
  imageUrl?: string; image?: string;
  onUploaded: (key: string, url: string) => void;
}) {
  const ref     = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const preview = imageUrl || image;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { key, url } = await uploadImage(file);
      onUploaded(key, url);
    } catch (err) { console.error("[RadarEditor] upload failed", err); }
    finally { setBusy(false); if (ref.current) ref.current.value = ""; }
  };

  return (
    <div style={{ marginBottom: 8 }}>
      <span style={LBL}>Photo</span>
      {preview && (
        <img
          src={preview} alt=""
          style={{
            width: "100%", height: 72, objectFit: "cover",
            borderRadius: 6, display: "block", marginBottom: 5,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      <button
        style={{
          ...INPUT, width: "auto", padding: "4px 10px", cursor: "pointer",
          color: busy ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.48)",
          fontSize: 10, letterSpacing: "0.10em",
        }}
        onClick={() => ref.current?.click()}
        disabled={busy}
      >
        {busy ? "uploading…" : preview ? "replace photo" : "upload photo"}
      </button>
    </div>
  );
}

// ── Draggable card shell ───────────────────────────────────────────────────────

function Card({
  isDragging, isOver, dragProps, onDelete, children,
}: {
  isDragging: boolean; isOver: boolean;
  dragProps: ReturnType<ReturnType<typeof useDrag>["props"]>;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      {...dragProps}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: isOver
          ? "1px solid rgba(96,165,250,0.55)"
          : "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, marginBottom: 6,
        opacity: isDragging ? 0.3 : 1,
        transition: "opacity 0.12s, border-color 0.1s",
        boxShadow: isOver ? "0 0 0 1px rgba(96,165,250,0.15)" : "none",
      }}
    >
      {/* Drag bar */}
      <div
        style={{
          padding: "7px 12px 5px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          cursor: "grab",
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.18)", letterSpacing: 3 }}>⠿⠿</span>
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onDelete}
          style={{
            background: "none", border: "none",
            color: "rgba(255,255,255,0.22)", fontSize: 13,
            cursor: "pointer", padding: "0 2px", lineHeight: 1,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(239,68,68,0.8)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.22)")}
        >✕</button>
      </div>

      {/* Fields */}
      <div style={{ padding: "10px 14px 12px" }}>
        {children}
      </div>
    </div>
  );
}

// ── Section panels ─────────────────────────────────────────────────────────────

function AlertsSection({
  items, onChange,
}: {
  items: LiveAlertItem[];
  onChange: (items: LiveAlertItem[]) => void;
}) {
  const { dragging, over, props } = useDrag(items, onChange);
  const set = (i: number, p: Partial<LiveAlertItem>) =>
    onChange(items.map((x, idx) => (idx === i ? { ...x, ...p } : x)));
  const blank = (): LiveAlertItem => ({
    time: new Date().toISOString(), danger: 3, code: "", text: "", description: "",
    sources: [], confidence: 85,
  });

  return (
    <>
      {items.map((item, i) => (
        <Card
          key={i}
          isDragging={dragging === i} isOver={over === i}
          dragProps={props(i)}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}
        >
          <Field label="Headline" value={item.text} onChange={v => set(i, { text: v })} multi placeholder="What happened?" />
          <Field label="Body" value={item.description} onChange={v => set(i, { description: v })} multi placeholder="More context…" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <Field label="Country code" value={item.code} onChange={v => set(i, { code: v })} placeholder="USA" />
            <Field label="Danger 1–5" value={item.danger} type="number" onChange={v => set(i, { danger: Number(v) })} />
            <Field label="Confidence %" value={item.confidence} type="number" onChange={v => set(i, { confidence: Number(v) })} />
          </div>
          <Field label="Sources (comma-separated)" value={item.sources.join(", ")} onChange={v => set(i, { sources: v.split(",").map(s => s.trim()).filter(Boolean) })} placeholder="AP, Reuters, BBC" />
          <Field label="Timestamp (ISO)" value={item.time} onChange={v => set(i, { time: v })} placeholder="2026-04-19T12:14:00" />
          <Field label="Slug (for panel routing)" value={item.slug ?? ""} onChange={v => set(i, { slug: v })} placeholder="gun-violence" />
        </Card>
      ))}
      <button style={ADD_BTN} onClick={() => onChange([...items, blank()])}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}
      >+ Add alert</button>
    </>
  );
}

function ViolenceSection({
  items, onChange,
}: {
  items: ViolenceItem[];
  onChange: (items: ViolenceItem[]) => void;
}) {
  const { dragging, over, props } = useDrag(items, onChange);
  const set = (i: number, p: Partial<ViolenceItem>) =>
    onChange(items.map((x, idx) => (idx === i ? { ...x, ...p } : x)));
  const blank = (): ViolenceItem => ({ slug: "", headline: "", source: "" });

  return (
    <>
      {items.map((item, i) => (
        <Card key={i} isDragging={dragging === i} isOver={over === i} dragProps={props(i)}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}>
          <Field label="Headline" value={item.headline} onChange={v => set(i, { headline: v })} multi placeholder="What happened?" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Field label="Slug" value={item.slug} onChange={v => set(i, { slug: v })} placeholder="violence" />
            <Field label="Source" value={item.source} onChange={v => set(i, { source: v })} placeholder="AP" />
          </div>
          <Field label="Incident ID (links to panel)" value={item.incidentId ?? ""} onChange={v => set(i, { incidentId: v })} placeholder="iowa-city-2026-04-19" />
          <PhotoField imageUrl={item.imageUrl} image={item.image} onUploaded={(key, url) => set(i, { imageKey: key, imageUrl: url })} />
        </Card>
      ))}
      <button style={ADD_BTN} onClick={() => onChange([...items, blank()])}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}
      >+ Add item</button>
    </>
  );
}

function FinanceSection({
  items, onChange,
}: {
  items: FinanceItem[];
  onChange: (items: FinanceItem[]) => void;
}) {
  const { dragging, over, props } = useDrag(items, onChange);
  const set = (i: number, p: Partial<FinanceItem>) =>
    onChange(items.map((x, idx) => (idx === i ? { ...x, ...p } : x)));
  const blank = (): FinanceItem => ({ slug: "", headline: "", source: "" });

  return (
    <>
      {items.map((item, i) => (
        <Card key={i} isDragging={dragging === i} isOver={over === i} dragProps={props(i)}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}>
          <Field label="Headline" value={item.headline} onChange={v => set(i, { headline: v })} multi placeholder="Market headline…" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Field label="Slug" value={item.slug} onChange={v => set(i, { slug: v })} placeholder="oil-hormuz" />
            <Field label="Source" value={item.source} onChange={v => set(i, { source: v })} placeholder="Bloomberg" />
          </div>
          <PhotoField imageUrl={item.imageUrl} image={item.image} onUploaded={(key, url) => set(i, { imageKey: key, imageUrl: url })} />
        </Card>
      ))}
      <button style={ADD_BTN} onClick={() => onChange([...items, blank()])}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}
      >+ Add item</button>
    </>
  );
}

function DisastersSection({
  items, onChange,
}: {
  items: DisasterItem[];
  onChange: (items: DisasterItem[]) => void;
}) {
  const { dragging, over, props } = useDrag(items, onChange);
  const set = (i: number, p: Partial<DisasterItem>) =>
    onChange(items.map((x, idx) => (idx === i ? { ...x, ...p } : x)));
  const blank = (): DisasterItem => ({ label: "", slug: "", sub: "" });

  return (
    <>
      {items.map((item, i) => (
        <Card key={i} isDragging={dragging === i} isOver={over === i} dragProps={props(i)}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}>
          <Field label="Name" value={item.label} onChange={v => set(i, { label: v })} placeholder="Kenya floods" />
          <Field label="Summary" value={item.sub} onChange={v => set(i, { sub: v })} multi placeholder="110+ dead · 34,765+ displaced…" />
          <Field label="Slug" value={item.slug} onChange={v => set(i, { slug: v })} placeholder="kenya-floods" />
          <PhotoField imageUrl={item.imageUrl} image={item.image} onUploaded={(key, url) => set(i, { imageKey: key, imageUrl: url })} />
        </Card>
      ))}
      <button style={ADD_BTN} onClick={() => onChange([...items, blank()])}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}
      >+ Add disaster</button>
    </>
  );
}

function GeoSection({
  top, more, onTop, onMore,
}: {
  top: ConflictItem[]; more: ConflictItem[];
  onTop: (items: ConflictItem[]) => void;
  onMore: (items: ConflictItem[]) => void;
}) {
  const dt = useDrag(top, onTop);
  const dm = useDrag(more, onMore);
  const setTop  = (i: number, p: Partial<ConflictItem>) => onTop(top.map((x, idx) => idx === i ? { ...x, ...p } : x));
  const setMore = (i: number, p: Partial<ConflictItem>) => onMore(more.map((x, idx) => idx === i ? { ...x, ...p } : x));
  const blank = (): ConflictItem => ({ label: "", sub: "", code: "", slug: "" });

  const ConflictCard = ({
    item, i, drag, onDel, set,
  }: {
    item: ConflictItem; i: number;
    drag: ReturnType<typeof useDrag<ConflictItem>>;
    onDel: () => void;
    set: (i: number, p: Partial<ConflictItem>) => void;
  }) => (
    <Card isDragging={drag.dragging === i} isOver={drag.over === i} dragProps={drag.props(i)} onDelete={onDel}>
      <Field label="Name" value={item.label} onChange={v => set(i, { label: v })} placeholder="Israel / US in the Middle East" />
      <Field label="Summary" value={item.sub} onChange={v => set(i, { sub: v })} multi placeholder="Situation overview…" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Field label="Country code" value={item.code} onChange={v => set(i, { code: v })} placeholder="ISR" />
        <Field label="Slug" value={item.slug} onChange={v => set(i, { slug: v })} placeholder="israel-and-us-in-the-middle-east" />
      </div>
      <PhotoField imageUrl={item.imageUrl} image={item.image} onUploaded={(key, url) => set(i, { imageKey: key, imageUrl: url })} />
    </Card>
  );

  return (
    <>
      <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.16em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 8 }}>
        Featured card
      </div>
      {top.map((item, i) => (
        <ConflictCard key={`t${i}`} item={item} i={i} drag={dt} onDel={() => onTop(top.filter((_, idx) => idx !== i))} set={setTop} />
      ))}
      <button style={ADD_BTN} onClick={() => onTop([...top, blank()])}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}
      >+ Add featured conflict</button>

      <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.16em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", margin: "20px 0 8px" }}>
        More conflicts
      </div>
      {more.map((item, i) => (
        <ConflictCard key={`m${i}`} item={item} i={i} drag={dm} onDel={() => onMore(more.filter((_, idx) => idx !== i))} set={setMore} />
      ))}
      <button style={ADD_BTN} onClick={() => onMore([...more, blank()])}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}
      >+ Add conflict</button>
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
  const [tab,   setTab]   = useState<Tab>("geo");
  const [draft, setDraft] = useState<RadarConfig>(config);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const patch = (key: keyof RadarConfig, val: unknown) =>
    setDraft(d => ({ ...d, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const counts: Record<Tab, number> = {
    geo:       draft.topConflicts.length + draft.moreConflicts.length,
    alerts:    draft.liveAlerts.length,
    violence:  draft.violenceItems.length,
    finance:   draft.financeItems.length,
    disasters: draft.disasters.length,
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.72)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "100%", maxWidth: 760,
          height: "min(88vh, 680px)",
          background: "rgba(8,11,22,0.98)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 16,
          boxShadow: "0 32px 100px rgba(0,0,0,0.7)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}>
          <div>
            <div style={{
              fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.9)",
              letterSpacing: "-0.01em",
            }}>
              Atlas Radar
            </div>
            <div style={{
              fontSize: 9, fontFamily: "monospace", letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.30)", textTransform: "uppercase", marginTop: 2,
            }}>edit mode</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saved
                  ? "rgba(34,197,94,0.15)"
                  : saving
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(96,165,250,0.14)",
                border: `1px solid ${saved ? "rgba(34,197,94,0.4)" : saving ? "rgba(255,255,255,0.10)" : "rgba(96,165,250,0.35)"}`,
                borderRadius: 8,
                color: saved ? "rgba(34,197,94,0.9)" : saving ? "rgba(255,255,255,0.3)" : "rgba(96,165,250,0.9)",
                fontFamily: "monospace", fontSize: 11, letterSpacing: "0.12em",
                padding: "6px 18px", cursor: saving ? "default" : "pointer",
                transition: "all 0.2s",
                fontWeight: 600,
              }}
            >
              {saved ? "✓ saved" : saving ? "saving…" : "Save"}
            </button>
            <button
              onClick={onClose}
              style={{
                background: "none", border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8, color: "rgba(255,255,255,0.38)",
                fontFamily: "monospace", fontSize: 14,
                padding: "4px 11px", cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
            >✕</button>
          </div>
        </div>

        {/* ── Body: sidebar + content ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Sidebar nav */}
          <div style={{
            width: 148, flexShrink: 0,
            borderRight: "1px solid rgba(255,255,255,0.06)",
            padding: "12px 0",
            display: "flex", flexDirection: "column", gap: 2,
          }}>
            {NAV.map(n => {
              const active = tab === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setTab(n.id)}
                  style={{
                    width: "100%", textAlign: "left",
                    background: active ? "rgba(255,255,255,0.05)" : "none",
                    border: "none",
                    borderLeft: `2px solid ${active ? "rgba(96,165,250,0.7)" : "transparent"}`,
                    color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.38)",
                    fontFamily: "monospace", fontSize: 11, letterSpacing: "0.10em",
                    padding: "9px 14px",
                    cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    transition: "background 0.12s, color 0.12s",
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.62)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.color = "rgba(255,255,255,0.38)";
                    }
                  }}
                >
                  <span>{n.label}</span>
                  {counts[n.id] > 0 && (
                    <span style={{
                      fontSize: 9, fontFamily: "monospace",
                      background: active ? "rgba(96,165,250,0.18)" : "rgba(255,255,255,0.07)",
                      border: `1px solid ${active ? "rgba(96,165,250,0.25)" : "rgba(255,255,255,0.10)"}`,
                      color: active ? "rgba(96,165,250,0.9)" : "rgba(255,255,255,0.38)",
                      borderRadius: 99, padding: "1px 6px",
                      transition: "all 0.12s",
                    }}>
                      {counts[n.id]}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Hint at the bottom */}
            <div style={{
              marginTop: "auto", padding: "12px 14px",
              fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.18)", textTransform: "uppercase", lineHeight: 1.6,
            }}>
              Drag ⠿ to<br />reorder items
            </div>
          </div>

          {/* Content area */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "16px 20px",
            scrollbarWidth: "thin",
          }}>
            {tab === "geo"       && <GeoSection top={draft.topConflicts} more={draft.moreConflicts} onTop={v => patch("topConflicts", v)} onMore={v => patch("moreConflicts", v)} />}
            {tab === "alerts"    && <AlertsSection items={draft.liveAlerts} onChange={v => patch("liveAlerts", v)} />}
            {tab === "violence"  && <ViolenceSection items={draft.violenceItems} onChange={v => patch("violenceItems", v)} />}
            {tab === "finance"   && <FinanceSection items={draft.financeItems} onChange={v => patch("financeItems", v)} />}
            {tab === "disasters" && <DisastersSection items={draft.disasters} onChange={v => patch("disasters", v)} />}
          </div>
        </div>
      </div>
    </div>
  );
}
