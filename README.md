# 🚀 PrimeVault API

A **production-grade REST API** with JWT Authentication, Role-Based Access Control, and a modern React frontend dashboard.

> Built for the PrimeVault.ai Backend Developer Internship Assignment.

![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-white?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

---

## ✨ Features

### Backend
- 🔐 **JWT Authentication** — Access + Refresh token strategy with httpOnly cookies
- 👤 **Role-Based Access Control** — User vs Admin with composable middleware
- 📦 **Product CRUD** — Full CRUD with pagination, search, filter, sort
- 🛡️ **Security** — Helmet, CORS, rate limiting, bcrypt (12 rounds), input validation (Joi)
- 📚 **API Documentation** — Interactive Swagger UI at `/api-docs`
- 📊 **Structured Logging** — Winston with file + console transports
- ⚙️ **API Versioning** — All routes under `/api/v1/`
- 🏗️ **Modular Architecture** — Feature-based project structure
- 🐳 **Docker Ready** — Docker Compose with PostgreSQL

### Frontend
- 🎨 **Glassmorphism Design** — Dark theme with blur effects and gradients
- ✨ **Framer Motion Animations** — Page transitions, micro-interactions
- 🔒 **Protected Routes** — JWT-based with auto-refresh
- 📱 **Responsive** — Works on desktop, tablet, and mobile
- 🔔 **Toast Notifications** — Success/error feedback for all operations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | Express.js |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Validation | Joi |
| Docs | Swagger (OpenAPI 3.0) |
| Logging | Winston |
| Frontend | React 19 + Vite |
| Animations | Framer Motion |
| Containerization | Docker + Docker Compose |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ (or Docker)
- npm

### 1. Clone & Install

```bash
git clone <repo-url>
cd primevault

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Setup Database

```bash
cd server

# Copy environment file
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed demo data
node prisma/seed.js
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend (port 5000)
cd server
npm run dev

# Terminal 2 - Frontend (port 5173)
cd client
npm run dev
```

### 4. Open in Browser
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/api/v1/health

### 🐳 Docker (Alternative)
```bash
docker-compose up --build
```

---

## 📧 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@primevault.ai | Admin123 |
| User | user@primevault.ai | User1234 |

---

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Register new user |
| POST | `/api/v1/auth/login` | Public | Login with credentials |
| POST | `/api/v1/auth/refresh` | Public | Refresh access token |
| POST | `/api/v1/auth/logout` | Auth | Logout & invalidate refresh token |
| GET | `/api/v1/auth/me` | Auth | Get current profile |

### Users (Admin Only)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/users` | Admin | List users (paginated) |
| GET | `/api/v1/users/:id` | Admin | Get user by ID |
| PATCH | `/api/v1/users/:id/role` | Admin | Update user role |
| DELETE | `/api/v1/users/:id` | Admin | Delete user |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/products` | Auth | List products (paginated, filterable) |
| GET | `/api/v1/products/:id` | Auth | Get product by ID |
| POST | `/api/v1/products` | Auth | Create product |
| PUT | `/api/v1/products/:id` | Owner/Admin | Update product |
| DELETE | `/api/v1/products/:id` | Owner/Admin | Delete product |
| GET | `/api/v1/products/categories` | Auth | Get distinct categories |

---

## 🏗️ Project Structure

```
primevault/
├── server/                         # Backend API
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   └── seed.js                 # Demo data seed
│   ├── src/
│   │   ├── config/                 # Environment, logger, swagger
│   │   ├── middleware/             # Auth, RBAC, validation, error handler
│   │   ├── modules/
│   │   │   ├── auth/               # Authentication module
│   │   │   ├── users/              # User management module
│   │   │   └── products/           # Product CRUD module
│   │   ├── utils/                  # ApiError, ApiResponse, asyncHandler
│   │   ├── app.js                  # Express app setup
│   │   └── server.js               # Entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── client/                         # React Frontend
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   ├── context/                # Auth context
│   │   ├── pages/                  # Page components
│   │   ├── services/               # API service
│   │   ├── App.jsx                 # Router setup
│   │   ├── index.css               # Design system
│   │   └── main.jsx                # Entry point
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── SCALABILITY.md
└── README.md
```

---

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Strategy**: Short-lived access tokens (15min) + long-lived refresh tokens (7 days)
- **Refresh Token Storage**: httpOnly, secure, sameSite cookies
- **Rate Limiting**: 100 req/15min general, 20 req/15min on auth endpoints
- **Input Validation**: Joi schemas on every endpoint with sanitization
- **Security Headers**: Helmet middleware
- **CORS**: Configured whitelist
- **Error Handling**: Global error handler with no information leakage in production

---

## 📈 Scalability

See [SCALABILITY.md](./SCALABILITY.md) for detailed notes on:
- Horizontal scaling & load balancing
- Redis caching strategy
- Microservices migration path
- Kubernetes deployment
- CI/CD pipeline
- Monitoring & observability

---

## 📄 License

ISC
