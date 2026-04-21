# Phase 2: Authentication & Security Layer

> **Duration**: ~3 hours | **Focus**: JWT auth, password hashing, cookie security, rate limiting

---

## Objective
Implement a production-grade authentication system that goes far beyond basic JWT tutorials — addressing real-world attack vectors like XSS, CSRF, and brute-force attempts.

## What Was Built

### Dual-Token Architecture
Unlike most tutorial implementations that store a single JWT in localStorage, we implemented a hybrid strategy:

| Token | Lifetime | Storage | Purpose |
|-------|----------|---------|---------|
| Access Token | 15 minutes | In-memory (JS variable) | Authorize API requests |
| Refresh Token | 7 days | `httpOnly` + `Secure` + `SameSite=Strict` cookie | Silently renew access tokens |

### Token Rotation
On every `/auth/refresh` call:
1. The old refresh token is validated against the database
2. A **new** refresh token is generated and stored
3. The old token is invalidated immediately

This prevents token replay attacks — even if a refresh token is stolen, it becomes useless after the legitimate user's next refresh cycle.

### Password Security
- **Bcrypt** with **12 salt rounds** — deliberately slow (~250ms per hash) to resist brute-force attacks
- Passwords are hashed in the service layer, ensuring no controller or route ever touches plaintext credentials

### Rate Limiting
```javascript
// Global: 100 requests per 15 minutes
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```
Authentication endpoints receive even stricter limits to prevent credential stuffing attacks.

### Security Headers (via Helmet.js)
- `X-Content-Type-Options: nosniff` — Prevents MIME sniffing
- `X-Frame-Options: DENY` — Prevents clickjacking
- `Strict-Transport-Security` — Forces HTTPS
- `X-XSS-Protection` — Legacy XSS filter

## Key Decision
> **Why not store JWT in localStorage?**
> localStorage is accessible to any JavaScript running on the page. A single XSS vulnerability would allow an attacker to exfiltrate all stored tokens. By using httpOnly cookies for refresh tokens and keeping access tokens in memory, we ensure tokens are never accessible to malicious scripts.

## Outcome
A defense-in-depth authentication system where compromising any single layer (XSS, CSRF, brute-force) is insufficient to gain unauthorized access.
