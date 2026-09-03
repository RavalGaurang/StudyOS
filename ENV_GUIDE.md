# 🔐 StudyOS Environment Variables Guide

This document provides a reference for all environment variables used across the **Backend**, **Frontend**, and **Database** for both **Development (Local)** and **Production (Cloud)**.

---

## 🛠️ 1. Local Development Environments

### 🚀 Backend (`backend/.env.development` or `backend/.env`)
```env
# Server
NODE_ENV=development
PORT=5000

# Local PostgreSQL Database
DATABASE_URL="postgresql://postgres:GRDB%401234%24%24%25%25%5E%5E*%28%40%29@localhost:5432/studyos_db?schema=public"

# Dual JWT Authentication Secrets
JWT_ACCESS_SECRET="studyos_dev_jwt_access_secret_key_2026_super_secure_32chars"
JWT_REFRESH_SECRET="studyos_dev_jwt_refresh_secret_key_2026_super_secure_32chars"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Local Frontend CORS URL
FRONTEND_URL="http://localhost:3000"

# AI Provider (mock / openai / gemini)
AI_PROVIDER="mock"
AI_API_KEY=""
```

### 💻 Frontend (`frontend/.env.development` or `frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## ☁️ 2. Cloud Production Environments

### 🚀 Backend (Render.com Environment Variables)
| Variable Key | Production Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations & secure cookies |
| `PORT` | `5000` | Backend port |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_am3DeAspV1Od@ep-divine-lab-aee4vv0u-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require` | Live Neon.tech PostgreSQL connection |
| `JWT_ACCESS_SECRET` | `studyos_prod_jwt_access_secret_key_2026_super_secure_32chars` | Encrypts 15m short-lived access tokens |
| `JWT_REFRESH_SECRET` | `studyos_prod_jwt_refresh_secret_key_2026_super_secure_32chars` | Encrypts 7d HttpOnly refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifespan |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifespan |
| `FRONTEND_URL` | `https://study-raval-gauarngs-projects.vercel.app` | Allowed CORS origin |
| `AI_PROVIDER` | `mock` | Pluggable AI engine |

---

### 💻 Frontend (Vercel.com Environment Variables)
| Variable Key | Production Value | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | `https://study-raval-gauarngs-projects.vercel.app` | Stable Production Domain for client redirects & metadata |
| `NEXT_PUBLIC_API_URL` | `https://studyos-5r51.onrender.com/api/v1` | Points browser Axios client to live Render backend API gateway |
| `NEXT_PUBLIC_APP_NAME` | `StudyOS` | Application branding name |
