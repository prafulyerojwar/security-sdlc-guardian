"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Types ──────────────────────────────────────────────────────── */
interface Packet {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  color: string;
  fromLayer: number;
  toLayer: number;
  blocked: boolean;
}

interface TooltipInfo {
  id: number;
  x: number;
  y: number;
}

interface RequestStep {
  id: number;
  component: string;
  icon: string;
  check: string;
  result: "PASS" | "FAIL" | "PENDING";
  time: string;
  detail: string;
  color: string;
}

interface ThreatScenario {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  path: number[];
  blockedAt: number;
  blockReason: string;
  attackType: string;
}

/* ─── Data ──────────────────────────────────────────────────────── */
const SECURITY_BADGES = [
  {
    id: 1,
    layer: 1,
    label: "DDoS Protection",
    icon: "🛡️",
    color: "var(--accent)",
    shortDesc: "Rate Limiting + Anycast",
    detail: "Cloudflare absorbs volumetric attacks via anycast routing across 300+ PoPs. Rate limiting: 10k req/s per IP. BGP blackholing for >100Gbps attacks. Magic Transit for L3/L4 DDoS. Challenge pages for suspicious IPs.",
  },
  {
    id: 2,
    layer: 2,
    label: "WAF",
    icon: "🔥",
    color: "var(--warning)",
    shortDesc: "OWASP Ruleset Active",
    detail: "OWASP Core Rule Set 3.3 blocks SQLi, XSS, LFI, RFI, RCE. ModSecurity engine. Custom rules for business logic. Geo-blocking high-risk regions. Bot management with JS challenges. Managed rules updated hourly.",
  },
  {
    id: 3,
    layer: 3,
    label: "TLS 1.3",
    icon: "🔐",
    color: "var(--success)",
    shortDesc: "TLS 1.3 + HSTS",
    detail: "TLS 1.3 only — TLS 1.0/1.1 disabled. ECDHE key exchange for perfect forward secrecy. AEAD cipher suites (AES-256-GCM, ChaCha20). Certificate pinning on mobile. HSTS with 1yr max-age + preload. OCSP stapling enabled.",
  },
  {
    id: 4,
    layer: 4,
    label: "Auth Gateway",
    icon: "🗝️",
    color: "var(--primary)",
    shortDesc: "JWT + OAuth2 Validation",
    detail: "Kong/Nginx API Gateway validates JWT (RS256, 15min expiry). OAuth2 PKCE flow for SPAs. API key hashing (PBKDF2). Mutual TLS for service accounts. Token revocation via Redis blacklist. Scope-based RBAC.",
  },
  {
    id: 5,
    layer: 4,
    label: "Rate Limiting",
    icon: "⏱️",
    color: "var(--secondary)",
    shortDesc: "Per-User/IP Quotas",
    detail: "Token bucket algorithm: 100 req/min per user, 1000/min per API key. Sliding window counter in Redis. Separate limits per endpoint (login: 5/min). HTTP 429 with Retry-After header. Distributed rate limiting across pods.",
  },
  {
    id: 6,
    layer: 5,
    label: "Service mTLS",
    icon: "🔗",
    color: "var(--accent)",
    shortDesc: "Mutual TLS between Services",
    detail: "Istio service mesh enforces mTLS for ALL east-west traffic. SPIFFE/SPIRE workload identity. Certificates rotated every 24h. Zero-trust network: no implicit trust between pods. Network policies restrict ingress/egress per namespace.",
  },
  {
    id: 7,
    layer: 6,
    label: "Encrypted Cache",
    icon: "💾",
    color: "var(--warning)",
    shortDesc: "Redis AUTH + TLS",
    detail: "Redis 7.x with AUTH password (PBKDF2, 256-bit). TLS 1.3 in transit. AES-256-CBC for sensitive values at rest. TTL enforced on all session keys (15min). keyspace notifications for anomaly detection. Redis ACL per service.",
  },
  {
    id: 8,
    layer: 7,
    label: "Encrypted DB",
    icon: "🗄️",
    color: "var(--success)",
    shortDesc: "AES-256 at Rest",
    detail: "PostgreSQL with pgcrypto: AES-256-GCM for PII columns. TDE (Transparent Data Encryption) at disk level. TLS 1.3 in transit with mutual cert auth. Row-level security (RLS) policies. Parameterized queries only. WAL encryption.",
  },
  {
    id: 9,
    layer: 7,
    label: "Vault Secrets",
    icon: "🏛️",
    color: "var(--secondary)",
    shortDesc: "Dynamic Credentials",
    detail: "HashiCorp Vault issues dynamic DB credentials (5min TTL). AppRole auth for services. Shamir secret sharing for master key. Audit log of all secret accesses. PKI secrets engine for cert issuance. Encryption as a Service (transit engine).",
  },
  {
    id: 10,
    layer: 8,
    label: "Audit Logging",
    icon: "📋",
    color: "var(--danger)",
    shortDesc: "All Events → SIEM",
    detail: "Every request logged: user ID, IP, endpoint, params, response code, latency. Splunk/ELK SIEM ingests 50M events/day. Real-time alerting on anomalies (ML-based). SOC-2 compliant 7yr retention. Tamper-proof append-only log (WORM). PagerDuty integration.",
  },
];

const REQUEST_STEPS: RequestStep[] = [
  { id: 1, component: "User Browser", icon: "🌐", check: "HTTPS enforced, HSTS header", result: "PASS", time: "0ms", detail: "Browser enforces TLS 1.3. HSTS header prevents downgrade. Certificate validated against CT logs.", color: "var(--fg)" },
  { id: 2, component: "Cloudflare CDN", icon: "☁️", check: "DDoS score < threshold, geolocation allow", result: "PASS", time: "12ms", detail: "Request scored 0.3 (low threat). Geo: US — allowed. Cache MISS — forwarding to origin. Bot score: 95 (human).", color: "var(--accent)" },
  { id: 3, component: "WAF Rule Engine", icon: "🔥", check: "OWASP CRS scan — no matches found", result: "PASS", time: "18ms", detail: "Scanned 203 OWASP rules. No SQL injection patterns. No XSS payloads. No path traversal. Paranoia level 2. Rules version: 3.3.4.", color: "var(--warning)" },
  { id: 4, component: "Load Balancer", icon: "⚖️", check: "TLS termination, health check upstream", result: "PASS", time: "22ms", detail: "TLS terminated. Cert: *.example.com (Let's Encrypt). Upstream pod health: 3/3 healthy. Round-robin selection: pod-2.", color: "var(--primary)" },
  { id: 5, component: "API Gateway", icon: "🗝️", check: "JWT validation — RS256, exp check", result: "PASS", time: "35ms", detail: "JWT decoded. Issuer: auth.example.com. Sub: user-4891. Exp: valid (8min remaining). Scopes: read:orders write:orders. Rate limit: 43/100 used.", color: "var(--primary)" },
  { id: 6, component: "Rate Limiter", icon: "⏱️", check: "Token bucket — within quota", result: "PASS", time: "38ms", detail: "User quota: 43 of 100 req/min used. Endpoint /api/orders: 2 of 10 req/min. Sliding window (60s). No 429 triggered.", color: "var(--secondary)" },
  { id: 7, component: "Order Service", icon: "📦", check: "Input validation, auth context", result: "PASS", time: "55ms", detail: "Request body validated against JSON schema. Order ID format: UUID v4. User context injected from JWT. Service-to-service call to Payment Service via mTLS.", color: "var(--fg)" },
  { id: 8, component: "Database Query", icon: "🗄️", check: "Parameterized query, RLS policy", result: "PASS", time: "72ms", detail: "Prepared statement: SELECT * FROM orders WHERE user_id = $1 AND id = $2. RLS: user_id matches session. No full table scan. Query plan: index scan on (user_id, id). 3 rows returned.", color: "var(--success)" },
  { id: 9, component: "Response Sanitizer", icon: "🧹", check: "PII masking, CSP headers added", result: "PASS", time: "76ms", detail: "Card numbers masked: xxxx-xxxx-xxxx-4891. Email partially redacted in logs. CSP: default-src 'self'. X-Content-Type-Options: nosniff. X-Frame-Options: DENY.", color: "var(--fg)" },
  { id: 10, component: "Audit Logger", icon: "📋", check: "Event written to SIEM, audit trail complete", result: "PASS", time: "78ms", detail: "Event ID: evt-8f3a2c. User 4891 accessed orders 1234,1235,1236. Latency: 78ms. Status: 200. Written to Splunk index security_audit. Retention: 7 years.", color: "var(--danger)" },
];

const THREAT_SCENARIOS: ThreatScenario[] = [
  {
    id: "sqli",
    name: "SQL Injection",
    icon: "💉",
    color: "var(--danger)",
    description: "Attacker injects malicious SQL payload: ' OR '1'='1 into search param",
    path: [0, 1, 2],
    blockedAt: 2,
    blockReason: "WAF CRS rule 942100 matched SQL injection pattern. Request blocked with HTTP 403. Event logged to SIEM. Attacker IP flagged for 1hr ban.",
    attackType: "BLOCKED AT WAF",
  },
  {
    id: "jwt",
    name: "Stolen JWT",
    icon: "🎭",
    color: "var(--warning)",
    description: "Attacker replays a stolen JWT token from an old session",
    path: [0, 1, 2, 3, 4],
    blockedAt: 4,
    blockReason: "JWT exp claim: 2024-01-15T10:23:00Z (expired 42min ago). Token not in Redis session store. HTTP 401 returned. Refresh token already revoked.",
    attackType: "BLOCKED AT AUTH GATEWAY",
  },
  {
    id: "ddos",
    name: "DDoS Attack",
    icon: "🌊",
    color: "var(--accent)",
    description: "Botnet sends 500,000 req/sec volumetric attack from 10,000 IPs",
    path: [0, 1],
    blockedAt: 1,
    blockReason: "Cloudflare Magic Transit absorbs 847Gbps attack. Anycast routing distributes load across 300 PoPs. BGP blackholing activated. Under Attack mode enabled. Origin never reached.",
    attackType: "ABSORBED BY CDN/DDOS PROTECTION",
  },
  {
    id: "insider",
    name: "Insider DB Access",
    icon: "👤",
    color: "var(--secondary)",
    description: "Rogue employee with valid credentials queries full user table",
    path: [0, 1, 2, 3, 4, 5, 6, 7],
    blockedAt: 7,
    blockReason: "RLS policy denied: user_id mismatch for 98% of rows. Query SELECT * FROM users returned 0 rows (blocked by policy). SIEM alert: anomalous bulk query pattern. SOC notified. Vault credential rotation triggered.",
    attackType: "BLOCKED BY DB RLS + SIEM ALERT",
  },
];

/* ─── Layer definitions for architecture diagram ──────────────── */
const ARCH_LAYERS = [
  { id: 0, label: "Internet / Users / Attackers", icon: "🌐", color: "#6b7280", height: 56, desc: "Public internet traffic — legitimate users, bots, and attackers" },
  { id: 1, label: "CDN + DDoS Protection (Cloudflare)", icon: "☁️", color: "var(--accent)", height: 56, desc: "Anycast CDN absorbs DDoS, serves cached content, TLS offload" },
  { id: 2, label: "WAF — Web Application Firewall", icon: "🔥", color: "var(--warning)", height: 56, desc: "OWASP CRS rules block SQLi, XSS, LFI, RFI, RCE attacks" },
  { id: 3, label: "Load Balancer (TLS Termination)", icon: "⚖️", color: "var(--primary)", height: 56, desc: "Terminates TLS, health-checks upstreams, round-robin routing" },
  { id: 4, label: "API Gateway (Auth + Rate Limiting)", icon: "🗝️", color: "var(--secondary)", height: 56, desc: "JWT/OAuth2 validation, API key management, rate limiting, scopes" },
  { id: 5, label: "Microservices (mTLS mesh)", icon: "🔗", color: "var(--accent)", height: 72, desc: "Auth, Order, Payment, User services — Istio mTLS enforced" },
  { id: 6, label: "Cache (Redis encrypted)", icon: "💾", color: "var(--warning)", height: 56, desc: "Session cache, rate-limit counters — Redis AUTH + TLS + AES" },
  { id: 7, label: "Database + Secrets + Queue", icon: "🗄️", color: "var(--success)", height: 64, desc: "Encrypted DB, Vault dynamic creds, encrypted message queue" },
  { id: 8, label: "SIEM + Monitoring + Alerting", icon: "📊", color: "var(--danger)", height: 56, desc: "Splunk/ELK ingests all events, ML anomaly detection, PagerDuty" },
];

/* ─── Sub-component: Architecture Box ───────────────────────────── */
function ArchBox({ layer, onBadgeClick, activeBadge, threatLayerHighlight, threatBlockedAt }: {
  layer: typeof ARCH_LAYERS[0];
  onBadgeClick: (badge: typeof SECURITY_BADGES[0], rect: DOMRect) => void;
  activeBadge: number | null;
  threatLayerHighlight: number[] | null;
  threatBlockedAt: number | null;
}) {
  const badges = SECURITY_BADGES.filter(b => b.layer === layer.id);
  const isInThreatPath = threatLayerHighlight ? threatLayerHighlight.includes(layer.id) : false;
  const isBlocked = threatBlockedAt === layer.id;
  const isNeutral = threatLayerHighlight && !isInThreatPath;

  let borderColor = layer.color;
  let bgColor = "var(--card)";
  let glowStyle = {};

  if (isBlocked) {
    borderColor = "var(--danger)";
    bgColor = "rgba(239,68,68,0.12)";
    glowStyle = { boxShadow: "0 0 24px rgba(239,68,68,0.5), inset 0 0 16px rgba(239,68,68,0.1)" };
  } else if (isInThreatPath) {
    borderColor = "var(--danger)";
    bgColor = "rgba(239,68,68,0.06)";
  } else if (isNeutral) {
    borderColor = "var(--card-border)";
    bgColor = "var(--muted-bg)";
    glowStyle = { opacity: 0.4 };
  }

  return (
    <div style={{
      border: `2px solid ${borderColor}`,
      borderRadius: 10,
      padding: "10px 16px",
      background: bgColor,
      transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      minHeight: layer.height,
      ...glowStyle,
    }}>
      {/* Left: icon + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{layer.icon}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "0.82rem", color: isNeutral ? "var(--muted)" : "var(--fg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{layer.label}</div>
          {layer.id === 5 && (
            <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
              {["Auth Service", "Order Service", "Payment Service", "User Service"].map(s => (
                <span key={s} style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 4, background: "var(--muted-bg)", border: "1px solid var(--card-border)", color: isNeutral ? "var(--muted)" : "var(--fg)", fontWeight: 600, whiteSpace: "nowrap" }}>{s}</span>
              ))}
            </div>
          )}
          {layer.id === 7 && (
            <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
              {["Primary DB", "Read Replica", "Vault", "Message Queue"].map(s => (
                <span key={s} style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 4, background: "var(--muted-bg)", border: "1px solid var(--card-border)", color: isNeutral ? "var(--muted)" : "var(--fg)", fontWeight: 600, whiteSpace: "nowrap" }}>{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security badges */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
        {badges.map(badge => (
          <button
            key={badge.id}
            onClick={(e) => {
              e.stopPropagation();
              onBadgeClick(badge, (e.currentTarget as HTMLButtonElement).getBoundingClientRect());
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: `2px solid ${activeBadge === badge.id ? badge.color : "var(--card-border)"}`,
              background: activeBadge === badge.id ? `${badge.color}22` : "var(--muted-bg)",
              color: badge.color,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              transition: "all 0.2s",
              boxShadow: activeBadge === badge.id ? `0 0 12px ${badge.color}66` : "none",
              position: "relative",
              zIndex: 2,
            }}
            title={`Security Check #${badge.id}: ${badge.label}`}
          >
            {badge.id}
          </button>
        ))}
        {isBlocked && (
          <span style={{
            fontSize: "0.65rem",
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: 4,
            background: "rgba(239,68,68,0.2)",
            color: "var(--danger)",
            border: "1px solid var(--danger)",
            animation: "pulse-glow 1s ease-in-out infinite",
          }}>
            BLOCKED
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Sub-component: Connector between layers ─────────────────── */
function LayerConnector({ active, threatened, color }: { active: boolean; threatened: boolean; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 20, position: "relative" }}>
      <div style={{
        width: 2,
        height: "100%",
        background: threatened
          ? "var(--danger)"
          : active
            ? (color || "var(--primary)")
            : "var(--card-border)",
        transition: "background 0.3s",
        position: "relative",
        opacity: threatened || active ? 1 : 0.4,
      }} />
      <div style={{
        position: "absolute",
        bottom: 0,
        width: 0,
        height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderTop: `6px solid ${threatened ? "var(--danger)" : active ? (color || "var(--primary)") : "var(--card-border)"}`,
        transition: "border-color 0.3s",
        opacity: threatened || active ? 1 : 0.4,
      }} />
    </div>
  );
}

/* ─── View 1: Full Stack Architecture ────────────────────────────── */
function FullStackView() {
  const [activeBadge, setActiveBadge] = useState<number | null>(null);
  const [tooltipBadge, setTooltipBadge] = useState<typeof SECURITY_BADGES[0] | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [isPlaying, setIsPlaying] = useState(true);
  const [packets, setPackets] = useState<Packet[]>([]);
  const packetIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Spawn packets
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const isAttack = Math.random() < 0.25;
      const blockedAt = isAttack ? (Math.random() < 0.5 ? 1 : 2) : null;
      const maxLayer = blockedAt !== null ? blockedAt : ARCH_LAYERS.length - 1;
      packetIdRef.current += 1;
      const id = packetIdRef.current;
      setPackets(prev => [...prev.slice(-40), {
        id,
        x: 50,
        y: 0,
        targetX: 50,
        targetY: 0,
        progress: 0,
        speed: 0.015 + Math.random() * 0.01,
        color: isAttack ? "var(--danger)" : "var(--success)",
        fromLayer: 0,
        toLayer: maxLayer,
        blocked: isAttack,
      }]);
    }, 400);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Advance packets
  useEffect(() => {
    if (!isPlaying) return;
    const raf = requestAnimationFrame(() => {
      setPackets(prev => prev
        .map(p => ({ ...p, progress: Math.min(1, p.progress + p.speed) }))
        .filter(p => p.progress < 1)
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [packets, isPlaying]);

  const handleBadgeClick = useCallback((badge: typeof SECURITY_BADGES[0], _rect: DOMRect) => {
    if (activeBadge === badge.id) {
      setActiveBadge(null);
      setTooltipBadge(null);
    } else {
      setActiveBadge(badge.id);
      setTooltipBadge(badge);
    }
  }, [activeBadge]);

  return (
    <div>
      {/* Header + controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 4 }}>
            <span className="gradient-text">Full Stack Security Architecture</span>
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>E-Commerce / SaaS application with 10 active security checkpoints. Click numbered badges for details.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} /> Normal traffic
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--danger)", display: "inline-block", marginLeft: 8 }} /> Blocked threat
          </div>
          <button
            className="btn-primary"
            onClick={() => setIsPlaying(p => !p)}
            style={{ fontSize: "0.8rem", padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
        </div>
      </div>

      {/* Architecture diagram */}
      <div ref={containerRef} style={{ position: "relative" }}>
        {/* Animated packets overlay */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10, overflow: "hidden" }}>
          {packets.map(p => {
            const layerH = 76; // approx per-layer height
            const yPct = p.progress * (p.toLayer / (ARCH_LAYERS.length - 1)) * 100;
            return (
              <div key={p.id} style={{
                position: "absolute",
                left: `calc(${50 + (Math.random() * 0 - 0)}% - 5px)`,
                top: `${yPct}%`,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: p.color,
                boxShadow: `0 0 8px ${p.color}`,
                transition: "top 0.05s linear",
                opacity: p.blocked && p.progress > 0.7 ? Math.max(0, 1 - (p.progress - 0.7) * 5) : 1,
              }} />
            );
          })}
        </div>

        {/* Layer boxes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {ARCH_LAYERS.map((layer, i) => (
            <div key={layer.id}>
              <ArchBox
                layer={layer}
                onBadgeClick={handleBadgeClick}
                activeBadge={activeBadge}
                threatLayerHighlight={null}
                threatBlockedAt={null}
              />
              {i < ARCH_LAYERS.length - 1 && (
                <LayerConnector active={true} threatened={false} color={ARCH_LAYERS[i + 1].color} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Badge tooltip/detail panel */}
      {tooltipBadge && (
        <div className="anim-fadeup" style={{
          marginTop: "1.5rem",
          padding: "1.25rem 1.5rem",
          background: "var(--card)",
          border: `2px solid ${tooltipBadge.color}`,
          borderRadius: 12,
          boxShadow: `0 8px 32px ${tooltipBadge.color}33`,
          position: "relative",
        }}>
          <button
            onClick={() => { setActiveBadge(null); setTooltipBadge(null); }}
            style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.1rem" }}
          >✕</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${tooltipBadge.color}22`, border: `2px solid ${tooltipBadge.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              {tooltipBadge.icon}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1rem" }}>Security Check #{tooltipBadge.id}: {tooltipBadge.label}</div>
              <div style={{ fontSize: "0.75rem", color: tooltipBadge.color, fontWeight: 600 }}>{tooltipBadge.shortDesc}</div>
            </div>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.7 }}>{tooltipBadge.detail}</p>
        </div>
      )}

      {/* Security checkpoints summary */}
      <div className="section-divider" style={{ margin: "1.5rem 0" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
        {SECURITY_BADGES.map(b => (
          <button key={b.id} onClick={() => {
            if (activeBadge === b.id) { setActiveBadge(null); setTooltipBadge(null); }
            else { setActiveBadge(b.id); setTooltipBadge(b); }
          }} style={{
            textAlign: "left",
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${activeBadge === b.id ? b.color : "var(--card-border)"}`,
            background: activeBadge === b.id ? `${b.color}15` : "var(--card)",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}>
            <span style={{ width: 26, height: 26, borderRadius: "50%", background: `${b.color}22`, border: `1.5px solid ${b.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, color: b.color, flexShrink: 0 }}>{b.id}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--fg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.label}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.shortDesc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── View 2: Request Lifecycle ──────────────────────────────────── */
function RequestLifecycleView() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [scenario, setScenario] = useState<"pass" | "fail">("pass");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef = useRef(false);

  const failStep = 4; // JWT validation step fails

  const steps: RequestStep[] = scenario === "pass"
    ? REQUEST_STEPS
    : REQUEST_STEPS.map((s, i) => ({
        ...s,
        result: i === failStep ? "FAIL" : i > failStep ? "PENDING" : "PASS",
        detail: i === failStep
          ? "JWT token expired 42 minutes ago. Token blacklisted in Redis. HTTP 401 Unauthorized returned. Attacker cannot proceed. Refresh token invalid."
          : s.detail,
        time: i === failStep ? "35ms" : i > failStep ? "-" : s.time,
      }));

  const resetPlayback = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveStep(-1);
    setCompletedSteps([]);
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, []);

  const runNext = useCallback((idx: number, stepsToRun: RequestStep[]) => {
    if (!isPlayingRef.current) return;
    if (idx >= stepsToRun.length) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setActiveStep(-1);
      return;
    }
    setActiveStep(idx);
    const step = stepsToRun[idx];
    if (step.result === "FAIL") {
      setCompletedSteps(prev => [...prev, idx]);
      isPlayingRef.current = false;
      setIsPlaying(false);
      setActiveStep(-1);
      return;
    }
    timerRef.current = setTimeout(() => {
      setCompletedSteps(prev => [...prev, idx]);
      runNext(idx + 1, stepsToRun);
    }, 700);
  }, []);

  const handlePlay = useCallback(() => {
    resetPlayback();
    setTimeout(() => {
      isPlayingRef.current = true;
      setIsPlaying(true);
      runNext(0, steps);
    }, 50);
  }, [resetPlayback, runNext, steps]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const getStepState = (idx: number): "pending" | "active" | "pass" | "fail" => {
    if (activeStep === idx) return "active";
    if (!completedSteps.includes(idx)) return "pending";
    return steps[idx].result === "FAIL" ? "fail" : "pass";
  };

  const stateColors: Record<string, string> = {
    pending: "var(--card-border)",
    active: "var(--primary)",
    pass: "var(--success)",
    fail: "var(--danger)",
  };

  const stateBg: Record<string, string> = {
    pending: "transparent",
    active: "rgba(59,130,246,0.1)",
    pass: "rgba(16,185,129,0.08)",
    fail: "rgba(239,68,68,0.12)",
  };

  const totalTime = scenario === "pass" ? "78ms" : "35ms";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 4 }}>
            <span className="gradient-text">Request Lifecycle</span>
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>Animate a real user request through every security checkpoint. Choose a scenario and press Play.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => { setScenario("pass"); resetPlayback(); }}
            style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${scenario === "pass" ? "var(--success)" : "var(--card-border)"}`, background: scenario === "pass" ? "rgba(16,185,129,0.12)" : "var(--card)", color: scenario === "pass" ? "var(--success)" : "var(--muted)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, transition: "all 0.2s" }}
          >✅ Happy Path</button>
          <button
            onClick={() => { setScenario("fail"); resetPlayback(); }}
            style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${scenario === "fail" ? "var(--danger)" : "var(--card-border)"}`, background: scenario === "fail" ? "rgba(239,68,68,0.12)" : "var(--card)", color: scenario === "fail" ? "var(--danger)" : "var(--muted)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, transition: "all 0.2s" }}
          >🚫 Attack (Stolen JWT)</button>
          <button className="btn-primary" onClick={handlePlay} style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
            {isPlaying ? "⏳ Running..." : "▶ Play"}
          </button>
          <button className="btn-outline" onClick={resetPlayback} style={{ fontSize: "0.8rem", padding: "6px 14px" }}>↺ Reset</button>
        </div>
      </div>

      {/* Summary bar */}
      {completedSteps.length > 0 && !isPlaying && (
        <div className="anim-fadeup" style={{
          padding: "12px 16px",
          borderRadius: 10,
          marginBottom: "1rem",
          background: scenario === "fail" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
          border: `1px solid ${scenario === "fail" ? "var(--danger)" : "var(--success)"}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: "1.2rem" }}>{scenario === "fail" ? "🚫" : "✅"}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: scenario === "fail" ? "var(--danger)" : "var(--success)" }}>
              {scenario === "fail" ? "Request BLOCKED — Attack Neutralized" : "Request COMPLETED — All checks passed"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
              {completedSteps.length} steps executed · Total time: {totalTime} · {scenario === "fail" ? `Blocked at step ${failStep + 1}` : "Response returned to user"}
            </div>
          </div>
        </div>
      )}

      {/* Steps timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {steps.map((step, i) => {
          const state = getStepState(i);
          const color = stateColors[state];
          const isLast = i === steps.length - 1;
          return (
            <div key={step.id}>
              <div style={{
                display: "flex",
                gap: 14,
                padding: "12px 14px",
                borderRadius: 10,
                border: `1px solid ${color}`,
                background: stateBg[state],
                transition: "all 0.3s ease",
                boxShadow: state === "active" ? `0 0 16px rgba(59,130,246,0.25)` : state === "fail" ? `0 0 16px rgba(239,68,68,0.25)` : "none",
              }}>
                {/* Connector column */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 36 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: `2px solid ${color}`,
                    background: state === "pending" ? "var(--muted-bg)" : `${color}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    transition: "all 0.3s",
                    boxShadow: state === "active" ? `0 0 12px ${color}` : "none",
                    animation: state === "active" ? "pulse-glow 1s infinite" : "none",
                  }}>
                    {state === "pass" ? "✓" : state === "fail" ? "✕" : state === "active" ? "●" : step.icon}
                  </div>
                  {!isLast && (
                    <div style={{ width: 2, flex: 1, minHeight: 12, background: color, opacity: state === "pending" ? 0.2 : 0.6, transition: "all 0.3s", marginTop: 4 }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{step.component}</span>
                    <span className={
                      state === "pass" ? "badge badge-low"
                      : state === "fail" ? "badge badge-critical"
                      : state === "active" ? "badge badge-medium"
                      : "badge"
                    } style={state === "pending" ? { background: "var(--muted-bg)", color: "var(--muted)", border: "1px solid var(--card-border)" } : {}}>
                      {state === "pass" ? "PASS" : state === "fail" ? "FAIL" : state === "active" ? "CHECKING..." : "PENDING"}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--muted)", marginLeft: "auto" }}>{step.time}</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: state !== "pending" ? 6 : 0 }}>{step.check}</div>
                  {state !== "pending" && (
                    <div className="anim-fadeup" style={{ fontSize: "0.76rem", color: "var(--fg)", background: "var(--muted-bg)", borderRadius: 6, padding: "6px 10px", marginTop: 4, lineHeight: 1.6 }}>
                      {step.detail}
                    </div>
                  )}
                </div>
              </div>
              {!isLast && <div style={{ height: 0 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── View 3: Threat Scenarios ────────────────────────────────────── */
function ThreatScenariosView() {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [currentAnimLayer, setCurrentAnimLayer] = useState<number>(-1);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = THREAT_SCENARIOS.find(s => s.id === activeScenario);

  const runAnimation = useCallback((s: ThreatScenario) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAnimating(true);
    setDone(false);
    setCurrentAnimLayer(-1);

    const animate = (pathIdx: number) => {
      if (pathIdx >= s.path.length) {
        setCurrentAnimLayer(-1);
        setDone(true);
        setAnimating(false);
        return;
      }
      setCurrentAnimLayer(s.path[pathIdx]);
      timerRef.current = setTimeout(() => animate(pathIdx + 1), 600);
    };
    setTimeout(() => animate(0), 200);
  }, []);

  const handleSelect = useCallback((s: ThreatScenario) => {
    setActiveScenario(s.id);
    setDone(false);
    setCurrentAnimLayer(-1);
    setAnimating(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const getLayerState = (layerId: number): "neutral" | "active" | "blocked" | "highlighted" => {
    if (!scenario) return "neutral";
    if (!animating && !done) return "neutral";
    const pathContains = scenario.path.includes(layerId);
    if (!pathContains) return "neutral";
    if (layerId === scenario.blockedAt && done) return "blocked";
    if (layerId === currentAnimLayer) return "active";
    if (done && scenario.path.indexOf(layerId) < scenario.path.indexOf(scenario.blockedAt)) return "highlighted";
    return "neutral";
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 4 }}>
          <span className="gradient-text">Threat Scenarios</span>
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>Select an attack scenario to see how it propagates through the architecture and where it gets blocked.</p>
      </div>

      {/* Scenario selector */}
      <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
        {THREAT_SCENARIOS.map(s => (
          <button key={s.id} onClick={() => handleSelect(s)} style={{
            textAlign: "left",
            padding: "14px 16px",
            borderRadius: 12,
            border: `2px solid ${activeScenario === s.id ? s.color : "var(--card-border)"}`,
            background: activeScenario === s.id ? `${s.color}12` : "var(--card)",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: activeScenario === s.id ? `0 0 16px ${s.color}33` : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: activeScenario === s.id ? s.color : "var(--fg)" }}>{s.name}</div>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: s.color, marginTop: 2, padding: "2px 6px", borderRadius: 3, background: `${s.color}18`, border: `1px solid ${s.color}44`, display: "inline-block" }}>{s.attackType}</div>
              </div>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>{s.description}</p>
          </button>
        ))}
      </div>

      {/* Play button */}
      {scenario && (
        <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <button
            className="btn-primary"
            onClick={() => runAnimation(scenario)}
            disabled={animating}
            style={{ fontSize: "0.85rem", padding: "8px 18px", opacity: animating ? 0.6 : 1, cursor: animating ? "not-allowed" : "pointer", background: scenario.color, display: "flex", alignItems: "center", gap: 8 }}
          >
            {animating ? "⏳ Simulating..." : `▶ Simulate ${scenario.name} Attack`}
          </button>
          <button className="btn-outline" onClick={() => { setDone(false); setCurrentAnimLayer(-1); setAnimating(false); if (timerRef.current) clearTimeout(timerRef.current); }} style={{ fontSize: "0.85rem", padding: "8px 18px" }}>↺ Reset</button>
          <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Watch the red attack path move down and get blocked</span>
        </div>
      )}

      {/* Architecture diagram with attack overlay */}
      {scenario && (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {ARCH_LAYERS.map((layer, i) => {
              const state = getLayerState(layer.id);
              const isActive = state === "active";
              const isBlocked = state === "blocked";
              const isHighlighted = state === "highlighted";
              const isNeutral = state === "neutral";

              let borderColor = "var(--card-border)";
              let bgColor = "var(--card)";
              let glow = {};

              if (isActive) { borderColor = scenario.color; bgColor = `${scenario.color}15`; glow = { boxShadow: `0 0 20px ${scenario.color}55`, animation: "pulse-glow 0.5s ease-in-out infinite" }; }
              else if (isBlocked) { borderColor = "var(--danger)"; bgColor = "rgba(239,68,68,0.15)"; glow = { boxShadow: "0 0 24px rgba(239,68,68,0.6)" }; }
              else if (isHighlighted) { borderColor = scenario.color; bgColor = `${scenario.color}08`; }
              else if (isNeutral && (done || animating)) { glow = { opacity: 0.4 }; }

              const isLast = i === ARCH_LAYERS.length - 1;

              return (
                <div key={layer.id}>
                  <div style={{
                    border: `2px solid ${borderColor}`,
                    borderRadius: 10,
                    padding: "10px 16px",
                    background: bgColor,
                    transition: "all 0.3s ease",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    minHeight: layer.height,
                    ...glow,
                  }}>
                    <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{layer.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.82rem" }}>{layer.label}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>{layer.desc}</div>
                    </div>
                    {isActive && (
                      <div className="anim-fadeup" style={{ fontSize: "0.7rem", fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: `${scenario.color}22`, color: scenario.color, border: `1px solid ${scenario.color}`, whiteSpace: "nowrap" }}>
                        ⚡ ATTACK PASSING...
                      </div>
                    )}
                    {isBlocked && (
                      <div className="anim-fadeup" style={{ fontSize: "0.7rem", fontWeight: 800, padding: "4px 10px", borderRadius: 6, background: "rgba(239,68,68,0.2)", color: "var(--danger)", border: "1px solid var(--danger)", whiteSpace: "nowrap" }}>
                        🛑 BLOCKED HERE
                      </div>
                    )}
                    {isHighlighted && (
                      <div style={{ fontSize: "0.65rem", fontWeight: 600, padding: "3px 8px", borderRadius: 5, background: `${scenario.color}15`, color: scenario.color, border: `1px solid ${scenario.color}55`, whiteSpace: "nowrap" }}>
                        Attack passed
                      </div>
                    )}
                  </div>
                  {!isLast && (
                    <LayerConnector
                      active={isHighlighted || isActive}
                      threatened={isHighlighted || isActive}
                      color={scenario.color}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Block result */}
          {done && (
            <div className="anim-fadeup" style={{
              marginTop: "1.5rem",
              padding: "1.25rem 1.5rem",
              borderRadius: 12,
              background: "rgba(239,68,68,0.08)",
              border: "2px solid var(--danger)",
              boxShadow: "0 0 24px rgba(239,68,68,0.2)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: "1.75rem" }}>🛑</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--danger)" }}>{scenario.attackType}</div>
                    <span className="badge badge-critical">CRITICAL THREAT</span>
                    <span className="badge badge-high">Attack Blocked</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Blocked at Layer {scenario.blockedAt}: {ARCH_LAYERS[scenario.blockedAt]?.label}</div>
                </div>
              </div>
              <div className="code-block" style={{ fontSize: "0.8rem", lineHeight: 1.7 }}>
                {scenario.blockReason}
              </div>
            </div>
          )}
        </div>
      )}

      {!scenario && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)", border: "2px dashed var(--card-border)", borderRadius: 12 }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
          <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Select an attack scenario above to begin simulation</div>
          <div style={{ fontSize: "0.8rem", marginTop: 8 }}>See exactly how each attack is detected and neutralized</div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────── */
export default function ArchitecturePage() {
  const [activeView, setActiveView] = useState<"fullstack" | "lifecycle" | "threats">("fullstack");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const views = [
    { id: "fullstack" as const, label: "Full Stack Architecture", icon: "🏗️", desc: "All layers with security checkpoints" },
    { id: "lifecycle" as const, label: "Request Lifecycle", icon: "🔄", desc: "Animated step-by-step request flow" },
    { id: "threats" as const, label: "Threat Scenarios", icon: "⚡", desc: "4 attack simulations" },
  ];

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Keyframes */}
      <style>{`
        @keyframes packet-move {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(100px); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 8px var(--primary-glow); }
          50% { box-shadow: 0 0 24px var(--primary-glow), 0 0 48px var(--primary-glow); }
        }
        @keyframes threat-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(239,68,68,0.3); }
          50% { box-shadow: 0 0 24px rgba(239,68,68,0.7), 0 0 48px rgba(239,68,68,0.3); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes dot-travel {
          0% { top: 0%; opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      {/* Page header */}
      <div className="anim-fadeup" style={{ marginBottom: "2rem" }}>
        <div style={{
          background: "linear-gradient(135deg, var(--card) 0%, var(--muted-bg) 100%)",
          border: "1px solid var(--card-border)",
          borderRadius: 16,
          padding: "1.75rem 2rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "var(--primary-glow)", filter: "blur(80px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: "20%", width: 180, height: 180, borderRadius: "50%", background: "rgba(139,92,246,0.15)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "2rem" }}>🏗️</span>
                <span className="badge badge-info">Interactive Diagram</span>
                <span className="badge badge-low">Live Simulation</span>
              </div>
              <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, marginBottom: "0.5rem" }}>
                <span className="gradient-text">Secure Architecture Diagram</span>
              </h1>
              <p style={{ color: "var(--muted)", maxWidth: 560, lineHeight: 1.6, fontSize: "0.875rem" }}>
                Visual security architecture for a production e-commerce / SaaS application.
                Explore layers, animate traffic, and simulate attacks.
              </p>
            </div>
            {/* Checkpoint summary card */}
            <div style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: 12,
              padding: "1rem 1.25rem",
              minWidth: 200,
              boxShadow: "0 4px 16px var(--primary-glow)",
            }}>
              <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Security Status</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--success)", lineHeight: 1 }}>12</span>
                <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>checkpoints active</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  { label: "Network defenses", count: 3, color: "var(--accent)" },
                  { label: "Auth controls", count: 3, color: "var(--primary)" },
                  { label: "Data protection", count: 3, color: "var(--success)" },
                  { label: "Monitoring", count: 3, color: "var(--danger)" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.72rem" }}>
                    <span style={{ color: "var(--muted)" }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: item.color }}>✓ {item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View tabs */}
      <div className="anim-fadeup" style={{ marginBottom: "1.5rem", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {views.map(v => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              border: `2px solid ${activeView === v.id ? "var(--primary)" : "var(--card-border)"}`,
              background: activeView === v.id ? "var(--primary-glow)" : "var(--card)",
              color: activeView === v.id ? "var(--primary)" : "var(--fg)",
              cursor: "pointer",
              transition: "all 0.2s",
              textAlign: "left",
              boxShadow: activeView === v.id ? "0 4px 16px var(--primary-glow)" : "none",
              flex: "1 0 180px",
              minWidth: 180,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: "1.1rem" }}>{v.icon}</span>
              <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{v.label}</span>
            </div>
            <div style={{ fontSize: "0.7rem", color: activeView === v.id ? "var(--primary)" : "var(--muted)", opacity: 0.85 }}>{v.desc}</div>
          </button>
        ))}
      </div>

      {/* Security legend */}
      <div className="section-divider" />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", padding: "0.75rem 0", marginBottom: "1rem", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>LEGEND:</span>
        {[
          { label: "Network", color: "var(--accent)", icon: "🌐" },
          { label: "Auth / IAM", color: "var(--primary)", icon: "🗝️" },
          { label: "Data Protection", color: "var(--success)", icon: "🔒" },
          { label: "Rate Limiting", color: "var(--secondary)", icon: "⏱️" },
          { label: "Monitoring / Audit", color: "var(--danger)", icon: "📋" },
          { label: "Cryptography", color: "var(--warning)", icon: "🔐" },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: "0.85rem" }}>{item.icon}</span>
            <span style={{ color: "var(--muted)" }}>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="section-divider" />

      {/* Active view content */}
      <div className="card anim-fadeup" style={{ marginTop: "1.25rem" }}>
        {activeView === "fullstack" && <FullStackView key="fullstack" />}
        {activeView === "lifecycle" && <RequestLifecycleView key="lifecycle" />}
        {activeView === "threats" && <ThreatScenariosView key="threats" />}
      </div>

      {/* Bottom summary cards */}
      <div className="section-divider" style={{ margin: "2rem 0 1.5rem" }} />
      <div className="grid-3 anim-fadeup" style={{ marginBottom: "2rem" }}>
        <div className="card" style={{ borderTop: "3px solid var(--success)" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🏆</div>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: 4 }}>Defense in Depth</div>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.6 }}>
            12 independent security layers ensure no single point of failure.
            An attacker must breach every control simultaneously.
          </p>
        </div>
        <div className="card" style={{ borderTop: "3px solid var(--primary)" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🔄</div>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: 4 }}>Zero Trust Architecture</div>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.6 }}>
            Every service-to-service call is authenticated via mTLS.
            No implicit trust — verify explicitly at every hop.
          </p>
        </div>
        <div className="card" style={{ borderTop: "3px solid var(--danger)" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>📊</div>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: 4 }}>Full Observability</div>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.6 }}>
            100% of requests logged to SIEM. ML anomaly detection.
            Mean time to detect: under 3 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
