# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: a recruiter or engineer opening the live demo from Sahil Kumar Sahu's CV or the GitHub repo. They give it about ten seconds to decide whether this is real working software or a screenshot-driven toy, and some of them will read the API docs next.

Secondary, inside the app: a signed-in user who keeps a list of crypto-asset records (name, category, price, quantity held, active or inactive) and edits only their own, and an admin who also manages other users and their roles.

## Product Purpose

PrimeVault is a crypto-asset record manager built as a backend assignment. The REST API is the main work: dual-token JWT authentication (access token plus an httpOnly refresh cookie with silent refresh), role-based access (USER and ADMIN), Joi validation, rate limiting, Swagger docs, and an automated test suite run in CI. The web client exists to show that the API works end to end and to make its behaviour (roles, ownership rules, validation, pagination) visible.

Success: a reviewer signs in within seconds, sees a credible tool whose screens map to real endpoints, and can find the API docs.

## Positioning

A working client for a security-minded REST API, where the interface exposes the API's rules (who may edit what, what the server rejected and why) instead of hiding them behind decoration. It is an assignment project and says so plainly.

## Operating Context

- The API runs on a Render free tier and sleeps after 15 minutes idle. The first request after that takes up to about a minute (a health check measured 23 s on 2026-11-11), so every screen that makes the first request needs an honest waiting state.
- The client is deployed at https://prime-vault-alpha.vercel.app (given by the owner on 2026-11-11). The API is at https://primevault-kc1y.onrender.com (docs at /api-docs).
- Visitors reach it from a CV or a README link, usually on a laptop, sometimes on a phone.

## Capabilities and Constraints

- Register (name, email, password; no role choice: the server makes every public sign-up a USER), sign in, sign out, silent token refresh.
- Guest access (requested by the owner on 2026-11-11): a one-click temporary account so a reviewer does not have to register. Mechanism is an open decision; proposed as a server-created USER account that expires.
- Assets: list for every signed-in user, create, edit and delete for the owner or an admin. Fields: name, description, price (field name `price`), category, stock (quantity held), isActive. Search, category filter, sort, pagination.
- Users page: admin only; list, search, change role, delete (which deletes that user's assets).
- Dashboard: totals and the five most recent assets. Every number shown must be a real total from the API, never a count of a partial page.
- Admin access is never advertised: no admin login or seeded credentials on any page or in the README.
- API docs link must point at the deployed API (`/api-docs`), not localhost.
- Constraints: `cd client && npm run build` stays green (CI builds it); any dependency change needs the npm 10 lockfile treatment; no tests run against the real database.

## Brand Commitments

Name: PrimeVault. Honest framing: "assignment project", never a claim of an internship at the company, no claim of users, traffic or accuracy.

## Evidence on Hand

- 47 server tests in CI (unit, API against real MySQL, rate limit, deployment); the React client has no tests, only a CI build.
- No users, traffic, uptime or performance figures exist. Do not invent any.
- Sample data exists only locally (seed script, 65 assets). The live database's contents are unknown and must not be read.

## Product Principles

1. The interface is evidence for the API: show ownership, roles and server messages plainly.
2. Every number on screen is a real total from a real response.
3. Waiting is a state with words, not a spinner on a frozen button.
4. It is a tool for scanning and editing records: density, tabular figures and clear states over decoration.
5. Say what it is: an assignment project whose main work is the API.

## Accessibility & Inclusion

Target WCAG 2.2 AA: contrast, visible keyboard focus, labelled controls, reduced-motion respected, no horizontal scroll at 390 px.
