<p align="center">
  <img src="https://img.shields.io/badge/PrimeVault-Crypto%20Asset%20Management-6c5ce7?style=for-the-badge&logoColor=white" alt="PrimeVault" />
</p>

<h1 align="center">🔐 PrimeVault</h1>

<p align="center">
  <strong>A production-grade Crypto Asset Management Platform with JWT Authentication, Role-Based Access Control, and a stunning Glassmorphism React Dashboard.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?style=flat-square&logo=swagger&logoColor=black" />
  <img src="https://img.shields.io/badge/License-ISC-blue?style=flat-square" />
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-api-endpoints">API Reference</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-security">Security</a> •
  <a href="#-documentation">Docs</a>
</p>

---

## 📖 About

**PrimeVault** is a full-stack web application designed for managing crypto asset portfolios. It features a secure REST API backend with dual-token JWT authentication, granular role-based access control, and a modern React frontend with glassmorphism design aesthetics — purpose-built for the Web3 ecosystem.

> **Built as a Backend Developer Internship assignment for [Primetrade.ai](https://primetrade.ai) — redefining trading intelligence in the Web3 space.**

---

## ✨ Features

### 🔧 Backend (Primary Focus)
| Feature | Implementation |
|---------|---------------|
| 🔐 **Authentication** | Dual-token JWT strategy — short-lived access tokens (15 min) in memory + long-lived refresh tokens (7 days) in `httpOnly` cookies |
| 👥 **Role-Based Access** | Composable `requireRole()` middleware supporting `USER` and `ADMIN` roles |
| 📊 **Crypto Asset CRUD** | Full Create, Read, Update, Delete with pagination, search, category filtering, and multi-field sorting |
| ✅ **Input Validation** | Joi schemas on every endpoint with `stripUnknown` sanitization |
| 🛡️ **Security Hardening** | Helmet headers, CORS whitelist, bcrypt (12 rounds), rate limiting |
| 📚 **API Documentation** | Interactive Swagger UI (OpenAPI 3.0) + Postman Collection |
| ⚙️ **API Versioning** | All routes namespaced under `/api/v1/` for future evolution |
| 📝 **Structured Logging** | Winston with file rotation (`combined.log`, `error.log`) + colorized console |
| 🏗️ **Modular Architecture** | Feature-based modules with clear separation of concerns |
| 🐳 **Docker Ready** | Multi-container Docker Compose with MySQL, API, and Nginx-served frontend |

### 🎨 Frontend (Supportive)
| Feature | Implementation |
|---------|---------------|
| 🌌 **Glassmorphism UI** | Dark theme with `backdrop-filter: blur()`, frosted-glass cards, and layered depth |
| ✨ **Micro-Animations** | Framer Motion page transitions, staggered card reveals, interactive hover effects |
| 🔒 **Protected Routes** | JWT-based authentication with automatic silent token refresh |
| 📱 **Responsive Layout** | Adaptive sidebar + mobile-friendly design |
| 🔔 **Toast Notifications** | Real-time success/error feedback via `react-hot-toast` |
| 📋 **Dashboard Analytics** | Overview stats, recent assets, role-aware data display |

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT (React 19 + Vite)                               │
│  ├── Framer Motion · React Router · Axios               │
│  └── Glassmorphism CSS Design System                    │
├─────────────────────────────────────────────────────────┤
│  SERVER (Node.js + Express 5)                           │
│  ├── JWT Auth · RBAC Middleware · Joi Validation         │
│  ├── Swagger/OpenAPI · Winston Logger                   │
│  └── Helmet · CORS · Rate Limiter                       │
├─────────────────────────────────────────────────────────┤
│  DATABASE (MySQL 8.0 + Prisma ORM)                      │
│  └── Native ENUMs · Cascading Deletes · Indexed Queries │
├─────────────────────────────────────────────────────────┤
│  DEVOPS (Docker + Nginx)                                │
│  └── Multi-container Compose · Health Checks · Volumes  │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **MySQL** 8.0+ (or Docker)
- **npm** 9+

### Option A: Local Development

```bash
# 1. Clone the repository
git clone https://github.com/sahilsahu4102/PrimeVault.git
cd PrimeVault

# 2. Setup Backend
cd server
npm install
cp .env.example .env
# ✏️ Edit .env → set your MySQL connection string

# 3. Initialize Database
npx prisma db push        # Create tables
npx prisma generate       # Generate Prisma client
node prisma/seed.js        # Seed 65+ crypto assets & 10 users

# 4. Start API Server (port 5000)
npm run dev

# 5. Setup Frontend (new terminal)
cd ../client
npm install
npm run dev                # Starts on port 5173
```

### Option B: Docker (One Command)

```bash
docker-compose up --build
```
> This spins up MySQL 8.0, the Node.js API, and the Nginx-served React app automatically.

### 🌐 Access Points
| Service | URL |
|---------|-----|
| 🖥️ Frontend Dashboard | http://localhost:5173 |
| 📡 API Server | http://localhost:5000 |
| 📚 Swagger Documentation | http://localhost:5000/api-docs |
| 💚 Health Check | http://localhost:5000/api/v1/health |

---

## 🔑 Test Credentials

After seeding, use these accounts to test:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@primevault.ai` | `Admin123` |
| **User** | _(any seeded user)_ | `User1234` |

> Admin has full access to user management + all asset operations. Regular users can only manage their own assets.
>
> Public registration always creates a `USER`: asking for `ADMIN` answers 403 (an admin can promote someone with `PATCH /users/:id/role`). A throwaway demo deployment can switch the old behaviour on with `ALLOW_ADMIN_SIGNUP=true`.

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/register` | Public | Register a new user account |
| `POST` | `/login` | Public | Authenticate & receive tokens |
| `POST` | `/refresh` | Public | Rotate refresh token & get new access token |
| `POST` | `/logout` | Auth | Invalidate refresh token cookie |
| `GET` | `/me` | Auth | Get authenticated user's profile |

### 👥 Users (`/api/v1/users`) — Admin Only
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/` | Admin | List all users (paginated) |
| `GET` | `/:id` | Admin | Get user details by ID |
| `PATCH` | `/:id/role` | Admin | Change a user's role |
| `DELETE` | `/:id` | Admin | Delete a user account |

### 💎 Crypto Assets (`/api/v1/assets`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/` | Auth | List assets (paginated, searchable, filterable, sortable) |
| `GET` | `/:id` | Auth | Get asset details by ID |
| `POST` | `/` | Auth | Create a new crypto asset |
| `PUT` | `/:id` | Owner/Admin | Update an existing asset |
| `DELETE` | `/:id` | Owner/Admin | Delete an asset |
| `GET` | `/categories` | Auth | Get all distinct asset categories |

#### Query Parameters for `GET /assets`
```
?page=1&limit=10           → Pagination
?search=ethereum            → Full-text search (name + description)
?category=DeFi              → Filter by category
?sortBy=price&order=desc    → Sort (name, price, createdAt, stock, category)
?isActive=true              → Filter active/inactive assets
```

---

## 🏗️ Architecture

```
PrimeVault/
├── server/                             # 🔧 Backend API
│   ├── prisma/
│   │   ├── schema.prisma               # MySQL schema with native ENUMs
│   │   └── seed.js                     # Faker.js realistic data generator
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js                  # Environment validation (fail-fast)
│   │   │   ├── logger.js               # Winston multi-transport logger
│   │   │   └── swagger.js              # OpenAPI 3.0 configuration
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js       # JWT verification & token extraction
│   │   │   ├── rbac.middleware.js       # Composable role-based access
│   │   │   ├── validate.middleware.js   # Joi schema validation factory
│   │   │   └── errorHandler.js         # Global error handler (Prisma-aware)
│   │   ├── modules/
│   │   │   ├── auth/                   # Register, Login, Refresh, Logout, Me
│   │   │   ├── users/                  # User CRUD (Admin only)
│   │   │   └── assets/                 # Crypto Asset CRUD + search/filter
│   │   ├── utils/
│   │   │   ├── ApiError.js             # Custom error class with HTTP status
│   │   │   ├── ApiResponse.js          # Standardized response envelope
│   │   │   └── asyncHandler.js         # Express async error wrapper
│   │   ├── app.js                      # Express app + middleware stack
│   │   └── server.js                   # Entry point with graceful shutdown
│   ├── .env.example
│   └── Dockerfile
├── client/                             # 🎨 React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/ProtectedRoute.jsx # Route guard with role support
│   │   │   └── Layout/Layout.jsx       # Sidebar + header shell
│   │   ├── context/AuthContext.jsx      # Global auth state + auto-refresh
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx           # Animated glassmorphism login
│   │   │   ├── RegisterPage.jsx        # User registration with role select
│   │   │   ├── DashboardPage.jsx       # Stats overview + recent assets
│   │   │   ├── AssetsPage.jsx          # Full CRUD table with modals
│   │   │   └── UsersPage.jsx           # Admin user management
│   │   ├── services/api.js             # Axios instance + interceptors
│   │   ├── index.css                   # Design token system (CSS vars)
│   │   └── App.jsx                     # Router configuration
│   ├── Dockerfile
│   └── nginx.conf                      # SPA-aware Nginx config
├── docs/                               # 📖 Development Documentation
│   ├── Phase_1_Architecture_and_Foundation.md
│   ├── Phase_2_Authentication_and_Security.md
│   ├── Phase_3_RBAC_and_Business_Logic.md
│   ├── Phase_4_API_Documentation.md
│   ├── Phase_5_Frontend_Dashboard.md
│   ├── Phase_6_Database_Migration_and_Web3.md
│   ├── Phase_7_DevOps_and_Deployment.md
│   └── THINKING_AND_APPROACH.md
├── PrimeVault_API.postman_collection.json
├── docker-compose.yml
├── SCALABILITY.md
└── README.md
```

> Each module follows the pattern: `routes.js → controller.js → service.js → validation.js` — making navigation intuitive and feature extraction trivial.

---

## 🔒 Security Implementation

| Threat Vector | Mitigation |
|---------------|-----------|
| **SQL Injection** | Prisma ORM parameterizes all queries automatically |
| **XSS** | Access tokens in memory (never in DOM-accessible storage) |
| **CSRF** | `SameSite=Strict` + `httpOnly` cookies, CORS origin lock |
| **Brute Force** | Rate limiting — 100 req/15min global, stricter on auth |
| **Mass Assignment** | Joi `stripUnknown` removes unexpected payload fields |
| **Token Theft** | 15-min access tokens + automatic refresh rotation |
| **Clickjacking** | Helmet → `X-Frame-Options: DENY` |
| **MIME Sniffing** | Helmet → `X-Content-Type-Options: nosniff` |
| **Info Leakage** | Global error handler hides stack traces and the text of unexpected errors outside development (tested) |

---

## 🗄️ Database Schema

```sql
-- MySQL 8.0 with Prisma ORM

enum Role {
  USER
  ADMIN
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER)
  assets    Asset[]  -- One-to-Many with cascading delete
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Asset {
  id          Int      @id @default(autoincrement())
  name        String
  description String?  @db.Text
  volume      Float    @default(0)
  category    String
  stock       Int      @default(0)
  isActive    Boolean  @default(true)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 📖 Documentation

This project includes comprehensive phase-wise development documentation in the [`docs/`](./docs) directory:

| Document | Description |
|----------|-------------|
| [Phase 1](./docs/Phase_1_Architecture_and_Foundation.md) | Architecture decisions, tech stack selection, project scaffolding |
| [Phase 2](./docs/Phase_2_Authentication_and_Security.md) | JWT dual-token strategy, cookie security, rate limiting |
| [Phase 3](./docs/Phase_3_RBAC_and_Business_Logic.md) | RBAC middleware, CRUD operations, ownership enforcement |
| [Phase 4](./docs/Phase_4_API_Documentation.md) | Swagger setup, Postman collection, health monitoring |
| [Phase 5](./docs/Phase_5_Frontend_Dashboard.md) | Glassmorphism UI, auth flow, dashboard implementation |
| [Phase 6](./docs/Phase_6_Database_Migration_and_Web3.md) | MySQL migration, Web3 theming, realistic data seeding |
| [Phase 7](./docs/Phase_7_DevOps_and_Deployment.md) | Docker, Nginx, CI/CD readiness, scalability |
| [Thinking & Approach](./docs/THINKING_AND_APPROACH.md) | Engineering philosophy, trade-off analysis, security threat model |
| [Scalability](./SCALABILITY.md) | Horizontal scaling, Redis caching, microservice decomposition |

---

## 📈 Scalability Roadmap

See [`SCALABILITY.md`](./SCALABILITY.md) for detailed strategies on:

- ⚖️ Horizontal scaling with stateless API servers behind a load balancer
- ⚡ Redis caching for asset listings (70% DB load reduction)
- 🔌 Microservice extraction with zero-downtime migration path
- 🔄 CI/CD pipeline with GitHub Actions
- 📊 Observability with Prometheus + Grafana
- ☸️ Kubernetes orchestration for auto-scaling

---

## 🧪 Automated Tests

```bash
cd server
docker run -d --name pv-test-mysql -e MYSQL_ROOT_PASSWORD=pw -e MYSQL_DATABASE=primevault_test -p 3307:3306 mysql:8.4
DATABASE_URL=mysql://root:pw@127.0.0.1:3307/primevault_test npx prisma db push   # PowerShell: $env:DATABASE_URL = "..."
npm test        # 44 tests, about 15 seconds
```

The suite uses Node's built-in test runner (no extra dependencies) and talks to the real API over HTTP. It **never reads `DATABASE_URL` from `.env`**: it uses `TEST_DATABASE_URL`, or the Docker database above, and refuses to start on any database whose name does not contain "test". Every user a test creates is deleted afterwards.

| File | Tests | What it covers |
|------|------:|----------------|
| `tests/unit.test.js` | 15 | Joi rules (password strength, trimming, lower-cased email), mass-assignment stripping, the asset and query schemas, the role guard, access-token checks (missing, malformed, forged, expired, unsigned `alg: none`), and the error handler (duplicate and missing rows, no message or stack leaked on a 500) |
| `tests/api.test.js` | 25 | Register, login (same 401 for a wrong password and an unknown email), `/me`, deleted-user tokens, refresh-token rotation (the old token stops working), logout; `USER` versus `ADMIN` on the user routes; asset create, read, update, delete with owner-or-admin permission; pagination, search, category filter, sorting; health, 404, security headers, CORS, body-size limit, Swagger |
| `tests/rate-limit.test.js` | 2 | The 21st sign-in attempt and the 101st request in 15 minutes get 429, with the rate-limit headers |
| `tests/deployment.test.js`, `tests/admin-signup.test.js` | 2 | The refresh cookie is `Secure` in production; admin sign-up works only when `ALLOW_ADMIN_SIGNUP=true` |

Writing these found four real bugs, all fixed: public registration could create an `ADMIN` (it now answers 403 unless the deployment sets `ALLOW_ADMIN_SIGNUP=true`, and the register form no longer offers a role); the refresh cookie's `Secure` flag was compared with the string `'assetion'` (a find-and-replace accident), so it was never set in production; asset create, update and sort used `price` where the Prisma field is `volume`; and the error handler returned the raw message of unexpected errors to the client. Against the code before the fixes, 10 of the 44 tests fail. GitHub Actions runs everything on each push against a MySQL service container, and also builds the React client.

**Not tested:** the React client has no tests (CI only builds it), there is no load test, and the refresh cookie is `SameSite=Strict`, which a browser will not send when the client and the API are on different sites, so silent refresh across a Vercel-style client and a separate API host has not been verified.

---

## 🧪 Testing the API by Hand

### Using Swagger UI
1. Navigate to `http://localhost:5000/api-docs`
2. Click **"Authorize"** and paste your JWT access token
3. Explore and test every endpoint interactively

### Using Postman
1. Import `PrimeVault_API.postman_collection.json` into Postman
2. Set the `BASE_URL` variable to `http://localhost:5000`
3. Login first, then copy the access token to the `ACCESS_TOKEN` variable

---

## 👨‍💻 Author

**Sahil Sahu**  
Backend Developer Intern Candidate  

---

<p align="center">
  <sub>Built with ❤️ for Primetrade.ai — redefining trading intelligence in the Web3 space</sub>
</p>
