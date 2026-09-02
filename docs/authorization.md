# StudyOS Authorization & RBAC Architecture

## 1. Role-Based Access Control (RBAC)

StudyOS defines four discrete primary roles:
1. **`STUDENT`**: Owner of academic subjects, units, topics, tasks, study sessions, notes, quizzes, goals, and timetable.
2. **`PARENT`**: Guardian linked to one or more students via approved relationships. Read-only visibility into linked children's academic progress, attendance, grades, and study activity.
3. **`TEACHER`**: Manages classes, course syllabi, assignments, and class attendance rosters.
4. **`ADMIN`**: Full platform oversight, user management, audit logs, and system analytics.

---

## 2. Reusable Authorization Middleware

### 2.1 Layer 1: Authentication Guard
```typescript
authenticate(req, res, next)
```
- Extracts `Bearer <token>` from the `Authorization` header.
- Decodes and validates JWT expiration and signature.
- Attaches `req.user = { id, email, role, profileId }` to the Express request context.

### 2.2 Layer 2: Role Authorization Guard
```typescript
authorize(...allowedRoles: UserRole[])
```
- Verifies that `allowedRoles.includes(req.user.role)`.
- If unauthorized, returns `403 Forbidden` with a structured error message.

---

## 3. Resource-Level Authorization (Multi-Tenant Isolation)

Never rely on route parameters alone. Access control is enforced inside the domain service layer:

### 3.1 Student Data Isolation
```typescript
// Example: In TaskService
async function getTaskById(taskId: string, studentId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, studentId }
  });
  if (!task) {
    throw new NotFoundError("Task not found or access denied");
  }
  return task;
}
```

### 3.2 Parent-Student Access Guard
A Parent can only access student data if an approved record exists in `parent_students`:
```typescript
// Example: In ParentAccessGuard / ParentService
async function verifyParentStudentLink(parentId: string, studentId: string) {
  const link = await prisma.parentStudent.findUnique({
    where: {
      parentId_studentId: { parentId, studentId }
    }
  });

  if (!link || !link.isApproved) {
    throw new ForbiddenError("You do not have approved access to this student profile");
  }
}
```

### 3.3 Parent Permission Boundary
- **Allowed (Read-only)**:
  - Subject syllabus & completion percentage
  - Attendance history and percentages
  - Task completion metrics
  - Assignment submission statuses & marks
  - Upcoming exam dates and results
  - Total study hours and weekly progress
- **Restricted / Forbidden**:
  - Direct modification or deletion of student tasks/notes
  - Private AI chat transcripts
  - Flashcard mastery review sessions
