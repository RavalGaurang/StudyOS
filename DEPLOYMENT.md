# 🚀 StudyOS 100% Free Production Deployment Guide

This guide walks you through deploying **StudyOS** (Frontend + Backend + PostgreSQL Database) completely **FREE** with 0 server costs using modern cloud providers.

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│               Frontend (Next.js 14)                    │
│            Hosted on VERCEL (Free Tier)                │
│             https://studyos.vercel.app                 │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / REST API
┌──────────────────────────▼─────────────────────────────┐
│             Backend API (Node.js/Express)              │
│            Hosted on RENDER (Free Web Service)         │
│          https://studyos-backend.onrender.com          │
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
   | `FRONTEND_URL` | `https://your-studyos-frontend.vercel.app` *(update after Step 4)* |

6. Click **"Deploy Web Service"**.
7. Render will build your backend, connect to PostgreSQL, push the schema, run demo seed data, and start the API!
8. Copy your live Backend URL (e.g. `https://studyos-backend.onrender.com`).

---

## 💻 Step 4: Deploy Frontend Web App on Vercel (Free)

1. Go to **[https://vercel.com](https://vercel.com)** and log in with your GitHub account.
2. Click **"Add New..."** $\rightarrow$ Select **"Project"**.
3. Import your **`RavalGaurang/StudyOS`** repository.
4. In the Project Setup screen:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** $\rightarrow$ Select **`frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Expand **"Environment Variables"** and add:
   | Key | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://studyos-5r51.onrender.com/api/v1` *(Your Render backend URL + `/api/v1`)* |

6. Click **"Deploy"**.
7. In ~60 seconds, Vercel will give you a live production URL (e.g. `https://studyos-gaurang.vercel.app`) with free global CDN and SSL!

---

## 🔄 Step 5: Final CORS Sync

Go back to your **Render.com** backend dashboard $\rightarrow$ **Environment Variables** $\rightarrow$ Set `FRONTEND_URL` to your live Vercel URL (e.g. `https://studyos-gaurang.vercel.app`) so secure cookies and CORS requests are accepted.

---

## 🎉 You're Live!
Your full-stack commercial SaaS platform is now running in production on 100% free cloud infrastructure!
