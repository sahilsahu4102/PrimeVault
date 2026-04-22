# 🧠 PrimeVault — Thinking & Approach Document

> This document captures the engineering philosophy, trade-off analysis, and architectural reasoning behind every major decision in the PrimeVault platform. It is intended to provide evaluators with insight into _how_ we think, not just _what_ we built.

---

## 1. Core Engineering Philosophy

### 1.1 Convention Over Configuration
Every module in PrimeVault follows a predictable pattern:
```
module/
  ├── module.routes.js      → Route definitions + Swagger docs
  ├── module.controller.js  → Request handling + response formatting
  ├── module.service.js     → Business logic + database operations
  └── module.validation.js  → Input schemas (Joi)
```
This means a new developer (or evaluator) can navigate any feature in under 30 seconds. When we needed to add the Users module, we simply cloned the Assets module structure and modified the business logic — zero architectural decisions required.

### 1.2 Fail Fast, Fail Loudly
- Environment variables are validated at boot. Missing `JWT_ACCESS_SECRET`? The server crashes immediately with a clear error message, rather than silently failing on the first authentication attempt 10 minutes later.
- Joi validation rejects malformed requests before they reach the controller. No defensive `if (!req.body.email)` checks scattered throughout the codebase.
- A global error handler catches everything — including unhandled promise rejections and Prisma-specific errors — and returns structured JSON responses.

### 1.3 Security by Default
Security isn't a feature we "add later." It's baked into the foundation:
- Passwords are hashed before they touch the database. There is no code path where a plaintext password is stored.
- JWT refresh tokens live in httpOnly cookies — invisible to JavaScript.
- CORS is configured to only accept requests from the frontend origin.
- Helmet sets 11+ security headers on every response.
- Rate limiting prevents brute-force attacks on authentication endpoints.

---

## 2. Architectural Decisions & Trade-Offs

### 2.1 Monolith vs Microservices
**Decision**: Monolith (modular)

**Reasoning**: A microservices architecture would be premature for an application with 3 modules. However, we structured the monolith with clear module boundaries — each module has its own routes, controllers, services, and validations with zero cross-module imports. This means extracting any module into a standalone microservice requires:
1. Copy the module directory
2. Add an Express server entry point
3. Update the API gateway routing

The cost of premature microservices (network latency, distributed transactions, deployment complexity) far outweighs the benefits at this scale. But the migration path is trivially clear.

### 2.2 SQL vs NoSQL
**Decision**: MySQL (relational)

**Reasoning**: Our data model has clear relationships (Users → Assets) with referential integrity requirements. When a user is deleted, their assets should cascade-delete — a constraint that SQL databases enforce at the engine level. MongoDB would require application-level cascade logic, which is error-prone.

Additionally, our query patterns (filter by category, sort by price, paginate with total count) map naturally to SQL's `WHERE`, `ORDER BY`, and `COUNT` operations. These patterns would require aggregation pipelines in MongoDB, adding complexity without benefit.

### 2.3 Token Storage Strategy
**Decision**: Access token in memory, refresh token in httpOnly cookie

**Reasoning**: We evaluated three common approaches:

| Approach | XSS Safe? | CSRF Safe? | Complexity |
|----------|-----------|------------|------------|
| localStorage | ❌ | ✅ | Low |
| httpOnly cookie (both tokens) | ✅ | ❌ | Medium |
| Hybrid (memory + cookie) | ✅ | ✅ | High |

We chose the hybrid approach because it provides defense against both XSS and CSRF attacks. The access token never touches persistent storage, so it can't be exfiltrated by malicious scripts. The refresh token is in an httpOnly cookie with `SameSite=Strict`, preventing cross-site request forgery.

The trade-off is complexity: we need Axios interceptors to automatically refresh tokens when access tokens expire. But this complexity lives in a single file (`api.js`) and is completely transparent to the rest of the frontend.

### 2.4 Validation Strategy
**Decision**: Joi with middleware-based validation

**Reasoning**: We considered three approaches:
- **Manual validation in controllers**: Verbose, error-prone, inconsistent error formats.
- **express-validator**: Tied to Express, chain-based API is harder to compose.
- **Joi schemas in middleware**: Declarative, composable, framework-agnostic.

By defining schemas as standalone objects and applying them via a generic `validate()` middleware, we achieve:
- **Reusability**: The same schema can validate API requests, WebSocket messages, or CLI inputs.
- **Testability**: Schemas can be unit-tested in isolation without spinning up Express.
- **Consistency**: Every validation error follows the same `{ field, message }` structure.

---

## 3. Frontend Architecture Reasoning

### 3.1 Why Not Next.js?
Next.js adds server-side rendering, file-based routing, and API routes — none of which we need. Our frontend is a pure SPA that communicates with a separate API server. Vite provides:
- Sub-200ms hot module replacement
- Optimized production builds with tree-shaking
- Zero-configuration React support

Adding Next.js would introduce unnecessary server infrastructure and complicate the deployment story (two Node.js servers instead of static files behind Nginx).

### 3.2 State Management Without Redux
We deliberately avoided Redux, Zustand, or any external state manager. Our state requirements are:
- **Auth state**: Managed by React Context with a single provider.
- **Page-level data**: Managed by `useState` + `useEffect` within each page component.
- **Server state**: Fetched on-demand via Axios — no client-side caching layer.

This keeps the mental model simple: data flows down through props and context, actions flow up through callbacks. For an application of this scope, introducing Redux would add boilerplate without solving a real problem.

### 3.3 CSS Architecture
We chose vanilla CSS with custom properties over Tailwind CSS because:
- **Full control**: Glassmorphism effects (`backdrop-filter`, layered gradients) require fine-grained CSS that utility frameworks abstract away.
- **Design system coherence**: All colors, spacing, radii, and shadows are defined as CSS custom properties in a single file, creating a true design token system.
- **Zero build dependency**: No PostCSS, no PurgeCSS, no Tailwind config. One CSS file, instant feedback.

---

## 4. Error Handling Philosophy

### The Error Pyramid
```
                    ┌─────────────┐
                    │   Client    │  ← User sees friendly toast message
                    ├─────────────┤
                    │  Controller │  ← Catches and formats service errors
                    ├─────────────┤
                    │   Service   │  ← Throws ApiError with HTTP status
                    ├─────────────┤
                    │    Prisma   │  ← Throws database-specific errors
                    ├─────────────┤
                    │   MySQL     │  ← Constraint violations, deadlocks
                    └─────────────┘
```

Every layer in the stack knows how to handle errors from the layer below:
1. **MySQL** throws constraint violations → **Prisma** wraps them in typed errors
2. **Prisma** errors → **Service** maps them to `ApiError` instances with HTTP status codes
3. **Service** throws `ApiError` → **Controller** catches via `asyncHandler` wrapper
4. **Unhandled errors** → **Global error middleware** catches everything, logs the stack trace, and returns a sanitized JSON response (never leaking internal details to the client)

---

## 5. Security Threat Model

| Threat | Mitigation |
|--------|-----------|
| SQL Injection | Prisma ORM parameterizes all queries automatically |
| XSS (Cross-Site Scripting) | Access tokens stored in memory, not DOM-accessible storage |
| CSRF (Cross-Site Request Forgery) | `SameSite=Strict` cookies, CORS origin restriction |
| Brute Force | Rate limiting (100 req/15min global, stricter on auth) |
| Mass Assignment | Joi's `stripUnknown` removes unexpected fields from payloads |
| Token Theft | Short-lived access tokens (15 min), httpOnly refresh cookies |
| Clickjacking | Helmet sets `X-Frame-Options: DENY` |
| MIME Sniffing | Helmet sets `X-Content-Type-Options: nosniff` |

---

## 6. What I Would Do Differently With More Time

1. **Redis Caching**: Cache frequently accessed asset listings with TTL-based invalidation. This would reduce database load by ~70% for read-heavy dashboards.
2. **WebSocket Integration**: Real-time asset price updates via Socket.io, replacing the current polling-based approach.
3. **E2E Testing**: Cypress or Playwright tests covering the full auth flow, CRUD operations, and RBAC enforcement.
4. **CI/CD Pipeline**: GitHub Actions workflow for linting, testing, building Docker images, and deploying to a staging environment on every PR.
5. **Observability**: Structured JSON logging with correlation IDs, Prometheus metrics export, and Grafana dashboards for API latency monitoring.

---

> _"The best code is not the most clever code. It's the code that the next developer can understand, modify, and extend without fear."_
