# Atlas Widget Structure — Site-wide Token

**CRITICAL:** Every new widget MUST follow this exact structure. This is a site-wide token established from the Israel/Iran conflict widget and applied to Gun Violence.

## Standard Widget Structure

All widgets use this 5-section layout:

### 1. Header
- **Title** (fontSize: 20, fontWeight: 700, color: clr.white(0.92))
- **Subtitle/Date range** (fontSize: 11, color: clr.white(0.42), fontFamily: T.MONO)
  - Example: "2026 – Present"
- **Close button** (✕) in top-right

```tsx
<div style={{ padding: "18px 20px 16px", borderBottom: `1px solid ${clr.white(0.06)}`, flexShrink: 0 }}>
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: clr.white(0.92), letterSpacing: "-0.01em", lineHeight: 1.15 }}>
        {title}
      </div>
      <div style={{ fontSize: 11, color: clr.white(0.42), marginTop: 4, fontFamily: T.MONO }}>
        {dateRange}
      </div>
    </div>
    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: clr.white(0.3), fontSize: 18, padding: "2px 6px", lineHeight: 1, flexShrink: 0 }}>
      ✕
    </button>
  </div>
</div>
```

### 2. Casualties Table
- **Monochrome design** — NO color coding
- Table with columns: [Entity], Injured, Killed, [Optional: Civ%, Incidents, etc.]
- Header row: fontSize 10, color: rgba(255,255,255,0.35)
- Data rows: fontSize 14, fontWeight 700, color: rgba(255,255,255,0.88)
- Border bottom: `1px solid rgba(255,255,255,0.05)`

```tsx
<div style={{ padding: "8px 14px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
  <table style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr>
        <th style={{ textAlign: "left", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", fontWeight: "normal", paddingBottom: 4, letterSpacing: "0.08em" }}></th>
        <th style={{ textAlign: "right", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", fontWeight: "normal", paddingBottom: 4, letterSpacing: "0.08em", paddingRight: 8 }}>Injured</th>
        <th style={{ textAlign: "right", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", fontWeight: "normal", paddingBottom: 4, letterSpacing: "0.08em", paddingRight: 8 }}>Killed</th>
      </tr>
    </thead>
    <tbody>
      {/* Data rows */}
    </tbody>
  </table>
</div>
```

### 3. Live Alerts Section
- **MUST use LiveAlertRow component** — DO NOT create custom alert cards
- Label: "live alerts" (fontSize: 11, uppercase, letterSpacing: "0.18em")
- Padding: `"14px 6px 6px"`
- Border bottom: `1px solid rgba(255,255,255,0.05)`
- Each alert gets lock/unlock interaction via `lockedAlertIdx`
- Close button (×) appears inline when locked

```tsx
<div style={{ padding: "14px 6px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
  <p style={{ margin: "0 0 6px 12px", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.42)", textTransform: "uppercase", fontWeight: 500 }}>
    live alerts
  </p>
  {alerts.slice(0, 4).map((alert, i, arr) => {
    const isLocked = lockedAlertIdx === i;
    return (
      <div key={alert.id} style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <LiveAlertRow
            item={alert}
            bottomBorder={i < arr.length - 1}
            showConfidenceInline={false}
            expandOnHover={true}
            isActive={isLocked || hoveredAlert === i}
            onClick={() => {
              setLockedAlertIdx(prev => prev === i ? null : i);
              onFlyTo?.(alert.flyTo.center, alert.flyTo.zoom);
            }}
            onHoverChange={(active) => {
              if (active) setHoveredAlert(i);
              else setHoveredAlert(null);
            }}
          />
        </div>
        {isLocked && (
          <div style={{ flexShrink: 0, paddingTop: 6 }}>
            <button onClick={() => setLockedAlertIdx(null)} /* ... */>×</button>
          </div>
        )}
      </div>
    );
  })}
</div>
```

### 4. Timeline Section
- Label: "timeline" (fontSize: 11, uppercase)
- Vertical line: `position: "absolute", left: 5, top: 6, bottom: 6, width: 1, background: "rgba(255,255,255,0.05)"`
- Timeline dots: 7px circles, monochrome
- Present/active dot: `background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.3)", boxShadow: "0 0 6px rgba(255,255,255,0.25)"`
- Past dots: reduced opacity

```tsx
<div style={{ padding: "0 16px 16px" }}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, marginBottom: 14 }}>
    <p style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.18em", color: "rgba(255,255,255,0.42)", textTransform: "uppercase", margin: 0, fontWeight: 500 }}>
      timeline
    </p>
  </div>
  <div style={{ position: "relative" }}>
    <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 1, background: "rgba(255,255,255,0.05)" }} />
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Timeline items */}
    </div>
  </div>
</div>
```

### 5. Footer
- Source attribution
- fontSize: 9, uppercase, letterSpacing: "0.16em"
- color: clr.white(0.22)
- Centered text

```tsx
<div style={{ padding: "10px 20px 14px", borderTop: `1px solid ${clr.white(0.05)}`, flexShrink: 0 }}>
  <p style={{ margin: 0, fontSize: 9, fontFamily: T.MONO, letterSpacing: "0.16em", color: clr.white(0.22), textAlign: "center", textTransform: "uppercase" }}>
    {source} · Atlas Intelligence
  </p>
</div>
```

## Color Rules

**CRITICAL: NO color coding based on severity, casualties, or status.**

- All borders: `rgba(255,255,255,0.06)` or similar white alpha
- All backgrounds: white alpha only (`clr.white(0.03)`, `rgba(255,255,255,0.04)`)
- All text: white alpha at various opacities
- Danger/severity is shown via LiveAlertRow's built-in dot color system ONLY

**Never:**
- Red borders for high casualties
- Orange/yellow severity indicators
- Colored chips or badges (except LiveAlertRow's confidence system)

## Layout Container

All widgets share this container:

```tsx
<div className="absolute left-6 z-20 w-[520px]" style={{ top: 72, bottom: 24, display: "flex", flexDirection: "column" }}>
  <div style={{
    flex: 1,
    overflowY: "auto",
    scrollbarWidth: "none",
    background: clr.panel(),
    backdropFilter: "blur(28px)",
    WebkitBackdropFilter: "blur(28px)",
    borderRadius: 20,
    border: `1px solid ${clr.white(0.07)}`,
    boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
    display: "flex",
    flexDirection: "column",
  }}>
    {/* Header, Body, Footer */}
  </div>
</div>
```

## Required State

Every widget needs:
```tsx
const [lockedAlertIdx, setLockedAlertIdx] = useState<number | null>(null);
const [hoveredAlert, setHoveredAlert] = useState<number | null>(null);
```

## Data Format

Alerts MUST use LiveAlert interface:
```tsx
interface LiveAlert {
  time: string;        // ISO format: "2026-04-19T12:14:00"
  text: string;        // Brief headline
  description: string; // Full description
  danger: number;      // 1-5
  confidence: number;  // 0-100
  sources: string[];   // ["AP", "Reuters"]
  pulse?: boolean;     // Force pulsing dot
  flyTo: { center: [number, number]; zoom: number };
  id: string;
}
```

## URL Routing

Every widget MUST have its own URL:
- Gun Violence: `/violence`
- Conflict widgets: `/israel-iran`, `/israel-gaza`, etc.

Implement with:
```tsx
window.history.replaceState({}, "", "/widget-slug");
```

## Reference Implementations

- **CountryPanel.tsx** — Original conflict widget (Israel/Iran, etc.)
- **GunViolencePanel.tsx** — First implementation of this standard

## When Creating a New Widget

1. Copy the structure from GunViolencePanel.tsx or CountryPanel.tsx
2. Replace data (casualties, alerts, timeline)
3. Update title and footer attribution
4. Add URL slug in page.tsx
5. **DO NOT** deviate from this structure without explicit approval
