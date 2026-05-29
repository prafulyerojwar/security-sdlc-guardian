export const SDLC_PHASES = [
  {
    id: "requirements",
    title: "Requirements",
    icon: "📋",
    color: "#6366f1",
    order: 1,
    riskLevel: "high",
    description: "Security requirements gathering and threat modeling at the earliest phase.",
    shortDesc: "Define security requirements & threat models",
    threats: ["Missing security requirements", "Unclear data classification", "No privacy considerations", "Lack of compliance mapping"],
    controls: [
      "Define security acceptance criteria for every user story",
      "Classify data sensitivity (PII, PCI, PHI)",
      "Map regulatory requirements (GDPR, HIPAA, SOC2)",
      "Create threat model using STRIDE methodology",
      "Define authentication & authorization requirements",
      "Specify encryption requirements for data at rest and in transit",
    ],
    tools: ["OWASP ASVS", "STRIDE Threat Model", "PASTA Framework", "Microsoft Threat Modeling Tool"],
    checklist: [
      { id: "req1", text: "Security user stories created", severity: "critical" },
      { id: "req2", text: "Data classification completed", severity: "high" },
      { id: "req3", text: "Compliance requirements documented", severity: "high" },
      { id: "req4", text: "Threat model initiated", severity: "high" },
      { id: "req5", text: "Privacy impact assessment started", severity: "medium" },
      { id: "req6", text: "Security NFRs defined", severity: "medium" },
    ],
    kpi: { score: 78, items: 12, passed: 9 },
  },
  {
    id: "design",
    title: "Architecture & Design",
    icon: "🏗️",
    color: "#8b5cf6",
    order: 2,
    riskLevel: "critical",
    description: "Secure architecture patterns, design reviews, and security controls design.",
    shortDesc: "Secure architecture patterns & design reviews",
    threats: ["Insecure architecture patterns", "Missing security boundaries", "Weak cryptography choices", "Single points of failure"],
    controls: [
      "Conduct architecture security review (threat modeling)",
      "Implement Zero Trust Network Architecture (ZTNA)",
      "Design defense-in-depth layers",
      "Select appropriate cryptographic algorithms (AES-256, RSA-4096, ECDSA)",
      "Define network segmentation and micro-segmentation",
      "Design secure API gateway and authentication flows",
      "Plan secret management strategy (Vault, AWS Secrets Manager)",
      "Design audit logging and monitoring architecture",
    ],
    tools: ["OWASP SAMM", "AWS Well-Architected", "NIST CSF", "TOGAF Security"],
    checklist: [
      { id: "des1", text: "Architecture threat model complete", severity: "critical" },
      { id: "des2", text: "Zero Trust principles applied", severity: "critical" },
      { id: "des3", text: "Cryptographic standards selected", severity: "high" },
      { id: "des4", text: "Network segmentation designed", severity: "high" },
      { id: "des5", text: "Secret management strategy defined", severity: "high" },
      { id: "des6", text: "API security design reviewed", severity: "high" },
      { id: "des7", text: "Logging & monitoring architecture defined", severity: "medium" },
    ],
    kpi: { score: 65, items: 15, passed: 10 },
  },
  {
    id: "development",
    title: "Development",
    icon: "💻",
    color: "#06b6d4",
    order: 3,
    riskLevel: "critical",
    description: "Secure coding practices, SAST, code review, and dependency management.",
    shortDesc: "Secure coding, SAST, code review",
    threats: ["Injection attacks (SQL, XSS, SSTI)", "Insecure dependencies", "Hard-coded secrets", "Broken authentication", "IDOR vulnerabilities"],
    controls: [
      "Follow OWASP Top 10 secure coding guidelines",
      "Implement input validation and output encoding",
      "Use parameterized queries / ORM for database access",
      "Enforce Content Security Policy (CSP) headers",
      "Implement proper session management (HttpOnly, Secure, SameSite cookies)",
      "Use secrets management — never hard-code credentials",
      "Apply principle of least privilege in all code",
      "Implement proper error handling without info leakage",
    ],
    tools: ["SonarQube", "Snyk", "Checkmarx", "Semgrep", "Bandit (Python)", "ESLint Security"],
    checklist: [
      { id: "dev1", text: "OWASP Top 10 guidelines followed", severity: "critical" },
      { id: "dev2", text: "Input validation implemented", severity: "critical" },
      { id: "dev3", text: "Parameterized queries used", severity: "critical" },
      { id: "dev4", text: "No hard-coded secrets in code", severity: "critical" },
      { id: "dev5", text: "Dependencies scanned for CVEs", severity: "high" },
      { id: "dev6", text: "SAST scan passing", severity: "high" },
      { id: "dev7", text: "Secure headers configured", severity: "high" },
      { id: "dev8", text: "Error handling reviewed", severity: "medium" },
    ],
    kpi: { score: 82, items: 20, passed: 16 },
  },
  {
    id: "testing",
    title: "Testing & QA",
    icon: "🧪",
    color: "#10b981",
    order: 4,
    riskLevel: "high",
    description: "DAST, penetration testing, vulnerability scanning, and security regression tests.",
    shortDesc: "DAST, pentesting, vulnerability scanning",
    threats: ["Undetected vulnerabilities", "Logic flaws", "Authentication bypass", "Session fixation", "Business logic abuse"],
    controls: [
      "Run DAST scans (OWASP ZAP / Burp Suite)",
      "Perform internal penetration testing",
      "Conduct security-focused code review",
      "Test all authentication and authorization paths",
      "Fuzz test API endpoints and inputs",
      "Validate all security requirements from phase 1",
      "Run dependency vulnerability scans",
      "Test rate limiting and anti-automation controls",
    ],
    tools: ["OWASP ZAP", "Burp Suite Pro", "Nessus", "Nikto", "SQLMap", "Metasploit"],
    checklist: [
      { id: "tst1", text: "DAST scan completed", severity: "critical" },
      { id: "tst2", text: "Penetration test performed", severity: "critical" },
      { id: "tst3", text: "Authentication tests passed", severity: "critical" },
      { id: "tst4", text: "Authorization tests passed", severity: "high" },
      { id: "tst5", text: "API security tests passed", severity: "high" },
      { id: "tst6", text: "Vulnerability scan clean", severity: "high" },
      { id: "tst7", text: "Security regression suite passing", severity: "medium" },
    ],
    kpi: { score: 71, items: 18, passed: 13 },
  },
  {
    id: "deployment",
    title: "Deployment & CI/CD",
    icon: "🚀",
    color: "#f59e0b",
    order: 5,
    riskLevel: "high",
    description: "Secure CI/CD pipelines, container security, infrastructure hardening.",
    shortDesc: "Secure CI/CD, containers, IaC scanning",
    threats: ["Supply chain attacks", "Misconfigured infrastructure", "Leaked secrets in CI", "Insecure container images", "Privilege escalation in pipelines"],
    controls: [
      "Implement security gates in CI/CD pipeline",
      "Scan Docker images with Trivy / Snyk Container",
      "Enforce image signing and verification (Cosign)",
      "Scan IaC (Terraform, Helm) with Checkov / tfsec",
      "Use OIDC tokens instead of long-lived secrets in CI",
      "Implement least-privilege IAM for deployment roles",
      "Enforce immutable infrastructure patterns",
      "Enable runtime security monitoring (Falco)",
    ],
    tools: ["Trivy", "Checkov", "tfsec", "Falco", "Snyk Container", "Cosign"],
    checklist: [
      { id: "dep1", text: "Security gates in CI/CD active", severity: "critical" },
      { id: "dep2", text: "Container images scanned", severity: "critical" },
      { id: "dep3", text: "IaC scanning enabled", severity: "high" },
      { id: "dep4", text: "No long-lived secrets in CI", severity: "high" },
      { id: "dep5", text: "Least-privilege IAM configured", severity: "high" },
      { id: "dep6", text: "Runtime monitoring active", severity: "medium" },
    ],
    kpi: { score: 60, items: 14, passed: 8 },
  },
  {
    id: "operations",
    title: "Operations & Monitoring",
    icon: "🔍",
    color: "#ef4444",
    order: 6,
    riskLevel: "high",
    description: "SIEM, incident response, vulnerability management, and security monitoring.",
    shortDesc: "SIEM, incident response, monitoring",
    threats: ["Undetected breaches", "Slow incident response", "Unpatched vulnerabilities", "Insider threats", "DDoS attacks"],
    controls: [
      "Deploy SIEM (Splunk, ELK, Sentinel) for log aggregation",
      "Set up real-time alerting for security events",
      "Establish Incident Response (IR) runbooks",
      "Implement WAF rules and DDoS protection",
      "Schedule regular vulnerability assessments",
      "Enforce patch management SLAs (critical: 24h, high: 7d)",
      "Implement CSPM for cloud misconfigurations",
      "Conduct regular security drills and tabletop exercises",
    ],
    tools: ["Splunk", "AWS GuardDuty", "Microsoft Sentinel", "Wazuh", "Crowdstrike", "PagerDuty"],
    checklist: [
      { id: "ops1", text: "SIEM deployed and alerts configured", severity: "critical" },
      { id: "ops2", text: "IR runbooks documented", severity: "critical" },
      { id: "ops3", text: "WAF rules active", severity: "high" },
      { id: "ops4", text: "Patch management process defined", severity: "high" },
      { id: "ops5", text: "CSPM monitoring active", severity: "medium" },
      { id: "ops6", text: "Security drills scheduled", severity: "low" },
    ],
    kpi: { score: 55, items: 16, passed: 9 },
  },
];

export const SECURITY_DOMAINS = [
  {
    id: "auth",
    title: "Authentication & Identity",
    icon: "🔐",
    color: "#6366f1",
    description: "Multi-factor authentication, SSO, identity federation, and session management.",
    risks: ["Credential stuffing", "Brute force", "Session hijacking", "Token leakage"],
    controls: [
      "Enforce MFA for all privileged accounts",
      "Implement PKCE for OAuth 2.0 flows",
      "Use short-lived JWT tokens (15 min access, 7d refresh)",
      "Rate-limit login attempts (5/min per IP)",
      "Implement account lockout after 10 failed attempts",
      "Use bcrypt/Argon2 for password hashing (min cost 12)",
      "Enforce strong password policy (12+ chars, complexity)",
      "Implement device fingerprinting for anomaly detection",
    ],
    codeExample: `// Secure JWT generation
const token = jwt.sign(
  { sub: userId, roles: user.roles },
  process.env.JWT_SECRET,
  {
    expiresIn: '15m',
    algorithm: 'RS256',
    issuer: 'api.yourapp.com'
  }
);

// Secure cookie settings
res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000
});`,
  },
  {
    id: "api",
    title: "API Security",
    icon: "🔌",
    color: "#06b6d4",
    description: "API gateway security, rate limiting, authentication, and input validation.",
    risks: ["Broken Object Level Auth", "Excessive data exposure", "Mass assignment", "Injection via API"],
    controls: [
      "Validate and sanitize all API inputs",
      "Implement RBAC/ABAC for endpoint authorization",
      "Use API keys with scopes and expiration",
      "Enforce rate limiting per user/IP/API key",
      "Return minimal data — never expose internal fields",
      "Use HTTPS/TLS 1.3 exclusively",
      "Implement request signing for sensitive operations",
      "Log all API calls with correlation IDs",
    ],
    codeExample: `// API Key validation middleware
async function validateApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key) return res.status(401).json({ error: 'Missing API key' });

  const hashed = crypto
    .createHash('sha256')
    .update(key)
    .digest('hex');

  const record = await ApiKey.findOne({
    hash: hashed,
    active: true,
    expiresAt: { $gt: new Date() }
  });
  if (!record) return res.status(403).json({ error: 'Invalid key' });

  req.apiKey = record;
  next();
}`,
  },
  {
    id: "secrets",
    title: "Secrets Management",
    icon: "🗝️",
    color: "#f59e0b",
    description: "Vault, environment variables, secrets rotation, and zero-trust secrets access.",
    risks: ["Hard-coded secrets", "Secrets in logs", "Unrotated credentials", "Broad secret access"],
    controls: [
      "Never store secrets in code or config files",
      "Use HashiCorp Vault or AWS Secrets Manager",
      "Rotate secrets automatically every 90 days",
      "Audit all secret access with detailed logs",
      "Use environment-specific secrets namespacing",
      "Implement break-glass procedures for emergencies",
      "Scan repos for leaked secrets (GitLeaks, TruffleHog)",
      "Use short-lived dynamic secrets where possible",
    ],
    codeExample: `// Vault dynamic secrets
const vault = require('node-vault')({
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN  // from K8s SA
});

// Get dynamic DB credentials
const creds = await vault.read('database/creds/app-role');
const db = await createConnection({
  user: creds.data.username,
  password: creds.data.password,
  // credentials auto-expire after TTL
});`,
  },
  {
    id: "data",
    title: "Data Protection",
    icon: "🛡️",
    color: "#10b981",
    description: "Encryption at rest, in transit, data masking, and privacy controls.",
    risks: ["Data breach", "Unencrypted sensitive data", "Data leakage in logs", "Inadequate key management"],
    controls: [
      "Encrypt PII/sensitive data at rest (AES-256-GCM)",
      "Enforce TLS 1.3 for all data in transit",
      "Mask sensitive data in logs (card numbers, SSN)",
      "Implement envelope encryption for key management",
      "Apply data minimization — collect only what's needed",
      "Implement field-level encryption for sensitive columns",
      "Set proper data retention and deletion policies",
      "Use tokenization for payment card data (PCI DSS)",
    ],
    codeExample: `// Field-level encryption
const encrypt = (plaintext) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(process.env.FIELD_KEY, 'hex'),
    iv
  );
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return { encrypted, iv, tag };
};`,
  },
];

export const OWASP_TOP10 = [
  { rank: "A01", title: "Broken Access Control", severity: "critical", desc: "Restrictions on authenticated users not properly enforced.", example: "Changing userId in URL to access other user's data." },
  { rank: "A02", title: "Cryptographic Failures", severity: "critical", desc: "Failures related to cryptography often leading to data exposure.", example: "Storing passwords in plain text or MD5 hash." },
  { rank: "A03", title: "Injection", severity: "critical", desc: "SQL, NoSQL, OS, LDAP injection when untrusted data is sent to interpreter.", example: "' OR 1=1 -- in login form bypassing auth." },
  { rank: "A04", title: "Insecure Design", severity: "high", desc: "Missing or ineffective control design — cannot be fixed by implementation alone.", example: "Password reset via secret questions that can be guessed." },
  { rank: "A05", title: "Security Misconfiguration", severity: "high", desc: "Improperly configured permissions, unnecessary features enabled.", example: "Default admin credentials, directory listing enabled." },
  { rank: "A06", title: "Vulnerable Components", severity: "high", desc: "Using components with known vulnerabilities.", example: "Log4Shell — using Log4j 2.x < 2.15.0." },
  { rank: "A07", title: "Identification Failures", severity: "high", desc: "Broken authentication — permits automated attacks.", example: "No rate limiting on login allowing brute force." },
  { rank: "A08", title: "Data Integrity Failures", severity: "medium", desc: "Code/infrastructure not protected against integrity violations.", example: "Deserializing untrusted data, insecure CI/CD pipeline." },
  { rank: "A09", title: "Logging Failures", severity: "medium", desc: "Insufficient logging and monitoring allowing breaches to go undetected.", example: "Failed logins not logged, no alerting on suspicious activity." },
  { rank: "A10", title: "Server-Side Request Forgery", severity: "medium", desc: "SSRF flaws allow attacker to coerce server to make requests.", example: "Fetch URL parameter pointing to internal metadata endpoint." },
];

export const SECURITY_FLOWS = [
  {
    id: "auth-flow",
    title: "OAuth 2.0 / OIDC Secure Auth Flow",
    category: "Authentication",
    description: "Step-by-step secure authentication flow using OAuth 2.0 with PKCE and OIDC.",
    steps: [
      { id: 1, actor: "User", action: "Clicks Login", target: "Frontend", type: "request", note: "User initiates auth" },
      { id: 2, actor: "Frontend", action: "Generate code_verifier + code_challenge (PKCE)", target: "Frontend", type: "process", note: "PKCE prevents auth code interception" },
      { id: 3, actor: "Frontend", action: "Redirect to /authorize?code_challenge=xxx", target: "Auth Server", type: "request", note: "Include state & nonce params" },
      { id: 4, actor: "Auth Server", action: "Validate request, show login page", target: "User", type: "response", note: "Verify redirect_uri whitelist" },
      { id: 5, actor: "User", action: "Enter credentials + MFA", target: "Auth Server", type: "request", note: "Rate-limited, brute-force protected" },
      { id: 6, actor: "Auth Server", action: "Issue authorization code", target: "Frontend", type: "response", note: "Code expires in 60 seconds" },
      { id: 7, actor: "Frontend", action: "POST /token with code + code_verifier", target: "Auth Server", type: "request", note: "Exchange code for tokens" },
      { id: 8, actor: "Auth Server", action: "Return access_token (15m) + refresh_token (7d)", target: "Frontend", type: "response", note: "Store in httpOnly cookies" },
      { id: 9, actor: "Frontend", action: "API call with Bearer token", target: "API Gateway", type: "request", note: "Token in Authorization header" },
      { id: 10, actor: "API Gateway", action: "Validate JWT signature + expiry", target: "Backend", type: "process", note: "Reject expired/tampered tokens" },
    ],
  },
  {
    id: "api-key-flow",
    title: "API Key Management Flow",
    category: "API Security",
    description: "Lifecycle of secure API key creation, validation, rotation, and revocation.",
    steps: [
      { id: 1, actor: "Developer", action: "Request API key via dashboard", target: "Key Management Service", type: "request", note: "Authenticated developer portal" },
      { id: 2, actor: "KMS", action: "Generate cryptographically random key (256-bit)", target: "KMS", type: "process", note: "Use CSPRNG — never Math.random()" },
      { id: 3, actor: "KMS", action: "Hash key with SHA-256, store hash only", target: "Database", type: "process", note: "Never store plain API keys" },
      { id: 4, actor: "KMS", action: "Return key ONCE to developer", target: "Developer", type: "response", note: "Key is shown only on creation" },
      { id: 5, actor: "Client", action: "Send request with X-API-Key header", target: "API Gateway", type: "request", note: "Always use HTTPS" },
      { id: 6, actor: "API Gateway", action: "Hash incoming key, lookup in DB", target: "Database", type: "process", note: "Constant-time comparison" },
      { id: 7, actor: "Database", action: "Return key metadata (scopes, expiry, rate limits)", target: "API Gateway", type: "response", note: "Check expiry and active status" },
      { id: 8, actor: "API Gateway", action: "Enforce rate limits and scope checks", target: "API Gateway", type: "process", note: "429 on rate limit breach" },
      { id: 9, actor: "API Gateway", action: "Forward validated request", target: "Backend Service", type: "request", note: "Inject key metadata as headers" },
    ],
  },
  {
    id: "incident-flow",
    title: "Security Incident Response Flow",
    category: "Operations",
    description: "End-to-end incident detection, triage, containment, and recovery process.",
    steps: [
      { id: 1, actor: "SIEM", action: "Detect anomaly / alert triggered", target: "Security Team", type: "alert", note: "Automated detection" },
      { id: 2, actor: "Security Team", action: "Acknowledge and assess severity (P1-P4)", target: "Incident Commander", type: "process", note: "SLA: P1 = 15min response" },
      { id: 3, actor: "Incident Commander", action: "Assemble response team, open war room", target: "Response Team", type: "process", note: "Follow IR runbook" },
      { id: 4, actor: "Response Team", action: "Identify and isolate affected systems", target: "Infrastructure", type: "action", note: "Containment phase" },
      { id: 5, actor: "Response Team", action: "Collect evidence and forensic artifacts", target: "Evidence Store", type: "process", note: "Preserve chain of custody" },
      { id: 6, actor: "Response Team", action: "Root cause analysis", target: "Incident Report", type: "process", note: "5-Why analysis" },
      { id: 7, actor: "Engineering", action: "Develop and test fix", target: "Staging Environment", type: "action", note: "Patch in isolated environment" },
      { id: 8, actor: "Engineering", action: "Deploy fix to production", target: "Production", type: "action", note: "Emergency change process" },
      { id: 9, actor: "Security Team", action: "Monitor for recurrence", target: "SIEM", type: "process", note: "72h monitoring window" },
      { id: 10, actor: "All Teams", action: "Post-incident review (PIR)", target: "Documentation", type: "process", note: "Within 5 business days" },
    ],
  },
];

export const KT_MODULES = [
  {
    id: "kt1",
    title: "OWASP Top 10 Essentials",
    category: "Foundation",
    duration: "45 min",
    level: "Beginner",
    icon: "🎓",
    topics: ["Injection attacks", "Broken Auth", "XSS", "IDOR", "Security misconfiguration"],
    description: "Core security concepts every developer must know. Covers the OWASP Top 10 with real-world examples and code fixes.",
  },
  {
    id: "kt2",
    title: "Secure Coding in Node.js / Python",
    category: "Development",
    duration: "90 min",
    level: "Intermediate",
    icon: "💻",
    topics: ["Input validation", "Parameterized queries", "Secure headers", "Dependency hygiene", "Secrets management"],
    description: "Hands-on secure coding practices for backend developers using Node.js and Python frameworks.",
  },
  {
    id: "kt3",
    title: "JWT & OAuth 2.0 Deep Dive",
    category: "Authentication",
    duration: "60 min",
    level: "Intermediate",
    icon: "🔐",
    topics: ["JWT structure & signing", "OAuth flows", "PKCE", "Token storage", "Common mistakes"],
    description: "Complete guide to implementing secure authentication with JWTs, OAuth 2.0, and OIDC.",
  },
  {
    id: "kt4",
    title: "API Security Best Practices",
    category: "API Security",
    duration: "75 min",
    level: "Intermediate",
    icon: "🔌",
    topics: ["OWASP API Top 10", "Rate limiting", "API keys", "Input sanitization", "Response filtering"],
    description: "Comprehensive coverage of API security from authentication to payload validation and monitoring.",
  },
  {
    id: "kt5",
    title: "Container & Kubernetes Security",
    category: "DevSecOps",
    duration: "90 min",
    level: "Advanced",
    icon: "🐳",
    topics: ["Image scanning", "Pod security", "RBAC", "Network policies", "Runtime security"],
    description: "Securing containerized applications and Kubernetes clusters from build to runtime.",
  },
  {
    id: "kt6",
    title: "Cloud Security (AWS/Azure/GCP)",
    category: "Cloud",
    duration: "120 min",
    level: "Advanced",
    icon: "☁️",
    topics: ["IAM best practices", "Security groups", "Encryption", "GuardDuty / Defender", "CSPM"],
    description: "Cloud-native security controls across major cloud providers with hands-on labs.",
  },
  {
    id: "kt7",
    title: "Incident Response & Forensics",
    category: "Operations",
    duration: "60 min",
    level: "Intermediate",
    icon: "🚨",
    topics: ["IR lifecycle", "Evidence collection", "Log analysis", "Forensic tools", "PIR process"],
    description: "How to effectively detect, respond to, contain, and recover from security incidents.",
  },
  {
    id: "kt8",
    title: "Threat Modeling Workshop",
    category: "Architecture",
    duration: "120 min",
    level: "Intermediate",
    icon: "🎯",
    topics: ["STRIDE", "PASTA", "Attack trees", "Data flow diagrams", "Risk prioritization"],
    description: "Interactive threat modeling workshop to identify and mitigate architectural security risks.",
  },
];

export const OVERALL_SECURITY_SCORE = {
  total: 71,
  phases: {
    requirements: 78,
    design: 65,
    development: 82,
    testing: 71,
    deployment: 60,
    operations: 55,
  },
  trend: [58, 62, 67, 69, 71],
  openIssues: { critical: 3, high: 8, medium: 14, low: 22 },
};
