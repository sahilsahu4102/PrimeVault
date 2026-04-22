# Phase 6: Database Migration & Web3 Domain Alignment

> **Duration**: ~2 hours | **Focus**: MySQL migration, crypto-themed data model, realistic seeding

---

## Objective
Align the technical stack with the assignment's explicit database requirements and the company's Web3/crypto trading domain to demonstrate deep contextual awareness.

## What Was Built

### MySQL Migration
During rapid prototyping (Phases 1–5), we used SQLite for zero-configuration local development. In this phase, we migrated to **MySQL 8.0** as required by the assignment:

| Aspect | Before (SQLite) | After (MySQL) |
|--------|-----------------|---------------|
| Provider | `sqlite` | `mysql` |
| Role type | `String` | Native `ENUM('USER', 'ADMIN')` |
| Text fields | Default | `@db.Text` for long descriptions |
| Connection | File-based | `mysql://root:password@localhost:3306/primevault` |

### Why We Prototyped with SQLite First
SQLite allowed us to build and test the entire application without installing a database server. This is a deliberate engineering practice:
1. **Speed**: Zero setup time during the critical early phases
2. **Portability**: The entire database is a single file
3. **Migration simplicity**: Prisma's provider swap required changing exactly 2 lines

### Web3 Domain Rebranding
The assignment allows any secondary entity ("e.g., tasks, notes, or products"). We strategically chose **Crypto Assets** to align with PrimeVault's trading intelligence platform:

| Generic Term | Web3 Term |
|-------------|-----------|
| Products | Crypto Assets |
| Category | Asset Type (Layer 1, DeFi, NFTs, Stablecoins, Meme Coins) |
| Price | Volume |
| Stock | Token Supply |

### Realistic Data Seeding
Integrated `@faker-js/faker` to populate the database with production-realistic data:
- **11 user accounts** with real-sounding names and distributed creation dates
- **65 crypto asset entries** including:
  - Real crypto names: Ethereum, Solana, Uniswap, Dogecoin
  - Realistic variations: "Wrapped Ethereum", "Solana Liquidity Pool"
  - Appropriate categories: Layer 1, DeFi, NFTs, Stablecoins, Meme Coins
  - Distributed ownership across multiple users
  - Varied activity status (some inactive to test filters)

## Key Decision
> **Why rebrand to Crypto Assets instead of keeping generic Products?**
> The recruiter note explicitly states the company is "redefining trading intelligence in the Web3 space." By choosing crypto assets as our entity, we transform a generic CRUD exercise into a domain-relevant portfolio tracker. This demonstrates that we researched the company's mission and can build contextually appropriate solutions.

## Outcome
The database layer now uses MySQL with proper ENUM types and indexes, and the entire application speaks the language of Web3 — from API endpoints to seed data to UI labels.
