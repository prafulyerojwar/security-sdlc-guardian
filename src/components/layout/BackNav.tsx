"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/phases": "SDLC Phases",
  "/phases/requirements": "Requirements",
  "/phases/design": "Architecture & Design",
  "/phases/development": "Development",
  "/phases/testing": "Testing & QA",
  "/phases/deployment": "Deployment & CI/CD",
  "/phases/operations": "Operations & Monitoring",
  "/threats": "Threat Catalog",
  "/secure-coding": "Secure Coding Standards",
  "/checklist": "Security Checklist",
  "/flows": "Security Flows",
  "/docs": "KT & Docs",
  "/owasp": "OWASP Top 10",
  "/case-studies": "Case Studies",
  "/firewall": "Firewall Deep Dive",
  "/ai-security": "AI Security",
  "/architecture": "Architecture Diagram",
};

function buildCrumbs(pathname: string) {
  const crumbs: { href: string; label: string }[] = [{ href: "/", label: "Dashboard" }];
  const parts = pathname.split("/").filter(Boolean);
  let current = "";
  for (const part of parts) {
    current += "/" + part;
    const label = ROUTE_LABELS[current] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
    crumbs.push({ href: current, label });
  }
  return crumbs;
}

export default function BackNav() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  const crumbs = buildCrumbs(pathname);
  const canGoBack = crumbs.length > 1;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 0", marginBottom: "0.75rem",
      borderBottom: "1px solid var(--card-border)",
      flexWrap: "wrap",
    }}>
      {canGoBack && (
        <button
          onClick={() => router.back()}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "var(--muted-bg)", border: "1px solid var(--card-border)",
            borderRadius: 7, padding: "5px 12px", cursor: "pointer",
            color: "var(--primary)", fontSize: "0.8rem", fontWeight: 600,
            transition: "all 0.2s", flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--primary-glow)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--muted-bg)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--card-border)";
          }}
        >
          ← Back
        </button>
      )}

      <nav style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {i > 0 && <span style={{ color: "var(--muted)", opacity: 0.4, fontSize: "0.75rem" }}>/</span>}
            {i === crumbs.length - 1 ? (
              <span style={{ fontSize: "0.8rem", color: "var(--fg)", fontWeight: 600 }}>{crumb.label}</span>
            ) : (
              <Link href={crumb.href} style={{ fontSize: "0.8rem", color: "var(--primary)", textDecoration: "none", opacity: 0.8 }}>
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
}
