"use client";
import { useState } from "react";
import { THREAT_CATALOG } from "@/lib/threats";

const CATEGORIES = ["All", ...Array.from(new Set(THREAT_CATALOG.map((t) => t.category)))];

const CVSS_COLOR = (score: number) =>
  score >= 9 ? "var(--danger)" : score >= 7 ? "var(--warning)" : score >= 4 ? "#eab308" : "var(--success)";

const PRIORITY_BADGE = (p: string) => {
  if (p === "critical") return "badge-critical";
  if (p === "high") return "badge-high";
  if (p === "medium") return "badge-medium";
  return "badge-low";
};

function ThreatCard({ threat }: { threat: typeof THREAT_CATALOG[0] }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"how" | "attacks" | "payloads" | "mitigations" | "detection">("how");
  const cvssColor = CVSS_COLOR(threat.cvss);

  return (
    <div className="card anim-fadeup" style={{ marginBottom: "0.75rem", borderLeft: `4px solid ${cvssColor}` }}>
      {/* Collapsed header */}
      <div onClick={() => setOpen((p) => !p)} style={{ cursor: "pointer", userSelect: "none" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          {/* CVSS Ring */}
          <div style={{ width: 56, height: 56, borderRadius: "50%", border: `3px solid ${cvssColor}`, background: `${cvssColor}15`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "0.95rem", fontWeight: 900, color: cvssColor, lineHeight: 1 }}>{threat.cvss}</span>
            <span style={{ fontSize: "0.55rem", color: cvssColor, opacity: 0.8 }}>CVSS</span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
              <span className={`badge badge-${threat.severity}`} style={{ fontSize: "0.65rem" }}>{threat.severity}</span>
              <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, background: "var(--muted-bg)", color: "var(--muted)", border: "1px solid var(--card-border)" }}>{threat.category}</span>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Vector: {threat.attackVector}</span>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                Likelihood: <span style={{ color: threat.likelihood === "high" ? "var(--danger)" : "var(--warning)", fontWeight: 600 }}>{threat.likelihood}</span>
              </span>
            </div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{threat.name}</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>{threat.description}</p>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {threat.tags.map((tag) => (
                <span key={tag} style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 6, background: "rgba(99,102,241,0.1)", color: "var(--secondary)", border: "1px solid rgba(99,102,241,0.2)" }}>{tag}</span>
              ))}
            </div>
          </div>

          <span style={{ color: "var(--muted)", fontSize: "1.1rem", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none", flexShrink: 0 }}>▾</span>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--card-border)", paddingTop: "1.25rem" }}>
          {/* Inner tabs */}
          <div style={{ display: "flex", gap: 2, marginBottom: "1.25rem", overflowX: "auto", paddingBottom: 2 }}>
            {(["how", "attacks", "payloads", "mitigations", "detection"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid", whiteSpace: "nowrap", borderColor: tab === t ? "var(--primary)" : "var(--card-border)", background: tab === t ? "var(--primary-glow)" : "transparent", color: tab === t ? "var(--primary)" : "var(--muted)", cursor: "pointer", fontWeight: tab === t ? 700 : 400, fontSize: "0.78rem", transition: "all 0.2s" }}>
                {t === "how" ? "⚙ How It Works" : t === "attacks" ? "🌍 Real Attacks" : t === "payloads" ? "💥 Payloads" : t === "mitigations" ? "🛡️ Mitigations" : "🔎 Detection"}
              </button>
            ))}
          </div>

          {/* Tab: How It Works */}
          {tab === "how" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {threat.howItWorks.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--primary-glow)", border: "1px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "var(--primary)", flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: "0.875rem", lineHeight: 1.6, paddingTop: 2 }}>{step}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Real Attacks */}
          {tab === "attacks" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {threat.realAttacks.map((attack, i) => (
                <div key={i} style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--danger)", background: "rgba(239,68,68,0.15)", padding: "2px 8px", borderRadius: 6 }}>{attack.year}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--danger)", fontWeight: 600 }}>💥 Damage: {attack.damage}</span>
                  </div>
                  <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--fg)" }}>{attack.incident}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Payloads */}
          {tab === "payloads" && (
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--warning)", marginBottom: "0.75rem", padding: "8px 12px", background: "rgba(245,158,11,0.08)", borderRadius: 8, border: "1px solid rgba(245,158,11,0.2)" }}>
                ⚠️ For educational and defensive purposes only. Understanding attack payloads is essential for building effective defenses.
              </p>
              <div className="code-block" style={{ padding: "1rem" }}>
                {threat.payloads.map((p, i) => (
                  <div key={i} style={{ padding: "5px 0", borderBottom: i < threat.payloads.length - 1 ? "1px solid var(--card-border)" : "none", fontSize: "0.8rem", lineHeight: 1.6 }}>
                    <span style={{ color: "var(--danger)" }}>$</span> {p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Mitigations */}
          {tab === "mitigations" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {threat.mitigations.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 8, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    <span className={`badge ${PRIORITY_BADGE(m.priority)}`} style={{ fontSize: "0.6rem" }}>{m.priority}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 500, lineHeight: 1.5 }}>{m.control}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 3 }}>Implementation effort: <strong>{m.effort}</strong></div>
                  </div>
                  <span style={{ color: "var(--success)", flexShrink: 0, fontSize: "1.1rem" }}>✓</span>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Detection */}
          {tab === "detection" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {threat.detectionSigns.map((sign, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 8, background: "var(--muted-bg)", border: "1px solid var(--card-border)" }}>
                    <span style={{ color: "var(--primary)", flexShrink: 0 }}>🔍</span>
                    <span style={{ fontSize: "0.82rem", lineHeight: 1.5 }}>{sign}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "1rem", padding: "12px 14px", borderRadius: 8, background: "var(--muted-bg)", border: "1px solid var(--card-border)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", marginBottom: 6 }}>Affected SDLC Phases</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {threat.affectedPhases.map((phase) => (
                    <span key={phase} className="badge badge-info" style={{ fontSize: "0.65rem", textTransform: "capitalize" }}>{phase}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ThreatCatalogPage() {
  const [category, setCategory] = useState("All");
  const [severity, setSeverity] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"cvss" | "name" | "likelihood">("cvss");

  const filtered = THREAT_CATALOG
    .filter((t) => {
      const catOk = category === "All" || t.category === category;
      const sevOk = severity === "All" || t.severity === severity;
      const q = search.toLowerCase();
      const searchOk = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q));
      return catOk && sevOk && searchOk;
    })
    .sort((a, b) => {
      if (sortBy === "cvss") return b.cvss - a.cvss;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return a.likelihood.localeCompare(b.likelihood);
    });

  const stats = {
    critical: THREAT_CATALOG.filter((t) => t.severity === "critical").length,
    avgCvss: (THREAT_CATALOG.reduce((sum, t) => sum + t.cvss, 0) / THREAT_CATALOG.length).toFixed(1),
    categories: new Set(THREAT_CATALOG.map((t) => t.category)).size,
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div className="anim-fadeup" style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          <span className="gradient-text">Threat Catalog</span>
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 640 }}>
          Comprehensive threat library with real-world attack incidents, actual exploitation payloads, CVSS scores, and prioritized mitigations. Expand any threat to explore.
        </p>
      </div>

      {/* Stats */}
      <div className="grid-3 anim-fadeup delay-1" style={{ marginBottom: "1.5rem" }}>
        <div className="card" style={{ textAlign: "center", borderTop: "3px solid var(--danger)" }}>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--danger)" }}>{stats.critical}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Critical Threats</div>
        </div>
        <div className="card" style={{ textAlign: "center", borderTop: "3px solid var(--warning)" }}>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--warning)" }}>{stats.avgCvss}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Average CVSS Score</div>
        </div>
        <div className="card" style={{ textAlign: "center", borderTop: "3px solid var(--primary)" }}>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--primary)" }}>{THREAT_CATALOG.length}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Threats Catalogued</div>
        </div>
      </div>

      {/* CVSS heat map */}
      <div className="card anim-fadeup delay-2" style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.75rem" }}>Threat CVSS Distribution</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {THREAT_CATALOG.sort((a, b) => b.cvss - a.cvss).map((t) => (
            <div key={t.id} title={`${t.name}: CVSS ${t.cvss}`}
              style={{ width: 48, height: 48, borderRadius: 8, background: `${CVSS_COLOR(t.cvss)}22`, border: `2px solid ${CVSS_COLOR(t.cvss)}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "default" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: CVSS_COLOR(t.cvss) }}>{t.cvss}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
          {[{ label: "Critical (9-10)", color: "var(--danger)" }, { label: "High (7-8.9)", color: "var(--warning)" }, { label: "Medium (4-6.9)", color: "#eab308" }].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "var(--muted)" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: "1rem", paddingBottom: 2 }}>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)}
            style={{ padding: "7px 16px", borderRadius: 99, border: "1px solid", whiteSpace: "nowrap", borderColor: category === cat ? "var(--primary)" : "var(--card-border)", background: category === cat ? "var(--primary-glow)" : "transparent", color: category === cat ? "var(--primary)" : "var(--muted)", cursor: "pointer", fontWeight: category === cat ? 700 : 400, fontSize: "0.82rem", transition: "all 0.2s" }}>
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search threats, incidents, CVEs…"
          style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 8, border: "1px solid var(--card-border)", background: "var(--card)", color: "var(--fg)", fontSize: "0.875rem", outline: "none" }} />
        <div style={{ display: "flex", gap: 6 }}>
          {["All", "critical", "high"].map((s) => (
            <button key={s} onClick={() => setSeverity(s)} className={severity === s ? "btn-primary" : "btn-outline"} style={{ fontSize: "0.8rem", textTransform: "capitalize", padding: "8px 14px" }}>{s}</button>
          ))}
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--card-border)", background: "var(--card)", color: "var(--fg)", fontSize: "0.82rem", cursor: "pointer" }}>
          <option value="cvss">Sort: CVSS ↓</option>
          <option value="name">Sort: Name A-Z</option>
          <option value="likelihood">Sort: Likelihood</option>
        </select>
      </div>

      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem" }}>
        {filtered.length} threats • Click any threat to expand full details, payloads, and mitigations
      </div>

      {filtered.map((threat) => <ThreatCard key={threat.id} threat={threat} />)}
    </div>
  );
}
