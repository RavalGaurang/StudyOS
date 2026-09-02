# StudyOS Architecture Design

## 1. Executive Summary
StudyOS is a commercial-grade, multi-role academic management and productivity SaaS platform designed for Students, Parents, Teachers, and Administrators. It unifies academic course management, daily productivity workflows, study timer/pomodoro tracking, knowledge management (notes, flashcards, quizzes), analytics, and AI assistance into a cohesive operating system.

---

## 2. System Architecture & Topology

```
+-------------------------------------------------------------------------+
|                                CLIENT TIER                              |
|  Next.js 14+ (App Router) | React | TypeScript | Redux Toolkit | Tailwind |
|  - Role-based Layouts (Student, Parent, Admin)                          |
|  - Design System (Atomic UI Components, Reusable Form Controls)        |
|  - Recharts Visualizations & Interactive Pomodoro Engine               |
+------------------------------------+------------------------------------+
                                     |
                                     | HTTP / JSON / Secure Cookies
                                     v
+-------------------------------------------------------------------------+
|                             API GATEWAY / PROXY                         |
|  CORS, Helmet Headers, Rate Limiting (express-rate-limit), Compression  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                               BACKEND TIER                              |
|  Node.js + Express.js + TypeScript (Modular Layered Architecture)        |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | Middleware: Auth (JWT), RBAC Guard, Zod Validator, Error Handler  |  |
|  +---------------------------------+---------------------------------+  |
|                                    |                                    |
|  +---------------------------------v---------------------------------+  |
|  | Controllers: HTTP req/res, DTO parsing, response envelopes         |  |
|  +---------------------------------+---------------------------------+  |
|                                    |                                    |
|  +---------------------------------v---------------------------------+  |
|  | Services: Business logic, authorization rules, transactions       |  |
|  +---------------------------------+---------------------------------+  |
|                                    |                                    |
|  +---------------------------------v---------------------------------+  |
|  | Data Layer: Prisma ORM, Query Optimization, Connection Pooling   |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                               DATABASE TIER                             |
|  PostgreSQL 16 (Relational models, UUID keys, compound indexes, FKs)   |
+-------------------------------------------------------------------------+
```

---

## 3. Design Principles & Patterns

1. **Layered Architecture (Separation of Concerns)**:
   - **Routes**: Define endpoints and bind middleware.
   - **Controllers**: Handle HTTP semantics, call validator schemas, invoke services, and wrap responses in standardized envelopes.
   - **Services**: Contain pure business logic, access control assertions, aggregate computations, and Prisma transactions.
   - **Prisma Client**: Typed database access layer.
2. **KISS & Pragmatic Simplicity**:
   - Avoid over-engineered generic abstractions (e.g. `UniversalCrudFactory`).
   - Domain-specific services with explicit methods (e.g. `taskService.getStudentTasks()`, `studyService.logSession()`).
3. **Defense-in-Depth Security**:
   - Never trust client IDs or roles. Verify all resource ownership inside the service layer.
   - Access tokens are short-lived (15 minutes).
   - Refresh tokens are long-lived (7 days), hashed with SHA-256 before database storage, rotated upon every refresh, and transported exclusively via `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
4. **Calculated Aggregates Over Derived Redundancy**:
   - Store raw records (study sessions, attendance marks, topic completion status) and compute live metrics (percentages, total hours) dynamically.
   - Avoid data staleness and synchronization bugs.

---

## 4. Scalability & Performance

- **Database Connection Pooling**: Prisma connection pool tuned for production concurrency.
- **Selective Indexing**: Targeted compound indexes on high-frequency query pairs (`[studentId, status]`, `[studentId, dueDate]`, `[userId, isRead]`).
- **Paginated Endpoints**: All list queries support `page`, `limit`, `search`, `sortBy`, and `sortOrder`.
- **Frontend Optimization**:
  - Debounced search queries on filters.
  - Granular Redux state slices preventing cascade re-renders.
  - Next.js dynamic routing with route-level code splitting.

---

## 5. Security & Compliance Architecture

- **Helmet**: Secures HTTP headers (XSS filter, frameguard, HSTS).
- **CORS**: Strict origin whitelist for trusted frontend domains.
- **Rate Limiting**: Tiered rate limiters for authentication endpoints vs general API endpoints.
- **Input Sanitization & Validation**: Strict Zod schemas for `body`, `query`, and `params`.
- **Audit Trails**: Error logger with correlation IDs and safe masking of credentials and personal identifiers.
