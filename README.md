# StudyOS — The Academic Operating System 🎓

> **A production-grade, full-stack student productivity and academic management platform** built with Next.js 14 (App Router), Express.js, PostgreSQL, Prisma ORM, Redux Toolkit, Tailwind CSS, and Recharts.

---

## 🌟 Executive Summary & Vision

**StudyOS** is an all-in-one SaaS platform designed to replace fragmented tools (spreadsheets, paper planners, disconnected timer apps, flashcard tools) with a cohesive, enterprise-quality academic operating system.

It provides tailor-made interfaces for:
1. **Students** — Course hierarchy, syllabus progress tracking, tasks & homework deadlines, exam weightage calculators, weekly timetable, attendance analytics, Markdown notes vault, interactive Pomodoro focus timer, active recall quizzes, and an integrated AI Study Assistant.
2. **Parents / Guardians** — Privacy-isolated supervision portal to monitor multiple children's study hours, exam milestones, attendance percentage, and academic consistency.
3. **Teachers / Educators** — Course curriculum management and quiz design.
4. **Administrators** — Platform diagnostics, system health telemetry, and full user directory access control.

---

## 🏗️ Architecture & Tech Stack

```
                               ┌─────────────────────────────┐
                               │  StudyOS Next.js Frontend   │
                               │  (App Router, Tailwind, RTK)│
                               └──────────────┬──────────────┘
                                              │ HTTP / JSON + HttpOnly Cookie
                                              ▼
                               ┌─────────────────────────────┐
                               │  StudyOS Express.js Backend │
                               │  (RBAC, RateLimiter, Zod)   │
                               └──────────────┬──────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
      ┌─────────────────────────────┐                   ┌─────────────────────────────┐
      │     PostgreSQL Database     │                   │     Pluggable AI Engine     │
      │    (Prisma ORM Schema)      │                   │  (Tutor, Quiz, Summarizer)  │
      └─────────────────────────────┘                   └─────────────────────────────┘
```

### **Backend Layer**
- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js with modular Controller-Service-Routes-Schema pattern
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Security & Auth**: Dual-token JWT (15-minute access token + 7-day HttpOnly refresh token rotation), Argon2 password hashing, Helmet headers, CORS whitelist, and strict IP rate limiting
- **Validation**: Zod schema validation middleware
- **Documentation**: OpenAPI 3.0 / Swagger UI at `/api-docs`

### **Frontend Layer**
- **Framework**: Next.js 14 (App Router) with TypeScript
- **State Management**: Redux Toolkit & Typed Hooks
- **Styling**: Tailwind CSS with custom Dark/Light theme switching
- **Forms**: React Hook Form with Zod resolvers
- **Data Visualization**: Recharts (7-day study velocity, subject time distribution, syllabus completion)
- **Icons**: Lucide React

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v14.0 or higher (or Docker)
- **Package Manager**: npm or yarn

### 2. Clone & Install Dependencies
```bash
# Clone repository
git clone https://github.com/your-org/StudyOS.git
cd StudyOS

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

#### **Backend (`backend/.env`)**:
```env
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:3000

# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/studyos_db?schema=public"

# Authentication Secrets
JWT_ACCESS_SECRET="studyos_super_secret_access_jwt_key_2026_xyz"
JWT_REFRESH_SECRET="studyos_super_secret_refresh_jwt_key_2026_abc"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

#### **Frontend (`frontend/.env.local`)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 4. Database Setup & Seeding

```bash
cd backend

# Run Prisma database migrations
npx prisma migrate dev --name init

# Seed realistic demo database (Students, Parents, Teachers, Admins, Subjects, Quizzes, Tasks)
npm run seed
```

---

## 🔑 Demo Login Accounts

All seed accounts are initialized with password: **`StudyOS@123456`**

| Role | Email Address | Description |
| :--- | :--- | :--- |
| **Student** | `student@studyos.com` | Full student workspace (Rahul Sharma) with enrolled courses, tasks, timer, and notes |
| **Parent** | `parent@studyos.com` | Guardian portal (Rajesh Sharma) linked to Rahul Sharma's progress |
| **Teacher** | `teacher@studyos.com` | Educator account (Dr. Jenkins) |
| **Admin** | `admin@studyos.com` | Platform administrator with user management & system telemetry |

> 💡 **Tip**: On the `/login` page, you can click any of the **1-Click Demo Account** buttons to instantly fill credentials.

---

## 💻 Running the Application

### Start Backend API Server
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
# Swagger UI available at http://localhost:5000/api-docs
```

### Start Frontend Web Application
```bash
cd frontend
npm run dev
# Web application will run on http://localhost:3000
```

---

## 🧪 Testing & Validation

### Backend Unit & Integration Tests (Jest)
```bash
cd backend
npm run test
```
*Executes comprehensive test suites validating password hashing, JWT token rotation, and RBAC authorization guards.*

### Frontend TypeScript & Build Verification
```bash
cd frontend
npm run typecheck
npm run build
```

---

## 📚 Complete Project Documentation

Detailed system architecture and reference specifications are available in the `/docs` directory:

- 📖 [`docs/architecture.md`](./docs/architecture.md) — Architectural patterns, layers, and security model
- 🗄️ [`docs/database.md`](./docs/database.md) — PostgreSQL ERD, indexing strategies, and Prisma models
- 🌐 [`docs/api.md`](./docs/api.md) — RESTful API endpoint catalog and response schemas
- 🔒 [`docs/authentication.md`](./docs/authentication.md) — Token rotation and session lifecycle
- 🛡️ [`docs/authorization.md`](./docs/authorization.md) — Role-Based Access Control and parent tenant isolation
- 🎨 [`docs/frontend.md`](./docs/frontend.md) — Component hierarchy, state slices, and UI guidelines
- 🗺️ [`docs/development-plan.md`](./docs/development-plan.md) — 16-phase production roadmap and verification criteria

---

## 📋 Feature Highlights

- 🎯 **Academic Hierarchy**: Subjects $\rightarrow$ Units $\rightarrow$ Topics with dynamic real-time progress calculations.
- ⏱️ **Focus Engine**: 25/5 Pomodoro & 50/10 Deep Work timer automatically linked to courses.
- 📊 **Visual Analytics**: Interactive Recharts graphs showing 7-day study consistency, task completion velocity, and subject distributions.
- 🗂️ **Spaced Repetition & Quizzes**: Active recall flashcards with 5-level SM-2 inspired mastery intervals and auto-graded MCQ tests.
- 🤖 **AI Study Assistant**: AI Concept Tutor, automated practice quiz builder, Markdown note summarizer, and 14-day exam revision roadmap generator.
- 🛡️ **Parent Portal**: Secure multi-child monitor with strict tenant-level authorization checks.
- ⚡ **Productivity Tools**: Global `Ctrl + K` search palette, theme switching (Light / Dark mode), responsive mobile bottom nav.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
