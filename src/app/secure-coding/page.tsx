"use client";
import { useState, useEffect } from "react";
import { SECURE_CODING_RULES } from "@/lib/secure-coding";

const CATEGORIES = ["All", ...Array.from(new Set(SECURE_CODING_RULES.map((r) => r.category)))];
const SEVERITIES = ["All", "critical", "high", "medium"];

function CodeBlock({ code, label, variant }: { code: string; label: string; variant: "bad" | "good" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", borderRadius: "8px 8px 0 0", background: variant === "bad" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", borderBottom: "1px solid var(--card-border)" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: variant === "bad" ? "var(--danger)" : "var(--success)" }}>{label}</span>
        <button onClick={copy} style={{ background: "none", border: "1px solid var(--card-border)", borderRadius: 5, padding: "2px 8px", cursor: "pointer", fontSize: "0.7rem", color: "var(--muted)" }}>{copied ? "✓ Copied" : "Copy"}</button>
      </div>
      <pre style={{ margin: 0, padding: "1rem", background: "var(--muted-bg)", borderRadius: "0 0 8px 8px", fontSize: "0.78rem", lineHeight: 1.65, overflowX: "auto", color: "var(--fg)", fontFamily: "'Fira Code', 'Cascadia Code', monospace", whiteSpace: "pre", border: "1px solid var(--card-border)", borderTop: "none" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function RuleCard({ rule, defaultOpen = false }: { rule: typeof SECURE_CODING_RULES[0]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const sevColor = rule.severity === "critical" ? "var(--danger)" : rule.severity === "high" ? "var(--warning)" : "#eab308";

  return (
    <div className="card anim-fadeup" style={{ borderLeft: `4px solid ${sevColor}`, marginBottom: "0.75rem" }}>
      {/* Header */}
      <div onClick={() => setOpen((p) => !p)} style={{ cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12, userSelect: "none" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span className={`badge badge-${rule.severity}`} style={{ fontSize: "0.65rem" }}>{rule.severity}</span>
            <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, background: "var(--muted-bg)", color: "var(--muted)", border: "1px solid var(--card-border)" }}>{rule.category}</span>
            <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{rule.cwe}</span>
            {rule.cvss && <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, background: rule.cvss >= 9 ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", color: rule.cvss >= 9 ? "var(--danger)" : "var(--warning)", border: "1px solid currentColor", opacity: 0.8 }}>CVSS {rule.cvss}</span>}
          </div>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.4 }}>{rule.title}</h3>
        </div>
        <span style={{ color: "var(--muted)", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none", flexShrink: 0, paddingTop: 4 }}>▾</span>
      </div>

      {open && (
        <div style={{ marginTop: "1rem" }}>
          {/* Description */}
          <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.7, marginBottom: "1rem" }}>{rule.description}</p>

          {/* Real-world example */}
          <div style={{ marginBottom: "1.25rem", padding: "12px 16px", borderRadius: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--warning)", marginBottom: 6, display: "flex", gap: 6, alignItems: "center" }}>
              🌍 Real-World Incident
            </div>
            <p style={{ fontSize: "0.82rem", lineHeight: 1.65, color: "var(--fg)" }}>{rule.realWorldExample}</p>
          </div>

          {/* Code comparison */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            <CodeBlock code={rule.badCode} label="❌ VULNERABLE CODE" variant="bad" />
            <CodeBlock code={rule.goodCode} label="✅ SECURE CODE" variant="good" />
          </div>

          {/* Tools + References */}
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, marginBottom: 6, color: "var(--primary)" }}>🔧 Detection Tools</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {rule.tools.map((t) => (
                  <span key={t} style={{ fontSize: "0.7rem", padding: "3px 9px", borderRadius: 6, background: "var(--muted-bg)", color: "var(--muted)", border: "1px solid var(--card-border)" }}>{t}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, marginBottom: 6, color: "var(--secondary)" }}>📖 References</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {rule.references.map((r) => (
                  <span key={r} style={{ fontSize: "0.7rem", padding: "3px 9px", borderRadius: 6, background: "rgba(139,92,246,0.1)", color: "var(--secondary)", border: "1px solid rgba(139,92,246,0.2)" }}>{r}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SecureCodingPage() {
  const [category, setCategory] = useState("All");
  const [severity, setSeverity] = useState("All");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const filtered = SECURE_CODING_RULES.filter((r) => {
    const catOk = category === "All" || r.category === category;
    const sevOk = severity === "All" || r.severity === severity;
    const q = search.toLowerCase();
    const searchOk = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
    return catOk && sevOk && searchOk;
  });

  const stats = {
    critical: SECURE_CODING_RULES.filter((r) => r.severity === "critical").length,
    high: SECURE_CODING_RULES.filter((r) => r.severity === "high").length,
    total: SECURE_CODING_RULES.length,
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div className={`anim-fadeup ${mounted ? "" : "opacity-0"}`} style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              <span className="gradient-text">Secure Coding Standards</span>
            </h1>
            <p style={{ color: "var(--muted)", maxWidth: 600 }}>
              Real-world security rules with vulnerable vs. secure code examples, actual breach incidents, CVSS scores, and detection tooling. Click any rule to expand.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div className="card" style={{ textAlign: "center", padding: "0.75rem 1.25rem" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--danger)" }}>{stats.critical}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Critical</div>
            </div>
            <div className="card" style={{ textAlign: "center", padding: "0.75rem 1.25rem" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--warning)" }}>{stats.high}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>High</div>
            </div>
            <div className="card" style={{ textAlign: "center", padding: "0.75rem 1.25rem" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>{stats.total}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Total Rules</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: "1rem", paddingBottom: 4 }}>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)}
            style={{ padding: "7px 16px", borderRadius: 99, border: "1px solid", whiteSpace: "nowrap", borderColor: category === cat ? "var(--primary)" : "var(--card-border)", background: category === cat ? "var(--primary-glow)" : "transparent", color: category === cat ? "var(--primary)" : "var(--muted)", cursor: "pointer", fontWeight: category === cat ? 700 : 400, fontSize: "0.82rem", transition: "all 0.2s" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Severity + Search bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search rules, categories, vulnerabilities…"
          style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 8, border: "1px solid var(--card-border)", background: "var(--card)", color: "var(--fg)", fontSize: "0.875rem", outline: "none" }} />
        <div style={{ display: "flex", gap: 6 }}>
          {SEVERITIES.map((s) => (
            <button key={s} onClick={() => setSeverity(s)}
              className={severity === s ? "btn-primary" : "btn-outline"}
              style={{ fontSize: "0.8rem", textTransform: "capitalize", padding: "8px 14px" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem" }}>
        Showing {filtered.length} of {SECURE_CODING_RULES.length} rules
        {search && <span> matching "<strong>{search}</strong>"</span>}
      </div>

      {/* Rules list */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔍</div>
          <div style={{ color: "var(--muted)" }}>No rules match your filters. Try adjusting the search or category.</div>
        </div>
      ) : (
        filtered.map((rule, i) => <RuleCard key={rule.id} rule={rule} defaultOpen={i === 0 && !search} />)
      )}

      {/* Bottom summary */}
      <div className="card anim-fadeup" style={{ marginTop: "2rem", background: "linear-gradient(135deg, var(--card), var(--muted-bg))" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>📊 Coverage Summary by Category</h2>
        <div className="grid-3">
          {CATEGORIES.slice(1).map((cat) => {
            const catRules = SECURE_CODING_RULES.filter((r) => r.category === cat);
            const critCount = catRules.filter((r) => r.severity === "critical").length;
            return (
              <div key={cat} style={{ padding: "0.75rem", borderRadius: 8, background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 4 }}>{cat}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{catRules.length} rules</span>
                  {critCount > 0 && <span className="badge badge-critical" style={{ fontSize: "0.65rem" }}>{critCount} critical</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
