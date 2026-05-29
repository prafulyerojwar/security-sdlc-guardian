"use client";
import Link from "next/link";
import { SDLC_PHASES } from "@/lib/data";

export default function PhasesPage() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          <span className="gradient-text">SDLC Security Phases</span>
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 600 }}>
          Security controls, threats, tools, and checklists for every phase of the software development lifecycle.
        </p>
      </div>

      {/* Pipeline visual */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", marginBottom: "2.5rem", paddingBottom: 8 }}>
        {SDLC_PHASES.map((phase, i) => (
          <div key={phase.id} style={{ display: "flex", alignItems: "center", flex: "1 0 auto" }}>
            <Link href={`/phases/${phase.id}`} style={{ textDecoration: "none", display: "block" }}>
              <div className={`anim-fadeup delay-${i + 1}`} style={{ textAlign: "center", padding: "1rem 1.25rem", borderRadius: 12, background: "var(--card)", border: "1px solid var(--card-border)", minWidth: 130, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = phase.color; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--card-border)"; (e.currentTarget as HTMLDivElement).style.transform = ""; }}>
                <div style={{ fontSize: "1.75rem", marginBottom: 4 }}>{phase.icon}</div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: phase.color }}>Phase {phase.order}</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, marginTop: 2 }}>{phase.title}</div>
                <div style={{ marginTop: 8 }}>
                  <div className="progress-bar" style={{ height: 4 }}>
                    <div className="progress-fill" style={{ width: `${phase.kpi.score}%`, background: phase.color }} />
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 3 }}>{phase.kpi.score}% secure</div>
                </div>
              </div>
            </Link>
            {i < SDLC_PHASES.length - 1 && (
              <div style={{ flex: "0 0 28px", textAlign: "center", fontSize: "1.2rem", color: "var(--primary)", opacity: 0.5 }}>→</div>
            )}
          </div>
        ))}
      </div>

      {/* Phase Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {SDLC_PHASES.map((phase, i) => (
          <div key={phase.id} className={`card anim-fadeup delay-${i + 1}`} style={{ borderLeft: `4px solid ${phase.color}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: "1.5rem" }}>{phase.icon}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>{phase.title}</h2>
                      <span className={`badge badge-${phase.riskLevel === "critical" ? "critical" : "high"}`} style={{ fontSize: "0.65rem" }}>{phase.riskLevel} risk</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Phase {phase.order} of 6</div>
                  </div>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>{phase.description}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {phase.tools.map((t) => (
                    <span key={t} style={{ fontSize: "0.7rem", padding: "3px 8px", borderRadius: 6, background: "var(--muted-bg)", color: "var(--muted)", border: "1px solid var(--card-border)" }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "center", minWidth: 100 }}>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: phase.color }}>{phase.kpi.score}%</div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: 8 }}>{phase.kpi.passed}/{phase.kpi.items} controls</div>
                <Link href={`/phases/${phase.id}`} className="btn-primary" style={{ textDecoration: "none", fontSize: "0.8rem", display: "inline-block" }}>
                  Review →
                </Link>
              </div>
            </div>
            <div className="section-divider" style={{ margin: "1rem 0 0.75rem" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--danger)", marginBottom: 6 }}>⚠ Top Threats</div>
                {phase.threats.slice(0, 3).map((t) => (
                  <div key={t} style={{ fontSize: "0.75rem", color: "var(--muted)", padding: "2px 0", display: "flex", gap: 6 }}>
                    <span style={{ color: "var(--danger)", flexShrink: 0 }}>•</span>{t}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--success)", marginBottom: 6 }}>✓ Key Controls</div>
                {phase.controls.slice(0, 3).map((c) => (
                  <div key={c} style={{ fontSize: "0.75rem", color: "var(--muted)", padding: "2px 0", display: "flex", gap: 6 }}>
                    <span style={{ color: "var(--success)", flexShrink: 0 }}>•</span>{c.length > 60 ? c.slice(0, 60) + "…" : c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}