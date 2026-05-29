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
  { href: "/case-studies", label: "Case Studies", icon: "📰" },
  { href: "/firewall", label: "Firewall Deep Dive", icon: "🔥" },
  { href: "/ai-security", label: "AI Security", icon: "🤖" },
  { href: "/architecture", label: "Architecture", icon: "🏛️" },
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
      {/* Styles injected — avoids inline-style vs Tailwind specificity conflict */}
      <style>{`
        .sdlc-sidebar {
          background: var(--sidebar-bg);
          color: var(--sidebar-fg);
          width: 240px;
          min-height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--card-border);
          overflow-y: auto;
          transition: transform 0.3s ease;
        }
        /* Mobile: hidden by default, shown when open */
        @media (max-width: 767px) {
          .sdlc-sidebar { transform: translateX(-100%); }
          .sdlc-sidebar.open { transform: translateX(0); }
        }
        /* Desktop: always visible */
        @media (min-width: 768px) {
          .sdlc-sidebar { transform: translateX(0) !important; }
          .sdlc-main { margin-left: 240px; }
        }
        .sdlc-overlay {
          display: none;
        }
        @media (max-width: 767px) {
          .sdlc-overlay.open {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 40;
          }
        }
      `}</style>

      <div className={`sdlc-overlay ${isOpen ? "open" : ""}`} onClick={onClose} />

      <aside className={`sdlc-sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo */}
        <div style={{ height: 60, padding: "0 1rem", borderBottom: "1px solid var(--card-border)", flexShrink: 0, display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, var(--primary), var(--secondary))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--primary)" }}>SecureSDLC</div>
              <div style={{ fontSize: "0.68rem", opacity: 0.6 }}>Guardian Platform</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "0.5rem 0.4rem" }}>
          {NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => onClose()}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  style={{ marginBottom: 1, fontSize: "0.83rem", padding: "8px 12px" }}
                >
                  <span style={{ fontSize: "0.95rem", width: 20, flexShrink: 0 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
                {(item as any).sub && isActive && (
                  <div style={{ marginLeft: 14, marginBottom: 2 }}>
                    {(item as any).sub.map((s: { href: string; label: string }) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        onClick={onClose}
                        className={`nav-item ${pathname === s.href ? "active" : ""}`}
                        style={{ fontSize: "0.76rem", padding: "6px 10px" }}
                      >
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Theme switcher */}
        <div style={{ padding: "0.6rem 0.5rem", borderTop: "1px solid var(--card-border)", flexShrink: 0 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.5, marginBottom: "0.4rem", padding: "0 4px" }}>Theme</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "0 2px" }}>
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.label}
                style={{ width: 30, height: 30, borderRadius: 7, border: "2px solid", borderColor: theme === t.id ? "var(--primary)" : "var(--card-border)", background: theme === t.id ? "var(--primary-glow)" : "transparent", cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
              >
                {t.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Security Score */}
        <div style={{ padding: "0.6rem", margin: "0 0.4rem 0.6rem", borderRadius: 8, background: "var(--primary-glow)", border: "1px solid var(--card-border)", flexShrink: 0 }}>
          <div style={{ fontSize: "0.68rem", opacity: 0.7, marginBottom: 3 }}>Overall Security Score</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary)" }}>71%</div>
            <div style={{ flex: 1 }}>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "71%" }} />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
