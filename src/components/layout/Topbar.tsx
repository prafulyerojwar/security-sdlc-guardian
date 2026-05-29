"use client";
import { useState } from "react";
import { useTheme } from "@/lib/theme";

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, setTheme, themes } = useTheme();
  const [showThemes, setShowThemes] = useState(false);

  return (
    <header style={{
      height: 60, background: "var(--card)", borderBottom: "1px solid var(--card-border)",
      display: "flex", alignItems: "center", padding: "0 1.25rem",
      position: "sticky", top: 0, zIndex: 30, gap: 12,
    }}>
      <button onClick={onMenuClick} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "var(--fg)", padding: 4, display: "none" }} className="sdlc-hamburger">☰</button>
      <style>{`@media(max-width:767px){.sdlc-hamburger{display:flex!important;}}`}</style>

      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--muted)" }}>Security SDLC</div>
        <span style={{ color: "var(--muted)", opacity: 0.4 }}>/</span>
        <div style={{ fontSize: "0.85rem", color: "var(--fg)" }}>Guardian Platform</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="badge badge-critical" style={{ fontSize: "0.7rem" }}>3 Critical</span>
        <span className="badge badge-high" style={{ fontSize: "0.7rem" }}>8 High</span>

        <div style={{ position: "relative" }}>
          <button onClick={() => setShowThemes(!showThemes)} style={{ background: "var(--muted-bg)", border: "1px solid var(--card-border)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "var(--fg)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 6 }}>
            {themes.find((t) => t.id === theme)?.icon} Theme
          </button>
          {showThemes && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "0.5rem", zIndex: 100, minWidth: 160, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
              {themes.map((t) => (
                <button key={t.id} onClick={() => { setTheme(t.id); setShowThemes(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: theme === t.id ? "var(--primary-glow)" : "transparent", color: theme === t.id ? "var(--primary)" : "var(--fg)", fontWeight: theme === t.id ? 600 : 400, fontSize: "0.85rem" }}>
                  <span>{t.icon}</span>
                  <div style={{ textAlign: "left" }}>
                    <div>{t.label}</div>
                    <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}