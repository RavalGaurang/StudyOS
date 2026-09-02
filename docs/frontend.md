# StudyOS Frontend Architecture & Design System

## 1. Frontend Philosophy
The StudyOS frontend is built as a high-performance, accessible, and responsive single-page experience using **Next.js 14+ (App Router)**, **TypeScript**, **Redux Toolkit**, **Tailwind CSS**, **Lucide React**, and **Recharts**. It is designed with modularity, predictable state flow, and zero component code duplication.

---

## 2. Directory Layout
```
frontend/src/
├── app/
│   ├── (auth)/                 # Public auth pages (login, register, forgot-password)
│   ├── (student)/              # Protected student app (dashboard, subjects, tasks, etc.)
│   ├── (parent)/               # Protected parent portal (overview, child analytics)
│   ├── (admin)/                # Protected admin console (users, platform stats)
│   ├── layout.tsx              # Root layout with Redux Provider & Theme Provider
│   └── page.tsx                # Landing page / Redirect to role portal
├── components/
│   ├── ui/                     # Atomic UI Design System (Button, Input, Modal, etc.)
│   ├── common/                 # SearchModal, NotificationDropdown, ThemeToggle
│   └── layout/                 # Sidebar, Navbar, MobileNav, Breadcrumbs
├── features/                   # Domain features (tasks, subjects, study, quizzes)
├── store/                      # Redux Toolkit store and slices
├── services/                   # Typed Axios API clients (authService, taskService, etc.)
├── hooks/                      # Custom hooks (useAuth, usePomodoro, useDebounce)
├── lib/                        # Axios instance, interceptors, date formatting
├── schemas/                    # Zod validation schemas for forms
└── types/                      # TypeScript definitions & API contracts
```

---

## 3. Reusable Atomic Design System (`components/ui/`)

| Component | Props / Variants | Accessibility / Features |
|---|---|---|
| **Button** | `variant` (primary, secondary, outline, ghost, danger), `size` (sm, md, lg), `isLoading`, `leftIcon`, `rightIcon` | ARIA busy state, focus ring, auto-disabled when loading |
| **Input** / **Textarea** | `label`, `error`, `helperText`, `leftElement`, `rightElement` | Linked ARIA error description, floating label or fixed label |
| **Select** | `options`, `label`, `error`, `placeholder` | Accessible native / custom select with keyboard navigation |
| **Modal** / **Drawer** | `isOpen`, `onClose`, `title`, `description`, `size` | Focus trap, Esc key listener, backdrop blur, portal rendering |
| **Badge** | `variant` (neutral, primary, success, warning, danger), `size` (sm, md) | Color contrast compliance, pill styling |
| **Card** | `title`, `subtitle`, `action`, `hoverable`, `headerBorder` | Elevated border, theme-adaptive dark mode backgrounds |
| **Table** / **Pagination**| `columns`, `data`, `isLoading`, `emptyMessage`, `page`, `totalPages`, `onPageChange` | Semantic `<table>`, sticky headers, skeleton row fallback |
| **Tabs** | `tabs` (`{ id, label, icon, count }`), `activeTab`, `onChange` | Keyboard left/right arrow navigation, ARIA selected |
| **Toast** | `type` (success, error, warning, info), `title`, `message` | Auto-dismiss, stackable notification toast system |
| **Skeleton** | `variant` (text, circular, rectangular), `width`, `height` | Animated shimmer loading placeholder |
| **Avatar** | `src`, `name`, `size`, `status` | Automatic initials fallback when image fails to load |
| **ConfirmDialog** | `isOpen`, `onConfirm`, `onCancel`, `title`, `message`, `variant` | Safe destruction confirmation for delete actions |
| **EmptyState** | `icon`, `title`, `description`, `action` | Clean visual fallback when lists are empty |
| **ErrorState** | `title`, `message`, `onRetry` | User-friendly retry trigger on API failures |
| **LoadingState** | `message` | Centered spinner or skeleton overlay |

---

## 4. Reusable Form Architecture

Using `react-hook-form` + `@hookform/resolvers/zod`:
```tsx
<form onSubmit={handleSubmit(onSubmit)}>
  <FormInput
    name="title"
    label="Assignment Title"
    placeholder="e.g. Chapter 4 Calculus Problem Set"
    control={control}
    rules={{ required: true }}
  />
  <FormSelect
    name="subjectId"
    label="Subject"
    options={subjectOptions}
    control={control}
  />
  <FormDatePicker
    name="dueDate"
    label="Due Date"
    control={control}
  />
  <Button type="submit" isLoading={isSubmitting}>Save Assignment</Button>
</form>
```

---

## 5. State Management Matrix

| Slice | Responsibility | Persistence |
|---|---|---|
| `authSlice` | Current logged in user, role, token in memory, session state | In-memory + HttpOnly cookie |
| `uiSlice` | Sidebar open/collapsed, active theme (dark/light/system), global search modal | LocalStorage (theme only) |
| `tasksSlice` | Task list, active filters, selected task | Redux state synced with API |
| `subjectsSlice`| Subject list, active subject syllabus tree | Redux state synced with API |
| `studySlice` | Active Pomodoro timer state, session duration, play/pause status | Redux / Worker sync |
| `notificationSlice` | Unread notifications count, latest alerts | Redux state synced with API |

---

## 6. Theme & Responsive Design

- **Dark Mode**: Configured with Tailwind `class` mode. Tokens dynamically adapt (`bg-white dark:bg-slate-900`, `text-slate-900 dark:text-slate-100`, `border-slate-200 dark:border-slate-800`).
- **Mobile First Navigation**:
  - Desktop: Collapsible sidebar with category groups.
  - Mobile / Tablet: Floating hamburger trigger opening a responsive navigation drawer, plus bottom quick-action bar for essential student actions (Add Task, Start Pomodoro, Mark Attendance).
