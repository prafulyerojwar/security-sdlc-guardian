"use client";
import { use, useState } from "react";
import Link from "next/link";
import { SDLC_PHASES } from "@/lib/data";
import { notFound } from "next/navigation";

export default function PhaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const phase = SDLC_PHASES.find((p) => p.id === id);
  if (!phase) return notFound();

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const passCount = Object.values(checked).filter(Boolean).length;

  const allPhases = SDLC_PHASES;
  const currentIdx = allPhases.findIndex((p) => p.id === id);
  const prev = currentIdx > 0 ? allPhases[currentIdx - 1] : null;
  const next = currentIdx < allPhases.length - 1 ? allPhases[currentIdx + 1] : null;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem", display: "flex", gap: 6, alignItems: "center" }}>
        <Link href="/" style={{ color: "var(--primary)", textDecoration: "none" }}>Dashboard</Link>
        <span>/</span>
        <Link href="/phases" style={{ color: "var(--primary)", textDecoration: "none" }}>Phases</Link>
        <span>/</span>
        <span>{phase.title}</span>
      </div>

      {/* Header */}
      <div className="card anim-fadeup" style={{ marginBottom: "1.5rem", borderTop: `4px solid ${phase.color}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "2rem" }}>{phase.icon}</span>
              <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{phase.title}</h1>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <span className={`badge badge-${phase.riskLevel === "critical" ? "critical" : "high"}`}>{phase.riskLevel} risk</span>
                  <span className="badge badge-info">Phase {phase.order}/6</span>
                </div>
              </div>
            </div>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>{phase.description}</p>
          </div>
          <div style={{ textAlign: "center", minWidth: 120 }}>
            <div style={{ fontSize: "3rem", fontWeight: 900, color: phase.color, lineHeight: 1 }}>{phase.kpi.score}%</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>{phase.kpi.passed}/{phase.kpi.items} controls passed</div>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div className="progress-fill" style={{ width: `${phase.kpi.score}%`, background: phase.color }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
        {/* Threats */}
        <div className="card anim-fadeup delay-1">
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--danger)", display: "flex", alignItems: "center", gap: 6 }}>
            ⚠️ Security Threats
          </h2>
          {phase.threats.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--card-border)" }}>
              <span style={{ color: "var(--danger)", fontWeight: 700, flexShrink: 0 }}>⚡</span>
              <span style={{ fontSize: "0.85rem" }}>{t}</span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="card anim-fadeup delay-2">
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--success)", display: "flex", alignItems: "center", gap: 6 }}>
            🛡️ Security Controls
          </h2>
          {phase.controls.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--card-border)" }}>
              <span style={{ color: "var(--success)", flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: "0.85rem" }}>{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="card anim-fadeup delay-3" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>🔧 Recommended Tools</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {phase.tools.map((tool) => (
            <div key={tool} style={{ padding: "8px 16px", borderRadius: 8, background: "var(--muted-bg)", border: "1px solid var(--card-border)", fontSize: "0.85rem", fontWeight: 500, color: "var(--primary)", display: "flex", alignItems: "center", gap: 6 }}>
              🔧 {tool}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Checklist */}
      <div className="card anim-fadeup delay-4" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>✅ Security Checklist</h2>
          <span className="badge badge-info">{passCount}/{phase.checklist.length} done</span>
        </div>
        <div className="progress-bar" style={{ marginBottom: "1rem" }}>
          <div className="progress-fill" style={{ width: `${(passCount / phase.checklist.length) * 100}%` }} />
        </div>
        {phase.checklist.map((item) => (
          <div key={item.id} className="check-item" style={{ cursor: "pointer" }} onClick={() => setChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked[item.id] ? "var(--success)" : "var(--card-border)"}`, background: checked[item.id] ? "var(--success)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", color: "#fff", fontSize: "0.75rem" }}>
              {checked[item.id] ? "✓" : ""}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "0.875rem", textDecoration: checked[item.id] ? "line-through" : "none", opacity: checked[item.id] ? 0.5 : 1 }}>{item.text}</span>
            </div>
            <span className={`badge badge-${item.severity}`} style={{ fontSize: "0.65rem", flexShrink: 0 }}>{item.severity}</span>
          </div>
        ))}
      </div>

      {/* Phase Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        {prev ? (
          <Link href={`/phases/${prev.id}`} className="btn-outline" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
            ← {prev.icon} {prev.title}
          </Link>
        ) : <div />}
        {next && (
          <Link href={`/phases/${next.id}`} className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
            {next.icon} {next.title} →
          </Link>
        )}
      </div>
    </div>
  );
}
