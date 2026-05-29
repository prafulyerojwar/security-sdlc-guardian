"use client";
import { useState } from "react";
import { KT_MODULES, SECURITY_DOMAINS } from "@/lib/data";

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "var(--success)",
  Intermediate: "var(--warning)",
  Advanced: "var(--danger)",
};

export default function DocsPage() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"kt" | "domains" | "references">("kt");

  const module = KT_MODULES.find((m) => m.id === activeModule);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          <span className="gradient-text">Security KT & Documentation</span>
        </h1>
        <p style={{ color: "var(--muted)" }}>Knowledge transfer modules, security references, and domain-specific documentation.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem", borderBottom: "1px solid var(--card-border)", paddingBottom: 0 }}>
        {(["kt", "domains", "references"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: activeTab === tab ? 700 : 400, color: activeTab === tab ? "var(--primary)" : "var(--muted)", borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent", transition: "all 0.2s", marginBottom: -1 }}>
            {tab === "kt" ? "📚 KT Modules" : tab === "domains" ? "🔐 Security Domains" : "📖 References"}
          </button>
        ))}
      </div>

      {activeTab === "kt" && (
        <div style={{ display: "grid", gridTemplateColumns: activeModule ? "1fr 1fr" : "1fr", gap: "1.25rem" }}>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: activeModule ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {KT_MODULES.map((mod) => (
                <div key={mod.id} className="card" onClick={() => setActiveModule(activeModule === mod.id ? null : mod.id)}
                  style={{ cursor: "pointer", borderLeft: `3px solid ${LEVEL_COLORS[mod.level]}`, background: activeModule === mod.id ? "var(--primary-glow)" : "var(--card)", borderColor: activeModule === mod.id ? "var(--primary)" : "var(--card-border)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ fontSize: "1.75rem" }}>{mod.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, background: LEVEL_COLORS[mod.level] + "22", color: LEVEL_COLORS[mod.level], fontWeight: 600 }}>{mod.level}</span>
                        <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, background: "var(--muted-bg)", color: "var(--muted)" }}>{mod.category}</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>⏱ {mod.duration}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>{mod.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>{mod.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {module && (
            <div className="card anim-slideleft" style={{ position: "sticky", top: 80, height: "fit-content" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <span style={{ fontSize: "1.75rem" }}>{module.icon}</span>
                <button onClick={() => setActiveModule(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "1.25rem" }}>✕</button>
              </div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>{module.title}</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1rem", lineHeight: 1.6 }}>{module.description}</p>
              <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: 8, background: LEVEL_COLORS[module.level] + "22", color: LEVEL_COLORS[module.level], fontWeight: 600 }}>{module.level}</span>
                <span className="badge badge-info">{module.category}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>⏱ {module.duration}</span>
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: 8 }}>Topics Covered</div>
                {module.topics.map((t) => (
                  <div key={t} style={{ fontSize: "0.82rem", color: "var(--muted)", padding: "6px 0", borderBottom: "1px solid var(--card-border)", display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--primary)" }}>▸</span>{t}
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{ width: "100%", fontSize: "0.875rem" }}>Start Module →</button>
            </div>
          )}
        </div>
      )}

      {activeTab === "domains" && (
        <div className="grid-2">
          {SECURITY_DOMAINS.map((domain) => (
            <div key={domain.id} className="card" style={{ borderTop: `3px solid ${domain.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "1.5rem" }}>{domain.icon}</span>
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700 }}>{domain.title}</h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{domain.description}</p>
                </div>
              </div>
              <div className="section-divider" style={{ margin: "0.75rem 0" }} />
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--danger)", marginBottom: 6 }}>Known Risks</div>
                {domain.risks.map((r) => (
                  <div key={r} style={{ fontSize: "0.78rem", color: "var(--muted)", padding: "3px 0", display: "flex", gap: 6 }}>
                    <span style={{ color: "var(--danger)" }}>⚡</span>{r}
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--success)", marginBottom: 6 }}>Controls</div>
                {domain.controls.map((c) => (
                  <div key={c} style={{ fontSize: "0.78rem", color: "var(--muted)", padding: "3px 0", display: "flex", gap: 6 }}>
                    <span style={{ color: "var(--success)" }}>✓</span>{c}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: 6 }}>Code Example</div>
                <pre className="code-block" style={{ fontSize: "0.72rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{domain.codeExample}</pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "references" && (
        <div className="grid-2">
          {[
            { title: "OWASP Top 10", desc: "The most critical web application security risks", url: "#", icon: "🎯", tags: ["Web", "Critical"] },
            { title: "NIST Cybersecurity Framework", desc: "Framework for improving critical infrastructure cybersecurity", url: "#", icon: "📐", tags: ["Framework", "Compliance"] },
            { title: "CWE/SANS Top 25", desc: "Most dangerous software weaknesses", url: "#", icon: "🔍", tags: ["Development", "Bugs"] },
            { title: "OWASP ASVS", desc: "Application Security Verification Standard", url: "#", icon: "✅", tags: ["Testing", "Verification"] },
            { title: "MITRE ATT&CK", desc: "Adversarial tactics, techniques & common knowledge", url: "#", icon: "⚔️", tags: ["Threat Intel", "Red Team"] },
            { title: "Cloud Security Alliance", desc: "Cloud controls matrix and best practices", url: "#", icon: "☁️", tags: ["Cloud", "Compliance"] },
            { title: "PCI DSS v4.0", desc: "Payment card industry data security standard", url: "#", icon: "💳", tags: ["Compliance", "Payments"] },
            { title: "ISO 27001/27002", desc: "Information security management standards", url: "#", icon: "📜", tags: ["ISO", "Compliance"] },
          ].map((ref) => (
            <div key={ref.title} className="card" style={{ display: "flex", gap: 12 }}>
              <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{ref.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>{ref.title}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 8, lineHeight: 1.5 }}>{ref.desc}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {ref.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 6, background: "var(--muted-bg)", color: "var(--muted)", border: "1px solid var(--card-border)" }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
