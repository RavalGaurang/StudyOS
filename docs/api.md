# StudyOS API Specification & Standards

## 1. API Protocol & Base URLs

- **Protocol**: HTTPS / REST
- **Base Prefix**: `/api/v1`
- **Content Type**: `application/json`

---

## 2. Standard Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 54,
    "totalPages": 3
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Title is required and must be at least 3 characters"
    }
  ]
}
```

---

## 3. Endpoints Matrix

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register new user + auto-create role profile | None |
| `POST` | `/auth/login` | Login with email/password; issue access token + HttpOnly cookie | None |
| `POST` | `/auth/refresh` | Rotate refresh token; issue new access token + new cookie | Cookie |
| `POST` | `/auth/logout` | Revoke active refresh token; clear cookie | JWT |
| `GET` | `/auth/me` | Fetch authenticated user profile & preferences | JWT |
| `POST` | `/auth/forgot-password` | Request password reset token | None |
| `POST` | `/auth/reset-password` | Reset password using valid reset token | None |

### Subjects & Academic Hierarchy (`/api/v1/subjects`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/subjects` | List subjects with units count, completion stats | STUDENT, PARENT |
| `POST` | `/subjects` | Create a new subject | STUDENT |
| `GET` | `/subjects/:id` | Get subject details, units, topics, and metrics | STUDENT, PARENT |
| `PATCH` | `/subjects/:id` | Update subject metadata | STUDENT |
| `DELETE` | `/subjects/:id` | Archive or delete subject | STUDENT |
| `POST` | `/subjects/:id/units` | Create a unit in subject | STUDENT |
| `PATCH` | `/units/:id` | Update unit title / order | STUDENT |
| `DELETE` | `/units/:id` | Delete unit | STUDENT |
| `POST` | `/units/:id/topics` | Create a topic in unit | STUDENT |
| `PATCH` | `/topics/:id` | Update topic title / completion state | STUDENT |
| `DELETE` | `/topics/:id` | Delete topic | STUDENT |

### Productivity Tasks (`/api/v1/tasks`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/tasks` | List tasks (pagination, filter by status, priority, subject, search) | STUDENT |
| `POST` | `/tasks` | Create task | STUDENT |
| `GET` | `/tasks/:id` | Get task by ID | STUDENT |
| `PATCH` | `/tasks/:id` | Update task (status, priority, due date) | STUDENT |
| `DELETE` | `/tasks/:id` | Delete task | STUDENT |
| `PATCH` | `/tasks/:id/status` | Quick toggle task status | STUDENT |

### Assignments & Exams (`/api/v1/assignments`, `/api/v1/exams`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/assignments` | List assignments (filter by subject, status, upcoming) | STUDENT, PARENT |
| `POST` | `/assignments` | Create assignment | STUDENT |
| `PATCH` | `/assignments/:id` | Update assignment / record marks | STUDENT |
| `DELETE` | `/assignments/:id` | Delete assignment | STUDENT |
| `GET` | `/exams` | List exams with countdowns | STUDENT, PARENT |
| `POST` | `/exams` | Schedule exam | STUDENT |
| `PATCH` | `/exams/:id` | Update exam marks / weightage | STUDENT |
| `DELETE` | `/exams/:id` | Delete exam | STUDENT |

### Attendance (`/api/v1/attendance`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/attendance` | Get attendance logs & overall/subject-wise percentage | STUDENT, PARENT |
| `POST` | `/attendance` | Mark attendance record (Present, Absent, Late, Excused) | STUDENT |
| `PATCH` | `/attendance/:id` | Update attendance status | STUDENT |

### Study Sessions & Pomodoro (`/api/v1/study-sessions`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/study-sessions` | Get recent study logs & total study time | STUDENT, PARENT |
| `POST` | `/study-sessions` | Save completed Pomodoro or custom study session | STUDENT |
| `GET` | `/study-plans` | List active study plans and target progress | STUDENT |
| `POST` | `/study-plans` | Create study plan with target subjects & hours | STUDENT |
| `GET` | `/goals` | List academic goals | STUDENT, PARENT |
| `POST` | `/goals` | Create new goal | STUDENT |
| `PATCH` | `/goals/:id` | Update goal progress / status | STUDENT |

### Notes & Flashcards (`/api/v1/notes`, `/api/v1/flashcards`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/notes` | List notes (search, subject filter, pinned first) | STUDENT |
| `POST` | `/notes` | Create markdown note | STUDENT |
| `PATCH` | `/notes/:id` | Update note / toggle pin | STUDENT |
| `DELETE` | `/notes/:id` | Delete note | STUDENT |
| `GET` | `/flashcards/decks` | List flashcard decks | STUDENT |
| `POST` | `/flashcards/decks` | Create deck | STUDENT |
| `POST` | `/flashcards/decks/:id/cards` | Add card to deck | STUDENT |
| `PATCH` | `/flashcards/:id/review` | Record card review & update mastery | STUDENT |

### Quizzes (`/api/v1/quizzes`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/quizzes` | List quizzes | STUDENT |
| `POST` | `/quizzes` | Create quiz with questions & options | STUDENT |
| `GET` | `/quizzes/:id` | Get quiz questions for taking the quiz | STUDENT |
| `POST` | `/quizzes/:id/attempts` | Submit answers, calculate score via transaction, return result | STUDENT |
| `GET` | `/quizzes/:id/attempts` | Get previous attempt history | STUDENT, PARENT |

### Analytics (`/api/v1/analytics`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/analytics/student` | Aggregated dashboard stats (study hours, tasks, attendance, upcoming) | STUDENT |
| `GET` | `/analytics/parent/:studentId` | Aggregated student analytics for authorized parent | PARENT |
| `GET` | `/analytics/admin` | Platform-wide stats (users, activity, retention) | ADMIN |

### Parent Management (`/api/v1/parents`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/parents/children` | List approved children profiles | PARENT |
| `POST` | `/parents/link-request` | Request link to student via student code / email | PARENT |
| `GET` | `/parents/children/:studentId/overview` | Comprehensive progress report for child | PARENT |

### Admin Platform Management (`/api/v1/admin`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/admin/users` | Server-paginated user directory with role filter & search | ADMIN |
| `PATCH` | `/admin/users/:id/status` | Activate/deactivate user | ADMIN |
| `GET` | `/admin/system-stats` | Database counts, user growth, health metrics | ADMIN |

### AI Study Assistant (`/api/v1/ai`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/ai/ask-tutor` | Explain concept, solve question step-by-step | STUDENT |
| `POST` | `/ai/generate-quiz` | Generate MCQ/True-False quiz from note or topic | STUDENT |
| `POST` | `/ai/summarize-notes` | Summarize notes into key bullets & flashcards | STUDENT |
| `POST` | `/ai/study-planner` | Generate optimal revision schedule based on exam dates | STUDENT |
