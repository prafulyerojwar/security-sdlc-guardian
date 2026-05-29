"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SDLC_PHASES, OWASP_TOP10, OVERALL_SECURITY_SCORE } from "@/lib/data";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}{suffix}</span>;
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--danger)";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted-bg)" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
        style={{ transition: "stroke-dashoffset 1.5s ease", strokeLinecap: "round" }} />
    </svg>
  );
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const stats = [
    { label: "Security Score", value: 71, suffix: "%", icon: "🛡️", color: "var(--primary)", desc: "Overall posture" },
    { label: "Open Issues", value: 47, suffix: "", icon: "⚠️", color: "var(--warning)", desc: "Across all phases" },
    { label: "Critical Findings", value: 3, suffix: "", icon: "🔴", color: "var(--danger)", desc: "Need immediate fix" },
    { label: "Controls Passed", value: 84, suffix: "%", icon: "✅", color: "var(--success)", desc: "Of all controls" },
    { label: "Phases Reviewed", value: 6, suffix: "/6", icon: "🔄", color: "var(--secondary)", desc: "SDLC coverage" },
    { label: "KT Modules", value: 8, suffix: "", icon: "📚", color: "var(--accent)", desc: "Training available" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Hero */}
      <div className={`anim-fadeup ${mounted ? "" : "opacity-0"}`} style={{ marginBottom: "2rem" }}>
        <div style={{ background: "linear-gradient(135deg, var(--card) 0%, var(--muted-bg) 100%)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "2rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "var(--primary-glow)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -30, left: "30%", width: 150, height: 150, borderRadius: "50%", background: "rgba(139,92,246,0.15)", filter: "blur(50px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "2rem" }}>🛡️</span>
                <span className="badge badge-info">Live Dashboard</span>
              </div>
              <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, marginBottom: "0.5rem" }}>
                <span className="gradient-text">Security SDLC Guardian</span>
              </h1>
              <p style={{ color: "var(--muted)", maxWidth: 520, lineHeight: 1.6 }}>
                End-to-end security intelligence across every phase of your software development lifecycle —
                from architecture design to production monitoring.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: "1rem", flexWrap: "wrap" }}>
                <Link href="/phases" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem" }}>
                  🔄 Explore Phases
                </Link>
                <Link href="/checklist" className="btn-outline" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem" }}>
                  ✅ Run Checklist
                </Link>
                <Link href="/flows" className="btn-outline" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem" }}>
                  🔀 View Flows
                </Link>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <ScoreRing score={71} size={120} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--warning)", lineHeight: 1 }}>{mounted ? <AnimatedCounter target={71} suffix="%" /> : "71%"}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 2 }}>Score</div>
                </div>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>Security Posture</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-auto anim-fadeup delay-2" style={{ marginBottom: "2rem" }}>
        {stats.map((s, i) => (
          <div key={s.label} className="card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{s.desc}</span>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {mounted ? <AnimatedCounter target={s.value} suffix={s.suffix} /> : `${s.value}${s.suffix}`}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* SDLC Phase Pipeline */}
      <section style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>SDLC Security Pipeline</h2>
          <Link href="/phases" style={{ color: "var(--primary)", fontSize: "0.8rem", textDecoration: "none" }}>View all →</Link>
        </div>
        <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 8 }}>
          {SDLC_PHASES.map((phase, i) => (
            <Link key={phase.id} href={`/phases/${phase.id}`} style={{ textDecoration: "none", flex: "1 0 140px", minWidth: 140 }}>
              <div className={`card anim-fadeup delay-${i + 1}`} style={{ height: "100%", borderTop: `3px solid ${phase.color}`, cursor: "pointer" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{phase.icon}</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: 4 }}>{phase.title}</div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--muted)", marginBottom: 4 }}>
                    <span>Score</span><span style={{ color: phase.color, fontWeight: 700 }}>{phase.kpi.score}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${phase.kpi.score}%`, background: phase.color }} />
                  </div>
                </div>
                <span className={`badge badge-${phase.riskLevel === "critical" ? "critical" : phase.riskLevel === "high" ? "high" : "medium"}`} style={{ fontSize: "0.65rem" }}>
                  {phase.riskLevel}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "2rem" }}>
        {/* Issue Summary */}
        <div className="card">
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Open Issues by Severity</h3>
          {[
            { label: "Critical", count: OVERALL_SECURITY_SCORE.openIssues.critical, cls: "badge-critical", color: "var(--danger)", pct: 6 },
            { label: "High", count: OVERALL_SECURITY_SCORE.openIssues.high, cls: "badge-high", color: "var(--warning)", pct: 17 },
            { label: "Medium", count: OVERALL_SECURITY_SCORE.openIssues.medium, cls: "badge-medium", color: "#eab308", pct: 30 },
            { label: "Low", count: OVERALL_SECURITY_SCORE.openIssues.low, cls: "badge-low", color: "var(--success)", pct: 47 },
          ].map((item) => (
            <div key={item.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span className={`badge ${item.cls}`}>{item.label}</span>
                <span style={{ fontWeight: 700, color: item.color }}>{item.count}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Phase Scores */}
        <div className="card">
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Phase Security Scores</h3>
          {SDLC_PHASES.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: "1rem", width: 24 }}>{p.icon}</span>
              <span style={{ fontSize: "0.8rem", width: 100, flexShrink: 0 }}>{p.title}</span>
              <div style={{ flex: 1 }}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${p.kpi.score}%`, background: p.color }} />
                </div>
              </div>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: p.color, width: 36, textAlign: "right" }}>{p.kpi.score}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* OWASP Quick View */}
      <section style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>OWASP Top 10 — Quick Reference</h2>
          <Link href="/owasp" style={{ color: "var(--primary)", fontSize: "0.8rem", textDecoration: "none" }}>Full details →</Link>
        </div>
        <div className="grid-auto">
          {OWASP_TOP10.slice(0, 6).map((item) => (
            <div key={item.rank} className="card" style={{ borderLeft: `3px solid ${item.severity === "critical" ? "var(--danger)" : item.severity === "high" ? "var(--warning)" : "#eab308"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 800, fontSize: "0.75rem", color: "var(--primary)", minWidth: 32 }}>{item.rank}</span>
                <span className={`badge badge-${item.severity}`} style={{ fontSize: "0.65rem" }}>{item.severity}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
          {[
            { href: "/threats", icon: "⚡", title: "Threat Catalog", desc: "10 threats with real incidents, CVSS, payloads, mitigations", color: "var(--danger)" },
            { href: "/secure-coding", icon: "🔒", title: "Secure Coding", desc: "11 rules — vulnerable vs. secure code with real breaches", color: "var(--primary)" },
            { href: "/docs", icon: "📚", title: "KT Modules", desc: "8 training modules covering all security domains", color: "var(--secondary)" },
            { href: "/flows", icon: "🔀", title: "Security Flows", desc: "Visual flows for Auth, API keys, Incident Response", color: "var(--accent)" },
            { href: "/checklist", icon: "✅", title: "Checklist", desc: "Interactive checklist for every SDLC phase", color: "var(--success)" },
            { href: "/owasp", icon: "🎯", title: "OWASP Top 10", desc: "Critical web risks with attack examples & mitigations", color: "var(--warning)" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div className="card" style={{ borderTop: `3px solid ${item.color}`, textAlign: "center", padding: "1.25rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: 5 }}>{item.title}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}