import { PrismaClient, UserRole, TaskPriority, TaskStatus, AssignmentStatus, AttendanceStatus, SessionType, GoalMetric, GoalStatus, QuestionType, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting StudyOS database seeding...');

  // 1. Clean existing records (in reverse dependency order)
  await prisma.aiMessage.deleteMany();
  await prisma.aiConversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.quizAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizOption.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.flashcardDeck.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.studyPlanItem.deleteMany();
  await prisma.studyPlan.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.note.deleteMany();
  await prisma.timetableEvent.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.parentStudent.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.parentProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('StudyOS@123456', 10);

  // 2. Create Users & Profiles
  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@studyos.com',
      passwordHash,
      role: UserRole.ADMIN,
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
      isEmailVerified: true,
      adminProfile: {
        create: {
          permissions: ['ALL'],
        },
      },
    },
  });

  // Teacher
  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@studyos.com',
      passwordHash,
      role: UserRole.TEACHER,
      firstName: 'Dr. Sarah',
      lastName: 'Jenkins',
      isActive: true,
      isEmailVerified: true,
      teacherProfile: {
        create: {
          department: 'Computer Science & Engineering',
          title: 'Associate Professor',
        },
      },
    },
  });

  // Student 1 (Rahul Sharma)
  const studentUser1 = await prisma.user.create({
    data: {
      email: 'student@studyos.com',
      passwordHash,
      role: UserRole.STUDENT,
      firstName: 'Rahul',
      lastName: 'Sharma',
      isActive: true,
      isEmailVerified: true,
      studentProfile: {
        create: {
          gradeLevel: 'Year 3 (B.Tech CSE)',
          targetGpa: 3.85,
          schoolName: 'Institute of Advanced Technology',
          bio: 'Aspiring Full Stack Engineer & Cloud Architect',
        },
      },
    },
    include: { studentProfile: true },
  });

  const studentProfile1 = studentUser1.studentProfile!;

  // Student 2 (Priya Patel)
  const studentUser2 = await prisma.user.create({
    data: {
      email: 'student2@studyos.com',
      passwordHash,
      role: UserRole.STUDENT,
      firstName: 'Priya',
      lastName: 'Patel',
      isActive: true,
      isEmailVerified: true,
      studentProfile: {
        create: {
          gradeLevel: 'Year 2 (B.Tech CSE)',
          targetGpa: 3.9,
          schoolName: 'Institute of Advanced Technology',
          bio: 'Data Science and AI Enthusiast',
        },
      },
    },
    include: { studentProfile: true },
  });

  // Parent (Rajesh Sharma linked to Rahul Sharma)
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@studyos.com',
      passwordHash,
      role: UserRole.PARENT,
      firstName: 'Rajesh',
      lastName: 'Sharma',
      isActive: true,
      isEmailVerified: true,
      parentProfile: {
        create: {
          phoneNumber: '+1-555-0199',
        },
      },
    },
    include: { parentProfile: true },
  });

  const parentProfile = parentUser.parentProfile!;

  // Link Parent -> Student 1
  await prisma.parentStudent.create({
    data: {
      parentId: parentProfile.id,
      studentId: studentProfile1.id,
      relationship: 'Father',
      isApproved: true,
    },
  });

  // 3. Create Subjects, Units, Topics for Student 1
  // Subject 1: DBMS
  const dbmsSubject = await prisma.subject.create({
    data: {
      studentId: studentProfile1.id,
      name: 'Database Management Systems',
      code: 'CS302',
      color: '#10B981', // Emerald
      icon: 'database',
      targetGrade: 'A',
      creditHours: 4,
      units: {
        create: [
          {
            title: 'Relational Model & SQL',
            orderIndex: 1,
            description: 'Relational algebra, calculus, and advanced SQL querying',
            topics: {
              create: [
                { title: 'Relational Algebra Operations', orderIndex: 1, isCompleted: true, completedAt: new Date() },
                { title: 'Complex Subqueries & Joins', orderIndex: 2, isCompleted: true, completedAt: new Date() },
                { title: 'Views and Triggers', orderIndex: 3, isCompleted: true, completedAt: new Date() },
              ],
            },
          },
          {
            title: 'Normalization & Schema Design',
            orderIndex: 2,
            description: 'Functional dependencies, 1NF, 2NF, 3NF, BCNF, 4NF',
            topics: {
              create: [
                { title: 'Functional Dependencies & Armstrong Axioms', orderIndex: 1, isCompleted: true, completedAt: new Date() },
                { title: '1NF, 2NF, and 3NF Normal Forms', orderIndex: 2, isCompleted: true, completedAt: new Date() },
                { title: 'Boyce-Codd Normal Form (BCNF)', orderIndex: 3, isCompleted: false },
                { title: 'Lossless Join & Dependency Preservation', orderIndex: 4, isCompleted: false },
              ],
            },
          },
          {
            title: 'Transactions & Concurrency Control',
            orderIndex: 3,
            description: 'ACID properties, serializability, two-phase locking',
            topics: {
              create: [
                { title: 'ACID Properties & Schedules', orderIndex: 1, isCompleted: false },
                { title: 'Two-Phase Locking (2PL) Protocol', orderIndex: 2, isCompleted: false },
                { title: 'Deadlock Detection & Prevention', orderIndex: 3, isCompleted: false },
              ],
            },
          },
        ],
      },
    },
    include: { units: { include: { topics: true } } },
  });

  // Subject 2: Computer Networks
  const networksSubject = await prisma.subject.create({
    data: {
      studentId: studentProfile1.id,
      name: 'Computer Networks',
      code: 'CS301',
      color: '#3B82F6', // Blue
      icon: 'network',
      targetGrade: 'A+',
      creditHours: 4,
      units: {
        create: [
          {
            title: 'Network Layer & IP Addressing',
            orderIndex: 1,
            description: 'IPv4, IPv6, Subnetting, CIDR, and Routing Protocols',
            topics: {
              create: [
                { title: 'IPv4 Addressing & Subnet Masks', orderIndex: 1, isCompleted: true, completedAt: new Date() },
                { title: 'Classless Inter-Domain Routing (CIDR)', orderIndex: 2, isCompleted: true, completedAt: new Date() },
                { title: 'Dijkstra Link-State Algorithm', orderIndex: 3, isCompleted: false },
              ],
            },
          },
          {
            title: 'Transport Layer Protocols',
            orderIndex: 2,
            description: 'TCP 3-way handshake, Flow Control, Congestion Control, UDP',
            topics: {
              create: [
                { title: 'TCP Connection Establishment & Teardown', orderIndex: 1, isCompleted: false },
                { title: 'TCP Congestion Control (AIMD)', orderIndex: 2, isCompleted: false },
              ],
            },
          },
        ],
      },
    },
  });

  // Subject 3: Operating Systems
  const osSubject = await prisma.subject.create({
    data: {
      studentId: studentProfile1.id,
      name: 'Operating Systems',
      code: 'CS303',
      color: '#8B5CF6', // Purple
      icon: 'cpu',
      targetGrade: 'A',
      creditHours: 4,
      units: {
        create: [
          {
            title: 'Process Management & Scheduling',
            orderIndex: 1,
            topics: {
              create: [
                { title: 'Process States & PCB', orderIndex: 1, isCompleted: true, completedAt: new Date() },
                { title: 'Round Robin & Priority Scheduling', orderIndex: 2, isCompleted: true, completedAt: new Date() },
              ],
            },
          },
          {
            title: 'Memory Management & Virtual Memory',
            orderIndex: 2,
            topics: {
              create: [
                { title: 'Paging & TLB', orderIndex: 1, isCompleted: false },
                { title: 'Page Replacement Algorithms (LRU, FIFO)', orderIndex: 2, isCompleted: false },
              ],
            },
          },
        ],
      },
    },
  });

  // Subject 4: Mathematics for Computer Science
  const mathSubject = await prisma.subject.create({
    data: {
      studentId: studentProfile1.id,
      name: 'Discrete Mathematics',
      code: 'MA201',
      color: '#F59E0B', // Amber
      icon: 'calculator',
      targetGrade: 'A',
      creditHours: 3,
      units: {
        create: [
          {
            title: 'Graph Theory & Trees',
            orderIndex: 1,
            topics: {
              create: [
                { title: 'Eulerian & Hamiltonian Graphs', orderIndex: 1, isCompleted: true, completedAt: new Date() },
                { title: 'Minimum Spanning Trees (Kruskal/Prim)', orderIndex: 2, isCompleted: true, completedAt: new Date() },
              ],
            },
          },
        ],
      },
    },
  });

  // 4. Create Tasks
  const now = new Date();
  const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const inEightDays = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        studentId: studentProfile1.id,
        subjectId: dbmsSubject.id,
        title: 'Submit DBMS Assignment on BCNF Normalization',
        description: 'Complete problem sets 4.1 to 4.8 and draw dependency diagrams',
        dueDate: inTwoDays,
        priority: TaskPriority.URGENT,
        status: TaskStatus.IN_PROGRESS,
      },
      {
        studentId: studentProfile1.id,
        subjectId: networksSubject.id,
        title: 'Practice Dijkstra Shortest Path calculations',
        description: 'Solve past year questions on subnetting and routing tables',
        dueDate: inFiveDays,
        priority: TaskPriority.HIGH,
        status: TaskStatus.TODO,
      },
      {
        studentId: studentProfile1.id,
        subjectId: osSubject.id,
        title: 'Read Chapter 8 on Virtual Memory Paging',
        description: 'Review TLB miss penalty and multi-level page table lookups',
        dueDate: inEightDays,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
      },
      {
        studentId: studentProfile1.id,
        subjectId: mathSubject.id,
        title: 'Complete Discrete Math Problem Set 3',
        description: 'Spanning tree proofs and chromatic polynomial derivations',
        dueDate: now,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
      },
      {
        studentId: studentProfile1.id,
        title: 'Weekly Academic Schedule Review',
        description: 'Organize study notes and plan Pomodoro goals for next week',
        dueDate: now,
        priority: TaskPriority.LOW,
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
      },
    ],
  });

  // 5. Create Assignments
  await prisma.assignment.createMany({
    data: [
      {
        studentId: studentProfile1.id,
        subjectId: dbmsSubject.id,
        title: 'DBMS Schema Design & Normalization Project',
        description: 'Design 3NF / BCNF normalized schema for a Healthcare Hospital Management System',
        dueDate: inFiveDays,
        status: AssignmentStatus.IN_PROGRESS,
        maxMarks: 100,
      },
      {
        studentId: studentProfile1.id,
        subjectId: networksSubject.id,
        title: 'Packet Sniffing & Protocol Analysis with Wireshark',
        description: 'Analyze TCP 3-way handshake and DNS resolution packet capture traces',
        dueDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        status: AssignmentStatus.PENDING,
        maxMarks: 50,
      },
      {
        studentId: studentProfile1.id,
        subjectId: osSubject.id,
        title: 'CPU Scheduling Simulator in C++',
        description: 'Implemented FCFS, SJF, and Round-Robin scheduler with Gantt chart output',
        dueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        status: AssignmentStatus.GRADED,
        maxMarks: 100,
        obtainedMarks: 94,
        submissionNotes: 'All test cases passed with optimal turn-around time calculation.',
      },
    ],
  });

  // 6. Create Exams
  await prisma.exam.createMany({
    data: [
      {
        studentId: studentProfile1.id,
        subjectId: dbmsSubject.id,
        title: 'DBMS Mid-Term Examination',
        examDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        durationMinutes: 120,
        maxMarks: 100,
        weightagePercent: 30,
        roomLocation: 'Lecture Hall 204',
        notes: 'Covers Units 1 & 2: SQL, Relational Algebra, and Normalization up to BCNF.',
      },
      {
        studentId: studentProfile1.id,
        subjectId: networksSubject.id,
        title: 'Computer Networks Theory Exam',
        examDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
        durationMinutes: 180,
        maxMarks: 100,
        weightagePercent: 40,
        roomLocation: 'Auditorium A',
        notes: 'Comprehensive exam on physical to application layers.',
      },
      {
        studentId: studentProfile1.id,
        subjectId: mathSubject.id,
        title: 'Discrete Mathematics Quiz 2',
        examDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        durationMinutes: 45,
        maxMarks: 50,
        obtainedMarks: 46.5,
        weightagePercent: 15,
        roomLocation: 'Room 301',
      },
    ],
  });

  // 7. Create Timetable Events (Weekly Schedule)
  await prisma.timetableEvent.createMany({
    data: [
      {
        studentId: studentProfile1.id,
        subjectId: networksSubject.id,
        title: 'Computer Networks Lecture',
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '10:30',
        room: 'LH-101',
        location: 'Engineering Block 1',
        color: '#3B82F6',
      },
      {
        studentId: studentProfile1.id,
        subjectId: dbmsSubject.id,
        title: 'DBMS Lecture',
        dayOfWeek: 1, // Monday
        startTime: '11:00',
        endTime: '12:30',
        room: 'LH-204',
        location: 'CS Wing Floor 2',
        color: '#10B981',
      },
      {
        studentId: studentProfile1.id,
        subjectId: osSubject.id,
        title: 'Operating Systems Lecture',
        dayOfWeek: 2, // Tuesday
        startTime: '10:00',
        endTime: '11:30',
        room: 'LH-102',
        location: 'Main Science Block',
        color: '#8B5CF6',
      },
      {
        studentId: studentProfile1.id,
        subjectId: mathSubject.id,
        title: 'Discrete Mathematics',
        dayOfWeek: 3, // Wednesday
        startTime: '09:00',
        endTime: '10:30',
        room: 'LH-301',
        location: 'Math Building',
        color: '#F59E0B',
      },
      {
        studentId: studentProfile1.id,
        subjectId: dbmsSubject.id,
        title: 'DBMS Practical Lab',
        dayOfWeek: 4, // Thursday
        startTime: '14:00',
        endTime: '16:00',
        room: 'Lab 3',
        location: 'CS Wing Lab Annex',
        color: '#10B981',
      },
      {
        studentId: studentProfile1.id,
        subjectId: networksSubject.id,
        title: 'Networks Simulation Lab',
        dayOfWeek: 5, // Friday
        startTime: '10:00',
        endTime: '12:00',
        room: 'Lab 1',
        location: 'Networking Center',
        color: '#3B82F6',
      },
    ],
  });

  // 8. Create Attendance Records (Realistic 30-day distribution)
  const attendanceEntries = [];
  const subjectsList = [dbmsSubject, networksSubject, osSubject, mathSubject];

  for (let i = 25; i >= 1; i--) {
    const recordDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // Skip weekends
    if (recordDate.getDay() === 0 || recordDate.getDay() === 6) continue;

    for (const sub of subjectsList) {
      // 90% present, 5% late, 5% absent
      const rand = Math.random();
      let status: AttendanceStatus = AttendanceStatus.PRESENT;
      if (rand > 0.95) {
        status = AttendanceStatus.ABSENT;
      } else if (rand > 0.88) {
        status = AttendanceStatus.LATE;
      }

      attendanceEntries.push({
        studentId: studentProfile1.id,
        subjectId: sub.id,
        date: recordDate,
        status,
      });
    }
  }

  // Insert in batches
  for (const entry of attendanceEntries) {
    await prisma.attendance.create({ data: entry });
  }

  // 9. Create Notes
  await prisma.note.createMany({
    data: [
      {
        studentId: studentProfile1.id,
        subjectId: dbmsSubject.id,
        title: 'ACID Properties & Transaction Isolation Levels',
        content: `# ACID Properties in Relational Databases\n\n## 1. Atomicity\n- All or nothing execution.\n- Handled by transaction rollback logs (Undo log).\n\n## 2. Consistency\n- Maintains database invariants and constraints (e.g. Foreign keys, checks).\n\n## 3. Isolation\n- Concurrent transactions execute without mutual interference.\n- **Isolation Levels**:\n  1. Read Uncommitted (Dirty reads possible)\n  2. Read Committed (Non-repeatable reads possible)\n  3. Repeatable Read (Phantom reads possible)\n  4. Serializable (Strict serial order)\n\n## 4. Durability\n- Committed changes survive system crashes.\n- Managed by Write-Ahead Logging (WAL) and Redo logs.`,
        isPinned: true,
        tags: ['database', 'acid', 'transactions', 'exam-prep'],
      },
      {
        studentId: studentProfile1.id,
        subjectId: networksSubject.id,
        title: 'IPv4 Subnetting & CIDR Calculation Formulas',
        content: `# IPv4 Subnetting Reference\n\n- Number of subnets: $2^s$ (where $s$ is borrowed subnet bits)\n- Number of usable hosts: $2^h - 2$ (where $h$ is host bits)\n- **Slash Notation**:\n  - \`/24\` = 256 IPs, 254 usable hosts (255.255.255.0)\n  - \`/25\` = 128 IPs, 126 usable hosts (255.255.255.128)\n  - \`/26\` = 64 IPs, 62 usable hosts (255.255.255.192)\n  - \`/28\` = 16 IPs, 14 usable hosts (255.255.255.240)\n\n*Remember to exclude Network ID (first) and Broadcast IP (last).*`,
        isPinned: true,
        tags: ['networking', 'ip', 'cidr', 'cheatsheet'],
      },
      {
        studentId: studentProfile1.id,
        subjectId: osSubject.id,
        title: 'Page Replacement Algorithms: LRU vs FIFO',
        content: `# Page Replacement Comparison\n\n### 1. FIFO (First In First Out)\n- Suffers from **Belady's Anomaly** (increasing frames can increase page faults).\n\n### 2. Optimal Page Replacement (OPT)\n- Replaces page not used for longest future duration.\n- Theoretical benchmark (cannot be implemented in real-time).\n\n### 3. LRU (Least Recently Used)\n- Replaces page that has not been referenced for the longest past duration.\n- Implemented using Counter or Doubly Linked List Stack.`,
        isPinned: false,
        tags: ['os', 'memory', 'paging'],
      },
    ],
  });

  // 10. Create Study Sessions (Past 7 days)
  const sessionData = [
    { daysAgo: 6, duration: 50, type: SessionType.POMODORO_50_10, subject: dbmsSubject.id, notes: 'Normalized healthcare schema tables' },
    { daysAgo: 5, duration: 50, type: SessionType.POMODORO_50_10, subject: networksSubject.id, notes: 'Practiced subnetting exercises' },
    { daysAgo: 4, duration: 75, type: SessionType.CUSTOM, subject: osSubject.id, notes: 'C++ scheduling simulator debugging' },
    { daysAgo: 3, duration: 50, type: SessionType.POMODORO_50_10, subject: dbmsSubject.id, notes: 'Studied BCNF decomposition proofs' },
    { daysAgo: 2, duration: 100, type: SessionType.POMODORO_50_10, subject: mathSubject.id, notes: 'Spanning tree problems & graph proofs' },
    { daysAgo: 1, duration: 50, type: SessionType.POMODORO_50_10, subject: networksSubject.id, notes: 'Wireshark traces walkthrough' },
    { daysAgo: 0, duration: 25, type: SessionType.POMODORO_25_5, subject: dbmsSubject.id, notes: 'ACID properties flashcards review' },
  ];

  for (const s of sessionData) {
    const sStart = new Date(now.getTime() - s.daysAgo * 24 * 60 * 60 * 1000 - s.duration * 60 * 1000);
    const sEnd = new Date(sStart.getTime() + s.duration * 60 * 1000);
    await prisma.studySession.create({
      data: {
        studentId: studentProfile1.id,
        subjectId: s.subject,
        sessionType: s.type,
        durationMinutes: s.duration,
        startedAt: sStart,
        endedAt: sEnd,
        notes: s.notes,
      },
    });
  }

  // 11. Create Goals
  await prisma.goal.createMany({
    data: [
      {
        studentId: studentProfile1.id,
        title: 'Score 90%+ in DBMS Mid-Term',
        description: 'Focus on perfect score in SQL and BCNF normalization problems',
        targetDate: inFiveDays,
        metricType: GoalMetric.EXAM_SCORE,
        targetValue: 90,
        currentValue: 0,
        status: GoalStatus.IN_PROGRESS,
      },
      {
        studentId: studentProfile1.id,
        title: 'Log 40 Total Study Hours this Month',
        description: 'Maintain deep work Pomodoro discipline daily',
        targetDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        metricType: GoalMetric.STUDY_HOURS,
        targetValue: 40,
        currentValue: 24.5,
        status: GoalStatus.IN_PROGRESS,
      },
      {
        studentId: studentProfile1.id,
        title: 'Maintain > 85% Overall Attendance',
        description: 'Never miss morning lab sessions and core theory classes',
        targetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        metricType: GoalMetric.ATTENDANCE_PERCENT,
        targetValue: 85,
        currentValue: 88.5,
        status: GoalStatus.IN_PROGRESS,
      },
    ],
  });

  // 12. Create Flashcards & Decks
  const dbmsDeck = await prisma.flashcardDeck.create({
    data: {
      studentId: studentProfile1.id,
      subjectId: dbmsSubject.id,
      title: 'DBMS Core Concepts & Normalization',
      description: 'Definitions of functional dependencies, normal forms, and transaction ACID rules',
      flashcards: {
        create: [
          {
            front: 'What is 1st Normal Form (1NF)?',
            back: 'A relation is in 1NF if and only if all domain attributes are atomic (no multi-valued or composite attributes) and each row is uniquely identifiable.',
            masteryLevel: 4,
            reviewCount: 6,
          },
          {
            front: 'What is 2nd Normal Form (2NF)?',
            back: 'A table is in 2NF if it is in 1NF and contains NO partial functional dependencies (no non-prime attribute depends on a proper subset of any candidate key).',
            masteryLevel: 4,
            reviewCount: 5,
          },
          {
            front: 'What is 3rd Normal Form (3NF)?',
            back: 'A relation is in 3NF if for every non-trivial functional dependency X -> Y, either X is a Super Key or Y is a Prime Attribute (no transitive dependencies).',
            masteryLevel: 3,
            reviewCount: 4,
          },
          {
            front: 'What is Boyce-Codd Normal Form (BCNF)?',
            back: 'A relation is in BCNF if for every non-trivial functional dependency X -> Y, X MUST be a Super Key (strictly stricter than 3NF).',
            masteryLevel: 2,
            reviewCount: 3,
          },
          {
            front: 'What is the Two-Phase Locking (2PL) Protocol?',
            back: 'Concurrency control protocol where a transaction has a Growing Phase (acquires locks) followed by a Shrinking Phase (releases locks). Guarantees conflict serializability.',
            masteryLevel: 3,
            reviewCount: 4,
          },
        ],
      },
    },
  });

  // 13. Create Quiz & Attempt
  const sampleQuiz = await prisma.quiz.create({
    data: {
      studentId: studentProfile1.id,
      subjectId: dbmsSubject.id,
      title: 'Database Normalization & ACID Test',
      description: 'Test your understanding of 1NF through BCNF and transaction isolation levels.',
      durationMinutes: 15,
      totalMarks: 4,
      questions: {
        create: [
          {
            questionText: 'Which normal form eliminates partial dependency on candidate keys?',
            questionType: QuestionType.MULTIPLE_CHOICE,
            marks: 1,
            explanation: '2NF removes partial functional dependencies of non-prime attributes on composite candidate keys.',
            orderIndex: 1,
            options: {
              create: [
                { optionText: '1NF', isCorrect: false, orderIndex: 1 },
                { optionText: '2NF', isCorrect: true, orderIndex: 2 },
                { optionText: '3NF', isCorrect: false, orderIndex: 3 },
                { optionText: 'BCNF', isCorrect: false, orderIndex: 4 },
              ],
            },
          },
          {
            questionText: 'In BCNF, for every functional dependency X -> Y, X must be a super key.',
            questionType: QuestionType.TRUE_FALSE,
            marks: 1,
            explanation: 'By definition, BCNF requires the determinant X in every non-trivial FD X -> Y to be a super key.',
            orderIndex: 2,
            options: {
              create: [
                { optionText: 'True', isCorrect: true, orderIndex: 1 },
                { optionText: 'False', isCorrect: false, orderIndex: 2 },
              ],
            },
          },
          {
            questionText: 'Which ACID property is primarily maintained by Undo logs during a crash or rollback?',
            questionType: QuestionType.MULTIPLE_CHOICE,
            marks: 1,
            explanation: 'Atomicity guarantees all-or-nothing execution, reverting uncommitted changes via undo logs.',
            orderIndex: 3,
            options: {
              create: [
                { optionText: 'Atomicity', isCorrect: true, orderIndex: 1 },
                { optionText: 'Consistency', isCorrect: false, orderIndex: 2 },
                { optionText: 'Isolation', isCorrect: false, orderIndex: 3 },
                { optionText: 'Durability', isCorrect: false, orderIndex: 4 },
              ],
            },
          },
          {
            questionText: 'Belady\'s Anomaly occurs in LRU (Least Recently Used) page replacement algorithm.',
            questionType: QuestionType.TRUE_FALSE,
            marks: 1,
            explanation: 'Belady\'s anomaly occurs in FIFO, not in stack algorithms like LRU.',
            orderIndex: 4,
            options: {
              create: [
                { optionText: 'True', isCorrect: false, orderIndex: 1 },
                { optionText: 'False', isCorrect: true, orderIndex: 2 },
              ],
            },
          },
        ],
      },
    },
    include: { questions: { include: { options: true } } },
  });

  // Record an attempt on this quiz
  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId: sampleQuiz.id,
      studentId: studentProfile1.id,
      score: 3,
      percentage: 75,
      totalQuestions: 4,
      correctAnswers: 3,
      wrongAnswers: 1,
      timeSpentSeconds: 420,
      startedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      completedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000 + 420 * 1000),
    },
  });

  // 14. Create In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: studentUser1.id,
        type: NotificationType.ASSIGNMENT_DUE,
        title: 'Assignment Due in 2 Days',
        message: 'DBMS Schema Design & Normalization Project is due on ' + inFiveDays.toLocaleDateString(),
        linkUrl: '/assignments',
        isRead: false,
      },
      {
        userId: studentUser1.id,
        type: NotificationType.EXAM_APPROACHING,
        title: 'Upcoming Exam: DBMS Mid-Term',
        message: 'Your DBMS Mid-Term Examination is scheduled in 14 days.',
        linkUrl: '/exams',
        isRead: false,
      },
      {
        userId: studentUser1.id,
        type: NotificationType.STUDY_REMINDER,
        title: 'Daily Deep Work Goal',
        message: 'You have completed 3.5 hours of study this week. Keep up the momentum!',
        linkUrl: '/study',
        isRead: true,
        readAt: new Date(),
      },
      {
        userId: parentUser.id,
        type: NotificationType.SYSTEM,
        title: 'Rahul Sharma Academic Weekly Summary Available',
        message: 'Rahul has completed 16.5 hours of study this week with 88% average attendance.',
        linkUrl: '/parent/dashboard',
        isRead: false,
      },
    ],
  });

  console.log('✅ StudyOS database successfully seeded!');
  console.log('----------------------------------------------------');
  console.log('Test Accounts:');
  console.log('• Admin:   admin@studyos.com   / StudyOS@123456');
  console.log('• Student: student@studyos.com / StudyOS@123456 (Rahul Sharma)');
  console.log('• Parent:  parent@studyos.com  / StudyOS@123456 (Rajesh Sharma)');
  console.log('• Teacher: teacher@studyos.com / StudyOS@123456 (Dr. Sarah Jenkins)');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
