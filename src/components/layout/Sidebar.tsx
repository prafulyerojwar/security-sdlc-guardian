"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme";

const NAV = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/phases", label: "SDLC Phases", icon: "🔄", sub: [
    { href: "/phases/requirements", label: "Requirements" },
    { href: "/phases/design", label: "Architecture" },
    { href: "/phases/development", label: "Development" },
    { href: "/phases/testing", label: "Testing & QA" },
    { href: "/phases/deployment", label: "Deployment" },
    { href: "/phases/operations", label: "Operations" },
  ]},
  { href: "/threats", label: "Threat Catalog", icon: "⚡" },
  { href: "/secure-coding", label: "Secure Coding", icon: "🔒" },
  { href: "/checklist", label: "Security Checklist", icon: "✅" },
  { href: "/flows", label: "Security Flows", icon: "🔀" },
  { href: "/docs", label: "KT & Docs", icon: "📚" },
  { href: "/owasp", label: "OWASP Top 10", icon: "🎯" },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { theme, setTheme, themes } = useTheme();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      )}
      <aside
        style={{
          background: "var(--sidebar-bg)", color: "var(--sidebar-fg)", width: 240,
          minHeight: "100vh", position: "fixed", top: 0, left: 0, zIndex: 50,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease", display: "flex", flexDirection: "column",
          borderRight: "1px solid var(--card-border)", overflowY: "auto",
        }}
        className="md:translate-x-0"
      >
        <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid var(--card-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, var(--primary), var(--secondary))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--primary)" }}>SecureSDLC</div>
              <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>Guardian Platform</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "0.75rem 0.5rem" }}>
          {NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <div key={item.href}>
                <Link href={item.href} onClick={() => onClose()} className={`nav-item ${isActive ? "active" : ""}`} style={{ marginBottom: 2 }}>
                  <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
                {item.sub && isActive && (
                  <div style={{ marginLeft: 16, marginBottom: 4 }}>
                    {item.sub.map((s) => (
                      <Link key={s.href} href={s.href} onClick={onClose} className={`nav-item ${pathname === s.href ? "active" : ""}`} style={{ fontSize: "0.8rem", padding: "7px 12px" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div style={{ padding: "0.75rem 0.5rem", borderTop: "1px solid var(--card-border)" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.5, marginBottom: "0.5rem", padding: "0 0.5rem" }}>Theme</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "0 4px" }}>
            {themes.map((t) => (
              <button key={t.id} onClick={() => setTheme(t.id)} title={t.label}
                style={{ width: 32, height: 32, borderRadius: 8, border: "2px solid", borderColor: theme === t.id ? "var(--primary)" : "var(--card-border)", background: theme === t.id ? "var(--primary-glow)" : "transparent", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                {t.icon}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "0.75rem", margin: "0 0.5rem 0.75rem", borderRadius: 10, background: "var(--primary-glow)", border: "1px solid var(--card-border)" }}>
          <div style={{ fontSize: "0.7rem", opacity: 0.7, marginBottom: 4 }}>Overall Security Score</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>71%</div>
            <div style={{ flex: 1 }}><div className="progress-bar"><div className="progress-fill" style={{ width: "71%" }} /></div></div>
          </div>
        </div>
      </aside>
    </>
  );
}