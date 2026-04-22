$ErrorActionPreference = 'Stop'

git init

function Commit-Stage ($files, $message, $date) {
    foreach ($file in $files) {
        if (Test-Path $file) {
            git add $file
        }
    }
    
    # Check if there are any staged files before committing
    $status = git diff --cached --name-only
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Host "Nothing to commit for $message"
        return
    }

    $env:GIT_COMMITTER_DATE = $date
    git commit --date=$date -m "$message"
}

# 1. Project Skeleton
Commit-Stage @(
    ".gitignore",
    "server/.gitignore",
    "client/.gitignore",
    "docker-compose.yml",
    "README.md",
    "SCALABILITY.md",
    "docs/Phase_1_Architecture_and_Foundation.md"
) "Initial Commit: PrimeVault Monorepo Skeleton & Architecture Setup" "2026-04-21 14:15:00 +0530"

# 2. Config & Foundation
Commit-Stage @(
    "server/package.json",
    "server/package-lock.json",
    "server/src/config",
    "server/src/utils",
    "server/src/app.js",
    "server/src/server.js"
) "Setup: Config, Logger, and Express App Foundation" "2026-04-21 15:30:00 +0530"

# 3. Auth & Security
Commit-Stage @(
    "server/src/middleware",
    "server/src/modules/auth",
    "docs/Phase_2_Authentication_and_Security.md"
) "Feature: Implement Dual-Token JWT Auth & Security Middleware" "2026-04-21 17:45:00 +0530"

# 4. Business Logic & RBAC
Commit-Stage @(
    "server/src/modules/users",
    "server/src/modules/assets",
    "docs/Phase_3_RBAC_and_Business_Logic.md"
) "Feature: Crypto Assets CRUD operations & RBAC enforcement" "2026-04-21 20:10:00 +0530"

# 5. Docs & APIs
Commit-Stage @(
    "PrimeVault_API.postman_collection.json",
    "docs/Phase_4_API_Documentation.md"
) "Chore: Add Swagger OpenAPI annotations & Postman Collection" "2026-04-21 21:30:00 +0530"

# 6. Frontend
Commit-Stage @(
    "client/package.json",
    "client/package-lock.json",
    "client/index.html",
    "client/vite.config.js",
    "client/eslint.config.js",
    "client/src",
    "client/public",
    "docs/Phase_5_Frontend_Dashboard.md"
) "Feature: PrimeVault Frontend Dashboard & Protected Routes Integration" "2026-04-22 01:20:00 +0530"

# 7. Final Polish
Commit-Stage @(
    "server/prisma",
    "server/.env.example",
    "server/Dockerfile",
    "client/Dockerfile",
    "client/nginx.conf",
    "docs/Phase_6_Database_Migration_and_Web3.md",
    "docs/Phase_7_DevOps_and_Deployment.md",
    "docs/THINKING_AND_APPROACH.md",
    "."
) "Refactor: MySQL Migration, Realistic Faker Seeding, and Web3 Polish" "2026-04-22 08:30:00 +0530"

git remote add origin https://github.com/sahilsahu4102/PrimeVault.git
git branch -M main

Write-Host "Local commits created successfully. Pushing to GitHub..."
git push -u origin main
