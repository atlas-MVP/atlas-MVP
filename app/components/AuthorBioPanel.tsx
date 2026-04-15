"use client";

interface Props {
  onClose: () => void;
}

export default function AuthorBioPanel({ onClose }: Props) {
  return (
    <div style={{
      position: "absolute", top: 72, left: 500, zIndex: 25, width: 300,
      background: "rgba(4,6,18,0.95)", backdropFilter: "blur(28px)",
      border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
      boxShadow: "0 0 40px rgba(0,0,0,0.7)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 8, fontFamily: "monospace", letterSpacing: "0.14em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Atlas — Editorial</span>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.12)", fontSize: 16, cursor: "pointer", lineHeight: 1, padding: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.12)")}>×</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(167,139,250,0.4)", flexShrink: 0, background: "linear-gradient(135deg,#4f3b78,#a78bfa)" }}>
            <img
              src="https://api.dicebear.com/9.x/notionists/svg?seed=JeniKim&backgroundColor=4f3b78&beardProbability=0&glassesProbability=0"
              alt="Jeni Kim"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.01em" }}>Jeni Kim</h3>
            <p style={{ margin: "3px 0 0", fontSize: 10, fontFamily: "monospace", color: "rgba(167,139,250,0.7)", letterSpacing: "0.06em" }}>Chief Editor</p>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          "Jeni holds a Bachelor's in Political Communication and Economics, and a Master's in International Affairs.",
          "She has worked at Harvard Kennedy School's Belfer Center, bringing research and policy expertise to complex geopolitical analysis.",
          "Her background spans the Innocence Project, the Office of Senator Lydia Edwards, and the NYC Department of Environmental Protection.",
          "Her philosophy: bridge the gap between expert knowledge and public understanding — making the stakes of global conflict legible to everyone.",
          "At Atlas, she leads editorial strategy, shaping how crises are framed, sourced, and told.",
        ].map((sentence, i) => (
          <p key={i} style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.52)", lineHeight: 1.65 }}>{sentence}</p>
        ))}

        {/* Credential pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
          {["Belfer Center", "Innocence Project", "Sen. Edwards Office", "NYC DEP", "Harvard Kennedy School"].map(tag => (
            <span key={tag} style={{
              fontSize: 9, fontFamily: "monospace", letterSpacing: "0.06em",
              padding: "3px 8px", borderRadius: 20,
              background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.18)",
              color: "rgba(167,139,250,0.65)",
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
