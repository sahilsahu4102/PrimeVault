# Phase 1: Architecture & Foundation

> **Duration**: ~2 hours | **Focus**: Project skeleton, tooling, and configuration

---

## Objective
Establish a robust, scalable project skeleton that enforces best practices from the very first line of code — ensuring every subsequent phase builds on a rock-solid foundation.

## What Was Built

### Monorepo Structure
```
primevault/
├── server/          → Node.js + Express API
│   ├── src/
│   │   ├── config/      → Environment, Logger, Swagger
│   │   ├── middleware/   → Auth, RBAC, Validation, Error Handler
│   │   ├── modules/     → Feature-based modules
│   │   └── utils/       → ApiError, ApiResponse, asyncHandler
│   └── prisma/          → Schema & Migrations
├── client/          → React + Vite SPA
└── docs/            → This documentation
```

### Technology Decisions

| Layer | Choice | Why |
|-------|--------|-----|
| Runtime | Node.js 18+ | Event-driven, non-blocking I/O ideal for API servers |
| Framework | Express.js | Minimal, battle-tested, enormous middleware ecosystem |
| ORM | Prisma | Type-safe queries, auto-generated client, visual Studio |
| Validation | Joi | Expressive schema DSL, `stripUnknown` sanitization |
| Logging | Winston | File rotation, structured JSON logs, severity levels |
| Frontend | React + Vite | Sub-200ms HMR, optimized production builds |

### Environment Configuration
Built a centralized `env.js` module that validates every required variable at startup:
```javascript
// Server refuses to boot if critical secrets are missing
if (!process.env.JWT_ACCESS_SECRET) {
  throw new Error('FATAL: JWT_ACCESS_SECRET is not defined');
}
```
This "fail fast" approach prevents silent runtime errors that would otherwise surface minutes into testing.

## Key Decision
> **Why Prisma over raw SQL or Sequelize?**
> Prisma provides auto-generated, type-safe query builders, seamless migration management, and a visual Studio for database inspection. This drastically reduces runtime bugs caused by schema drift and eliminates hand-written SQL injection vectors.

## Outcome
A clean, modular foundation where adding any new feature requires zero architectural decisions — just follow the established pattern.
