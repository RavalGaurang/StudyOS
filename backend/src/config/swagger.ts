export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'StudyOS REST API & Developer Documentation',
    version: '1.0.0',
    description:
      'Official OpenAPI 3.0 specification for StudyOS — Full-Stack Academic Operating System and Student Productivity SaaS Platform. Supports Students, Parents, Teachers, and Administrators.',
    contact: {
      name: 'StudyOS Engineering Team',
      email: 'api-support@studyos.com',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Primary API Gateway (v1)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token in the format: Bearer <token>',
      },
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid input parameters' },
              statusCode: { type: 'integer', example: 422 },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email', example: 'student@studyos.com' },
          firstName: { type: 'string', example: 'Rahul' },
          lastName: { type: 'string', example: 'Sharma' },
          role: { type: 'string', enum: ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN'] },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'Complete BCNF normalization homework' },
          description: { type: 'string', example: 'Solve exercises 1 through 5' },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
          dueDate: { type: 'string', format: 'date-time' },
          subjectId: { type: 'string', format: 'uuid' },
        },
      },
      Subject: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Database Management Systems' },
          code: { type: 'string', example: 'CS401' },
          color: { type: 'string', example: '#3B82F6' },
          targetGrade: { type: 'string', example: 'A' },
          creditHours: { type: 'integer', example: 4 },
          syllabusProgress: { type: 'number', example: 68.5 },
        },
      },
      StudySession: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          subjectId: { type: 'string', format: 'uuid' },
          sessionType: { type: 'string', enum: ['POMODORO_25_5', 'POMODORO_50_10', 'CUSTOM'] },
          durationMinutes: { type: 'integer', example: 25 },
          startedAt: { type: 'string', format: 'date-time' },
          endedAt: { type: 'string', format: 'date-time' },
          notes: { type: 'string', example: 'Reviewed chapter 3 indexing' },
        },
      },
      Quiz: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'Operating Systems Virtual Memory Quiz' },
          subjectId: { type: 'string', format: 'uuid' },
          durationMinutes: { type: 'integer', example: 15 },
          totalMarks: { type: 'integer', example: 10 },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'System', description: 'System health check and runtime status' },
    { name: 'Authentication', description: 'User login, registration, token refresh, and session management' },
    { name: 'Academic Subjects', description: 'Syllabus hierarchy, units, and topic completion tracking' },
    { name: 'Tasks & Productivity', description: 'Task CRUD, priority filters, and status toggles' },
    { name: 'Assignments', description: 'Course homework, submissions, and grade tracking' },
    { name: 'Exams', description: 'Test schedules, countdown timers, and final grade weightages' },
    { name: 'Timetable', description: 'Weekly recurring lecture and lab schedule events' },
    { name: 'Attendance', description: 'Class attendance logging and percentage aggregations' },
    { name: 'Notes Vault', description: 'Markdown notes, pinned items, and tag taxonomy' },
    { name: 'Study & Pomodoro', description: '25/5 and 50/10 focus interval timer and session logs' },
    { name: 'Quizzes & Testing', description: 'MCQ practice tests, instant transactional grading, and review' },
    { name: 'Flashcards', description: 'Spaced repetition decks with 5-level SM-2 mastery reviews' },
    { name: 'Analytics', description: 'Aggregated study hours, 7-day velocity, and subject distributions' },
    { name: 'Parent Portal', description: 'Guardian oversight, child linkage, and progress supervision' },
    { name: 'Admin Operations', description: 'Platform diagnostics, telemetry, and user directory management' },
    { name: 'AI Study Assistant', description: 'AI Concept Tutor, Quiz Generator, and Notes Summarizer' },
    { name: 'Notifications', description: 'In-app academic notifications and reminders' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'API Health Check',
        tags: ['System'],
        security: [],
        responses: {
          '200': {
            description: 'API is healthy and operational',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user account',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'student@studyos.com' },
                  password: { type: 'string', example: 'StudyOS@123456' },
                  firstName: { type: 'string', example: 'Rahul' },
                  lastName: { type: 'string', example: 'Sharma' },
                  role: { type: 'string', enum: ['STUDENT', 'PARENT', 'TEACHER'], default: 'STUDENT' },
                  gradeLevel: { type: 'string', example: 'Year 3 (B.Tech CSE)' },
                  schoolName: { type: 'string', example: 'Institute of Advanced Technology' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User account created successfully' },
          '422': { description: 'Validation failed' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate user with email and password',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'student@studyos.com' },
                  password: { type: 'string', example: 'StudyOS@123456' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Authentication successful. Returns Access Token and sets HttpOnly Refresh cookie.' },
          '401': { description: 'Invalid email or password' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Retrieve authenticated user profile',
        tags: ['Authentication'],
        responses: {
          '200': { description: 'Current user profile data' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Rotate refresh token and issue new access token',
        tags: ['Authentication'],
        security: [],
        responses: {
          '200': { description: 'Token refreshed successfully' },
          '401': { description: 'Invalid or expired refresh token' },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Revoke refresh token and clear auth cookies',
        tags: ['Authentication'],
        responses: {
          '200': { description: 'Logged out successfully' },
        },
      },
    },
    '/subjects': {
      get: {
        summary: 'List all enrolled subjects with syllabus progress',
        tags: ['Academic Subjects'],
        responses: {
          '200': { description: 'List of subjects with dynamically computed progress' },
        },
      },
      post: {
        summary: 'Create a new subject',
        tags: ['Academic Subjects'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Distributed Systems' },
                  code: { type: 'string', example: 'CS402' },
                  color: { type: 'string', example: '#8B5CF6' },
                  targetGrade: { type: 'string', example: 'A' },
                  creditHours: { type: 'integer', example: 4 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Subject created successfully' },
        },
      },
    },
    '/subjects/{id}': {
      get: {
        summary: 'Get subject details and syllabus tree (Units & Topics)',
        tags: ['Academic Subjects'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Subject details with units and topics breakdown' },
        },
      },
    },
    '/subjects/{id}/units': {
      post: {
        summary: 'Add a new unit to a subject',
        tags: ['Academic Subjects'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Consensus & Raft Protocol' },
                  description: { type: 'string', example: 'Leader election and log replication' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Unit created' } },
      },
    },
    '/subjects/units/{unitId}/topics': {
      post: {
        summary: 'Add a topic to a unit',
        tags: ['Academic Subjects'],
        parameters: [
          { name: 'unitId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Two-Phase Commit Protocol' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Topic created' } },
      },
    },
    '/subjects/topics/{topicId}': {
      patch: {
        summary: 'Toggle or update topic completion status',
        tags: ['Academic Subjects'],
        parameters: [
          { name: 'topicId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  isCompleted: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Topic updated' } },
      },
    },
    '/tasks': {
      get: {
        summary: 'List tasks with multi-faceted filtering & pagination',
        tags: ['Tasks & Productivity'],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] } },
          { name: 'dueFilter', in: 'query', schema: { type: 'string', enum: ['all', 'today', 'upcoming', 'overdue'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': { description: 'Paginated list of tasks' },
        },
      },
      post: {
        summary: 'Create a new task',
        tags: ['Tasks & Productivity'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Implement Distributed Mutex' },
                  description: { type: 'string', example: 'Using Lamport timestamps' },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
                  dueDate: { type: 'string', format: 'date-time' },
                  subjectId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Task created' } },
      },
    },
    '/tasks/{id}/toggle': {
      patch: {
        summary: 'Toggle task completion status between TODO and COMPLETED',
        tags: ['Tasks & Productivity'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { '200': { description: 'Status toggled' } },
      },
    },
    '/tasks/{id}': {
      delete: {
        summary: 'Delete a task',
        tags: ['Tasks & Productivity'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { '200': { description: 'Task deleted' } },
      },
    },
    '/assignments': {
      get: {
        summary: 'List student assignments and submission grades',
        tags: ['Assignments'],
        responses: { '200': { description: 'Assignments list' } },
      },
      post: {
        summary: 'Create a new assignment',
        tags: ['Assignments'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'dueDate'],
                properties: {
                  title: { type: 'string', example: 'Distributed File System Project' },
                  subjectId: { type: 'string', format: 'uuid' },
                  dueDate: { type: 'string', format: 'date-time' },
                  maxMarks: { type: 'number', example: 100 },
                  status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'GRADED'] },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Assignment created' } },
      },
    },
    '/exams': {
      get: {
        summary: 'List scheduled exams and test dates',
        tags: ['Exams'],
        responses: { '200': { description: 'List of exams' } },
      },
      post: {
        summary: 'Schedule an exam',
        tags: ['Exams'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'examDate'],
                properties: {
                  title: { type: 'string', example: 'Operating Systems Mid-Term' },
                  subjectId: { type: 'string', format: 'uuid' },
                  examDate: { type: 'string', format: 'date-time' },
                  durationMinutes: { type: 'integer', example: 120 },
                  maxMarks: { type: 'number', example: 100 },
                  weightagePercent: { type: 'number', example: 30 },
                  roomLocation: { type: 'string', example: 'Lecture Hall 101' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Exam scheduled' } },
      },
    },
    '/attendance': {
      get: {
        summary: 'Get attendance records and computed percentage breakdowns',
        tags: ['Attendance'],
        responses: { '200': { description: 'Attendance logs & analytics metrics' } },
      },
      post: {
        summary: 'Mark class attendance',
        tags: ['Attendance'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['subjectId', 'date', 'status'],
                properties: {
                  subjectId: { type: 'string', format: 'uuid' },
                  date: { type: 'string', format: 'date', example: '2026-09-02' },
                  status: { type: 'string', enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] },
                  notes: { type: 'string', example: 'Attended lecture online' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Attendance recorded' } },
      },
    },
    '/timetable': {
      get: {
        summary: 'Get weekly timetable schedule',
        tags: ['Timetable'],
        responses: { '200': { description: 'Timetable events grouped by day of week' } },
      },
      post: {
        summary: 'Add class or lecture event to timetable',
        tags: ['Timetable'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'dayOfWeek', 'startTime', 'endTime'],
                properties: {
                  title: { type: 'string', example: 'Algorithms Lecture' },
                  subjectId: { type: 'string', format: 'uuid' },
                  dayOfWeek: { type: 'integer', minimum: 0, maximum: 6, example: 1 },
                  startTime: { type: 'string', example: '09:00' },
                  endTime: { type: 'string', example: '10:30' },
                  room: { type: 'string', example: 'LH-101' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Class event added' } },
      },
    },
    '/notes': {
      get: {
        summary: 'List Markdown notes with search and subject filters',
        tags: ['Notes Vault'],
        parameters: [
          { name: 'subjectId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Notes list' } },
      },
      post: {
        summary: 'Create a new Markdown note',
        tags: ['Notes Vault'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                  title: { type: 'string', example: 'ACID Transactions Overview' },
                  content: { type: 'string', example: '# ACID Properties\n\n1. Atomicity\n2. Consistency...' },
                  subjectId: { type: 'string', format: 'uuid' },
                  tags: { type: 'array', items: { type: 'string' }, example: ['database', 'acid', 'exam'] },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Note created' } },
      },
    },
    '/study/sessions': {
      get: {
        summary: 'List logged Pomodoro and study sessions',
        tags: ['Study & Pomodoro'],
        responses: { '200': { description: 'List of study sessions' } },
      },
      post: {
        summary: 'Log a completed study session',
        tags: ['Study & Pomodoro'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['durationMinutes', 'startedAt', 'endedAt'],
                properties: {
                  subjectId: { type: 'string', format: 'uuid' },
                  sessionType: { type: 'string', enum: ['POMODORO_25_5', 'POMODORO_50_10', 'CUSTOM'] },
                  durationMinutes: { type: 'integer', example: 25 },
                  startedAt: { type: 'string', format: 'date-time' },
                  endedAt: { type: 'string', format: 'date-time' },
                  notes: { type: 'string', example: 'Completed 25m Pomodoro block' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Study session logged' } },
      },
    },
    '/study/goals': {
      get: {
        summary: 'Get active academic targets and goals',
        tags: ['Study & Pomodoro'],
        responses: { '200': { description: 'Goals list' } },
      },
      post: {
        summary: 'Create an academic goal',
        tags: ['Study & Pomodoro'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'targetDate', 'targetValue'],
                properties: {
                  title: { type: 'string', example: 'Log 40 Study Hours this Month' },
                  metricType: { type: 'string', enum: ['STUDY_HOURS', 'TASKS_COMPLETED', 'EXAM_SCORE', 'ATTENDANCE_PERCENT'] },
                  targetValue: { type: 'number', example: 40 },
                  currentValue: { type: 'number', example: 10 },
                  targetDate: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Goal created' } },
      },
    },
    '/quizzes': {
      get: {
        summary: 'List available quizzes',
        tags: ['Quizzes & Testing'],
        responses: { '200': { description: 'Quizzes list' } },
      },
      post: {
        summary: 'Create a quiz with questions and answers',
        tags: ['Quizzes & Testing'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'questions'],
                properties: {
                  title: { type: 'string', example: 'Virtual Memory & Paging' },
                  subjectId: { type: 'string', format: 'uuid' },
                  durationMinutes: { type: 'integer', example: 15 },
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['questionText', 'options'],
                      properties: {
                        questionText: { type: 'string', example: 'What is a TLB?' },
                        marks: { type: 'integer', default: 1 },
                        explanation: { type: 'string', example: 'Translation Lookaside Buffer caches page translations' },
                        options: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              optionText: { type: 'string' },
                              isCorrect: { type: 'boolean' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Quiz created' } },
      },
    },
    '/quizzes/{id}/attempt': {
      post: {
        summary: 'Submit quiz attempt and receive instant transactional grade calculation',
        tags: ['Quizzes & Testing'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['answers'],
                properties: {
                  timeSpentSeconds: { type: 'integer', example: 480 },
                  answers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        questionId: { type: 'string', format: 'uuid' },
                        selectedOptionId: { type: 'string', format: 'uuid' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Attempt evaluated. Returns score, percentage, and detailed answers breakdown.' },
        },
      },
    },
    '/quizzes/flashcards/decks': {
      get: {
        summary: 'List flashcard decks',
        tags: ['Flashcards'],
        responses: { '200': { description: 'Decks list' } },
      },
      post: {
        summary: 'Create a flashcard deck',
        tags: ['Flashcards'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Algorithms Complexity Flashcards' },
                  subjectId: { type: 'string', format: 'uuid' },
                  description: { type: 'string', example: 'Big-O bounds for sorting and graph algorithms' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Deck created' } },
      },
    },
    '/analytics/student': {
      get: {
        summary: 'Get aggregated student dashboard analytics & 7-day study velocity',
        tags: ['Analytics'],
        responses: {
          '200': { description: 'Dashboard metrics, trends, exams, and subject distribution' },
        },
      },
    },
    '/parents/children': {
      get: {
        summary: 'List all students linked to the authenticated parent',
        tags: ['Parent Portal'],
        responses: { '200': { description: 'List of authorized children' } },
      },
    },
    '/parents/link': {
      post: {
        summary: 'Link a student profile to parent account by student email',
        tags: ['Parent Portal'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['studentEmail', 'relationship'],
                properties: {
                  studentEmail: { type: 'string', format: 'email', example: 'student@studyos.com' },
                  relationship: { type: 'string', example: 'Father' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Student linked' } },
      },
    },
    '/parents/children/{studentId}/overview': {
      get: {
        summary: 'Get student academic progress (Strict tenant-isolated authorization)',
        tags: ['Parent Portal'],
        parameters: [
          { name: 'studentId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Child progress overview' },
          '403': { description: 'Forbidden: Student is not linked to this parent' },
        },
      },
    },
    '/admin/stats': {
      get: {
        summary: 'Get platform-wide telemetry and system stats (Admin Only)',
        tags: ['Admin Operations'],
        responses: { '200': { description: 'Platform telemetry metrics' } },
      },
    },
    '/admin/users': {
      get: {
        summary: 'Get paginated users directory (Admin Only)',
        tags: ['Admin Operations'],
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { '200': { description: 'Users directory' } },
      },
    },
    '/admin/users/{userId}/status': {
      patch: {
        summary: 'Toggle user active/suspended status (Admin Only)',
        tags: ['Admin Operations'],
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { '200': { description: 'Status updated' } },
      },
    },
    '/ai/tutor': {
      post: {
        summary: 'Ask AI Academic Tutor for concept breakdown',
        tags: ['AI Study Assistant'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: { type: 'string', example: 'Explain BCNF with a hospital example' },
                  subjectName: { type: 'string', example: 'Database Management Systems' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'AI Tutor response' } },
      },
    },
    '/ai/generate-quiz': {
      post: {
        summary: 'Generate active recall practice test questions',
        tags: ['AI Study Assistant'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['topicTitle'],
                properties: {
                  topicTitle: { type: 'string', example: 'Dijkstra Algorithm' },
                  subjectName: { type: 'string', example: 'Algorithms' },
                  numQuestions: { type: 'integer', default: 3 },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Generated quiz questions' } },
      },
    },
    '/ai/summarize-notes': {
      post: {
        summary: 'Extract summary and flashcard pairs from raw study notes',
        tags: ['AI Study Assistant'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['notesContent'],
                properties: {
                  notesContent: { type: 'string', example: 'Atomicity means all transactions complete or fail completely...' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Summary and extracted flashcards' } },
      },
    },
  },
};
