# StudyOS Authentication Architecture

## 1. Authentication Philosophy
StudyOS enforces industry standard token security with short-lived JSON Web Tokens (JWT) for stateless API access combined with stateful, rotating, database-backed refresh tokens sent exclusively over HttpOnly, Secure, SameSite cookies.

---

## 2. Token Specifications

| Token Type | Lifespan | Storage Medium | Payload / Contents | Revocability |
|---|---|---|---|---|
| **Access Token** | 15 Minutes | In-Memory (Axios memory / Redux session) | `{ userId, email, role, profileId, iat, exp }` | Short expiry (stateless) |
| **Refresh Token** | 7 Days | `HttpOnly`, `Secure`, `SameSite=Lax` Cookie (`/api/v1/auth`) | 64-character random cryptotoken (SHA-256 hashed in DB) | Instant via DB revocation |

---

## 3. Detailed Authentication Workflows

### 3.1 Registration Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Next.js Client
    participant API as Express API
    participant DB as PostgreSQL (Prisma)

    User->>Frontend: Enter Name, Email, Password, Role (Student/Parent/Teacher)
    Frontend->>API: POST /api/v1/auth/register
    API->>API: Validate input (Zod)
    API->>DB: Check email uniqueness
    API->>API: Hash password (bcrypt / argon2, cost=12)
    API->>DB: Create User + Role Profile within Prisma Transaction
    API->>API: Issue Access Token + Cryptographic Refresh Token
    API->>DB: Store SHA-256 hash of refresh token
    API-->>Frontend: Set-Cookie (HttpOnly, Secure) + Response JSON { user, accessToken }
    Frontend-->>User: Navigate to Role Dashboard
```

### 3.2 Login Flow
1. Client calls `POST /api/v1/auth/login` with `{ email, password }`.
2. Rate-limiter checks IP/Email attempts (max 5 failed attempts per 15 min window).
3. Backend validates credentials against stored password hash.
4. Generates a fresh access token (15m) and a 64-byte refresh token.
5. Hashes the refresh token and saves to `RefreshToken` table with `expiresAt = now + 7d`.
6. Sets `studyos_refresh` cookie with flags: `HttpOnly=true`, `Secure=true` (in prod), `SameSite=Lax`, `Path=/api/v1/auth`.
7. Returns user profile, permissions, and `accessToken`.

### 3.3 Silent Token Refresh & Race Condition Prevention
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as Next.js App / Redux
    participant Axios as Axios Interceptor
    participant API as Express Auth API

    App->>Axios: Call /api/v1/tasks
    Axios->>API: GET /api/v1/tasks (Expired Access Token)
    API-->>Axios: 401 Unauthorized
    Note over Axios: Pause concurrent requests in failedQueue
    Axios->>API: POST /api/v1/auth/refresh (Cookie automatically included)
    API->>API: Verify Refresh Token Hash in DB & check active status
    API->>API: Rotate: Revoke old token & generate new token pair
    API-->>Axios: Set-Cookie (New Refresh Token) + { accessToken: new_jwt }
    Note over Axios: Flush failedQueue with new accessToken
    Axios->>API: Retry GET /api/v1/tasks with new Bearer token
    API-->>App: 200 OK (Tasks payload)
```

---

## 4. Frontend Auth State Management
- Stored in Redux `authSlice`:
  - `user`: Safe user representation (`id`, `email`, `role`, `firstName`, `lastName`, `avatarUrl`, `profileId`).
  - `isAuthenticated`: Boolean.
  - `isLoading`: Boolean.
- The refresh token is **NEVER** stored in Redux, `localStorage`, or `sessionStorage`.
- On application bootstrap, `useAuth` invokes `/api/v1/auth/me` to hydrate session seamlessly if a valid refresh cookie exists.
