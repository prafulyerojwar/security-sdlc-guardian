"use client";
import { useState } from "react";
import { SDLC_PHASES, SECURITY_DOMAINS } from "@/lib/data";

export default function ChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [activePhase, setActivePhase] = useState("all");

  const allItems = SDLC_PHASES.flatMap((p) => p.checklist.map((c) => ({ ...c, phase: p.title, phaseId: p.id, phaseIcon: p.icon, phaseColor: p.color })));
  const filtered = activePhase === "all" ? allItems : allItems.filter((i) => i.phaseId === activePhase);

  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const totalDone = filtered.filter((i) => checked[i.id]).length;
  const pct = Math.round((totalDone / filtered.length) * 100);

  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
  filtered.forEach((i) => { if (!checked[i.id]) bySeverity[i.severity as keyof typeof bySeverity]++; });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          <span className="gradient-text">Security Checklist</span>
        </h1>
        <p style={{ color: "var(--muted)" }}>Interactive security checklist across all SDLC phases. Track your security posture in real time.</p>
      </div>

      {/* Score card */}
      <div className="card anim-fadeup" style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)" }}>{pct}%</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{totalDone}/{filtered.length} completed</div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="progress-bar" style={{ height: 10, marginBottom: 12 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(bySeverity).map(([sev, cnt]) => cnt > 0 && (
              <span key={sev} className={`badge badge-${sev}`}>{cnt} {sev} open</span>
            ))}
          </div>
        </div>
        <button onClick={() => setChecked({})} className="btn-outline" style={{ fontSize: "0.8rem" }}>Reset All</button>
        <button onClick={() => { const all: Record<string, boolean> = {}; filtered.forEach((i) => { all[i.id] = true; }); setChecked(all); }} className="btn-primary" style={{ fontSize: "0.8rem" }}>
          Mark All Done
        </button>
      </div>

      {/* Phase Filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <button onClick={() => setActivePhase("all")} className={activePhase === "all" ? "btn-primary" : "btn-outline"} style={{ fontSize: "0.8rem" }}>All Phases</button>
        {SDLC_PHASES.map((p) => (
          <button key={p.id} onClick={() => setActivePhase(p.id)} style={{ fontSize: "0.8rem", padding: "6px 14px", borderRadius: 8, border: `1px solid ${activePhase === p.id ? p.color : "var(--card-border)"}`, background: activePhase === p.id ? p.color + "22" : "transparent", color: activePhase === p.id ? p.color : "var(--fg)", cursor: "pointer", transition: "all 0.2s" }}>
            {p.icon} {p.title}
          </button>
        ))}
      </div>

      {/* Checklist Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map((item) => (
          <div key={item.id} onClick={() => toggle(item.id)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, background: "var(--card)", border: `1px solid ${checked[item.id] ? "var(--success)" : "var(--card-border)"}`, cursor: "pointer", transition: "all 0.2s", opacity: checked[item.id] ? 0.6 : 1 }}
            onMouseEnter={(e) => { if (!checked[item.id]) (e.currentTarget as HTMLDivElement).style.borderColor = "var(--primary)"; }}
            onMouseLeave={(e) => { if (!checked[item.id]) (e.currentTarget as HTMLDivElement).style.borderColor = "var(--card-border)"; }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${checked[item.id] ? "var(--success)" : "var(--card-border)"}`, background: checked[item.id] ? "var(--success)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", color: "#fff", fontSize: "0.8rem" }}>
              {checked[item.id] ? "✓" : ""}
            </div>
            <span style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 6, background: item.phaseColor + "22", color: item.phaseColor, fontWeight: 600, flexShrink: 0 }}>
              {item.phaseIcon} {item.phase}
            </span>
            <span style={{ flex: 1, fontSize: "0.875rem", textDecoration: checked[item.id] ? "line-through" : "none" }}>{item.text}</span>
            <span className={`badge badge-${item.severity}`} style={{ fontSize: "0.65rem", flexShrink: 0 }}>{item.severity}</span>
          </div>
        ))}
      </div>

      {/* Domain Checklist */}
      <div style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Security Domain Controls</h2>
        <div className="grid-2">
          {SECURITY_DOMAINS.map((domain) => (
            <div key={domain.id} className="card" style={{ borderTop: `3px solid ${domain.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "1.25rem" }}>{domain.icon}</span>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 700 }}>{domain.title}</h3>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.75rem" }}>{domain.description}</p>
              {domain.controls.slice(0, 4).map((c, i) => (
                <div key={i} style={{ fontSize: "0.75rem", color: "var(--muted)", padding: "4px 0", display: "flex", gap: 6, borderBottom: i < 3 ? "1px solid var(--card-border)" : "none" }}>
                  <span style={{ color: "var(--success)", flexShrink: 0 }}>✓</span>{c}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
