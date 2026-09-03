# 🚀 StudyOS 100% Free Production Deployment Guide

This guide walks you through deploying **StudyOS** (Frontend + Backend + PostgreSQL Database) completely **FREE** with 0 server costs using modern cloud providers.

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│               Frontend (Next.js 16)                    │
│            Hosted on VERCEL (Free Tier)                │
│   https://study-os-raval-gauarngs-projects.vercel.app     │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / REST API
┌──────────────────────────▼─────────────────────────────┐
│             Backend API (Node.js/Express)              │
│            Hosted on RENDER (Free Web Service)         │
│          https://studyos-5r51.onrender.com             │
└──────────────────────────┬─────────────────────────────┘
                           │ SSL Connection String
┌──────────────────────────▼─────────────────────────────┐
│          PostgreSQL Database (Prisma ORM)              │
│       Hosted on NEON.TECH / RENDER POSTGRES            │
│                 (100% Free Tier)                       │
└────────────────────────────────────────────────────────┘
```

---

## 📋 Step 1: Push Code to GitHub

Your code is pushed to:
👉 **`https://github.com/RavalGaurang/StudyOS.git`**

---

## 🐘 Step 2: Set Up Free PostgreSQL Database (Neon.tech or Render)

### Option A: Neon.tech (Recommended — Fastest & Generous Free Tier)
1. Go to **[https://neon.tech](https://neon.tech)** and sign up / log in with your GitHub account.
2. Click **"Create a project"** $\rightarrow$ Name it `studyos-db`.
3. Select your preferred region (e.g. AWS US East / Asia).
4. Neon will immediately give you a `DATABASE_URL` connection string that looks like:
   ```
   postgresql://gaurang:password@ep-cool-cloud-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Copy this URL — you will use it in Step 3!

---

## 🚀 Step 3: Deploy Backend API on Render.com (Free)

1. Go to **[https://render.com](https://render.com)** and sign up with your GitHub account.
2. Click **"New +"** in the top right $\rightarrow$ Select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** $\rightarrow$ Connect your repository **`RavalGaurang/StudyOS`**.
4. Configure the Web Service settings:
   - **Name**: `studyos-backend`
   - **Region**: Oregon (US West) or Ohio (US East)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma db push && npm run seed && npm run start`
   - **Instance Type**: **Free**

5. Under **"Environment Variables"**, add:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `DATABASE_URL` | *(Your Neon.tech connection string from Step 2)* |
   | `JWT_ACCESS_SECRET` | `studyos_super_secret_jwt_access_key_prod_2026` |
   | `JWT_REFRESH_SECRET` | `studyos_super_secret_jwt_refresh_key_prod_2026` |
   | `JWT_ACCESS_EXPIRES_IN` | `15m` |
   | `JWT_REFRESH_EXPIRES_IN` | `7d` |
   | `FRONTEND_URL` | `https://study-os-raval-gauarngs-projects.vercel.app` |

6. Click **"Deploy Web Service"**.
7. Render will build your backend, connect to PostgreSQL, push the schema, run demo seed data, and start the API!
8. Copy your live Backend URL (e.g. `https://studyos-5r51.onrender.com`).

---

## 💻 Step 4: Frontend Web App on Vercel

Your frontend uses your existing Vercel project **`study-os`** under team **`raval-gauarngs-projects`**.

### 1. Stable Production Domain vs Deployment URLs
- **Stable Production URL**: `https://study-os-raval-gauarngs-projects.vercel.app`
- **Unique Deployment URLs** (e.g. `https://study-xxxx-raval-gauarngs-projects.vercel.app`): Generated for each build for logs and inspection. Do NOT use or share these as the app URL.

### 2. Vercel Project Settings Verification
1. **Domains**: In Vercel Project Settings $\rightarrow$ **Domains**, confirm `study-os-raval-gauarngs-projects.vercel.app` is assigned to **Production** (Branch: `main`).
2. **Git**: In Vercel Project Settings $\rightarrow$ **Git**, verify **Production Branch** is set to `main`.
3. **Deployment Protection**: In Vercel Project Settings $\rightarrow$ **Deployment Protection**, ensure **Vercel Authentication** is **Disabled** for Production Deployments (or set to *Only Preview Deployments*). This ensures `/dashboard` is publicly reachable and protected by your application's own authentication instead of prompting "Log in to Vercel".
4. **Environment Variables**:
   | Key | Value | Target |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_APP_ENV` | `production` | Production, Preview |
   | `NEXT_PUBLIC_APP_URL` | `https://study-os-raval-gauarngs-projects.vercel.app` | Production |
   | `NEXT_PUBLIC_API_URL` | `https://studyos-5r51.onrender.com/api/v1` | Production, Preview |
   | `NEXT_PUBLIC_APP_NAME` | `StudyOS` | Production, Preview |

### 3. Future Deployment Workflow

Pushing commits to `main` automatically updates the same production URL:
```bash
git add .
git commit -m "Update application"
git push origin main
```

If deploying via Vercel CLI, deploy directly to production using:
```bash
npx vercel --prod
```
*(Running `vercel` without `--prod` only creates a preview deployment and will not update the production domain).*

---

## 🔄 Step 5: Final CORS Sync

In your **Render.com** backend dashboard $\rightarrow$ **Environment Variables** $\rightarrow$ Set `FRONTEND_URL` to `https://study-os-raval-gauarngs-projects.vercel.app`.

---

## 🎉 You're Live!
Your full-stack commercial SaaS platform is running in production on `https://study-os-raval-gauarngs-projects.vercel.app`!
