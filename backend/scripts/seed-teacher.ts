import { prisma } from '../src/config/database';
import { UserRole, TaskPriority, TaskStatus, AssignmentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding Teacher user: teacher@studyos.com (Dr. Sarah Jenkins)...');

  const passwordHash = await bcrypt.hash('StudyOS@123456', 10);

  // Check if teacher user already exists
  let user = await prisma.user.findUnique({
    where: { email: 'teacher@studyos.com' },
    include: { teacherProfile: true, studentProfile: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'teacher@studyos.com',
        passwordHash,
        role: UserRole.TEACHER,
        firstName: 'Dr. Sarah',
        lastName: 'Jenkins',
        mobile: '+1 555-0199',
        isActive: true,
        isEmailVerified: true,
        teacherProfile: {
          create: {
            department: 'Computer Science & Engineering',
            title: 'Associate Professor',
          },
        },
        studentProfile: {
          create: {
            schoolName: 'School of Computer Science & Engineering',
            gradeLevel: 'Faculty Member',
          },
        },
      },
      include: { teacherProfile: true, studentProfile: true },
    });
    console.log('Created user teacher@studyos.com with ID:', user.id);
  } else {
    // Ensure profiles exist
    if (!user.teacherProfile) {
      await prisma.teacherProfile.create({
        data: {
          userId: user.id,
          department: 'Computer Science & Engineering',
          title: 'Associate Professor',
        },
      });
    }
    if (!user.studentProfile) {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          schoolName: 'School of Computer Science & Engineering',
          gradeLevel: 'Faculty Member',
        },
      });
    }
    // Refresh user
    user = await prisma.user.findUnique({
      where: { email: 'teacher@studyos.com' },
      include: { teacherProfile: true, studentProfile: true },
    });
    console.log('Existing teacher user verified:', user?.id);
  }

  const studentProfileId = user!.studentProfile!.id;

  // Check if demo subjects already exist for this teacher
  const existingSubjects = await prisma.subject.count({
    where: { studentId: studentProfileId },
  });

  if (existingSubjects === 0) {
    console.log('Creating demo subjects, units, tasks, assignments, timetable for Dr. Sarah Jenkins...');

    // 1. Subject 1: Data Structures
    const sub1 = await prisma.subject.create({
      data: {
        studentId: studentProfileId,
        name: 'CS201: Data Structures & Algorithms',
        code: 'CS201',
        color: '#6366F1',
        icon: 'code',
        targetGrade: 'Core Curriculum',
        creditHours: 4,
        units: {
          create: [
            {
              title: 'Unit 1: Linear Structures & Trees',
              orderIndex: 0,
              topics: {
                create: [
                  { title: 'Arrays, Dynamic Lists, & Stacks', orderIndex: 0, isCompleted: true },
                  { title: 'Binary Search Trees & AVL Balancing', orderIndex: 1, isCompleted: true },
                  { title: 'B-Trees & B+ Trees for File Systems', orderIndex: 2, isCompleted: false },
                ],
              },
            },
            {
              title: 'Unit 2: Graph Theory & Shortest Paths',
              orderIndex: 1,
              topics: {
                create: [
                  { title: 'Graph Representations (Adjacency Lists/Matrices)', orderIndex: 0, isCompleted: false },
                  { title: 'Dijkstra & A* Pathfinding Algorithms', orderIndex: 1, isCompleted: false },
                ],
              },
            },
          ],
        },
      },
    });

    // 2. Subject 2: DBMS
    const sub2 = await prisma.subject.create({
      data: {
        studentId: studentProfileId,
        name: 'CS301: Database Management Systems',
        code: 'CS301',
        color: '#10B981',
        icon: 'database',
        targetGrade: 'Advanced Track',
        creditHours: 3,
        units: {
          create: [
            {
              title: 'Unit 1: Relational Schema & Normalization',
              orderIndex: 0,
              topics: {
                create: [
                  { title: 'ER Modeling & Relational Algebra', orderIndex: 0, isCompleted: true },
                  { title: '1NF, 2NF, 3NF, & BCNF Decomposition', orderIndex: 1, isCompleted: true },
                ],
              },
            },
            {
              title: 'Unit 2: Transaction Processing & ACID',
              orderIndex: 1,
              topics: {
                create: [
                  { title: 'Concurrency Control & 2PL Locks', orderIndex: 0, isCompleted: false },
                ],
              },
            },
          ],
        },
      },
    });

    // 3. Tasks
    await prisma.task.createMany({
      data: [
        {
          studentId: studentProfileId,
          subjectId: sub1.id,
          title: 'Review Midterm Assignment Submissions for CS201',
          description: 'Evaluate GitHub repository links and unit test scores for 45 students.',
          priority: TaskPriority.HIGH,
          status: TaskStatus.TODO,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
        {
          studentId: studentProfileId,
          subjectId: sub2.id,
          title: 'Finalize Semester Exam Paper with Department Head',
          description: 'Review question distribution for Relational Algebra and Normalization sections.',
          priority: TaskPriority.URGENT,
          status: TaskStatus.TODO,
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        },
        {
          studentId: studentProfileId,
          subjectId: sub1.id,
          title: 'Prepare Lecture Slides on B+ Trees Indexing',
          description: 'Include visual animations of node split and merge operations.',
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.IN_PROGRESS,
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    // 4. Assignments
    await prisma.assignment.createMany({
      data: [
        {
          studentId: studentProfileId,
          subjectId: sub1.id,
          title: 'Lab 3: Self-Balancing AVL Tree Implementation',
          description: 'Implement left/right rotations and height balance verification in C++ or Java.',
          dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
          status: AssignmentStatus.PENDING,
          maxMarks: 100,
        },
        {
          studentId: studentProfileId,
          subjectId: sub2.id,
          title: 'Database Project: Hospital Relational Schema',
          description: 'Deliver 3NF normalized schema with primary/foreign keys and indexing scripts.',
          dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          status: AssignmentStatus.IN_PROGRESS,
          maxMarks: 100,
        },
      ],
    });

    // 5. Timetable Events
    await prisma.timetableEvent.createMany({
      data: [
        {
          studentId: studentProfileId,
          subjectId: sub1.id,
          title: 'CS201 Lecture: Tree Rotations',
          dayOfWeek: 1, // Monday
          startTime: '10:00',
          endTime: '11:30',
          room: 'Auditorium Hall B',
          location: 'Main Science Block',
          color: '#6366F1',
        },
        {
          studentId: studentProfileId,
          subjectId: sub2.id,
          title: 'CS301 Lab: SQL & Normalization',
          dayOfWeek: 3, // Wednesday
          startTime: '14:00',
          endTime: '16:00',
          room: 'Computing Lab 4',
          location: 'IT Tower 2nd Floor',
          color: '#10B981',
        },
        {
          studentId: studentProfileId,
          subjectId: sub1.id,
          title: 'CS201 Office Hours & Student Guidance',
          dayOfWeek: 5, // Friday
          startTime: '11:00',
          endTime: '12:30',
          room: 'Faculty Office 302',
          location: 'Faculty Wing',
          color: '#8B5CF6',
        },
      ],
    });

    // 6. Notes
    await prisma.note.createMany({
      data: [
        {
          studentId: studentProfileId,
          subjectId: sub1.id,
          title: 'CS201 Course Outline & Grading Weightage',
          content: '### CS201 Grading Structure\n- Assignments (30%)\n- Midterm Exam (25%)\n- Final Exam (35%)\n- Class Attendance & Participation (10%)',
          isPinned: true,
        },
        {
          studentId: studentProfileId,
          subjectId: sub2.id,
          title: 'Database Normalization Key Takeaways',
          content: '### Normal Forms Quick Reference\n- **1NF**: Atomic values, no repeating groups.\n- **2NF**: In 1NF and no partial dependencies on composite keys.\n- **3NF**: In 2NF and no transitive dependencies.\n- **BCNF**: For every functional dependency X -> Y, X must be a superkey.',
          isPinned: true,
        },
      ],
    });

    console.log('Successfully seeded demo academic content for Dr. Sarah Jenkins!');
  }

  console.log('Teacher user creation complete!');
  console.log('Email: teacher@studyos.com');
  console.log('Password: StudyOS@123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
