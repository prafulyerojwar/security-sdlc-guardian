"use client";
import { useState } from "react";
import { OWASP_TOP10 } from "@/lib/data";

const MITIGATIONS: Record<string, string[]> = {
  A01: ["Implement RBAC/ABAC with deny-by-default", "Enforce server-side authorization on every request", "Log access control failures and alert on threshold", "Disable directory listing, web server admin interfaces"],
  A02: ["Use bcrypt/Argon2 for passwords (not MD5/SHA1)", "Encrypt sensitive data at rest with AES-256-GCM", "Enforce TLS 1.3 — disable older versions", "Implement proper key management with rotation"],
  A03: ["Use parameterized queries / prepared statements", "Validate and sanitize all user inputs server-side", "Use an ORM to abstract DB layer", "Apply positive allow-list input validation"],
  A04: ["Implement threat modeling in design phase", "Add security acceptance criteria to user stories", "Conduct security design reviews before implementation", "Use secure design patterns (zero trust, defense-in-depth)"],
  A05: ["Harden server configs — remove defaults, samples", "Implement a repeatable hardening process", "Review cloud permissions and S3 bucket policies", "Deploy with least-privilege service accounts"],
  A06: ["Monitor NVD/Snyk for new CVEs daily", "Use SCA tools (Snyk, Dependabot, OWASP Dependency-Check)", "Remove unused dependencies", "Pin dependency versions and hash verify downloads"],
  A07: ["Implement MFA for all user accounts", "Rate-limit login endpoints (5/min per IP)", "Implement account lockout after 10 failed attempts", "Use short-lived session tokens with secure storage"],
  A08: ["Verify digital signatures on serialized data", "Use allowlists for deserialization classes", "Sign CI/CD artifacts and verify in pipeline", "Monitor integrity of critical files"],
  A09: ["Log all authentication events with timestamps", "Set up SIEM with alerting rules", "Log failed access attempts and correlate", "Retain logs for 90 days minimum"],
  A10: ["Validate and sanitize URL inputs", "Use allowlist for permitted URL schemes and domains", "Block access to metadata endpoints (169.254.x.x)", "Enforce network segmentation to limit SSRF impact"],
};

export default function OWASPPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? OWASP_TOP10 : OWASP_TOP10.filter((i) => i.severity === filter);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          <span className="gradient-text">OWASP Top 10</span>
        </h1>
        <p style={{ color: "var(--muted)" }}>
          The 10 most critical security risks for web applications. Click any item for details, examples, and mitigations.
        </p>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {["all", "critical", "high", "medium"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={filter === f ? "btn-primary" : "btn-outline"}
            style={{ fontSize: "0.8rem", textTransform: "capitalize" }}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Risk distribution bar */}
      <div className="card anim-fadeup" style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 10 }}>Risk Distribution</div>
        <div style={{ display: "flex", height: 32, borderRadius: 8, overflow: "hidden", gap: 2 }}>
          <div style={{ flex: 3, background: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", color: "#fff", fontWeight: 700 }}>3 Critical</div>
          <div style={{ flex: 4, background: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", color: "#fff", fontWeight: 700 }}>4 High</div>
          <div style={{ flex: 3, background: "#eab308", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", color: "#fff", fontWeight: 700 }}>3 Medium</div>
        </div>
      </div>

      {/* OWASP Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((item, i) => {
          const isExpanded = expanded === item.rank;
          const mitigations = MITIGATIONS[item.rank] || [];
          const borderColor = item.severity === "critical" ? "var(--danger)" : item.severity === "high" ? "var(--warning)" : "#eab308";

          return (
            <div key={item.rank} className={`card anim-fadeup delay-${i % 5 + 1}`} style={{ borderLeft: `4px solid ${borderColor}`, cursor: "pointer" }}
              onClick={() => setExpanded(isExpanded ? null : item.rank)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontWeight: 900, fontSize: "1rem", color: borderColor, minWidth: 44 }}>{item.rank}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{item.title}</span>
                    <span className={`badge badge-${item.severity}`} style={{ fontSize: "0.65rem" }}>{item.severity}</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{item.desc}</div>
                </div>
                <span style={{ color: "var(--muted)", fontSize: "1rem", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>▾</span>
              </div>

              {isExpanded && (
                <div onClick={(e) => e.stopPropagation()} style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--card-border)" }}>
                  <div className="grid-2" style={{ gap: "1rem" }}>
                    <div>
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--danger)", marginBottom: 8 }}>⚡ Attack Example</div>
                      <div className="code-block" style={{ padding: "10px 14px", fontSize: "0.8rem", color: "var(--danger)" }}>{item.example}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--success)", marginBottom: 8 }}>🛡️ Mitigations</div>
                      {mitigations.map((m) => (
                        <div key={m} style={{ fontSize: "0.8rem", color: "var(--muted)", padding: "4px 0", display: "flex", gap: 6 }}>
                          <span style={{ color: "var(--success)", flexShrink: 0 }}>✓</span>{m}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
